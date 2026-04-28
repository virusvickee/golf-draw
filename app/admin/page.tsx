"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Users, DollarSign, Heart, AlertCircle } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    totalPrizePool: 0,
    totalContributions: 0,
    pendingVerifications: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentDraws, setRecentDraws] = useState<any[]>([]);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient();

    // Fetch stats
    const [subscribers, prizePool, contributions, verifications] = await Promise.all([
      (supabase.from("users") as any).select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
      (supabase.from("prize_pools") as any).select("total_pool"),
      (supabase.from("contributions") as any).select("amount"),
      (supabase.from("winners") as any).select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
    ]);

    setStats({
      activeSubscribers: subscribers.count || 0,
      totalPrizePool: prizePool.data?.reduce((sum: any, p: any) => sum + (p.total_pool || 0), 0) || 0,
      totalContributions: contributions.data?.reduce((sum: any, c: any) => sum + (c.amount || 0), 0) || 0,
      pendingVerifications: verifications.count || 0,
    });

    // Fetch recent activity
    const { data: users } = await (supabase
      .from("users") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: draws } = await (supabase
      .from("draws") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: winners } = await (supabase
      .from("winners") as any)
      .select("*, users(email)")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentUsers(users || []);
    setRecentDraws(draws || []);
    setRecentWinners(winners || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  const statCards = [
    { label: "Active Subscribers", value: stats.activeSubscribers, icon: Users, color: "emerald" },
    { label: "Total Prize Pool", value: `£${stats.totalPrizePool.toFixed(2)}`, icon: DollarSign, color: "blue" },
    { label: "Charity Contributions", value: `£${stats.totalContributions.toFixed(2)}`, icon: Heart, color: "pink" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: AlertCircle, color: "amber" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Overview</h1>
        <p className="text-slate-400">Platform statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`text-${stat.color}-400`} size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <div className="text-white font-medium">{user.email}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  user.subscription_status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {user.subscription_status || 'inactive'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Draws */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Draws</h3>
          <div className="space-y-3">
            {recentDraws.map((draw) => (
              <div key={draw.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <div className="text-white font-medium">{draw.month}</div>
                  <div className="text-xs text-slate-400">{draw.draw_type}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  draw.status === 'published' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {draw.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Winners */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Winners</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">User</th>
                <th className="text-left py-3 text-slate-400 font-medium">Match</th>
                <th className="text-left py-3 text-slate-400 font-medium">Prize</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentWinners.map((winner) => (
                <tr key={winner.id} className="border-b border-slate-700 last:border-0">
                  <td className="py-3 text-white">{winner.users?.email || 'N/A'}</td>
                  <td className="py-3 text-slate-300">{winner.match_count} numbers</td>
                  <td className="py-3 text-emerald-400 font-semibold">£{winner.prize_amount}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      winner.verification_status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : winner.verification_status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {winner.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
