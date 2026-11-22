export type KampalaDate = { year: number; month: number; day: number };
export type OnboardingGender = "FEMALE" | "MALE";
export type OnboardingIntent = "MEETUPS" | "DATING" | "MARRIAGE" | "FRIENDS";

export type OnboardingInput = {
  gender: string;
  dateOfBirth: string;
  displayName: string;
  intent: string;
};

export type OnboardingFieldErrors = Partial<Record<keyof OnboardingInput, string>>;

export function kampalaToday(now: Date): KampalaDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kampala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function calculateAge(dob: KampalaDate, today: KampalaDate): number {
  const birthdayReached = today.month > dob.month || (today.month === dob.month && today.day >= dob.day);
  return today.year - dob.year - (birthdayReached ? 0 : 1);
}

export type ParsedDateOfBirth =
  | { date: KampalaDate; age: number }
  | { error: string };

export function parseDateOfBirth(input: string, today: KampalaDate): ParsedDateOfBirth {
  if (!input) return { error: "Enter your date of birth." };

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) return { error: "Enter a valid date of birth." };

  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
  if (
    utcDate.getUTCFullYear() !== date.year ||
    utcDate.getUTCMonth() + 1 !== date.month ||
    utcDate.getUTCDate() !== date.day
  ) {
    return { error: "Enter a valid date of birth." };
  }

  const afterToday =
    date.year > today.year ||
    (date.year === today.year && date.month > today.month) ||
    (date.year === today.year && date.month === today.month && date.day > today.day);
  const age = calculateAge(date, today);
  if (afterToday || age > 100) return { error: "Enter a valid date of birth." };

  return { date, age };
}

export function normalizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/gu, " ");
}

export function validateDisplayName(input: string): { value: string; error?: string } {
  const value = normalizeDisplayName(input);
  if (!value) return { value, error: "Enter a display name." };
  const length = Array.from(value).length;
  if (length < 2 || length > 30) return { value, error: "Use 2 to 30 characters." };
  if (!/^\p{L}[\p{L}\p{M}]*(?:[ '’\-][\p{L}\p{M}]+)*\p{L}$/u.test(value)) {
    return { value, error: "Use letters, spaces, hyphens and apostrophes only." };
  }
  return { value };
}

export function validateOnboarding(input: OnboardingInput, today: KampalaDate) {
  const fieldErrors: OnboardingFieldErrors = {};

  const gender: OnboardingGender | undefined =
    input.gender === "FEMALE" || input.gender === "MALE" ? input.gender : undefined;
  if (!gender) fieldErrors.gender = "Choose Female or Male.";

  const birth = parseDateOfBirth(input.dateOfBirth, today);
  if ("error" in birth) fieldErrors.dateOfBirth = birth.error;

  const displayName = validateDisplayName(input.displayName);
  if (displayName.error) fieldErrors.displayName = displayName.error;

  const intent: OnboardingIntent | undefined =
    input.intent === "MEETUPS" ||
    input.intent === "DATING" ||
    input.intent === "MARRIAGE" ||
    input.intent === "FRIENDS"
      ? input.intent
      : undefined;
  if (!intent) fieldErrors.intent = "Choose what you’re looking for.";

  return {
    fieldErrors,
    gender,
    birth: "date" in birth ? birth : undefined,
    displayName: displayName.error ? undefined : displayName.value,
    intent,
  };
}
