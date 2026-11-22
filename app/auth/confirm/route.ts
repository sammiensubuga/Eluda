import { NextResponse, type NextRequest } from "next/server";

import { isAllowedEmailOtpType, sanitizeNextPath } from "../../../lib/auth/confirm-redirect";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function signInRedirect(request: NextRequest, failed: boolean) {
  const destination = new URL("/sign-in", request.url);
  if (failed) {
    destination.searchParams.set("error", "confirmation");
  }
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const next = typeIsRecovery(type)
    ? "/reset-password"
    : sanitizeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");

  if (!next || (type !== null && !isAllowedEmailOtpType(type))) {
    return signInRedirect(request, true);
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return signInRedirect(request, true);
    } else if (tokenHash && type && isAllowedEmailOtpType(type)) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) return signInRedirect(request, true);
    } else {
      return signInRedirect(request, true);
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return signInRedirect(request, true);
  }
}

function typeIsRecovery(type: string | null): boolean {
  return type === "recovery";
}
