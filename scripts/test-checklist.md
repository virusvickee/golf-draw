# Manual Testing Checklist — Golf Draw Platform

Run through this checklist in your live/staging environment before launching to the public.

## Public Visitor Flows
- [ ] Public visitor can view the homepage perfectly formatted.
- [ ] Homepage animations trigger smoothly on scroll.
- [ ] Public visitor can navigate to and view the public Charities directory.
- [ ] 404 page shows correctly when accessing an invalid URL.

## Authentication & Registration
- [ ] User can complete the 2-step registration flow.
- [ ] User receives the "Welcome to Golf Draw" email via Resend.
- [ ] Upon registration, the user is successfully redirected to the `/subscribe` checkout page.
- [ ] User can log in with their credentials.
- [ ] User can request a password reset and receives the corresponding email.

## Subscriptions & Stripe
- [ ] Monthly subscription checkout works via Stripe.
- [ ] Yearly subscription checkout works via Stripe.
- [ ] User receives the "Subscription Confirmed" email after successful payment.
- [ ] User's `subscription_status` changes to "active" in the database.

## Player Dashboard
- [ ] Dashboard Overview loads without console errors.
- [ ] User can enter up to 5 Stableford scores.
- [ ] Submitting a duplicate date is successfully rejected.
- [ ] Submitting a 6th score correctly replaces the oldest score in the rolling 5 limit.
- [ ] User can successfully edit an existing score.
- [ ] User can successfully delete an existing score.

## Admin Panel & Draw Engine
- [ ] Admin user can log into the Admin portal (`/admin`).
- [ ] Non-admin user is correctly blocked from `/admin` routes.
- [ ] Admin Reports (Recharts) render correctly on desktop and mobile.
- [ ] Admin can create a new Draw draft.
- [ ] Admin can "Simulate" the draw and preview the matching results and prize pool split.
- [ ] Admin can "Publish" the draw.

## Post-Draw Workflows
- [ ] All active subscribers receive the "Draw Results" email showcasing their snapshot.
- [ ] Identifying Winners: The system correctly generated Winner records for matched players.
- [ ] Winners receive the "You Won!" email with instructions to upload proof.
- [ ] Winner can navigate to `/dashboard/winnings` and click "Upload Scorecard Proof".
- [ ] Admin can view the pending winner and Approve/Reject their proof.
- [ ] Admin can mark an approved payout as "Complete".
- [ ] User receives the "Payment Sent" confirmation email.

## Quality Assurance
- [ ] All pages are fully mobile responsive.
- [ ] No React hydration or console errors on any page.
- [ ] Page load times feel snappy (under 3 seconds).
