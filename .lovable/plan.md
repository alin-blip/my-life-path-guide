
# Fix: Creare cont inainte de plata pe Challenge 7 Zile

## Problema
Cand un utilizator neautentificat alege un plan pe `/challenge-7-zile`:
1. Click pe plan -> redirect la `/auth` cu un toast
2. Planul selectat se pierde complet
3. Dupa creare cont, utilizatorul ajunge pe `/dashboard` fara sa fi platit
4. Abonamentul nu este legat de contul nou

## Solutia
Salvam planul selectat in `localStorage` inainte de redirect la `/auth`, iar cand utilizatorul revine pe pagina challenge (dupa autentificare), checkout-ul se initiaza automat.

## Flux nou

```text
1. User pe /challenge-7-zile (neautentificat)
2. Click pe "Activeaza Pro" 
3. -> Salveaza planul in localStorage (pending_challenge_plan)
4. -> Redirect la /auth cu state.from = '/challenge-7-zile'
5. User creaza cont sau se logheaza
6. -> AuthForm redirecteaza inapoi la /challenge-7-zile
7. -> Pagina detecteaza pending_challenge_plan din localStorage
8. -> Auto-trigger checkout cu planul salvat
9. -> Sterge pending_challenge_plan din localStorage
10. -> User ajunge pe Stripe checkout cu contul legat
```

## Modificari tehnice

### 1. `src/components/challenge/ChallengePremiumOffer.tsx`
- In `handleUpgrade`, cand nu exista sesiune:
  - Salveaza `{ planId, value }` in `localStorage` sub cheia `pending_challenge_plan`
  - Navigheaza la `/auth` cu `state: { from: { pathname: '/challenge-7-zile' } }`
  - Elimina toast-ul de eroare (nu e eroare, e flow normal)

### 2. `src/pages/Challenge7ZileLanding.tsx`
- Adauga un `useEffect` care:
  - Verifica daca exista `pending_challenge_plan` in localStorage
  - Verifica daca utilizatorul este acum autentificat (are sesiune)
  - Daca da la ambele: sterge cheia din localStorage si initiaza checkout automat
  - Afiseaza un loading state scurt ("Se pregateste checkout-ul...") in timpul procesarii

### Fara modificari la:
- `AuthForm.tsx` - deja suporta `location.state.from` pentru redirect
- `create-checkout` edge function - deja primeste user_id din sesiune
- Nimic in baza de date
