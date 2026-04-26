import { createClient } from "@supabase/supabase-js";

export function generateRandomDraw(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function generateAlgorithmicDraw(scoresList: number[][]): number[] {
  if (!scoresList || scoresList.length === 0) {
    return generateRandomDraw();
  }

  // 1. Calculate frequency of each number 1-45
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;

  scoresList.forEach((scores) => {
    scores.forEach((s) => {
      if (s >= 1 && s <= 45) freq[s]++;
    });
  });

  // 2. Invert frequencies to create weights (least frequent = highest weight)
  // If a number appears 0 times, it gets a very high weight.
  const maxFreq = Math.max(...Object.values(freq), 1);
  const weights = Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
    return {
      num,
      weight: (maxFreq - freq[num]) + 1 // Add 1 to ensure every number has a chance
    };
  });

  // 3. Select 5 unique numbers based on weights
  const selected = new Set<number>();
  while (selected.size < 5) {
    const totalWeight = weights.filter(w => !selected.has(w.num)).reduce((sum, w) => sum + w.weight, 0);
    let randomVal = Math.random() * totalWeight;
    
    for (const w of weights) {
      if (!selected.has(w.num)) {
        randomVal -= w.weight;
        if (randomVal <= 0) {
          selected.add(w.num);
          break;
        }
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export function calculateMatches(userScores: number[], drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers);
  let matches = 0;
  for (const s of userScores) {
    if (drawnSet.has(s)) matches++;
  }
  return matches;
}

export async function processDrawResults(drawId: string) {
  // Requires admin service role to process safely without RLS constraints
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch the draw
  const { data: draw, error: drawError } = await supabase.from("draws").select("*").eq("id", drawId).single();
  if (drawError || !draw) throw new Error("Draw not found");

  const drawnNumbers = draw.drawn_numbers as number[];

  // 2. Fetch all active users
  const { data: activeUsers, error: usersError } = await supabase
    .from("users")
    .select("id, subscription_plan, charity_contribution_percentage")
    .eq("subscription_status", "active");

  if (usersError || !activeUsers) throw new Error("Failed to fetch users");

  // 3. Calculate Prize Pool
  let totalPool = 0;
  activeUsers.forEach(user => {
    const planCost = user.subscription_plan === "yearly" ? 99 / 12 : 9.99;
    const charityPct = user.charity_contribution_percentage || 10;
    const toPool = planCost * (1 - charityPct / 100);
    totalPool += toPool;
  });

  // Add previous rollover if any
  const { data: prevDraws } = await supabase.from("draws").select("id, jackpot_amount").eq("status", "published").order("month", { ascending: false }).limit(1);
  const rolloverAmount = prevDraws && prevDraws.length > 0 ? Number(prevDraws[0].jackpot_amount) : 0;
  
  totalPool += rolloverAmount;

  const tier5Pool = totalPool * 0.40;
  const tier4Pool = totalPool * 0.35;
  const tier3Pool = totalPool * 0.25;

  // 4. Fetch scores for these users
  const { data: scoresData } = await supabase.from("scores").select("*").in("user_id", activeUsers.map(u => u.id));
  
  const entries = [];
  const winners = { tier5: [] as any[], tier4: [] as any[], tier3: [] as any[] };

  for (const user of activeUsers) {
    const userScores = (scoresData || [])
      .filter(s => s.user_id === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(s => s.score);

    // Only include users with exactly 5 scores
    if (userScores.length === 5) {
      const matchCount = calculateMatches(userScores, drawnNumbers);
      entries.push({
        draw_id: drawId,
        user_id: user.id,
        scores_snapshot: userScores,
        match_count: matchCount,
      });

      if (matchCount === 5) winners.tier5.push(user.id);
      if (matchCount === 4) winners.tier4.push(user.id);
      if (matchCount === 3) winners.tier3.push(user.id);
    }
  }

  // Calculate actual payouts
  const t5Payout = winners.tier5.length > 0 ? tier5Pool / winners.tier5.length : 0;
  const t4Payout = winners.tier4.length > 0 ? tier4Pool / winners.tier4.length : 0;
  const t3Payout = winners.tier3.length > 0 ? tier3Pool / winners.tier3.length : 0;

  // Determine rollover for this draw (if no match 5)
  const newRollover = winners.tier5.length === 0 ? tier5Pool : 0;

  // Return Summary (doesn't insert yet, this function can be used for simulation too)
  return {
    drawId,
    drawnNumbers,
    participantsCount: entries.length,
    pool: {
      total: totalPool,
      tier5: tier5Pool,
      tier4: tier4Pool,
      tier3: tier3Pool,
      rollover: newRollover
    },
    winnersCount: {
      match5: winners.tier5.length,
      match4: winners.tier4.length,
      match3: winners.tier3.length,
    },
    payouts: {
      match5: t5Payout,
      match4: t4Payout,
      match3: t3Payout,
    },
    rawEntries: entries,
    rawWinners: winners
  };
}
