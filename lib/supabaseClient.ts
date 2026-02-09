import { createBrowserClient } from "@supabase/ssr";

let browserSupabase: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!browserSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    browserSupabase = createBrowserClient(url, anonKey);
  }
  return browserSupabase;
}

export const supabaseClient = getSupabaseClient();
