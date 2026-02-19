

# Adaugare programe in descrierea PRO

## 1. localStorage - confirmare

localStorage este solutia corecta pentru persistenta planului selectat. Este o valoare temporara (cateva secunde/minute), functioneaza pe acelasi browser/device, si se sterge imediat dupa checkout. Nu necesita baza de date.

**Nu se modifica nimic la acest flux.**

## 2. Adaugare programe The Ultimate YOU si Personal Power in PRO

### Ce se modifica

**Fisier: `src/data/pricing.ts`**

Se adauga doua linii noi in lista de beneficii a planului PRO (id: "pro"):

- In `benefitsRo` (linia ~93-104): se adauga:
  - `"Programul The Ultimate YOU (valoare €97 - GRATUIT)"`
  - `"Programul Personal Power (valoare €97 - GRATUIT)"`

- In `benefitsEn` (linia ~80-92): se adauga:
  - `"The Ultimate YOU Program (€97 value - FREE)"`
  - `"Personal Power Program (€97 value - FREE)"`

Se vor insera dupa "Breakthrough Tools and Applied Courses" si inainte de "VIP dedicated support", pentru a fi vizibile in zona de programe/cursuri.

### Rezultat

Cardurile PRO de pe `/challenge-7-zile` si din orice alta pagina de pricing vor afisa automat aceste doua programe ca beneficii incluse gratuit, deoarece `ChallengePremiumOffer.tsx` foloseste `proPlan.benefitsRo` si `proPlan.benefitsEn` direct din `pricing.ts`.
