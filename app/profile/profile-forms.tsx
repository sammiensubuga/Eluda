"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { FieldError } from "../auth-forms";
import { updateAvailability, updateProfileBasics } from "../../lib/profile/actions";
import type { ProfileActionState, ProfileFieldErrors } from "../../lib/profile/actions";
import type { OwnProfile } from "../../lib/profile/queries";

type ProfileErrorField = keyof ProfileFieldErrors;

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

export function ProfileForms({ profile }: { profile: OwnProfile }) {
  const [basics, basicsAction, basicsPending] = useActionState(updateProfileBasics, INITIAL_PROFILE_STATE);
  const [availabilityState, availabilityAction, availabilityPending] = useActionState(updateAvailability, INITIAL_PROFILE_STATE);
  const [basicsDraft, setBasicsDraft] = useState({ displayName: profile.displayName, intent: profile.intent });
  const [availabilityDraftState, setAvailabilityDraft] = useState(profile.availability ?? "AVAILABLE");
  const [clearedBasics, setClearedBasics] = useState<{
    state: ProfileActionState;
    fields: Partial<Record<ProfileErrorField, boolean>>;
  } | null>(null);
  const [clearedAvailability, setClearedAvailability] = useState<{
    state: ProfileActionState;
    fields: Partial<Record<ProfileErrorField, boolean>>;
  } | null>(null);
  const [dismissedBasicsSuccess, setDismissedBasicsSuccess] = useState<ProfileActionState | null>(null);
  const [dismissedAvailabilitySuccess, setDismissedAvailabilitySuccess] = useState<ProfileActionState | null>(null);
  const displayNameInput = useRef<HTMLInputElement>(null);
  const intentInput = useRef<HTMLInputElement>(null);
  const availabilityInput = useRef<HTMLInputElement>(null);

  const basicsFieldError = (field: ProfileErrorField) =>
    basics.status === "error" && !(clearedBasics?.state === basics && clearedBasics.fields[field])
      ? basics.fieldErrors?.[field]
      : undefined;
  const availabilityError =
    availabilityState.status === "error" && !(clearedAvailability?.state === availabilityState && clearedAvailability.fields.availability)
      ? availabilityState.fieldErrors?.availability
      : undefined;

  const basicsValues = basics.status === "success" && dismissedBasicsSuccess !== basics ? basics.values : undefined;
  const displayNameValue = basicsValues?.displayName ?? basicsDraft.displayName;
  const intentValue = (basicsValues?.intent as OwnProfile["intent"] | undefined) ?? basicsDraft.intent;
  const availabilityValue =
    availabilityState.status === "success" && dismissedAvailabilitySuccess !== availabilityState
      ? (availabilityState.values?.availability as "AVAILABLE" | "BUSY" | "HIDDEN" | undefined) ?? availabilityDraftState
      : availabilityDraftState;

  useEffect(() => {
    if (basics.status !== "error") return;
    if (basics.fieldErrors?.displayName) displayNameInput.current?.focus();
    else if (basics.fieldErrors?.intent) intentInput.current?.focus();
  }, [basics]);

  useEffect(() => {
    if (availabilityError) availabilityInput.current?.focus();
  }, [availabilityError]);

  function clearBasicsError(field: ProfileErrorField) {
    setClearedBasics((current) => ({
      state: basics,
      fields: { ...(current?.state === basics ? current.fields : {}), [field]: true },
    }));
    setDismissedBasicsSuccess(basics);
  }

  function clearAvailabilityError() {
    setClearedAvailability((current) => ({
      state: availabilityState,
      fields: { ...(current?.state === availabilityState ? current.fields : {}), availability: true },
    }));
    setDismissedAvailabilitySuccess(availabilityState);
  }

  return (
    <div className="mt-8 space-y-8">
      <form action={basicsAction} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-[#4c3a4c]" htmlFor="profile-display-name">Display name</label>
          <input
            ref={displayNameInput}
            aria-describedby={basicsFieldError("displayName") ? "profile-display-name-error" : undefined}
            aria-invalid={Boolean(basicsFieldError("displayName"))}
            className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#28142b] outline-none transition focus:ring-4 focus:ring-[#b87aa5]/20 ${basicsFieldError("displayName") ? "border-[#b42318] focus:border-[#b42318]" : "border-[#dfd1d9] focus:border-[#9a527d]"}`}
            id="profile-display-name"
            name="displayName"
            onChange={(event) => {
              setBasicsDraft((current) => ({ ...current, displayName: event.currentTarget.value }));
              clearBasicsError("displayName");
            }}
            required
            type="text"
            value={displayNameValue}
          />
          <FieldError id="profile-display-name-error" message={basicsFieldError("displayName")} />
        </div>

        <fieldset aria-describedby={basicsFieldError("intent") ? "profile-intent-error" : undefined} className="min-w-0">
          <legend className="text-sm font-medium text-[#4c3a4c]">What are you looking for?</legend>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {intentOptions.map(([value, label], index) => (
              <label
                key={value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium text-[#28142b] focus-within:ring-4 focus-within:ring-[#b87aa5]/20 ${basicsFieldError("intent") ? "border-[#b42318]" : "border-[#dfd1d9]"}`}
              >
                <input
                  ref={index === 0 ? intentInput : undefined}
                  aria-describedby={basicsFieldError("intent") ? "profile-intent-error" : undefined}
                  checked={intentValue === value}
                  className="h-4 w-4 accent-[#63345d]"
                  name="intent"
                  onChange={() => {
                    setBasicsDraft((current) => ({ ...current, intent: value }));
                    clearBasicsError("intent");
                  }}
                  type="radio"
                  value={value}
                />
                {label}
              </label>
            ))}
          </div>
          <FieldError id="profile-intent-error" message={basicsFieldError("intent")} />
        </fieldset>

        {basics.status === "error" && basics.message && dismissedBasicsSuccess !== basics && (
          <p className="text-sm leading-5 text-[#b42318]" role="alert">{basics.message}</p>
        )}
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
          disabled={basicsPending}
          type="submit"
        >
          {basicsPending ? "Please wait…" : "Save profile"}
        </button>
        {basics.status === "success" && dismissedBasicsSuccess !== basics && (
          <p className="text-sm text-[#17663a]" role="status">Saved.</p>
        )}
      </form>

      {profile.gender === "FEMALE" && (
        <form action={availabilityAction} className="space-y-5 border-t border-[#eadde3] pt-6" noValidate>
          <fieldset aria-describedby={availabilityError ? "profile-availability-error" : undefined} className="min-w-0">
            <legend className="text-sm font-medium text-[#4c3a4c]">Availability</legend>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {availabilityOptions.map(([value, label], index) => (
                <label
                  key={value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium text-[#28142b] focus-within:ring-4 focus-within:ring-[#b87aa5]/20 ${availabilityError ? "border-[#b42318]" : "border-[#dfd1d9]"}`}
                >
                  <input
                    ref={index === 0 ? availabilityInput : undefined}
                    aria-describedby={availabilityError ? "profile-availability-error" : undefined}
                    checked={availabilityValue === value}
                    className="h-4 w-4 accent-[#63345d]"
                    name="availability"
                    onChange={() => {
                      setAvailabilityDraft(value);
                      clearAvailabilityError();
                    }}
                    type="radio"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
            <FieldError id="profile-availability-error" message={availabilityError} />
            <p className="mt-1.5 text-xs leading-5 text-[#806e7e]">Hidden removes you from Discovery and from receiving new conversations.</p>
          </fieldset>

          {availabilityState.status === "error" && availabilityState.message && dismissedAvailabilitySuccess !== availabilityState && (
            <p className="text-sm leading-5 text-[#b42318]" role="alert">{availabilityState.message}</p>
          )}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60"
            disabled={availabilityPending}
            type="submit"
          >
            {availabilityPending ? "Please wait…" : "Save availability"}
          </button>
          {availabilityState.status === "success" && dismissedAvailabilitySuccess !== availabilityState && (
            <p className="text-sm text-[#17663a]" role="status">Saved.</p>
          )}
        </form>
      )}

      <Link className="block text-center text-sm font-semibold text-[#63345d] underline underline-offset-4" href="/discover">
        Back to Discover
      </Link>
    </div>
  );
}
