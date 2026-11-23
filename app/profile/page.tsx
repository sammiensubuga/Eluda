import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AuthPage } from "../auth-page";
import { ProfileForms } from "./profile-forms";
import { getAccountState } from "../../lib/auth/account";
import { getOwnProfile } from "../../lib/profile/queries";

const intentLabels = {
  MEETUPS: "Meetups",
  DATING: "Dating",
  MARRIAGE: "Marriage",
  FRIENDS: "Make New Friends",
} as const;

const availabilityLabels = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  HIDDEN: "Hidden",
} as const;

export async function ProfileGate() {
  await connection();
  const profile = await getOwnProfile();
  if (!profile) {
    const accountState = await getAccountState();
    if (accountState.status === "signed_out" || accountState.status === "deleted") redirect("/sign-in");
    if (accountState.status === "needs_onboarding") redirect("/onboarding");
    redirect("/discover");
  }

  return (
    <AuthPage
      kind="sign-in"
      title="Your profile"
      description="Photos are coming soon."
      form={<ProfileForms profile={profile} />}
    >
      <dl className="mt-6 space-y-4 rounded-2xl bg-[#fbf6f0] p-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#806e7e]">Name</dt>
          <dd className="mt-1 text-sm font-semibold text-[#28142b]">{profile.displayName}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#806e7e]">Age</dt>
          <dd className="mt-1 text-sm font-semibold text-[#28142b]">{profile.age}</dd>
          <p className="mt-1 text-xs leading-5 text-[#806e7e]">Your age comes from your date of birth and can’t be changed here.</p>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#806e7e]">Looking for</dt>
          <dd className="mt-1 text-sm font-semibold text-[#28142b]">{intentLabels[profile.intent]}</dd>
        </div>
        {profile.gender === "FEMALE" && profile.availability && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#806e7e]">Availability</dt>
            <dd className="mt-1 text-sm font-semibold text-[#28142b]">{availabilityLabels[profile.availability]}</dd>
          </div>
        )}
      </dl>
    </AuthPage>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <AuthPage
          kind="sign-in"
          title="Your profile"
          description="Photos are coming soon."
          form={<p aria-busy="true" className="mt-8 text-sm text-[#806e7e]">Loading your profile…</p>}
        />
      }
    >
      <ProfileGate />
    </Suspense>
  );
}
