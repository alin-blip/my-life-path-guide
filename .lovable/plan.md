

# Upgrade Mind Coach: Tony Robbins Empowerment Ritual

## What the user wants

The current Mind Coach flow is too cognitive — it asks logical questions but doesn't produce real emotional transformation. The user wants the Tony Robbins "peak state" methodology:

1. **State change through body chemistry** — not just talking, but physically shifting state
2. **Sensory anchoring** — close eyes, recall peak moment with all 5 senses (visual, auditory, kinesthetic, olfactory, emotional)
3. **Power move** — a physical gesture to anchor the new state in the body
4. **Visual guidance** — an animated body figure "on fire" (blue flames) showing the power move the user should mimic

This is based on Tony Robbins' Anchoring technique (Day 16 of Personal Power, already in the platform) and the Triad (Physiology → Focus → Meaning).

## Current problem with AI speed

The AI uses `google/gemini-2.5-pro` which is slower. We'll switch to `google/gemini-2.5-flash` for faster responses while keeping quality sufficient for coaching.

## Architecture

The fix has two parts:

### Part 1: Rewrite the Mind Coach system prompt (edge function)

**File: `supabase/functions/mind-coach/index.ts`**

Change the coaching flow from "cognitive problem-solving" to Tony Robbins empowerment ritual:

```
Phase 1: VALIDATE (1 message)
  "Te aud. [Emoția] la [intensitate]/10 este real."

Phase 2: BODY CHEMISTRY SHIFT (2-3 messages)
  "Închide ochii. Amintește-ți CEL MAI PUTERNIC moment din viața ta
   când te-ai simțit [starea opusă dorită]."
  → Guide through 5 senses: "Ce vedeai? Ce auzeai? Ce simțeai pe piele?
   Ce miros era? Ce emoție aveai?"
  → "Acum MĂREȘTE acea imagine de 10x. Fă-o mai luminoasă,
   mai tare, mai intensă!"

Phase 3: POWER MOVE / ANCHOR (1-2 messages)
  "Ridică-te. Strânge pumnul. Spune cu voce tare:
   EU SUNT [PUTERE]! EU CREEZ [REZULTAT]!"
  → "Repetă! Mai tare! Simte-o în tot corpul!"

Phase 4: ACTION (1 message)
  "Din această stare de putere, care e UN singur lucru
   pe care îl faci AZI?"
  → add_to_hit_list + complete_transformation
```

Also switch model from `gemini-2.5-pro` to `gemini-2.5-flash` for speed.

### Part 2: Add animated Power Body visual

**New file: `src/components/mind-coach/PowerBodyAnimation.tsx`**

An animated SVG/CSS figure with blue flames effect that appears during Phase 3. The figure shows:
- A human silhouette in a power pose (fist raised)
- Blue flames emanating from the body (CSS animation)
- Pulsing energy effect
- Text overlay: "STRÂNGE PUMNUL. SPUNE CU VOCE TARE!"

This component will be rendered inside `MindCoachChat.tsx` when the AI enters Phase 3 (detected by keywords in the AI response like "ridică-te", "strânge pumnul", "spune cu voce tare").

### Part 3: Update MindCoachChat.tsx

- Detect power move phase in AI messages (keyword matching)
- Show `PowerBodyAnimation` component inline in the chat when triggered
- Keep existing emotion picker and intensity steps as-is

## Files to modify

1. `supabase/functions/mind-coach/index.ts` — Rewrite system prompt with anchoring ritual flow + switch to flash model
2. `src/components/mind-coach/PowerBodyAnimation.tsx` — New animated power body component (blue flames SVG + CSS)
3. `src/components/mind-coach/MindCoachChat.tsx` — Integrate PowerBodyAnimation detection and rendering

## Result

- AI responds faster (flash vs pro)
- Every session follows the Tony Robbins anchoring ritual: validate → recall peak state with all senses → amplify → power move → action
- Visual animated body in blue flames guides the user through the physical movement
- Transformation feels embodied, not just intellectual

