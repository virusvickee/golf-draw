"use client";

// ============================================================================
// useUser — returns the current authenticated user + profile
// ============================================================================

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as AppUser } from "@/types";
import type { User as AuthUser } from "@supabase/supabase-js";

interface UseUserReturn {
  authUser: AuthUser | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
}

export function useUser(): UseUserReturn {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setAuthUser(null);
          setProfile(null);
          return;
        }

        setAuthUser(user);

        const { data, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw new Error(profileError.message);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setAuthUser(null);
          setProfile(null);
        } else {
          fetchUser();
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { authUser, profile, loading, error };
}
