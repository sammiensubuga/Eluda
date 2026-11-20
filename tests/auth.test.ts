import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    getClaims: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
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

import { signIn, signUp, requestPasswordReset } from "../lib/auth/actions";
import { getCurrentUser } from "../lib/auth/current-user";
import { sanitizeNextPath } from "../lib/auth/confirm-redirect";
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
  });

  it("uses the same sign-up response when the provider reports an existing address or success", async () => {
    mocks.headers.mockResolvedValue({ get: () => "https://eluda.example" });
    mocks.auth.signUp
      .mockResolvedValueOnce({ data: { user: null }, error: new Error("already registered") })
      .mockResolvedValueOnce({ data: { user: { id: "new" } }, error: null });
    const input = form({ email: "person@example.test", password: "a-long-password" });
    const existing = await signUp({ status: "idle", message: "" }, input);
    const newAddress = await signUp({ status: "idle", message: "" }, input);
    expect(existing).toEqual(newAddress);
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
