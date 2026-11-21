import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    getClaims: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    verifyOtp: vi.fn(),
    signOut: vi.fn(),
  },
  headers: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: mocks.auth })),
}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: vi.fn() })),
  headers: mocks.headers,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { signIn, signUp, requestPasswordReset, resendConfirmation, updatePassword } from "../lib/auth/actions";
import { getCurrentUser } from "../lib/auth/current-user";
import { sanitizeNextPath } from "../lib/auth/confirm-redirect";
import { getAuthNotice } from "../lib/auth/action-state";
import { ProtectedDiscoverContent } from "../app/discover/protected-content";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("current user validation", () => {
  it("returns null for provider errors and never calls getSession", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("provider detail") });
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.auth.getSession).not.toHaveBeenCalled();
  });

  it("returns null when getUser has no user", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.auth.getSession).not.toHaveBeenCalled();
  });
});

describe("protected Discover placeholder", () => {
  it("redirects signed-out users to sign-in", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(ProtectedDiscoverContent()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("renders only the signed-in placeholder without profile data", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "user-id", email: "private@example.test" } }, error: null });
    const result = await ProtectedDiscoverContent();
    const markup = JSON.stringify(result);
    expect(markup).toContain("You are signed in");
    expect(markup).not.toContain("private@example.test");
    expect(markup).not.toContain("user-id");
  });
});

describe("confirmation redirect sanitizer", () => {
  it("accepts a same-origin path", () => {
    expect(sanitizeNextPath("/discover")).toBe("/discover");
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:",
    "///evil.com",
    "/%2F%2Fevil.com",
    "\\evil.com",
    "/%5C%5Cevil.com",
    "/%252F%252Fevil.com",
    "/%255Cevil.com",
    "/safe%0d%0aLocation:%20https://evil.com",
    "/bad\u0000path",
  ])("rejects %s", (candidate) => {
    expect(sanitizeNextPath(candidate)).toBeNull();
  });
});

describe("generic auth action responses", () => {
  it("uses the same sign-in failure message for wrong password and unknown email", async () => {
    const input = form({ email: "person@example.test", password: "a-long-password" });
    mocks.auth.signInWithPassword
      .mockResolvedValueOnce({ data: { user: null, session: null }, error: new Error("Invalid login credentials") })
      .mockResolvedValueOnce({ data: { user: null, session: null }, error: new Error("User not found") });
    const wrongPassword = await signIn({ status: "idle", message: "" }, input);
    const unknownEmail = await signIn({ status: "idle", message: "" }, input);
    expect(wrongPassword).toEqual(unknownEmail);
    expect(wrongPassword.message).toBe("Email or password is incorrect.");
    expect(wrongPassword.email).toBe("person@example.test");
    expect(JSON.stringify(wrongPassword)).not.toContain("a-long-password");
  });

  it("uses the same sign-up response when the provider reports an existing address or success", async () => {
    mocks.headers.mockResolvedValue({ get: () => "https://eluda.example" });
    mocks.auth.signUp
      .mockResolvedValueOnce({ data: { user: null }, error: new Error("already registered") })
      .mockResolvedValueOnce({ data: { user: { id: "new" } }, error: null });
    const input = form({ email: " Person@Example.Test ", password: "a-long-password", confirmPassword: "a-long-password" });
    const existing = await signUp({ status: "idle", message: "" }, input);
    const newAddress = await signUp({ status: "idle", message: "" }, input);
    expect(existing).toEqual(newAddress);
    expect(existing.email).toBe("person@example.test");
    expect(existing.message).toBe("If you can sign up with this email, check your email for a confirmation link.");
    expect(JSON.stringify(existing)).not.toContain("a-long-password");
  });

  it("uses the same reset response whether the address exists or provider errors", async () => {
    mocks.headers.mockResolvedValue({ get: () => "https://eluda.example" });
    mocks.auth.resetPasswordForEmail
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("address not found") });
    const input = form({ email: "person@example.test" });
    const existing = await requestPasswordReset({ status: "idle", message: "" }, input);
    const unknown = await requestPasswordReset({ status: "idle", message: "" }, input);
    expect(existing).toEqual(unknown);
    expect(existing.email).toBe("person@example.test");
    expect(existing.message).toBe("If an account exists for that email, a password reset link is on its way.");
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenLastCalledWith("person@example.test", {
      redirectTo: "https://eluda.example/auth/confirm",
    });
    expect(new URL(mocks.auth.resetPasswordForEmail.mock.calls[1][1].redirectTo).search).toBe("");
  });

  it("returns an identical generic resend result for provider success, error and throw", async () => {
    mocks.headers.mockResolvedValue({ get: () => "https://eluda.example" });
    mocks.auth.resend
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("private provider detail") })
      .mockRejectedValueOnce(new Error("private thrown detail"));
    const input = form({ email: " Person@Example.Test ", password: "must-not-echo" });
    const success = await resendConfirmation({ status: "idle", message: "" }, input);
    const providerError = await resendConfirmation({ status: "idle", message: "" }, input);
    const thrownError = await resendConfirmation({ status: "idle", message: "" }, input);
    expect(success).toEqual(providerError);
    expect(success).toEqual(thrownError);
    expect(success.email).toBe("person@example.test");
    expect(success.message).toBe("If a confirmation is pending for this address, we’ve sent a new link.");
    expect(JSON.stringify(success)).not.toContain("private");
    expect(JSON.stringify(success)).not.toContain("must-not-echo");
    expect(mocks.auth.resend).toHaveBeenNthCalledWith(1, {
      type: "signup",
      email: "person@example.test",
      options: { emailRedirectTo: "https://eluda.example/auth/confirm" },
    });
  });
});

