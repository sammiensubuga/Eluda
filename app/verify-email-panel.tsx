"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { resendConfirmation, verifySignUpCode } from "../lib/auth/actions";
import { INITIAL_AUTH_ACTION_STATE } from "../lib/auth/action-state";

export function VerifyEmailPanel({
  email,
  notice,
  onUseDifferentEmail,
}: {
  email: string;
  notice?: string;
  onUseDifferentEmail: () => void;
}) {
  const [state, formAction, pending] = useActionState(verifySignUpCode, INITIAL_AUTH_ACTION_STATE);
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmation, INITIAL_AUTH_ACTION_STATE);
  const [countdown, setCountdown] = useState(60);
  const [code, setCode] = useState("");
  const [dismissedCodeError, setDismissedCodeError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const codeError = state.status === "error" && !dismissedCodeError ? state.fieldErrors?.code : undefined;

  useEffect(() => {
    heading.current?.focus();
  }, []);

  useEffect(() => {
    if (codeError) codeInput.current?.focus();
  }, [codeError]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => {
      setCountdown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  return (
    <section className="mt-8" aria-label="Confirm your email address">
      <h2 ref={heading} className="text-2xl font-semibold tracking-tight" tabIndex={-1}>Check your email</h2>
      <p className="mt-3 text-sm leading-6 text-[#6f5b6d]" role="status">
        We’ve sent a code to <strong>{email}</strong>. Enter it below to confirm your email. If you don’t see it in your inbox, check your spam folder.
      </p>
      {notice && <p className="mt-3 text-sm leading-6 text-[#806e7e]">{notice}</p>}

      <form
        action={formAction}
        className="mt-6 space-y-5"
        noValidate
        onSubmit={() => setDismissedCodeError(false)}
      >
        <input name="email" type="hidden" value={email} />
        <div>
          <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor="confirmation-code">Confirmation code</label>
          <input
            ref={codeInput}
            autoComplete="one-time-code"
            aria-describedby={codeError ? "confirmation-code-error" : undefined}
            aria-invalid={Boolean(codeError)}
            className={`mt-2 min-h-14 w-full rounded-xl border bg-white px-4 text-center font-mono text-2xl tracking-[0.35em] text-[#28142b] outline-none transition focus:ring-4 focus:ring-[#b87aa5]/20 ${codeError ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
            id="confirmation-code"
            inputMode="numeric"
            maxLength={12}
            name="code"
            onChange={(event) => {
              setCode(event.currentTarget.value);
              setDismissedCodeError(true);
            }}
            required
            type="text"
            value={code}
          />
          {codeError && (
            <p id="confirmation-code-error" className="mt-1.5 flex items-start gap-2 text-sm leading-5 text-[#b42318]" role="alert">
              <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10" cy="10" r="7.2" />
                <path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" />
              </svg>
              <span>{codeError}</span>
            </p>
          )}
        </div>
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Checking…" : "Confirm email"}
        </button>
      </form>

      <form
        action={resendAction}
        className="mt-5"
        noValidate
        onSubmit={() => setCountdown(60)}
      >
        <input name="email" type="hidden" value={email} />
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#4a2148]/25 px-6 font-semibold text-[#4a2148] transition hover:bg-[#fbf6f0] disabled:cursor-wait disabled:opacity-60"
          disabled={countdown > 0 || resendPending}
          type="submit"
        >
          Resend email
        </button>
        <p className="mt-1.5 min-h-5 text-sm text-[#806e7e]" aria-live="polite">
          {resendPending ? "Sending…" : resendState.status === "success" ? "If a confirmation is pending for this address, we’ve sent a new code." : ""}
        </p>
        <p className="min-h-5 text-sm text-[#806e7e]" aria-live="polite">
          {countdown > 0 ? `Resend in ${countdown}s` : ""}
        </p>
      </form>

      <button
        className="mt-3 min-h-11 w-full rounded-full px-4 text-sm font-semibold text-[#63345d] underline underline-offset-4 hover:bg-[#fbf6f0]"
        onClick={onUseDifferentEmail}
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
