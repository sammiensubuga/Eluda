import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  adminDeleteUser: vi.fn(),
  createAdminClient: vi.fn(),
  connection: vi.fn(async () => {}),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createAdminClient }));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser, signOut: mocks.signOut } })),
}));
vi.mock("../lib/auth/current-user", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("../lib/db", () => ({
  getDb: () => ({ user: { findUnique: mocks.findUnique, create: mocks.create } }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: mocks.connection,
}));

import { ProtectedDiscoverContent } from "../app/discover/protected-content";
import OnboardingPage, { OnboardingGate } from "../app/onboarding/page";
import { getAccountState } from "../lib/auth/account";
import { deleteAuthUser } from "../lib/supabase/admin";
import * as adminModule from "../lib/supabase/admin";
import { completeOnboarding } from "../lib/onboarding/actions";
import {
  calculateAge,
  kampalaToday,
  normalizeDisplayName,
  parseDateOfBirth,
  validateDisplayName,
} from "../lib/onboarding/validation";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function validOnboarding(overrides: Record<string, string> = {}) {
  return form({
    gender: "FEMALE",
    dateOfBirth: "2000-01-01",
    displayName: "Amina",
    intent: "DATING",
    ...overrides,
  });
}

const sessionUser = { id: "session-user-id" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.test");
  vi.stubEnv("SUPABASE_SECRET_KEY", "test-admin-key");
  mocks.getUser.mockResolvedValue({ data: { user: sessionUser }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.getCurrentUser.mockResolvedValue(sessionUser);
  mocks.findUnique.mockResolvedValue(null);
  mocks.create.mockResolvedValue({ id: sessionUser.id });
  mocks.adminDeleteUser.mockResolvedValue({ data: { user: null }, error: null });
  mocks.createAdminClient.mockReturnValue({ auth: { admin: { deleteUser: mocks.adminDeleteUser } } });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("onboarding display-name validation", () => {
  it.each(["Amina", "Mary-Ann", "O’Neil", "O'Neil", "Jean Paul", "Zoë", "Nakato Grace"])(
    "accepts %s",
    (name) => {
      expect(validateDisplayName(name)).toEqual({ value: name });
    },
  );

  it("normalizes repeated whitespace before checking the name", () => {
    expect(normalizeDisplayName("Al  Bo")).toBe("Al Bo");
    expect(validateDisplayName("Al  Bo")).toEqual({ value: "Al Bo" });
  });

  it("normalizes decomposed accents to NFC before validating and storing the name", () => {
    const decomposed = "Zoe\u0308";
    expect(normalizeDisplayName(decomposed)).toBe("Zoë");
    expect(validateDisplayName(decomposed)).toEqual({ value: "Zoë" });
  });

  it.each([
    ["A", "Use 2 to 30 characters."],
    ["A".repeat(31), "Use 2 to 30 characters."],
    ["Amina1", "Use letters, spaces, hyphens and apostrophes only."],
    ["Amina.", "Use letters, spaces, hyphens and apostrophes only."],
    ["a/b", "Use letters, spaces, hyphens and apostrophes only."],
    ["Amina_K", "Use letters, spaces, hyphens and apostrophes only."],
    ["--ab", "Use letters, spaces, hyphens and apostrophes only."],
    ["Ab--cd", "Use letters, spaces, hyphens and apostrophes only."],
    ["Ab -cd", "Use letters, spaces, hyphens and apostrophes only."],
    ["   ", "Enter a display name."],
    ["<b>Al</b>", "Use letters, spaces, hyphens and apostrophes only."],
    ["Al😀", "Use letters, spaces, hyphens and apostrophes only."],
    ["", "Enter a display name."],
  ])("rejects %j with the correct message", (name, error) => {
    expect(validateDisplayName(name)).toEqual({ value: normalizeDisplayName(name), error });
  });
});

describe("onboarding date validation", () => {
  const today = { year: 2026, month: 11, day: 22 };

  it.each(["2025-02-29", "2026-02-30", "2026-13-01", "2026-11-23", "1900-01-01", "22/11/2000"])(
    "rejects invalid date %s with the shared message",
    (date) => {
      expect(parseDateOfBirth(date, today)).toEqual({ error: "Enter a valid date of birth." });
    },
  );

  it("uses a distinct required-field message for an empty date", () => {
    expect(parseDateOfBirth("", today)).toEqual({ error: "Enter your date of birth." });
  });

  it("accepts age 18 on the birthday and rejects the day before it", () => {
    const onBirthday = parseDateOfBirth("2008-11-22", today);
    const dayBefore = parseDateOfBirth("2008-11-23", today);
    expect(onBirthday).toMatchObject({ age: 18 });
    expect(dayBefore).toMatchObject({ age: 17 });
  });

  it("reaches a February 29 birthday on March 1 in a non-leap year", () => {
    expect(calculateAge({ year: 2008, month: 2, day: 29 }, { year: 2026, month: 2, day: 28 })).toBe(17);
    expect(calculateAge({ year: 2008, month: 2, day: 29 }, { year: 2026, month: 3, day: 1 })).toBe(18);
  });

  it("uses the Africa/Kampala calendar date", () => {
    expect(kampalaToday(new Date("2026-11-21T21:30:00Z"))).toEqual({ year: 2026, month: 11, day: 22 });
  });
});

describe("onboarding action", () => {
  async function expectRedirect(result: Promise<unknown>, path: string) {
    await expect(result).rejects.toThrow(`NEXT_REDIRECT:${path}`);
  }

  it("redirects signed-out users without reading or writing the database or deleting Auth", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expectRedirect(completeOnboarding({ status: "idle", message: "" }, validOnboarding()), "/sign-in");
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.adminDeleteUser).not.toHaveBeenCalled();
  });

  it("redirects an existing account without changing its gender or creating anything", async () => {
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, deletedAt: null });
    await expectRedirect(
      completeOnboarding({ status: "idle", message: "" }, validOnboarding({ gender: "MALE" })),
      "/discover",
    );
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: sessionUser.id },
      select: { id: true, deletedAt: true },
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("signs out and redirects a deleted account", async () => {
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, deletedAt: new Date("2026-01-01T00:00:00Z") });
    await expectRedirect(completeOnboarding({ status: "idle", message: "" }, validOnboarding()), "/sign-in");
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns all four validation errors together without creating or deleting anything", async () => {
    const result = await completeOnboarding(
      { status: "idle", message: "" },
      form({ gender: "OTHER", dateOfBirth: "", displayName: "", intent: "OTHER" }),
    );
    expect(result).toEqual({
      status: "error",
      message: "",
      fieldErrors: {
        gender: "Choose Female or Male.",
        dateOfBirth: "Enter your date of birth.",
        displayName: "Enter a display name.",
        intent: "Choose what you’re looking for.",
      },
      values: { gender: "OTHER", dateOfBirth: "", displayName: "", intent: "OTHER" },
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.adminDeleteUser).not.toHaveBeenCalled();
  });

  it("deletes an under-18 Auth user by session id, signs out, and redirects without storing DOB", async () => {
    const sequence: string[] = [];
    const dob = `${new Date().getUTCFullYear() - 16}-01-01`;
    mocks.adminDeleteUser.mockImplementation(async () => {
      sequence.push("delete");
      return { data: { user: null }, error: null };
    });
    mocks.signOut.mockImplementation(async () => {
      sequence.push("signOut");
      return { error: null };
    });

    await expectRedirect(
      completeOnboarding({ status: "idle", message: "" }, validOnboarding({ dateOfBirth: dob, userId: "attacker-id" })),
      "/sign-in?notice=under-18",
    );
    expect(sequence).toEqual(["delete", "signOut"]);
    expect(mocks.adminDeleteUser).toHaveBeenCalledWith(sessionUser.id);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("still signs out and redirects when the Auth deletion helper returns false", async () => {
    const sequence: string[] = [];
    const dob = `${new Date().getUTCFullYear() - 16}-01-01`;
    mocks.adminDeleteUser.mockImplementation(async () => {
      sequence.push("delete");
      return { data: { user: null }, error: new Error("provider detail") };
    });
    mocks.signOut.mockImplementation(async () => {
      sequence.push("signOut");
      return { error: null };
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expectRedirect(
      completeOnboarding({ status: "idle", message: "" }, validOnboarding({ dateOfBirth: dob })),
      "/sign-in?notice=under-18",
    );
    expect(sequence).toEqual(["delete", "signOut"]);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(dob);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("provider detail");
  });

  it("still signs out and redirects if the Auth deletion helper throws", async () => {
    const sequence: string[] = [];
    const dob = `${new Date().getUTCFullYear() - 16}-01-01`;
    vi.spyOn(adminModule, "deleteAuthUser").mockImplementation(async () => {
      sequence.push("delete");
      throw new Error("provider detail");
    });
    mocks.signOut.mockImplementation(async () => {
      sequence.push("signOut");
      return { error: null };
    });

    await expectRedirect(
      completeOnboarding({ status: "idle", message: "" }, validOnboarding({ dateOfBirth: dob })),
      "/sign-in?notice=under-18",
    );
    expect(sequence).toEqual(["delete", "signOut"]);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([
    ["FEMALE", "AVAILABLE"],
    ["MALE", null],
  ] as const)("creates the account once with the %s profile availability", async (gender, availability) => {
    await expectRedirect(
      completeOnboarding(
        { status: "idle", message: "" },
        validOnboarding({ gender, dateOfBirth: "2000-02-03", displayName: " Al  Bo " }),
      ),
      "/discover",
    );
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        id: sessionUser.id,
        gender,
        dateOfBirth: new Date("2000-02-03T00:00:00.000Z"),
        displayName: "Al Bo",
        profile: { create: { intent: "DATING", availability } },
      },
    });
    const createData = mocks.create.mock.calls[0][0].data;
    expect("bio" in createData).toBe(false);
  });

  it("treats a unique violation as a duplicate submit and redirects to Discover", async () => {
    mocks.create.mockRejectedValue(Object.assign(new Error("duplicate"), { code: "P2002" }));
    await expectRedirect(completeOnboarding({ status: "idle", message: "" }, validOnboarding()), "/discover");
    expect(mocks.create).toHaveBeenCalledOnce();
  });

  it("returns a generic save failure and echoed values for other create errors", async () => {
    mocks.create.mockRejectedValue(Object.assign(new Error("private database detail"), { code: "P1001" }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await completeOnboarding(
      { status: "idle", message: "" },
      validOnboarding({ displayName: " Amina " }),
    );
    expect(result).toEqual({
      status: "error",
      message: "We couldn’t save your details. Try again.",
      values: { gender: "FEMALE", dateOfBirth: "2000-01-01", displayName: " Amina ", intent: "DATING" },
    });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("private database detail");
    expect(consoleError).toHaveBeenCalledWith("Onboarding save failed:", "P1001");
  });
});

describe("account state and onboarding gates", () => {
  it("returns signed_out without querying the database", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(getAccountState()).resolves.toEqual({ status: "signed_out" });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("returns needs_onboarding when the Auth user has no Eluda row", async () => {
    await expect(getAccountState()).resolves.toEqual({ status: "needs_onboarding", userId: sessionUser.id });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: sessionUser.id },
      select: { id: true, displayName: true, deletedAt: true },
    });
  });

  it("returns only the account id and display name for an active account", async () => {
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, displayName: "Amina", deletedAt: null });
    await expect(getAccountState()).resolves.toEqual({
      status: "ready",
      account: { id: sessionUser.id, displayName: "Amina" },
    });
  });

  it("returns deleted for a row with deletedAt set", async () => {
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, displayName: "Amina", deletedAt: new Date() });
    await expect(getAccountState()).resolves.toEqual({ status: "deleted" });
  });

  it("gates Discover to the onboarding page until the row exists", async () => {
    await expect(ProtectedDiscoverContent()).rejects.toThrow("NEXT_REDIRECT:/onboarding");
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, displayName: "Amina", deletedAt: null });
    await expect(ProtectedDiscoverContent()).resolves.toBeDefined();
  });

  it("gates the onboarding page based on signed-out, deleted, and ready states", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(OnboardingGate()).rejects.toThrow("NEXT_REDIRECT:/sign-in");

    mocks.getCurrentUser.mockResolvedValue(sessionUser);
    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, displayName: "Amina", deletedAt: new Date() });
    await expect(OnboardingGate()).rejects.toThrow("NEXT_REDIRECT:/sign-in");

    mocks.findUnique.mockResolvedValue({ id: sessionUser.id, displayName: "Amina", deletedAt: null });
    await expect(OnboardingGate()).rejects.toThrow("NEXT_REDIRECT:/discover");

    mocks.findUnique.mockResolvedValue(null);
    await expect(OnboardingGate()).resolves.toBeDefined();
    expect(mocks.connection).toHaveBeenCalled();
    expect(OnboardingPage()).toBeDefined();
  });
});

