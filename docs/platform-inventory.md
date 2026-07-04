# CEO Mind OS — Full Platform Inventory (A → Z)

> Complete technical + product inventory of everything shipped in the platform. Source of truth for emails, offers, webinars, content, ads, sales pages, and investor material. Companion doc: `docs/platform-marketing-angles.md` (pitch-ready copy per feature).

Last generated from live codebase. Sections are exhaustive, not summarized.

---

## 1. Brand & Positioning

- **Product name**: CEO Mind OS (previously WarriorOS / Warrior System)
- **Tagline**: *"The Operating System for Founders & CEOs"* — primary marketing line: *"Success Without Sacrifice"*
- **Founder**: Alin Florin Radu
- **Domains**: `ceomindos.com` (RO/EN), `warriorsos.com`, `my-life-path-guide.lovable.app`
- **Email sender domain**: `notify.ceomindos.com` (managed via Lovable Email infrastructure)
- **Languages**: Romanian (primary) + English (full parity on funnels & core UX)
- **Design system** (Monolith v1): Navy `#0B1733`, Gold `#D4A84A`, Cream `#F5EFE0`, accent Cyan `#3FD0E8`. 70/25/5 color distribution. Radius 0.5rem.
- **Voice**: Empowering, direct, holistic-but-grounded, tech-forward, no toxic positivity. AI persona is always addressed as **"Coach"** (never a personal name).

### The 6 Founder Gaps (core problem framework)
1. **Identity Trap** — stuck as operator, not CEO
2. **Burnout Trap** — non-stop work, sacrifice as default
3. **Sacrifice Myth** — belief that success requires trading health/family
4. **Execution Gap** — knowledge without daily implementation
5. **Emotional Deficit** — emotions sabotaging decisions
6. **Accessibility Barrier** — elite systems cost €10k+

### The 4B Framework (four pillars)
| Pillar | Domain | In-platform modules |
|--------|--------|---------------------|
| **Body** | Physical health, fitness, nutrition, sleep | Workout, Nutrition, Meal Planner, Breathing, Fitness dashboard |
| **Being** | Mind, spirit, emotions, meditation | Mind Coach, Belief System, Mentalitate Stack, Meditations, Journal, PSA |
| **Balance** | Relationships, family, marriage, parenting | Marriage Stack, Parenting Stack, Relationships, Direct Messages, Tribes |
| **Business** | Career, execution, revenue, systems | Domino Door, Weekly Planning, Ideas Bank, Content Creation, Time Tracker, Master Plan, Biz4 |

---

## 2. Public Marketing Site & Funnels (top of funnel)

### 2.1 Landing / index pages
| Route | Purpose | Language |
|-------|---------|----------|
| `/` (Index) | Main brand landing | RO/EN |
| `/about` | Founder story + philosophy | RO/EN |
| `/pricing` | Membership plans (Basic / Pro / Elite) + trial | RO/EN |
| `/b2b` | Partner Coach program (50% recurring commission) | RO/EN |
| `/referral-program` | Affiliate program | RO |
| `/mind-coach-transform` (`MindCoachLanding.tsx`) | AI Mind Coach product page | RO/EN |
| `/warrior-launch-accelerator` | 90-day launch accelerator (ELITE only) | RO |
| `/blog` + `/blog/[slug]` | SEO content hub | RO/EN dual (with locale detection + fallback) |

### 2.2 Lead magnets (quizzes & tests)
| Route | Lead Magnet | Data captured | DB tables |
|-------|-------------|---------------|-----------|
| `/burnout-test` | Burnout quiz RO — 20 questions, radar chart | email, score, dimensions, language | `email_leads`, `lead_magnet_events` |
| `/burnout-test-en` | Burnout quiz EN | idem | idem |
| `/life-score` (`LifeScore.tsx`) | Life score 4B assessment | email, per-pillar score | `email_leads` |
| `/quick-quiz` | Rapid founder assessment | email, quick answers | `email_leads` |
| `/vision-quiz` (component set) | Vision 2026 quiz | vision seeds | `email_leads` |
| `/marriage-quiz` | Marriage/relationship diagnostic | email, quiz answers, language | `marriage_quiz_leads` |
| `/vibe-canvas` | Vibe Canvas artistic manifestation tool | canvas project | `canvas_projects` |
| `/core-4-lead-magnet` (`Core4LeadMagnet.tsx`) + `/core-4-thank-you` | Core 4 assessment funnel | email + score | `email_leads` |
| `/business-2026-lead-magnet` | Business Vision 2026 lead capture | email, business goals | `email_leads` |
| `/warrior-power` (`WarriorPower.tsx`) | Warrior Power test | results | `warrior_power_results` |
| `/hormozi-analysis` | Hormozi-style offer analysis | AI output | edge fn `hormozi-coaching` |
| `/voice-analysis` | Voice recording → AI sentiment | audio blob → transcript | `voice_recordings` |

### 2.3 Content funnels (mid-funnel)
| Route | Type | Value delivered |
|-------|------|-----------------|
| `/ebook` (`EbookLanding.tsx`) | Free ebook opt-in — *"From Burnout to Peak Performance"* | PDF + email nurture |
| `/ebook-thank-you`, `/ebook-payment-success` | Post-opt-in / paid delivery | Download link |
| `/ebook-upsell` (`EbookUpsell.tsx`) | One-time upsell after ebook | Paid product (Stripe) |
| `/challenge-7-zile` (`Challenge7ZileLanding.tsx`) | Free 7-day transformation challenge RO | Daily lessons + coach chat |
| `/challenge-en` (`ChallengeEnglish.tsx`) + `/challenge-day-en/:day` | EN version, 7 days | idem |
| `/challenge/:day` (`ChallengeDay.tsx`) | Daily challenge lesson | Video + tasks + reflection |
| `/challenge-upsell` | Post-challenge upgrade offer | Paid subscription |
| `/challenge-landing` | Alternate challenge landing (split test) | idem |

