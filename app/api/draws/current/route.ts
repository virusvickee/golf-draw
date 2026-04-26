import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("draws")
    .select("*, prize_pools(*)")
    .eq("status", "published")
    .order("month", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found, which is fine if no published draws exist
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ currentDraw: data || null });
}
