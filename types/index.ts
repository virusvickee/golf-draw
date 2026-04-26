// ============================================================================
// Golf Draw — TypeScript Type Definitions
// All types mirror the Supabase PostgreSQL schema exactly.
// ============================================================================

// ---------------------------------------------------------------------------
// Enum types (matching PostgreSQL custom enums)
// ---------------------------------------------------------------------------

export type UserRole = "subscriber" | "admin";

export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "lapsed";

export type SubscriptionPlan = "monthly" | "yearly";

export type DrawType = "random" | "algorithmic";

export type DrawStatus = "draft" | "simulated" | "published";

export type MatchType = "match_3" | "match_4" | "match_5";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type PaymentStatus = "unpaid" | "paid";

// ---------------------------------------------------------------------------
// Table interfaces
// ---------------------------------------------------------------------------

/** Application-level user profile (extends Supabase auth.users). */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  stripe_customer_id: string | null;
  charity_id: string | null;
  charity_contribution_percentage: number;
  created_at: string;
  updated_at: string;
}

/** Daily golf score submitted by a user (range 1–45). */
export interface Score {
  id: string;
  user_id: string;
  score: number;
  date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
}

/** A registered charity that users can contribute to. */
export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

/** Stripe subscription record synced via webhooks. */
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan: SubscriptionPlan;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

/** A monthly prize draw with 5 drawn numbers. */
export interface Draw {
  id: string;
  month: string; // ISO date string — first day of draw month
  drawn_numbers: number[];
  draw_type: DrawType;
  status: DrawStatus;
  jackpot_carried_over: boolean;
  jackpot_amount: number;
  created_at: string;
}

/** A user's entry into a specific monthly draw. */
export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores_snapshot: number[];
  match_count: number;
  prize_amount: number;
  created_at: string;
}

/** Prize pool breakdown for a draw (40/35/25 tier split). */
export interface PrizePool {
  id: string;
  draw_id: string;
  total_pool: number;
  tier_5_pool: number;
  tier_4_pool: number;
  tier_3_pool: number;
  jackpot_rollover: number;
  created_at: string;
}

/** A verified winner from a draw entry. */
export interface Winner {
  id: string;
  draw_entry_id: string;
  user_id: string;
  match_type: MatchType;
  prize_amount: number;
  proof_url: string | null;
  verification_status: VerificationStatus;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

/** Charity contribution record tied to a subscription payment. */
export interface Contribution {
  id: string;
  user_id: string;
  charity_id: string;
  subscription_id: string;
  amount: number;
  percentage: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Supabase Database type map (for typed client usage)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { id: string; email: string };
        Update: Partial<User>;
      };
      scores: {
        Row: Score;
        Insert: Partial<Score> & { user_id: string; score: number; date: string };
        Update: Partial<Score>;
      };
      charities: {
        Row: Charity;
        Insert: Partial<Charity> & { name: string };
        Update: Partial<Charity>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string; stripe_subscription_id: string };
        Update: Partial<Subscription>;
      };
      draws: {
        Row: Draw;
        Insert: Partial<Draw> & { month: string; drawn_numbers: number[] };
        Update: Partial<Draw>;
      };
      draw_entries: {
        Row: DrawEntry;
        Insert: Partial<DrawEntry> & { draw_id: string; user_id: string; scores_snapshot: number[] };
        Update: Partial<DrawEntry>;
      };
      prize_pools: {
        Row: PrizePool;
        Insert: Partial<PrizePool> & { draw_id: string; total_pool: number };
        Update: Partial<PrizePool>;
      };
      winners: {
        Row: Winner;
        Insert: Partial<Winner> & { draw_entry_id: string; user_id: string; match_type: MatchType; prize_amount: number };
        Update: Partial<Winner>;
      };
      contributions: {
        Row: Contribution;
        Insert: Partial<Contribution> & { user_id: string; charity_id: string; subscription_id: string; amount: number; percentage: number };
        Update: Partial<Contribution>;
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_status: SubscriptionStatus;
      subscription_plan: SubscriptionPlan;
      draw_type: DrawType;
      draw_status: DrawStatus;
      match_type: MatchType;
      verification_status: VerificationStatus;
      payment_status: PaymentStatus;
    };
  };
}
