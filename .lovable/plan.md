

# Implementare Completa: Funnel Challenge + Upsell

## Ce lipseste acum

Dupa ultima implementare (cuponul Warrior88), mai trebuie facute urmatoarele:

## 1. Edge Function - Noi Plan IDs

**`supabase/functions/create-checkout/index.ts`** - adaugam 2 case-uri noi:

| Plan ID | Pret | Detalii |
|---------|------|---------|
| `pro-challenge-trial` | 7 zile trial gratuit, apoi 49 EUR/luna | `unitAmount=4900`, `trialDays=7`, `tier="pro"` |
| `warrior-accelerator-earlybird` | 999 EUR one-time | `unitAmount=99900`, `paymentMode="payment"` |

**Redirect URLs:**
- `pro-challenge-trial` si `pro-challenge-3mo` -> `success_url = /challenge-upsell?checkout=success&plan={plan}`
- `warrior-accelerator-earlybird` -> `success_url = /warrior-accelerator-thank-you?checkout=success`

## 2. Noua Pagina: `/challenge-upsell`

**`src/pages/ChallengeUpsell.tsx`** - pagina intermediara post-checkout:

- Se afiseaza DOAR dupa checkout reusit (verificare `?checkout=success` in URL)
- Prezinta 2 optiuni:
  - **Warrior Certified Coach** la **999 EUR** (redus de la 1.999 EUR) - one-time payment
  - **Abonament Elite** la 297 EUR/luna cu 5 zile trial
- **Buton "Nu mersi, vreau sa intru pe platforma"** -> redirect la `/challenge`
- Tracking Facebook Pixel: `trackEvent('ViewContent', { content_name: 'challenge_upsell' })`

## 3. Ruta Noua in App.tsx

Adaugam `/challenge-upsell` -> `ChallengeUpsell` (protected route)

## 4. Restructurare `ChallengeUpgradeGate.tsx`

Inlocuim cele 3 planuri (Basic/Pro/Elite) cu:

| Plan | Pret | CTA | Stil |
|------|------|-----|------|
| Basic | 49 EUR/luna | "Activeaza Acum" | Card simplu, albastru |
| Pro (7 zile trial) | 0 EUR acum, apoi 49 EUR/luna | "Incepe 7 Zile Gratuit" | Card normal, verde |
| Pro 3 Luni - FEATURED | 29 EUR acum (apoi 97 EUR/luna dupa 3 luni) | "Plateste 29 EUR - Oferta Limitata" | Card mare, gradient amber, badge "Oferta Limitata - Doar Aici", ring, scale |

## 5. Restructurare `ChallengePremiumOffer.tsx`

Aceeasi restructurare ca la ChallengeUpgradeGate - afiseaza noile 3 planuri cu acelasi layout.

## 6. Update redirect in Edge Function

Pentru planurile challenge (`pro-challenge-trial`, `pro-challenge-3mo`), `success_url` va pointa catre `/challenge-upsell` in loc de `/challenge`.

## 7. Facebook Pixel Tracking

- `trackCheckoutInitiated` cu planul specific la click pe CTA
- `trackEvent('ViewContent')` pe pagina upsell
- `trackPurchase` daca alege Accelerator/Elite de pe upsell

## Fisiere Modificate/Create

| Fisier | Actiune |
|--------|---------|
| `supabase/functions/create-checkout/index.ts` | Modific - adaug `pro-challenge-trial`, `warrior-accelerator-earlybird`, update redirect URLs |
| `src/pages/ChallengeUpsell.tsx` | Creez - pagina upsell post-checkout |
| `src/App.tsx` | Modific - adaug ruta `/challenge-upsell` |
| `src/components/challenge/ChallengeUpgradeGate.tsx` | Modific - restructurez cu noile 3 planuri |
| `src/components/challenge/ChallengePremiumOffer.tsx` | Modific - restructurez cu noile 3 planuri |

## Ordine de Executie

1. Modific edge function (noi plan IDs + redirect la upsell)
2. Deploy edge function
3. Creez pagina ChallengeUpsell
4. Adaug ruta in App.tsx
5. Restructurez ChallengeUpgradeGate cu noile 3 planuri
6. Restructurez ChallengePremiumOffer cu noile 3 planuri