### 2.4 Legal / support
`/terms`, `/privacy`, `/support`, `/unsubscribe`, `/auth` (login/register)

---

## 3. In-App Modules (post-login product)

The app is organized by the 4B framework. Every module below is a live page with its own DB persistence, RLS policies, and (usually) an AI coach layer.

### 3.1 BODY — physical performance

| Module | Route | What it does |
|--------|-------|--------------|
| **Workout** | `/workout`, `/workout-history` | Programs, day-by-day exercises, sets/reps tracking, history log |
| **Fitness dashboard** | `/fitness` | Aggregate: calories, macros, water, sleep, streak |
| **Nutrition** | `/nutrition` | Macro targets, meal logs, food search |
| **Meal Planner** | (inside Nutrition) | Auto-generated multi-day meal plans (`meal_plans`, `meal_plan_days`) |
| **Breathing** | `/breathing` (component) | Box breathing, 4-7-8, coherent breathing + music library (`breathing_music` bucket) |
| **Champion Routine** | `/champion-routine`, `/champion-routine-history` | Configurable morning ritual with 40+ trackable items across 4B |
| **Warrior Routine** (aka Daily Master Stack) | `/core`, `/daily-four`, `/daily-flow` | 6-section morning execution system |

**Tables**: `workout_programs`, `workout_program_days`, `workout_day_exercises`, `workout_exercises`, `workout_sessions`, `workout_templates`, `meal_plans`, `meal_plan_days`, `daily_habits`, `daily_habit_completions`, `daily_tracking`, `daily_progress`, `champion_routine_logs`, `champion_routine_settings`, `champion_routine_people`, `breathing_music`.

### 3.2 BEING — mind, spirit, emotional mastery

#### 3.2.1 Mind Coach (flagship AI product)
- **Route**: `/mind-coach`, `/mind-shifting`
- **Edge fns**: `mind-coach`, `mind-coach-demo`, `mind-shift-chat`, `mind-shift-suggest`
- **Voice mode**: `useMindCoachVoice`, `realtime-voice`, `realtime-ephemeral-session` (OpenAI Realtime API + ElevenLabs TTS)
- **Data**: `mind_shift_sessions`, `mind_shift_beliefs`, `mind_shift_categories`, `mind_shift_distortions`, `divine_coaching_sessions`
- **Personas**: Standard Coach, Divine Coaching (spiritual), Shadow Coach (`shadow_coach_daily_snapshots`), Personal Power Coach, Ultimate You Coach, Hormozi Coach, Accountability Coach, Beliefs Coach, Parenting Coach, Marriage Coach, Challenge Coach, Warrior AI Coach, Kill It Today Coach, Task Coach Breakdown, Goal Wizard AI

#### 3.2.2 Belief System (Leader Transformation)
5 core leader beliefs, each a full sub-app:
| Belief | Route | Data |
|--------|-------|------|
| **Fundamentele credințelor** (audit) | `/credinte`, `/credinte/audit`, `/credinte/audit/rezultat`, `/credinte/capitol/:slug` | `belief_audits`, `belief_chapters`, `belief_chapter_progress` |
| **Anti-Arogance / Humility** | `/belief/anti-arrogance` | `belief_fishbowl_responses` |
| **Forgiveness** | `/belief/forgiveness` | `belief_forgiveness_logs` |
| **Gratitude Anchor** | `/belief/gratitude-anchor` | `belief_gratitude_logs` |
| **No-But Validator** | `/belief/no-but-validator` | — |
| **Self-Care** | `/belief/self-care` | `belief_self_care_logs` |
| **Belief Reprogrammer Hub** | `/belief-reprogrammer`, `/belief-reprogrammer/:sessionId` | 4-phase childhood belief rewrite: `belief_reprogrammer_sessions`, `belief_reprogrammer_artifacts`, `belief_reprogrammer_library`, `belief_mantras` |
| **Biblioteca Credințelor** | `/biblioteca-credintelor` (`BeliefLibrary.tsx`) | User's belief collection + audio mantras (14 pre-recorded MP3s in `src/assets/audio/credinte/`) |

Edge fns: `beliefs-coach`, `beliefs-executive-audit`, `beliefs-fishbowl-feedback`, `beliefs-audit-export-tasks`, `beliefs-reprogrammer`.

#### 3.2.3 Minte (Mind category)
| Sub-module | Route | Purpose |
|-----------|-------|---------|
| Brain Map (6 axes) | `/minte` | Visual mind map across 6 dimensions (`mind_axis_scores`) |
| Mind Tests | `/minte/teste`, `/minte-quiz/:id` | Standardized quizzes (CEO, perception, etc. — see `src/data/mind-quizzes/`) |
| Credințe (Belief Matrix) | `/minte/credinte` | Cross-axis belief matrix (`mind_belief_matrix`) |
| PSA (Peak State Access) | `/minte/psa` | Peak state reconstruction (`mind_psa_history`, `mind_psa_reconstruction`) |

#### 3.2.4 Mentalitate Stack
- **Route**: `/mentalitate-stack`
- 5-step guided mental reframe. AI coach guides user through: trigger → belief → distortion → reframe → integration.
- Edge fn: `mentalitate-stack-coach`
- Data: `mentalitate_stack_sessions`, `stack_sessions`, `stack_library`

