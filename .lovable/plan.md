

# Upgrade Emotional Check Step — Tony Robbins Power Priming

## Problem
The current first step is a clinical "pick emoji + slider" form. No physiological engagement, no state change, no transformation. Users in positive states just skip. Users in negative states go to Mind Coach but without any body preparation. Tony Robbins always starts with **physiology first** (breathing, movement, posture), then **focus** (what you focus on), then **meaning** (the story you tell yourself).

## Solution: 3-Phase Power Entry

Replace the current emotion → choice flow with a Tony Robbins "Triad" approach:

```text
Phase 1: BODY CHECK (5 sec)
  "Stai drept. Umerii înapoi. Respiră adânc."
  → Animated breathing circle (inhale 4s, hold 4s, exhale 4s)
  → One power breath cycle before proceeding

Phase 2: EMOTIONAL SCAN (current picker, enhanced)
  → Keep ExtendedEmotionPicker
  → Keep intensity slider
  → BUT add a "Ce poveste îți spui acum?" free-text input
    (this primes self-awareness before Mind Coach)

Phase 3: POWER DECISION
  Negative/low → Mind Coach (as now)
  Positive → "Incantation" moment:
    → Show a power phrase based on their emotion
    → "Spune cu voce tare: EU SUNT [PUTERE]. EU CREEZ [REZULTAT]."
    → User confirms they said it → proceeds with amplified energy
    → Option to go deeper with Mind Coach
```

## What changes

### 1. `EmotionalCheckUnifiedStep.tsx` — Major rewrite
- Add `Phase: 'breathe' | 'emotion' | 'power'`
- **Breathe phase**: animated breathing circle with 1 cycle (12 seconds), auto-advances
- **Emotion phase**: current picker + intensity + new "story" text input
- **Power phase** (positive): incantation card with power phrases mapped to emotions, "Am spus-o!" button
- **Power phase** (negative): enhanced intro before Mind Coach — "Corpul tău e pregătit. Acum hai să transformăm mintea." then enters Mind Coach

### 2. Power phrases mapping (inline, no DB needed)
```
happy → "EU SUNT RECUNOSCĂTOR. EU CREEZ ABUNDENȚĂ."
calm → "EU SUNT PREZENT. EU CREEZ CLARITATE."
excited → "EU SUNT ENERGIE PURĂ. EU CREEZ IMPACTUL PE CARE ÎL MERIT."
motivated → "EU SUNT IMPARABIL. EU EXECUT CU PUTERE."
natural → "EU SUNT ECHILIBRAT. EU CREEZ ARMONIE ÎN TOT CE FAC."
```

### 3. Breathing animation component
- Simple CSS animation with expanding/contracting circle
- Text prompts: "Inspiră" → "Ține" → "Expiră"
- Auto-advances after 1 cycle (or user can skip)

### 4. Save the "story" input
- Pass it to Mind Coach as additional context if user enters transformation
- Store it in the emotional checkin data for pattern tracking

## Files to modify
1. `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx` — add breathe + power phases
2. No backend changes needed — Mind Coach system prompt already handles the context

## Result
- Users start with a **physical state change** (breathing)
- Self-awareness is primed with the "story" question
- Positive users get an **incantation moment** instead of a bland "skip"
- Negative users enter Mind Coach already physiologically prepared
- The whole entry feels like a **ritual**, not a form

