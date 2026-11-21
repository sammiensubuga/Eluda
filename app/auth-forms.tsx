"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signUp,
  updatePassword,
} from "../lib/auth/actions";
import { getAuthNotice, INITIAL_AUTH_ACTION_STATE } from "../lib/auth/action-state";
import type { AuthActionState } from "../lib/auth/action-state";

type AuthFormKind = "sign-up" | "sign-in" | "forgot-password" | "reset-password";

function Feedback({ status, message }: { status: "error" | "success"; message: string }) {
  if (!message) return null;

  const error = status === "error";
  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${
        error
          ? "border-rose-300 bg-rose-50 text-rose-900"
          : "border-[#c6ddcf] bg-[#f0f7f2] text-[#28523a]"
      }`}
      role={error ? "alert" : "status"}
    >
      {message}
    </div>
  );
}

function PasswordField({
  id,
  label,
  name,
  autoComplete,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const buttonLabel = visible ? "Hide password" : "Show password";

  return (
    <div>
      <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-[#dfd1d9] bg-white px-4 pr-14 text-base text-[#28142b] outline-none transition focus:border-[#9a527d] focus:ring-4 focus:ring-[#b87aa5]/20"
          id={id}
          minLength={autoComplete === "new-password" ? 10 : undefined}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={buttonLabel}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#63345d] hover:bg-[#f7eff4] focus:outline-none focus:ring-2 focus:ring-[#9a527d]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.4 9.5 7-.4 1.1-1.2 2.3-2.3 3.4M6.2 6.2C4.4 7.5 3.2 9.4 2.5 12c1 2.6 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {autoComplete === "new-password" && name === "password" && (
        <span className="mt-1 block text-xs font-normal text-[#806e7e]">Use at least 10 characters.</span>
      )}
    </div>
  );
}

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
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmation, INITIAL_AUTH_ACTION_STATE);
  const [email, setEmail] = useState("");
  const [dismissedState, setDismissedState] = useState<AuthActionState | null>(null);
  const [countdown, setCountdown] = useState(60);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const isPasswordReset = kind === "reset-password";
  const isSignUp = kind === "sign-up";
  const isSignIn = kind === "sign-in";
  const isForgotPassword = kind === "forgot-password";
  const showSuccessPanel =
    (isSignUp || isForgotPassword) &&
    state.status === "success" &&
    state.email !== undefined &&
    state !== dismissedState;
  const showActionFeedback = state !== dismissedState;

  useEffect(() => {
    if (showSuccessPanel) successHeading.current?.focus();
  }, [showSuccessPanel]);

  useEffect(() => {
    if (!showSuccessPanel || !isSignUp || countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showSuccessPanel, isSignUp, countdown]);

  if (showSuccessPanel && (isSignUp || isForgotPassword)) {
    const confirmedEmail = state.email ?? email;
    if (isSignUp) {
      return (
        <section className="mt-8" aria-label="Confirmation email sent">
          <h2 ref={successHeading} className="text-2xl font-semibold tracking-tight" tabIndex={-1}>Check your email</h2>
          <p className="mt-3 text-sm leading-6 text-[#6f5b6d]" role="status">
            We’ve sent a confirmation link to <strong>{confirmedEmail}</strong>. Tap the link to confirm your email. If you don’t see it in your inbox, check your spam folder.
          </p>
          <form
            action={resendAction}
            className="mt-6"
            onSubmit={() => setCountdown(60)}
          >
            <input name="email" type="hidden" value={confirmedEmail} />
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#4a2148]/25 px-6 font-semibold text-[#4a2148] transition hover:bg-[#fbf6f0] disabled:cursor-wait disabled:opacity-60"
              disabled={countdown > 0 || resendPending}
              type="submit"
            >
              Resend email
            </button>
            <p className="mt-2 text-center text-sm text-[#806e7e]" aria-live="polite">
              {countdown > 0 ? `Resend in ${countdown}s` : resendPending ? "Sending…" : ""}
            </p>
            <p className="mt-2 min-h-6 text-center text-sm text-[#63345d]" aria-live="polite">
              {resendState.message}
            </p>
          </form>
          <button
            className="mt-3 min-h-11 w-full rounded-full px-4 text-sm font-semibold text-[#63345d] underline underline-offset-4 hover:bg-[#fbf6f0]"
            onClick={() => setDismissedState(state)}
            type="button"
          >
            Use a different email
          </button>
          <p className="mt-4 text-center text-sm text-[#806e7e]">
            Already confirmed? <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Sign in</Link>
          </p>
        </section>
      );
    }

    return (
      <section className="mt-8" aria-label="Password reset email sent">
        <h2 ref={successHeading} className="text-2xl font-semibold tracking-tight" tabIndex={-1}>Check your email</h2>
        <p className="mt-3 text-sm leading-6 text-[#6f5b6d]" role="status">
          If an account exists for <strong>{confirmedEmail}</strong>, we’ve sent a link to reset your password.
        </p>
        <p className="mt-6 text-center text-sm text-[#806e7e]">
          <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Back to sign in</Link>
        </p>
      </section>
    );
  }

  return (
    <>
      <form
        action={formAction}
        className="mt-8 space-y-5"
        onSubmit={() => {
          setEmail(email.trim().toLowerCase());
          if (isSignUp) setCountdown(60);
        }}
      >
        {!isPasswordReset && (
          <div>
            <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor={`${kind}-email`}>Email address</label>
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd1d9] bg-white px-4 text-base text-[#28142b] outline-none transition placeholder:text-[#9a8998] focus:border-[#9a527d] focus:ring-4 focus:ring-[#b87aa5]/20"
              id={`${kind}-email`}
              name="email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email}
            />
          </div>
        )}
        {!isForgotPassword && (
          <>
            <PasswordField
              id={`${kind}-password`}
              label={isPasswordReset ? "New password" : "Password"}
              name="password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
            />
            {(isPasswordReset || isSignUp) && (
              <PasswordField
                id={`${kind}-confirm-password`}
                label={isSignUp ? "Confirm password" : "Confirm new password"}
                name="confirmPassword"
                autoComplete="new-password"
              />
            )}
          </>
        )}
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Please wait…" : isSignUp ? "Create account" : isSignIn ? "Sign in" : isForgotPassword ? "Send reset link" : "Update password"}
        </button>
        {showActionFeedback && state.status === "error" && <Feedback status="error" message={state.message} />}
        {showActionFeedback && state.status === "success" && state.message && <Feedback status="success" message={state.message} />}
      </form>
      {isSignIn && <p className="mt-5 text-center text-sm text-[#806e7e]"><Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/forgot-password">Forgot password?</Link></p>}
      {isSignIn && <p className="mt-6 text-center text-sm text-[#806e7e]">New to Eluda? <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-up">Create an account</Link></p>}
      {isSignUp && <p className="mt-6 text-center text-sm text-[#806e7e]">Already have an account? <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Sign in</Link></p>}
      {(isForgotPassword || isPasswordReset) && <p className="mt-6 text-center text-sm text-[#806e7e]"><Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Back to sign in</Link></p>}
    </>
  );
}

export function SignInNotice() {
  const searchParams = useSearchParams();
  const notice = getAuthNotice(searchParams.get("error")) ?? getAuthNotice(searchParams.get("notice"));
  if (!notice) return null;

  return (
    <div className="mb-6">
      <Feedback status={notice.status} message={notice.message} />
    </div>
  );
}
