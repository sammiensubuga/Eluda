import "server-only";

import { randomUUID } from "node:crypto";

import { createPhotoSignedUrls, removePhotoObjects, uploadPhotoObject } from "../supabase/admin";
import { getDb } from "../db";
import { SIGNED_URL_TTL_SECONDS } from "./constants";
import { processPhoto } from "./process";
import { canViewProfilePhotos, type ProfileGender } from "./visibility";

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

export async function getProfilePhotoUrlsForViewer(
  viewerId: string | null,
  ownerId: string,
): Promise<OwnPhotoUrl[]> {
  if (viewerId === null || typeof viewerId !== "string" || viewerId.trim().length === 0) return [];
  if (typeof ownerId !== "string" || ownerId.trim().length === 0) return [];

  try {
    const db = getDb();
    const viewer = await db.user.findUnique({
      where: { id: viewerId },
      select: { id: true, gender: true, deletedAt: true },
    });
    if (!viewer || viewer.deletedAt) return [];

    const owner = await db.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        gender: true,
        deletedAt: true,
        profile: { select: { publishedAt: true } },
      },
    });
    if (!owner || !owner.profile) return [];

    let blockedEitherWay = false;
    if (viewer.id !== owner.id) {
      const block = await db.block.findFirst({
        where: {
          OR: [
            { blockerId: viewer.id, blockedId: owner.id },
            { blockerId: owner.id, blockedId: viewer.id },
          ],
        },
        select: { blockerId: true },
      });
      blockedEitherWay = block !== null;
    }

    if (viewer.gender !== "FEMALE" && viewer.gender !== "MALE") return [];
    if (owner.gender !== "FEMALE" && owner.gender !== "MALE") return [];
    if (!canViewProfilePhotos({
      viewerId: viewer.id,
      viewerGender: viewer.gender as ProfileGender,
      ownerId: owner.id,
      ownerGender: owner.gender as ProfileGender,
      ownerPublishedAt: owner.profile.publishedAt,
      ownerDeletedAt: owner.deletedAt,
      blockedEitherWay,
    })) return [];

    const photos = await db.profilePhoto.findMany({
      where: { userId: owner.id },
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
  } catch {
    return [];
  }
}

export async function deleteAllPhotosForUser(userId: string): Promise<boolean> {
  if (typeof userId !== "string" || userId.trim().length === 0) return false;

  try {
    const photos = await getDb().profilePhoto.findMany({
      where: { userId },
      select: { storagePath: true },
    });
    if (photos.length === 0) return true;

    const removed = await removePhotoObjects(photos.map((photo) => photo.storagePath));
    if (!removed) return false;

    await getDb().profilePhoto.deleteMany({ where: { userId } });
    return true;
  } catch {
    return false;
  }
}
