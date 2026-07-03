# Prompt de Audit — Admin Panel CEO Mind OS (Revenue + Leads)

> Copiază tot documentul de mai jos într-un mesaj nou pentru agentul Lovable.
> Este auto-suficient: conține contextul, inventarul, întrebările și forma răspunsului dorit.

---

## 0. Rol & Ton

Ești **Head of Growth + Product Ops** pentru CEO Mind OS (ceomindos.com). Vorbești direct, în română, fără floricele. Nu propui feature-uri până nu ai măsurat ce există. Ești obsedat de **revenue real** și **calitatea datelor**.

## 1. Context proiect

- Stack: React 18 + Vite + Tailwind + shadcn + TS, Lovable Cloud (Supabase managed).
- Rute admin: `/admin` (top-level tabs în `src/components/SecureAdminPanel.tsx`) și `/admin/email-monitoring`.
- Gate: `useAdminAuth` → RPC `has_role(auth.uid(), 'admin')` (rol stocat în `user_roles`, NU în profil).
- Sursa de adevăr revenue = **`stripe-webhook`** edge function → tabele `checkout_events`, `ebook_purchases`, `course_purchases`, `coach_content_purchases`, `commissions`, `subscribers`.
- Sursa de adevăr leads = `email_leads` (+`lead_magnet`, `metadata.utm_*`, `metadata.language`).
- Email: `email_send_log` (dedupe pe `message_id`, ia ultimul status per mesaj), `email_sequence_log` (secvențe drip).
- Products live: **ebook burnout**, **challenge (5-day trial)**, **Elite**, **cursuri**, **coach content**, comisioane afiliați (`referrals` + `commissions`).

## 2. Inventar existent (nu re-descoperi)

Vezi `docs/admin-current-map.md` pentru harta completă. Pe scurt:

