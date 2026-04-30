import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Helper: verify the calling user is an admin via their session cookie.
// We use the session-scoped client for auth checks only.
// ---------------------------------------------------------------------------
async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log("[draws] Auth error:", authError?.message ?? "no user");
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log("[draws] Profile fetch error:", profileError.message);
    return null;
  }

  console.log("[draws] User role:", (profile as any)?.role);
  return (profile as any)?.role === "admin" ? user : null;
}

// ---------------------------------------------------------------------------
// GET /api/admin/draws — list all draws (admin only)
// We can use the admin client here so that all draws (not just published) are
// returned, bypassing the RLS policy that limits public selects.
// ---------------------------------------------------------------------------
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("draws")
    .select("*, prize_pools(total_pool)")
    .order("month", { ascending: false });

  if (error) {
    console.error("[draws GET] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draws: data });
}

// ---------------------------------------------------------------------------
// POST /api/admin/draws — create a new draft draw (admin only)
//
// Root cause of the 400 bug:
//   The previous version used the cookie-scoped Supabase client for the DB
//   INSERT. Supabase RLS evaluated `is_admin()` server-side but the JWT
//   context was not always forwarded correctly from the Next.js API route,
//   causing the RLS policy `draws_admin_insert` to silently reject the insert
//   and return a PostgREST 400/403.
//
// Fix:
//   Use `createAdminClient()` (service_role key) for the actual DB write.
//   The admin role is already verified above via the session client, so
//   bypassing RLS here is safe and intentional.
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Parse body -----------------------------------------------------------
  let month: string;
  let drawType: string;

  try {
    const body = await request.json();
    month = body.month;
    drawType = body.drawType ?? body.draw_type; // accept both casings
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // --- Validate month -------------------------------------------------------
  if (!month) {
    return NextResponse.json({ error: "month is required (YYYY-MM)" }, { status: 400 });
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json(
      { error: `Invalid month format "${month}". Expected YYYY-MM, e.g. "2025-06".` },
      { status: 400 }
    );
  }

  // --- Validate drawType ----------------------------------------------------
  const ALLOWED_DRAW_TYPES = ["random", "algorithmic"] as const;

  if (!drawType || !ALLOWED_DRAW_TYPES.includes(drawType as (typeof ALLOWED_DRAW_TYPES)[number])) {
    return NextResponse.json(
      { error: `Invalid drawType "${drawType}". Must be "random" or "algorithmic".` },
      { status: 400 }
    );
  }

  // --- Insert via service-role client (bypasses RLS) -----------------------
  const admin = createAdminClient();

  // Build the full date (first day of the given month) to satisfy the
  // draws.month DATE column and its UNIQUE constraint.
  const monthDate = `${month}-01`;

  console.log("[draws POST] Creating draw:", { month: monthDate, drawType });

  const { data, error } = await (admin
    .from("draws") as any)
    .insert({
      month: monthDate,
      draw_type: drawType,
      status: "draft",
      drawn_numbers: [],       // required: INTEGER[] NOT NULL DEFAULT '{}'
      jackpot_carried_over: false, // required: BOOLEAN NOT NULL DEFAULT false
      jackpot_amount: 0,       // required: NUMERIC(12,2) NOT NULL DEFAULT 0
    })
    .select()
    .single();

  if (error) {
    console.error("[draws POST] Insert error:", error);
    // Surface the exact Supabase error so the client can display it
    return NextResponse.json(
      { error: error.message, details: error.details, hint: error.hint },
      { status: 500 }
    );
  }

  console.log("[draws POST] Draw created:", data?.id);
  return NextResponse.json({ draw: data }, { status: 201 });
}
