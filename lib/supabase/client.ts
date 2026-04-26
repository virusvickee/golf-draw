// ============================================================================
// Supabase Browser Client
// Use this in Client Components (hooks, event handlers, etc.)
// ============================================================================

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types";

/**
 * Creates a Supabase client for use in the browser.
 * This client automatically handles cookie-based auth sessions.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("users").select("*");
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