**Taburi top-level:** Overview · CRM · Leads · Engagement · Content · AI Studio · Marketing (Hub/SplitTests/Emails/**Revenue**) · Coaches · Settings.

**Componente cheie de audit-at:**
- `src/components/admin/RevenueDashboard.tsx`
- `src/components/admin/LeadMagnetAnalytics.tsx`
- `src/components/admin/EmailAnalytics.tsx`
- `src/components/admin/AdminCoaches.tsx`
- `src/components/admin/crm/CRMDashboard.tsx` (+ tot folderul `crm/`)
- `src/components/admin/EngagementDashboard.tsx`
- `supabase/functions/funnel-leads-dashboard/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Tabele cheie:** `checkout_events`, `ebook_purchases`, `course_purchases`, `coach_content_purchases`, `commissions`, `payout_history`, `subscribers`, `email_leads`, `lead_magnet_events`, `email_send_log`, `email_sequence_log`, `crm_contact_profiles`, `crm_activity_timeline`, `coach_profiles`, `referrals`, `platform_course_referrals`.

## 3. Ce trebuie să faci

### Faza A — Discovery (read-only)
1. Citește componentele și edge functions listate mai sus. Nu modifica cod în această fază.
2. Rulează `supabase--read_query` pentru:
   - `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name IN (...)` pentru toate tabelele revenue/leads.
   - Sample de rânduri (LIMIT 5) pe fiecare tabel de mai sus.
   - `SELECT COUNT(*)` + `MIN/MAX(created_at)` pe fiecare — să vezi ce e „viu".
   - Verifică RLS policies pe tabelele revenue (`pg_policies WHERE schemaname='public'`).
3. Verifică ce KPI **calculează efectiv** fiecare dashboard vs. ce **ar trebui** (comparație UI ↔ query).

### Faza B — Gap report
Livrează un raport structurat pe **6 secțiuni**:

**B1. Revenue**
- MRR / ARR calculate corect? (folosește `subscribers.subscription_tier` × preț activ). Dacă lipsește, cere.
- Revenue pe produs (ebook / challenge / Elite / cursuri / coach content) — există split? Dacă nu, propune query.
- LTV per canal de achiziție (grupat pe `utm_source` din `checkout_events.metadata` sau `email_leads.metadata`).
- Refund / chargeback tracking — există?
- Coach commissions: cât e „pending payout" agregat, câți coach-i au `stripe_onboarding_complete=true` fără payout făcut > 30 zile.

**B2. Leads**
- Volume pe `lead_magnet` × zi (ultimele 30 / 90 zile).
- Conversie funnel: quiz → email captured → ebook bought → challenge subscribed → paid. Rate real, nu doar count.
- Leaduri „orfane" — fără email trimis în > 7 zile.
- Deliverability: bounce rate, complaint rate, suppressed pe template (dedupe pe `message_id`!).
- Attribution UTM: care sursă aduce leaduri care **plătesc** (nu doar leaduri).

**B3. CRM 360°**
- `crm_contact_profiles` acoperă câți % din `email_leads` + `subscribers` unificat pe email?
- Câmpuri lipsă / neumplute (ce % din rânduri au `first_purchase_at`, `ltv`, `last_activity_at`).
- Duplicate pe email (case-insensitive).

**B4. Engagement (revenue-linked)**
- Corelație activitate (`daily_progress_stats.completion_rate`) ↔ churn (`subscribers.subscribed=false`).
- Cine e „at risk" (paid + no activity > 14 zile).

**B5. Suprapuneri UI**
- Care componente prezintă **aceeași metrică în locuri diferite**? Enumeră perechile.
- Care tab e sub-utilizat / gol.

**B6. Securitate & performanță**
- RLS pe fiecare tabel revenue — există policy admin-only pentru SELECT? Sunt `GRANT`-uri corecte pentru `authenticated` / `service_role`?
- Query-uri N+1 în componente (fetch în loop).
- Edge functions fără retry/backoff.

### Faza C — Propunere reorganizare

Livrează un **wireframe textual** al noii structuri de taburi, cu justificare per mutare. Ex.:

```
Nou: Admin
├── 📊 Overview        — Health score (revenue MoM, leads MoM, active users, at-risk)
├── 💰 Revenue         — PROMOVAT top-level din Marketing
│    ├── Products      — split MRR/one-time pe produs
│    ├── Subscriptions — cohort, churn, LTV
│    ├── Coaches       — commissions + payout ready (FUZIUNE cu tabul „Coaches")
│    └── Refunds
├── 🎯 Growth          — FUZIUNE Leads + o parte din CRM
│    ├── Funnel        — quiz → paid, cu drop-off
│    ├── Attribution   — UTM → revenue
│    ├── Email health  — deliverability + secvențe
│    └── Split tests
├── 👥 CRM             — doar Contact 360° + timeline + admin sessions
├── 📈 Engagement      — activitate + at-risk + churn signals
├── 📚 Content         — cursuri + Warriors Way
├── 🤖 AI Studio
└── ⚙️  Settings
```

Pentru fiecare mutare: **de ce**, **ce query nou** trebuie, **ce componentă se creează / se șterge**.

### Faza D — Roadmap prioritizat

Livrează tabel Markdown cu coloanele: **Prioritate (P0/P1/P2)** · **Item** · **Impact (revenue/ops/UX)** · **Efort (S/M/L)** · **Depinde de**.

Minim 12 items, maxim 25. P0 = blochează decizii de business azi.

### Faza E — Query-uri de referință

Livrează 8-12 query-uri SQL testate (rulează-le cu `supabase--read_query`) pentru KPI-urile cheie: MRR curent, revenue pe produs 30d, funnel conversion end-to-end, at-risk clients, coach payout ready, top leaks în email deliverability, cohort retention lună 1/2/3, attribution UTM→paid.

## 4. Reguli

- **NU modifica cod** în Faza A-B. Modificări doar dacă utilizatorul aprobă roadmap-ul.
- **NU inventa** metrici — dacă datele lipsesc în DB, spune „nu se poate calcula, ne trebuie X".
- **NU** afișa Supabase project IDs / URLs / linkuri către dashboard-ul Supabase.
- Dedupe `email_send_log` pe `message_id` (ia ultimul `created_at`).
- Toate join-urile pe email → `LOWER(email)`.
- Pentru fiecare recomandare menționează impactul estimat pe revenue (mic/mediu/mare) și efortul.

## 5. Format livrare

Un singur mesaj Markdown structurat pe secțiunile B1-B6 + Faza C + Faza D + Faza E. La final: **„Top 3 acțiuni pentru săptămâna asta"** — cele mai mari lever-e, foarte concret.

Când termini, întreabă: *„Aprobi P0-urile pentru implementare?"* — nu trece în cod fără OK.
