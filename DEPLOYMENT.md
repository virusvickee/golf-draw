# Golf Draw Platform — Deployment Guide

This document outlines the step-by-step process for deploying the Golf Draw platform to production using Vercel and Supabase.

## Prerequisites
1. **GitHub Repository**: Ensure all local code is pushed to your main branch.
2. **Vercel Account**: Create a new Vercel account specifically for this project (or log into the designated organizational account). Do not use a personal testing account.
3. **Supabase Project**: Ensure your production Supabase database is active and migrations have been run.
4. **Stripe Account**: Ensure you have access to your live Stripe dashboard.

---

## 1. Vercel Project Setup
1. Log in to your Vercel Dashboard.
2. Click **Add New...** -> **Project**.
3. Import the `golf-draw` repository from GitHub.
4. Vercel will automatically detect the Next.js framework (as specified in `vercel.json`). Keep the default build settings.

## 2. Environment Variables configuration
Before clicking "Deploy", you must add the following Environment Variables in the Vercel dashboard:

### Essential URLs
- `NEXT_PUBLIC_APP_URL` — Your exact production domain (e.g., `https://golfdraw.com`)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` — Your production Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — The public anon key for your database.
- `SUPABASE_SERVICE_ROLE_KEY` — The secret service_role key for admin-level operations.

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Your Live Stripe publishable key.
- `STRIPE_SECRET_KEY` — Your Live Stripe secret key.
- `STRIPE_WEBHOOK_SECRET` — **Skip for now**, we will generate this in step 4.
- `STRIPE_PRICE_MONTHLY` — Your live monthly price ID (e.g., `price_xxx`).
- `STRIPE_PRICE_YEARLY` — Your live yearly price ID (e.g., `price_yyy`).

### Email (Resend) & Security
- `RESEND_API_KEY` — Your live Resend API key.
- `INTERNAL_API_SECRET` — A randomly generated long string (e.g., run `openssl rand -hex 32` in your terminal). This secures the `/api/email/send` route from external requests.

## 3. First Deployment
1. Click **Deploy** in Vercel.
2. Wait for the build to complete. Your site is now live at your production Vercel URL!

## 4. Stripe Webhook Configuration
Now that your site is live, you must connect Stripe to your backend.
1. Open your Stripe Dashboard and navigate to **Developers** -> **Webhooks**.
2. Click **Add an endpoint**.
3. Set the Endpoint URL to: `https://[YOUR_PRODUCTION_DOMAIN]/api/stripe/webhook`
4. Select the following events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**.
6. Reveal the **Signing Secret** (starts with `whsec_...`).
7. Go back to Vercel, navigate to your project **Settings** -> **Environment Variables**.
8. Add `STRIPE_WEBHOOK_SECRET` and paste the signing secret.
9. **Redeploy** your project in Vercel to apply the new variable.

## 5. Final Verification
1. Access your live URL.
2. Run through the `test-checklist.md` to ensure all workflows (auth, stripe, drawing, emails) function correctly in the production environment.
