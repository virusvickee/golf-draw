-- ============================================================================
-- Golf Draw — Initial Database Schema
-- Version: 1.0.0
-- Description: Complete schema for the Golf Draw subscription-based
--              golf score tracking, monthly prize draw, and charity
--              fundraising platform.
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

-- User role within the platform
CREATE TYPE public.user_role AS ENUM ('subscriber', 'admin');

-- Subscription lifecycle status
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'lapsed');

-- Subscription billing cadence
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'yearly');

-- How the draw numbers are generated
CREATE TYPE public.draw_type AS ENUM ('random', 'algorithmic');

-- Draw publishing workflow status
CREATE TYPE public.draw_status AS ENUM ('draft', 'simulated', 'published');

-- Prize tier match type
CREATE TYPE public.match_type AS ENUM ('match_3', 'match_4', 'match_5');

-- Winner verification workflow status
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Winner payment status
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid');


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------
-- Charities (created first — referenced by users)
-- ----------------------------
CREATE TABLE public.charities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.charities IS 'Registered charities that users can direct their contributions to.';


-- ----------------------------
-- Users (extends Supabase auth.users)
-- ----------------------------
CREATE TABLE public.users (
  id                              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                           TEXT NOT NULL,
  full_name                       TEXT,
  role                            public.user_role NOT NULL DEFAULT 'subscriber',
  subscription_status             public.subscription_status NOT NULL DEFAULT 'inactive',
  subscription_plan               public.subscription_plan,
  stripe_customer_id              TEXT UNIQUE,
  charity_id                      UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_contribution_percentage INTEGER NOT NULL DEFAULT 10
    CHECK (charity_contribution_percentage BETWEEN 0 AND 100),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Application-level user profile linked to Supabase Auth.';

-- Index for fast Stripe lookups (webhook handling)
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);


-- ----------------------------
-- Scores (daily golf scores)
-- ----------------------------
CREATE TABLE public.scores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 45),
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user may submit only one score per day
  CONSTRAINT uq_scores_user_date UNIQUE (user_id, date)
);

COMMENT ON TABLE public.scores IS 'Daily golf scores submitted by users (range 1–45).';

CREATE INDEX idx_scores_user_date ON public.scores(user_id, date DESC);


-- ----------------------------
-- Subscriptions
-- ----------------------------
CREATE TABLE public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan                   public.subscription_plan NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'active',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records synced via webhooks.';

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);


-- ----------------------------
-- Draws (monthly prize draws)
-- ----------------------------
CREATE TABLE public.draws (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month                 DATE NOT NULL UNIQUE,          -- first day of the draw month
  drawn_numbers         INTEGER[] NOT NULL DEFAULT '{}', -- 5 drawn numbers
  draw_type             public.draw_type NOT NULL DEFAULT 'random',
  status                public.draw_status NOT NULL DEFAULT 'draft',
  jackpot_carried_over  BOOLEAN NOT NULL DEFAULT false,
  jackpot_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.draws IS 'Monthly prize draws with 5 drawn numbers.';


-- ----------------------------
-- Draw Entries
-- ----------------------------
CREATE TABLE public.draw_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id          UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scores_snapshot  INTEGER[] NOT NULL DEFAULT '{}',   -- user's 5 scores at draw time
  match_count      INTEGER NOT NULL DEFAULT 0 CHECK (match_count BETWEEN 0 AND 5),
  prize_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user enters a draw only once
  CONSTRAINT uq_draw_entries_draw_user UNIQUE (draw_id, user_id)
);

COMMENT ON TABLE public.draw_entries IS 'Per-user entries into a monthly draw with score snapshots.';

CREATE INDEX idx_draw_entries_draw ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user ON public.draw_entries(user_id);