describe("auth confirmation handler", () => {
  it("rejects an unknown type before creating a session", async () => {
    const { GET } = await import("../app/auth/confirm/route");
    const response = await GET(new Request("https://eluda.example/auth/confirm?token_hash=x&type=magiclink") as never);
    expect(response.headers.get("location")).toContain("/sign-in?error=confirmation");
    expect(mocks.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it.each([
    "https://eluda.example/auth/confirm",
    "https://eluda.example/auth/confirm?type=recovery",
    "https://eluda.example/auth/confirm?token_hash=x",
  ])("rejects incomplete confirmation query %s", async (url) => {
    const { GET } = await import("../app/auth/confirm/route");
    const response = await GET(new Request(url) as never);
    expect(response.headers.get("location")).toContain("/sign-in?error=confirmation");
  });

  it("sends recovery links to reset-password and ignores hostile next values", async () => {
    mocks.auth.verifyOtp.mockResolvedValue({ error: null });
    const { GET } = await import("../app/auth/confirm/route");
    const response = await GET(new Request("https://eluda.example/auth/confirm?token_hash=valid&type=recovery&next=https%3A%2F%2Fevil.com") as never);
    expect(mocks.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "valid", type: "recovery" });
    expect(response.headers.get("location")).toBe("https://eluda.example/reset-password");
  });

  it("keeps sanitized-next behavior for email confirmations", async () => {
    mocks.auth.verifyOtp.mockResolvedValue({ error: null });
    const { GET } = await import("../app/auth/confirm/route");
    const safeResponse = await GET(new Request("https://eluda.example/auth/confirm?token_hash=valid&type=email&next=%2Fwelcome") as never);
    expect(safeResponse.headers.get("location")).toBe("https://eluda.example/welcome");
    const hostileResponse = await GET(new Request("https://eluda.example/auth/confirm?token_hash=valid&type=email&next=https%3A%2F%2Fevil.com") as never);
    expect(hostileResponse.headers.get("location")).toContain("/sign-in?error=confirmation");
  });
});

describe("password update action", () => {
  it("rejects mismatched passwords without updating the user", async () => {
    const result = await updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "different-password" }),
    );
    expect(result.message).toBe("Passwords do not match.");
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates then signs out a recovery session before redirecting", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "recovery" }] } }, error: null });
    mocks.auth.updateUser.mockResolvedValue({ error: null });
    mocks.auth.signOut.mockResolvedValue({ error: null });
    await expect(updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "long-enough-password" }),
    )).rejects.toThrow("NEXT_REDIRECT:/sign-in?notice=password-updated");
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: "long-enough-password" });
    expect(mocks.auth.signOut).toHaveBeenCalledOnce();
    expect(mocks.auth.updateUser.mock.invocationCallOrder[0]).toBeLessThan(mocks.auth.signOut.mock.invocationCallOrder[0]);
    expect(mocks.auth.signOut.mock.invocationCallOrder[0]).toBeLessThan(mocks.redirect.mock.invocationCallOrder.at(-1)!);
  });
});

describe("sign-in notices", () => {
  it("maps only two known codes to fixed safe messages", () => {
    expect(getAuthNotice("confirmation")).toEqual({
      status: "error",
      message: "That link is invalid, expired or already used. If you already confirmed your email, sign in below. To reset your password, use “Forgot password?”.",
    });
    expect(getAuthNotice("password-updated")).toEqual({
      status: "success",
      message: "Your password has been updated. Sign in with your new password.",
    });
    expect(getAuthNotice("<img src=x onerror=alert(1)>")).toBeNull();
    expect(getAuthNotice("anything-else")).toBeNull();
    expect(getAuthNotice(null)).toBeNull();
  });
});

describe("secret-key naming guard", () => {
  it("does not find service-role or Supabase secret key names in app/ or lib/", async () => {
    const { readdir, readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const roots = ["app", "lib"];
    const files: string[] = [];
    async function visit(path: string) {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        const fullPath = join(path, entry.name);
        if (entry.isDirectory()) await visit(fullPath);
        else if (/\.(?:[cm]?[jt]sx?)$/i.test(entry.name)) files.push(fullPath);
      }
    }
    for (const root of roots) await visit(root);
    const forbidden = /service[_-]?role|supabase[_-]?secret[_-]?key|sb_secret/i;
    const hits: string[] = [];
    for (const file of files) {
      const contents = await readFile(file, "utf8");
      if (forbidden.test(contents)) hits.push(file);
    }
    expect(hits).toEqual([]);
  });
});
