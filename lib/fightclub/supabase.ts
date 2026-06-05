import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "./env";

// Server-only Supabase client using the service-role key. NEVER import
// this into a client component — it bypasses RLS and holds the secret.
//
// Lazily created so a missing env var fails at request time with a clear
// message rather than crashing the build.
let client: SupabaseClient | null = null;

export function fcSupabase(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error(
        "Fight Club: missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)."
      );
    }
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const SELFIE_BUCKET = "boxer-selfies";
