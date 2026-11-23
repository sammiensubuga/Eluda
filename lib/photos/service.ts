import "server-only";

import { randomUUID } from "node:crypto";

import { createPhotoSignedUrls, removePhotoObjects, uploadPhotoObject } from "../supabase/admin";
import { getDb } from "../db";
import { SIGNED_URL_TTL_SECONDS } from "./constants";
import { processPhoto } from "./process";

export type OwnPhotoUrl = {
  id: string;
  url: string | null;
  position: number;
  isMain: boolean;
};

export type ProcessAndStoreResult =
  | { ok: true; id: string; path: string }
  | { ok: false; reason: "too_large" | "unsupported" | "invalid" | "storage_failed" };

export async function processAndStorePhoto(userId: string, input: Buffer): Promise<ProcessAndStoreResult> {
  const processed = await processPhoto(input);
  if (!processed.ok) return processed;

  const id = randomUUID();
  const path = `${userId}/${id}.jpg`;
  const stored = await uploadPhotoObject(path, processed.jpeg);
  if (!stored) return { ok: false, reason: "storage_failed" };
  return { ok: true, id, path };
}

export async function getOwnPhotoUrls(userId: string): Promise<OwnPhotoUrl[]> {
  const photos = await getDb().profilePhoto.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: { id: true, storagePath: true, position: true },
  });
  if (photos.length === 0) return [];

  const signedUrls = await createPhotoSignedUrls(
    photos.map((photo) => photo.storagePath),
    SIGNED_URL_TTL_SECONDS,
  );

  return photos.map((photo) => ({
    id: photo.id,
    url: signedUrls?.[photo.storagePath] ?? null,
    position: photo.position,
    isMain: photo.position === 0,
  }));
}

export async function removeStoredPhotoObject(path: string): Promise<boolean> {
  return removePhotoObjects([path]);
}
