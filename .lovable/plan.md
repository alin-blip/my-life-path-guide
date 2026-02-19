
# Audit Complet: Tracking & Analytics in Admin

## Probleme Identificate

### 1. CRITIC: Activitatile se inregistreaza doar pentru 1 user (tu)
- Tabela `crm_activity_timeline` are **1.159 inregistrari** - **TOATE** de la un singur user_id (al tau).
- Din 404 contacte CRM, doar **1 contact** are activitate inregistrata.
- Cauza: `useActivityTracker` scrie in `crm_activity_timeline` dar necesita sa gaseasca/creeze un `crm_contact_profile` mai intai. Daca RLS blocheaza insertul pentru alti useri, tracking-ul esueaza silentios (`catch` doar logheaza in consola).

### 2. CRITIC: Tabela `user_activity_log` este GOALA (0 randuri)
- Componenta `UserActivityViewer.tsx` din admin citeste din `user_activity_log`, dar **nimeni nu scrie acolo**.
- `useActivityTracker` scrie in `crm_activity_timeline`, NU in `user_activity_log`.
- Rezultat: tab-ul User Activity din admin nu arata niciodata nimic.

### 3. CRITIC: 398 din 404 contacte sunt "lead" (98%)
- Funnel stage-urile nu se actualizeaza corect.
- 332 contacte au `user_id` (deci si-au creat cont), dar funnel_stage ramane "lead" in loc de "engaged".
- `sync-crm-contacts` edge function ar trebui sa rezolve asta, dar ceva nu functioneaza corect.

### 4. RevenueDashboard foloseste date MOCK (hardcodate)
- `RevenueDashboard.tsx` arata date fictive din "Octombrie 2023", nu date reale din Stripe.
- Nicio conexiune la datele reale de subscriptii sau plati.

### 5. CRMAnalytics: "Crestere Saptamanala" e FAKE
- Graficul de crestere saptamanala calculeaza proportii fictive (0.6x, 0.7x, 0.85x) din datele curente. Nu exista date istorice reale.

### 6. FunnelVisualDashboard: Stagiile MQL/SQL sunt goale
- Nimeni nu seteaza stage-urile "mql" si "sql", asa ca funnel-ul vizual arata 0 la aceste stagii.
- Drop-off rates sunt distorsionate.

### 7. Tracking-ul de page_view nu acopera utilizatorii neautentificati
- `useActivityTracker` verifica `if (!user?.id) return;` - deci vizitatorii anonimi (care vin pe landing page Challenge) nu sunt trackuiti deloc.

### 8. Lipsa tracking: checkout abandonat, Stripe events, login
- Nu exista tracking pentru "abandoned cart" (user ajunge pe Stripe si nu plateste).
- `trackPurchase` si `trackLogin` sunt exportate ca functii dar **nu sunt apelate nicaieri** in cod.
- Stack sessions, Door tasks - functiile de tracking exista dar nu sunt integrate.

---

## Planul de Rezolvare (Prioritizat)

### Faza 1: Fix-uri Critice de Date (imediata)

**1.1 Fix `useActivityTracker` - RLS si error handling**
- Verific si repar politicile RLS pe `crm_activity_timeline` pentru a permite INSERT de la orice user autentificat.
- Adaug fallback: daca CRM profile nu se gaseste, se creeaza automat.
- Mut logica de tracking sa fie mai rezilienta (nu mai esueaza silentios).

**1.2 Elimina `user_activity_log` si unifica pe `crm_activity_timeline`**
- `UserActivityViewer.tsx` va citi din `crm_activity_timeline` (care are datele reale).
- Sau: adaug un trigger care copiaza din `crm_activity_timeline` in `user_activity_log`.

**1.3 Fix `sync-crm-contacts` - actualizare funnel_stage**
- Contactele cu `user_id` (au cont creat) trebuie mutate automat din "lead" in "engaged".
- Contactele cu `subscription_status = 'active'` trebuie mutate in "customer".
- Elimin stagiile MQL/SQL neutilizate din funnel (simplific la: Lead -> Engaged -> Trial -> Customer).

### Faza 2: Tracking Real pentru Fiecare Pas

**2.1 Challenge tracking complet (per zi, per user)**
- Creez o componenta admin noua: **"Challenge Funnel Live"** care arata exact:
  - Cati useri au inceput Ziua 1, 2, 3... 7
  - Cine e blocat si la ce zi
  - Timp mediu intre zile
- Datele vin direct din `challenge_progress` (care deja functioneaza corect).

**2.2 Tracking login si page views**
- Apelez `trackLogin` efectiv la fiecare login (in `AuthContext` sau dupa redirect).
- Asigur ca page_view se inregistreaza corect pentru toti userii autentificati.

**2.3 Tracking achizitii si abandoned checkout**
- La redirectul catre Stripe: inregistrez un event "checkout_initiated" in `crm_activity_timeline`.
- La return de pe Stripe cu `checkout=success`: inregistrez "purchase_completed".
- Daca userul a initiat checkout dar nu s-a intors in 30 min = abandoned cart (calculat din date).

### Faza 3: Dashboard Admin Unificat

**3.1 Inlocuiesc RevenueDashboard cu date reale**
- Citesc din `crm_contact_profiles` (coloanele `subscription_status`, `subscription_tier`, `lifetime_value`) si din Stripe via edge function.
- KPIs reale: MRR, active subscriptions, churn rate, trial-to-paid conversion.

**3.2 Refac CRMAnalytics cu date istorice reale**
- Graficul de crestere va folosi `created_at` din `crm_contact_profiles` grupat pe saptamani (date reale, nu mock).
- Conversion rates calculate corect din funnelul simplificat.

**3.3 Simplific CRM Dashboard tabs**
- Pipeline: Lead | Engaged | Trial | Customer (4 coloane, fara MQL/SQL).
- Challenge Stats: date reale din `challenge_progress`.
- Activity Log: unificat din `crm_activity_timeline`.
- Analytics: grafice cu date reale.

---

## Detalii Tehnice

### Fisiere de modificat:
1. `src/hooks/useActivityTracker.ts` - fix RLS, error handling, activare trackLogin/trackPurchase
2. `src/components/admin/UserActivityViewer.tsx` - citeste din `crm_activity_timeline`
3. `src/components/admin/crm/CRMAnalytics.tsx` - date reale, nu mock
4. `src/components/admin/crm/FunnelVisualDashboard.tsx` - elimina MQL/SQL, simplifica
5. `src/components/admin/RevenueDashboard.tsx` - date reale din Stripe/CRM
6. `supabase/functions/sync-crm-contacts/index.ts` - fix funnel_stage logic
7. Migration SQL: fix RLS pe `crm_activity_timeline`, cleanup `user_activity_log`
8. `src/context/AuthContext.tsx` sau post-login - apeleaza `trackLogin`

### Tabele afectate:
- `crm_activity_timeline` - fix RLS policies
- `crm_contact_profiles` - update funnel_stage logic in sync function
- `user_activity_log` - depreciate sau populare via trigger

### Estimare:
- Faza 1 (fix-uri critice): implementare imediata
- Faza 2 (tracking complet): dupa Faza 1
- Faza 3 (dashboard refactorizat): dupa Faza 2

Dupa implementare, vei avea date corecte si in timp real pentru fiecare pas din funnel: vizitator -> lead -> cont creat -> challenge inceput -> zi 1-7 -> trial -> customer.
