# Prompt & Plan Pre-Lansare — CEO Mind OS

> Document master pentru pre-lansarea platformei ceomindos.com.
> Conține: (1) Criterii de „ready to launch", (2) Prompt AI de audit reutilizabil,
> (3) Checklist tehnic, (4) Plan marketing T-30 → T+7, (5) KPI, (6) Rollback.
>
> Copiază secțiunea 2 într-un mesaj nou pentru agentul Lovable când vrei un audit complet.

---

## 0. Cum folosești acest document

- **Product owner (Alin)**: folosește secțiunile 3, 4, 5 ca checklist executiv.
- **Agent Lovable**: rulează secțiunea 2 ca audit read-only înainte de fiecare milestone de lansare.
- **Growth / Marketing**: folosește secțiunea 4 ca playbook cronologic.
- **On-call / incident**: secțiunea 6 = runbook.

Convenții:
- ✅ = obligatoriu înainte de „go live" · ⚠️ = recomandat · 💡 = nice-to-have
- „T-0" = ziua lansării publice. „T-30" = 30 zile înainte. „T+7" = 7 zile după.

---

## 1. Definiție „Ready to Launch"

Platforma e gata de lansare publică (paid ads + PR) când **toate** condițiile de mai jos sunt ✅:

### 1.1 Business
- ✅ Pricing final decis și afișat (Free trial, Warrior, Commander, Sovereign / Elite) în EUR și LEI.
- ✅ Stripe LIVE mode activ, produse & prices sincronizate, webhook LIVE testat end-to-end.
- ✅ Refund policy + Terms + Privacy + Cookie policy publicate și link-uite din footer.
- ✅ Contract afiliați (coaches) semnat digital, Stripe Connect onboarding funcțional.

### 1.2 Produs
- ✅ Onboarding user < 3 min de la signup la primul „aha" (rutina de dimineață pornită).
- ✅ Toate cele 4 piloni (Body / Being / Balance / Business) au minim 1 flow complet funcțional.
- ✅ AI Mind Coach răspunde în < 5s la p95, cu fallback dacă gateway pică.
- ✅ Zero rute critice fără RLS. Zero edge functions fără auth (excepție: webhooks semnate).

### 1.3 Tehnic
- ✅ Lighthouse ≥ 85 pe Performance / SEO / Best Practices pe homepage și /pricing.
- ✅ LCP < 2.5s pe 4G mobile (măsurat pe device real, nu doar Lighthouse).
- ✅ Sitemap.xml + robots.txt corecte, indexate în Google Search Console.
- ✅ Security scan Lovable: zero „critical", ≤ 2 „high" cu justificare documentată.
- ✅ Backup DB verificat (restore test într-un mediu izolat).

### 1.4 Content
- ✅ Homepage RO + EN, funnel-uri principale (ebook, challenge, Elite) bilingve.
- ✅ Blog cu minim 8 articole SEO evergreen indexate.
- ✅ Email templates (transactional + marketing) RO + EN, cu unsubscribe funcțional.

### 1.5 Suport
- ✅ Canal support activ (email + chat) cu SLA public afișat.
- ✅ FAQ acoperă top 20 întrebări din interviurile beta.
- ✅ Documentație internă „incident response" (secțiunea 6) cunoscută de toți admins.

---

## 2. Prompt AI de audit pre-lansare (reutilizabil)

> Copiază de la linia de mai jos până la sfârșitul secțiunii 2 într-un mesaj nou pentru agentul Lovable.

---

### 2.0 Rol & Ton

Ești **Head of Engineering + Head of Growth** pentru CEO Mind OS. Răspunzi în română, direct, fără umplutură. Nu propui refactor până nu ai măsurat. Ești obsedat de **stabilitate în producție** și **conversie reală**.

### 2.1 Context

- Stack: React 18 + Vite + Tailwind + shadcn + TS. Lovable Cloud (Supabase managed).
- Brand: CEO Mind OS, „The Founder Operating System". Founder: Alin F. Radu.
- Persona AI: „Coach" (niciodată „Alin" sau „Alex" în UI).
- Framework: 4B (Body, Being, Balance, Business).
- Funnels: ebook burnout, challenge (5-day trial), Elite (direct pay), cursuri, coach content.
- Sursa de adevăr revenue: `stripe-webhook` → `checkout_events`, `ebook_purchases`, `subscribers`, `commissions`.
- Sursa de adevăr leads: `email_leads` + `metadata.utm_*`.
- Referințe existente: `docs/admin-audit-prompt.md`, `docs/payments-audit-prompt.md`, `docs/data-persistence-audit.md`, `src/docs/warrior-os-master-project.md`.