#### 3.2.5 Emotional Stack Library (9 emotions)
Each is a full guided intervention (JSON in `src/data/stacks/`):
- Anger (RO + EN), Anxiety (RO), Fear (RO), Frustration (RO), Panic (RO), Sadness (RO), Shame (RO), Divine (RO — spiritual/gratitude)
- Route: `/stack-library`, `/stack/:emotion`, `/stack-viewer/:id`
- Data: `stack_sessions`, `stack_library`, `anger_stack_sessions`, `emotional_checkins`, `emotional_patterns`

#### 3.2.6 Meditations (Empowerment Meditation)
- **Route**: `/empowerment-meditation`
- **14 templates** across 4 categories:
  - *Empowerment*: Have It All, Body Power, Inner Peace, Deep Relationships, Success & Abundance
  - *Productivity*: Daily Focus, Morning Energy, Deep Work Motivation
  - *Recovery*: Deep Relaxation, Peaceful Sleep, Breath & Calm
  - *Special*: Gratitude, Affirmations, Evening Reflection
- Personalized to user's Vision Board / Missions / Big One / Relationships
- Edge fns: `generate-empowerment-meditation`, `generate-story-script`, `generate-hero-journey-script`, `generate-script`, `text-to-speech` (ElevenLabs)
- Data: `empowerment_meditations`, `ai_generated_images`

#### 3.2.7 Journal & Notes
- `/journal` — daily journal entries (`journal_entries`)
- `/notes` — freeform notes with cloud sync (`notes` table via `useNotesCloud`)
- `/evening` — evening brain dump (edge fn `evening-brain-dump`)

#### 3.2.8 Life & Vision Planning
| Module | Route | Data |
|--------|-------|------|
| Master Plan System (Napoleon Hill) | `/master-plan-system` | `napoleon_hill_projects`, `napoleon_hill_principle_drafts`, `napoleon_hill_notifications`, `napoleon_hill_backups` bucket |
| Lifebook | `/lifebook` | 12 life categories: `lifebook_entries`, `lifebook_drafts` |
| Vision 2026 | `/vision-2026`, `/vision-2026-plan`, `/vision-2026-dashboard` | Big vision + yearly plan |
| Vision Board 2026 | `/vision-board` | AI-generated imagery (`vision_boards`, `generate-vision-board-images`) |
| Fact Maps | `/fact-maps` | Root-cause maps (`fact_maps`) |
| Personal Power | `/personal-power`, `/personal-power/day/:day` | 30-day personal power program (`personal_power_progress`) |
| Ultimate You | `/ultimate-you`, `/ultimate-you/day/:day` | Ultimate You program (`ultimate_you_progress`) |

### 3.3 BALANCE — relationships & family

#### 3.3.1 Marriage Stack (flagship)
- **Routes**: `/marriage`, `/marriage-quiz`, `/marriage-audit`, `/marriage-profile`, `/marriage-timeline`
- **6-axis relational audit** with multimodal input (text + voice + evidence uploads to `marriage-evidence` bucket)
- **Output**: "Reality Triangle" diagnostic
- **Edge fns**: `marriage-coach`, `marriage-coach-followup`, `marriage-quiz-analyze`, `marriage-transcribe`, `send-marriage-sequence`
- **Data**: `marriage_profiles`, `marriage_sessions`, `marriage_session_messages`, `marriage_timeline_events`, `marriage_quiz_leads`

#### 3.3.2 Parenting Stack
- **Routes**: `/parenting`, `/parenting/coach`, `/parenting/library`, `/parenting/profile`, `/parenting/timeline`, `/parenting/tools`, `/parenting/toxicity-scan`
- Manages up to 8 active children per user
- Toxicity scan for parent-child interactions
- Evidence-based tools library
- **Edge fns**: `parenting-coach`, `parenting-toxicity-analyze`
- **Data**: `parenting_profiles`, `parenting_children`, `parenting_sessions`, `parenting_session_messages`, `parenting_daily_tools`, `parenting_evidence_sources`, `parenting_toxicity_scans`, `parenting_timeline_events`

#### 3.3.3 Relationships general
- `/relationships` — quality-time tracking, relationship actions (`relationship_actions`)
- `/messages` — direct messages system (`direct_messages`, `useDirectMessages`)

### 3.4 BUSINESS — execution & revenue

#### 3.4.1 Domino Door (Weekly Command Center)
- **Route**: `/door`
- **The strategic weekly planning system** — HIT List, HOT List, DO List
- Week key format: `door-week-YYYY-WW`
- AI planning assistant: edge fn `door-ai-planning`
- Realtime collaboration hooks: `useDoorRealtime`, `useDoorStorageSave`
- **Data**: `user_tasks`, `hot_list_items`, `weekly_planning`, `weekly_planning_drafts`, `weekly_planning_history`, `archived_tasks`, `weekly_reviews`

#### 3.4.2 Ideas & Content
- `/ideas-bank` (component) — capture pipeline (`ideas_bank`, `idea_empowerment`, `useIdeaToTaskBridge`)
- Content Creation module — content pipeline (`content_creation`, `scheduled_posts`)
- Edge fns: `analyze-idea`, `generate-feature-images`

#### 3.4.3 Time Tracking & Focus
- `/time-tracker` — time entries (`time_entries`, `weekly_time_reports`)
- `/focus` — deep-work sessions with binaural beats (`useBinauralBeats`)
- `/kill-it-today` — daily execution coach (`kill_it_today_sessions`)
- Edge fns: `kill-it-today-coach`, `time-insights`

