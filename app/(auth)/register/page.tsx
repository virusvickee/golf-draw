"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { toast } from "sonner";
import { Charity } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  
  // Step 1: Account
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  
  // Step 2: Charity
  const [charities, setCharities] = React.useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = React.useState("");
  const [contribution, setContribution] = React.useState(10);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCharities = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("charities").select("*").eq("is_active", true);
      if (data) setCharities(data);
    };
    fetchCharities();
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharityId) {
      setError("Please select a charity to support");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient() as any;

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // Supabase will log them in immediately if email confirmations are disabled (default locally)
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Could not create user");

      // 2. Upsert the public.users table in case trigger races
      const { error: updateError } = await (supabase.from("users") as any)
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          charity_id: selectedCharityId,
          charity_contribution_percentage: contribution,
        });

      if (updateError) throw updateError;

      // Send Welcome Email
      const selectedCharity = charities.find(c => c.id === selectedCharityId);
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          template: 'welcome',
          data: {
            name: fullName,
            charityName: selectedCharity?.name || 'Your chosen charity',
            charityPercentage: contribution
          }
        })
      }).catch(console.error); // don't await, send in background

      toast.success("Account created! Redirecting to checkout...");
      setTimeout(() => router.push("/subscribe"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          {step === 1 ? "Step 1: Your Details" : "Step 2: Choose Your Charity"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              required
            />

            {error && <div className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

            <Button type="submit" className="w-full mt-2">
              Continue
            </Button>
            
            <p className="text-center text-sm text-slate-400 mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-slate-300">Select Charity</label>
              <select
                required
                value={selectedCharityId}
                onChange={(e) => setSelectedCharityId(e.target.value)}
                className="flex h-11 w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2 text-sm text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" disabled>Choose a charity...</option>
                {charities.length === 0 && <option value="" disabled>No charities available</option>}
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <Slider
                label="Contribution Percentage"
                value={contribution}
                min={10}
                max={100}
                onValueChange={setContribution}
              />
              <p className="text-xs text-slate-400 mt-3">
                Choose what percentage of your subscription fee goes directly to your selected charity. Minimum is 10%.
              </p>
            </div>

            {error && <div className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

            <div className="flex gap-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
