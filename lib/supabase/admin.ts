import "server-only";

import { createClient } from "@supabase/supabase-js";

import { PHOTO_BUCKET } from "../photos/constants";

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) return null;

  try {
    return createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}

export async function deleteAuthUser(userId: string): Promise<boolean> {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    console.error("Supabase Auth user deletion unavailable: missing_secret");
    return false;
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) throw new Error("client_unavailable");
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

export async function uploadPhotoObject(path: string, jpeg: Buffer): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      console.error("photo_storage_unavailable");
      return false;
    }
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, jpeg, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) {
      console.error("photo_upload_failed");
      return false;
    }
    return true;
  } catch {
    console.error("photo_upload_failed");
    return false;
  }
}

export async function removePhotoObjects(paths: string[]): Promise<boolean> {
  if (paths.length === 0) return true;
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      console.error("photo_storage_unavailable");
      return false;
    }
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(paths);
    if (error) {
      console.error("photo_remove_failed");
      return false;
    }
    return true;
  } catch {
    console.error("photo_remove_failed");
    return false;
  }
}

export async function createPhotoSignedUrls(
  paths: string[],
  expiresInSeconds: number,
): Promise<Record<string, string> | null> {
  if (paths.length === 0) return {};
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      console.error("photo_storage_unavailable");
      return null;
    }
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, expiresInSeconds);
    if (error || !data) {
      console.error("photo_sign_failed");
      return null;
    }
    const signedUrls: Record<string, string> = {};
    for (const item of data) {
      if (item.path && item.signedUrl && !item.error) signedUrls[item.path] = item.signedUrl;
      else console.error("photo_sign_failed");
    }
    return signedUrls;
  } catch {
    console.error("photo_sign_failed");
    return null;
  }
}
