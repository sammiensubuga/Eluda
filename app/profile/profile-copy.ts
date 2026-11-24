export type ProfileFormValues = {
  displayName: string;
  intent: string;
  availability: string | null;
};

export type PublishActionModel = {
  action: "publish" | "unpublish";
  disabled: boolean;
  reason: string | null;
  primary: boolean;
};

export function publishReason(photoCount: number): string | null {
  if (!Number.isFinite(photoCount) || photoCount >= 2) return null;
  const remaining = Math.max(1, Math.ceil(2 - photoCount));
  return `Add ${remaining} more ${remaining === 1 ? "photo" : "photos"} to publish.`;
}

export function canDeletePhoto(isPublished: boolean, photoCount: number): boolean {
  return !isPublished || photoCount > 2;
}

export function isProfileFormDirty(initial: ProfileFormValues, current: ProfileFormValues): boolean {
  return (
    initial.displayName.trim() !== current.displayName.trim() ||
    initial.intent !== current.intent ||
    initial.availability !== current.availability
  );
}

export function publishActionModel(isPublished: boolean, photoCount: number): PublishActionModel {
  if (isPublished) return { action: "unpublish", disabled: false, reason: null, primary: false };
  const reason = publishReason(photoCount);
  return { action: "publish", disabled: reason !== null, reason, primary: reason === null };
}

function linearize(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number {
  const normalized = color.replace(/^#/, "");
  const full = normalized.length === 3 ? [...normalized].map((value) => value + value).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error("Expected a 3 or 6 digit hex colour.");
  const channels = [0, 2, 4].map((index) => linearize(Number.parseInt(full.slice(index, index + 2), 16)));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}
