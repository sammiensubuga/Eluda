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
  connection: vi.fn(async () => {}),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  findUnique: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: mocks.auth })),
}));
vi.mock("../lib/db", () => ({
  getDb: () => ({ user: { findUnique: mocks.findUnique } }),
}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: vi.fn() })),
  headers: mocks.headers,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: mocks.connection,
}));

import { signIn, signUp, requestPasswordReset, resendConfirmation, updatePassword } from "../lib/auth/actions";
import { getCurrentUser } from "../lib/auth/current-user";
import { sanitizeNextPath } from "../lib/auth/confirm-redirect";
import { getAuthNotice } from "../lib/auth/action-state";
import { isRecentLinkSession } from "../lib/auth/recovery-session";
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
    mocks.findUnique.mockResolvedValue({ id: "user-id", displayName: "Test User", deletedAt: null });
    const result = await ProtectedDiscoverContent();
    expect(mocks.connection).toHaveBeenCalled();
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
  it("returns all sign-up field errors together without returning passwords", async () => {
    const result = await signUp(
      { status: "idle", message: "" },
      form({ email: "bad address", password: "short", confirmPassword: "different" }),
    );

    expect(result).toEqual({
      status: "error",
      message: "",
      email: "bad address",
      fieldErrors: {
        email: "Enter a valid email address.",
        password: "Use at least 10 characters.",
        confirmPassword: "Passwords do not match.",
      },
    });
    expect(JSON.stringify(result)).not.toContain("short");
    expect(JSON.stringify(result)).not.toContain("different");
  });

  it("returns the empty sign-up messages for all required fields", async () => {
    const result = await signUp({ status: "idle", message: "" }, form({}));
    expect(result).toEqual({
      status: "error",
      message: "",
      email: "",
      fieldErrors: {
        email: "Enter your email address.",
        password: "Enter a password.",
        confirmPassword: "Confirm your password.",
      },
    });
  });

  it("returns sign-in field errors for empty and malformed values", async () => {
    const empty = await signIn({ status: "idle", message: "" }, form({}));
    expect(empty).toMatchObject({
      status: "error",
      message: "",
      email: "",
      fieldErrors: { email: "Enter your email address.", password: "Enter your password." },
    });

    const malformed = await signIn(
      { status: "idle", message: "" },
      form({ email: "invalid", password: "" }),
    );
    expect(malformed.fieldErrors).toEqual({
      email: "Enter a valid email address.",
      password: "Enter your password.",
    });
  });

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
    expect(wrongPassword.fieldErrors).toBeUndefined();
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

  it.each([
    ["empty", "", "Enter your email address."],
    ["malformed", "not-an-email", "Enter a valid email address."],
  ])("returns an email field error for a %s reset address", async (_label, email, message) => {
    const result = await requestPasswordReset({ status: "idle", message: "" }, form({ email }));
    expect(result).toEqual({
      status: "error",
      message: "",
      email,
      fieldErrors: { email: message },
    });
    expect(mocks.auth.resetPasswordForEmail).not.toHaveBeenCalled();
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
  it("returns the password confirmation field error without updating the user", async () => {
    const result = await updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "different-password" }),
    );
    expect(result).toMatchObject({
      status: "error",
      message: "",
      fieldErrors: { confirmPassword: "Passwords do not match." },
    });
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it("returns the short-password field error without updating the user", async () => {
    const result = await updatePassword(
      { status: "idle", message: "" },
      form({ password: "short", confirmPassword: "short" }),
    );
    expect(result).toMatchObject({
      status: "error",
      message: "",
      fieldErrors: { password: "Use at least 10 characters." },
    });
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates then signs out a recent OTP link session before redirecting", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "otp", timestamp: Math.floor(Date.now() / 1000) - 60 }] } }, error: null });
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

  it.each([
    ["returns an error", () => mocks.auth.signOut.mockResolvedValue({ error: new Error("sign-out failed") })],
    ["throws", () => mocks.auth.signOut.mockRejectedValue(new Error("sign-out failed"))],
  ])("redirects after password update when signOut %s", async (_case, setSignOutFailure) => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "otp", timestamp: Math.floor(Date.now() / 1000) - 60 }] } }, error: null });
    mocks.auth.updateUser.mockResolvedValue({ error: null });
    setSignOutFailure();

    const result = await updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "long-enough-password" }),
    ).catch((error: unknown) => error);

    expect(result).toMatchObject({ message: "NEXT_REDIRECT:/sign-in?notice=password-updated" });
    expect(result).not.toMatchObject({ message: "Your password could not be updated. Try again." });
  });

  it("refuses a password-only session with the generic reset-link message", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "password", timestamp: Math.floor(Date.now() / 1000) }] } }, error: null });

    await expect(updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "long-enough-password" }),
    )).resolves.toMatchObject({ status: "error", message: "Use a valid password reset link to continue." });
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it("refuses a stale OTP session", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "otp", timestamp: Math.floor(Date.now() / 1000) - 960 }] } }, error: null });

    await expect(updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "long-enough-password" }),
    )).resolves.toMatchObject({ status: "error", message: "Use a valid password reset link to continue." });
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it("keeps update failures form-level", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "recovery-user" } }, error: null });
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { amr: [{ method: "otp", timestamp: Math.floor(Date.now() / 1000) - 60 }] } }, error: null });
    mocks.auth.updateUser.mockResolvedValue({ error: new Error("provider detail") });

    const result = await updatePassword(
      { status: "idle", message: "" },
      form({ password: "long-enough-password", confirmPassword: "long-enough-password" }),
    );

    expect(result).toMatchObject({ status: "error", message: "Your password could not be updated. Try again." });
    expect(result.fieldErrors).toBeUndefined();
    expect(mocks.auth.updateUser).toHaveBeenCalledOnce();
  });
});

