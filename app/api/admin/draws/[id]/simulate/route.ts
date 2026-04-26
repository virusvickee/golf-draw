import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRandomDraw, generateAlgorithmicDraw, processDrawResults } from "@/lib/draw/engine";

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  return (data as any)?.role === "admin";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const drawId = resolvedParams.id;
  const supabase = await createClient();

  const { data: draw, error: drawError } = await (supabase.from("draws") as any).select("*").eq("id", drawId).single();
  if (drawError || !draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

  if ((draw as any).status === "published") {
    return NextResponse.json({ error: "Cannot simulate a published draw" }, { status: 400 });
  }

  let drawnNumbers: number[] = [];

  if ((draw as any).draw_type === "algorithmic") {
    // Fetch all scores for active users
    const { data: activeUsers } = await (supabase.from("users") as any).select("id").eq("subscription_status", "active");
    if (activeUsers && (activeUsers as any[]).length > 0) {
      const { data: scores } = await (supabase.from("scores") as any).select("user_id, score").in("user_id", (activeUsers as any[]).map(u => u.id));
      
      const userScoreMap: Record<string, number[]> = {};
      (scores as any[])?.forEach(s => {
        if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = [];
        userScoreMap[s.user_id].push(s.score);
      });

      // Filter to only users who have 5 scores
      const validScores = Object.values(userScoreMap).filter(arr => arr.length >= 5).map(arr => arr.slice(0, 5));
      drawnNumbers = generateAlgorithmicDraw(validScores);
    } else {
      drawnNumbers = generateRandomDraw();
    }
  } else {
    drawnNumbers = generateRandomDraw();
  }

  // Update draw with generated numbers and 'simulated' status
  const { error: updateError } = await (supabase.from("draws") as any).update({ drawn_numbers: drawnNumbers, status: "simulated" }).eq("id", drawId);
  
  if (updateError) {
    console.error("Failed to update draw with simulated numbers", updateError);
    return NextResponse.json({ error: "Failed to update draw" }, { status: 500 });
  }

  // Run calculation to return preview
  try {
    const summary = await processDrawResults(drawId);
    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Calculation failed" }, { status: 500 });
  }
}
