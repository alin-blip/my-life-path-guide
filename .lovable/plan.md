
# Redesign Email-uri Profesionale + Notificare Admin Erori

## 1. Problema Curenta cu Email-urile

Toate email-urile (welcome, daily, recovery, upgrade, reactivation, promo) folosesc:
- Fundal negru (#0a0a0a) cu gradienți portocaliu/roșu -- arata ca un joc video, nu ca o platforma de business
- Subiecte pline de emoji-uri (🔥🏆💪⚡🧠💡🚨📉) -- pare spam/AI
- Secțiune "Invita 1-3 Prieteni" in FIECARE email -- agresiv
- Branding inconsistent: "WarriorOS" / "MyLifePathGuide" / "Warriors Membership"
- Recovery emails sunt basic si urate comparativ cu cele de welcome

**10 edge functions afectate:**
- send-challenge-welcome
- send-challenge-daily
- send-challenge-recovery
- send-challenge-reactivation
- send-challenge-upgrade
- send-challenge-day7-upgrade
- send-challenge-reminder
- send-challenge-promo-sequence
- send-goal-plan-email
- send-life-score-results

---

## 2. Noul Stil Email -- Profesional pentru Antreprenori

Design nou:
- Fundal alb/light (#ffffff body, #f7f7f8 wrapper)
- Font clean, fara gradient-uri agresive
- Logo WarriorOS text simplu in header (nu emoticoane)
- Subiecte scurte si directe fara emoji-uri (scrisa ca un antreprenor)
- Un singur CTA clar per email
- Footer minimal cu dezabonare
- Secțiunea "Invita Prieteni" eliminata din toate email-urile zilnice (pastrata doar in welcome)
- Branding unitar: "WarriorOS" peste tot

Exemplu subiect inainte: `🔥 Ziua 1: Viziunea ta pentru 2026 incepe acum`
Exemplu subiect dupa: `Ziua 1: Viziunea ta pentru 2026`

Exemplu subiect recovery inainte: `🚨 ULTIMA NOTIFICARE: Challenge-ul te asteapta`
Exemplu subiect recovery dupa: `Nu pierde progresul de pana acum`

---

## 3. Email One-Time: "Platforma reparata"

Se creaza o noua edge function `send-platform-update` care:
- Trimite un singur email la cele 59 de adrese unice de challenge subscribers
- Template simplu si profesional
- Subiect: `Update platforma -- problema rezolvata`
- Continut:
  - "Am identificat si corectat o problema tehnica in modulul de creare obiective."
  - "Totul functioneaza acum corect."
  - "Daca ai intampinat dificultati, te invitam sa reincerci."
  - CTA: "Continua Challenge-ul"
- Se trimite o singura data (cu deduplicare pe email)
- Se apeleaza manual din admin

---

## 4. Fix ErrorBoundary + Capturare Erori Client

**Problema actuala:** ErrorBoundary.tsx scrie in coloane care nu exista in tabel:
- Cod scrie: `error_stack`, `component_stack`, `url`, `user_agent`, `timestamp`
- Tabel are: `stack_trace`, `component_name`

**Fix:**
- Se adauga coloane lipsa in `error_logs`: `url`, `user_agent`, `component_stack`
- Se repara ErrorBoundary sa scrie in coloanele corecte
- Se adauga un handler global `window.onerror` si `unhandledrejection` pentru a captura si erorile care nu sunt React (fetch errors, promise rejections)

---

## 5. Notificari Admin pentru Erori

Se creaza o componenta `AdminErrorMonitor` vizibila in panoul admin (tab Overview) care:
- Arata un badge rosu pe tab-ul Overview cand exista erori noi (ultimele 24h)
- Lista ultimelor erori cu: data, user email (daca e disponibil), URL, mesaj
- Buton "Rezolvat" care marcheaza eroarea ca vazuta
- Se adauga un indicator in header-ul admin daca sunt erori nerezolvate
- Query realtime pe `error_logs` pentru a vedea erori noi instant

---

## Detalii Tehnice

### Migrare baza de date
Se adauga coloane noi in `error_logs`:
```sql
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS component_stack text;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
```

Se adauga RLS policy: adminii pot citi si actualiza toate error_logs.
Se activeaza realtime pe `error_logs`.

### Edge functions modificate (stil nou)
Toate cele 10 edge functions primesc template-ul nou profesional:
- Background alb, text negru, CTA albastru/brand color
- Fara emoji in subiecte
- Fara "Invite Friends" (exceptie: welcome email)
- Footer simplu cu "WarriorOS" si link dezabonare

### Edge function noua: `send-platform-update`
- Primeste de la admin comanda de a trimite
- Citeste toate adresele unice din `email_leads` cu `lead_magnet LIKE 'challenge%'` si `subscribed = true`
- Trimite emailul de update, cu rate limiting (1/secunda pentru Resend)
- Logheaza in `email_sequence_log` cu `sequence_type = 'platform_update'`

### Componenta `AdminErrorMonitor.tsx`
- Query `error_logs` ORDER BY created_at DESC LIMIT 50
- Realtime subscription pe INSERT
- Card cu lista de erori
- Buton mark as resolved
- Badge cu count erori nerezolvate

### Fix `ErrorBoundary.tsx`
- Corectare coloane: `error_message`, `stack_trace`, `component_name`, `url`, `user_agent`, `component_stack`
- Adaugare handler global in `App.tsx` sau `main.tsx` pentru `window.addEventListener('error')` si `unhandledrejection`

### Componenta `GlobalErrorCapture.tsx`
- Hook care capteaza erori non-React (fetch 500, promise rejections)
- Scrie in `error_logs` automat
- Se monteaza in root App

---

## Ordine de Implementare

1. Migrare DB: coloane noi in `error_logs` + RLS + realtime
2. Fix `ErrorBoundary.tsx` (coloane corecte)
3. Creare `GlobalErrorCapture.tsx` (capturare erori globale)
4. Creare `AdminErrorMonitor.tsx` + integrare in admin Overview
5. Creare edge function `send-platform-update` cu template profesional
6. Redesign template-uri email in toate cele 10 edge functions
7. Trigger trimitere email "platforma reparata" din admin
