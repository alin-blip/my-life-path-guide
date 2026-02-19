

# Fix: Pagina `/challenge-upsell` da 404 dupa plata Stripe

## Problema identificata

Sunt doua probleme:

1. **Pagina nu este publicata** - Codul exista in proiect, dar site-ul publicat pe `warriorsos.com` nu a fost actualizat. Trebuie sa dai click pe "Update" in dialogul de publish dupa ce facem fix-urile.

2. **`/challenge-upsell` nu este in listele de rute permise din `ProtectedRoute`** - Dupa ce utilizatorul plateste pe Stripe si este redirectat inapoi, subscriptia lui poate sa nu fie inca sincronizata. `ProtectedRoute` il vede ca "free" si il trimite la `/pricing`, nu la upsell. Ruta `/challenge-upsell` trebuie adaugata in `FREE_TIER_ROUTES` (sau cel putin in `BASIC_ROUTES`) pentru ca oricine tocmai a platit sa poata accesa pagina.

## Solutia

### 1. `src/components/ProtectedRoute.tsx`
- Adaug `/challenge-upsell` in `FREE_TIER_ROUTES` (linia 16-31), pentru ca utilizatorul tocmai a platit si trebuie sa vada pagina de upsell indiferent de tier-ul curent (care poate fi inca "free" pentru cateva secunde pana se sincronizeaza webhook-ul Stripe).

### 2. Publicare
- Dupa implementare, trebuie dat click pe **"Update"** in dialogul de Publish pentru ca modificarile frontend sa ajunga pe `warriorsos.com`.

## Detalii tehnice

Singura modificare necesara este adaugarea rutei in lista:

```text
FREE_TIER_ROUTES = [
  '/dashboard',
  '/habits',
  '/challenge',
  '/challenge-7-zile',
  '/challenge-upsell',   // <-- ADAUGAT
  '/settings',
  ...
]
```

Aceasta asigura ca:
- Utilizatorul autentificat (chiar si free) poate vedea pagina de upsell
- Pagina de upsell isi face propriul check (`isCheckoutSuccess`) si redirecteaza la `/challenge` daca nu vine de la checkout

