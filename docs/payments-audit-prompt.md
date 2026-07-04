# Payments / Trial / Subscription Audit Prompt

Use this when auditing the paywall end-to-end before launch.

## Scope
1. Trial expired → access blocked
2. Subscription lapsed / canceled → access blocked
3. Stripe webhook events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`
4. `check-subscription` sync with `subscribers` table
5. `ProtectedRoute` client-side gate matches DB truth
6. Grace period / dunning (`past_due`, `unpaid`)
7. Elite direct payment (no trial)
8. Coach commissions (70/30) + Stripe Connect payouts
9. Ebook / course / coach content one-time entitlements

## Discovery queries
```sql
-- Lapsed but still marked subscribed
SELECT email, subscribed, subscription_tier, subscription_status, subscription_end
FROM subscribers
WHERE subscribed = true AND subscription_end IS NOT NULL AND subscription_end < now();

-- Trialing users
SELECT email, subscription_end
FROM subscribers
WHERE subscription_status = 'trialing';

-- Users with tier but not subscribed (inconsistent)
SELECT email, subscribed, subscription_tier, subscription_end
FROM subscribers
WHERE subscribed = false AND subscription_tier IS NOT NULL;
```

## Known bugs (P0) — fixed 2026-07-04

1. **`AuthContext` read wrong field** — read `data.subscription_tier`; edge function returns `data.tier`. All paid users had `tier=null`. **Fixed** in `src/context/AuthContext.tsx`.
2. **`ProtectedRoute.getUserTier` ignored `subscribed` + `subscription_end`** — defaulted unknown tiers to `basic`, so lapsed users kept access. **Fixed** — now returns `free` when `!subscribed` OR `subscription_end < now()`.
3. **`isRouteAllowed` fall-through returned `true`** for unknown tiers with `subscribed=true`, granting Elite-level access. **Fixed** — now falls back to `FREE_TIER_ROUTES`.
4. **No periodic re-check** — client used stale subscription state. **Fixed** — `AuthContext` polls `check-subscription` silently every 5 min.
5. **`check-subscription` no-customer path** now returns `tier: null` and clears `subscription_status`.
6. **DB cleanup** — expired-but-active rows migrated to `subscribed=false, tier=null, status='canceled'`.

## Manual verification checklist
- [ ] Free account (no Stripe customer) → protected routes redirect to `/pricing`.
- [ ] Active trial → protected routes accessible.
- [ ] Trial ended without card → Stripe fires `subscription.deleted` → next refresh redirects to `/pricing`.
- [ ] Paid Basic → cannot access Pro (`/brotherhood`, `/live-coaching`) or Elite (`/warrior-launch-accelerator`) routes.
- [ ] Paid Pro → cannot access Elite routes; can access Pro + Basic.
- [ ] Paid Elite → full access.
- [ ] Cancel subscription in Stripe → within 5 min, client removes access.
- [ ] Failed recurring payment → after Stripe transitions to `past_due` (webhook fires updated), access is removed.

## Files of record
- `src/context/AuthContext.tsx` — subscription state + periodic re-check
- `src/components/ProtectedRoute.tsx` — tier gating
- `supabase/functions/check-subscription/index.ts` — Stripe → DB sync
- `supabase/functions/stripe-webhook/index.ts` — real-time event handler
- `supabase/functions/create-checkout/index.ts` — plan → Stripe session