#### 3.4.4 Biz4 (Business KPIs)
- `/biz4-report`
- Daily/weekly business metrics: `biz4_daily_metrics`, `biz4_weekly_objectives`
- Reminders: `useBiz4Reminders`

#### 3.4.5 Goals & Missions
- `/game`, `/game-objectives` — gamified goal system (`missions`, `objectives`, `quests`, `user_quest_progress`, `game_journey_maps`, `goal_reminders`)
- Edge fns: `goal-wizard-ai`, `life-vision-ai`, `setup-vision-plan`, `generate-path-plan`, `lifebook-mission-suggest`

---

## 4. Dashboard & Widgets System

- **Route**: `/dashboard`, `/widget-dashboard`, `/dashboard/settings`
- **Widget engine**: user-configurable dashboard, drag-and-drop layout
- **Available widgets** (`src/config/dashboardWidgets.ts`): macronutrients, workout, calories, gratitude, streak, tasks, ideas, journal, reading, water, plus custom widgets
- **Tables**: `custom_widgets`, `widget_data`, `widget_templates`, `user_widget_purchases`
- **Edge fn**: `generate-widget-config`

---

## 5. Gamification & Progress

| System | Data |
|--------|------|
| XP + levels | `user_xp`, `xp_history`, `useXPSystem`, `useRoutineXP` |
| Achievements | `user_achievements`, `routine_achievements`, `/achievements` |
| Streaks | `useStreakTracking` |
| Leaderboard | `leaderboard_profiles`, `/leaderboard` |
| Weekly / monthly scores | `weekly_scores`, `monthly_scores` |
| Daily progress stats | `daily_progress_stats`, `user_statistics` |
| Activity tracking | `activity_sessions`, `user_activity_log` |
| Tribe points & badges | `tribe_points`, `tribe_badges`, `tribe_user_badges` |
| Burnout alerts | `burnout_alerts` |
| Vision scores | `visionScoresService` |

---

## 6. Community — Tribes (in-house Skool alternative)

### 6.1 Core
- **Route**: `/groups`, `/groups/:id` (`GroupPage.tsx`)
- **Data**: `tribes`, `tribe_members`, `tribe_invites`, `tribe_join_requests`
- Public / private tribes, member counts auto-managed, welcome DM auto-sent (`send_tribe_welcome_dm` trigger)

### 6.2 Content inside tribes
- **Wall posts** with likes & comments: `wall_posts`, `wall_post_likes`, `wall_post_comments`, `warriors_comment_reactions`
- **Events + RSVPs**: `tribe_events`, `tribe_event_rsvps`
- **Tribe courses**: `tribe_courses`, `tribe_course_modules`, `tribe_module_progress`
- **Notifications**: `push_notifications`, `notify-community-post`

### 6.3 Auto-onboarding
- Every new user auto-joined to "Warrior Tribe" (main tribe, hardcoded UUID) via `handle_new_user_community` trigger.
- Also creates leaderboard profile.

### 6.4 Brotherhood (PRO tier)
- `/brotherhood` — accountability channel (`brotherhood_messages`)

---

## 7. Courses & Learning

| System | Route | Data |
|--------|-------|------|
| **Platform Courses** | `/learn`, `/library` | `courses`, `course_modules`, `course_submodules`, `user_course_progress`, `course_purchases` |
| **Warriors Way** | `/warriors-way` | Full course with 15-col lesson content: `warriors_way_lesson_content`, `warriors_way_progress`, `warriors_way_comments`, `warriors_action_completions` |
| **Book: Napoleon Hill** | Integrated into Master Plan | `book_reading_progress`, `useReadingProgress` |
| **Coach Content Marketplace** | Coach dashboard | `coach_content`, `coach_content_purchases` (13 cols incl. splits) |
| **Programs hub** | `/programs` | Aggregated learning experiences |

Iframe/video embedding via Voomly (`videoEmbedId`).

---

## 8. Coach Ecosystem (B2B Partner Program)

Full 2-sided marketplace.

- **Landing**: `/b2b`, `/referral-program`
- **Coach dashboard**: `/coach` (`CoachDashboard.tsx`)
- **Coach modules**:
  - Profile & Stripe Connect onboarding (`coach_profiles`, `stripe_connect_id`, `total_earnings`, `pending_payout`)
  - Referrals & commissions (50% recurring): `referrals`, `commissions`, `payout_history`, `platform_course_referrals`
  - Coach tribes: `useCoachTribe`, `useCoachTribeAdmin`, `useCoachTribeEvents`, `useCoachTribeFeed`, `useCoachTribeGamification`, `useCoachTribeLessons`
  - Coach routine templates (sell your own morning ritual): `coach_routine_templates`
  - Coach meal plans: `useCoachMealPlans`
  - Coach messages: `coach_messages`
  - Coach content (sell courses/PDFs to your audience): `coach_content`, `coach_content_purchases`
- **Edge fns**: `create-coach-connect-account`, `create-coach-content-checkout`, `process-coach-payouts`, `process-referral`
- **Auto-trigger**: `activate_referral_on_payment` — first commission auto-activates the referral status.

---

## 9. AI Layer — Everything AI-powered

