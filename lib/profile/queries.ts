import "server-only";

import { getAccountState } from "../auth/account";
import { getDb } from "../db";
import { calculateAge, kampalaToday } from "../onboarding/validation";

export type OwnProfile = {
  displayName: string;
  age: number;
  gender: "FEMALE" | "MALE";
  intent: "MEETUPS" | "DATING" | "MARRIAGE" | "FRIENDS";
  availability: "AVAILABLE" | "BUSY" | "HIDDEN" | null;
};

export async function getOwnProfile(): Promise<OwnProfile | null> {
  const accountState = await getAccountState();
  if (accountState.status !== "ready") return null;

  const user = await getDb().user.findUnique({
    where: { id: accountState.account.id },
    select: {
      displayName: true,
      dateOfBirth: true,
      gender: true,
      profile: { select: { intent: true, availability: true } },
    },
  });
  if (!user?.profile) return null;

  const dateOfBirth = {
    year: user.dateOfBirth.getUTCFullYear(),
    month: user.dateOfBirth.getUTCMonth() + 1,
    day: user.dateOfBirth.getUTCDate(),
  };

  return {
    displayName: user.displayName,
    age: calculateAge(dateOfBirth, kampalaToday(new Date())),
    gender: user.gender,
    intent: user.profile.intent,
    availability: user.profile.availability,
  };
}