describe("Supabase admin helper and static boundaries", () => {
  it("starts with the server-only marker and is imported only by the onboarding action", async () => {
    const { readFile, readdir } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const adminFile = "lib/supabase/admin.ts";
    const adminSource = await readFile(adminFile, "utf8");
    expect(adminSource.startsWith('import "server-only";')).toBe(true);

    const sourceFiles: string[] = [];
    async function visit(directory: string) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await visit(path);
        else if (/\.(?:[cm]?[jt]sx?)$/i.test(entry.name)) sourceFiles.push(path);
      }
    }
    await visit("app");
    await visit("lib");

    const forbidden = [
      new RegExp(["service", "role"].join("[_-]?"), "i"),
      new RegExp(["sb", "secret"].join("[_-]?"), "i"),
    ];
    const hits: string[] = [];
    const adminImports: string[] = [];
    for (const path of sourceFiles) {
      const source = await readFile(path, "utf8");
      if (forbidden.some((pattern) => pattern.test(source))) hits.push(path);
      const normalizedPath = path.replace(/\\/g, "/");
      if (normalizedPath !== adminFile && /(?:supabase\/admin|\.\/admin)["']/.test(source)) adminImports.push(normalizedPath);
    }
    expect(hits).toEqual([]);
    expect(adminImports).toEqual(["lib/onboarding/actions.ts"]);
  });

  it("returns false for missing credentials, provider errors and success without logging key material", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    await expect(deleteAuthUser(sessionUser.id)).resolves.toBe(false);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith("Supabase Auth user deletion unavailable: missing_secret");

    vi.stubEnv("SUPABASE_SECRET_KEY", "test-admin-key");
    mocks.adminDeleteUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("provider secret detail") });
    await expect(deleteAuthUser(sessionUser.id)).resolves.toBe(false);
    expect(consoleError).toHaveBeenLastCalledWith("Supabase Auth user deletion failed: delete_failed");

    mocks.adminDeleteUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(deleteAuthUser(sessionUser.id)).resolves.toBe(true);
    expect(mocks.createAdminClient).toHaveBeenLastCalledWith(
      "https://supabase.example.test",
      "test-admin-key",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("test-admin-key");
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("provider secret detail");
  });
});

describe("gender immutability migration", () => {
  it("contains the expected trigger and grants no execution to public roles", async () => {
    const { readFile } = await import("node:fs/promises");
    const sql = await readFile(
      "prisma/migrations/20261122120000_users_gender_immutable/migration.sql",
      "utf8",
    );
    expect(sql).toContain('CREATE FUNCTION "users_gender_immutable"()');
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION "users_gender_immutable"\(\) FROM PUBLIC, anon, authenticated;/);
    expect(sql).toMatch(/BEFORE UPDATE OF "gender" ON "users"/);
    expect(sql).not.toMatch(/CREATE TABLE/i);
  });
});
