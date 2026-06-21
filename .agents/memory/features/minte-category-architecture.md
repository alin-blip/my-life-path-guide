---
name: Minte Category Architecture
description: 5th sidebar pillar with Brain Map, Mind Tests (8 destructive thinking patterns), Belief Matrix and PSA. Bilingual RO/EN, scores aggregate into 6 brain axes.
type: feature
---

# Minte (Mind) Category — Architecture

New sidebar category 🧠 "Minte" / "Mind" — the 5th pillar alongside Body/Being/Balance/Business. Adapted from Alin's "Learn & Grow Hub" methodology.

## Routes

- `/minte` — overview + Brain Map (6 axes radar)
- `/minte/teste` — Mind Tests Hub (cards for all quizzes)
- `/minte/teste/:slug` — individual quiz runner
- Future: `/minte/credinte` (Belief Matrix), `/minte/reconstructie` (PSA)

## Database (Phase 1 — done)

- `mind_quiz_responses` — answers + raw_score + score_healthy (0-100) + band (A/B/C) + axes_distribution JSONB + language
- `mind_axis_scores` — aggregate per axis (cognitiva, emotionala, afectiva, volitiva, comportamentala, profesionala). UNIQUE(user_id, axis). Auto-recomputed on each quiz submit by `mindQuizService.recomputeAxisScores`.
- `mind_belief_matrix` — Phase 3 (10 CEO beliefs × 10 fields JSONB)
- `mind_psa_reconstruction` — Phase 4 (10 toxic CEO beliefs × 9 fields JSONB)

All tables: RLS `auth.uid() = user_id`, GRANT to authenticated + service_role.

## Scoring logic

- Each quiz: 10 questions × A/B/C scale, scoring A=1 / B=2 / C=3 (C = healthy)
- `score_healthy = ((raw - min) / (max - min)) * 100`
- Bands: <40 = A (sub standard), 40-70 = B (în standard), ≥70 = C (peste standard)
- Each quiz declares which axes it feeds with what weight (0..1) — see `MindQuiz.axes`
- Axis score = average across all latest quiz responses contributing to that axis, weighted by quiz axis weight (applied at submit time into `axes_distribution`)

## Quiz data location

Static, in code: `src/data/mind-quizzes/`
- `types.ts` — `MindQuiz`, `BandKey`, `MindAxisId` etc.
- `standard-options.ts` — shared A/B/C scale + helpers
- `thoughts.ts` — 8 quizzes (autosabotaj, catastrofizare, comparare, despre-sine, filtrare, pesimism, rusine-vinovatie, victimizare)
- `character.ts` — 10 M2 Caracter quizzes (integritate, disciplina, curaj, responsabilitate, empatie, umilinta, rabdare, recunostinta, loialitate, generozitate)
- `prp.ts` — 7 PRP dimensions (claritate-identitate, claritate-misiune, energie-corp, relatii-cheie, bani-resurse, timp-prioritati, spiritualitate)
- `perception.ts` — 2 Percepție quizzes (despre-altii, despre-realitate)
- `ceo.ts` — 1 Pattern Anti-CEO quiz
- `index.ts` — registry + `scoreMindQuiz()` function

**Total: 28 quizzes**. Use guillemets `«»` (not `„"`) for RO quotation inside string literals to avoid escaping.

**Bilingual**: every text field has `_ro` and `_en` variants. Selected via `useLanguage()`.

**Interpretations**: short summary (1-2 sentences) + 3 actions per band, in `quiz.bands[]`. Detailed AI interpretations come later via edge function in Phase 2.

## Services

`src/services/mindQuizService.ts`:
- `submitQuiz(slug, answers, lang)` — saves response + auto-recomputes axis scores
- `getLatestResponseForQuiz(slug)`
- `getAllLatestResponses()` — map slug → row, used by hub
- `getAxisScores()` — for Brain Map widget
- `recomputeAxisScores(userId)` — internal, called after each submit

## Components

- `src/components/mind/QuizRunner.tsx` — generic runner (one-question-at-a-time, auto-advance, result screen with score + band + actions + CTA to Mind Shift)
- `src/components/dashboard/widgets/BrainMapRadarWidget.tsx` — dashboard widget id `brain-map-radar`, 6-axis recharts RadarChart, navigates to `/minte`
- Pages: `Minte.tsx`, `MinteTeste.tsx`, `MinteQuizPage.tsx`

## Roadmap

- Phase 1 (done): DB + sidebar + 8 thought quizzes + Brain Map shell on `/minte`
- Phase 2 (done): Brain Map radar widget on Dashboard + 20 more quizzes (10 Character, 7 PRP, 2 Perception, 1 Anti-CEO) = 28 total
- Phase 3 (done): CEO Belief Matrix at `/minte/credinte` — 10 beliefs × 10 reflection fields, autosave (debounced 800ms) to `mind_belief_matrix`, recommendations driven by 2 weakest axes from `mind_axis_scores`. Data: `src/data/mind-beliefs/ceo-beliefs.ts`, service: `src/services/beliefMatrixService.ts`.
- Phase 4: PSA Reconstruction (10 toxic CEO beliefs) + AI auto-routing in Mind Coach using axis scores
- Phase 4 (done): PSA Reconstruction at `/minte/psa` — 8 toxic CEO patterns (Perfectionism, Impostor, Scarcity, Control-freak, Hustle/Burnout, People-Pleasing, Procrastination, Fear-of-Success) using Problem → Substitute → Action framework. 7 reflection fields per pattern, autosave (800ms debounce) to `mind_psa_reconstruction` (with `progress_percent` column). Auto-routing: sorts patterns by recommendation weight — quiz responses in band C (weight 2) outrank weakest 2 axes (weight 1). Data: `src/data/mind-psa/toxic-patterns.ts`, service: `src/services/psaService.ts`.

## AI Coach Integration

All three primary coach edge functions (`ai-coach`, `mind-coach`, `accountability-coach`) load Minte context via the shared helper `supabase/functions/_shared/mind-context.ts` (`loadMinteContext`). The helper:

- Reads `mind_axis_scores`, latest `mind_quiz_responses` (deduped per quiz_slug), `mind_belief_matrix` count, `mind_psa_reconstruction` count.
- Returns a `promptBlock` appended to each coach's system prompt that includes: Brain Map per axis (0–100), tests completed (N/28), last 5 results with bands, belief matrix progress (N/10), PSA progress (N/8), and a numbered list of priority recommendations.
- Returns `recommendations[]` with `severity: critical | suggested` and CTA route (`/minte`, `/minte/teste`, `/minte/credinte`, `/minte/psa`).
- Includes hard prioritization rules ("Minte is the foundation; surface Mind work BEFORE body/being/balance/business advice"), and forces the coach to recommend the first test if the user has done none.

Rule for new coaches: any new AI coach edge function MUST import `loadMinteContext` and append `minte.promptBlock` to its system prompt. Do not duplicate the queries.
