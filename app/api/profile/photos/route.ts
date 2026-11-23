import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getDb } from "../../../../lib/db";
import { consumeRateLimit } from "../../../../lib/rate-limit";
import { MAX_PHOTOS, MAX_UPLOAD_BYTES, UPLOAD_LIMIT_PER_HOUR } from "../../../../lib/photos/constants";
import { processAndStorePhoto, removeStoredPhotoObject } from "../../../../lib/photos/service";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

class PhotoLimitError extends Error {
  readonly reason = "limit";
}

function jsonResponse(payload: Record<string, string>, status: number): Response {
  return Response.json(payload, { status, headers: NO_STORE_HEADERS });
}

function requestIsSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  const code = error.code;
  return typeof code === "string" && /^[A-Z0-9]+$/u.test(code) ? code : "unknown";
}

function logDatabaseError(error: unknown): void {
  console.error(errorCode(error));
}

export async function POST(request: Request): Promise<Response> {
  if (!requestIsSameOrigin(request)) return jsonResponse({ error: "forbidden" }, 403);

  let userId: string;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return jsonResponse({ error: "unauthorized" }, 401);
    userId = data.user.id;
  } catch {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let account: { id: string; deletedAt: Date | null } | null;
  try {
    account = await getDb().user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });
  } catch (error) {
    logDatabaseError(error);
    return jsonResponse({ error: "failed" }, 500);
  }
  if (!account || account.deletedAt) return jsonResponse({ error: "forbidden" }, 403);

  if (!(await consumeRateLimit(`photo_upload:${userId}`, UPLOAD_LIMIT_PER_HOUR))) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > MAX_UPLOAD_BYTES + 100 * 1024) {
    return jsonResponse({ error: "too_large" }, 413);
  }

  let photo: File;
  try {
    const formData = await request.formData();
    const value = formData.get("photo");
    if (typeof File === "undefined" || !(value instanceof File)) {
      return jsonResponse({ error: "invalid" }, 400);
    }
    photo = value;
  } catch {
    return jsonResponse({ error: "invalid" }, 400);
  }
  if (photo.size > MAX_UPLOAD_BYTES) return jsonResponse({ error: "too_large" }, 413);

  let photoCount: number;
  try {
    photoCount = await getDb().profilePhoto.count({ where: { userId } });
  } catch (error) {
    logDatabaseError(error);
    return jsonResponse({ error: "failed" }, 500);
  }
  if (photoCount >= MAX_PHOTOS) return jsonResponse({ error: "limit" }, 409);

  let stored: Awaited<ReturnType<typeof processAndStorePhoto>>;
  try {
    stored = await processAndStorePhoto(userId, Buffer.from(await photo.arrayBuffer()));
  } catch {
    return jsonResponse({ error: "invalid" }, 400);
  }
  if (!stored.ok) {
    if (stored.reason === "too_large") return jsonResponse({ error: "too_large" }, 413);
    if (stored.reason === "unsupported") return jsonResponse({ error: "unsupported" }, 400);
    if (stored.reason === "invalid") return jsonResponse({ error: "invalid" }, 400);
    return jsonResponse({ error: "storage_failed" }, 502);
  }

  try {
    await getDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
      const count = await tx.profilePhoto.count({ where: { userId } });
      if (count >= MAX_PHOTOS) throw new PhotoLimitError();
      await tx.profilePhoto.create({
        data: { id: stored.id, userId, storagePath: stored.path, position: count },
      });
    }, { timeout: 15_000 });
  } catch (error) {
    await removeStoredPhotoObject(stored.path);
    if (error instanceof PhotoLimitError) return jsonResponse({ error: "limit" }, 409);
    logDatabaseError(error);
    return jsonResponse({ error: "failed" }, 500);
  }

  return jsonResponse({ id: stored.id }, 201);
}

export async function GET(): Promise<Response> {
  return jsonResponse({ error: "method_not_allowed" }, 405);
}

export async function OPTIONS(): Promise<Response> {
  return jsonResponse({ error: "method_not_allowed" }, 405);
}
