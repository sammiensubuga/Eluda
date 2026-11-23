export type ProfileGender = "FEMALE" | "MALE";

export type PhotoVisibilityInput = {
  viewerId: string | null;
  viewerGender: ProfileGender | null;
  ownerId: string;
  ownerGender: ProfileGender;
  ownerPublishedAt: Date | null;
  ownerDeletedAt: Date | null;
  blockedEitherWay: boolean;
};

function isGender(value: unknown): value is ProfileGender {
  return value === "FEMALE" || value === "MALE";
}

function isDateOrNull(value: unknown): value is Date | null {
  return value === null || (value instanceof Date && Number.isFinite(value.getTime()));
}

function isNonEmptyId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function canViewProfilePhotos(input: PhotoVisibilityInput): boolean {
  if (typeof input !== "object" || input === null) return false;

  const candidate = input as Partial<PhotoVisibilityInput>;
  if (
    (candidate.viewerId !== null && !isNonEmptyId(candidate.viewerId)) ||
    !isNonEmptyId(candidate.ownerId) ||
    !isGender(candidate.ownerGender) ||
    !isGender(candidate.viewerGender) ||
    !isDateOrNull(candidate.ownerPublishedAt) ||
    !isDateOrNull(candidate.ownerDeletedAt) ||
    typeof candidate.blockedEitherWay !== "boolean"
  ) {
    return false;
  }

  if (candidate.ownerDeletedAt !== null) return false;
  if (candidate.viewerId === candidate.ownerId) return true;

  return (
    candidate.viewerId !== null &&
    candidate.ownerPublishedAt !== null &&
    candidate.viewerGender !== candidate.ownerGender &&
    !candidate.blockedEitherWay
  );
}
