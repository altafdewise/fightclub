import { createBrowserClient } from "@supabase/ssr";

let browserSupabase: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!browserSupabase) {
    browserSupabase = createBrowserClient(
      process.env.SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserSupabase;
}

export const supabaseClient = getSupabaseClient();
