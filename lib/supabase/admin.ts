import "server-only";

import { createClient } from "@supabase/supabase-js";

export async function deleteAuthUser(userId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    console.error("Supabase Auth user deletion unavailable: missing_secret");
    return false;
  }

  try {
    if (!supabaseUrl) throw new Error("missing_url");
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Supabase Auth user deletion failed: delete_failed");
      return false;
    }
    return true;
  } catch {
    console.error("Supabase Auth user deletion failed: delete_failed");
    return false;
  }
}
