"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase.from("users").select(`
        *,
        charities (name)
      `).order("created_at", { ascending: false });
      
      if (error) {
        setError(error.message);
      }
      
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="View and manage subscriber accounts." />

      <Card className="p-4 flex gap-4 bg-slate-900/50">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {error && (
        <Card className="p-4 bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </Card>
      )}

      <Card className="overflow-x-auto">
        {loading ? (
          <LoadingSpinner variant="card" />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Charity</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user.full_name || "N/A"}</div>
                    <div className="text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{user.subscription_plan || "None"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={(user.subscription_status ?? "unknown") === "active" ? "success" : "neutral"}>
                      {user.subscription_status ?? "unknown"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {user.charities?.name ? `${user.charities.name} (${user.charity_contribution_percentage ?? 0}%)` : "None"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.created_at && !isNaN(new Date(user.created_at).getTime()) 
                      ? format(new Date(user.created_at), "MMM d, yyyy") 
                      : "Unknown"}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
