"use server";

import { redirect } from "next/navigation";

import { getDb } from "../db";
import { createSupabaseServerClient } from "../supabase/server";
import { deleteAuthUser } from "../supabase/admin";
import type { OnboardingState, OnboardingValues } from "./state";
import { kampalaToday, validateOnboarding } from "./validation";

function readValues(formData: FormData): OnboardingValues {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    gender: read("gender"),
    dateOfBirth: read("dateOfBirth"),
    displayName: read("displayName"),
    intent: read("intent"),
  };
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const values = readValues(formData);
  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  const sessionUser = userError ? null : data.user;
  if (!sessionUser) redirect("/sign-in");

  const existing = await getDb().user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, deletedAt: true },
  });

  if (existing?.deletedAt) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue to the sign-in page even if session cleanup fails.
    }
    redirect("/sign-in");
  }
  if (existing) redirect("/discover");

  const validated = validateOnboarding(
    {
      gender: values.gender ?? "",
      dateOfBirth: values.dateOfBirth ?? "",
      displayName: values.displayName ?? "",
      intent: values.intent ?? "",
    },
    kampalaToday(new Date()),
  );
  if (Object.keys(validated.fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors: validated.fieldErrors, values };
  }

  if (!validated.gender || !validated.birth || !validated.displayName || !validated.intent) {
    return { status: "error", message: "", fieldErrors: validated.fieldErrors, values };
  }

  if (validated.birth.age < 18) {
    try {
      await deleteAuthUser(sessionUser.id);
    } catch {
      // Auth deletion is best effort; always try to end the current session.
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue to the fixed under-18 notice even if session cleanup fails.
    }
    redirect("/sign-in?notice=under-18");
  }

  let duplicateSubmission = false;
  try {
    await getDb().user.create({
      data: {
        id: sessionUser.id,
        gender: validated.gender,
        dateOfBirth: new Date(Date.UTC(
          validated.birth.date.year,
          validated.birth.date.month - 1,
          validated.birth.date.day,
        )),
        displayName: validated.displayName,
        profile: {
          create: {
            intent: validated.intent,
            availability: validated.gender === "FEMALE" ? "AVAILABLE" : null,
          },
        },
      },
    });
  } catch (createError) {
    const code = errorCode(createError);
    if (code === "P2002") {
      duplicateSubmission = true;
    } else {
      console.error("Onboarding save failed:", code ?? "unknown");
      return { status: "error", message: "We couldn’t save your details. Try again.", values };
    }
  }

  if (duplicateSubmission) redirect("/discover");
  redirect("/discover");
}
