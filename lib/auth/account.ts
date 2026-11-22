import "server-only";

import { getCurrentUser } from "./current-user";
import { getDb } from "../db";

export type AccountState =
  | { status: "signed_out" }
  | { status: "needs_onboarding"; userId: string }
  | { status: "deleted" }
  | { status: "ready"; account: { id: string; displayName: string } };

export async function getAccountState(): Promise<AccountState> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { status: "signed_out" };

  const user = await getDb().user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, displayName: true, deletedAt: true },
  });

  if (!user) return { status: "needs_onboarding", userId: sessionUser.id };
  if (user.deletedAt) return { status: "deleted" };
  return { status: "ready", account: { id: user.id, displayName: user.displayName } };
}
