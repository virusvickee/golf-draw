"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionReady, setSessionReady] = React.useState(false);

  React.useEffect(() => {
    // Get token from URL
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    const verifyToken = async () => {
      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        
        if (error) {
          setError('Invalid or expired reset link. Please request a new one.');
        } else {
          setSessionReady(true);
        }
      } else {
        setError('Invalid reset link.');
      }
    };

    verifyToken();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionReady) {
      setError('Auth session missing!');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      toast.success("Password updated successfully!");
      router.push("/login?message=Password updated successfully");
    } catch (err) {
      console.error("Reset error:", err);
      setError("Something went wrong. Try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">New Password</CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            disabled={!sessionReady || isLoading}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type password"
            required
            disabled={!sessionReady || isLoading}
          />

          {error && <div className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

          <Button 
            type="submit" 
            className="w-full mt-2" 
            isLoading={isLoading}
            disabled={!sessionReady}
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-slate-400 text-center">Loading reset session...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
