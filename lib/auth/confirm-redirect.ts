import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_EMAIL_OTP_TYPES = new Set(["signup", "email", "recovery"]);
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const MALFORMED_PERCENT_ESCAPE = /%(?![0-9a-f]{2})/i;
const VALIDATION_ORIGIN = "https://eluda.invalid";

export function isAllowedEmailOtpType(value: string): value is EmailOtpType {
  return ALLOWED_EMAIL_OTP_TYPES.has(value);
}

export function sanitizeNextPath(value: string | null): string | null {
  if (value === null) {
    return "/discover";
  }

  if (
    value.length === 0 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    CONTROL_CHARACTERS.test(value)
  ) {
    return null;
  }

  let decoded = value;
  let fullyDecoded = false;
  for (let pass = 0; pass < 16; pass += 1) {
    if (MALFORMED_PERCENT_ESCAPE.test(decoded)) {
      return null;
    }

    let nextDecoded: string;
    try {
      nextDecoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }

    if (nextDecoded === decoded) {
      fullyDecoded = true;
      break;
    }

    decoded = nextDecoded;
  }

  if (!fullyDecoded) {
    return null;
  }

  if (
    decoded.length > 0 &&
    MALFORMED_PERCENT_ESCAPE.test(decoded) &&
    decoded !== value
  ) {
    return null;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    CONTROL_CHARACTERS.test(decoded)
  ) {
    return null;
  }

  try {
    const parsed = new URL(value, VALIDATION_ORIGIN);
    if (parsed.origin !== VALIDATION_ORIGIN) {
      return null;
    }
  } catch {
    return null;
  }

  return value;
}
