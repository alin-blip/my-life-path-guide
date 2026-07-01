---
name: parenting-stack-architecture
description: Executive Parenting Stack module — DB schema, evidence-based content per age band (Piaget/Erikson/Baumrind/Gottman/Harvard CDev), and pseudoscience guardrails (no 7Hz theta / Lipton framing).
type: feature
---

# Executive Parenting Stack

**Rută principală**: `/parenting` (hub), `/parenting/profile` (CRUD copii), `/parenting/library/:childId` (conținut per vârstă), `/parenting/library` (bibliografie).

## Baza științifică (STRICT — sunt seed-uite în `parenting_evidence_sources`)
Piaget 1952 · Erikson 1963 · Baumrind + Maccoby & Martin · Lamborn 1991 (n=2,353) · Steinberg 1992 · Gottman 1997 (Emotion Coaching 5 pași) · Lieberman 2007 (affect labeling) · Harvard CDev (serve-and-return, EF, toxic stress) · Tronick 1989 (still-face) · Mesman 2009 (meta) · Provenzi 2016 · Assor/Roth/Deci 2004+2009 · Haines 2023 (meta) · McLeod 2007 (meta) · Robinson 2001 (PSDQ) · Gopnik 2009 · AAP 2016 · WHO 2019.

## Guardrails HARD (edge function + UI)
- ❌ **NU** folosim „hipnoză 0-7 ani" / „theta 7Hz" / Bruce Lipton — pseudoștiință. Înlocuit cu „fereastră de plasticitate maximă" (Harvard CDev). Există alert vizual în library pe 0-2 și 2-7.
- ❌ **NU** cifre exacte de „ore admisibile de efort intelectual" per vârstă — nu există limite AAP/WHO citabile.
- ❌ **NU** diagnostic medical — coach trimite la profesionist pentru semne de abuz/depresie.
- 5:1 ratio marcat ca „euristică Gottman, adaptată" — nu confirmat pentru părinte-copil (Armstrong 2012).

## Schema DB (8 tabele, prefixul `parenting_`)
1. `parenting_profiles` (1 per user, stil detectat, limbă)
2. `parenting_children` (max 8 activi, trigger constraint)
3. `parenting_sessions` + `parenting_session_messages`
4. `parenting_timeline_events` (rupture/repair/achievement/milestone)
5. `parenting_toxicity_scans` (PSDQ Baumrind + 6 tipare toxice)
6. `parenting_daily_tools` (5:1, no-BUT, emotion coaching, repair, serve-return)
7. `parenting_evidence_sources` (bibliografie shared, read all authenticated + anon)

## Age → Stage helper
`getAgeContext(birth_year, birth_month?)` în `services/parentingService.ts` returnează `{ age, piaget, erikson, ageBand, piagetLabel: {ro,en}, eriksonLabel: {ro,en} }` — folosit peste tot.

## Edge Function `parenting-coach`
- Validează JWT + încarcă context copil + stil parental + limbă în system prompt.
- Model: `google/gemini-2.5-flash`, max 1200 tokens.
- Persistă mesajele dacă e `session_id`.
- System prompt include lista de surse acceptate + regulile HARD împotriva pseudoștiinței.

## Faze
- **Faza 1 (livrată)**: DB + seed bibliografie + hub + profil copii + library per vârstă + edge function coach.
- **Faza 2**: PSDQ Toxicity Scan UI + `parenting-toxicity-analyze` edge fn.
- **Faza 3**: 5 tool-uri zilnice (UI + logging în `parenting_daily_tools`).
- **Faza 4**: Coach chat UI live per copil + Timeline UI + daily nudge cron.

## Pattern
Extinde exact modelul Marriage Stack (`marriageService.ts` / `useMarriageStack.ts` / `MarriageProfile.tsx`) — same shape, prefix diferit, plus dimensiunea multi-child.