| Capability | Edge function | Model / provider |
|-----------|---------------|------------------|
| Mind Coach (chat) | `mind-coach`, `mind-coach-demo` | Lovable AI (Gemini/GPT) |
| Mind Shift chat | `mind-shift-chat`, `mind-shift-suggest` | Lovable AI |
| Realtime voice coach | `realtime-voice`, `realtime-ephemeral-session` | OpenAI Realtime API |
| Text-to-speech | `text-to-speech`, `text-to-speech-demo` | ElevenLabs |
| Speech-to-text | `whisper-transcribe`, `marriage-transcribe` | OpenAI Whisper |
| Belief coaching | `beliefs-coach`, `beliefs-executive-audit`, `beliefs-fishbowl-feedback` | Lovable AI |
| Belief reprogrammer | `beliefs-reprogrammer` | Lovable AI |
| Marriage coach | `marriage-coach`, `marriage-coach-followup`, `marriage-quiz-analyze` | Lovable AI |
| Parenting coach | `parenting-coach`, `parenting-toxicity-analyze` | Lovable AI |
| Challenge coach | `challenge-coach` | Lovable AI |
| Weekly planning AI | `door-ai-planning` | Lovable AI |
| Idea analysis | `analyze-idea` | Lovable AI |
| Sentiment analysis | `analyze-sentiment` | Lovable AI |
| Emotional insights | `emotional-insights` | Lovable AI |
| Time insights | `time-insights` | Lovable AI |
| Meditation script gen | `generate-empowerment-meditation`, `generate-story-script`, `generate-hero-journey-script`, `generate-script` | Lovable AI + ElevenLabs |
| Vision board images | `generate-vision-board-images` | Lovable AI (image gen) |
| Feature images | `generate-feature-images` | Lovable AI (image gen) |
| Hormozi coaching | `hormozi-coaching`, `hormozi-platform-analysis` | Lovable AI |
| Personal Power coach | `personal-power-coach` | Lovable AI |
| Kill It Today coach | `kill-it-today-coach` | Lovable AI |
| Accountability coach | `accountability-coach` | Lovable AI |
| Task breakdown | `task-coach-breakdown` | Lovable AI |
| Goal wizard | `goal-wizard-ai`, `life-vision-ai`, `setup-vision-plan`, `generate-path-plan` | Lovable AI |
| Life score plan | `send-life-score-plan` | Lovable AI |
| Platform assistant | `platform-assistant` | Lovable AI (used across app) |
| Admin AI assistant | `admin-ai-assistant` | Lovable AI |
| Firecrawl scrape | `firecrawl-scrape` | Firecrawl API |
| Napoleon Hill notifications | `napoleon-hill-notifications` | Lovable AI |
| Lifebook mission suggest | `lifebook-mission-suggest` | Lovable AI |
| Evening brain dump | `evening-brain-dump` | Lovable AI |
| Live AI coaching | `ai-live-coaching` | Lovable AI |
| Preview transactional email | `preview-transactional-email` | Rendering only |
| Warrior AI coach | `warrior-ai-coach` | Lovable AI |

**Total: 40+ AI-powered edge functions.**

---

## 10. Payments & Monetization

### 10.1 Tiers (Membership)
Source: `src/pages/Pricing.tsx`

| Tier | Monthly (EUR / RO) | Annual (EUR / RO) | Trial | What's included |
|------|--------------------|-------------------|-------|-----------------|
| **Free** | €0 | €0 | 3-day | Dashboard, Habits, Challenges, Fact Maps, Game, Vibe Canvas, Warriors Way, Programs, Messages, Groups |
| **Basic** | €49 early bird / €97 normal · 249 / 490 LEI | €399 · 1990 LEI (vs €1164) | 5-day standard | Everything Free + Door, Champion Routine, Stacks, Journal, Insights, Focus, Nutrition, Workout, Meditation, Breathing, AI Coach, Lifebook, Master Plan, Notes, Business, Voice Analysis, Empowerment Meditation, Time Tracker, Emotional Tracker, Achievements, Leaderboard, Marriage, Parenting, Belief System, Mind Coach, Mentalitate Stack, Vision 2026 |
| **Pro** | €97 EB / €197 · 490 / 990 LEI | €970 · 4900 LEI (vs €2364) | 7-day | Everything Basic + Brotherhood, LIVE Coaching sessions |
| **Elite** | €297 EB / €500 · 1490 / 2500 LEI | €2970 · 14900 LEI (vs €6000) | No trial (direct payment) | Everything Pro + Warrior Launch Accelerator (90-day) |

### 10.2 One-time / add-on products
- **Ebook**: paid upsell at `/ebook-payment-success`, upsell 1 & 2 email sequence (`ebook_purchases`, `upsell_purchased_at`, `upsell_email_1_sent_at`, `upsell_email_2_sent_at`)
- **Coach content**: coach-set price, split platform vs coach (`coach_content_purchases.amount_paid`, `coach_share`, `platform_share`)
- **Widget purchases**: `user_widget_purchases`
- **Course purchases**: `course_purchases`

### 10.3 Stripe integration
- **Secrets**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Edge fns**: `create-checkout`, `create-coach-content-checkout`, `stripe-webhook` (source of truth for all revenue), `customer-portal`, `check-subscription`
- **Webhook writes**: `checkout_events`, `ebook_purchases`, `course_purchases`, `subscribers`, `commissions`
- **Referrals**: `process-referral` → auto-activates on first paid event

### 10.4 Subscriber state
`subscribers` table: `subscribed`, `subscription_tier`, `subscription_status`, `subscription_end`, `early_bird_expires_at` (auto-set 3 days via `set_early_bird_on_signup`)

---

## 11. Email Infrastructure

