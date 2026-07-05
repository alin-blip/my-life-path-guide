# Faza 4 — Ads-ready landing + tracking pentru Meta £500-1000

## Scop
Pregătim `/challenge-7-zile` pentru trafic plătit Meta: pixel events complete + value, UTM end-to-end, retargeting audiences segmentate, și dashboard ROI per canal/campanie (CAC + conversion). Zero cod nou "de business" — doar instrumentare + vizibilitate.

---

## 1. FB Pixel — events complete cu `value`

**Fișier:** `src/lib/facebook-pixel.ts` (extindere)
- Adaug `trackViewContent(name, category?)` — generic pentru landing/day/pricing.
- Adaug `event_id` opțional (UUID) în toate `track*()` — pregătit pentru deduplicare CAPI ulterior (fără backend CAPI acum, doar hook prezent).
- Fix: `trackPurchase` să accepte `content_ids` + `content_name` pentru attribution corectă per plan.

**Fișiere cu tracking nou:**
- `src/pages/Challenge7ZileLanding.tsx` → `trackViewContent('challenge_landing', 'lead_magnet')` pe mount.
- `src/pages/ChallengeDay.tsx` → `trackChallengeDayStarted(day)` deja există — verificat că se apelează.
- `src/components/challenge/ChallengePremiumOffer.tsx` → `trackCheckoutInitiated(planId, priceLei)` DEJA prezent — doar adaug `value` corect per tier (49/97/197 LEI mapat pe planuri).
- `src/pages/Dashboard.tsx` / thank-you pages → `trackPurchase(value, 'RON')` deja există, aliniez `content_ids` cu `subscription_tier`.

---

## 2. UTM auto-tag + persistență end-to-end

**Deja avem:** `useUtmCapture` scrie în `localStorage`, `create-checkout` propagă în `checkout_events.metadata`, `email_leads.metadata` include UTM.

**Lipsă:**
- Salvez UTM la signup într-un câmp dedicat pe `subscribers` — coloană nouă `attribution_utm JSONB` (migration).
- `AuthContext` la `SIGNED_IN` prima dată → upsert `subscribers.attribution_utm` = `getStoredUtm()`.
- Toate CTA-urile primary pe landing → auto-append `?utm_source=...` dacă lipsește (helper `withUtm(url)`).

**Migration:**
```sql
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_utm JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_first_touch TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_source ON public.subscribers ((attribution_utm->>'utm_source'));
```

---

## 3. Retargeting audiences (DB view + export CSV)

**View nouă:** `public.retargeting_audiences_v` cu coloanele `email, stage, last_seen_at, utm_source, utm_campaign`.

Stage-uri:
- `viewed_landing` — în `email_leads` cu source `challenge%` dar fără `subscribers` row
- `signed_up_no_start` — subscriber creat dar 0 rânduri în `challenge_progress`
- `started_no_complete` — cel puțin Day 1 dar nu Day 7
- `completed_no_purchase` — Day 7 completed dar `subscription_tier` free/null
- `abandoned_checkout` — `checkout_events` `checkout_initiated` fără `session_created` sau `completed` în ultimele 7 zile
- `paid` — `subscription_tier` != free (exclude / lookalike seed)

**UI:** tab nou în admin dashboard `Challenge Funnel` → "Retargeting Audiences" cu:
- Count per stage
- Buton "Export CSV" per segment (email + hashed_email SHA-256 pentru Meta Custom Audience upload)
- Preview primele 20 rânduri

**Fișier:** `src/components/admin/RetargetingAudiences.tsx`

---

## 4. Ads ROI dashboard (per UTM source/campaign)

**Fișier:** `src/components/admin/AdsRoiDashboard.tsx`

Metrici afișate (query din `subscribers` + `checkout_events` + `commissions`):
- **Leads** per `utm_source` × `utm_campaign` (din `email_leads`)
- **Signups** (din `subscribers.attribution_utm`)
- **Paid conversions** (subscribers cu tier plătit)
- **Revenue** (SUM din `checkout_events.amount` sau `subscribers.stripe_price`)
- **Conversion rate** lead→paid
- **Est. CAC** (câmp input pentru spend manual per campanie, salvat în tabel nou `ads_spend_manual`)
- **ROAS** = revenue / spend

**Migration secundară:**
```sql
CREATE TABLE public.ads_spend_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utm_source TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  spend_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (utm_source, utm_campaign, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads_spend_manual TO authenticated;
GRANT ALL ON public.ads_spend_manual TO service_role;
ALTER TABLE public.ads_spend_manual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ads spend" ON public.ads_spend_manual
  FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
```

**UI features:**
- Tabel sortabil cu coloane: Source | Campaign | Leads | Signups | Paid | Revenue | CR% | Spend | CAC | ROAS
- Input inline pentru adăugat spend per campanie (dialog rapid)
- Filtru dată (last 7 / 30 / all)

---

## 5. Nu includ (nu ai cerut / risc scope creep)
- Meta Conversion API server-side (necesită `META_ACCESS_TOKEN` + edge function; hook `event_id` prezent pentru viitor).
- Automated Meta Ads Manager sync (necesită OAuth Meta Business).
- Client-side rate limiting sau ad-blocker detection.
- Split-test dinamic pe headline (deferat P2).

---

## Livrabile finale (după implementare)
- Landing `/challenge-7-zile` trimite `ViewContent`, `Lead`, `InitiateCheckout`, `Purchase` cu `value`.
- Fiecare user plătit are `attribution_utm` salvat → poți trage revenue per canal.
- Admin tab nou "Retargeting" → export CSV pentru Custom Audiences Meta.
- Admin tab nou "Ads ROI" → CAC + ROAS live per campanie.
- Migration cu `attribution_utm` pe subscribers + `ads_spend_manual`.

---

## Ordinea execuției (build mode)
1. Migration (2 tabele/coloane + view + grants + RLS).
2. Extindere `facebook-pixel.ts` + `trackViewContent` pe landing.
3. `AuthContext` → persist UTM la SIGNED_IN.
4. `RetargetingAudiences.tsx` + tab admin.
5. `AdsRoiDashboard.tsx` + tab admin + input spend.
6. Verificare: build clean, tab-uri vizibile în admin, view returnează date.
