"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthActionState } from "./action-state";
import { createSupabaseServerClient } from "../supabase/server";

const SIGN_IN_FAILURE: AuthActionState = {
  status: "error",
  message: "Email or password is incorrect.",
};

const SIGN_UP_CONFIRMATION: AuthActionState = {
  status: "success",
  message: "If you can sign up with this email, check your email for a confirmation link.",
};

const PASSWORD_RESET_CONFIRMATION: AuthActionState = {
  status: "success",
  message: "If an account exists for that email, a password reset link is on its way.",
};

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getAppOrigin(): Promise<string | null> {
  try {
    const origin = (await headers()).get("origin");
    if (!origin) {
      return null;
    }

    const parsed = new URL(origin);
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || parsed.origin !== origin) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function confirmationUrl(origin: string, next?: string): string {
  const url = new URL("/auth/confirm", origin);
  if (next) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (password.length < 10) {
    return { status: "error", message: "Password must be at least 10 characters." };
  }

  const origin = await getAppOrigin();
  if (!origin) {
    return SIGN_UP_CONFIRMATION;
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: confirmationUrl(origin) },
    });
  } catch {
    // Keep the confirmation response identical for existing and new addresses.
  }

  return SIGN_UP_CONFIRMATION;
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");

  if (!isValidEmail(email) || password.length === 0) {
    return SIGN_IN_FAILURE;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      return SIGN_IN_FAILURE;
    }
  } catch {
    return SIGN_IN_FAILURE;
  }

  redirect("/discover");
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Never expose provider errors from a sign-out action.
  }

  redirect("/sign-in");
}

export async function requestPasswordReset(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  if (!isValidEmail(email)) {
    return PASSWORD_RESET_CONFIRMATION;
  }

  const origin = await getAppOrigin();
  if (!origin) {
    return PASSWORD_RESET_CONFIRMATION;
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: confirmationUrl(origin, "/reset-password"),
    });
  } catch {
    // Always return the same message whether or not the address has an account.
  }

  return PASSWORD_RESET_CONFIRMATION;
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readText(formData, "password");
  if (password.length < 10) {
    return { status: "error", message: "Password must be at least 10 characters." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { status: "error", message: "Use a valid password reset link to continue." };
    }

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const amr = (claimsData?.claims as { amr?: unknown } | undefined)?.amr;
    const isRecoverySession =
      Array.isArray(amr) &&
      amr.some(
        (method) =>
          typeof method === "object" &&
          method !== null &&
          "method" in method &&
          method.method === "recovery",
      );

    if (claimsError || !isRecoverySession) {
      return { status: "error", message: "Use a valid password reset link to continue." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { status: "error", message: "Your password could not be updated. Try again." };
    }
  } catch {
    return { status: "error", message: "Your password could not be updated. Try again." };
  }

  return { status: "success", message: "Your password has been updated." };
}
