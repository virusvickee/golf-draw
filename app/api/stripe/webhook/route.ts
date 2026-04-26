// ============================================================================
// POST /api/stripe/webhook
// Handles incoming Stripe webhook events.
// ============================================================================

import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/** Events we care about */
const HANDLED_EVENTS: Stripe.Event.Type[] = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
];

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook error";
    console.error("[Stripe Webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!HANDLED_EVENTS.includes(event.type)) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find the user by stripe_customer_id
        const { data: user } = await (supabase.from("users") as any)
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!user) {
          console.warn(`[Stripe Webhook] No user found for stripe_customer_id: ${customerId}`);
          break;
        }

        const plan =
          subscription.items.data[0]?.price.recurring?.interval === "year"
            ? "yearly"
            : "monthly";

        // Upsert subscription record
        const { error: subError } = await (supabase.from("subscriptions") as any).upsert({
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          plan,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        }, { onConflict: "stripe_subscription_id" });
        if (subError) console.error("[Stripe Webhook] Failed to upsert subscription", subError);

        // Sync status back to users table
        const dbStatus =
          subscription.status === "active" ? "active" : "inactive";

        const { error: userError } = await (supabase.from("users") as any)
          .update({ subscription_status: dbStatus, subscription_plan: plan })
          .eq("id", user.id);
        if (userError) console.error("[Stripe Webhook] Failed to sync user status", userError);

        // Send email if it just became active
        if (subscription.status === "active") {
          const { data: userDetails } = await (supabase.from("users") as any).select("email").eq("id", user.id).single();
          if (userDetails?.email) {
            try {
              const emailRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || "" },
                body: JSON.stringify({
                  to: userDetails.email,
                  template: 'subscription_confirmed',
                  data: {
                    plan: plan,
                    amount: plan === 'yearly' ? '£99.00 / year' : '£9.99 / month',
                    nextRenewal: new Date(subscription.current_period_end * 1000).toLocaleDateString()
                  }
                })
              });
              if (!emailRes.ok) console.error("[Stripe Webhook] Failed to send subscription confirmed email", await emailRes.text());
            } catch (err) {
              console.error("[Stripe Webhook] Error sending email", err);
            }
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error: subDelError } = await (supabase.from("subscriptions") as any)
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);
        if (subDelError) console.error("[Stripe Webhook] Failed to update subscription status to cancelled", subDelError);

        const customerId = subscription.customer as string;
        const { error: userDelError } = await (supabase.from("users") as any)
          .update({ subscription_status: "cancelled" })
          .eq("stripe_customer_id", customerId);
        if (userDelError) console.error("[Stripe Webhook] Failed to update user status to cancelled", userDelError);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error: failError } = await (supabase.from("users") as any)
          .update({ subscription_status: "lapsed" })
          .eq("stripe_customer_id", customerId);
        if (failError) console.error("[Stripe Webhook] Failed to update user status to lapsed", failError);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error: succError } = await (supabase.from("users") as any)
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);
        if (succError) console.error("[Stripe Webhook] Failed to update user status to active on payment success", succError);

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
