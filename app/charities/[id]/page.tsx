import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";
import { DonationWidget } from "@/components/charity/DonationWidget";

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

          {/* Independent Donation Widget */}
          <DonationWidget charity={charity} />

          {/* Upcoming Events Section */}
          <section className="mt-8 mb-10 pt-8 border-t border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-emerald-500 rounded-full" />
              Upcoming Events
            </h2>
            
            {charity.events && charity.events.length > 0 ? (
              <div className="grid gap-6">
                {(charity.events as any[]).map((event, index) => (
                  <div key={index} className="bg-slate-950 rounded-xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                          {event.name}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <p className="text-slate-300 flex items-center gap-2">
                            <span className="text-emerald-500">📅</span>
                            {new Date(event.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-slate-300 flex items-center gap-2">
                            <span className="text-emerald-500">📍</span>
                            {event.location}
                          </p>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      <a 
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto bg-slate-900 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all text-center"
                      >
                        Learn More →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950/50 rounded-xl p-8 border border-dashed border-slate-800 text-center">
                <p className="text-slate-500 italic">
                  No upcoming events scheduled at the moment. Check back soon!
                </p>
              </div>
            )}
          </section>
          
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
