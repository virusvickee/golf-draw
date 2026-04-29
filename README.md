<div align="center">

```
  ⛳ GOLF DRAW
```

### Play Golf. Change Lives. Win Big.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase) ![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel) ![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-golf--draw--lake.vercel.app-emerald?style=for-the-badge)](https://golf-draw-lake.vercel.app)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture & Tech Stack](#️-architecture--tech-stack)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [⚙️ Getting Started](#️-getting-started)
- [🎮 How It Works](#-how-it-works)
- [🔑 Test Credentials](#-test-credentials)
- [📧 Email Notifications](#-email-notifications)
- [🛡️ Security Features](#️-security-features)
- [🚀 Deployment](#-deployment)
- [📊 Prize Pool Logic](#-prize-pool-logic)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### Platform Features
🔐 Secure Authentication (Supabase Auth)<br>
💳 Subscription System (Stripe)<br>
⛳ Golf Score Tracking (Stableford)<br>
🎰 Monthly Prize Draw Engine<br>
🏆 Winner Verification System<br>
❤️ Charity Contribution System<br>
📧 Email Notifications (6 templates)<br>
👑 Full Admin Panel<br>
📊 Analytics & Reports<br>
📱 Mobile Responsive

</td>
<td width="33%" valign="top">

### Draw Engine
🎲 Random draw mode<br>
🧮 Algorithmic weighted draw<br>
🏅 3/4/5 number match tiers<br>
💰 Automatic prize pool calculation<br>
🔄 Jackpot rollover system<br>
🔍 Pre-publish simulation mode

</td>
<td width="33%" valign="top">

### User Experience
📝 Simple registration flow<br>
🎯 Choose your charity<br>
📈 Track your scores<br>
🎟️ Automatic draw entry<br>
🏆 Real-time results<br>
💸 Transparent prize distribution<br>
📱 Email notifications<br>
🔒 Secure payment processing

</td>
</tr>
</table>

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (Turbopack) | App Router, SSR, SSG |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Animation** | Framer Motion | Micro-interactions |
| **Database** | Supabase (PostgreSQL) | Data storage |
| **Auth** | Supabase Auth | User authentication |
| **Storage** | Supabase Storage | File uploads |
| **Payments** | Stripe (API `2026-04-22.dahlia`) | Subscriptions |
| **Email** | Resend + React Email | Notifications |
| **Deployment** | Vercel | Hosting + CI/CD |
| **Validation** | Zod | Schema validation |
| **Charts** | Recharts | Admin analytics |

---

## 📁 Project Structure

```
golf-draw/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── admin/
│   │   ├── users/
│   │   ├── draws/
│   │   ├── charities/
│   │   ├── winners/
│   │   └── reports/
│   ├── dashboard/
│   │   ├── scores/
│   │   ├── draws/
│   │   ├── charity/
│   │   └── winnings/
│   ├── charities/
│   ├── subscribe/
│   └── api/
│       ├── auth/
│       ├── scores/
│       ├── stripe/
│       ├── admin/
│       └── email/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Slider.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── draw/
│   └── email/
├── emails/
├── hooks/
├── types/
└── scripts/
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| **users** | User profiles, roles, subscription status |
| **scores** | Golf scores (rolling 5, Stableford 1-45) |
| **subscriptions** | Stripe subscription data |
| **charities** | Charity directory and profiles |
| **draws** | Monthly draw records and results |
| **draw_entries** | User participation per draw |
| **prize_pools** | Prize tier calculations |
| **winners** | Winner records and verification |
| **contributions** | Charity contribution tracking |

---

## ⚙️ Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### 1. Clone & Install

```bash
git clone https://github.com/virusvickee/golf-draw.git
cd golf-draw
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
# Fill in your credentials
```

### 3. Environment Variables

| Variable | Description | Where to get | Required |
|---|---|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe → Developers → API Keys | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe → Developers → API Keys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe → Webhooks | ✅ |
| `STRIPE_PRICE_MONTHLY` | Monthly price ID | Stripe → Products | ✅ |
| `STRIPE_PRICE_YEARLY` | Yearly price ID | Stripe → Products | ✅ |
| `NEXT_PUBLIC_APP_URL` | App base URL | Your domain | ✅ |
| `RESEND_API_KEY` | Email service key | resend.com | ✅ |
| `INTERNAL_API_SECRET` | Internal API protection | Any random string | ✅ |

### 4. Supabase Setup

```bash
# Run migration in Supabase SQL Editor
# Copy contents of: supabase/migrations/001_initial_schema.sql
# Paste and run in: Supabase → SQL Editor
```

### 5. Seed Database

```bash
npx ts-node scripts/seed.ts
```

### 6. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🎮 How It Works

1. **📝 User registers** and selects a charity
2. **💳 User subscribes** (£9.99/mo or £99/yr)
3. **⛳ User enters** up to 5 Stableford scores (1-45)
4. **🎰 Admin runs** monthly draw (random or algorithmic)
5. **🔍 System compares** drawn numbers vs user scores
6. **🏆 Winners identified** (3/4/5 number matches)
7. **💰 Prize pool distributed** automatically:
   - **5 Match** → 40% (Jackpot, rolls over if unclaimed)
   - **4 Match** → 35%
   - **3 Match** → 25%
8. **📧 Winners notified** by email
9. **✅ Winners upload proof** → Admin verifies → Payout

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| 👑 **Admin** | admin@golfdraw.com | password123 |
| ⛳ **Golfer 1** | golfer1@golfdraw.com | password123 |
| ⛳ **Golfer 2** | golfer2@golfdraw.com | password123 |

### Stripe Test Card

```
Card Number: 4242 4242 4242 4242
Expiry: 12/29
CVC: 123
ZIP: 12345
```

---

## 📧 Email Notifications

| Template | Trigger | Description |
|---|---|---|
| **WelcomeEmail** | On register | Welcome + charity info |
| **SubscriptionConfirmed** | Payment success | Plan details + renewal |
| **DrawResults** | Draw published | Numbers + match results |
| **WinnerEmail** | Winner identified | Prize amount + proof instructions |
| **PayoutConfirmed** | Admin marks paid | Payment confirmation |
| **PasswordReset** | Reset requested | Reset link |

---

## 🛡️ Security Features

- ✅ JWT Authentication (Supabase Auth)
- ✅ Row Level Security (RLS) on all tables
- ✅ Zod validation on all API routes
- ✅ Security headers (X-Frame-Options, CSP)
- ✅ Stripe webhook signature verification
- ✅ Admin role middleware protection
- ✅ HTTPS enforced on Vercel
- ✅ Environment variables never exposed

---

## 🚀 Deployment

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/virusvickee/golf-draw)

</div>

### Manual Deployment Steps

1. **Push to GitHub** (if not already done)
2. **Import to Vercel** from your GitHub repository
3. **Add environment variables** in Vercel dashboard
4. **Deploy** and wait for build to complete
5. **Configure Stripe webhook** with your Vercel URL
6. **Test** the live application

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📊 Prize Pool Logic

| Match Type | Pool Share | Rollover | Example (100 users @ £9.99) |
|---|:---:|:---:|---|
| **5 Numbers** | 40% | ✅ Yes (Jackpot) | ~£399 |
| **4 Numbers** | 35% | ❌ No | ~£349 |
| **3 Numbers** | 25% | ❌ No | ~£249 |

**Total Prize Pool:** Number of active subscribers × subscription price × 0.XX (after platform costs)

---

## 🗺️ Roadmap

- [x] Core subscription system
- [x] Score management
- [x] Draw engine
- [x] Admin panel
- [x] Email notifications
- [x] Winner verification
- [x] Production deployment on Vercel
- [ ] Mobile app (React Native)
- [ ] Corporate/team accounts
- [ ] Multi-country support
- [ ] Social leaderboards
- [ ] Campaign module
- [ ] Live draw streaming

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Built for **Digital Heroes** selection process
- [digitalheroes.co.in](https://digitalheroes.co.in)
- Special thanks to the open source community
- Inspired by the intersection of sports, technology, and social impact

---

<div align="center">

**Made with ❤️ for Digital Heroes** · [digitalheroes.co.in](https://digitalheroes.co.in)

</div>
