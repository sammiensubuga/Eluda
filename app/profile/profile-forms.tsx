"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { FieldError } from "../auth-forms";
import { updateAvailability, updateProfileBasics } from "../../lib/profile/actions";
import type { ProfileActionState } from "../../lib/profile/actions";
import type { OwnProfile } from "../../lib/profile/queries";
import { isProfileFormDirty, type ProfileFormValues } from "./profile-copy";

const intentOptions = [
  ["MEETUPS", "Meetups"],
  ["DATING", "Dating"],
  ["MARRIAGE", "Marriage"],
  ["FRIENDS", "Make New Friends"],
] as const;

const availabilityOptions = [
  ["AVAILABLE", "Available"],
  ["BUSY", "Busy"],
  ["HIDDEN", "Hidden"],
] as const;

const INITIAL_PROFILE_STATE: ProfileActionState = { status: "idle", message: "" };

function formData(values: Record<string, string>): FormData {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}

function InlineResult({ result }: { result: ProfileActionState | null }) {
  if (!result?.message) return null;
  const isError = result.status === "error";
  return (
    <p className={`flex items-start gap-2 text-sm leading-5 ${isError ? "text-error" : "text-success"}`} role={isError ? "alert" : "status"}>
      <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
        {isError ? <><circle cx="10" cy="10" r="7.2" /><path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" /></> : <><circle cx="10" cy="10" r="7.2" /><path strokeLinecap="round" strokeLinejoin="round" d="m6.5 10.2 2.3 2.3 4.8-5" /></>}
      </svg>
      <span>{result.message}</span>
    </p>
  );
}

export function ProfileForms({ profile, children }: { profile: OwnProfile; children?: ReactNode }) {
  const router = useRouter();
  const initial: ProfileFormValues = {
    displayName: profile.displayName,
    intent: profile.intent,
    availability: profile.gender === "FEMALE" ? profile.availability : null,
  };
  const [baseline, setBaseline] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [basicsResult, setBasicsResult] = useState<ProfileActionState | null>(null);
  const [availabilityResult, setAvailabilityResult] = useState<ProfileActionState | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const displayNameRef = useRef<HTMLInputElement>(null);
  const firstIntentRef = useRef<HTMLInputElement>(null);
  const firstAvailabilityRef = useRef<HTMLInputElement>(null);
  const basicsFieldErrors = basicsResult?.fieldErrors;
  const availabilityFieldError = availabilityResult?.fieldErrors?.availability;
  const dirty = isProfileFormDirty(baseline, draft);
  const basicsDirty = baseline.displayName.trim() !== draft.displayName.trim() || baseline.intent !== draft.intent;
  const availabilityDirty = baseline.availability !== draft.availability;

  useEffect(() => {
    if (basicsFieldErrors?.displayName) displayNameRef.current?.focus();
    else if (basicsFieldErrors?.intent) firstIntentRef.current?.focus();
  }, [basicsFieldErrors]);

  useEffect(() => {
    if (availabilityFieldError) firstAvailabilityRef.current?.focus();
  }, [availabilityFieldError]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || pending) return;
    const saveBasics = basicsDirty;
    const saveAvailability = availabilityDirty && profile.gender === "FEMALE";
    setBasicsResult(null);
    setAvailabilityResult(null);
    setSaved(false);

    startTransition(async () => {
      const results = await Promise.all([
        saveBasics
          ? updateProfileBasics(INITIAL_PROFILE_STATE, formData({ displayName: draft.displayName, intent: draft.intent }))
          : Promise.resolve(null),
        saveAvailability && draft.availability
          ? updateAvailability(INITIAL_PROFILE_STATE, formData({ availability: draft.availability }))
          : Promise.resolve(null),
      ]);
      const [nextBasics, nextAvailability] = results;
      if (nextBasics) setBasicsResult(nextBasics);
      if (nextAvailability) setAvailabilityResult(nextAvailability);

      if (nextBasics?.status === "success") {
        const savedName = nextBasics.values?.displayName ?? draft.displayName.trim();
        const savedIntent = nextBasics.values?.intent ?? draft.intent;
        setBaseline((current) => ({ ...current, displayName: savedName, intent: savedIntent }));
        setDraft((current) => ({ ...current, displayName: savedName, intent: savedIntent }));
      }
      if (nextAvailability?.status === "success" && nextAvailability.values?.availability) {
        const availability = nextAvailability.values.availability as ProfileFormValues["availability"];
        setBaseline((current) => ({ ...current, availability }));
        setDraft((current) => ({ ...current, availability }));
      }

      const everyRequestedSaveSucceeded = (!saveBasics || nextBasics?.status === "success") &&
        (!saveAvailability || nextAvailability?.status === "success");
      setSaved(everyRequestedSaveSucceeded);
      if (nextBasics?.status === "success" || nextAvailability?.status === "success") router.refresh();
    });
  }

  function updateDraft(next: Partial<ProfileFormValues>) {
    setDraft((current) => ({ ...current, ...next }));
    setBasicsResult(null);
    setAvailabilityResult(null);
    setSaved(false);
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {profile.gender === "FEMALE" && (
        <section aria-labelledby="availability-heading" className="rounded-3xl border border-line/70 bg-white p-5 shadow-[0_8px_28px_rgba(40,20,43,0.04)] sm:p-6">
          <h2 className="text-lg font-semibold text-ink" id="availability-heading">Availability</h2>
          <fieldset aria-describedby={availabilityFieldError ? "profile-availability-error" : "availability-helper"} className="mt-3 min-w-0">
            <legend className="sr-only">Choose your availability</legend>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-ivory p-1">
              {availabilityOptions.map(([value, label], index) => (
                <label className="min-w-0 cursor-pointer" key={value}>
                  <input
                    ref={index === 0 ? firstAvailabilityRef : undefined}
                    aria-describedby={availabilityFieldError ? "profile-availability-error" : "availability-helper"}
                    aria-invalid={Boolean(availabilityFieldError)}
                    checked={draft.availability === value}
                    className="peer sr-only"
                    name="availability"
                    onChange={() => updateDraft({ availability: value })}
                    type="radio"
                    value={value}
                  />
                  <span className="flex min-h-11 items-center justify-center rounded-full px-2 text-center text-xs font-semibold text-muted transition peer-checked:bg-plum peer-checked:text-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-plum sm:text-sm">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <FieldError id="profile-availability-error" message={availabilityFieldError} />
            <p className="mt-3 text-sm leading-5 text-muted" id="availability-helper">Hidden removes you from Discovery and from receiving new conversations.</p>
          </fieldset>
          <InlineResult result={availabilityResult?.status === "error" ? availabilityResult : null} />
        </section>
      )}

      {children}

      <section aria-labelledby="about-heading" className="rounded-3xl border border-line/70 bg-white p-5 shadow-[0_8px_28px_rgba(40,20,43,0.04)] sm:p-6">
        <h2 className="text-lg font-semibold text-ink" id="about-heading">About you</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-ink" htmlFor="profile-display-name">Display name</label>
          <input
            ref={displayNameRef}
            aria-describedby={basicsFieldErrors?.displayName ? "profile-display-name-error" : undefined}
            aria-invalid={Boolean(basicsFieldErrors?.displayName)}
            className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-base text-ink outline-none transition focus:ring-4 focus:ring-plum/15 ${basicsFieldErrors?.displayName ? "border-error" : "border-line"}`}
            id="profile-display-name"
            name="displayName"
            onChange={(event) => updateDraft({ displayName: event.currentTarget.value })}
            required
            type="text"
            value={draft.displayName}
          />
          <FieldError id="profile-display-name-error" message={basicsFieldErrors?.displayName} />
        </div>

        <fieldset aria-describedby={basicsFieldErrors?.intent ? "profile-intent-error" : undefined} className="mt-5 min-w-0">
          <legend className="text-sm font-medium text-ink">What are you looking for?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {intentOptions.map(([value, label], index) => (
              <label className="cursor-pointer" key={value}>
                <input
                  ref={index === 0 ? firstIntentRef : undefined}
                  aria-describedby={basicsFieldErrors?.intent ? "profile-intent-error" : undefined}
                  aria-invalid={Boolean(basicsFieldErrors?.intent)}
                  checked={draft.intent === value}
                  className="peer sr-only"
                  name="intent"
                  onChange={() => updateDraft({ intent: value })}
                  type="radio"
                  value={value}
                />
                <span className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-plum ${draft.intent === value ? "border-plum bg-plum text-white" : "border-line bg-white text-plum hover:bg-ivory"}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
          <FieldError id="profile-intent-error" message={basicsFieldErrors?.intent} />
        </fieldset>

        <div className="mt-5 space-y-2">
          <button className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-plum px-6 font-semibold text-plum transition hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum disabled:cursor-not-allowed disabled:opacity-50" disabled={!dirty || pending} type="submit">
            {pending ? "Saving…" : "Save changes"}
          </button>
          {basicsResult?.status === "error" && <InlineResult result={basicsResult} />}
          {saved && <p className="text-sm leading-5 text-success" role="status">Saved.</p>}
        </div>
      </section>
    </form>
  );
}
