"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";
import { Trophy, UploadCloud } from "lucide-react";

export default function UserWinningsPage() {
  const [winnings, setWinnings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWinnings = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("winners")
        .select(`
          *,
          draw_entries (draws (month))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setWinnings(data);
      setLoading(false);
    };
    fetchWinnings();
  }, []);

  if (loading) return <LoadingSpinner variant="full-page" />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Winnings" description="View your prize money and verification status." />

      <div className="grid gap-6">
        {winnings.map(win => (
          <Card key={win.id} className="border-emerald-500/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold">
                      {win.draw_entries?.draws?.month ? format(new Date(win.draw_entries.draws.month), "MMMM yyyy") : "Draw"}
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    You hit a <strong className="text-white">{win.match_type.replace('_', ' ').toUpperCase()}</strong> and won!
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-slate-400 mb-1">Prize Amount</p>
                  <p className="text-3xl font-black text-emerald-400">{formatCurrency(win.prize_amount)}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Verification</p>
                    <Badge variant={win.verification_status === 'approved' ? 'success' : win.verification_status === 'rejected' ? 'danger' : 'warning'}>
                      {win.verification_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Payment</p>
                    <Badge variant={win.payment_status === 'paid' ? 'success' : 'neutral'}>
                      {win.payment_status}
                    </Badge>
                  </div>
                </div>

                {win.verification_status === 'pending' && !win.proof_url && (
                  <Button variant="secondary" size="sm">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Scorecard Proof
                  </Button>
                )}
                
                {win.proof_url && (
                  <p className="text-sm text-emerald-500 flex items-center gap-2">
                    ✓ Proof submitted
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {winnings.length === 0 && (
          <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-2">No winnings yet</h3>
            <p className="text-slate-500">Keep logging those scores! The next draw could be yours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
