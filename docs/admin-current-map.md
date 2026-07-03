# Admin Panel — Hartă a Stării Actuale

Ruta: `/admin` → `AdminPage` → `<Layout>` → `<SecureAdminPanel>`  
Gate: `useAdminAuth` → RPC `has_role(auth.uid(), 'admin')`  
Sub-rută: `/admin/email-monitoring`

## Taburi top-level (9)

| Tab | Componentă | Ce conține | Tabele / Edge functions relevante |
|-----|-----------|-----------|-----------------------------------|
| **Overview** | (inline în `SecureAdminPanel`) | KPI generali | `daily_progress_stats`, `user_activity_log` |
| **CRM** | `CRMDashboard` | Contact 360°, Timeline, LeadSource, ChallengeDropOff, ChallengeConversations, ChallengeAdminChat, FunnelPipeline, FunnelVisualDashboard, AdminErrorMonitor, ClientObjectivesSection, ClientDoorPreview | `crm_contact_profiles`, `crm_activity_timeline`, `crm_admin_sessions`, `challenge_*` |
| **Leads** | `LeadMagnetAnalytics` | Metrici lead magnets | `email_leads`, `lead_magnet_events` |
| **Engagement** | `EngagementDashboard` | Retenție / activitate | `activity_sessions`, `daily_progress_stats`, `user_activity_log` |
| **Content** | `CourseManager`, `WarriorsWayManager` | CRUD cursuri | `courses`, `course_modules`, `course_submodules`, `warriors_way_*` |
| **AI Studio** | `AdminAIStudio` (+ `ai-studio/`) | Prompturi & unelte AI admin | `knowledge_base_files`, `ai_generated_images` |
| **Marketing** | sub-taburi: `MarketingHub`, `SplitTestDashboard`, `EmailAnalytics`, **`RevenueDashboard`** | Campanii, split tests, email health, revenue | `email_send_log`, `email_sequence_log`, `checkout_events`, `ebook_purchases`, `subscribers`, `course_purchases`, `coach_content_purchases`, `commissions` |
| **Coaches** | `AdminCoaches` | Coach roster, referrals, commissions | `coach_profiles`, `referrals`, `commissions`, `payout_history`, `platform_course_referrals` |
| **Settings** | `ApiConfig` | Config API/keys | secrets |

## Edge functions relevante pentru admin/revenue/leads

- `admin-users` — listare users (server-side, service role)
- `admin-ai-assistant` — chat asistent admin
- `admin-impersonate` → `admin_impersonation_log`
- `funnel-leads-dashboard` — agregă `email_leads` + `ebook_purchases` + `subscribers` + `email_sequence_log`
- `stripe-webhook` — sursa de adevăr pentru revenue (populează `checkout_events`, `ebook_purchases`, `course_purchases`, `subscribers`, `commissions`)
- `send-burnout-funnel-sequence` — trigger secvențe email lead

## Tabele „revenue" & „leads" (ownership DB)

**Revenue (bani reali):**
- `checkout_events` (9 col) — sursa evenimentelor Stripe raw
- `ebook_purchases` (12 col) — inclusiv `upsell_purchased_at`, `upsell_email_1/2_sent_at`
- `course_purchases` (8 col)
- `coach_content_purchases` (13 col)
- `commissions` (11 col) — trigger `activate_referral_on_payment`
- `payout_history` (8 col)
- `subscribers` (11 col) — `subscribed`, `subscription_tier`, `subscription_status`

**Leads / funnel:**
- `email_leads` (12 col) — `lead_magnet`, `metadata` (utm, language)
- `lead_magnet_events` (10 col)
- `marriage_quiz_leads` (18 col)
- `email_send_log` (8 col) — `message_id` (dedupe!), `status`, `template_name`
- `email_sequence_log` (10 col) — `sequence_type`, `day_number`, `opened_at`, `clicked_at`
- `email_send_state` (7 col), `email_unsubscribe_tokens`, `suppressed_emails`
- `checkout_events` (funnel attribution)

**CRM unificat:**
- `crm_contact_profiles` (48 col) — profil master
- `crm_activity_timeline` (11 col)
- `crm_admin_sessions` (11 col)

**Coaches:**
- `coach_profiles` (15 col) — `referral_code`, `stripe_connect_id`, `total_earnings`, `pending_payout`
- `referrals` (9 col), `commissions`, `payout_history`, `platform_course_referrals`

## Zone de suprapunere observate (candidate la consolidare)

1. **Leads** apare în ≥3 locuri: tab „Leads" (`LeadMagnetAnalytics`), sub-CRM (`FunnelLeadsDashboard`, `FunnelPipeline`, `FunnelVisualDashboard`, `LeadSourceStats`), și în Marketing (`EmailAnalytics`, `SplitTestDashboard`).
2. **Revenue** e îngropat în Marketing → sub-tab (nu top-level), deși e KPI-ul #1 al businessului.
3. **CRM Dashboard** conține componente cu scop diferit (funnel, error monitor, client door preview, challenge chat) — cere segmentare.
4. **Coaches** e izolat de Revenue, deși partajează `commissions` + `payout_history`.
5. Nu există **vedere unificată LTV/cohort** pe email (leaduri care au devenit clienți).

## Ce lipsește (gap-uri evidente)

- **MRR / ARR / NET revenue** — niciun raport dedicat pe `subscribers.subscription_tier`.
- **Refund tracking** — nu există join clar cu evenimente `charge.refunded`.
- **Product mix revenue** — split real ebook vs. challenge vs. Elite vs. cursuri vs. coach content.
- **Cohort retention** pe lună de signup.
- **Attribution UTM → revenue** — `utm_*` sunt în `email_leads.metadata` dar nu propagate până la `checkout_events`.
- **Alertare** — leaduri „orfane" (fără follow-up de X zile), rate bounce/complaint pe template.
- **Coach payout ready** — vedere „gata de plată" agregată.
