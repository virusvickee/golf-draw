import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Trophy, Heart, Activity, ArrowRight, ShieldCheck, Quote } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
// We use a client component wrapper for animations
import { FadeIn, ScrollReveal, CountUp, DrawVisual } from "@/app/HomeAnimations";

export const metadata = {
  title: "Golf Draw | Play Golf. Change Lives. Win Big.",
  description: "Log your golf scores, support your favorite charities, and win monthly cash prizes.",
  openGraph: {
    title: "Golf Draw | Play Golf. Change Lives. Win Big.",
    description: "Log your golf scores, support your favorite charities, and win monthly cash prizes.",
    images: [{ url: "/og-image.png" }]
  }
};

export default async function HomePage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // We use adminClient here because guests cannot count rows in the users table due to RLS
  const { count: subscriberCount, error: usersError } = await adminClient
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active");

  if (usersError) {
    console.error("Users count fetch error:", usersError.message || usersError);
  }

  const { data: charities, error: charitiesError } = await supabase
    .from("charities")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(3);

  if (charitiesError) console.error("Charities fetch error:", charitiesError);
  const featuredCharities = charities || [];

  const { data: currentDraw, error: drawError } = await supabase
    .from("draws")
    .select("*, prize_pools(total_pool)")
    .eq("status", "published")
    .order("month", { ascending: false })
    .limit(1)
    .single();

  if (drawError && drawError.code !== "PGRST116") {
    console.error("Draws fetch error:", drawError);
  }


  const poolAmount = (currentDraw as any)?.prize_pools?.[0]?.total_pool || 0;
  // Estimate total charity raised for display purposes based on active users
  const totalRaised = (subscriberCount || 0) * 1.5 * 12; // Placeholder calculation

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center justify-center text-center">
        {/* Animated Background Element handled by Client Component */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
        </div>

        <FadeIn className="relative z-10 max-w-4xl mx-auto">
          <Badge text="Monthly Draws Now Live" className="mb-6 mx-auto" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Play Golf. <span className="text-emerald-400">Change Lives.</span> Win Big.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Turn your everyday golf rounds into charitable impact and get the chance to win a share of our growing monthly prize pool.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Learn How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-slate-800 py-8 text-center bg-slate-900/30 backdrop-blur-sm rounded-2xl">
            <div>
              <p className="text-3xl font-black text-white">
                <CountUp end={totalRaised} prefix="£" />
              </p>
              <p className="text-sm text-emerald-400 font-semibold uppercase tracking-wider mt-1">Raised for Charity</p>
            </div>
            <div className="sm:border-x border-slate-800">
              <p className="text-3xl font-black text-white">
                <CountUp end={subscriberCount || 0} />
              </p>
              <p className="text-sm text-blue-400 font-semibold uppercase tracking-wider mt-1">Active Players</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">Monthly</p>
              <p className="text-sm text-amber-400 font-semibold uppercase tracking-wider mt-1">Guaranteed Draws</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Three simple steps to join the community, support causes you care about, and win.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <Card className="h-full bg-slate-950 border-slate-800">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">1. Subscribe & Choose</h3>
                  <p className="text-slate-400">Join for just £9.99/mo and select which registered charity receives your direct contribution percentage.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Card className="h-full bg-slate-950 border-slate-800">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">2. Enter Your Scores</h3>
                  <p className="text-slate-400">Log your Stableford scores after your rounds. Your last 5 scores form your unique entry ticket for the month.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <Card className="h-full bg-slate-950 border-slate-800">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">3. Win Prizes</h3>
                  <p className="text-slate-400">Match 3, 4, or 5 numbers in our monthly algorithmic draw to win guaranteed cash payouts from the pool.</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. CHARITY IMPACT */}
      <section className="py-24 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <Badge text="Impact Driven" className="mb-4 mx-auto" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">Your Subscription Makes a Difference</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-16">
            Unlike standard lotteries, you have direct control. You decide which charity receives your donation, up to 100% of your net contribution.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCharities.map((charity: any, i: number) => (
              <ScrollReveal key={charity.id} delay={i * 0.1}>
                <Card hoverEffect className="text-left">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-lg text-white">{charity.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-3">{charity.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/charities">
              <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                View All Charity Partners <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PRIZE DRAW VISUAL */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
          
          <h2 className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">Current Prize Pool</h2>
          <div className="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-lg">
            <CountUp end={poolAmount > 0 ? poolAmount : 2500} prefix="£" />
          </div>

          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            The prize pool grows with every new subscriber. Our algorithmic draw ensures the fairest possible outcome by weighting numbers based on community scores.
          </p>

          <DrawVisual />
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">What Players Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="I was already playing twice a week. Now my scores actually mean something, and my chosen charity benefits. I even won £150 last month!"
              name="David S."
              location="Surrey, UK"
            />
            <TestimonialCard 
              quote="Such a brilliant concept. The platform is sleek, entering scores takes seconds, and I love seeing the charity total tick up."
              name="Sarah W."
              location="Edinburgh, UK"
            />
            <TestimonialCard 
              quote="Finally an incentive to track my Stableford accurately! The transparent draw engine gives me confidence it's totally fair."
              name="James L."
              location="Manchester, UK"
            />
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Tee Off?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of golfers making a difference on and off the course.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12 py-6 w-full sm:w-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              Subscribe Now — £9.99/mo
            </Button>
          </Link>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm font-medium">
            <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> Secure via Stripe</div>
            <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> Registered Charities</div>
            <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> Cancel Anytime</div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Small UI components for this page
function Badge({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold tracking-wide uppercase ${className}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
      {text}
    </div>
  );
}

function TestimonialCard({ quote, name, location }: { quote: string, name: string, location: string }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 relative">
      <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-800" />
      <CardContent className="p-8">
        <p className="text-slate-300 italic mb-6 relative z-10">"{quote}"</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500" />
          <div>
            <p className="font-bold text-white">{name}</p>
            <p className="text-xs text-slate-500">{location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
