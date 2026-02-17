import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserSupabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!browserSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    browserSupabase = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 5,
        },
      },
    });
  }
  return browserSupabase;
}

export const supabaseClient = getSupabaseClient();
