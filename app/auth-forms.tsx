"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { useSearchParams } from "next/navigation";

import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
} from "../lib/auth/actions";
import { getAuthNotice, INITIAL_AUTH_ACTION_STATE } from "../lib/auth/action-state";
import type { AuthActionState } from "../lib/auth/action-state";
import { VerifyEmailPanel } from "./verify-email-panel";

type AuthFormKind = "sign-up" | "sign-in" | "forgot-password" | "reset-password";
type AuthField = keyof NonNullable<AuthActionState["fieldErrors"]>;
type NoticeStatus = "error" | "success";

function InlineMessage({
  status,
  children,
  className = "",
  id,
}: {
  status: NoticeStatus;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const isError = status === "error";
  return (
    <p
      id={id}
      className={`flex items-start gap-2 text-sm leading-5 ${isError ? "text-[#b42318]" : "text-[#17663a]"} ${className}`}
      role={isError ? "alert" : "status"}
    >
      {isError ? (
        <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="10" r="7.2" />
          <path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="10" r="7.2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m6.5 10.2 2.3 2.3 4.8-5" />
        </svg>
      )}
      <span>{children}</span>
    </p>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-2 text-sm leading-5 text-[#b42318]">
      <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="7.2" />
        <path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" />
      </svg>
      <span>{message}</span>
    </p>
  );
}

function PasswordField({
  id,
  label,
  name,
  autoComplete,
  error,
  invalid = false,
  describedBy,
  inputRef,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  error?: string;
  invalid?: boolean;
  describedBy?: string;
  inputRef: Ref<HTMLInputElement>;
  onChange: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const buttonLabel = visible ? "Hide password" : "Show password";
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasHint = autoComplete === "new-password" && name === "password";
  const descriptions = [error ? errorId : null, describedBy, hasHint ? hintId : null].filter(Boolean).join(" ");
  const hasError = Boolean(error || invalid);

  return (
    <div>
      <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          autoComplete={autoComplete}
          aria-describedby={descriptions || undefined}
          aria-invalid={hasError}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 pr-14 text-base text-[#28142b] outline-none transition placeholder:text-[#9a8998] focus:ring-4 focus:ring-[#b87aa5]/20 ${hasError ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
          id={id}
          minLength={autoComplete === "new-password" ? 10 : undefined}
          name={name}
          onChange={onChange}
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
      <FieldError id={errorId} message={error} />
      {hasHint && <span id={hintId} className="mt-1 block text-xs font-normal text-[#806e7e]">Use at least 10 characters.</span>}
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
  const [email, setEmail] = useState("");
  const [dismissedState, setDismissedState] = useState<AuthActionState | null>(null);
  const [clearedFieldState, setClearedFieldState] = useState<{
    state: AuthActionState;
    fields: Partial<Record<AuthField, boolean>>;
  } | null>(null);
  const [dismissedFormErrorState, setDismissedFormErrorState] = useState<AuthActionState | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const confirmPasswordInput = useRef<HTMLInputElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const isPasswordReset = kind === "reset-password";
  const isSignUp = kind === "sign-up";
  const isSignIn = kind === "sign-in";
  const isForgotPassword = kind === "forgot-password";
  const clearedFields = clearedFieldState?.state === state ? clearedFieldState.fields : {};
  const showVerificationPanel =
    ((isSignUp && state.status === "success") || (isSignIn && state.status === "needs_verification")) &&
    state.email !== undefined &&
    state !== dismissedState;
  const showSuccessPanel =
    isForgotPassword &&
    state.status === "success" &&
    state.email !== undefined &&
    state !== dismissedState;
  const fieldError = (field: AuthField) =>
    state.status === "error" && !clearedFields[field] ? state.fieldErrors?.[field] : undefined;
  const signInFailure =
    isSignIn && state.status === "error" && !state.fieldErrors && Boolean(state.message) && dismissedFormErrorState !== state;
  const resetFormError =
    isPasswordReset && state.status === "error" && Boolean(state.message) && dismissedFormErrorState !== state;

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.fieldErrors?.email) emailInput.current?.focus();
    else if (state.fieldErrors?.password) passwordInput.current?.focus();
    else if (state.fieldErrors?.confirmPassword) confirmPasswordInput.current?.focus();
    else if (isSignIn && state.message) passwordInput.current?.focus();
  }, [state, isSignIn]);

  useEffect(() => {
    if (showSuccessPanel) successHeading.current?.focus();
  }, [showSuccessPanel]);

  function clearFieldError(field: AuthField) {
    setClearedFieldState((current) => ({
      state,
      fields: { ...(current?.state === state ? current.fields : {}), [field]: true },
    }));
    setDismissedFormErrorState(state);
  }

  function prepareSubmit() {
    setClearedFieldState(null);
    setDismissedFormErrorState(null);
    setDismissedState(null);
  }

  if (showVerificationPanel) {
    const confirmedEmail = state.email ?? email;
    return (
      <VerifyEmailPanel
        email={confirmedEmail}
        notice={isSignIn ? "Your email isn’t confirmed yet. We’ve sent you a new code." : undefined}
        onUseDifferentEmail={() => setDismissedState(state)}
      />
    );
  }

  if (showSuccessPanel && isForgotPassword) {
    const confirmedEmail = state.email ?? email;
    return (
      <section className="mt-8" aria-label="Password reset email sent">
        <h2 ref={successHeading} className="text-2xl font-semibold tracking-tight" tabIndex={-1}>Check your email</h2>
        <p className="mt-3 text-sm leading-6 text-[#6f5b6d]" role="status">
          If an account exists for <strong>{confirmedEmail}</strong>, we’ve sent a link to reset your password. It can take a minute to arrive.
        </p>
        <p className="mt-6 text-center text-sm text-[#806e7e]">
          <Link className="font-semibold text-[#63345d] underline underline-offset-4" href="/sign-in">Back to sign in</Link>
        </p>
      </section>
    );
  }

  const resetRequiresNewLink = state.message === "Use a valid password reset link to continue.";

  return (
    <>
      <form
        action={formAction}
        className="mt-8 space-y-5"
        noValidate
        onSubmit={() => {
          setEmail(email.trim().toLowerCase());
          prepareSubmit();
        }}
      >
        {!isPasswordReset && (
          <div>
            <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor={`${kind}-email`}>Email address</label>
            <input
              ref={emailInput}
              autoComplete="email"
              aria-describedby={fieldError("email") ? `${kind}-email-error` : signInFailure ? "sign-in-failure" : undefined}
              aria-invalid={Boolean(fieldError("email") || signInFailure)}
              className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#28142b] outline-none transition placeholder:text-[#9a8998] focus:ring-4 focus:ring-[#b87aa5]/20 ${fieldError("email") || signInFailure ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
              id={`${kind}-email`}
              name="email"
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                clearFieldError("email");
              }}
              required
              type="email"
              value={email}
            />
            <FieldError id={`${kind}-email-error`} message={fieldError("email")} />
          </div>
        )}
        {!isForgotPassword && (
          <>
            <PasswordField
              id={`${kind}-password`}
              label={isPasswordReset ? "New password" : "Password"}
              name="password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
              error={fieldError("password")}
              invalid={signInFailure}
              describedBy={signInFailure ? "sign-in-failure" : undefined}
              inputRef={passwordInput}
              onChange={() => clearFieldError("password")}
            />
            {(isPasswordReset || isSignUp) && (
              <PasswordField
                id={`${kind}-confirm-password`}
                label={isSignUp ? "Confirm password" : "Confirm new password"}
                name="confirmPassword"
                autoComplete="new-password"
                error={fieldError("confirmPassword")}
                inputRef={confirmPasswordInput}
                onChange={() => clearFieldError("confirmPassword")}
              />
            )}
            {signInFailure && <InlineMessage id="sign-in-failure" status="error">Email or password is incorrect.</InlineMessage>}
          </>
        )}
        {resetFormError && (
          <InlineMessage status="error">
            {state.message}{resetRequiresNewLink && <> <Link className="font-semibold underline underline-offset-4" href="/forgot-password">Request a new link</Link></>}
          </InlineMessage>
        )}
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Please wait…" : isSignUp ? "Create account" : isSignIn ? "Sign in" : isForgotPassword ? "Send reset link" : "Update password"}
        </button>
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
    <InlineMessage status={notice.status} className="mt-4">
      {notice.message}
    </InlineMessage>
  );
}
