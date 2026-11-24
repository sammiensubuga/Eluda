import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getAccountState } from "../../lib/auth/account";
import { getDb } from "../../lib/db";
import { getOwnProfile } from "../../lib/profile/queries";
import { getOwnPhotoUrls } from "../../lib/photos/service";
import { PhotoManager } from "./photo-manager";
import { ProfileForms } from "./profile-forms";
import { PublishPanel } from "./publish-panel";

const intentLabels = {
  MEETUPS: "Meetups",
  DATING: "Dating",
  MARRIAGE: "Marriage",
  FRIENDS: "Make New Friends",
} as const;

function ProfileHeader() {
  return (
    <header className="relative mx-auto flex h-16 w-full max-w-xl items-center justify-center border-b border-line/70 px-5">
      <Link
        aria-label="Back to Discover"
        className="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-plum transition hover:bg-plum/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
        href="/discover"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path d="m14.5 5-7 7 7 7M8 12h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </Link>
      <p className="text-sm font-semibold tracking-wide text-ink">Your profile</p>
    </header>
  );
}

function ProfileLoading() {
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <ProfileHeader />
      <p aria-busy="true" className="mx-auto mt-12 max-w-xl px-5 text-sm text-muted">Loading your profile…</p>
    </main>
  );
}

export async function ProfileGate() {
  await connection();
  const accountState = await getAccountState();
  if (accountState.status === "signed_out" || accountState.status === "deleted") redirect("/sign-in");
  if (accountState.status === "needs_onboarding") redirect("/onboarding");
  const profile = await getOwnProfile();
  if (!profile) redirect("/discover");
  const [photos, profileVisibility] = await Promise.all([
    getOwnPhotoUrls(accountState.account.id),
    getDb().profile.findUnique({
      where: { userId: accountState.account.id },
      select: { publishedAt: true },
    }),
  ]);
  const published = profileVisibility?.publishedAt !== null && profileVisibility?.publishedAt !== undefined;

  return (
    <main className="min-h-screen bg-ivory pb-12 text-ink">
      <ProfileHeader />
      <div className="mx-auto w-full max-w-xl space-y-5 px-5 pt-6 sm:pt-8">
        <section aria-labelledby="profile-identity-heading" className="rounded-3xl border border-line/70 bg-white p-5 shadow-[0_8px_28px_rgba(40,20,43,0.04)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your story</p>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl" id="profile-identity-heading">
            {profile.displayName}, {profile.age}
          </h1>
          <span className="mt-3 inline-flex min-h-8 items-center rounded-full bg-plum px-3.5 text-sm font-semibold text-white">
            {intentLabels[profile.intent]}
          </span>
          <p className="mt-3 text-sm text-muted">Age comes from your date of birth</p>
        </section>

        <PublishPanel published={published} photoCount={photos.length} />

        <ProfileForms profile={profile}>
          <PhotoManager photos={photos} published={published} />
        </ProfileForms>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileGate />
    </Suspense>
  );
}
