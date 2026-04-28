"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Eye, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [filteredWinners, setFilteredWinners] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  useEffect(() => {
    filterWinners();
  }, [filter, winners]);

  async function fetchWinners() {
    const supabase = createClient();
    const { data } = await supabase
      .from("winners")
      .select(`
        *,
        users(email, full_name),
        draws(month)
      `)
      .order("created_at", { ascending: false });

    setWinners(data || []);
    setLoading(false);
  }

  function filterWinners() {
    if (filter === "all") {
      setFilteredWinners(winners);
    } else {
      setFilteredWinners(winners.filter(w => w.verification_status === filter));
    }
  }

  async function handleVerificationAction(winnerId: string, action: 'approved' | 'rejected') {
    const supabase = createClient();
    const { error } = await supabase
      .from("winners")
      .update({ verification_status: action })
      .eq("id", winnerId);

    if (error) {
      toast.error(`Failed to ${action} winner`);
      return;
    }

    toast.success(`Winner ${action} successfully`);
    fetchWinners();
  }

  async function handleMarkPaid(winnerId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("winners")
      .update({ payment_status: 'paid' })
      .eq("id", winnerId);

    if (error) {
      toast.error("Failed to mark as paid");
      return;
    }

    toast.success("Winner marked as paid");
    fetchWinners();
  }

  if (loading) {
    return <div className="text-slate-400">Loading winners...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Winner Verification</h1>
        <p className="text-slate-400">Verify and manage prize winners</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected', 'paid'].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'primary' : 'secondary'}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </Card>

      {/* Winners Table */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">User</th>
                <th className="text-left py-3 text-slate-400 font-medium">Draw</th>
                <th className="text-left py-3 text-slate-400 font-medium">Match</th>
                <th className="text-left py-3 text-slate-400 font-medium">Prize</th>
                <th className="text-left py-3 text-slate-400 font-medium">Proof</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map((winner) => (
                <tr key={winner.id} className="border-b border-slate-700 last:border-0">
                  <td className="py-4">
                    <div className="text-white font-medium">{winner.users?.email || 'N/A'}</div>
                    {winner.users?.full_name && (
                      <div className="text-xs text-slate-400">{winner.users.full_name}</div>
                    )}
                  </td>
                  <td className="py-4 text-slate-300">{winner.draws?.month || 'N/A'}</td>
                  <td className="py-4 text-slate-300">{winner.match_count} numbers</td>
                  <td className="py-4 text-emerald-400 font-semibold">£{winner.prize_amount}</td>
                  <td className="py-4">
                    {winner.proof_url ? (
                      <button
                        onClick={() => {
                          setSelectedWinner(winner);
                          setShowProofModal(true);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                      >
                        View Proof
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">No proof</span>
                    )}
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      winner.verification_status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : winner.verification_status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : winner.verification_status === 'rejected'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {winner.payment_status === 'paid' ? 'Paid' : winner.verification_status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {winner.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerificationAction(winner.id, 'approved')}
                            className="p-2 hover:bg-slate-700 rounded text-emerald-400 hover:text-emerald-300"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleVerificationAction(winner.id, 'rejected')}
                            className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {winner.verification_status === 'approved' && winner.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(winner.id)}
                          className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300"
                          title="Mark as Paid"
                        >
                          <DollarSign size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Proof Modal */}
      {showProofModal && selectedWinner && (
        <Modal 
          isOpen={showProofModal} 
          onClose={() => {
            setShowProofModal(false);
            setSelectedWinner(null);
          }} 
          title="Winner Proof"
        >
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400">User</div>
              <div className="text-white">{selectedWinner.users?.email}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Prize Amount</div>
              <div className="text-emerald-400 font-semibold text-xl">£{selectedWinner.prize_amount}</div>
            </div>
            {selectedWinner.proof_url && (
              <div>
                <div className="text-sm text-slate-400 mb-2">Proof Image</div>
                <img 
                  src={selectedWinner.proof_url} 
                  alt="Winner proof" 
                  className="w-full rounded-lg border border-slate-700"
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  handleVerificationAction(selectedWinner.id, 'approved');
                  setShowProofModal(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  handleVerificationAction(selectedWinner.id, 'rejected');
                  setShowProofModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
