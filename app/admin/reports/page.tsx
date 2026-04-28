"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminReportsPage() {
  const [subscriberGrowth, setSubscriberGrowth] = useState<any[]>([]);
  const [prizePoolData, setPrizePoolData] = useState<any[]>([]);
  const [charityData, setCharityData] = useState<any[]>([]);
  const [participationData, setParticipationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    const supabase = createClient();

    // Subscriber growth (mock data - replace with real aggregation)
    const growthData = [
      { month: 'Jan', subscribers: 45 },
      { month: 'Feb', subscribers: 62 },
      { month: 'Mar', subscribers: 78 },
      { month: 'Apr', subscribers: 95 },
      { month: 'May', subscribers: 112 },
      { month: 'Jun', subscribers: 128 },
    ];
    setSubscriberGrowth(growthData);

    // Prize pool per month
    const { data: prizePools } = await (supabase
      .from("prize_pools") as any)
      .select("*, draws(month)")
      .limit(6);

    const prizeData = (prizePools || []).map((p: any) => ({
      month: p.draws?.month || 'N/A',
      pool: p.total_pool || 0,
    }));
    setPrizePoolData(prizeData);

    // Contributions per charity
    const { data: contributions } = await (supabase
      .from("contributions") as any)
      .select("amount, charities(name)");

    const charityMap = new Map();
    (contributions || []).forEach((c: any) => {
      const name = c.charities?.name || 'Unknown';
      charityMap.set(name, (charityMap.get(name) || 0) + (c.amount || 0));
    });

    const charityChartData = Array.from(charityMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    setCharityData(charityChartData);

    // Participation rate (mock data)
    const participationMock = [
      { month: 'Jan', rate: 78 },
      { month: 'Feb', rate: 82 },
      { month: 'Mar', rate: 85 },
      { month: 'Apr', rate: 88 },
      { month: 'May', rate: 91 },
      { month: 'Jun', rate: 94 },
    ];
    setParticipationData(participationMock);

    setLoading(false);
  }

  if (loading) {
    return <div className="text-slate-400">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Reports</h1>
        <p className="text-slate-400">Platform performance metrics</p>
      </div>

      {/* Subscriber Growth */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Subscriber Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={subscriberGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="subscribers" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Prize Pool */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Prize Pool Per Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prizePoolData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Bar dataKey="pool" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charity Contributions */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Contributions by Charity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Participation Rate */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Draw Participation Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="rate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
