"use client";

// ============================================================================
// useDraws — fetch published draws and their prize pools
// ============================================================================

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Draw, PrizePool } from "@/types";

export interface DrawWithPool extends Draw {
  prize_pools: PrizePool | null;
}

interface UseDrawsReturn {
  draws: DrawWithPool[];
  latestDraw: DrawWithPool | null;
  loading: boolean;
  error: string | null;
}

export function useDraws(): UseDrawsReturn {
  const [draws, setDraws] = useState<DrawWithPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchDraws = async () => {
      const { data, error: fetchError } = await supabase
        .from("draws")
        .select("*, prize_pools(*)")
        .eq("status", "published")
        .order("month", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDraws((data as DrawWithPool[]) ?? []);
      }

      setLoading(false);
    };

    fetchDraws();
  }, []);

  return {
    draws,
    latestDraw: draws[0] ?? null,
    loading,
    error,
  };
}
