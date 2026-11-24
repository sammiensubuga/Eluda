"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { deletePhoto, makeMainPhoto } from "../../lib/photos/actions";
import type { OwnPhotoUrl } from "../../lib/photos/service";
import { prepareUpload, UploadPreparationError } from "../../lib/photos/client-resize";
import { PhotoOptionsSheet } from "./photo-options-sheet";

const ERROR_MESSAGES: Record<string, string> = {
  unsupported: "Use a JPEG, PNG or WebP photo.",
  too_large: "That photo is too large. Try a smaller one.",
  invalid: "We couldn’t read that photo. Try another.",
  limit: "You can add up to 6 photos.",
  rate_limited: "Too many uploads. Try again later.",
};

const INITIAL_ACTION_STATE = { status: "idle" as const, message: "" };

function ErrorLine({ message }: { message: string }) {
  return (
    <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-error" role="alert">
      <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="7.2" />
        <path strokeLinecap="round" d="M10 6.2v4.4m0 3.2h.01" />
      </svg>
      <span>{message}</span>
    </p>
  );
}

export function PhotoManager({ photos, published }: { photos: OwnPhotoUrl[]; published: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<OwnPhotoUrl | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const prepared = await prepareUpload(file);
      const body = new FormData();
      body.set("photo", prepared);
      const response = await fetch("/api/profile/photos", { method: "POST", body });
      if (!response.ok) {
        let code = "failed";
        try {
          const payload: unknown = await response.json();
          if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
            code = payload.error;
          }
        } catch { /* Keep the generic upload message. */ }
        setError(ERROR_MESSAGES[code] ?? "We couldn’t upload that photo. Try again.");
        return;
      }
      router.refresh();
    } catch (cause) {
      if (cause instanceof UploadPreparationError) {
        setError(ERROR_MESSAGES[cause.reason] ?? "We couldn’t upload that photo. Try again.");
      } else {
        setError("We couldn’t upload that photo. Try again.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function updatePhoto(action: typeof deletePhoto | typeof makeMainPhoto, photoId: string): Promise<boolean> {
    if (pending) return false;
    setError("");
    setPending(true);
    try {
      const result = await action(INITIAL_ACTION_STATE, photoId);
      if (result.status === "success") {
        router.refresh();
        return true;
      }
      setError(result.message || "We couldn’t update your photos. Try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="photos-heading" className="rounded-3xl border border-line/70 bg-white p-5 shadow-[0_8px_28px_rgba(40,20,43,0.04)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink" id="photos-heading">Photos</h2>
        <p className="text-sm font-medium text-muted">{photos.length} of 6</p>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2" style={{ gridAutoRows: "clamp(5.25rem, calc((100vw - 3.5rem) / 3), 10rem)" }}>
        {photos.map((photo, index) => (
          <li className={`group relative min-w-0 overflow-hidden rounded-2xl bg-ivory ${index === 0 ? "col-span-2 row-span-2" : ""}`} key={photo.id}>
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- Private signed URLs must not pass through the image optimizer cache.
              <img alt={`Photo ${photo.position + 1}`} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" src={photo.url} />
            ) : (
              <div aria-label={`Photo ${photo.position + 1} unavailable`} className="h-full w-full" role="img" />
            )}
            {photo.isMain && <span className="absolute left-2 top-2 rounded-full bg-ivory px-2.5 py-1 text-xs font-semibold text-plum">Main</span>}
            <button
              aria-label="Photo options"
              className="absolute bottom-1 right-1 inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => { setError(""); optionsButtonRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null; setSelectedPhoto(photo); }}
              ref={selectedPhoto?.id === photo.id ? optionsButtonRef : undefined}
              type="button"
            >
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(30,12,34,0.66)] text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
              </span>
            </button>
          </li>
        ))}

        {photos.length < 6 && (
          <li className="min-w-0">
            <label aria-disabled={uploading} className={`flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-2 text-center text-sm font-semibold text-plum transition hover:bg-ivory focus-within:outline-none focus-within:ring-2 focus-within:ring-plum ${uploading ? "cursor-wait opacity-75" : "cursor-pointer"}`}>
              {uploading ? (
                <>
                  <span aria-hidden="true" className="motion-safe:animate-spin h-5 w-5 rounded-full border-2 border-line border-t-plum" />
                  <span>Uploading…</span>
                </>
              ) : (
                <><span aria-hidden="true" className="text-xl leading-none">+</span><span>Add photo</span></>
              )}
              <input accept="image/jpeg,image/png,image/webp" aria-label="Add photo" className="sr-only" disabled={uploading} onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void upload(file);
              }} ref={inputRef} type="file" />
            </label>
          </li>
        )}
      </ul>

      <p className="mt-3 text-sm leading-5 text-muted">Tap ⋯ on a photo to make it your main photo or delete it.</p>
      {error && <ErrorLine message={error} />}

      <PhotoOptionsSheet
        focusReturn={() => optionsButtonRef.current?.focus()}
        onClose={() => setSelectedPhoto(null)}
        onDelete={(photoId) => updatePhoto(deletePhoto, photoId)}
        onMakeMain={(photoId) => updatePhoto(makeMainPhoto, photoId)}
        pending={pending}
        photo={selectedPhoto}
        photoCount={photos.length}
        published={published}
      />
    </section>
  );
}
