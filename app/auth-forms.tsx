"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
} from "../lib/auth/actions";
import { INITIAL_AUTH_ACTION_STATE } from "../lib/auth/action-state";

type AuthFormKind = "sign-up" | "sign-in" | "forgot-password" | "reset-password";

export function AuthForm({ kind }: { kind: AuthFormKind }) {
  const action =
    kind === "sign-up"
      ? signUp
      : kind === "sign-in"
        ? signIn
        : kind === "forgot-password"
          ? requestPasswordReset
          : updatePassword;
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_ACTION_STATE);
  const isPasswordReset = kind === "reset-password";
  const isSignUp = kind === "sign-up";
  const isSignIn = kind === "sign-in";
  const isForgotPassword = kind === "forgot-password";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {!isPasswordReset && (
        <label className="block text-sm font-medium text-[#4c3a4c]">
          Email address
          <input
            autoComplete="email"
            className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd1d9] bg-white px-4 text-base text-[#28142b] outline-none transition placeholder:text-[#9a8998] focus:border-[#9a527d] focus:ring-4 focus:ring-[#b87aa5]/20"
            name="email"
            required
            type="email"
          />
        </label>
      )}
      {!isForgotPassword && (
        <label className="block text-sm font-medium text-[#4c3a4c]">
          {isPasswordReset ? "New password" : "Password"}
          <input
            autoComplete={isPasswordReset || isSignUp ? "new-password" : "current-password"}
            className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd1d9] bg-white px-4 text-base text-[#28142b] outline-none transition focus:border-[#9a527d] focus:ring-4 focus:ring-[#b87aa5]/20"
            minLength={10}
            name="password"
            required
            type="password"
          />
          {(isPasswordReset || isSignUp) && (
            <span className="mt-1 block text-xs font-normal text-[#806e7e]">Use at least 10 characters.</span>
          )}
        </label>
      )}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : isSignUp ? "Create account" : isSignIn ? "Sign in" : isForgotPassword ? "Send reset link" : "Update password"}
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-[#63345d]" role="status">
        {state.message}
      </p>
      {isSignIn && (
        <p className="text-center text-sm text-[#806e7e]"><Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/forgot-password">Forgot password?</Link></p>
      )}
    </form>
  );
}

export function AuthLinks({ kind }: { kind: AuthFormKind }) {
  if (kind === "sign-up") {
    return <p className="mt-6 text-center text-sm text-[#806e7e]">Already have an account? <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Sign in</Link></p>;
  }
  if (kind === "sign-in") {
    return <p className="mt-6 text-center text-sm text-[#806e7e]">New to Eluda? <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-up">Create an account</Link></p>;
  }
  return <p className="mt-6 text-center text-sm text-[#806e7e]"><Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Back to sign in</Link></p>;
}
