"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "../db";
import { createSupabaseServerClient } from "../supabase/server";
import { removeStoredPhotoObject } from "./service";

export type PhotoActionState = {
  status: "idle" | "success" | "error" | "limit";
  message: string;
};

const GENERIC_FAILURE = "We couldn’t update your photos. Try again.";
const DELETE_LIMIT_MESSAGE = "Add another photo before deleting this one.";

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  const code = error.code;
  return typeof code === "string" && /^[A-Z0-9]+$/u.test(code) ? code : "unknown";
}

function logDatabaseError(error: unknown): void {
  console.error(errorCode(error));
}

async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");

  let account: { id: string; deletedAt: Date | null } | null;
  try {
    account = await getDb().user.findUnique({
      where: { id: data.user.id },
      select: { id: true, deletedAt: true },
    });
  } catch (databaseError) {
    logDatabaseError(databaseError);
    return null;
  }

  if (!account) redirect("/onboarding");
  if (account.deletedAt) redirect("/sign-in");
  return data.user.id;
}

export async function deletePhoto(_previousState: PhotoActionState, photoId: string): Promise<PhotoActionState> {
  const userId = await getSessionUserId();
  if (!userId) return { status: "error", message: GENERIC_FAILURE };

  try {
    const result = await getDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
      const photos = await tx.profilePhoto.findMany({
        where: { userId },
        orderBy: { position: "asc" },
        select: { id: true, storagePath: true, position: true },
      });
      const target = photos.find((photo) => photo.id === photoId);
      if (!target) return { status: "error" as const };

      const profile = await tx.profile.findUnique({
        where: { userId },
        select: { publishedAt: true },
      });
      if (profile?.publishedAt && photos.length - 1 < 2) return { status: "limit" as const };

      const removed = await removeStoredPhotoObject(target.storagePath);
      if (!removed) return { status: "error" as const };

      await tx.profilePhoto.delete({ where: { id: target.id } });
      const remaining = photos.filter((photo) => photo.id !== target.id);
      if (remaining.length > 0) {
        await tx.profilePhoto.updateMany({
          where: { userId },
          data: { position: { increment: 1000 } },
        });
        for (const [position, photo] of remaining.entries()) {
          await tx.profilePhoto.update({ where: { id: photo.id }, data: { position } });
        }
      }
      return { status: "success" as const };
    }, { timeout: 15_000 });

    if (result.status === "limit") return { status: "limit", message: DELETE_LIMIT_MESSAGE };
    if (result.status !== "success") return { status: "error", message: GENERIC_FAILURE };
    revalidatePath("/profile");
    return { status: "success", message: "Photo deleted." };
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: GENERIC_FAILURE };
  }
}

export async function makeMainPhoto(_previousState: PhotoActionState, photoId: string): Promise<PhotoActionState> {
  const userId = await getSessionUserId();
  if (!userId) return { status: "error", message: GENERIC_FAILURE };

  try {
    const result = await getDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
      const photos = await tx.profilePhoto.findMany({
        where: { userId },
        orderBy: { position: "asc" },
        select: { id: true, position: true },
      });
      const target = photos.find((photo) => photo.id === photoId);
      if (!target) return "missing" as const;
      if (target.position === 0) return "success" as const;

      await tx.profilePhoto.updateMany({
        where: { userId },
        data: { position: { increment: 1000 } },
      });
      const reordered = [target, ...photos.filter((photo) => photo.id !== target.id)];
      for (const [position, photo] of reordered.entries()) {
        await tx.profilePhoto.update({ where: { id: photo.id }, data: { position } });
      }
      return "success" as const;
    }, { timeout: 15_000 });

    if (result !== "success") return { status: "error", message: GENERIC_FAILURE };
    revalidatePath("/profile");
    return { status: "success", message: "Main photo updated." };
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: GENERIC_FAILURE };
  }
}