### 11.1 Sender infrastructure
- Provider: **Lovable Emails** (managed) → Mailgun under the hood
- Sender domain: `notify.ceomindos.com` (NS-delegated to Lovable)
- Queues: `auth_emails`, `transactional_emails` (pgmq)
- Worker: `process-email-queue` (pg_cron, on-demand scheduled)
- Rate control: `email_send_state` (batch size, delay, TTL)
- Suppression: `suppressed_emails` (bounces, complaints, unsubscribes)
- Unsubscribe: `email_unsubscribe_tokens`, `handle-email-unsubscribe`, `unsubscribe-email`
- Bilingual: RO/EN resolved automatically via `get_user_language_by_email` in `auth-email-hook`

### 11.2 Registered app-email templates (`registry.ts`)
| Template | Purpose | Trigger |
|----------|---------|---------|
| `burnout-results` | Quiz results delivery | After burnout quiz submit |
| `burnout-recovery-1/2/3` | 3-part recovery nurture | Scheduled after quiz |
| `burnout-story` | **10-day story sequence** (RO+EN, day 1–10) | `send-burnout-funnel-sequence` (hourly cron) |
| `ebook-delivery` | Free ebook link | After ebook opt-in |
| `challenge-upsell-1/2` | Post-challenge upgrade | `send-challenge-upgrade` |
| `challenge-welcome-set-password` | Onboarding after signup | Auth flow |
| `marriage-quiz-report` | Marriage quiz results | After marriage quiz |
| `welcome` | New user welcome | Signup |
| `trial-reminder` | Trial ending soon | Cron |
| `subscription-upgraded` | Upgrade confirmation | Stripe webhook |
| `retention-winback` | Cancelled user winback | Cron |

### 11.3 Auth emails (Supabase auth hook)
- `signup`, `magiclink`, `recovery`, `invite`, `email_change`, `reauthentication`
- All routed through `auth-email-hook` → queued → localized

### 11.4 Bulk / scheduled sender functions
| Function | Sends what | Trigger |
|----------|-----------|---------|
| `send-burnout-funnel-sequence` | 10-day burnout story to all quiz leads | Hourly cron |
| `send-nurture-sequence` | Unconverted lead nurture | Cron |
| `send-challenge-daily` | Daily challenge lesson email | Cron |
| `send-challenge-reminder` | Challenge activity reminder | Cron |
| `send-challenge-recovery` | Recovery for stalled users | Cron |
| `send-challenge-reactivation` | Reactivation for dropouts | Cron |
| `send-challenge-day7-upgrade` | Day-7 upgrade push | Scheduled |
| `send-challenge-upgrade` | Post-challenge upgrade | Trigger |
| `send-challenge-welcome` | Challenge onboarding | On signup |
| `send-challenge-promo-sequence` | Promo campaign | Cron |
| `send-early-bird-reminder` | Early-bird pricing ending | Scheduled |
| `send-lifecycle-emails` | Subscription lifecycle | Cron |
| `send-life-score-results/plan/sequence` | Life score follow-up | On quiz complete |
| `send-power-results` | Warrior Power results | On quiz complete |
| `send-vision-results` | Vision quiz results | On quiz complete |
| `send-warrior-power-sequence` | Warrior Power nurture | Cron |
| `send-goal-plan-email` | Goal wizard output | On completion |
| `send-marriage-sequence` | Marriage nurture | Cron |
| `send-platform-update` | Platform announcements | Manual/cron |
| `send-transactional-email` | Universal sender for all app-triggered emails | Called by app/functions |

### 11.5 Email analytics
- `email_send_log` (source of truth, dedupe by `message_id`)
- `email_sequence_log` (per-day sequence tracking with `opened_at`, `clicked_at`)
- Tracking: `track-email-open`, `track-email-click`
- Admin dashboards: `/admin/email-monitoring`, Burnout Sequence Stats tab in CRM

---

## 12. Admin Panel

- **Route**: `/admin` (gated by `has_role(auth.uid(), 'admin')`)
- **Sub-routes**: `/admin/email-monitoring`

### 12.1 Tabs
| Tab | Contents |
|-----|----------|
| **Overview** | Platform KPIs |
| **CRM** | Contact 360°, Timeline, Lead Sources, Challenge Drop-off, Challenge Conversations, Challenge Admin Chat, Funnel Pipeline, Funnel Visual Dashboard, Admin Error Monitor, Client Objectives, Client Door Preview, **Burnout Sequence Stats** |
| **Leads** | Lead magnet analytics |
| **Engagement** | Retention & activity |
| **Content** | Course manager, Warriors Way manager |
| **AI Studio** | AI prompts & tools |
| **Marketing** | Marketing Hub, Split Test Dashboard, Email Analytics, Revenue Dashboard, **Brand Kit** (colors, taglines, UVP, tone of voice) |
| **Coaches** | Coach roster, referrals, commissions |
| **Settings** | API config |

### 12.2 Admin-only edge fns
`admin-users`, `admin-ai-assistant`, `admin-impersonate` (logged to `admin_impersonation_log`), `funnel-leads-dashboard`, `sync-crm-contacts`, `hormozi-platform-analysis`, `burnout-sequence-stats`

### 12.3 CRM system
- `crm_contact_profiles` (48 cols) — unified contact record
- `crm_activity_timeline` (11 cols) — event stream
- `crm_admin_sessions` (11 cols)
- Sync from external sources via `sync-crm-contacts` (cron)

---

## 13. Integrations & Secrets

