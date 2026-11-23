import "server-only";

import { getDb } from "./db";

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) return "unknown";
  const code = error.code;
  return typeof code === "string" && /^[A-Z0-9]+$/u.test(code) ? code : "unknown";
}

export async function consumeRateLimit(key: string, limit: number): Promise<boolean> {
  try {
    const rows = await getDb().$queryRaw<{ count: number }[]>`
      INSERT INTO rate_limit_counters ("key", window_start, count)
      VALUES (${key}, date_trunc('hour', now()), 1)
      ON CONFLICT ("key", window_start)
      DO UPDATE SET count = rate_limit_counters.count + 1
      RETURNING count
    `;
    const count = rows[0]?.count;
    return typeof count === "number" && count <= limit;
  } catch (error) {
    console.error(errorCode(error));
    return false;
  }
}
