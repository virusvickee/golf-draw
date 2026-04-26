"use client";

// ============================================================================
// useScores — fetch and manage the current user's golf scores
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Score } from "@/types";

interface UseScoresReturn {
  scores: Score[];
  loading: boolean;
  error: string | null;
  submitScore: (score: number, date: string) => Promise<void>;
  editScore: (id: string, newScore: number) => Promise<void>;
  deleteScore: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useScores(): UseScoresReturn {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setScores(data.scores || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch scores");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [tick]);

  const submitScore = useCallback(async (score: number, date: string) => {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    refetch();
  }, [refetch]);

  const editScore = useCallback(async (id: string, newScore: number) => {
    const res = await fetch(`/api/scores?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: newScore }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    refetch();
  }, [refetch]);

  const deleteScore = useCallback(async (id: string) => {
    const res = await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    refetch();
  }, [refetch]);

  return { scores, loading, error, submitScore, editScore, deleteScore, refetch };
}

