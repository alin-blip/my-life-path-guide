

# Audit General Platformă CEO Mind OS — Ready for Launch

## Status: Build ✅ PASS | TypeScript ✅ CLEAN | Security ⚠️ 2 warnings

---

## PROBLEME CRITICE (Blocker Launch)

### 1. CRITIC: Duplicate masive în baza de date — 562 task-uri, multe duplicate x8
Săptămâna `door-week-2026-04` are **341 de task-uri**, multe duplicate de 8 ori. Cauza: `saveGlobalHotList` face DELETE + INSERT la fiecare save, dar realtime subscription trigger-ează `loadData` → care setează starea → care trigger-ează auto-save → care re-inserează. Aceasta este o **buclă de feedback** între realtime și auto-save.

**Fix**: 
- Adaugă un flag `isRealtimeReloading` în `useDoorLists` care blochează auto-save-ul din `useDoorStorage` când datele vin din realtime
- Rulează `removeDuplicateTasks()` o dată pentru a curăța datele existente
- Adaugă un unique constraint la nivel de DB: `(user_id, title, task_type, week_key, day_of_week)`

### 2. CRITIC: Password Reset nu funcționează
`AuthForm.tsx` trimite email-ul de reset cu `redirectTo: /auth`, dar NU există logică de handling `type=recovery` și NU există pagina `/reset-password`. Utilizatorul primește link-ul, face click, este logat automat DAR nu poate schimba parola.

**Fix**:
- Adaugă handling `type=recovery` în `AuthForm.tsx` (sau creează pagina `/reset-password`)
- Când URL-ul conține `type=recovery`, afișează formularul de "Parolă Nouă" cu `supabase.auth.updateUser({ password })`

### 3. CRITIC: `TemporarySupabaseDisable.tsx` — fișier mort
Fișierul există dar nu e importat nicăieri. Trebuie șters pentru a nu crea confuzie.

---

## PROBLEME MODERATE (Post-Launch OK, dar recomandat)

### 4. Buclă Realtime ↔ Auto-Save
Realtime subscription în `useDoorLists` apelează `loadData()` → setează stare → `useDoorStorage` detectează schimbare → apelează `saveState()` → DB se modifică → realtime notifică din nou. Ciclul este parțial prevenit de signature check, dar nu complet.

**Fix**: Adaugă debounce + un `isFromRealtime` flag care suprimă auto-save pentru 2 secunde după un reload realtime.

### 5. 14 TODO-uri cu "Implement proper database" în componente active
`Dashboard.tsx`, `FactMapSimplified.tsx`, `GameContent.tsx`, `MonthlyObjectives.tsx`, `Stack.tsx` — toate au cod care ar trebui să folosească Supabase dar nu o face. Datele se pierd la refresh.

**Fix**: Implementează persistența DB în aceste componente sau convertește la localStorage cu migrare viitoare.

### 6. Leaked Password Protection dezactivat (Linter Warning)
HIBP (Have I Been Pwned) check nu este activat. Utilizatorii pot folosi parole compromise.

**Fix**: Activează din Cloud → Users → Auth Settings → Password HIBP Check.

### 7. Bundle size mare — 3 chunk-uri > 500KB
- `index.js`: 726KB  
- `WidgetDashboard.js`: 700KB
- `vendor-charts.js`: 432KB

**Fix**: Code-split WidgetDashboard și chart libraries mai agresiv cu `manualChunks`.

---

## PROBLEME MINORE (Nice-to-have)

### 8. `dangerouslySetInnerHTML` în BlogArticle și landing pages
Utilizat cu conținut hardcodat (nu user input), risc scăzut. Dar `BlogArticle.tsx` procesează conținut care ar putea veni din DB.

**Fix**: Adaugă `DOMPurify.sanitize()` pe conținutul din `BlogArticle.tsx`.

### 9. `getSession` folosit în loc de `getUser` în 20+ locuri
`getSession` nu verifică token-ul pe server — este mai puțin sigur. `ErrorBoundary`, `GlobalErrorCapture`, și multe componente îl folosesc.

**Fix**: Migrează treptat la `getUser` pentru operații sensibile. `getSession` este OK pentru logging/non-critical.

### 10. Extension în schema public (Linter Warning)
O extensie Postgres este instalată în schema `public` în loc de o schemă dedicată.

---

## CE FUNCȚIONEAZĂ BINE ✅

- **TypeScript**: 0 erori — build complet curat
- **Build production**: Se compilează cu succes în ~27s
- **Autentificare**: Flow complet cu tier-based access (Free/Basic/Pro/Elite)
- **Admin roles**: Corect implementat prin `user_roles` table + `has_role()` security definer
- **RLS**: Toate tabelele critice au politici active
- **Error tracking**: `ErrorBoundary` + `GlobalErrorCapture` + `error_logs` table
- **Security Provider**: XSS sanitization, input validation, security event logging
- **Door auto-save**: Mecanism de debounce funcțional cu signature tracking
- **Lazy loading**: 90+ pagini lazy-loaded cu Suspense fallback
- **PWA**: Service worker configurat cu precaching

---

## PLAN DE IMPLEMENTARE (Prioritizat)

### Pas 1: Curățare date + preveniție duplicare
- Adaugă unique constraint DB pe `user_tasks`
- Rulează cleanup pe duplicatele existente
- Adaugă `isFromRealtime` flag pentru a preveni bucla

### Pas 2: Fix Password Reset
- Adaugă handling `type=recovery` în `AuthForm.tsx`
- Schimbă `redirectTo` la `${origin}/auth?type=recovery`

### Pas 3: Activează HIBP Password Check
- Configurare din Auth Settings

### Pas 4: Șterge `TemporarySupabaseDisable.tsx`
- Fișier mort, creează confuzie

### Pas 5 (opțional): Sanitizare blog + bundle optimization

---

## Fișiere de modificat
1. **Migration SQL** — unique constraint + cleanup duplicates
2. **`src/hooks/useDoorLists.tsx`** — flag anti-buclă realtime
3. **`src/hooks/useDoorStorage.tsx`** — respectă flagul anti-buclă
4. **`src/components/AuthForm.tsx`** — handle `type=recovery`, fix `redirectTo`
5. **`src/components/TemporarySupabaseDisable.tsx`** — DELETE
6. **Auth Settings** — activează HIBP check

