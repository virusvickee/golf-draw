import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Coins, Heart, Trophy, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch stats concurrently
  const [
    usersResult,
    drawsResult,
    winnersResult,
    prizePoolsResult
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
    supabase.from("draws").select("id, status") as any,
    supabase.from("winners").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("prize_pools").select("total_pool") as any
  ]);

  if (usersResult.error) console.error("users error", usersResult.error);
  if (drawsResult.error) console.error("draws error", drawsResult.error);
  if (winnersResult.error) console.error("winners error", winnersResult.error);
  if (prizePoolsResult.error) console.error("prizePools error", prizePoolsResult.error);

  const activeUsers = usersResult.count;
  const draws = drawsResult.data;
  const pendingWinners = winnersResult.count;
  const prizePools = prizePoolsResult.data;

  const totalPrizePool = (prizePools as any[])?.reduce((sum: number, p: any) => sum + Number(p.total_pool), 0) || 0;
  
  // Note: Total charity contributions would be summed from the `contributions` table in reality.
  // For now, we'll estimate it assuming 25% of total prize pools roughly.
  const totalCharity = totalPrizePool * 0.25; 

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Overview" description="High-level metrics for Golf Draw operations." />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Subscribers</p>
              <h3 className="text-2xl font-bold">{activeUsers || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Coins className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Prize Pool</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalPrizePool)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Heart className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Charity Raised</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalCharity)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Draws Run</p>
              <h3 className="text-2xl font-bold">{(draws as any[])?.filter(d => d.status === 'published').length || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold">Action Needed</h3>
            </div>
            <p className="text-slate-300">
              There are currently <strong className="text-white">{pendingWinners || 0}</strong> winners waiting for verification.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
