"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    is_featured: false,
    is_active: true,
    events: [] as any[],
  });

  useEffect(() => {
    fetchCharities();
  }, []);

  async function fetchCharities() {
    const supabase = createClient();
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("name");

    setCharities(data || []);
    setLoading(false);
  }

  function openCreateModal() {
    setEditingCharity(null);
    setFormData({
      name: "",
      description: "",
      image_url: "",
      is_featured: false,
      is_active: true,
      events: [],
    });
    setShowModal(true);
  }

  function openEditModal(charity: any) {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      description: charity.description || "",
      image_url: charity.image_url || "",
      is_featured: charity.is_featured || false,
      is_active: charity.is_active !== false,
      events: charity.events || [],
    });
    setShowModal(true);
  }
  async function handleSubmit() {
    setLoading(true);
    try {
      const url = editingCharity 
        ? `/api/admin/charities/${editingCharity.id}`
        : `/api/admin/charities`;
        
      const method = editingCharity ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      toast.success(editingCharity ? "Charity updated!" : "Charity created!");
      setShowModal(false);
      fetchCharities();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this charity?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/charities/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete charity");

      toast.success("Charity deleted successfully");
      fetchCharities();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  }
  if (loading) {
    return <div className="text-slate-400">Loading charities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Charity Management</h1>
          <p className="text-slate-400">Manage platform charities</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={20} />
          Add Charity
        </Button>
      </div>

      {/* Charities Table */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 text-slate-400 font-medium">Description</th>
                <th className="text-left py-3 text-slate-400 font-medium">Featured</th>
                <th className="text-left py-3 text-slate-400 font-medium">Active</th>
                <th className="text-left py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {charities.map((charity) => (
                <tr key={charity.id} className="border-b border-slate-700 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {charity.image_url && (
                        <img src={charity.image_url} alt={charity.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <span className="text-white font-medium">{charity.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300 max-w-md truncate">
                    {charity.description || 'N/A'}
                  </td>
                  <td className="py-4">
                    {charity.is_featured && (
                      <Star size={18} className="text-amber-400 fill-amber-400" />
                    )}
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      charity.is_active !== false
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {charity.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(charity)}
                        className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(charity.id)}
                        className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingCharity ? "Edit Charity" : "Add Charity"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Charity name"
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Charity description"
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <Input
            label="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              Active
            </label>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Upcoming Events (JSON)</label>
            <textarea
              value={JSON.stringify(formData.events || [], null, 2)}
              onChange={(e) => {
                try {
                  const events = JSON.parse(e.target.value);
                  setFormData({ ...formData, events });
                } catch (err) {
                  // Invalid JSON - we just don't update the state yet
                }
              }}
              rows={6}
              placeholder='[{"name": "Event Name", "date": "2026-06-15", "location": "London", "description": "Description", "link": "https://..."}]'
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-sm"
            />
            <p className="text-[10px] text-slate-500 mt-1">Must be a valid JSON array of event objects.</p>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {editingCharity ? "Update Charity" : "Create Charity"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
