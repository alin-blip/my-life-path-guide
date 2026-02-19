

# Fix: Elite pe upsell fara trial - plata directa €297/luna

## Problema

Pe pagina `/challenge-upsell`, planul Elite are trial de 5 zile (mostenit din configurarea generala). Utilizatorul doreste plata directa, fara trial, pentru Elite-ul din upsell.

## Modificari

### 1. Edge function: `supabase/functions/create-checkout/index.ts`

Dupa ce se determina planul "elite" (linia 89-95), se adauga o conditie: daca `source === 'challenge-upsell'`, se seteaza `trialDays = undefined` pentru a forta plata directa fara trial.

Se va adauga dupa linia 206 (dupa logul de debug, inainte de success URL):

```typescript
// No trial for Elite from upsell - direct payment
if (plan === 'elite' && source === 'challenge-upsell') {
  trialDays = undefined;
}
```

Se va schimba si `productName` in acest caz la `"WarriorOS Elite"` (fara "(5-Day Trial)").

### 2. UI: `src/pages/ChallengeUpsell.tsx`

Pe cardul Elite (liniile 198-211):
- Se sterge `'5 zile trial gratuit'` din lista de beneficii
- Se sterge textul `"5 zile trial gratuit inclus"` de sub pret (linia 219)
- Butonul se schimba din `"Începe Elite - 5 Zile Gratuit"` in `"Începe Elite - €297/lună"` (linia 230)

