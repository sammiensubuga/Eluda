"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "../db";
import { createSupabaseServerClient } from "../supabase/server";

export type PublishActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const GENERIC_FAILURE = "We couldn’t update your profile. Try again.";
const TOO_FEW_PHOTOS = "Add at least 2 photos to publish your profile.";

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  const code = error.code;
  return typeof code === "string" && /^[A-Z0-9]+$/u.test(code) ? code : "unknown";
}

function logDatabaseError(error: unknown): void {
  console.error(errorCode(error));
}

async function getSessionAccountId(): Promise<string | null> {
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
  return account.id;
}

export async function publishProfile(
  _previousState: PublishActionState,
  _formData: FormData,
): Promise<PublishActionState> {
  const userId = await getSessionAccountId();
  if (!userId) return { status: "error", message: GENERIC_FAILURE };

  try {
    const published = await getDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
      const photoCount = await tx.profilePhoto.count({ where: { userId } });
      if (photoCount < 2) return false;

      await tx.profile.updateMany({
        where: { userId, publishedAt: null },
        data: { publishedAt: new Date() },
      });
      return true;
    }, { timeout: 15_000 });

    if (!published) return { status: "error", message: TOO_FEW_PHOTOS };
    revalidatePath("/profile");
    return { status: "success", message: "Your profile is published." };
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: GENERIC_FAILURE };
  }
}

export async function unpublishProfile(
  _previousState: PublishActionState,
  _formData: FormData,
): Promise<PublishActionState> {
  const userId = await getSessionAccountId();
  if (!userId) return { status: "error", message: GENERIC_FAILURE };

  try {
    await getDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
      await tx.profile.update({ where: { userId }, data: { publishedAt: null } });
    }, { timeout: 15_000 });

    revalidatePath("/profile");
    return { status: "success", message: "Your profile is not published." };
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: GENERIC_FAILURE };
  }
}
