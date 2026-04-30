"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Eye, Edit, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    month: "",
    draw_type: "random",
  });

  useEffect(() => {
    fetchDraws();
  }, []);

  async function fetchDraws() {
    try {
      const res = await fetch("/api/admin/draws");
      if (!res.ok) {
        throw new Error("Failed to fetch draws");
      }
      const data = await res.json();
      setDraws(data.draws || []);
    } catch (err) {
      toast.error("Failed to load draws");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDraw() {
    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: formData.month,
          drawType: formData.draw_type,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create draw");
      }

      toast.success("Draw created successfully");
      setShowCreateModal(false);
      setFormData({ month: "", draw_type: "random" });
      fetchDraws();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSimulateDraw(drawId: string) {
    try {
      const res = await fetch(`/api/admin/draws/${drawId}/simulate`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to simulate draw");
      }

      toast.success("Draw simulated successfully");
      fetchDraws();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handlePublishDraw(drawId: string) {
    try {
      const res = await fetch(`/api/admin/draws/${drawId}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to publish draw");
      }

      toast.success("Draw published successfully");
      fetchDraws();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading draws...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Draw Management</h1>
          <p className="text-slate-400">Create and manage monthly draws</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Create New Draw
        </Button>
      </div>

      {/* Draws Table */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">Month</th>
                <th className="text-left py-3 text-slate-400 font-medium">Type</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 text-slate-400 font-medium">Numbers</th>
                <th className="text-left py-3 text-slate-400 font-medium">Created</th>
                <th className="text-left py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {draws.map((draw) => (
                <tr key={draw.id} className="border-b border-slate-700 last:border-0">
                  <td className="py-4 text-white font-medium">{draw.month}</td>
                  <td className="py-4 text-slate-300 capitalize">{draw.draw_type}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      draw.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : draw.status === 'simulated'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {draw.drawn_numbers?.length > 0 ? (
                        draw.drawn_numbers.map((num: number, i: number) => (
                          <span key={i} className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                            {num}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">Not drawn yet</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">
                    {new Date(draw.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDraw(draw)}
                        className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {draw.status === 'draft' && (
                        <button
                          onClick={() => handleSimulateDraw(draw.id)}
                          className="p-2 hover:bg-slate-700 rounded text-amber-400 hover:text-amber-300"
                          title="Simulate"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      {draw.status === 'simulated' && (
                        <button
                          onClick={() => handlePublishDraw(draw.id)}
                          className="p-2 hover:bg-slate-700 rounded text-emerald-400 hover:text-emerald-300"
                          title="Publish"
                        >
                          <Send size={18} />
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

      {/* Create Draw Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Draw">
        <div className="space-y-4">
          <Input
            label="Month (e.g., 2026-06)"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            placeholder="YYYY-MM"
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Draw Type</label>
            <select
              value={formData.draw_type}
              onChange={(e) => setFormData({ ...formData, draw_type: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <Button onClick={handleCreateDraw} className="w-full">
            Create Draw
          </Button>
        </div>
      </Modal>

      {/* Draw Detail Modal */}
      {selectedDraw && (
        <Modal isOpen={!!selectedDraw} onClose={() => setSelectedDraw(null)} title={`Draw: ${selectedDraw.month}`}>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400">Type</div>
              <div className="text-white capitalize">{selectedDraw.draw_type}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Status</div>
              <div className="text-white capitalize">{selectedDraw.status}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-2">Drawn Numbers</div>
              <div className="flex gap-2">
                {selectedDraw.drawn_numbers?.length > 0 ? (
                  selectedDraw.drawn_numbers.map((num: number, i: number) => (
                    <span key={i} className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold">
                      {num}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No numbers drawn yet</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Created</div>
              <div className="text-white">{new Date(selectedDraw.created_at).toLocaleString()}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
