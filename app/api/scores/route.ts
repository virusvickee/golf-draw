// ============================================================================
// GET    /api/scores      — list current user's scores
// POST   /api/scores      — submit a score for a given date (rolling logic: max 5)
// PUT    /api/scores/[id] — edit score (handled via searchParams in this route, or separate route)
// DELETE /api/scores/[id] — delete score (handled via searchParams)
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scores: data });
}

import { z } from "zod";

const ScoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  date: z.string().refine(val => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d <= new Date();
  }, { message: "Date must be valid and not in the future" })
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = ScoreSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { score, date } = parsed.data;

  // Rolling logic: Check how many scores exist
  const { data: existingScores, error: fetchError } = await supabase
    .from("scores")
    .select("id, date")
    .eq("user_id", user.id)
    .order("date", { ascending: true }); // Oldest first

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // If already 5 scores, delete the oldest one (only if we are not just updating an existing date)
  const isUpdatingExisting = (existingScores as any[] || []).some(s => s.date === date);
  if (!isUpdatingExisting && (existingScores as any[] || []).length >= 5) {
    const oldestScoreId = (existingScores as any[])[0].id;
    const { error: deleteError } = await (supabase.from("scores") as any).delete().eq("id", oldestScoreId).eq("user_id", user.id);
    if (deleteError) {
      return NextResponse.json({ error: "Failed to remove oldest score: " + deleteError.message }, { status: 500 });
    }
  }

  const { data, error } = await (supabase.from("scores") as any)
    .upsert({ user_id: user.id, score, date }, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ score: data }, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing score ID" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = ScoreSchema.pick({ score: true }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { score } = parsed.data;

  const { data, error } = await (supabase.from("scores") as any)
    .update({ score })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ score: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing score ID" }, { status: 400 });

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
