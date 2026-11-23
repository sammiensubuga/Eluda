import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

const dbMocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  findUser: vi.fn(),
  photoCount: vi.fn(),
  findPhotos: vi.fn(),
  profileFind: vi.fn(),
  deletePhotoRow: vi.fn(),
  updatePhotos: vi.fn(),
  updatePhoto: vi.fn(),
  createPhoto: vi.fn(),
  transaction: vi.fn(),
  getUser: vi.fn(),
  rateLimit: vi.fn(),
  processAndStore: vi.fn(),
  removeObject: vi.fn(),
  storageUpload: vi.fn(),
  storageRemove: vi.fn(),
  storageSign: vi.fn(),
  storageFrom: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("../lib/db", () => ({ getDb: () => ({
  $queryRaw: dbMocks.queryRaw,
  user: { findUnique: dbMocks.findUser },
  profilePhoto: { count: dbMocks.photoCount, findMany: dbMocks.findPhotos, delete: dbMocks.deletePhotoRow, updateMany: dbMocks.updatePhotos, update: dbMocks.updatePhoto },
  profile: { findUnique: dbMocks.profileFind },
  $transaction: dbMocks.transaction,
}) }));
vi.mock("../lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { getUser: dbMocks.getUser } }) }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { deleteUser: vi.fn().mockResolvedValue({ error: null }) } },
    storage: { from: dbMocks.storageFrom },
  })),
}));
vi.mock("../lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/rate-limit")>()),
  consumeRateLimit: dbMocks.rateLimit,
}));
vi.mock("../lib/photos/service", () => ({
  processAndStorePhoto: dbMocks.processAndStore,
  removeStoredPhotoObject: dbMocks.removeObject,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); } }));

import { processPhoto } from "../lib/photos/process";
import { fitWithin } from "../lib/photos/client-resize";
import { POST as uploadRoute } from "../app/api/profile/photos/route";
import { deletePhoto, makeMainPhoto } from "../lib/photos/actions";

afterEach(() => vi.clearAllMocks());

beforeEach(() => {
  dbMocks.storageFrom.mockReturnValue({
    upload: dbMocks.storageUpload,
    remove: dbMocks.storageRemove,
    createSignedUrls: dbMocks.storageSign,
  });
  dbMocks.storageUpload.mockResolvedValue({ error: null });
  dbMocks.storageRemove.mockResolvedValue({ error: null });
  dbMocks.storageSign.mockResolvedValue({ data: [], error: null });
});

async function image(format: "jpeg" | "png" | "webp", width = 32, height = 20) {
  return sharp({ create: { width, height, channels: 4, background: { r: 210, g: 40, b: 100, alpha: 1 } } })
    .toFormat(format)
    .toBuffer();
}

describe("profile photo processing", () => {
  it.each(["jpeg", "png", "webp"] as const)("re-encodes %s as a bounded JPEG", async (format) => {
    const output = await processPhoto(await image(format, 1800, 900));
    expect(output.ok).toBe(true);
    if (!output.ok) return;
    expect(output.jpeg.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    expect(Math.max(output.width, output.height)).toBeLessThanOrEqual(1600);
    expect((await sharp(output.jpeg).metadata()).format).toBe("jpeg");
    expect((await sharp(output.jpeg).metadata()).exif).toBeUndefined();
    expect(output.jpeg.includes(Buffer.from([0xff, 0xe1]))).toBe(false);
  });

  it("does not enlarge small photos and strips EXIF after applying orientation", async () => {
    const oriented = await sharp({ create: { width: 40, height: 20, channels: 3, background: "red" } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const result = await processPhoto(oriented);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.width).toBe(20);
      expect(result.height).toBe(40);
      expect((await sharp(result.jpeg).metadata()).exif).toBeUndefined();
    }
  });

  it("flattens transparent PNG pixels to white", async () => {
    const png = await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    const result = await processPhoto(png);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { data } = await sharp(result.jpeg).raw().toBuffer({ resolveWithObject: true });
    expect(data[0]).toBeGreaterThan(240);
    expect(data[1]).toBeGreaterThan(240);
    expect(data[2]).toBeGreaterThan(240);
  });

  it("rejects unsupported magic, corrupt data, over-size input and a low pixel ceiling", async () => {
    await expect(processPhoto(Buffer.from("text called photo.jpg"))).resolves.toEqual({ ok: false, reason: "unsupported" });
    const png = await image("png");
    await expect(processPhoto(png.subarray(0, 32))).resolves.toEqual({ ok: false, reason: "invalid" });
    await expect(processPhoto(Buffer.alloc(3 * 1024 * 1024 + 1))).resolves.toEqual({ ok: false, reason: "too_large" });
    await expect(processPhoto(await image("png", 20, 20), 10)).resolves.toEqual({ ok: false, reason: "invalid" });
  });

  it("accepts PNG bytes independently of a filename extension", async () => {
    const png = await image("png");
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect((await processPhoto(png)).ok).toBe(true);
  });
});

describe("client resize geometry", () => {
  it("fits within the long-side limit without enlarging", () => {
    expect(fitWithin(4000, 2000, 1600)).toEqual({ width: 1600, height: 800 });
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => fitWithin(0, 1, 1600)).toThrow(RangeError);
  });
});

