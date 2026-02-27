

# Plan: Rebranding complet la CEO Mind OS (fara modificari de pret)

## Pas 0: Revert preturile anuale la valorile originale

Fisierul `src/data/pricing.ts` a fost modificat gresit in sesiunea anterioara. Revenire la preturile originale care corespund cu Stripe (`create-checkout`):

| Tier | Pret lunar | Pret anual (original) | Discount real |
|------|-----------|----------------------|---------------|
| Basic | €49/luna | €399/an | ~32% |
| Pro | €97/luna | €970/an | ~17% |
| Elite | €297/luna | €2,970/an | ~17% |

Se revin: `priceEn`, `priceRo`, `priceValue`, `originalPriceEn`, `originalPriceRo`, `valueEn`, `valueRo`, `highlightEn`, `highlightRo` la valorile originale din Stripe.

---

## Pas 1: Rebranding frontend (44 fisiere in `src/`)

Inlocuiesc toate aparitiile celor 3 branduri vechi cu **CEO Mind OS**:

**Fisiere principale (identitate + legal):**
- `src/context/LanguageContext.tsx` — deja facut (CEO Mind OS + "The Founder Operating System")
- `src/components/global/GlobalTopBar.tsx` — deja facut (alt text)
- `src/components/AuthForm.tsx` — "JOIN JUMP TO FREEDOM" -> "JOIN CEO MIND OS"
- `src/pages/TermsOfService.tsx` — "Jump to Freedom" -> "CEO Mind OS", email contact
- `src/pages/PrivacyPolicy.tsx` — "Jump to Freedom" -> "CEO Mind OS", email contact
- `src/pages/About.tsx` — referinte brand

**Landing pages si marketing:**
- `src/components/landing/HeroSection.tsx` — alt text, iframe title
- `src/components/landing/NewFooter.tsx` — copyright "WarriorOS" -> "CEO Mind OS"
- `src/components/landing/ProofSection.tsx` — testimoniale "Jump to Freedom"
- `src/components/landing/Core4SectionNew.tsx` — "WarriorOS difference"
- `src/pages/ChallengeLanding.tsx` — meta title "WarriorOS"
- `src/pages/WarriorLaunchAccelerator.tsx` — "WarriorOS" in multiple locuri
- `src/pages/Core4LeadMagnet.tsx` — "LifeOS" in meta
- `src/pages/Core4ThankYou.tsx` — "LifeOS" in meta si text

**Admin marketing tools:**
- `src/components/admin/marketing/BrandKit.tsx` — UVP cu "LifeOS"
- `src/components/admin/marketing/LeanCanvas.tsx` — "LifeOS Lean Canvas"
- `src/components/admin/marketing/ContentTemplates.tsx` — productName "LifeOS"
- `src/components/admin/marketing/CampaignPlanner.tsx` — campanii cu "Life Operating System"
- `src/components/admin/marketing/MarketingHub.tsx` — "LifeOS"

**Hooks si data:**
- `src/hooks/useAccountabilityCoach.ts` — prompt "LifeOS" -> "CEO Mind OS"
- `src/data/platformKnowledge.ts` — "WarriorOS system"
- `src/components/EnhancedQuoteDisplay.tsx` — appName "JUMP TO FREEDOM"
- `src/config/socialLinks.ts` — URL skool "warriorsos"
- `src/components/programs/CommunityFeedTab.tsx` — "WarriorOS Community"

**Plus ~20 alte fisiere** cu referinte minore (toate celelalte gasite in cautare).

---

## Pas 2: Rebranding Edge Functions (20 fisiere in `supabase/functions/`)

- `create-checkout` — product names "WarriorOS Basic/Pro/Elite" -> "CEO Mind OS ..."
- `send-challenge-reminder` — from "WarriorOS", noreply@warriorsos.com, URL-uri warriorsos.com
- `send-challenge-reactivation` — acelasi pattern
- `send-challenge-daily` — email branding
- `send-challenge-recovery` — email branding
- `send-challenge-promo-sequence` — email branding
- `send-life-score-plan` — email branding
- `send-goal-plan-email` — email branding
- `send-power-results` — email branding
- `send-vision-results` — email branding
- `notify-community-post` — email branding
- Alte edge functions cu referinte brand

**Nota:** Email-urile vor folosi `CEO Mind OS <noreply@ceomindos.com>` (sau domeniul pe care il confirmi). URL-urile se actualizeaza cand ai domeniul final.

---

## Pas 3: Tracking (din planul anterior, ramas neimplementat)

- Apeleaza `trackLogin` in `AuthContext.tsx` la SIGNED_IN
- Adauga event `checkout_initiated` la redirect Stripe
- Adauga event `purchase_completed` la return din Stripe

---

## Detalii tehnice

**Fisiere totale de modificat:** ~64 (44 frontend + 20 edge functions)
**Fisiere deja modificate:** 3 (LanguageContext, GlobalTopBar, pricing.ts - partial de revert)
**Abordare:** Find-and-replace sistematic per fisier, pastrand contextul si logica existenta.

**Intrebare pentru tine:** Ce domeniu de email vrei sa folosesti in edge functions? (ex: `noreply@ceomindos.com` sau alt domeniu?)