### 2.2 Ce trebuie să faci — 7 faze read-only

**Faza A — SEO & Performance**
1. Verifică `index.html`: `<title>` real (nu „Lovable App"), `<meta name="description">` < 160 chars, `og:*`, `twitter:card`, viewport, canonical.
2. Verifică `public/sitemap.xml` (generat via `scripts/generate-sitemap.ts`) și `public/robots.txt`.
3. Enumeră paginile publice fără `<h1>` unic, cu H1 duplicat sau fără alt-text pe imaginile hero.
4. Identifică imaginile hero fără `width/height/fetchpriority="high"` și fonturile fără `font-display: swap`.
5. Rulează `websearch--web_search` pentru site:ceomindos.com și enumeră ce e indexat vs. ce trebuie.

**Faza B — Security & RLS**
1. Rulează `security--run_security_scan` și rezumă findings pe severitate.
2. `supabase--linter` — enumeră warnings.
3. Query `pg_policies` pentru tabelele critice: `subscribers`, `ebook_purchases`, `course_purchases`, `coach_content_purchases`, `commissions`, `user_roles`, `crm_contact_profiles`. Confirmă că fiecare are RLS ON + policy scoped pe `auth.uid()` (sau `has_role`).
4. Enumeră edge functions fără verificare JWT (excepție legitimă: webhooks semnate — `stripe-webhook`, `auth-email-hook`).
5. Confirmă că `GRANT` există pe fiecare tabel public folosit de client.

**Faza C — Payments end-to-end**
1. Aplică checklist-ul din `docs/payments-audit-prompt.md`.
2. Confirmă Stripe LIVE keys prezenți în secrets (fără să-i afișezi). Nu inventa placeholder-uri.
3. Verifică `subscribers` pentru rânduri inconsistente (`subscribed=true` + `subscription_end < now()`).
4. Verifică `commissions` pending > 30 zile pentru coach-i cu `stripe_onboarding_complete=true`.
5. Testează `create-checkout` + `check-subscription` cu `supabase--curl_edge_functions` pe user de test.

**Faza D — Data persistence & i18n**
1. Aplică `docs/data-persistence-audit.md`: zero date user critice în `localStorage` ca sursă unică.
2. Verifică `useNotesCloud` (nu `useNotes`), `dailyMasterService.refreshFromDB()`, `visionScoresService`.
3. Enumeră stringurile hard-coded RO în componente publice care ar trebui traduse EN.
4. Verifică `auth-email-hook` — trimite RO sau EN conform `raw_user_meta_data.language`?

**Faza E — Funnels & analytics**
1. Verifică `useUtmCapture` propagă UTM până în `checkout_events.metadata`.
2. Rulează queries pentru rata de conversie: leads → ebook → challenge → paid pe 30 zile.
3. Confirmă că Meta Pixel (`src/lib/facebook-pixel.ts`) trage evenimente `Purchase`, `Lead`, `InitiateCheckout`.
4. Enumeră lead magnets fără email sequence configurat în `email_sequence_log`.

**Faza F — Reliability**
1. Verifică că fiecare edge function are: retry 3x, backoff exponențial, CORS `x-supabase-client-platform`.
2. Rulează `supabase--slow_queries` și enumeră top 10.
3. Verifică `supabase--db_health`.
4. Confirmă existența unui backup recent (< 24h) prin `supabase--project_info`.

**Faza G — PWA & mobile**
1. Verifică `public/manifest.webmanifest`: name, short_name, icons 192/512, `display: standalone`.
2. Verifică comportamentul „add to home screen" pe iOS și Android (documentat, nu doar cod).
3. Verifică tab-focus fix (mem://technical/tab-focus-refresh-prevention-logic) — ignoră `TOKEN_REFRESHED`.

### 2.3 Format livrare

Un singur mesaj Markdown structurat pe A-G, cu:
- **Semafor** per fază: 🟢 ready · 🟡 minor gaps · 🔴 blochează lansarea.
- **Tabel de blocante** (🔴) cu: item · impact · efort (S/M/L) · owner sugerat.
- **Top 5 acțiuni pentru săptămâna asta**.
- La final: *„Aprobi P0-urile pentru implementare?"* — nu treci în cod fără OK.

### 2.4 Reguli

- **NU modifica cod** în audit. Doar read + raport.
- **NU** afișa Supabase project IDs, URLs, service role key, DB password.
- **NU** inventa metrici — dacă lipsesc date, spune „nu se poate calcula, lipsește X".
- Dedupe `email_send_log` pe `message_id`. Join pe email → `LOWER(email)`.
- Pentru fiecare recomandare: impact revenue (mic/mediu/mare) + efort.

---

## 3. Checklist tehnic pre-lansare

### 3.1 Backend (Lovable Cloud)

- ✅ RLS ON pe fiecare tabel public. Policy default: deny.
- ✅ `GRANT` explicit pentru `authenticated` / `service_role` (anon doar unde e necesar).
- ✅ `user_roles` separat de profil. `has_role()` SECURITY DEFINER cu `search_path=public`.
- ✅ Edge functions: JWT verificat (excepție: webhooks semnate). CORS strict. Retry 3x + backoff.
- ✅ Secrets rotite: `STRIPE_SECRET_KEY` (LIVE), `STRIPE_WEBHOOK_SIGNING_SECRET`, `LOVABLE_API_KEY`, `RESEND_API_KEY` (dacă e cazul).
- ✅ `supabase--linter` fără warnings critice.
- ✅ Backup DB testat cu restore.
- ⚠️ Auth: „Leaked password protection" ON.
- ⚠️ Storage buckets: public numai unde e necesar; policy scoped pe user pentru privat.

### 3.2 Frontend

- ✅ `index.html`: title + description + og + twitter + canonical + viewport corect setate.
- ✅ Un singur `<h1>` per pagină. Alt-text pe toate imaginile de conținut.
- ✅ Fonturi cu `font-display: swap`.
- ✅ Hero image: `width`, `height`, `fetchpriority="high"`, fără `loading="lazy"`.
- ✅ Rute lazy-loaded (`React.lazy`) pentru pagini non-critice.
- ✅ Zero `console.log` în producție (folosește `src/lib/logger.ts`).
- ✅ Error boundary global. Toast pentru erori de rețea.
- ✅ Design tokens semantice — zero `text-white`, `bg-black`, culori hardcoded în componente.
- ⚠️ Bundle size < 500KB gzipped pentru entry chunk.
- ⚠️ PWA: manifest complet, install prompt în Settings.

### 3.3 SEO

- ✅ `sitemap.xml` regenerat (`scripts/generate-sitemap.ts`) și inclus în `robots.txt`.
- ✅ Google Search Console: property verificată, sitemap submis, zero „Coverage errors" critice.
- ✅ Structured data (JSON-LD) pe: Organization, WebSite, Product (pricing), Article (blog).
- ✅ Redirect 301 pentru rutele vechi (`warriorsos.com` → `ceomindos.com` unde e cazul).
- ⚠️ Meta Pixel + GA4 (dacă folosite) trag evenimente cheie.
- 💡 Blog: 8+ articole evergreen indexate cu keywords din `semrush--keyword_research`.

### 3.4 Payments (rezumat — full în `docs/payments-audit-prompt.md`)

- ✅ Stripe LIVE keys active.
- ✅ Webhook signing secret setat, endpoint testat cu `stripe listen` sau replay events.
- ✅ Toate produsele + prices create în LIVE, price IDs actualizate în `create-checkout`.
- ✅ Trial 5 zile funcțional (standard). Elite = direct pay (fără trial).
- ✅ `check-subscription` sincronizează corect. `ProtectedRoute` respectă `subscribed` + `subscription_end`.
- ✅ Refund flow testat manual.
- ✅ Stripe Connect: onboarding coach → prim payout testat.

### 3.5 Content

- ✅ Homepage: RO complet, EN complet.
- ✅ Pricing: RO + EN, LEI + EUR.
- ✅ Ebook funnel: landing + thank-you + upsell RO + EN.
- ✅ Challenge funnel: landing + trial signup + day-1 email RO + EN.
- ✅ Elite funnel: landing + checkout RO + EN.
- ✅ Email templates transactional (welcome, reset password, receipt) RO + EN, unsubscribe funcțional.
- ✅ Terms, Privacy, Refund, Cookie policy publicate.
- ⚠️ Blog: 8+ articole pilot indexate.
- 💡 Video hero (Voomly) < 5MB, poster image setat.

### 3.6 QA — flow-uri obligatorii testate

Pentru fiecare, testează pe **desktop + mobile**, în **RO + EN**:

- ✅ Signup email + Google OAuth.
- ✅ Free trial start → primul login → onboarding tour → primul task complet.
- ✅ Upgrade la Warrior (paid) → confirmare email → acces la features Warrior.
- ✅ Upgrade la Commander → acces Brotherhood + Tribes.
- ✅ Upgrade la Sovereign/Elite → acces coaching + prioritized support.
- ✅ Cancel subscription → grace period → block la features paid.
- ✅ Trial expirat fără card → redirect la /pricing.
- ✅ Refund → acces retras în < 5 min.
- ✅ Coach onboarding → referral link generat → primă comision înregistrată.
- ✅ Password reset flow complet.
- ✅ Unsubscribe email → nu mai primește campaign, primește totuși transactional.

---

## 4. Plan marketing pre-lansare (T-30 → T+7)

### T-30 — Foundation
- ✅ Publică landing „waitlist" cu form email (`email_leads` cu `lead_magnet='waitlist'`).
- ✅ Anunț personal Alin pe LinkedIn + Facebook + Instagram: „Lansăm pe [data]".
- ✅ Lansare lead magnet #1: **Burnout Test** (existent) — driver principal pe waitlist.
- ✅ Setup UTM tracking pe toate campaign-urile.
- ⚠️ Outreach 20 potențiali afiliați / parteneri (coaches, influenceri nișă).
- 💡 Începe seria „Behind the build" pe LinkedIn — 3 posturi/săpt.

### T-21 — Content warm-up
- ✅ Publică 3 articole blog pilot (SEO evergreen): „Cele 6 Gaps", „Framework 4B", „Rutina războinicului".
- ✅ Email #1 către waitlist: „De ce construim CEO Mind OS" (story-driven, video 3-5 min de la Alin).
- ⚠️ Podcast guest appearance × 2 (nișă antreprenoriat RO).
- 💡 Video teaser 60s pentru Instagram Reels + TikTok.

### T-14 — Reveal
- ✅ Landing pricing publicat (dar checkout dezactivat sau doar pre-order).
- ✅ Email #2 către waitlist: „Iată ce vei primi" (walkthrough features + pricing early-bird).
- ✅ Reveal video (3-5 min) publicat pe YouTube + landing.
- ✅ Anunț early-bird: **-30% primele 100 abonamente** valabil doar în ziua lansării.
- ⚠️ Activează afiliații: le trimiți creative kit + link personal.

### T-7 — Countdown
- ✅ Email #3 către waitlist: „7 zile" — countdown + FAQ + testimonials beta.
- ✅ Posturi zilnice pe LinkedIn cu countdown + un beneficiu/zi.
- ✅ Ultimă rundă QA: repetă toate flow-urile din 3.6 în producție cu card real.
- ✅ Verifică Stripe LIVE cu tranzacție reală (5 EUR test, refund după).
- ⚠️ Live stream „Ask me anything" cu Alin — 45 min.

### T-1 — Final check
- ✅ Rulează prompt-ul din secțiunea 2 → toate fazele 🟢.
- ✅ Backup DB manual + snapshot Stripe.
- ✅ Warm-up cache: rulează Playwright headless pe top 10 pagini.
- ✅ Confirmă on-call: Alin + 1 dev pe Slack toată ziua T-0.
- ✅ Pregătește 3 template-uri de răspuns support pentru top scenarii (bug, refund, cum funcționează trial).

### T-0 — Launch day
- ✅ 08:00: Email #4 — „Suntem live. Early-bird -30% expiră în 24h".
- ✅ 08:15: Anunț LinkedIn + Facebook + Instagram + IG Stories.
- ✅ 09:00: Live stream de lansare 30 min (Alin) — demo + Q&A.
- ✅ 12:00: Reminder email — „6h până expiră early-bird".
- ✅ 18:00: Ultima șansă — email + story.
- ✅ Monitor: `supabase--edge_function_logs` + Stripe dashboard + Sentry (dacă e activ).
- ✅ Health check la fiecare 2h: signups / errors / MRR.

### T+1 → T+7 — Post-launch
- ✅ T+1: Email de mulțumire + onboarding tips către noii users.
- ✅ T+2: Case study cu primul user care completează Warrior Routine 7 zile.
- ✅ T+3: Webinar „First results" pentru noii users.
- ✅ T+5: Anunț public — număr signups + MRR (dacă e demn de anunțat).
- ✅ T+7: Retrospectivă internă — ce a mers, ce a picat, ce refactorăm.
- ⚠️ Începe drip email sequence de retention (30 zile).

---

## 5. KPI de urmărit

| Metric | T-30 → T-1 | T-0 | T+7 | Cum se măsoară |
|--------|-----------|-----|-----|----------------|
| Waitlist size | 500+ | — | — | `email_leads WHERE lead_magnet='waitlist'` |
| Waitlist → paid | — | 5-10% | — | `checkout_events` JOIN `email_leads` pe email |
| CAC | < 30 EUR | — | — | Spend ads / paid signups |
| Signups T-0 | — | 100+ | — | `auth.users` created_at în ziua T-0 |
| MRR nou | — | — | 3-5K EUR | `subscribers WHERE created_at > T-0` |
| Trial → paid conversion | — | — | 30%+ | `subscribers WHERE tier IS NOT NULL / trials started` |
| Activation rate (D1 routine complete) | — | — | 60%+ | `daily_progress_stats.completion_rate` |
| Bounce rate homepage | < 40% | < 50% | < 40% | Analytics |
| LCP mobile | < 2.5s | < 2.5s | < 2.5s | Lighthouse + real user monitoring |
| Uptime edge functions | 99.5%+ | 99.5%+ | 99.9%+ | Lovable Cloud logs |
| Refund rate | — | — | < 5% | Stripe dashboard |

Dashboard-ul de urmărire zilnică = tabul **Marketing → Revenue** din `/admin` (vezi `docs/admin-current-map.md`).

---

## 6. Rollback & Incident response

### 6.1 Severity levels

- **SEV-1** — Site down, checkout down, DB indisponibil, data loss. Răspuns: < 15 min.
- **SEV-2** — Feature critică defectă (auth, RLS leak, email nu pleacă). Răspuns: < 1h.
- **SEV-3** — Feature secundară defectă, UI bug vizibil. Răspuns: < 24h.

### 6.2 Runbook — Stripe webhook fail

1. Verifică Stripe dashboard → Events → Failed.
2. `supabase--edge_function_logs` cu `function_name=stripe-webhook`.
3. Dacă e schema mismatch: rulează manual `check-subscription` pentru user-ii afectați (via `supabase--curl_edge_functions`).
4. Dacă e outage Stripe: user-ii vor primi acces la refresh (poll 5 min din `AuthContext`).
5. Post-mortem: adaugă test în `docs/payments-audit-prompt.md`.

### 6.3 Runbook — DB indisponibil

1. `supabase--cloud_status` + `supabase--db_health`.
2. Dacă e sub load: `supabase--slow_queries` → kill query problematic.
3. Dacă e outage regional Lovable Cloud: afișează banner „maintenance", pauzează ads.
4. Când revine: verifică `checkout_events` pentru evenimente pierdute (replay Stripe).

### 6.4 Runbook — RLS leak (data expusă altui user)

1. **SEV-1 imediat**. Notifică Alin.
2. Dezactivează endpoint-ul afectat (feature flag sau comentează ruta).
3. `security--run_security_scan` pentru a confirma scope.
4. Fix policy → migrație → verificare cu user de test.
5. Notifică user-ii afectați dacă a existat expunere reală (GDPR).

### 6.5 Rollback deploy

Lovable păstrează versiunile publicate. În Publish settings:
1. Identifică ultimul deploy stabil.
2. Republish-l.
3. Fix pe branch separat, retest, republish.

### 6.6 Comunicare incident

- Intern: canal Slack `#incidents`.
- Extern SEV-1/2: banner pe site + tweet + email către useri activi (dacă durează > 1h).
- Post-mortem în < 72h, arhivat în `docs/incidents/YYYY-MM-DD-slug.md`.

---

## 7. Anexe utile

- `docs/admin-audit-prompt.md` — audit admin panel (revenue + leads).
- `docs/payments-audit-prompt.md` — audit paywall + trial + subscriptions.
- `docs/admin-current-map.md` — harta admin actuală.
- `docs/data-persistence-audit.md` — DB-first standard.
- `docs/ai-stacks-spec.md` — specificația stack-urilor AI.
- `src/docs/warrior-os-master-project.md` — brand DNA + framework.

---

**Owner document**: Alin F. Radu · **Ultima actualizare**: 2026-07-04 · **Următoare revizie**: T-14 înainte de lansare.
