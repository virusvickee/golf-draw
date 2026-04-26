"use client";

import * as React from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useScores } from "@/hooks/useScores";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/helpers";

export default function DashboardOverviewPage() {
  const { profile, loading: userLoading } = useUser();
  const { scores, loading: scoresLoading } = useScores();

  if (userLoading || scoresLoading) return <LoadingSpinner variant="full-page" />;

  const isActive = profile?.subscription_status === "active";
  const scoresCount = scores?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Golfer"} 👋`} 
        description="Here is what's happening with your Golf Draw account today."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <Card className="flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Subscription Status</p>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold capitalize">{profile?.subscription_plan || "None"}</h3>
                <Badge variant={isActive ? "success" : "neutral"}>
                  {profile?.subscription_status || "Inactive"}
                </Badge>
              </div>
            </div>
            {!isActive && (
              <div className="mt-4">
                <Link href="/subscribe">
                  <Button size="sm" className="w-full">Subscribe Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scores Summary Card */}
        <Card className="flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Scores Snapshot</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-emerald-400">{scoresCount}</h3>
                <span className="text-lg text-slate-400 font-medium">/ 5</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {scoresCount > 0 ? `Last updated ${formatDate(scores[0].date)}` : "No scores logged yet"}
              </p>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/scores">
                <Button variant="secondary" size="sm" className="w-full">Manage Scores</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Charity Card */}
        <Card className="flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Your Impact</p>
              <h3 className="text-2xl font-bold">Charity Contribution</h3>
              <p className="text-emerald-400 font-bold mt-1 text-lg">
                {profile?.charity_contribution_percentage || 10}%
              </p>
              <p className="text-xs text-slate-500 mt-1">of your subscription fee</p>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="w-full text-slate-400" disabled>Change Charity</Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Draw Card */}
        <Card className="flex flex-col lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Next Draw</p>
                <h3 className="text-2xl font-bold">November 2026</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Status: {isActive && scoresCount === 5 ? <span className="text-emerald-400 font-medium">Entered</span> : <span className="text-amber-400 font-medium">Action Required ({5 - scoresCount} more scores needed)</span>}
                </p>
              </div>
              <Badge variant="info">Estimated Jackpot: £2,500</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Winnings Card */}
        <Card className="flex flex-col">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-400 mb-1">Total Winnings</p>
            <h3 className="text-3xl font-black text-amber-400">{formatCurrency(0)}</h3>
            <p className="text-xs text-slate-500 mt-2">0 pending payouts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
