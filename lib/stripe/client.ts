// ============================================================================
// Stripe Server Client
// Use in API routes and server actions only.
// ============================================================================

import Stripe from "stripe";

/**
 * Singleton Stripe client instance.
 * Configured with the latest stable API version.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