describe("recent recovery-link session validation", () => {
  const now = 1_000_000;

  it.each([
    ["otp", [{ method: "otp", timestamp: now - 60 }], true],
    ["recovery", [{ method: "recovery", timestamp: now - 60 }], true],
    ["stale otp", [{ method: "otp", timestamp: now - 16 * 60 }], false],
    ["password only", [{ method: "password", timestamp: now }], false],
    ["missing timestamp", [{ method: "otp" }], false],
    ["string timestamp", [{ method: "otp", timestamp: String(now) }], false],
    ["far future timestamp", [{ method: "otp", timestamp: now + 10 * 60 }], false],
    ["non-array", { method: "otp", timestamp: now }, false],
    ["undefined", undefined, false],
  ])("returns the expected result for %s", (_label, amr, expected) => {
    expect(isRecentLinkSession(amr, now)).toBe(expected);
  });
});

describe("sign-in notices", () => {
  it("maps known codes to fixed safe messages", () => {
    expect(getAuthNotice("confirmation")).toEqual({
      status: "error",
      message: "That link is invalid, expired or already used. If you already confirmed your email, sign in below. To reset your password, use “Forgot password?”.",
    });
    expect(getAuthNotice("password-updated")).toEqual({
      status: "success",
      message: "Your password has been updated. Sign in with your new password.",
    });
    expect(getAuthNotice("under-18")).toEqual({
      status: "error",
      message: "You must be 18 or older to use Eluda.",
    });
    expect(getAuthNotice("<img src=x onerror=alert(1)>")).toBeNull();
    expect(getAuthNotice("anything-else")).toBeNull();
    expect(getAuthNotice(null)).toBeNull();
  });
});

describe("secret-key naming guard", () => {
  it("allows the Supabase secret key name only in the dedicated server admin module", async () => {
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
    const forbidden = [
      new RegExp(["service", "role"].join("[_-]?"), "i"),
      new RegExp(["supabase", "secret", "key"].join("[_-]?"), "i"),
      new RegExp(["sb", "secret"].join("[_-]?"), "i"),
    ];
    const adminPath = join("lib", "supabase", "admin.ts");
    const hits: string[] = [];
    const adminReferences: string[] = [];
    for (const file of files) {
      const contents = await readFile(file, "utf8");
      if (forbidden.some((pattern) => pattern.test(contents))) hits.push(file);
      if (contents.includes("SUPABASE_SECRET_KEY")) adminReferences.push(file);
    }
    expect(hits).toEqual([adminPath]);
    expect(adminReferences).toEqual([adminPath]);
  });
});
