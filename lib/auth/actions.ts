"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthActionState } from "./action-state";
import { createSupabaseServerClient } from "../supabase/server";
import { isRecentLinkSession } from "./recovery-session";

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

const RESEND_CONFIRMATION: AuthActionState = {
  status: "success",
  message: "If a confirmation is pending for this address, we’ve sent a new link.",
};

function withEmail(state: AuthActionState, email: string): AuthActionState {
  return { ...state, email };
}

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
  const confirmPassword = readText(formData, "confirmPassword");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address.", email };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match.", email };
  }

  if (password.length < 10) {
    return { status: "error", message: "Password must be at least 10 characters.", email };
  }

  const origin = await getAppOrigin();
  if (!origin) {
    return withEmail(SIGN_UP_CONFIRMATION, email);
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

  return withEmail(SIGN_UP_CONFIRMATION, email);
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");

  if (!isValidEmail(email) || password.length === 0) {
    return withEmail(SIGN_IN_FAILURE, email);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      return withEmail(SIGN_IN_FAILURE, email);
    }
  } catch {
    return withEmail(SIGN_IN_FAILURE, email);
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
    return withEmail(PASSWORD_RESET_CONFIRMATION, email);
  }

  const origin = await getAppOrigin();
  if (!origin) {
    return withEmail(PASSWORD_RESET_CONFIRMATION, email);
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: confirmationUrl(origin) });
  } catch {
    // Always return the same message whether or not the address has an account.
  }

  return withEmail(PASSWORD_RESET_CONFIRMATION, email);
}

export async function resendConfirmation(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  if (!isValidEmail(email)) {
    return withEmail(RESEND_CONFIRMATION, email);
  }

  const origin = await getAppOrigin();
  if (!origin) {
    return withEmail(RESEND_CONFIRMATION, email);
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmationUrl(origin) },
    });
  } catch {
    // Keep the same response for pending, unknown and failed addresses.
  }

  return withEmail(RESEND_CONFIRMATION, email);
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");
  const email = readText(formData, "email").toLowerCase();
  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match.", email };
  }

  if (password.length < 10) {
    return { status: "error", message: "Password must be at least 10 characters.", email };
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return { status: "error", message: "Your password could not be updated. Try again.", email };
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.warn({ reason: "no_user" });
      return { status: "error", message: "Use a valid password reset link to continue.", email };
    }

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const amr = (claimsData?.claims as { amr?: unknown } | undefined)?.amr;

    if (claimsError) {
      console.warn({ reason: "claims_error" });
      return { status: "error", message: "Use a valid password reset link to continue.", email };
    }

    if (!isRecentLinkSession(amr, Math.floor(Date.now() / 1000))) {
      const methods = Array.isArray(amr)
        ? amr.flatMap((entry: unknown) => {
            if (typeof entry !== "object" || entry === null) return [];
            const method = (entry as { method?: unknown }).method;
            return typeof method === "string" ? [method] : [];
          })
        : [];
      console.warn({ reason: "not_recent_link_session", methods });
      return { status: "error", message: "Use a valid password reset link to continue.", email };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { status: "error", message: "Your password could not be updated. Try again.", email };
    }
  } catch {
    return { status: "error", message: "Your password could not be updated. Try again.", email };
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // The password has already changed; sign-out is best effort.
  }

  redirect("/sign-in?notice=password-updated");
}
