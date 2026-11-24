"use client";

import { useEffect, useRef, useState } from "react";

import type { OwnPhotoUrl } from "../../lib/photos/service";
import { canDeletePhoto } from "./profile-copy";

type Props = {
  photo: OwnPhotoUrl | null;
  photoCount: number;
  published: boolean;
  pending: boolean;
  onMakeMain: (photoId: string) => Promise<boolean>;
  onDelete: (photoId: string) => Promise<boolean>;
  onClose: () => void;
  focusReturn: () => void;
};

export function PhotoOptionsSheet({ photo, photoCount, published, pending, onMakeMain, onDelete, onClose, focusReturn }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const mayDelete = canDeletePhoto(published, photoCount);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (photo && !dialog.open) dialog.showModal();
    if (!photo && dialog.open) dialog.close();
    if (photo) requestAnimationFrame(() => firstActionRef.current?.focus());
  }, [photo, confirmingDelete]);

  function closeSheet() {
    setConfirmingDelete(false);
    if (dialogRef.current?.open) dialogRef.current.close();
  }

  async function runAction(action: () => Promise<boolean>) {
    await action();
    closeSheet();
  }

  return (
    <dialog
      aria-labelledby="photo-options-title"
      className="fixed inset-x-0 bottom-0 m-0 max-h-[85dvh] w-full max-w-none rounded-t-3xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/55 sm:left-1/2 sm:right-auto sm:w-[min(100%-2rem,32rem)] sm:-translate-x-1/2"
      onClick={(event) => { if (event.target === event.currentTarget) closeSheet(); }}
      onClose={() => { setConfirmingDelete(false); onClose(); focusReturn(); }}
      ref={dialogRef}
    >
      <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line sm:hidden" />
      <div className="px-5 pb-6 pt-5 sm:px-6">
        <h2 className="text-xl font-semibold text-ink" id="photo-options-title">
          {confirmingDelete ? "Delete this photo?" : "Photo options"}
        </h2>
        {confirmingDelete ? (
          <>
            <p className="mt-2 text-sm leading-5 text-muted">It is removed from your profile for good.</p>
            <div className="mt-5 space-y-2">
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-error px-5 font-semibold text-white transition hover:bg-error/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!mayDelete || pending}
                onClick={() => { if (photo) void runAction(() => onDelete(photo.id)); }}
                ref={mayDelete ? firstActionRef : undefined}
                type="button"
              >
                {pending ? "Deleting…" : "Delete photo"}
              </button>
              {!mayDelete && <p className="text-sm leading-5 text-muted">Add another photo before deleting this one.</p>}
              <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-plum px-5 font-semibold text-plum hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum" onClick={() => setConfirmingDelete(false)} ref={!mayDelete ? firstActionRef : undefined} type="button">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 divide-y divide-line/70">
            {photo && !photo.isMain && (
              <button className="flex min-h-12 w-full items-center py-2 text-left text-base font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum" onClick={() => { void runAction(() => onMakeMain(photo.id)); }} ref={firstActionRef} type="button">
                Make main
              </button>
            )}
            <button className="flex min-h-12 w-full items-center py-2 text-left text-base font-medium text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error" onClick={() => setConfirmingDelete(true)} ref={photo?.isMain ? firstActionRef : undefined} type="button">
              Delete photo
            </button>
            <button className="flex min-h-12 w-full items-center py-2 text-left text-base font-medium text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum" onClick={closeSheet} type="button">
              Cancel
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
