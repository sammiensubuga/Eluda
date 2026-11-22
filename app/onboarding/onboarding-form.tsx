"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { FieldError } from "../auth-forms";
import { completeOnboarding } from "../../lib/onboarding/actions";
import { INITIAL_ONBOARDING_STATE } from "../../lib/onboarding/state";
import type { OnboardingState, OnboardingValues } from "../../lib/onboarding/state";
import type { OnboardingFieldErrors } from "../../lib/onboarding/validation";

type OnboardingField = keyof OnboardingFieldErrors;

const intentOptions = [
  ["MEETUPS", "Meetups"],
  ["DATING", "Dating"],
  ["MARRIAGE", "Marriage"],
  ["FRIENDS", "Make New Friends"],
] as const;

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboarding, INITIAL_ONBOARDING_STATE);
  const [localInput, setLocalInput] = useState<{
    state: OnboardingState;
    values: OnboardingValues;
  } | null>(null);
  const [clearedErrorState, setClearedErrorState] = useState<{
    state: OnboardingState;
    fields: Partial<Record<OnboardingField, boolean>>;
  } | null>(null);
  const [dismissedFormErrorState, setDismissedFormErrorState] = useState<OnboardingState | null>(null);
  const genderInput = useRef<HTMLInputElement>(null);
  const dateOfBirthInput = useRef<HTMLInputElement>(null);
  const displayNameInput = useRef<HTMLInputElement>(null);
  const intentInput = useRef<HTMLInputElement>(null);
  const values = localInput?.state === state ? localInput.values : state.values ?? {};
  const clearedErrors = clearedErrorState?.state === state ? clearedErrorState.fields : {};
  const fieldError = (field: OnboardingField) =>
    state.status === "error" && !clearedErrors[field] ? state.fieldErrors?.[field] : undefined;
  const formError = state.status === "error" && state.message && dismissedFormErrorState !== state;

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.fieldErrors?.gender) genderInput.current?.focus();
    else if (state.fieldErrors?.dateOfBirth) dateOfBirthInput.current?.focus();
    else if (state.fieldErrors?.displayName) displayNameInput.current?.focus();
    else if (state.fieldErrors?.intent) intentInput.current?.focus();
  }, [state]);

  function updateField(field: OnboardingField, value: string) {
    setLocalInput((current) => ({
      state,
      values: { ...(current?.state === state ? current.values : values), [field]: value },
    }));
    setClearedErrorState((current) => ({
      state,
      fields: { ...(current?.state === state ? current.fields : {}), [field]: true },
    }));
    setDismissedFormErrorState(state);
  }

  return (
    <form action={formAction} className="mt-8 space-y-6" noValidate>
      <fieldset aria-describedby={fieldError("gender") ? "onboarding-gender-error" : undefined} className="min-w-0">
        <legend className="text-sm font-medium text-[#4c3a4c]">I am</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {([["FEMALE", "Female"], ["MALE", "Male"]] as const).map(([value, label], index) => (
            <label
              key={value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium text-[#28142b] focus-within:ring-4 focus-within:ring-[#b87aa5]/20 ${fieldError("gender") ? "border-[#b42318]" : "border-[#dfd1d9]"}`}
            >
              <input
                ref={index === 0 ? genderInput : undefined}
                aria-describedby={fieldError("gender") ? "onboarding-gender-error" : undefined}
                checked={values.gender === value}
                className="h-4 w-4 accent-[#63345d]"
                name="gender"
                onChange={() => updateField("gender", value)}
                type="radio"
                value={value}
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError id="onboarding-gender-error" message={fieldError("gender")} />
        <p className="mt-1.5 text-xs text-[#806e7e]">You can’t change this later.</p>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor="onboarding-date-of-birth">Date of birth</label>
        <input
          ref={dateOfBirthInput}
          autoComplete="bday"
          aria-describedby={fieldError("dateOfBirth") ? "onboarding-date-of-birth-error" : undefined}
          aria-invalid={Boolean(fieldError("dateOfBirth"))}
          className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#28142b] outline-none transition focus:ring-4 focus:ring-[#b87aa5]/20 ${fieldError("dateOfBirth") ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
          id="onboarding-date-of-birth"
          name="dateOfBirth"
          onChange={(event) => updateField("dateOfBirth", event.currentTarget.value)}
          type="date"
          value={values.dateOfBirth ?? ""}
        />
        <FieldError id="onboarding-date-of-birth-error" message={fieldError("dateOfBirth")} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor="onboarding-display-name">Display name</label>
        <input
          ref={displayNameInput}
          autoComplete="nickname"
          aria-describedby={fieldError("displayName") ? "onboarding-display-name-error" : "onboarding-display-name-hint"}
          aria-invalid={Boolean(fieldError("displayName"))}
          className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#28142b] outline-none transition placeholder:text-[#9a8998] focus:ring-4 focus:ring-[#b87aa5]/20 ${fieldError("displayName") ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
          id="onboarding-display-name"
          name="displayName"
          onChange={(event) => updateField("displayName", event.currentTarget.value)}
          type="text"
          value={values.displayName ?? ""}
        />
        <FieldError id="onboarding-display-name-error" message={fieldError("displayName")} />
        <p id="onboarding-display-name-hint" className="mt-1.5 text-xs text-[#806e7e]">2 to 30 characters. Letters, spaces, hyphens and apostrophes.</p>
      </div>

      <fieldset aria-describedby={fieldError("intent") ? "onboarding-intent-error" : undefined} className="min-w-0">
        <legend className="text-sm font-medium text-[#4c3a4c]">What are you looking for?</legend>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {intentOptions.map(([value, label], index) => (
            <label
              key={value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium text-[#28142b] focus-within:ring-4 focus-within:ring-[#b87aa5]/20 ${fieldError("intent") ? "border-[#b42318]" : "border-[#dfd1d9]"}`}
            >
              <input
                ref={index === 0 ? intentInput : undefined}
                aria-describedby={fieldError("intent") ? "onboarding-intent-error" : undefined}
                checked={values.intent === value}
                className="h-4 w-4 accent-[#63345d]"
                name="intent"
                onChange={() => updateField("intent", value)}
                type="radio"
                value={value}
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError id="onboarding-intent-error" message={fieldError("intent")} />
        <p className="mt-1.5 text-xs text-[#806e7e]">You can change this any time.</p>
      </fieldset>

      {formError && <p className="text-sm leading-5 text-[#b42318]" role="alert">{formError}</p>}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : "Continue"}
      </button>
    </form>
  );
}
