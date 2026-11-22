"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "../db";
import { validateDisplayName } from "../onboarding/validation";
import { createSupabaseServerClient } from "../supabase/server";

type ProfileIntent = "MEETUPS" | "DATING" | "MARRIAGE" | "FRIENDS";
type ProfileAvailability = "AVAILABLE" | "BUSY" | "HIDDEN";

export type ProfileValues = {
  displayName?: string;
  intent?: string;
  availability?: string;
};

export type ProfileFieldErrors = Partial<Record<keyof ProfileValues, string>>;

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: ProfileFieldErrors;
  values?: ProfileValues;
};

const SAVE_FAILURE = "We couldn’t save your changes. Try again.";
const intents = new Set<string>(["MEETUPS", "DATING", "MARRIAGE", "FRIENDS"]);
const availabilities = new Set<string>(["AVAILABLE", "BUSY", "HIDDEN"]);

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  return typeof error.code === "string" ? error.code : "unknown";
}

function logDatabaseError(error: unknown) {
  console.error(errorCode(error));
}

function isIntent(value: string): value is ProfileIntent {
  return intents.has(value);
}

function isAvailability(value: string): value is ProfileAvailability {
  return availabilities.has(value);
}

export async function updateProfileBasics(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const values: ProfileValues = {
    displayName: readText(formData, "displayName"),
    intent: readText(formData, "intent"),
  };
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) redirect("/sign-in");

  let account: { id: string; deletedAt: Date | null } | null;
  try {
    account = await getDb().user.findUnique({
      where: { id: data.user.id },
      select: { id: true, deletedAt: true },
    });
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: SAVE_FAILURE, values };
  }
  if (!account) redirect("/onboarding");
  if (account.deletedAt) redirect("/sign-in");

  const displayName = validateDisplayName(values.displayName ?? "");
  const fieldErrors: ProfileFieldErrors = {};
  if (displayName.error) fieldErrors.displayName = displayName.error;
  if (!isIntent(values.intent ?? "")) fieldErrors.intent = "Choose what you’re looking for.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors, values };
  }

  try {
    await getDb().user.update({
      where: { id: data.user.id },
      data: {
        displayName: displayName.value,
        profile: { update: { intent: values.intent as ProfileIntent } },
      },
    });
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: SAVE_FAILURE, values };
  }

  revalidatePath("/profile");
  return {
    status: "success",
    message: "Saved.",
    values: { displayName: displayName.value, intent: values.intent },
  };
}

export async function updateAvailability(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const availability = readText(formData, "availability");
  const values: ProfileValues = { availability };
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) redirect("/sign-in");

  let account: { id: string; deletedAt: Date | null; gender: "FEMALE" | "MALE" } | null;
  try {
    account = await getDb().user.findUnique({
      where: { id: data.user.id },
      select: { id: true, deletedAt: true, gender: true },
    });
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: SAVE_FAILURE, values };
  }
  if (!account) redirect("/onboarding");
  if (account.deletedAt) redirect("/sign-in");
  if (account.gender === "MALE") return { status: "error", message: SAVE_FAILURE, values };

  if (!isAvailability(availability)) {
    return {
      status: "error",
      message: "",
      fieldErrors: { availability: "Choose an availability option." },
      values,
    };
  }

  try {
    await getDb().profile.update({
      where: { userId: data.user.id },
      data: { availability },
    });
  } catch (error) {
    logDatabaseError(error);
    return { status: "error", message: SAVE_FAILURE, values };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Saved.", values: { availability } };
}
