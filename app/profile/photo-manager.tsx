"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deletePhoto, makeMainPhoto } from "../../lib/photos/actions";
import type { OwnPhotoUrl } from "../../lib/photos/service";
import { prepareUpload, UploadPreparationError } from "../../lib/photos/client-resize";

const ERROR_MESSAGES: Record<string, string> = {
  unsupported: "Use a JPEG, PNG or WebP photo.",
  too_large: "That photo is too large. Try a smaller one.",
  invalid: "We couldn’t read that photo. Try another.",
  limit: "You can add up to 6 photos.",
  rate_limited: "Too many uploads. Try again later.",
};

const INITIAL_ACTION_STATE = { status: "idle" as const, message: "" };

export function PhotoManager({ photos }: { photos: OwnPhotoUrl[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function updatePhoto(action: typeof deletePhoto | typeof makeMainPhoto, photoId: string) {
    setError("");
    startTransition(async () => {
      const result = await action(INITIAL_ACTION_STATE, photoId);
      if (result.status === "success") {
        setConfirmDelete(null);
        router.refresh();
      } else {
        setError(result.message || "We couldn’t update your photos. Try again.");
      }
    });
  }

  return (
    <section aria-labelledby="photos-heading" className="mt-8 border-t border-[#eadde3] pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#28142b]" id="photos-heading">Photos</h2>
        <p className="text-sm text-[#806e7e]">{photos.length} of 6</p>
      </div>
      <p className="mt-1 text-sm leading-5 text-[#806e7e]">Add at least 2 photos. The first photo is your main photo.</p>

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li className="min-w-0" key={photo.id}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f4edf1]">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Private signed URLs must not pass through the image optimizer cache.
                  <img alt={`Photo ${photo.position + 1}`} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" src={photo.url} />
                ) : (
                  <div aria-label={`Photo ${photo.position + 1} unavailable`} className="h-full w-full" role="img" />
                )}
                {photo.isMain && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#4a2148]">Main</span>}
              </div>
              <div className="mt-2 grid gap-2">
                {confirmDelete === photo.id ? (
                  <>
                    <p className="text-center text-sm font-medium text-[#4c3a4c]">Delete photo?</p>
                    <button className="min-h-11 rounded-full border border-[#dfd1d9] px-3 text-sm font-semibold text-[#4a2148] disabled:opacity-50" disabled={pending} onClick={() => updatePhoto(deletePhoto, photo.id)} type="button">Yes, delete</button>
                    <button className="min-h-11 rounded-full px-3 text-sm text-[#806e7e]" onClick={() => setConfirmDelete(null)} type="button">Cancel</button>
                  </>
                ) : (
                  <>
                    {!photo.isMain && <button className="min-h-11 rounded-full border border-[#dfd1d9] px-3 text-sm font-semibold text-[#4a2148] disabled:opacity-50" disabled={pending} onClick={() => updatePhoto(makeMainPhoto, photo.id)} type="button">Make main</button>}
                    <button className="min-h-11 rounded-full border border-[#eadde3] px-3 text-sm text-[#806e7e] disabled:opacity-50" disabled={pending} onClick={() => setConfirmDelete(photo.id)} type="button">Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {photos.length < 6 && (
        <label className={`mt-4 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#4a2148] px-6 font-semibold text-white transition hover:bg-[#5b2a58] focus-within:outline-none focus-within:ring-4 focus-within:ring-[#b87aa5]/40 ${uploading ? "cursor-wait opacity-60" : ""}`}>
          {uploading ? "Uploading…" : "Add photo"}
          <input accept="image/jpeg,image/png,image/webp" aria-label="Choose a photo" className="sr-only" disabled={uploading} onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void upload(file);
          }} ref={inputRef} type="file" />
        </label>
      )}
      {error && <p className="mt-2 text-sm leading-5 text-[#b42318]" role="alert">{error}</p>}
    </section>
  );
}
