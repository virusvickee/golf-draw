"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function SubscribeClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<"monthly" | "yearly" | null>(null);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setIsLoading(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(null);
    }
  };

  const features = [
    "Monthly prize draw entry",
    "Unlimited score tracking",
    "Charity contribution",
    "Full winner eligibility",
  ];

  return (
    <main className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <PageHeader 
          title="Choose Your Plan" 
          description="Complete your Golf Draw registration by selecting a subscription plan. Cancel anytime."
          className="flex-col justify-center items-center text-center sm:items-center sm:text-center gap-2 mb-0"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card hoverEffect className="flex flex-col relative">
          <CardHeader>
            <CardTitle className="text-xl text-slate-300">Monthly Plan</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-black text-white">
              £9.99
              <span className="ml-1 text-xl font-medium text-slate-400">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleSubscribe("monthly")}
              isLoading={isLoading === "monthly"}
              disabled={isLoading !== null}
            >
              Subscribe Monthly
            </Button>
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card hoverEffect className="flex flex-col relative border-emerald-500/30">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <Badge variant="success" className="px-3 py-1 shadow-lg shadow-emerald-500/20">
              Save 17%
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl text-emerald-400">Yearly Plan</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-black text-white">
              £99
              <span className="ml-1 text-xl font-medium text-slate-400">/yr</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-amber-400 font-medium text-sm">2 months free</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              size="lg"
              onClick={() => handleSubscribe("yearly")}
              isLoading={isLoading === "yearly"}
              disabled={isLoading !== null}
            >
              Subscribe Yearly
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-12">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          Already subscribed? Go to dashboard
        </Button>
      </div>
    </main>
  );
}
