"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filter, users]);

  async function fetchUsers() {
    const supabase = createClient();
    const { data } = await (supabase
      .from("users") as any)
      .select(`
        *,
        subscriptions(plan, status),
        scores(id)
      `)
      .order("created_at", { ascending: false });

    const usersWithCounts = (data || []).map((user: any) => ({
      ...user,
      score_count: user.scores?.length || 0,
      plan: user.subscriptions?.[0]?.plan || 'none',
      status: user.subscriptions?.[0]?.status || 'inactive'
    }));

    setUsers(usersWithCounts);
    setLoading(false);
  }

  function filterUsers() {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter(u => u.status === filter);
    }

    setFilteredUsers(filtered);
  }

  async function toggleUserStatus(userId: string, currentStatus: string) {
    const supabase = createClient();
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    await (supabase
      .from("users") as any)
      .update({ subscription_status: newStatus })
      .eq("id", userId);

    fetchUsers();
  }

  if (loading) {
    return <div className="text-slate-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage all platform users</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'cancelled'].map((f) => (
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
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 text-slate-400 font-medium">Joined</th>
                <th className="text-left py-3 text-slate-400 font-medium">Scores</th>
                <th className="text-left py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 last:border-0">
                  <td className="py-4">
                    <div className="text-white font-medium">{user.email}</div>
                    {user.full_name && (
                      <div className="text-xs text-slate-400">{user.full_name}</div>
                    )}
                  </td>
                  <td className="py-4">
                    <span className="text-slate-300 capitalize">{user.plan}</span>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : user.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-slate-300">{user.score_count}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`p-2 hover:bg-slate-700 rounded ${
                          user.status === 'active' ? 'text-red-400' : 'text-emerald-400'
                        }`}
                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400">Email</div>
              <div className="text-white font-medium">{selectedUser.email}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Full Name</div>
              <div className="text-white">{selectedUser.full_name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Subscription Plan</div>
              <div className="text-white capitalize">{selectedUser.plan}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Status</div>
              <div className="text-white capitalize">{selectedUser.status}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Scores</div>
              <div className="text-white">{selectedUser.score_count}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Joined</div>
              <div className="text-white">{new Date(selectedUser.created_at).toLocaleString()}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
