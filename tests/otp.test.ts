import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    resend: vi.fn(),
    verifyOtp: vi.fn(),
  },
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ origin: "http://localhost:3000" })),
}));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: mocks.auth })),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { signIn, signUp, resendConfirmation, verifySignUpCode } from "../lib/auth/actions";
import type { AuthActionState } from "../lib/auth/action-state";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const idle: AuthActionState = { status: "idle", message: "" };

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("sign-up email code verification", () => {
  it.each([
    ["123 456", "123456"],
    ["1234-5678", "12345678"],
  ])("normalizes %s and redirects after successful verification", async (inputCode, token) => {
    mocks.auth.verifyOtp.mockResolvedValue({ data: { session: { access_token: "session" } }, error: null });

    await expect(verifySignUpCode(idle, form({ email: " Person@Example.Test ", code: inputCode })))
      .rejects.toThrow("NEXT_REDIRECT:/discover");

    expect(mocks.auth.verifyOtp).toHaveBeenCalledWith({
      email: "person@example.test",
      token,
      type: "email",
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/discover");
  });

  it.each([
    ["letters", "12ab56"],
    ["five digits", "12345"],
    ["eleven digits", "12345678901"],
    ["empty", ""],
  ])("rejects %s without contacting Supabase", async (_label, code) => {
    const result = await verifySignUpCode(idle, form({ email: " Person@Example.Test ", code }));

    expect(result).toEqual({
      status: "error",
      message: "",
      email: "person@example.test",
      fieldErrors: { code: "Enter the code from your email." },
    });
    expect(mocks.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it.each([
    ["provider error", async () => ({ data: { session: null }, error: new Error("private provider text") })],
    ["thrown error", async () => { throw new Error("private thrown text"); }],
    ["missing session", async () => ({ data: { session: null }, error: null })],
  ])("returns the same safe field error for %s", async (_label, response) => {
    mocks.auth.verifyOtp.mockImplementation(response);
    const result = await verifySignUpCode(idle, form({ email: " Person@Example.Test ", code: "123456" }));

    expect(result).toEqual({
      status: "error",
      message: "",
      email: "person@example.test",
      fieldErrors: { code: "That code is incorrect or has expired." },
    });
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("does not log email, code, or provider errors", async () => {
    const methods = ["log", "info", "warn", "error", "debug"] as const;
    const spies = methods.map((method) => vi.spyOn(console, method).mockImplementation(() => {}));
    mocks.auth.verifyOtp.mockResolvedValue({ data: { session: null }, error: new Error("private provider text") });
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "email_not_confirmed", message: "private provider text" },
    });
    mocks.auth.signUp.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    mocks.auth.resend.mockResolvedValue({ error: null });

    await verifySignUpCode(idle, form({ email: "private@example.test", code: "654321" }));
    await signIn(idle, form({ email: "private@example.test", password: "never-log-this" }));
    await signUp(idle, form({
      email: "private@example.test",
      password: "never-log-this",
      confirmPassword: "never-log-this",
    }));
    await resendConfirmation(idle, form({ email: "private@example.test" }));

    for (const spy of spies) {
      const logged = JSON.stringify(spy.mock.calls);
      expect(logged).not.toContain("private@example.test");
      expect(logged).not.toContain("654321");
      expect(logged).not.toContain("private provider text");
      expect(logged).not.toContain("never-log-this");
    }
  });
});

describe("unconfirmed email sign-in", () => {
  it.each([
    ["error code", { code: "email_not_confirmed", message: "private provider detail" }],
    ["message fallback", { code: "some_other_code", message: "EMAIL NOT CONFIRMED yet" }],
  ])("requests a fresh code for %s and returns no provider message", async (_label, error) => {
    mocks.auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error });
    mocks.auth.resend.mockResolvedValue({ error: null });

    const result = await signIn(idle, form({ email: " Person@Example.Test ", password: "correct-password" }));

    expect(result).toEqual({ status: "needs_verification", message: "", email: "person@example.test" });
    expect(mocks.auth.resend).toHaveBeenCalledOnce();
    expect(mocks.auth.resend).toHaveBeenCalledWith({ type: "signup", email: "person@example.test" });
  });

  it("keeps the verification screen response when resend throws", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "email_not_confirmed", message: "Email not confirmed" },
    });
    mocks.auth.resend.mockRejectedValue(new Error("private resend detail"));

    const result = await signIn(idle, form({ email: " Person@Example.Test ", password: "correct-password" }));

    expect(result).toEqual({ status: "needs_verification", message: "", email: "person@example.test" });
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("keeps wrong-password and unknown-email failures generic and does not resend", async () => {
    mocks.auth.signInWithPassword
      .mockResolvedValueOnce({ data: { user: null, session: null }, error: new Error("Invalid login credentials") })
      .mockResolvedValueOnce({ data: { user: null, session: null }, error: new Error("User not found") });
    const input = form({ email: "person@example.test", password: "correct-password" });

    const wrongPassword = await signIn(idle, input);
    const unknownEmail = await signIn(idle, input);

    expect(wrongPassword).toEqual(unknownEmail);
    expect(wrongPassword).toEqual({ status: "error", message: "Email or password is incorrect.", email: "person@example.test" });
    expect(mocks.auth.resend).not.toHaveBeenCalled();
  });
});

describe("unchanged generic sign-up and resend actions", () => {
  it("keeps sign-up generic and echoes only the normalized email", async () => {
    mocks.auth.signUp.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    const result = await signUp(idle, form({
      email: " Person@Example.Test ",
      password: "a-long-password",
      confirmPassword: "a-long-password",
    }));

    expect(result.status).toBe("success");
    expect(result.email).toBe("person@example.test");
    expect(mocks.auth.signUp).toHaveBeenCalledOnce();
    expect(JSON.stringify(result)).not.toContain("a-long-password");
  });

  it("keeps resend generic when the provider reports an error", async () => {
    mocks.auth.resend.mockResolvedValue({ error: new Error("private provider text") });
    const result = await resendConfirmation(idle, form({ email: " Person@Example.Test " }));

    expect(result).toEqual({
      status: "success",
      message: "If a confirmation is pending for this address, we’ve sent a new link.",
      email: "person@example.test",
    });
    expect(mocks.auth.resend).toHaveBeenCalledOnce();
    expect(JSON.stringify(result)).not.toContain("private");
  });
});
