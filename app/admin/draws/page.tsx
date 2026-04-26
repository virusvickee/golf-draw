"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/helpers";

export default function AdminDrawsPage() {
  const [draws, setDraws] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Create Draw state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [month, setMonth] = React.useState("");
  const [drawType, setDrawType] = React.useState<"random" | "algorithmic">("algorithmic");
  
  // Simulate/Publish state
  const [activeDraw, setActiveDraw] = React.useState<any | null>(null);
  const [simResults, setSimResults] = React.useState<any | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/draws");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.draws) setDraws(data.draws);
      return data.draws || [];
    } catch (err: any) {
      toast.error("Failed to load draws: " + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDraws();
  }, []);

  const [isCreating, setIsCreating] = React.useState(false);
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, drawType }),
      });
      if (res.ok) {
        toast.success("Draw created");
        setIsCreateOpen(false);
        fetchDraws();
      } else {
        toast.error("Failed to create draw");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSimulate = async (id: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/admin/draws/${id}/simulate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Simulation complete");
        setSimResults(data.summary);
        const updatedDraws = await fetchDraws(); // refresh numbers
        setActiveDraw(data.draw || updatedDraws.find((d: any) => d.id === id));
      } else {
        toast.error(data.error);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Are you sure? This will lock the draw and notify winners.")) return;
    setIsSimulating(true);
    const res = await fetch(`/api/admin/draws/${id}/publish`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Draw Published!");
      setSimResults(null);
      setActiveDraw(null);
      fetchDraws();
    } else {
      toast.error(data.error);
    }
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Draw Management" 
        description="Create, simulate, and publish monthly draws."
        action={<Button onClick={() => setIsCreateOpen(true)}>Create New Draw</Button>}
      />

      <div className="grid gap-6">
        {loading ? <LoadingSpinner variant="card" /> : draws.map((draw) => (
          <Card key={draw.id} className={draw.status === 'published' ? 'border-emerald-500/20' : ''}>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{new Date(draw.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <Badge variant={draw.status === 'published' ? 'success' : draw.status === 'simulated' ? 'warning' : 'neutral'}>
                    {draw.status}
                  </Badge>
                  <Badge variant="info">{draw.draw_type}</Badge>
                </div>
                
                {draw.drawn_numbers && draw.drawn_numbers.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {draw.drawn_numbers.map((n: number, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {draw.status !== 'published' && (
                  <>
                    <Button variant="secondary" onClick={() => handleSimulate(draw.id)} isLoading={isSimulating && activeDraw?.id === draw.id}>
                      Simulate
                    </Button>
                    <Button 
                      variant="primary" 
                      disabled={draw.status === 'draft' || (draw.drawn_numbers ?? []).length === 0} 
                      onClick={() => handlePublish(draw.id)}
                      isLoading={isSimulating && activeDraw?.id === draw.id}
                    >
                      Publish Draw
                    </Button>
                  </>
                )}
                {draw.status === 'published' && (
                  <Button variant="ghost" disabled>Published</Button>
                )}
              </div>
            </CardContent>
            
            {/* Simulation Results Preview */}
            {simResults && activeDraw?.id === draw.id && (
              <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
                <h4 className="font-semibold text-amber-400 mb-3">Simulation Results Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Total Pool</p>
                    <p className="font-bold">{formatCurrency(simResults?.pool?.total ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Match 5 Winners</p>
                    <p className="font-bold">{simResults?.winnersCount?.match5 ?? 0} <span className="text-emerald-400">({formatCurrency(simResults?.payouts?.match5 ?? 0)} each)</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400">Match 4 Winners</p>
                    <p className="font-bold">{simResults?.winnersCount?.match4 ?? 0} <span className="text-emerald-400">({formatCurrency(simResults?.payouts?.match4 ?? 0)} each)</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400">Match 3 Winners</p>
                    <p className="font-bold">{simResults?.winnersCount?.match3 ?? 0} <span className="text-emerald-400">({formatCurrency(simResults?.payouts?.match3 ?? 0)} each)</span></p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
        {draws.length === 0 && !loading && <p className="text-slate-400 text-center py-8">No draws found. Create one to get started.</p>}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Draw">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Month (YYYY-MM)" 
            type="month" 
            required 
            value={month} 
            onChange={e => setMonth(e.target.value)} 
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Draw Type</label>
            <select
              value={drawType}
              onChange={(e) => setDrawType(e.target.value as any)}
              className="flex h-11 w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2 text-sm text-slate-100"
            >
              <option value="algorithmic">Algorithmic (Fairness Weighted)</option>
              <option value="random">Pure Random</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isCreating} isLoading={isCreating}>Create Draft</Button>
        </form>
      </Modal>
    </div>
  );
}