describe("atomic photo upload rate limit", () => {
  it("allows counts through the limit and refuses the next count", async () => {
    const { consumeRateLimit } = await vi.importActual<typeof import("../lib/rate-limit")>("../lib/rate-limit");
    dbMocks.queryRaw.mockResolvedValueOnce([{ count: 19 }]).mockResolvedValueOnce([{ count: 20 }]).mockResolvedValueOnce([{ count: 21 }]);
    await expect(consumeRateLimit("photo_upload:user-a", 20)).resolves.toBe(true);
    await expect(consumeRateLimit("photo_upload:user-a", 20)).resolves.toBe(true);
    await expect(consumeRateLimit("photo_upload:user-a", 20)).resolves.toBe(false);
    expect(dbMocks.queryRaw).toHaveBeenCalledTimes(3);
  });

  it("fails closed on database errors", async () => {
    const { consumeRateLimit } = await vi.importActual<typeof import("../lib/rate-limit")>("../lib/rate-limit");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    dbMocks.queryRaw.mockRejectedValue(new Error("database details"));
    await expect(consumeRateLimit("photo_upload:user-a", 20)).resolves.toBe(false);
    expect(error).toHaveBeenCalledWith("unknown");
    error.mockRestore();
  });
});

describe("rate-limit migration safety", () => {
  it("creates a constrained RLS-protected table and revokes public access", async () => {
    const { readFile } = await import("node:fs/promises");
    const sql = await readFile("prisma/migrations/20261123120000_rate_limit_counters/migration.sql", "utf8");
    expect(sql).toMatch(/CREATE TABLE "rate_limit_counters"/);
    expect(sql).toMatch(/CHECK \("count" >= 0\)/);
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/REVOKE ALL ON TABLE "rate_limit_counters" FROM PUBLIC/);
    expect(sql).toMatch(/REVOKE ALL ON TABLE "rate_limit_counters" FROM anon, authenticated/);
  });
});

describe("private photo service and admin storage boundary", () => {
  it("returns only owner photo metadata and signs paths for 300 seconds", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
    const { getOwnPhotoUrls } = await vi.importActual<typeof import("../lib/photos/service")>("../lib/photos/service");
    dbMocks.findPhotos.mockResolvedValue([
      { id: "photo-a", storagePath: "user-private/photo-a.jpg", position: 0 },
      { id: "photo-b", storagePath: "user-private/photo-b.jpg", position: 1 },
    ]);
    dbMocks.storageSign.mockResolvedValue({
      data: [
        { path: "user-private/photo-a.jpg", signedUrl: "https://signed/a", error: null },
        { path: "user-private/photo-b.jpg", signedUrl: "https://signed/b", error: null },
      ],
      error: null,
    });
    const result = await getOwnPhotoUrls("user-private");
    expect(result).toEqual([
      { id: "photo-a", url: "https://signed/a", position: 0, isMain: true },
      { id: "photo-b", url: "https://signed/b", position: 1, isMain: false },
    ]);
    expect(JSON.stringify(result)).not.toContain("user-private");
    expect(JSON.stringify(result)).not.toContain("storagePath");
    expect(dbMocks.storageSign).toHaveBeenCalledWith(["user-private/photo-a.jpg", "user-private/photo-b.jpg"], 300);
  });

  it("uses a null URL when signing fails and never throws on missing credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
    const { getOwnPhotoUrls } = await vi.importActual<typeof import("../lib/photos/service")>("../lib/photos/service");
    dbMocks.findPhotos.mockResolvedValue([{ id: "photo-a", storagePath: "user/photo-a.jpg", position: 0 }]);
    dbMocks.storageSign.mockResolvedValue({ data: null, error: new Error("provider details") });
    await expect(getOwnPhotoUrls("user")).resolves.toEqual([{ id: "photo-a", url: null, position: 0, isMain: true }]);

    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const { uploadPhotoObject, removePhotoObjects, createPhotoSignedUrls } = await vi.importActual<typeof import("../lib/supabase/admin")>("../lib/supabase/admin");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(uploadPhotoObject("private/path.jpg", Buffer.from("x"))).resolves.toBe(false);
    await expect(removePhotoObjects(["private/path.jpg"])).resolves.toBe(false);
    await expect(createPhotoSignedUrls(["private/path.jpg"], 300)).resolves.toBeNull();
    expect(log.mock.calls.flat().join(" ")).not.toContain("private/path.jpg");
    log.mockRestore();
  });

  it("stores only processed JPEG bytes under a generated per-user path", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
    const { processAndStorePhoto } = await vi.importActual<typeof import("../lib/photos/service")>("../lib/photos/service");
    const original = await image("png");
    const stored = await processAndStorePhoto("user-id", original);
    expect(stored.ok).toBe(true);
    if (!stored.ok) return;
    expect(stored.path).toMatch(/^user-id\/[0-9a-f-]+\.jpg$/u);
    expect(dbMocks.storageUpload).toHaveBeenCalledWith(stored.path, expect.any(Buffer), { contentType: "image/jpeg", upsert: false });
    const bytes = dbMocks.storageUpload.mock.calls.at(-1)?.[1] as Buffer;
    expect(bytes).not.toEqual(original);
    expect(bytes.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });
});

