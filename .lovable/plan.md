

# Simplificarea Rutinei Războinicului — De la 17 la 10 pași

**Emotional Check rămâne neschimbat** — exact cum l-am construit cu cele 3 faze Tony Robbins.

## Ce se schimbă

### 1. Combinare: Light Exposure + Hydration → **Body Activation** (un singur pas)
- Nou fișier `BodyActivationStep.tsx` — checklist rapid cu 3 items: apă, lumină naturală, postură dreaptă
- Toate 3 sunt checkboxuri pe un singur ecran (30 secunde, nu 2 ecrane separate)
- Salvează `water_drunk` și `light_exposure` în log ca înainte

### 2. Combinare: Autosuggestion + Vision Declaration + Visualization → **Power Declaration** (un singur pas)
- Nou fișier `PowerDeclarationStep.tsx` — un singur ritual cu 3 sub-secțiuni:
  - **Citește Declarația de Viziune** cu voce tare (păstrăm TTS-ul existent din VisionDeclaration)
  - **Afirmația de Autosugestie** — citire 3x cu emoție (inline, nu pas separat)
  - **Vizualizare** — 30 sec cu ochii închiși, buton "Am vizualizat"
- Marchează `autosuggestion_completed`, `vision_declaration_read`, și `visualization_completed` în log

### 3. Breathing se integrează ca intro în Meditation
- `MeditationStep` va include un mini-breathing cycle (opțional) ca warmup înainte de meditație
- Breathing-ul rămâne și ca pas separat (pentru cine îl vrea în setări), dar nu apare în DEFAULT_ROUTINE_STEPS

### 4. Reading se mută din rutina default
- Rămâne ca pas disponibil în setări, dar nu apare în DEFAULT_ROUTINE_STEPS
- Cine îl are activ îl păstrează

### 5. Gratitude cu prompts rotative
- Adaug 10+ prompts rotative care se schimbă zilnic: "Un moment din ultima săptămână când te-ai simțit mândru...", "O persoană care te-a ajutat fără să-i ceri..."
- Adaug instrucțiune vizuală: "Nu SCRIE doar — SIMTE recunoștința în piept timp de 30 secunde"

### 6. Journaling cu prompt zilnic
- Adaug prompts zilnice rotative: "Ce aș face dacă ar fi imposibil să eșuez?", "Care e cea mai mare frică pe care o am azi?"

### 7. Curățare cod mort
- Șterg `EmotionalCheckStep.tsx`, `EmotionalTransformStep.tsx`, `StackSelectionStep.tsx`, `DailyTasksStep.tsx`
- Curăț dead code din step ordering (liniile 276-346 cu `stackSelection`/`emotionalTransform`)
- Actualizez `ChampionLog` — adaug `morning_emotion`, `morning_emotion_intensity`, `stack_selection_completed`, `emotional_transform_completed` ca tipuri reale (eliminăm `as any`)

## Noul DEFAULT_ROUTINE_STEPS (10 pași)

```text
1. emotionalCheck      — Check-in Emoțional (Tony Robbins 3 faze)
2. bodyActivation      — Apă + Lumină + Postură (30 sec)
3. meditation          — Meditație (cu breathing intro opțional)
4. powerDeclaration    — Viziune + Autosugestie + Vizualizare
5. gratitude           — Recunoștință (cu prompts rotative)
6. journaling          — Jurnaling (cu prompt zilnic)
7. exercise            — Exerciții
8. mealPlanning        — Alimentație
9. learn               — Învață
10. apply              — Aplică
11. contentCreation    — Content
12. relationships      — Relații
13. completion         — Finalizare
```

## Fișiere de modificat

1. **Nou:** `src/components/champion-routine/steps/BodyActivationStep.tsx`
2. **Nou:** `src/components/champion-routine/steps/PowerDeclarationStep.tsx`
3. **Modificat:** `src/components/champion-routine/ChampionRoutineFlow.tsx` — noul DEFAULT_ROUTINE_STEPS, imports, renderStep, curățare dead code
4. **Modificat:** `src/components/champion-routine/steps/GratitudeStep.tsx` — prompts rotative + "simte emoția"
5. **Modificat:** `src/components/champion-routine/steps/JournalingStep.tsx` — prompt zilnic rotativ
6. **Modificat:** `src/hooks/useChampionRoutine.ts` — actualizare ChampionLog type
7. **Modificat:** `src/components/champion-routine/index.ts` — export-uri noi
8. **Șters:** `EmotionalCheckStep.tsx`, `EmotionalTransformStep.tsx`, `StackSelectionStep.tsx`, `DailyTasksStep.tsx`

## Backward compatibility
- Pașii vechi (hydration, lightExposure, breathing, autosuggestion, visionDeclaration, visualization, reading) rămân disponibili în Settings pentru userii care i-au configurat manual
- Doar DEFAULT_ROUTINE_STEPS se schimbă — userii existenți cu custom order nu sunt afectați

