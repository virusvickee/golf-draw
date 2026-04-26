"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { format } from "date-fns";

export default function UserDrawsPage() {
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDraws = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("draw_entries")
        .select(`
          *,
          draws (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setEntries(data);
      setLoading(false);
    };
    fetchDraws();
  }, []);

  if (loading) return <LoadingSpinner variant="full-page" />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Draws" description="View your past entries and match results." />

      <div className="grid gap-6">
        {entries.map(entry => {
          const draw = entry.draws;
          // Calculate matches specifically to highlight them
          const matchSet = new Set(draw.drawn_numbers || []);
          
          return (
            <Card key={entry.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {format(new Date(draw.month), "MMMM yyyy")} Draw
                    </h3>
                    <p className="text-sm text-slate-400">
                      You matched {entry.match_count} out of 5 numbers.
                    </p>
                  </div>
                  {entry.match_count >= 3 && (
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold text-center">
                      Winner!
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Your Scores</p>
                    <div className="flex gap-2">
                      {entry.scores_snapshot.map((score: number, idx: number) => {
                        const isMatch = matchSet.has(score);
                        return (
                          <div 
                            key={idx} 
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                              isMatch 
                                ? 'bg-emerald-500 text-white border-emerald-400' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {score}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Drawn Numbers</p>
                    <div className="flex gap-2">
                      {draw.drawn_numbers?.map((score: number, idx: number) => (
                        <div 
                          key={idx} 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-500 text-white border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        >
                          {score}
                        </div>
                      ))}
                      {!draw.drawn_numbers && (
                        <p className="text-slate-400 italic text-sm py-2">Draw pending...</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {entries.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            You haven't participated in any draws yet. Ensure your subscription is active and you have 5 scores logged before the end of the month!
          </div>
        )}
      </div>
    </div>
  );
}
