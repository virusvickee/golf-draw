"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Heart } from "lucide-react";

export default function CharitiesPublicPage() {
  const [charities, setCharities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchCharities = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("charities").select("*").eq("is_active", true).order("is_featured", { ascending: false }).order("name");
      if (data) setCharities(data);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen px-4 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <PageHeader 
          title="Our Charity Partners" 
          description="10% of every subscription goes directly to the charity of your choice. Discover who you can support below."
          className="flex-col justify-center items-center text-center gap-2 mb-0"
        />
      </div>

      <div className="max-w-xl mx-auto mb-12">
        <Input 
          placeholder="Search charities..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="bg-slate-900/80"
        />
      </div>

      {loading ? (
        <LoadingSpinner variant="full-page" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(charity => (
            <Card key={charity.id} hoverEffect className="flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-emerald-500" />
                  </div>
                  {charity.is_featured && <Badge variant="warning">Featured</Badge>}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{charity.name}</h3>
                <p className="text-slate-400 text-sm flex-1 mb-6">{charity.description || "No description provided."}</p>
                
                <Link href={`/charities/${charity.id}`} className="mt-auto block">
                  <Button variant="secondary" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              No charities found matching your search.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
