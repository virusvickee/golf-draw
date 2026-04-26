// ============================================================================
// Supabase Admin Client (Service Role)
// Use ONLY on the server for operations that bypass RLS.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types";

/**
 * Creates a Supabase client with the service_role key.
 * This client bypasses Row Level Security — never expose to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
