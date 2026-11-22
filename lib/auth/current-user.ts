import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "../supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}
