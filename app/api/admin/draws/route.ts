import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  return (data as any)?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("draws")
    .select("*, prize_pools(total_pool)")
    .order("month", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draws: data });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let month: string, drawType: string;
  try {
    const body = await request.json();
    month = body.month;
    drawType = body.drawType;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  
  if (!month || !drawType) {
    return NextResponse.json({ error: "Month and drawType are required" }, { status: 400 });
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Expected YYYY-MM." }, { status: 400 });
  }

  const ALLOWED_DRAW_TYPES = ["random", "algorithmic"];
  if (!ALLOWED_DRAW_TYPES.includes(drawType)) {
    return NextResponse.json({ error: "Invalid drawType. Must be 'random' or 'algorithmic'." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await (supabase.from("draws") as any)
    .insert({ month: `${month}-01`, draw_type: drawType, status: "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draw: data });
}
