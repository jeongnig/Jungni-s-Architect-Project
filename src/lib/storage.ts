import { supabase } from "./supabaseClient";
import { NOTE_IMAGE_BUCKET } from "./constants";

export function noteImagePublicUrl(path: string) {
  return supabase.storage.from(NOTE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
