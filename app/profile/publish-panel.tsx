"use client";

import { useActionState } from "react";

import { publishProfile, unpublishProfile } from "../../lib/profile/publish-actions";
import type { PublishActionState } from "../../lib/profile/publish-actions";

const INITIAL_STATE: PublishActionState = { status: "idle", message: "" };

export function PublishPanel({ published, photoCount }: { published: boolean; photoCount: number }) {
  const [publishState, publishAction, publishPending] = useActionState(publishProfile, INITIAL_STATE);
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(unpublishProfile, INITIAL_STATE);
  const state = published ? unpublishState : publishState;
  const pending = published ? unpublishPending : publishPending;

  return (
    <section aria-labelledby="visibility-heading" className="mt-8 border-t border-[#eadde3] pt-6">
      <h2 className="text-lg font-semibold text-[#28142b]" id="visibility-heading">Visibility</h2>
      <p className="mt-1 text-sm leading-5 text-[#806e7e]">
        {published
          ? "Published. Your profile can be shown to others."
          : "Not published. Others can’t see your profile or photos."}
      </p>
      {published ? (
        <form action={unpublishAction} className="mt-3">
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#dfd1d9] px-6 font-semibold text-[#4a2148] transition hover:bg-[#fbf6f0] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
            {pending ? "Please wait…" : "Unpublish profile"}
          </button>
        </form>
      ) : (
        <form action={publishAction} className="mt-3">
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40 disabled:cursor-not-allowed disabled:opacity-50" disabled={photoCount < 2 || pending} type="submit">
            {pending ? "Please wait…" : "Publish profile"}
          </button>
          {photoCount < 2 && <p className="mt-2 text-sm leading-5 text-[#806e7e]">Add at least 2 photos to publish.</p>}
        </form>
      )}
      {state.message && (
        <p className={`mt-2 text-sm leading-5 ${state.status === "error" ? "text-[#b42318]" : "text-[#17663a]"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
    </section>
  );
}
