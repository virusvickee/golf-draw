import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";

export default async function CharityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: charity } = await (supabase.from("charities") as any).select("*").eq("id", resolvedParams.id).single();
  
  if (!charity) return notFound();

  return (
    <main className="min-h-screen px-4 py-16 max-w-4xl mx-auto">
      <Link href="/charities" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium mb-8 inline-block">
        ← Back to Charities
      </Link>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-emerald-900 to-slate-900 flex items-center justify-center">
          <Heart className="w-16 h-16 text-emerald-500/50" />
        </div>
        
        <div className="p-8 md:p-12">
          <h1 className="text-4xl font-black text-white mb-4">{charity.name}</h1>
          
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-lg text-slate-300 leading-relaxed">
              {charity.description || "This charity is part of the Golf Draw platform, receiving direct contributions from our subscribers to fund their operations and campaigns."}
            </p>
          </div>
          
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Support this charity</h3>
              <p className="text-sm text-slate-400">
                You can select {charity.name} during registration, or update your preference in your dashboard settings.
              </p>
            </div>
            <Link href="/register">
              <Button size="lg" className="whitespace-nowrap">Join & Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
