// ============================================================================
// Supabase Server Client
// Use this in Server Components, Server Actions, and API Route Handlers.
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types";

/**
 * Creates a Supabase client for server-side usage.
 * Reads and writes auth cookies via Next.js `cookies()`.
 *
 * Usage (Server Component):
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("users").select("*");
 *
 * Usage (API Route):
 *   export async function GET() {
 *     const supabase = await createClient();
 *     ...
 *   }
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This is safe to ignore when the
            // middleware is refreshing the session.
          }
        },
      },
    }
  );
}