describe("profile photo upload route", () => {
  const accountUser = { id: "user-id", deletedAt: null };

  function uploadRequest(file?: File, headers: Record<string, string> = { "sec-fetch-site": "same-origin" }) {
    const body = new FormData();
    if (file) body.set("photo", file);
    return new Request("http://example.test/api/profile/photos", { method: "POST", headers, body });
  }

  function resetRouteMocks() {
    dbMocks.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    dbMocks.findUser.mockResolvedValue(accountUser);
    dbMocks.rateLimit.mockResolvedValue(true);
    dbMocks.photoCount.mockResolvedValue(0);
    dbMocks.processAndStore.mockResolvedValue({ ok: true, id: "photo-id", path: "user-id/photo-id.jpg" });
    dbMocks.removeObject.mockResolvedValue(true);
    dbMocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      $queryRaw: vi.fn(),
      profilePhoto: { count: dbMocks.photoCount, create: dbMocks.createPhoto },
    }));
  }

  it("rejects cross-site requests before looking up a session", async () => {
    resetRouteMocks();
    const response = await uploadRoute(uploadRequest(undefined, { "sec-fetch-site": "cross-site" }));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "forbidden" });
    expect(dbMocks.getUser).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("uses Origin host matching, denies a missing session, and blocks missing/deleted accounts", async () => {
    resetRouteMocks();
    dbMocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const sameOrigin = await uploadRoute(uploadRequest(undefined, { origin: "http://example.test", host: "example.test" }));
    expect(sameOrigin.status).toBe(401);
    dbMocks.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    dbMocks.findUser.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "user-id", deletedAt: new Date() });
    expect((await uploadRoute(uploadRequest())).status).toBe(403);
    expect((await uploadRoute(uploadRequest())).status).toBe(403);
    expect(dbMocks.rateLimit).not.toHaveBeenCalled();
  });

  it("applies the rate limit before reading or processing image data", async () => {
    resetRouteMocks();
    dbMocks.rateLimit.mockResolvedValue(false);
    const response = await uploadRoute(uploadRequest(new File(["image"], "a.png", { type: "image/png" })));
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "rate_limited" });
    expect(dbMocks.processAndStore).not.toHaveBeenCalled();
  });

  it("validates input errors and limits before processing", async () => {
    resetRouteMocks();
    expect((await uploadRoute(uploadRequest(undefined))).status).toBe(400);
    dbMocks.processAndStore.mockResolvedValue({ ok: false, reason: "unsupported" });
    const unsupported = await uploadRoute(uploadRequest(new File(["text"], "x.jpg", { type: "image/jpeg" })));
    expect(unsupported.status).toBe(400);
    expect(await unsupported.json()).toEqual({ error: "unsupported" });
    dbMocks.photoCount.mockResolvedValue(6);
    expect((await uploadRoute(uploadRequest(new File(["text"], "x.jpg", { type: "image/jpeg" })))).status).toBe(409);
    expect(dbMocks.processAndStore).toHaveBeenCalledTimes(1);
  });

  it("stores and returns only an id, with no-store headers", async () => {
    resetRouteMocks();
    dbMocks.photoCount.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
    dbMocks.createPhoto.mockResolvedValue({});
    const response = await uploadRoute(uploadRequest(new File(["validated-input"], "x.png", { type: "image/png" })));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "photo-id" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dbMocks.createPhoto).toHaveBeenCalledWith({ data: { id: "photo-id", userId: "user-id", storagePath: "user-id/photo-id.jpg", position: 2 } });
  });

  it("removes the uploaded object when the database transaction fails", async () => {
    resetRouteMocks();
    dbMocks.transaction.mockRejectedValue(new Error("database details"));
    const response = await uploadRoute(uploadRequest(new File(["image"], "x.jpg", { type: "image/jpeg" })));
    expect(response.status).toBe(500);
    expect(dbMocks.removeObject).toHaveBeenCalledWith("user-id/photo-id.jpg");
    expect((await response.text())).not.toContain("user-id/photo-id.jpg");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("owner-only photo actions", () => {
  const rows = [
    { id: "photo-a", storagePath: "owner/photo-a.jpg", position: 0 },
    { id: "photo-b", storagePath: "owner/photo-b.jpg", position: 1 },
    { id: "photo-c", storagePath: "owner/photo-c.jpg", position: 2 },
  ];

  function configureAction(photos = rows, publishedAt: Date | null = null) {
    dbMocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } }, error: null });
    dbMocks.findUser.mockResolvedValue({ id: "owner", deletedAt: null });
    dbMocks.findPhotos.mockResolvedValue(photos);
    dbMocks.profileFind.mockResolvedValue({ publishedAt });
    dbMocks.removeObject.mockResolvedValue(true);
    dbMocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      $queryRaw: vi.fn(),
      profilePhoto: {
        findMany: dbMocks.findPhotos,
        delete: dbMocks.deletePhotoRow,
        updateMany: dbMocks.updatePhotos,
        update: dbMocks.updatePhoto,
      },
      profile: { findUnique: dbMocks.profileFind },
    }));
  }

  it("rejects another user's photo id without calling storage", async () => {
    configureAction();
    const result = await deletePhoto({ status: "idle", message: "" }, "not-owned");
    expect(result.status).toBe("error");
    expect(dbMocks.removeObject).not.toHaveBeenCalled();
    expect(dbMocks.deletePhotoRow).not.toHaveBeenCalled();
  });

  it("refuses a published-profile deletion below two photos and keeps rows on storage failure", async () => {
    configureAction(rows.slice(0, 2), new Date());
    const limited = await deletePhoto({ status: "idle", message: "" }, "photo-a");
    expect(limited).toEqual({ status: "limit", message: "Add another photo before deleting this one." });
    expect(dbMocks.removeObject).not.toHaveBeenCalled();

    configureAction();
    dbMocks.removeObject.mockResolvedValue(false);
    const failed = await deletePhoto({ status: "idle", message: "" }, "photo-b");
    expect(failed.status).toBe("error");
    expect(dbMocks.deletePhotoRow).not.toHaveBeenCalled();
  });

  it("deletes only the owned object and renumbers remaining positions in two phases", async () => {
    configureAction();
    const result = await deletePhoto({ status: "idle", message: "" }, "photo-b");
    expect(result.status).toBe("success");
    expect(dbMocks.removeObject).toHaveBeenCalledWith("owner/photo-b.jpg");
    expect(dbMocks.deletePhotoRow).toHaveBeenCalledWith({ where: { id: "photo-b" } });
    expect(dbMocks.updatePhotos).toHaveBeenCalledWith({ where: { userId: "owner" }, data: { position: { increment: 1000 } } });
    expect(dbMocks.updatePhoto.mock.calls.map((call) => call[0].data.position)).toEqual([0, 1]);
  });

  it("moves a selected owned photo to main and preserves all other relative order", async () => {
    configureAction();
    const result = await makeMainPhoto({ status: "idle", message: "" }, "photo-c");
    expect(result.status).toBe("success");
    expect(dbMocks.updatePhotos).toHaveBeenCalledTimes(1);
    expect(dbMocks.updatePhoto.mock.calls.map((call) => [call[0].where.id, call[0].data.position])).toEqual([
      ["photo-c", 0], ["photo-a", 1], ["photo-b", 2],
    ]);
  });

  it("leaves the database row after a post-removal database error so retry can complete", async () => {
    configureAction();
    dbMocks.deletePhotoRow.mockRejectedValueOnce(new Error("database detail")).mockResolvedValueOnce({});
    const first = await deletePhoto({ status: "idle", message: "" }, "photo-b");
    expect(first.status).toBe("error");
    const retry = await deletePhoto({ status: "idle", message: "" }, "photo-b");
    expect(retry.status).toBe("success");
    expect(dbMocks.removeObject).toHaveBeenCalledTimes(2);
  });
});
