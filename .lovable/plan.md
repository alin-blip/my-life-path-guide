

# Auto-Aplicare Cupon Warrior88 la Stripe Checkout

## Ce se schimba

Pentru planul `pro-challenge-3mo` (29 EUR primele 3 luni, apoi 97 EUR/luna), cuponul **Warrior88** se aplica automat in Stripe Checkout - utilizatorul vede direct pretul redus fara sa introduca manual vreun cod.

## Cum functioneaza in Stripe

In loc de `allow_promotion_codes: true` (care asteapta ca userul sa tasteze un cod), vom folosi parametrul `discounts` care pre-aplica cuponul automat:

```text
Stripe Checkout va arata:
  WarriorOS Pro          97,00 EUR/luna
  Cod Warrior88          -68,00 EUR  (primele 3 luni)
  -------------------------------------------
  Total azi:             29,00 EUR/luna
  
  Dupa 3 luni: 97,00 EUR/luna
```

## Modificari Tehnice

### 1. Edge Function `create-checkout/index.ts`

**Noul case `pro-challenge-3mo`:**
- `unitAmount = 9700` (97 EUR - pretul REAL al subscriptiei)
- Cream/gasim cuponul "Warrior88" programatic in Stripe:
  - `id: "Warrior88"`
  - `amount_off: 6800` (68 EUR reducere, ramane 29 EUR)
  - `currency: "eur"`
  - `duration: "repeating"`
  - `duration_in_months: 3`
- `productName = "WarriorOS Pro - Cod Warrior88 Aplicat"`
- In sessionConfig: inlocuim `allow_promotion_codes` cu `discounts: [{ coupon: "Warrior88" }]`
- Stripe afiseaza automat reducerea si pretul final de 29 EUR

**Logica creare cupon (in edge function):**
```text
1. Incearca stripe.coupons.retrieve("Warrior88")
2. Daca nu exista (404), il creeaza cu parametrii de mai sus
3. Il aplica la sesiunea de checkout
```

Aceasta abordare inseamna ca cuponul se creeaza o singura data si se refoloseste.

### 2. Configurare `sessionConfig` pentru acest plan

Pentru `pro-challenge-3mo`:
- Se seteaza `discounts: [{ coupon: "Warrior88" }]`
- Se STERGE `allow_promotion_codes: true` (nu pot coexista in Stripe)
- Restul planurilor pastreaza `allow_promotion_codes: true` ca inainte

### 3. Ce vede utilizatorul pe Stripe Checkout

- Headline-ul produsului: **"WarriorOS Pro - Cod Warrior88 Aplicat"**
- Pretul original: 97 EUR/luna (taiat)
- Reducere: -68 EUR (Warrior88)
- Pret de plata: **29 EUR/luna** pentru primele 3 luni
- Nota Stripe: "Dupa 3 luni, pretul revine la 97 EUR/luna"

## Fisiere Modificate

| Fisier | Ce se modifica |
|--------|---------------|
| `supabase/functions/create-checkout/index.ts` | Adaug case `pro-challenge-3mo` cu creare/retrieve cupon Warrior88 + `discounts` in sesiune |

## Ordine de Executie

1. Adaug case-ul `pro-challenge-3mo` in edge function
2. Adaug logica de creare/retrieve cupon Warrior88
3. Setez `discounts` in loc de `allow_promotion_codes` pentru acest plan specific
4. Deploy edge function
5. Testare checkout - verificam ca pretul de 29 EUR apare direct

