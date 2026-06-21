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
- `index.ts` — registry + `scoreMindQuiz()` function

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
- Pages: `Minte.tsx`, `MinteTeste.tsx`, `MinteQuizPage.tsx`

## Roadmap

- Phase 1 (done): DB + sidebar + 8 thought quizzes + Brain Map shell
- Phase 2: Brain Map radar widget on dashboard + 20 more quizzes (M2, PRP, Percepție)
- Phase 3: Belief Matrix (10 CEO fundamental beliefs)
- Phase 4: PSA Reconstruction (10 toxic CEO beliefs) + AI auto-routing in Mind Coach using axis scores
