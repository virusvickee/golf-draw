// ============================================================================
// Stripe Server Client
// Use in API routes and server actions only.
// ============================================================================

import Stripe from "stripe";

/**
 * Singleton Stripe client instance.
 * Configured with the latest stable API version.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});
