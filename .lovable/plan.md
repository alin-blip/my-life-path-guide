

# Reconfigurare Stripe + Creare Produse + Fix Pricing

## Pas 1: Schimbare credentiale Stripe

Vom actualiza secretele `STRIPE_SECRET_KEY` si `STRIPE_WEBHOOK_SECRET` cu noile valori pe care le vei furniza.

## Pas 2: Produse Stripe necesare

Iata toate produsele/preturile care trebuie create in noul cont Stripe:

### Abonamente lunare (cu 5 zile trial)

| Produs | Pret | Trial | Plan ID in cod |
|--------|------|-------|-----------------|
| WarriorOS Basic | 49 EUR/luna | 5 zile | `basic` |
| WarriorOS Pro | 97 EUR/luna | 5 zile | `pro` |
| WarriorOS Elite | 297 EUR/luna | 5 zile | `elite` |

### Abonamente lunare FARA trial (Early Bird direct)

| Produs | Pret | Trial | Plan ID in cod |
|--------|------|-------|-----------------|
| WarriorOS Basic (Early Bird) | 49 EUR/luna | FARA | `basic` + source `early-bird` |

### Abonamente anuale (fara trial)

| Produs | Pret | Trial | Plan ID in cod |
|--------|------|-------|-----------------|
| WarriorOS Basic Annual | 399 EUR/an | Fara | `basic-annual` |
| WarriorOS Pro Annual | 970 EUR/an | Fara | `pro-annual` |
| WarriorOS Elite Annual | 2970 EUR/an | Fara | `elite-annual` |

### Achizitie unica

| Produs | Pret | Plan ID in cod |
|--------|------|-----------------|
| Warrior Certified Coach | 1.999 EUR | `warrior-accelerator` |

**Nota:** Nu trebuie sa creezi manual produsele in Stripe. Edge function-ul `create-checkout` creaza preturile dinamic prin `price_data` la fiecare sesiune. Trebuie doar sa ai contul Stripe conectat cu cheia secreta.

## Pas 3: Modificari cod

### 3A. Edge Function `create-checkout/index.ts`
- **Fix Early Bird:** Cand `source === 'early-bird'`, setam `trialDays = undefined` (fara trial)
- **Fix Warrior Certified Coach pret:** Schimbam `unitAmount` de la `49700` (497 EUR) la `199900` (1.999 EUR)
- **Redenumire** produs din "Warrior Launch Accelerator" in "Warrior Certified Coach"

### 3B. `src/components/dashboard/EarlyBirdBanner.tsx`
- Adaugam `source: 'early-bird'` la body-ul checkout-ului
- Textul ramane "Activeaza pentru 49 EUR/luna" (corect, fara trial)

### 3C. `src/data/pricing.ts` (sursa unica de adevar)
- **Warrior Certified Coach:** pret de la 497 la 1.999 EUR (`priceValue: 199900`)
- **Redenumire** din "Warrior Launch Accelerator" in "Warrior Certified Coach"
- **Elite benefits:** actualizare valoare Accelerator de la "2,497" la "1,999 EUR"

### 3D. Fix componente cu preturi hardcodate

| Fisier | Problema | Fix |
|--------|----------|-----|
| `PremiumGate.tsx` | Elite la 497 EUR/luna | Corectam la 297 EUR/luna, pret Coach la 1.999 EUR |
| `ChallengePremiumOffer.tsx` | Elite la 497 EUR/luna | Corectam la 297 EUR/luna |
| `UpgradePromptModal.tsx` | Preturi RON vechi | Migram la `pricing.ts` |
| `AcceleratorUpsellModal.tsx` | Nume vechi | Redenumim la "Warrior Certified Coach", pret 1.999 EUR |
| `WarriorPowerUpsell.tsx` | Pret 497 EUR | Actualizam la 1.999 EUR |
| `WarriorAcceleratorThankYou.tsx` | amount_paid gresit | Corectam la 199900 (1.999 EUR) |
| `WarriorLaunchAccelerator.tsx` | Pret 497 pe pagina | Actualizam la 1.999 EUR, redenumire |

## Ordine de executie

1. Iti cer noua cheie Stripe prin tool-ul de secrete
2. Modific `create-checkout` (fix trial Early Bird + pret Warrior Coach 1.999 EUR)
3. Actualizez `pricing.ts` (sursa de adevar)
4. Fix toate componentele cu preturi hardcodate (7 fisiere)
5. Testare end-to-end

