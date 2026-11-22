import { redirect } from "next/navigation";
import { connection } from "next/server";

import { signOut } from "../../lib/auth/actions";
import { getAccountState } from "../../lib/auth/account";

export async function ProtectedDiscoverContent() {
  await connection();
  const accountState = await getAccountState();
  if (accountState.status === "signed_out" || accountState.status === "deleted") redirect("/sign-in");
  if (accountState.status === "needs_onboarding") redirect("/onboarding");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf6f0] px-5 text-[#28142b]">
      <section className="w-full max-w-lg rounded-3xl border border-[#eadde3] bg-white p-8 text-center shadow-xl shadow-[#4a2148]/5">
        <h1 className="text-2xl font-semibold">You are signed in</h1>
        <a className="mt-5 inline-block text-sm font-semibold text-[#63345d] underline underline-offset-4" href="/profile">Your profile</a>
        <form action={signOut} className="mt-7">
          <button className="min-h-11 rounded-full border border-[#4a2148]/20 px-5 text-sm font-semibold text-[#4a2148] hover:bg-[#fbf6f0]" type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}
