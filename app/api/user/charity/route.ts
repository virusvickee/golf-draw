import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  charity_id: z.string().uuid(),
  contribution_percentage: z.number().min(10).max(100),
});

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { charity_id, contribution_percentage } = schema.parse(body);

    // Verify charity exists and is active
    const { data: charity, error: charityError } = await supabase
      .from("charities")
      .select("id")
      .eq("id", charity_id)
      .eq("is_active", true)
      .single();

    if (charityError || !charity) {
      return NextResponse.json(
        { error: "Invalid charity selected" },
        { status: 400 }
      );
    }

    // Update user's charity selection
    const { data: updatedUser, error: updateError } = await (supabase
      .from("users") as any)
      .update({
        charity_id,
        charity_contribution_percentage: contribution_percentage,
      })
      .eq("id", user.id)
      .select(`
        *,
        charities (*)
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update charity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
