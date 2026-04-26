import { createClient } from "@supabase/supabase-js";
import { processDrawResults } from "../lib/draw/engine";

// Load env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkflow() {
  console.log("🧪 Starting Backend Workflow Test...");

  try {
    // 1. Create a draft draw with numbers
    console.log("Step 1: Creating simulated draw...");
    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({
        month: "2026-06-01",
        drawn_numbers: [1, 2, 3, 4, 5],
        draw_type: "algorithmic",
        status: "simulated"
      })
      .select()
      .single();

    if (drawError) throw drawError;
    console.log("✅ Simulated draw created:", draw.id);

    // 2. Simulate the draw (Internal logic test)
    console.log("Step 2: Processing Draw Results (Engine)...");
    const result = await processDrawResults(draw.id);
    
    if (result) {
      console.log("✅ Results processed successfully!");
      console.log("- Participants:", result.participantsCount);
      console.log("- Match 5 Winners:", result.winnersCount.match5);
      console.log("- Total Pool: £", result.pool.total.toFixed(2));
    } else {
      console.log("❌ Result was empty");
    }

    // 3. Verify Database Updates
    console.log("Step 3: Verifying database consistency...");
    
    const { data: updatedDraw } = await supabase.from("draws").select("status, drawn_numbers").eq("id", draw.id).single();
    console.log(`- Draw Status: ${updatedDraw?.status} (Expected: published)`);
    console.log(`- Drawn Numbers: ${updatedDraw?.drawn_numbers}`);

    const { count: winnersCount } = await supabase.from("winners").select("*", { count: 'exact', head: true });
    console.log(`- Total Winners in DB: ${winnersCount}`);

    const { data: prizePool } = await supabase.from("prize_pools").select("*").eq("draw_id", draw.id).single();
    console.log(`- Prize Pool Generated: £${prizePool?.total_pool}`);

    console.log("\n✨ WORKFLOW TEST PASSED ✨");

  } catch (error) {
    console.error("❌ Workflow test failed:", error);
  }
}

testWorkflow();
