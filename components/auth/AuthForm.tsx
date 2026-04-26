"use client";

// ============================================================================
// AuthForm — shared login / register form component
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccess("Check your email to confirm your account!");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>

      {/* Full name (register only) */}
      {mode === "register" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-medium text-[var(--color-text-secondary)]">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
            className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-secondary)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-secondary)]">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-sm)] px-4 py-3">
          {error}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-[var(--radius-sm)] px-4 py-3">
          {success}
        </p>
      )}

      <button
        type="submit"
        id={mode === "login" ? "btn-login" : "btn-register"}
        disabled={loading}
        className="btn-primary justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Please wait…"
          : mode === "login"
          ? "Sign In"
          : "Create Account"}
      </button>
    </form>
  );
}
