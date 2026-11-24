import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authGetUser: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); }),
  revalidatePath: vi.fn(),
  getDb: vi.fn(),
  findUser: vi.fn(),
  profileFind: vi.fn(),
  profileUpdate: vi.fn(),
  profileUpdateMany: vi.fn(),
  photoCount: vi.fn(),
  photoFindMany: vi.fn(),
  photoDelete: vi.fn(),
  photoDeleteMany: vi.fn(),
  photoUpdate: vi.fn(),
  photoUpdateMany: vi.fn(),
  blockFindFirst: vi.fn(),
  queryRaw: vi.fn(),
  transaction: vi.fn(),
  createSignedUrls: vi.fn(),
  removeObjects: vi.fn(),
  uploadObject: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../lib/db", () => ({ getDb: mocks.getDb }));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.authGetUser } })),
}));
vi.mock("../lib/supabase/admin", () => ({
  createPhotoSignedUrls: mocks.createSignedUrls,
  removePhotoObjects: mocks.removeObjects,
  uploadPhotoObject: mocks.uploadObject,
  deleteAuthUser: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { canViewProfilePhotos } from "../lib/photos/visibility";
import { deleteAllPhotosForUser, getProfilePhotoUrlsForViewer } from "../lib/photos/service";
import { deletePhoto } from "../lib/photos/actions";
import { publishProfile, unpublishProfile } from "../lib/profile/publish-actions";

type Gender = "FEMALE" | "MALE";
type UserRow = { id: string; gender: Gender; deletedAt: Date | null };
type PhotoRow = { id: string; userId: string; storagePath: string; position: number };
type FakeDatabase = {
  users: UserRow[];
  profiles: Array<{ userId: string; publishedAt: Date | null }>;
  photos: PhotoRow[];
  blocks: Array<{ blockerId: string; blockedId: string }>;
  stored: Set<string>;
};

let database: FakeDatabase;
let lockQueue: Promise<void>;
let failPhotoCount: Error | null;
let failPhotoDeleteMany: boolean;
let failStorageRemoval: boolean;

const ownerId = "owner-id";
const viewerId = "viewer-id";
const ownerRow: UserRow = { id: ownerId, gender: "FEMALE", deletedAt: null };
const viewerRow: UserRow = { id: viewerId, gender: "MALE", deletedAt: null };
const otherUserId = "other-user-id";

function initialPhotos(): PhotoRow[] {
  return [
    { id: "photo-a", userId: ownerId, storagePath: `${ownerId}/photo-a.jpg`, position: 0 },
    { id: "photo-b", userId: ownerId, storagePath: `${ownerId}/photo-b.jpg`, position: 1 },
    { id: "other-photo", userId: otherUserId, storagePath: `${otherUserId}/photo.jpg`, position: 0 },
  ];
}

function form(fields: Record<string, string> = {}): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function resetDatabase(photoRows = initialPhotos(), publishedAt: Date | null = null) {
  database = {
    users: [ownerRow, viewerRow, { id: otherUserId, gender: "MALE", deletedAt: null }],
    profiles: [{ userId: ownerId, publishedAt }],
    photos: structuredClone(photoRows),
    blocks: [],
    stored: new Set(photoRows.map((photo) => photo.storagePath)),
  };
  lockQueue = Promise.resolve();
  failPhotoCount = null;
  failPhotoDeleteMany = false;
  failStorageRemoval = false;
}

function findProfile(userId: string) {
  return database.profiles.find((profile) => profile.userId === userId) ?? null;
}

function sortedPhotos(userId: string) {
  return database.photos.filter((photo) => photo.userId === userId).sort((a, b) => a.position - b.position);
}

const transactionClient = {
  $queryRaw: mocks.queryRaw,
  profile: {
    findUnique: mocks.profileFind,
    update: mocks.profileUpdate,
    updateMany: mocks.profileUpdateMany,
  },
  profilePhoto: {
    count: mocks.photoCount,
    findMany: mocks.photoFindMany,
    delete: mocks.photoDelete,
    deleteMany: mocks.photoDeleteMany,
    update: mocks.photoUpdate,
    updateMany: mocks.photoUpdateMany,
  },
};

const dbClient = {
  user: { findUnique: mocks.findUser },
  profile: transactionClient.profile,
  profilePhoto: transactionClient.profilePhoto,
  block: { findFirst: mocks.blockFindFirst },
  $transaction: mocks.transaction,
};

beforeEach(() => {
  vi.clearAllMocks();
  resetDatabase();
  mocks.getDb.mockReturnValue(dbClient);
  mocks.authGetUser.mockResolvedValue({ data: { user: { id: ownerId } }, error: null });
  mocks.findUser.mockImplementation(async ({ where, select }: { where: { id: string }; select?: Record<string, unknown> }) => {
    const user = database.users.find((entry) => entry.id === where.id);
    if (!user) return null;
    return select && "profile" in select ? { ...user, profile: findProfile(user.id) } : user;
  });
  mocks.profileFind.mockImplementation(async ({ where }: { where: { userId: string } }) => findProfile(where.userId));
  mocks.profileUpdate.mockImplementation(async ({ where, data }: { where: { userId: string }; data: { publishedAt: Date | null } }) => {
    const profile = findProfile(where.userId);
    if (profile) profile.publishedAt = data.publishedAt;
    return profile;
  });
  mocks.profileUpdateMany.mockImplementation(async ({ where, data }: {
    where: { userId: string; publishedAt?: null };
    data: { publishedAt: Date };
  }) => {
    const profile = findProfile(where.userId);
    if (profile && (!Object.hasOwn(where, "publishedAt") || profile.publishedAt === null)) {
      profile.publishedAt = data.publishedAt;
      return { count: 1 };
    }
    return { count: 0 };
  });
  mocks.photoCount.mockImplementation(async ({ where }: { where: { userId: string } }) => {
    if (failPhotoCount) throw failPhotoCount;
    return sortedPhotos(where.userId).length;
  });
  mocks.photoFindMany.mockImplementation(async ({ where }: { where: { userId: string } }) => sortedPhotos(where.userId));
  mocks.photoDelete.mockImplementation(async ({ where }: { where: { id: string } }) => {
    const index = database.photos.findIndex((photo) => photo.id === where.id);
    if (index < 0) throw new Error("missing photo");
    return database.photos.splice(index, 1)[0];
  });
  mocks.photoDeleteMany.mockImplementation(async ({ where }: { where: { userId: string } }) => {
    if (failPhotoDeleteMany) {
      failPhotoDeleteMany = false;
      throw Object.assign(new Error("private database detail"), { code: "P2025" });
    }
    const before = database.photos.length;
    database.photos = database.photos.filter((photo) => photo.userId !== where.userId);
    return { count: before - database.photos.length };
  });
  mocks.photoUpdate.mockImplementation(async ({ where, data }: { where: { id: string }; data: { position: number } }) => {
    const photo = database.photos.find((entry) => entry.id === where.id);
    if (photo) photo.position = data.position;
    return photo;
  });
  mocks.photoUpdateMany.mockImplementation(async ({ where, data }: { where: { userId: string }; data: { position: { increment: number } } }) => {
    for (const photo of database.photos.filter((entry) => entry.userId === where.userId)) photo.position += data.position.increment;
    return { count: database.photos.filter((photo) => photo.userId === where.userId).length };
  });
  mocks.blockFindFirst.mockImplementation(async ({ where }: { where: { OR: Array<{ blockerId: string; blockedId: string }> } }) =>
    database.blocks.find((block) => where.OR.some((direction) => direction.blockerId === block.blockerId && direction.blockedId === block.blockedId)) ?? null,
  );
  mocks.queryRaw.mockResolvedValue([{ user_id: ownerId }]);
  mocks.transaction.mockImplementation(async (callback: (tx: typeof transactionClient) => unknown) => {
    let release!: () => void;
    const previous = lockQueue;
    lockQueue = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    const snapshot = structuredClone(database);
    try {
      return await callback(transactionClient);
    } catch (error) {
      database = snapshot;
      throw error;
    } finally {
      release();
    }
  });
  mocks.createSignedUrls.mockImplementation(async (paths: string[]) => Object.fromEntries(paths.map((path, index) => [path, `https://signed.example/${index}`])));
  mocks.removeObjects.mockImplementation(async (paths: string[]) => {
    if (failStorageRemoval) return false;
    for (const path of paths) database.stored.delete(path);
    return true;
  });
  mocks.uploadObject.mockResolvedValue(true);
});

afterEach(() => vi.restoreAllMocks());

const INITIAL_PUBLISH_STATE = { status: "idle" as const, message: "" };
const ownInput = (overrides: Record<string, unknown> = {}) => ({
  viewerId: ownerId,
  viewerGender: "FEMALE" as const,
  ownerId,
  ownerGender: "FEMALE" as const,
  ownerPublishedAt: null,
  ownerDeletedAt: null,
  blockedEitherWay: false,
  ...overrides,
});

describe("publish profile Server Actions", () => {
  it("redirects signed-out users, users without an account, and deleted accounts", async () => {
    mocks.authGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(publishProfile(INITIAL_PUBLISH_STATE, form())).rejects.toThrow("NEXT_REDIRECT:/sign-in");

    mocks.findUser.mockResolvedValueOnce(null);
    await expect(publishProfile(INITIAL_PUBLISH_STATE, form())).rejects.toThrow("NEXT_REDIRECT:/onboarding");

    mocks.findUser.mockResolvedValueOnce({ id: ownerId, deletedAt: new Date() });
    await expect(publishProfile(INITIAL_PUBLISH_STATE, form())).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("refuses fewer than two photos with the exact message and performs no write", async () => {
    resetDatabase(initialPhotos().slice(0, 1));
    const result = await publishProfile(INITIAL_PUBLISH_STATE, form());
    expect(result).toEqual({ status: "error", message: "Add at least 2 photos to publish your profile." });
    expect(mocks.profileUpdateMany).not.toHaveBeenCalled();
    expect(database.profiles[0].publishedAt).toBeNull();
  });

  it("publishes with two photos, preserves the first timestamp on repeats, and ignores form user ids", async () => {
    const data = form({ userId: otherUserId });
    const first = await publishProfile(INITIAL_PUBLISH_STATE, data);
    expect(first).toEqual({ status: "success", message: "Your profile is published." });
    const originalTime = database.profiles[0].publishedAt?.getTime();
    expect(originalTime).toBeTypeOf("number");
    expect(mocks.profileUpdateMany).toHaveBeenCalledWith({
      where: { userId: ownerId, publishedAt: null },
      data: { publishedAt: expect.any(Date) },
    });

    await expect(publishProfile(INITIAL_PUBLISH_STATE, data)).resolves.toEqual(first);
    expect(database.profiles[0].publishedAt?.getTime()).toBe(originalTime);
    expect(findProfile(otherUserId)).toBeNull();
    expect(mocks.queryRaw).toHaveBeenCalledTimes(2);
  });

  it("returns the generic database error and logs only its code", async () => {
    failPhotoCount = Object.assign(new Error("private owner and db details"), { code: "P2025" });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await publishProfile(INITIAL_PUBLISH_STATE, form());
    expect(result).toEqual({ status: "error", message: "We couldn’t update your profile. Try again." });
    expect(log).toHaveBeenCalledWith("P2025");
    expect(log.mock.calls.flat().join(" ")).not.toMatch(/private owner|db details/);
  });

  it("unpublishes by changing only publishedAt", async () => {
    resetDatabase(initialPhotos(), new Date("2026-11-20T10:00:00.000Z"));
    const result = await unpublishProfile(INITIAL_PUBLISH_STATE, form({ userId: otherUserId }));
    expect(result).toEqual({ status: "success", message: "Your profile is not published." });
    expect(database.profiles[0].publishedAt).toBeNull();
    expect(mocks.profileUpdate).toHaveBeenCalledWith({ where: { userId: ownerId }, data: { publishedAt: null } });
  });

  it("lets unpublished users delete to zero while published users keep at least two photos", async () => {
    resetDatabase(initialPhotos().slice(0, 2));
    expect((await deletePhoto({ status: "idle", message: "" }, "photo-a")).status).toBe("success");
    expect((await deletePhoto({ status: "idle", message: "" }, "photo-b")).status).toBe("success");
    expect(sortedPhotos(ownerId)).toHaveLength(0);

    resetDatabase(initialPhotos().slice(0, 2), new Date());
    mocks.removeObjects.mockClear();
    const denied = await deletePhoto({ status: "idle", message: "" }, "photo-a");
    expect(denied).toEqual({ status: "limit", message: "Add another photo before deleting this one." });
    expect(sortedPhotos(ownerId)).toHaveLength(2);
    expect(mocks.removeObjects).not.toHaveBeenCalled();
  });

  it("serializes delete and publish so a published profile never has fewer than two photos", async () => {
    resetDatabase(initialPhotos().slice(0, 2));
    const [publishResult] = await Promise.all([
      publishProfile(INITIAL_PUBLISH_STATE, form()),
      deletePhoto({ status: "idle", message: "" }, "photo-a"),
    ]);
    if (database.profiles[0].publishedAt !== null) expect(sortedPhotos(ownerId).length).toBeGreaterThanOrEqual(2);
    if (publishResult.status === "success") expect(sortedPhotos(ownerId).length).toBeGreaterThanOrEqual(2);
  });
});

describe("pure photo visibility rule", () => {
  it("allows owners to see their own published or unpublished photos unless deleted", () => {
    expect(canViewProfilePhotos(ownInput())).toBe(true);
    expect(canViewProfilePhotos(ownInput({ ownerPublishedAt: new Date() }))).toBe(true);
    expect(canViewProfilePhotos(ownInput({ ownerDeletedAt: new Date() }))).toBe(false);
  });

  it("requires a signed-in opposite-gender viewer, published owner, no deletion and no block", () => {
    const allowed = {
      viewerId,
      viewerGender: "MALE" as const,
      ownerId,
      ownerGender: "FEMALE" as const,
      ownerPublishedAt: new Date(),
      ownerDeletedAt: null,
      blockedEitherWay: false,
    };
    expect(canViewProfilePhotos(allowed)).toBe(true);
    expect(canViewProfilePhotos({ ...allowed, ownerPublishedAt: null })).toBe(false);
    expect(canViewProfilePhotos({ ...allowed, viewerGender: "FEMALE" })).toBe(false);
    expect(canViewProfilePhotos({ ...allowed, blockedEitherWay: true })).toBe(false);
    expect(canViewProfilePhotos({ ...allowed, ownerDeletedAt: new Date() })).toBe(false);
    expect(canViewProfilePhotos({ ...allowed, viewerId: null, viewerGender: null })).toBe(false);
  });

  it("returns false without throwing for malformed inputs", () => {
    for (const candidate of [null, undefined, {}, { ...ownInput(), ownerId: " " }, { ...ownInput(), ownerPublishedAt: "now" }, { ...ownInput(), blockedEitherWay: 1 }]) {
      expect(() => canViewProfilePhotos(candidate as never)).not.toThrow();
      expect(canViewProfilePhotos(candidate as never)).toBe(false);
    }
  });
});

describe("viewer photo service", () => {
  it("returns an identical empty result for every denial case, including blocks in both directions", async () => {
    const denials: unknown[][] = [];
    denials.push(await getProfilePhotoUrlsForViewer(null, ownerId));
    denials.push(await getProfilePhotoUrlsForViewer("missing-viewer", ownerId));

    resetDatabase();
    database.users = database.users.map((user) => user.id === viewerId ? { ...user, deletedAt: new Date() } : user);
    denials.push(await getProfilePhotoUrlsForViewer(viewerId, ownerId));

    resetDatabase();
    denials.push(await getProfilePhotoUrlsForViewer(viewerId, "missing-owner"));

    resetDatabase();
    database.users = database.users.map((user) => user.id === ownerId ? { ...user, deletedAt: new Date() } : user);
    denials.push(await getProfilePhotoUrlsForViewer(viewerId, ownerId));

    resetDatabase(initialPhotos(), null);
    denials.push(await getProfilePhotoUrlsForViewer(viewerId, ownerId));

    resetDatabase(initialPhotos(), new Date());
    database.users = database.users.map((user) => user.id === viewerId ? { ...user, gender: "FEMALE" } : user);
    denials.push(await getProfilePhotoUrlsForViewer(viewerId, ownerId));

    for (const [blockerId, blockedId] of [[viewerId, ownerId], [ownerId, viewerId]]) {
      resetDatabase(initialPhotos(), new Date());
      database.blocks.push({ blockerId, blockedId });
      denials.push(await getProfilePhotoUrlsForViewer(viewerId, ownerId));
    }

    expect(denials).toHaveLength(9);
    for (const result of denials) expect(result).toEqual([]);
    expect(denials.every((result) => JSON.stringify(result) === "[]")).toBe(true);
  });

  it("returns only photo ids, signed URLs and positions for an allowed viewer", async () => {
    resetDatabase(initialPhotos(), new Date("2026-11-22T12:00:00.000Z"));
    mocks.createSignedUrls.mockResolvedValueOnce({
      [`${ownerId}/photo-a.jpg`]: "https://signed.example/a",
      [`${ownerId}/photo-b.jpg`]: "https://signed.example/b",
    });
    const result = await getProfilePhotoUrlsForViewer(viewerId, ownerId);
    expect(result).toEqual([
      { id: "photo-a", url: "https://signed.example/a", position: 0, isMain: true },
      { id: "photo-b", url: "https://signed.example/b", position: 1, isMain: false },
    ]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(ownerId);
    expect(serialized).not.toContain(viewerId);
    expect(serialized).not.toContain("storagePath");
    expect(serialized).not.toContain("2026-11-22");
    expect(mocks.createSignedUrls).toHaveBeenCalledWith([`${ownerId}/photo-a.jpg`, `${ownerId}/photo-b.jpg`], 300);
  });

  it("returns null for a photo whose signed URL could not be created", async () => {
    resetDatabase(initialPhotos(), new Date());
    mocks.createSignedUrls.mockResolvedValueOnce({ [`${ownerId}/photo-a.jpg`]: "https://signed.example/a" });
    await expect(getProfilePhotoUrlsForViewer(viewerId, ownerId)).resolves.toEqual([
      { id: "photo-a", url: "https://signed.example/a", position: 0, isMain: true },
      { id: "photo-b", url: null, position: 1, isMain: false },
    ]);

    mocks.createSignedUrls.mockResolvedValueOnce(null);
    await expect(getProfilePhotoUrlsForViewer(viewerId, ownerId)).resolves.toEqual([
      { id: "photo-a", url: null, position: 0, isMain: true },
      { id: "photo-b", url: null, position: 1, isMain: false },
    ]);
  });
});

describe("account-deletion photo helper", () => {
  it("removes every owned object and photo row, leaving other users untouched", async () => {
    resetDatabase();
    await expect(deleteAllPhotosForUser(ownerId)).resolves.toBe(true);
    expect(sortedPhotos(ownerId)).toEqual([]);
    expect(database.stored).toEqual(new Set([`${otherUserId}/photo.jpg`]));
    expect(mocks.removeObjects).toHaveBeenCalledTimes(1);
    expect(mocks.removeObjects).toHaveBeenCalledWith([`${ownerId}/photo-a.jpg`, `${ownerId}/photo-b.jpg`]);
  });

  it("leaves rows and objects untouched if storage removal fails", async () => {
    resetDatabase();
    failStorageRemoval = true;
    await expect(deleteAllPhotosForUser(ownerId)).resolves.toBe(false);
    expect(sortedPhotos(ownerId)).toHaveLength(2);
    expect(database.stored.has(`${ownerId}/photo-a.jpg`)).toBe(true);
    expect(mocks.photoDeleteMany).not.toHaveBeenCalled();
  });

  it("retries successfully after database failure removed the objects", async () => {
    resetDatabase();
    failPhotoDeleteMany = true;
    await expect(deleteAllPhotosForUser(ownerId)).resolves.toBe(false);
    expect(sortedPhotos(ownerId)).toHaveLength(2);
    expect(database.stored.has(`${ownerId}/photo-a.jpg`)).toBe(false);
    await expect(deleteAllPhotosForUser(ownerId)).resolves.toBe(true);
    expect(sortedPhotos(ownerId)).toEqual([]);
    expect(mocks.removeObjects).toHaveBeenCalledTimes(2);
  });

  it("is a no-op success when the user has no photo rows", async () => {
    resetDatabase(initialPhotos().filter((photo) => photo.userId !== ownerId));
    await expect(deleteAllPhotosForUser(ownerId)).resolves.toBe(true);
    expect(mocks.removeObjects).not.toHaveBeenCalled();
    expect(sortedPhotos(otherUserId)).toHaveLength(1);
  });
});

describe("storage function importer isolation", () => {
  it("keeps all photo-storage admin imports in lib/photos/service.ts", async () => {
    const { readdir, readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
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

    const importers: string[] = [];
    for (const path of sourceFiles) {
      const source = await readFile(path, "utf8");
      if (/import\s*\{[\s\S]*?\b(?:uploadPhotoObject|removePhotoObjects|createPhotoSignedUrls)\b[\s\S]*?\}\s*from\s*["'][^"']*supabase\/admin["']/.test(source)) {
        importers.push(path.replace(/\\/g, "/"));
      }
    }
    expect(importers).toEqual(["lib/photos/service.ts"]);
  });
});
