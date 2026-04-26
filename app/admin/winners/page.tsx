"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";

export default function AdminWinnersPage() {
  const [winners, setWinners] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("winners").select(`
        *,
        users (full_name, email),
        draw_entries (draws (month))
      `).order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setWinners(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load winners");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWinners();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject" | "pay") => {
    const supabase = createClient();
    let updates = {};
    if (action === "approve") updates = { verification_status: "approved" };
    if (action === "reject") updates = { verification_status: "rejected" };
    if (action === "pay") updates = { payment_status: "paid", paid_at: new Date().toISOString() };

    const { error } = await (supabase.from("winners") as any).update(updates).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Action successful");
      
      if (action === "pay") {
        try {
          const { data: freshWinner, error: fetchErr } = await (supabase.from("winners") as any).select(`
            *,
            users (email),
            draw_entries (draws (month))
          `).eq("id", id).single();
          
          if (fetchErr) throw fetchErr;

          if (freshWinner && freshWinner.users?.email) {
            const emailRes = await fetch("/api/email/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: freshWinner.users.email,
                template: "payout_confirmed",
                data: {
                  amount: formatCurrency(freshWinner.prize_amount),
                  month: freshWinner.draw_entries?.draws?.month ? format(new Date(freshWinner.draw_entries.draws.month), "MMMM yyyy") : "Draw"
                }
              })
            });
            if (!emailRes.ok) {
              toast.error("Failed to send email");
            }
          }
        } catch (err: any) {
          toast.error("Error fetching fresh winner: " + err.message);
        }
      }
      
      fetchWinners();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Winner Verification" description="Verify score cards and manage prize payouts." />

      <Card className="overflow-x-auto">
        {loading ? <LoadingSpinner variant="card" /> : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Draw</th>
                <th className="px-6 py-4 font-medium">Match</th>
                <th className="px-6 py-4 font-medium">Prize</th>
                <th className="px-6 py-4 font-medium">Verification</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {winners.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {w.users?.full_name}<br/><span className="text-xs text-slate-400 font-normal">{w.users?.email}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {w.draw_entries?.draws?.month ? format(new Date(w.draw_entries.draws.month), "MMM yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={(w.match_type ?? '') === 'match_5' ? 'success' : 'info'}>
                      {(w.match_type ?? 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">{formatCurrency(w.prize_amount)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={w.verification_status === 'approved' ? 'success' : w.verification_status === 'rejected' ? 'danger' : 'warning'}>
                      {w.verification_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={w.payment_status === 'paid' ? 'success' : 'neutral'}>
                      {w.payment_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {w.verification_status === "pending" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleAction(w.id, "approve")}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => handleAction(w.id, "reject")}>Reject</Button>
                      </>
                    )}
                    {w.verification_status === "approved" && w.payment_status === "unpaid" && (
                      <Button size="sm" variant="primary" onClick={() => handleAction(w.id, "pay")}>Mark Paid</Button>
                    )}
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No winners found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
