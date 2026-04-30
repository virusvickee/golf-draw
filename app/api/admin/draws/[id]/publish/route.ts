import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processDrawResults } from "@/lib/draw/engine";

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

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: drawId } = await params;
  
  // Need admin client to bypass RLS for reading draft draws and inserting across multiple tables
  const adminClient = createAdminClient();

  const { data: draw, error: drawError } = await adminClient
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();
    
  if (drawError || !draw) {
    console.error("[publish] Draw fetch error:", drawError);
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }

  if ((draw as any).status === "published") {
    return NextResponse.json({ error: "Draw is already published" }, { status: 400 });
  }
  if ((draw as any).status === "draft" || (draw as any).drawn_numbers.length === 0) {
    return NextResponse.json({ error: "Must simulate draw before publishing" }, { status: 400 });
  }

  try {
    const summary = await processDrawResults(drawId);

    // 1. Insert Prize Pool
    const { error: poolError } = await (adminClient.from("prize_pools") as any).upsert({
      draw_id: drawId,
      total_pool: summary.pool.total,
      tier_5_pool: summary.pool.tier5,
      tier_4_pool: summary.pool.tier4,
      tier_3_pool: summary.pool.tier3,
      jackpot_rollover: summary.pool.rollover,
    });
    
    if (poolError) {
      console.error("Failed to insert prize pool", poolError);
      throw new Error("Failed to insert prize pool");
    }

    // 2. Insert Draw Entries (for all valid participants)
    let winnersToInsert: any[] = [];
    if (summary.rawEntries.length > 0) {
      const { data: entriesData, error: entriesError } = await (adminClient
        .from("draw_entries") as any)
        .upsert(
          summary.rawEntries.map((e) => ({
            draw_id: e.draw_id,
            user_id: e.user_id,
            scores_snapshot: e.scores_snapshot,
            match_count: e.match_count,
            prize_amount: e.match_count === 5 ? summary.payouts.match5 : e.match_count === 4 ? summary.payouts.match4 : e.match_count === 3 ? summary.payouts.match3 : 0,
          })),
          { onConflict: 'draw_id,user_id' }
        )
        .select();

      if (entriesError) throw entriesError;

      // 3. Insert Winners
      const entryMap = new Map(entriesData.map((e: any) => [e.user_id, e.id]));

      for (const userId of summary.rawWinners.tier5) {
        const entryId = entryMap.get(userId);
        if (entryId) winnersToInsert.push({ draw_entry_id: entryId, user_id: userId, match_type: 'match_5', prize_amount: summary.payouts.match5 });
      }
      for (const userId of summary.rawWinners.tier4) {
        const entryId = entryMap.get(userId);
        if (entryId) winnersToInsert.push({ draw_entry_id: entryId, user_id: userId, match_type: 'match_4', prize_amount: summary.payouts.match4 });
      }
      for (const userId of summary.rawWinners.tier3) {
        const entryId = entryMap.get(userId);
        if (entryId) winnersToInsert.push({ draw_entry_id: entryId, user_id: userId, match_type: 'match_3', prize_amount: summary.payouts.match3 });
      }

      if (winnersToInsert.length > 0) {
        const { error: winnerError } = await (adminClient.from("winners") as any).upsert(winnersToInsert);
        if (winnerError) {
          console.error("Failed to insert winners", winnerError);
          throw new Error("Failed to insert winners");
        }
      }
    }

    // 4. Update Draw Status and jackpot carryover
    const { error: updateDrawError } = await (adminClient.from("draws") as any).update({ 
      status: "published",
      jackpot_carried_over: summary.pool.rollover > 0,
      jackpot_amount: summary.pool.rollover
    }).eq("id", drawId);

    if (updateDrawError) {
      console.error("Failed to update draw status", updateDrawError, drawId);
      throw new Error("Failed to update draw status");
    }

    // 5. Send Emails
    if (!process.env.INTERNAL_API_SECRET) {
      throw new Error("Missing INTERNAL_API_SECRET");
    }

    const { data: activeUsers } = await adminClient.from("users").select("id, email, full_name").eq("subscription_status", "active");
    if (activeUsers) {
      // Create maps for quick lookup
      const winnerMap = new Map();
      winnersToInsert.forEach(w => winnerMap.set(w.user_id, w));

      const entryMap = new Map();
      summary.rawEntries.forEach((e: any) => entryMap.set(e.user_id, e));

      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date((draw as any).month));
      const internalSecret = process.env.INTERNAL_API_SECRET;
      
      const emailPromises = [];

      for (const user of (activeUsers as any[])) {
        const entry = entryMap.get(user.id);
        if (entry) {
          const isWinner = winnerMap.has(user.id);
          const winData = winnerMap.get(user.id);
          
          emailPromises.push(
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-internal-secret": internalSecret },
              body: JSON.stringify({
                to: user.email,
                template: "draw_results",
                data: {
                  month: monthName,
                  drawnNumbers: summary.drawnNumbers,
                  userScores: entry.scores_snapshot,
                  matchCount: entry.match_count,
                  isWinner,
                  prizeAmount: isWinner ? winData.prize_amount : 0
                }
              })
            }).then(async res => {
              if (!res.ok) console.error("Failed to send draw_results email to", user.email, await res.text());
            }).catch(e => console.error("Draw email error", e))
          );

          if (isWinner) {
            emailPromises.push(
              fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-internal-secret": internalSecret },
                body: JSON.stringify({
                  to: user.email,
                  template: "winner",
                  data: {
                    amount: `£${winData.prize_amount.toFixed(2)}`,
                    matchType: winData.match_type.replace(/_/g, ' ').toUpperCase()
                  }
                })
              }).then(async res => {
                if (!res.ok) console.error("Failed to send winner email to", user.email, await res.text());
              }).catch(e => console.error("Winner email error", e))
            );
          }
        }
      }
      
      await Promise.all(emailPromises);
    }
    
    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("[publish] Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Publish failed" }, { status: 500 });
  }
}