| Service | Purpose | Secret |
|---------|---------|--------|
| Lovable AI Gateway | All chat/text/image AI (default) | `LOVABLE_API_KEY` (managed) |
| OpenAI | Realtime voice, Whisper, some completions | `OPENAI_API_KEY` |
| ElevenLabs | TTS (voice coach, meditations) | `ELEVENLABS_API_KEY` |
| Stripe | Payments + Connect for coaches | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | (Legacy — fallback) transactional email | `RESEND_API_KEY` |
| Firecrawl | Web scraping | `FIRECRAWL_API_KEY` (connector) |
| Google Search Console | SEO analytics | `GOOGLE_SEARCH_CONSOLE_API_KEY` (connector) |
| Supabase | DB, auth, storage, edge fns | `SUPABASE_*` (managed) |

### Storage buckets
- `knowledge-base` (private) — AI knowledge files
- `voice-recordings` (private) — user voice input
- `transcripts` (private) — transcription output
- `napoleon-hill-backups` (private) — user plan backups
- `ai-generated-images` (public) — vision boards, meditation art
- `feature-images` (public) — auto-generated feature illustrations
- `community-media` (public) — tribe uploads
- `breathing-music` (private) — meditation music
- `marriage-evidence` (private) — sensitive relationship uploads

---

## 14. Database — Table Inventory (functional grouping)

**Total: ~180 tables.** Grouped by function:

### Auth & Users
`user_roles` (with `app_role` enum: admin/moderator/user), `user_preferences`, `user_statistics`, `user_activity_log`, `user_xp`, `xp_history`, `user_achievements`, `user_progress`, `user_quest_progress`, `user_goal_categories`, `user_widget_purchases`, `user_course_progress`, `user_tasks`, `subscribers`, `admin_impersonation_log`, `security_events`, `error_logs`, `onboarding_progress`, `migration_status`, `rate_limits`, `public_rate_limits`

### Body
`workout_programs`, `workout_program_days`, `workout_day_exercises`, `workout_exercises`, `workout_sessions`, `workout_templates`, `meal_plans`, `meal_plan_days`, `daily_habits`, `daily_habit_completions`, `daily_tracking`, `daily_progress`, `daily_checkins`, `daily_challenge_claims`, `champion_routine_logs`, `champion_routine_settings`, `champion_routine_people`, `breathing_music`

### Being — Mind
`mind_axis_scores`, `mind_belief_matrix`, `mind_psa_history`, `mind_psa_reconstruction`, `mind_quiz_responses`, `mind_quiz_drafts`, `mind_shift_sessions`, `mind_shift_beliefs`, `mind_shift_categories`, `mind_shift_distortions`, `divine_coaching_sessions`, `shadow_coach_daily_snapshots`, `mentalitate_stack_sessions`, `personal_power_progress`, `ultimate_you_progress`

### Being — Beliefs
`belief_audits`, `belief_chapter_progress`, `belief_chapters`, `belief_fishbowl_responses`, `belief_forgiveness_logs`, `belief_gratitude_logs`, `belief_mantras`, `belief_reprogrammer_artifacts`, `belief_reprogrammer_library`, `belief_reprogrammer_sessions`, `belief_self_care_logs`

### Being — Emotional / Meditation / Journal
`emotional_checkins`, `emotional_patterns`, `stack_library`, `stack_sessions`, `anger_stack_sessions`, `empowerment_meditations`, `journal_entries`, `notes`, `voice_recordings`, `breakthrough_logs`, `burnout_alerts`, `sentimentAnalysis` (via service)

### Being — Vision / Life Planning
`lifebook_entries`, `lifebook_drafts`, `vision_boards`, `napoleon_hill_projects`, `napoleon_hill_principle_drafts`, `napoleon_hill_notifications`, `fact_maps`, `book_reading_progress`, `canvas_projects`, `ai_generated_images`

### Balance — Marriage
`marriage_profiles`, `marriage_sessions`, `marriage_session_messages`, `marriage_timeline_events`, `marriage_quiz_leads`

### Balance — Parenting
`parenting_profiles`, `parenting_children`, `parenting_sessions`, `parenting_session_messages`, `parenting_daily_tools`, `parenting_evidence_sources`, `parenting_toxicity_scans`, `parenting_timeline_events`

### Balance — Relationships
`relationship_actions`, `direct_messages`, `brotherhood_messages`

### Business
`user_tasks`, `hot_list_items`, `weekly_planning`, `weekly_planning_drafts`, `weekly_planning_history`, `weekly_reviews`, `archived_tasks`, `objectives`, `missions`, `quests`, `game_journey_maps`, `ideas_bank`, `idea_empowerment`, `content_creation`, `scheduled_posts`, `time_entries`, `weekly_time_reports`, `kill_it_today_sessions`, `daily_flow_sessions`, `biz4_daily_metrics`, `biz4_weekly_objectives`, `goal_reminders`

### Dashboard / Widgets
`custom_widgets`, `widget_data`, `widget_templates`

### Gamification
`user_xp`, `xp_history`, `user_achievements`, `routine_achievements`, `routine_user_stats`, `weekly_scores`, `monthly_scores`, `daily_progress_stats`, `leaderboard_profiles`, `activity_sessions`

### Community — Tribes
`tribes`, `tribe_members`, `tribe_invites`, `tribe_join_requests`, `tribe_events`, `tribe_event_rsvps`, `tribe_courses`, `tribe_course_modules`, `tribe_module_progress`, `tribe_badges`, `tribe_user_badges`, `tribe_points`, `wall_posts`, `wall_post_likes`, `wall_post_comments`, `warriors_comment_reactions`, `community_settings`, `push_notifications`, `warrior_power_results`

