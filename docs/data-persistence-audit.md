# Audit Persistență Date — CEO Mind OS

**Data auditului:** 2026-05-11  
**Regulă de aur:** Datele specifice user-ului trăiesc în Postgres, izolate prin RLS pe `auth.uid()`. localStorage este folosit **doar** pentru cache, drafts (TTL), preferințe UI și sesiuni efemere.

## ✅ Module persistate complet în DB (per-user, RLS)

| Modul | Tabel(e) | Hook/Service principal | Notă |
|---|---|---|---|
| Door — Hit/Do lists | `user_tasks` | `doorUserTasksService.saveWeekLists` | Upsert id-preserving + dedup natural-key |
| Door — Hot list (global) | `user_tasks` (week_key=NULL) | `doorUserTasksService.saveGlobalHotList` | DELETE + INSERT atomic |
| Door — Hot list (legacy) | `hot_list_items` | `doorSupabaseService.saveWeekLists` | DELETE+INSERT, UNIQUE index pe (user, week, type, day, title) |
| Door — Weekly Plan / Domino / Key Points | `weekly_planning` | `useWeeklyPlanSave` | |
| Door — Drafts wizard | `weekly_planning_drafts` | `weeklyPlanningDraftService` | |
| Brain Dump (evening) | `user_tasks`, `ideas_bank`, `daily_progress` | `useBrainDump` | |
| Goals / Vision Board / Missions | `missions`, `vision_boards` | `missionsService` | DB primar + cache local |
| Reality Map / Fact Maps | `fact_maps`, `warrior_power_results` | `realityMapService` | |
| Workout / Sessions | `workout_sessions`, `workout_exercises` | `useTodayWorkout` | Sesiunea activă în localStorage e efemeră |
| Nutrition / Meal plans | `meal_plans`, `meal_plan_days` | `mealPlanService` | |
| XP / History | `user_xp`, `xp_history` | `useXPSystem` | |
| Streaks / Statistics | `daily_progress_stats`, `user_statistics`, `routine_user_stats` | `useStreakTracking` | |
| Achievements | `user_achievements`, `routine_achievements` | | |
| Big One | `weekly_planning`, `champion_routine_logs` | `useBigOne` | |
| Daily Flow | `daily_flow_sessions` | `useDailyFlow` | |
| Objectives | `objectives` | `objectivesService` | |
| Mind Coach / Accountability | `daily_checkins`, `emotional_checkins`, `breakthrough_logs` | `useAccountabilityCoach` | |
| Notes | `notes` | `useNotesCloud` | Hookul legacy `useNotes` (localStorage) a fost ȘTERS |
| User preferences | `user_preferences` | `userPreferencesService` | DB primar + cache local |
| User progress | `user_progress` | `userProgressService` | Migrare one-shot din localStorage |
| **Daily Master streak** | `daily_tracking` (`stack_completed`) | `dailyMasterService` | **REFACTORIZAT 2026-05-11**: read/write DB-first |
| **Vision quiz scores** | `user_preferences.vision_quiz_scores` | `visionScoresService` | **NOU 2026-05-11**: salvare la signup, citire DB+cache |
| Ideas Bank | `ideas_bank` | `ideasBankService` | |
| Tribes / Community | `tribes`, `tribe_members`, `wall_posts`, etc. | | |
| Coach content | `coach_content`, `coach_messages`, etc. | | |
| Subscriptions / Payments | `subscribers`, `commissions`, `coach_content_purchases` | | |

## ⚠️ localStorage corect (intenționat — nu se atinge)

| Cheie / Pattern | Tip | Justificare |
|---|---|---|
| `*-draft-*`, `weekly-planning-draft-*`, `napoleon-hill-draft-*` | Draft TTL | Standard mem://technical/storytelling-stack-draft-persistence-logic |
| `pending_challenge_plan` | Funnel state | Standard mem://funnel/challenge-auth-persistence-logic |
| `door-week-YYYY-WW` (offline cache) | Backup | Standard `doorStorageManager` — **NOT** source of truth |
| `daily-master-completions` | Cache render | Mirror al `daily_tracking`, hidratat la mount |
| `vision_plan_scores` | Cache render | Mirror al `user_preferences.vision_quiz_scores` |
| `vision_onboarding_complete` | UI flag | Modal one-time per device — acceptabil |
| `sacred-mode-key`, `mode_*` | UI prefs | Tema, mod afișare |
| `rowarrior-sound-settings` | UI prefs | Standard mem://brand/legacy-data-persistence-settings |
| `onboarding-tour-*` | Tour state | Per device, nu trebuie sincronizat |
| `persistent-session-id` | Anonymous tracking | Pre-auth |
| `todo-ideas-${weekKey}` | Fallback unauth | Doar dacă userul nu e logat |
| Workout session activă | Ephemeral | Sesiunea în curs; completion-urile merg în DB |

## 🔒 RLS Pattern Standard

Toate tabelele user-specifice respectă pattern-ul:
```sql
CREATE POLICY "Users manage own X"
ON public.X FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## 📋 Constraint-uri anti-duplicate adăugate (2026-05-11)

- `hot_list_items_unique_per_week`: UNIQUE `(user_id, week_key, list_type, COALESCE(day_of_week, ''), title)`
- `hot_list_items_user_week_idx`: INDEX `(user_id, week_key, list_type)` — performanță DELETE/SELECT
- `daily_tracking_user_id_date_key`: UNIQUE `(user_id, date)` (preexistent)
- `user_preferences.vision_quiz_scores`: jsonb (nou)

## 🛠 Refactor-uri 2026-05-11

1. `doorSupabaseService.saveWeekLists` → DELETE+INSERT atomic pe (user, week, hit/do)
2. `dailyMasterService` → DB-first cu `refreshFromDB()` async; localStorage = cache
3. `visionScoresService` (nou) → DB save/load + sync cache→DB
4. `useNotes.ts` → ȘTERS (legacy localStorage); `CATEGORY_CONFIG` mutat în `useNotesCloud`
5. `doorStorageManager.ts` → adnotat ca OFFLINE CACHE ONLY

## 🚦 Reguli pentru dezvoltatori

1. **NU** crea hookuri user-specifice care scriu doar în localStorage.
2. **Întotdeauna** scrie în DB; folosește localStorage doar ca mirror pentru render instant.
3. **Drafts wizard** = OK în localStorage cu TTL clar.
4. Fiecare tabel nou cu `user_id` trebuie să aibă RLS din migrare.
