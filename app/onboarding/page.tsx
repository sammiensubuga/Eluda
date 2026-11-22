import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AuthPage } from "../auth-page";
import { OnboardingForm } from "./onboarding-form";
import { getAccountState } from "../../lib/auth/account";

export async function OnboardingGate() {
  await connection();
  const accountState = await getAccountState();
  if (accountState.status === "signed_out" || accountState.status === "deleted") redirect("/sign-in");
  if (accountState.status === "ready") redirect("/discover");

  return (
    <AuthPage
      kind="sign-in"
      title="Let’s set up your account"
      description="A few details so Eluda can show you the right people."
      form={<OnboardingForm />}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <AuthPage
          kind="sign-in"
          title="Let’s set up your account"
          description="A few details so Eluda can show you the right people."
          form={<p aria-busy="true" className="mt-8 text-sm text-[#806e7e]">Loading your account…</p>}
        />
      }
    >
      <OnboardingGate />
    </Suspense>
  );
}
