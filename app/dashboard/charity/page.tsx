"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Heart, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DashboardCharityPage() {
  const [currentCharity, setCurrentCharity] = useState<any>(null);
  const [allCharities, setAllCharities] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState<string>("");
  const [contributionPercentage, setContributionPercentage] = useState(50);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient();
    
    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Get user with charity info
    const { data: userData } = await supabase
      .from("users")
      .select(`
        *,
        charities (*)
      `)
      .eq("id", authUser.id)
      .single();

    setUser(userData);
    setCurrentCharity(userData?.charities);
    setContributionPercentage(userData?.charity_contribution_percentage || 50);
    setSelectedCharityId(userData?.charity_id || "");

    // Get all charities
    const { data: charitiesData } = await supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("name");

    setAllCharities(charitiesData || []);

    // Get contribution history
    const { data: contributionsData } = await supabase
      .from("contributions")
      .select(`
        *,
        charities (name)
      `)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    setContributions(contributionsData || []);
    setLoading(false);
  }

  async function handleSaveCharity() {
    if (!selectedCharityId) {
      toast.error("Please select a charity");
      return;
    }

    const response = await fetch("/api/user/charity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charity_id: selectedCharityId,
        contribution_percentage: contributionPercentage,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to update charity");
      return;
    }

    toast.success("Charity updated successfully!");
    setShowModal(false);
    fetchData();
  }

  const filteredCharities = allCharities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContributed = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  
  // Calculate monthly contribution
  const subscriptionAmount = user?.subscription_plan === 'yearly' ? 99 / 12 : 9.99;
  const monthlyContribution = (subscriptionAmount * (contributionPercentage / 100)).toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Charity</h1>
        <p className="text-slate-400">Manage your charity selection and contributions</p>
      </div>

      {/* Current Charity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8">
          {currentCharity ? (
            <div className="flex flex-col md:flex-row gap-6">
              {currentCharity.image_url && (
                <img
                  src={currentCharity.image_url}
                  alt={currentCharity.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="text-emerald-400" size={28} fill="currentColor" />
                  <h2 className="text-2xl font-bold text-white">{currentCharity.name}</h2>
                </div>
                <p className="text-slate-300 mb-4">{currentCharity.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Your Contribution</div>
                    <div className="text-2xl font-bold text-emerald-400">{contributionPercentage}%</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Monthly Amount</div>
                    <div className="text-2xl font-bold text-white">£{monthlyContribution}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Total Donated</div>
                    <div className="text-2xl font-bold text-white">£{totalContributed.toFixed(2)}</div>
                  </div>
                </div>

                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                  <Heart size={18} />
                  Change Charity
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="mx-auto mb-4 text-slate-600" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No Charity Selected</h3>
              <p className="text-slate-400 mb-4">Choose a charity to support with your subscription</p>
              <Button onClick={() => setShowModal(true)}>Select Charity</Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Contribution History */}
      {contributions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={24} />
              Contribution History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400 font-medium">Date</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Charity</th>
                    <th className="text-right py-3 text-slate-400 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution) => (
                    <tr key={contribution.id} className="border-b border-slate-700 last:border-0">
                      <td className="py-3 text-slate-300">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-white">{contribution.charities?.name || 'N/A'}</td>
                      <td className="py-3 text-right text-emerald-400 font-semibold">
                        £{contribution.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-emerald-500/20">
                    <td colSpan={2} className="py-3 text-white font-semibold">Total Donated</td>
                    <td className="py-3 text-right text-emerald-400 font-bold text-lg">
                      £{totalContributed.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charity Impact */}
      {currentCharity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 border-emerald-700/50 p-6">
            <div className="text-center">
              <Heart className="mx-auto mb-3 text-emerald-400" size={32} fill="currentColor" />
              <h3 className="text-xl font-semibold text-white mb-2">Making a Difference</h3>
              <p className="text-slate-300">
                Your contributions are helping {currentCharity.name} make a real impact.
                Thank you for being part of the change!
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Change Charity Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Select Your Charity"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Search charities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* Charity Grid */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                onClick={() => setSelectedCharityId(charity.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCharityId === charity.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {charity.image_url && (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white">{charity.name}</div>
                    <div className="text-sm text-slate-400 line-clamp-1">
                      {charity.description}
                    </div>
                  </div>
                  {selectedCharityId === charity.id && (
                    <Heart className="text-emerald-400" size={20} fill="currentColor" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contribution Percentage Slider */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Contribution Percentage: {contributionPercentage}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={contributionPercentage}
              onChange={(e) => setContributionPercentage(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Monthly contribution: £{monthlyContribution}
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveCharity} className="w-full">
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
