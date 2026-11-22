export function isRecentLinkSession(amr: unknown, nowSeconds: number): boolean {
  try {
    if (!Array.isArray(amr) || !Number.isFinite(nowSeconds)) return false;

    return amr.some((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return false;

      const method = (entry as { method?: unknown }).method;
      const timestamp = (entry as { timestamp?: unknown }).timestamp;
      if ((method !== "otp" && method !== "recovery") || typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
        return false;
      }

      const ageSeconds = nowSeconds - timestamp;
      return ageSeconds >= -60 && ageSeconds <= 900;
    });
  } catch {
    return false;
  }
}