### Courses / Learning
`courses`, `course_modules`, `course_submodules`, `course_purchases`, `warriors_way_lesson_content`, `warriors_way_progress`, `warriors_way_comments`, `warriors_action_completions`

### Coach ecosystem
`coach_profiles`, `coach_content`, `coach_content_purchases`, `coach_messages`, `coach_routine_templates`, `referrals`, `commissions`, `payout_history`, `platform_course_referrals`

### Challenge system
`challenge_intake`, `challenge_day1_responses`, `challenge_progress`, `challenge_coach_conversations`, `challenge_recovery_emails`, `ebook_purchases`

### Marketing / Leads / Email
`email_leads`, `lead_magnet_events`, `marriage_quiz_leads`, `email_send_log`, `email_send_state`, `email_sequence_log`, `email_unsubscribe_tokens`, `suppressed_emails`, `checkout_events`

### Auxiliary
`marketing_assets`, `admin_impersonation_log`, `crm_contact_profiles`, `crm_activity_timeline`, `crm_admin_sessions`

---

## 15. DB Functions & Triggers (business logic)

30+ SECURITY DEFINER functions. Key ones:

- `has_role(user, role)` — role check (avoids RLS recursion)
- `is_tribe_member(user, tribe)` / `is_tribe_owner(user, tribe)`
- `handle_new_user_community` — auto-onboard new user (leaderboard + main tribe)
- `send_tribe_welcome_dm` — auto-send tribe welcome DM
- `set_early_bird_on_signup` — 3-day early bird window
- `activate_referral_on_payment` — activate referral on first commission
- `save_weekly_planning_history` — snapshot weekly plan on change
- `archive_user_tasks` — archive week's tasks
- `clear_user_task_history` — GDPR-friendly reset
- `apply_*_to_axes` — 4B pillar score updates (from Mentalitate/Stack/Belief/Task sessions)
- `bump_axis_score` — atomic axis score increment
- `notify_on_direct_message` / `notify_on_wall_post_like` / `notify_on_wall_post_comment` — push notifications
- `update_post_likes_count` / `update_post_comments_count` — denormalized counters
- `update_tribe_member_count` — denormalized counter
- `check_max_parenting_children` — 8-child cap
- `validate_mind_shift_session` — enum validation
- `validate_email_format` — regex validation
- `email_queue_wake` / `email_queue_dispatch` — on-demand cron for email queue
- `enqueue_email` / `read_email_batch` / `delete_email` / `move_to_dlq` — pgmq wrappers
- `update_warriors_lesson_search` — full-text search index for lessons
- `purge_anonymous_warrior_results` — 30-day retention on anon quiz results
- `generate_referral_code` — 6-char alphanumeric
- `get_user_language_by_email` — for bilingual auth emails
- `cleanup_old_rate_limits` — hourly cleanup

---

## 16. Tech Stack

- **Frontend**: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3 + shadcn/ui
- **State**: Zustand + React Query
- **Backend**: Lovable Cloud (Supabase) — Postgres + Auth + Storage + Edge Functions (Deno) + pgmq + pg_cron + pg_net + Vault
- **AI**: Lovable AI Gateway (Gemini + OpenAI), OpenAI Realtime, ElevenLabs
- **Payments**: Stripe + Stripe Connect (for coach payouts)
- **Email**: Lovable Emails (Mailgun-backed) with pgmq queue + retry + suppression
- **PWA**: Standalone manifest + install prompt in Settings
- **i18n**: RO + EN, per-user preference stored in `user_preferences.language`
- **Tab focus fix**: TOKEN_REFRESHED ignored to prevent unmounts
- **Persistence philosophy**: DB-first with RLS; localStorage only for cache/drafts/UI prefs (see `docs/data-persistence-audit.md`)

---

## 17. What can this platform be sold as / used for

(Full angles in `docs/platform-marketing-angles.md`. Summary of positioning surfaces:)

1. **Founder wellness / anti-burnout SaaS** — Burnout quiz → nurture → paid membership
2. **AI life coach** — Mind Coach voice + text, 15+ specialized coach personas
3. **Weekly execution system** — Domino Door + AI planning
4. **Morning ritual OS** — Champion Routine + Warrior Routine + Daily Master Stack
5. **Belief transformation program** — 5 Leader Beliefs + Reprogrammer + Library
6. **Marriage rescue tool** — 6-axis audit + Reality Triangle + AI coach
7. **Conscious parenting platform** — up to 8 children + toxicity scan + evidence tools
8. **Guided meditation library** — 14 personalized templates + AI voice
9. **Emotional first-aid kit** — 9-emotion stack library
10. **Vision & manifestation** — Vision 2026 + Vision Board + Fact Maps + Master Plan (Napoleon Hill)
11. **Community / Skool alternative** — Tribes + Events + Courses + Wall + Brotherhood
12. **Coach marketplace** — B2B partner program, 50% recurring commission, Stripe Connect
13. **Course platform** — Warriors Way + custom courses + coach content
14. **Habit + gamification engine** — Streaks, XP, achievements, leaderboards
15. **Personal analytics** — 4B axis scores, weekly/monthly reports, burnout alerts
16. **Content creation for founders** — Idea capture → analysis → schedule
17. **Time & focus system** — Time tracker + Focus + binaural beats + Kill It Today
18. **Business KPI tracker** — Biz4 daily/weekly metrics
19. **Fitness + nutrition** — Workout programs + meal plans + macros
20. **Voice AI journaling** — Voice analysis + sentiment + transcription

See companion document for hook lines, pain points, promises, and CTA angles.
