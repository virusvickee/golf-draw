// ============================================================================
// POST /api/stripe/create-checkout
// Creates a Stripe Checkout session for a new subscription.
// ============================================================================

import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/helpers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check env vars
    console.log('Stripe key:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING');
    console.log('Price monthly:', process.env.STRIPE_PRICE_MONTHLY ? 'SET' : 'MISSING');
    console.log('Price yearly:', process.env.STRIPE_PRICE_YEARLY ? 'SET' : 'MISSING');

    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let plan: "monthly" | "yearly";
    try {
      const body = await request.json();
      plan = body.plan;
      if (plan !== "monthly" && plan !== "yearly") {
        return NextResponse.json({ error: "Plan must be 'monthly' or 'yearly'" }, { status: 400 });
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Fetch or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: profile?.email ?? user.email,
          name: profile?.full_name ?? undefined,
          metadata: { supabase_user_id: user.id },
        });

        customerId = customer.id;

        // Persist the new customer ID atomically
        const { error: updateError, count } = await supabase
          .from("users")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id)
          .is("stripe_customer_id", null)
          .select("id");

        if (updateError || !count || count === 0) {
          throw new Error("Failed to persist stripe_customer_id or concurrent update occurred");
        }
      } catch (err) {
        console.error("Stripe customer creation error:", err);
        if (customerId) {
          try {
            await stripe.customers.del(customerId);
          } catch (delErr) {
            console.error("Failed to cleanup orphaned stripe customer:", delErr);
          }
        }
        return NextResponse.json({ 
          error: "Failed to create customer profile",
          details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Price IDs — set these as env vars per plan
    const priceId = plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      console.error(`Missing Stripe price ID for plan: ${plan}`);
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: getURL("dashboard?subscription=success"),
      cancel_url: getURL("pricing"),
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error details:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
