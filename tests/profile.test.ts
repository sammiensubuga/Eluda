import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getCurrentUser: vi.fn(),
  findUnique: vi.fn(),
  userUpdate: vi.fn(),
  profileUpdate: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); }),
  connection: vi.fn(async () => {}),
  revalidatePath: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../lib/db", () => ({
  getDb: () => ({
    user: { findUnique: mocks.findUnique, update: mocks.userUpdate },
    profile: { update: mocks.profileUpdate },
  }),
}));
vi.mock("../lib/auth/current-user", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: mocks.connection,
}));

import { ProfileGate } from "../app/profile/page";
import { getOwnProfile } from "../lib/profile/queries";
import { updateAvailability, updateProfileBasics } from "../lib/profile/actions";

const sessionUser = { id: "session-user-id" };
const ownProfileRow = {
  displayName: "Amina",
  dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
  gender: "FEMALE" as const,
  profile: { intent: "DATING" as const, availability: "AVAILABLE" as const },
};

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function redirectTo(path: string) {
  return expect(mocks.redirect).toHaveBeenCalledWith(path);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: sessionUser }, error: null });
  mocks.getCurrentUser.mockResolvedValue(sessionUser);
  mocks.findUnique.mockImplementation(async (args: { select?: Record<string, unknown> }) => {
    const select = args.select ?? {};
    if ("dateOfBirth" in select) return ownProfileRow;
    if ("gender" in select) return { id: sessionUser.id, deletedAt: null, gender: "FEMALE" };
    return { id: sessionUser.id, displayName: "Amina", deletedAt: null };
  });
  mocks.userUpdate.mockResolvedValue({});
  mocks.profileUpdate.mockResolvedValue({});
});

describe("own profile query", () => {
  it("returns a computed age without returning the date of birth", async () => {
    const profile = await getOwnProfile();
    expect(profile).toMatchObject({ displayName: "Amina", gender: "FEMALE", intent: "DATING", availability: "AVAILABLE" });
    expect(profile?.age).toBeGreaterThan(0);
    expect(JSON.stringify(profile)).not.toContain("2000-01-01");
    expect(profile).not.toHaveProperty("dateOfBirth");
  });

  it("returns null for a non-ready account", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(getOwnProfile()).resolves.toBeNull();
  });
});

describe("profile basics action", () => {
  it("redirects signed-out users to sign-in", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(updateProfileBasics({ status: "idle", message: "" }, form({}))).rejects.toThrow("NEXT_REDIRECT:/sign-in");
    redirectTo("/sign-in");
  });

  it("redirects users without an account row to onboarding", async () => {
    mocks.findUnique.mockResolvedValue(null);
    await expect(updateProfileBasics({ status: "idle", message: "" }, form({}))).rejects.toThrow("NEXT_REDIRECT:/onboarding");
    redirectTo("/onboarding");
  });

  it("returns all invalid field errors and performs no write", async () => {
    const result = await updateProfileBasics({ status: "idle", message: "" }, form({ displayName: "A", intent: "BAD" }));
    expect(result.fieldErrors).toMatchObject({ displayName: "Use 2 to 30 characters.", intent: "Choose what you’re looking for." });
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("updates only the session user's display name and intent", async () => {
    const result = await updateProfileBasics({ status: "idle", message: "" }, form({
      displayName: "Amina Kay", intent: "FRIENDS", gender: "MALE", dateOfBirth: "1900-01-01", userId: "attacker-id", bio: "ignored",
    }));
    expect(result.status).toBe("success");
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: sessionUser.id },
      data: { displayName: "Amina Kay", profile: { update: { intent: "FRIENDS" } } },
    });
  });

  it("returns a generic database error and logs no submitted name or date", async () => {
    const error = Object.assign(new Error("Amina 2000-01-01 database detail"), { code: "P2002" });
    mocks.userUpdate.mockRejectedValue(error);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await updateProfileBasics({ status: "idle", message: "" }, form({ displayName: "Amina", intent: "DATING", dateOfBirth: "2000-01-01" }));
    expect(result.message).toBe("We couldn’t save your changes. Try again.");
    expect(log).toHaveBeenCalledWith("P2002");
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/Amina|2000-01-01|database detail/);
  });
});

describe("availability action", () => {
  it.each(["AVAILABLE", "BUSY", "HIDDEN"] as const)("allows a woman to set %s", async (availability) => {
    const result = await updateAvailability({ status: "idle", message: "" }, form({ availability }));
    expect(result.status).toBe("success");
    expect(mocks.profileUpdate).toHaveBeenCalledWith({ where: { userId: sessionUser.id }, data: { availability } });
  });

  it("rejects an invalid value", async () => {
    const result = await updateAvailability({ status: "idle", message: "" }, form({ availability: "PUBLIC" }));
    expect(result.fieldErrors?.availability).toBe("Choose an availability option.");
    expect(mocks.profileUpdate).not.toHaveBeenCalled();
  });

  it("rejects men without writing", async () => {
    mocks.findUnique.mockImplementation(async (args: { select?: Record<string, unknown> }) =>
      "gender" in (args.select ?? {}) ? { id: sessionUser.id, deletedAt: null, gender: "MALE" } : { id: sessionUser.id, deletedAt: null },
    );
    const result = await updateAvailability({ status: "idle", message: "" }, form({ availability: "HIDDEN" }));
    expect(result.status).toBe("error");
    expect(result.message).toBe("We couldn’t save your changes. Try again.");
    expect(mocks.profileUpdate).not.toHaveBeenCalled();
  });
});

describe("profile page gate", () => {
  it.each([
    [null, "/sign-in"],
    [{ id: sessionUser.id, displayName: "Amina", deletedAt: new Date() }, "/sign-in"],
    [null, "/onboarding"],
  ])("redirects non-ready accounts", async (row, expectedPath) => {
    mocks.findUnique.mockResolvedValue(row);
    if (expectedPath === "/onboarding") mocks.getCurrentUser.mockResolvedValue(sessionUser);
    else if (row === null) mocks.getCurrentUser.mockResolvedValue(null);
    await expect(ProfileGate()).rejects.toThrow(`NEXT_REDIRECT:${expectedPath}`);
    redirectTo(expectedPath);
  });
});
