declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    STRIPE_MONTHLY_PRICE_ID: string
    STRIPE_YEARLY_PRICE_ID: string
    NEXT_PUBLIC_APP_URL: string
    RESEND_API_KEY: string
  }
}
