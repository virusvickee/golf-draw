"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AdminCharitiesPage() {
  const [charities, setCharities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", description: "", is_featured: false, is_active: true });

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("charities").select("*").order("name");
      if (error) throw error;
      if (data) setCharities(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load charities");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCharities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await (supabase.from("charities") as any).insert([formData]);
    setIsSubmitting(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Charity added!");
      setFormData({ name: "", description: "", is_featured: false, is_active: true });
      setIsModalOpen(false);
      fetchCharities();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Charities" 
        description="Manage the charities available for user contributions." 
        action={<Button onClick={() => setIsModalOpen(true)}>Add Charity</Button>}
      />

      <Card className="overflow-x-auto">
        {loading ? <LoadingSpinner variant="card" /> : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {charities.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{c.description}</td>
                  <td className="px-6 py-4">
                    <Badge variant={c.is_active ? "success" : "danger"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {c.is_featured && <Badge variant="warning">Featured</Badge>}
                  </td>
                </tr>
              ))}
              {charities.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No charities found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Charity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Name" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              required
              className="flex min-h-[100px] w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2 text-sm text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="is_featured" 
              checked={formData.is_featured} 
              onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
            />
            <label htmlFor="is_featured" className="text-sm text-slate-300">Feature this charity on homepage</label>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>Save Charity</Button>
        </form>
      </Modal>
    </div>
  );
}
