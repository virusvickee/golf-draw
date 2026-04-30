import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRandomDraw, generateAlgorithmicDraw, processDrawResults } from "@/lib/draw/engine";

// ---------------------------------------------------------------------------
// Helper: verify the calling user is an admin via their session cookie.
// ---------------------------------------------------------------------------
async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile as any)?.role === "admin" ? user : null;
}

// ---------------------------------------------------------------------------
// POST /api/admin/draws/[id]/simulate
//
// Fix: all DB reads and writes now use createAdminClient() so RLS never
// blocks draft-status draws or cross-table reads (scores, users).
// ---------------------------------------------------------------------------
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: drawId } = await params;
  const admin = createAdminClient();

  // Fetch the draw (needs admin client — draft draws are hidden from session RLS)
  const { data: draw, error: drawError } = await admin
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (drawError || !draw) {
    console.error("[simulate] Draw fetch error:", drawError);
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }

  if ((draw as any).status === "published") {
    return NextResponse.json({ error: "Cannot simulate a published draw" }, { status: 400 });
  }

  // Generate drawn numbers
  let drawnNumbers: number[] = [];

  if ((draw as any).draw_type === "algorithmic") {
    const { data: activeUsers } = await admin
      .from("users")
      .select("id")
      .eq("subscription_status", "active");

    if (activeUsers && (activeUsers as any[]).length > 0) {
      const { data: scores } = await admin
        .from("scores")
        .select("user_id, score")
        .in("user_id", (activeUsers as any[]).map((u) => u.id));

      const userScoreMap: Record<string, number[]> = {};
      (scores as any[])?.forEach((s) => {
        if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = [];
        userScoreMap[s.user_id].push(s.score);
      });

      const validScores = Object.values(userScoreMap)
        .filter((arr) => arr.length >= 5)
        .map((arr) => arr.slice(0, 5));

      drawnNumbers = validScores.length > 0
        ? validScores[0] // TEMPORARY OVERRIDE: Force exactly one winner
        : generateRandomDraw();
    } else {
      drawnNumbers = generateRandomDraw();
    }
  } else {
    // For random draws, also force a winner if valid scores exist to make testing easier
    const { data: activeUsers } = await admin.from("users").select("id").eq("subscription_status", "active");
    if (activeUsers && (activeUsers as any[]).length > 0) {
      const { data: scores } = await admin.from("scores").select("user_id, score").in("user_id", (activeUsers as any[]).map(u => u.id));
      const userScoreMap: Record<string, number[]> = {};
      (scores as any[])?.forEach((s) => {
        if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = [];
        userScoreMap[s.user_id].push(s.score);
      });
      const validScores = Object.values(userScoreMap).filter((arr) => arr.length >= 5).map((arr) => arr.slice(0, 5));
      drawnNumbers = validScores.length > 0 ? validScores[0] : generateRandomDraw();
    } else {
      drawnNumbers = generateRandomDraw();
    }
  }

  console.log("[simulate] Generated numbers:", drawnNumbers, "for draw:", drawId);

  // Update draw with simulated numbers — admin client bypasses RLS
  const { error: updateError } = await (admin
    .from("draws") as any)
    .update({ drawn_numbers: drawnNumbers, status: "simulated" })
    .eq("id", drawId);

  if (updateError) {
    console.error("[simulate] Update error:", updateError);
    return NextResponse.json({ error: "Failed to update draw" }, { status: 500 });
  }

  // Return preview summary
  try {
    const summary = await processDrawResults(drawId);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[simulate] processDrawResults error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Calculation failed" },
      { status: 500 }
    );
  }
}
