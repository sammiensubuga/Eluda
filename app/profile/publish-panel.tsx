"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { publishProfile, unpublishProfile } from "../../lib/profile/publish-actions";
import type { PublishActionState } from "../../lib/profile/publish-actions";
import { publishActionModel } from "./profile-copy";

const INITIAL_STATE: PublishActionState = { status: "idle", message: "" };

function ResultLine({ state }: { state: PublishActionState }) {
  if (!state.message) return null;
  const isError = state.status === "error";
  return (
    <p className={`mt-3 flex items-start gap-2 text-sm leading-5 ${isError ? "text-error" : "text-success"}`} role={isError ? "alert" : "status"}>
      <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
        {isError ? <><circle cx="10" cy="10" r="7.2" /><path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" /></> : <><circle cx="10" cy="10" r="7.2" /><path strokeLinecap="round" strokeLinejoin="round" d="m6.5 10.2 2.3 2.3 4.8-5" /></>}
      </svg>
      <span>{state.message}</span>
    </p>
  );
}

export function PublishPanel({ published, photoCount }: { published: boolean; photoCount: number }) {
  const router = useRouter();
  const [publishState, publishAction, publishPending] = useActionState(publishProfile, INITIAL_STATE);
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(unpublishProfile, INITIAL_STATE);
  const model = publishActionModel(published, photoCount);
  const state = published ? unpublishState : publishState;
  const pending = published ? unpublishPending : publishPending;

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state]);

  return (
    <section aria-labelledby="visibility-heading" className="rounded-3xl border border-line/70 bg-white p-5 shadow-[0_8px_28px_rgba(40,20,43,0.04)] sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${published ? "bg-success" : "bg-gold"}`} />
        <h2 className="text-lg font-semibold text-ink" id="visibility-heading">{published ? "Published" : "Not published"}</h2>
      </div>
      <p className="mt-2 text-sm leading-5 text-muted">
        {published ? "Your profile can be shown to others." : "Others can’t see your profile or photos yet."}
      </p>
      {published ? (
        <>
          <form action={unpublishAction} className="mt-4">
            <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-plum px-6 font-semibold text-plum transition hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
              {pending ? "Please wait…" : "Unpublish profile"}
            </button>
          </form>
          <p className="mt-2 text-sm text-muted">You can publish again any time.</p>
        </>
      ) : (
        <form action={publishAction} className="mt-4">
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-plum px-6 font-semibold text-white transition hover:bg-plum/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum disabled:cursor-not-allowed disabled:opacity-50" disabled={model.disabled || pending} type="submit">
            {pending ? "Please wait…" : "Publish profile"}
          </button>
          {model.reason && <p className="mt-2 text-sm leading-5 text-muted">{model.reason}</p>}
        </form>
      )}
      <ResultLine state={state} />
    </section>
  );
}
