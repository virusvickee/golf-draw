"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    toast.success("Password reset instructions sent.");
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>We will send you instructions to reset your password.</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-100">Check your email</h3>
            <p className="text-sm text-slate-400">
              We&apos;ve sent an email to <span className="text-white font-medium">{email}</span> with a link to reset your password.
            </p>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setSuccess(false)}>
              Try another email
            </Button>
            <Link href="/login" className="text-sm text-emerald-400 hover:text-emerald-300 mt-2 font-medium">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {error && <div className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>

            <p className="text-center text-sm text-slate-400 mt-2">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