-- ----------------------------
-- Prize Pools
-- ----------------------------
CREATE TABLE public.prize_pools (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id           UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE UNIQUE,
  total_pool        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tier_5_pool       NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 40%
  tier_4_pool       NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 35%
  tier_3_pool       NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 25%
  jackpot_rollover  NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.prize_pools IS 'Prize pool breakdown per draw (40/35/25 split).';


-- ----------------------------
-- Winners
-- ----------------------------
CREATE TABLE public.winners (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_entry_id       UUID NOT NULL REFERENCES public.draw_entries(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_type          public.match_type NOT NULL,
  prize_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  proof_url           TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  payment_status      public.payment_status NOT NULL DEFAULT 'unpaid',
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.winners IS 'Verified winners from draw entries.';

CREATE INDEX idx_winners_user ON public.winners(user_id);
CREATE INDEX idx_winners_draw_entry ON public.winners(draw_entry_id);


-- ----------------------------
-- Contributions (charity donations from subscriptions)
-- ----------------------------
CREATE TABLE public.contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  charity_id      UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  percentage      INTEGER NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contributions IS 'Charity contribution records tied to subscription payments.';

CREATE INDEX idx_contributions_user ON public.contributions(user_id);
CREATE INDEX idx_contributions_charity ON public.contributions(charity_id);


-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions  ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- Helper: check if the current user is an admin
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ----------------------------------------
-- USERS
-- ----------------------------------------
-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_admin_select"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- Admins can update any user
CREATE POLICY "users_admin_update"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- Admins can delete any user
CREATE POLICY "users_admin_delete"
  ON public.users FOR DELETE
  USING (public.is_admin());


-- ----------------------------------------
-- SCORES
-- ----------------------------------------
CREATE POLICY "scores_select_own"
  ON public.scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_update_own"
  ON public.scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_delete_own"
  ON public.scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "scores_admin_all"
  ON public.scores FOR ALL
  USING (public.is_admin());


-- ----------------------------------------
-- CHARITIES (public read, admin write)
-- ----------------------------------------
CREATE POLICY "charities_public_select"
  ON public.charities FOR SELECT
  USING (true);

CREATE POLICY "charities_admin_insert"
  ON public.charities FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "charities_admin_update"
  ON public.charities FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "charities_admin_delete"
  ON public.charities FOR DELETE
  USING (public.is_admin());


-- ----------------------------------------
-- SUBSCRIPTIONS
-- ----------------------------------------
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin_all"
  ON public.subscriptions FOR ALL
  USING (public.is_admin());


-- ----------------------------------------
-- DRAWS (public read published, admin full access)
-- ----------------------------------------
CREATE POLICY "draws_public_select_published"
  ON public.draws FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "draws_admin_insert"
  ON public.draws FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "draws_admin_update"
  ON public.draws FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "draws_admin_delete"
  ON public.draws FOR DELETE
  USING (public.is_admin());


-- ----------------------------------------
-- DRAW ENTRIES
-- ----------------------------------------
CREATE POLICY "draw_entries_select_own"
  ON public.draw_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "draw_entries_admin_all"
  ON public.draw_entries FOR ALL
  USING (public.is_admin());


-- ----------------------------------------
-- PRIZE POOLS (public read, admin write)
-- ----------------------------------------
CREATE POLICY "prize_pools_public_select"
  ON public.prize_pools FOR SELECT
  USING (true);

CREATE POLICY "prize_pools_admin_insert"
  ON public.prize_pools FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "prize_pools_admin_update"
  ON public.prize_pools FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "prize_pools_admin_delete"
  ON public.prize_pools FOR DELETE
  USING (public.is_admin());


-- ----------------------------------------
-- WINNERS
-- ----------------------------------------
CREATE POLICY "winners_select_own"
  ON public.winners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "winners_admin_all"
  ON public.winners FOR ALL
  USING (public.is_admin());


-- ----------------------------------------
-- CONTRIBUTIONS
-- ----------------------------------------
CREATE POLICY "contributions_select_own"
  ON public.contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "contributions_admin_all"
  ON public.contributions FOR ALL
  USING (public.is_admin());


-- ============================================================================
-- 4. TRIGGER: Auto-create user profile on sign-up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 5. TRIGGER: Update users.updated_at (optional helper column)
-- ============================================================================

-- Add updated_at column to users
ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
