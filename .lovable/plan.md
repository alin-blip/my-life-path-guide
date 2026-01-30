
# Audit: Salvare Date în Cloud (Supabase) - Platforma Life Path Guide

## Executive Summary

Am analizat codul sursă și am identificat **starea actuală a persistenței datelor**. Platforma folosește un sistem hibrid: unele funcționalități salvează în cloud (Supabase), altele doar local (localStorage), iar altele folosesc ambele cu sincronizare parțială.

---

## Status Curent - Ce SE Salvează în Cloud ✅

### 1. Door System (Sarcini zilnice)
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| HIT List (sarcini importante) | `user_tasks` | ✅ Salvat cloud |
| DO List (sarcini de făcut) | `user_tasks` | ✅ Salvat cloud |
| Weekly Plan (Domino + Key Points) | `weekly_planning` | ✅ Salvat cloud |
| Ideas Bank (Idei) | `ideas_bank` | ✅ Salvat cloud |

**Servicii folosite:** `doorUserTasksService.ts`, `weeklyPlanningService.ts`, `ideasBankService.ts`

### 2. Mind Coach & Stacks
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| Breakthrough logs | `breakthrough_logs` | ✅ Salvat cloud |
| Stack Sessions | `stack_sessions` | ✅ Salvat cloud |
| Stack Library | `stack_library` | ✅ Salvat cloud |

### 3. Master Plan / Napoleon Hill
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| Proiecte | `napoleon_hill_projects` | ✅ Salvat cloud |
| Drafturi principii | `napoleon_hill_principle_drafts` | ✅ Salvat cloud |
| Backups | `napoleon-hill-backups` bucket | ✅ Salvat cloud |

### 4. Fitness & Workout
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| Workout Sessions | `workout_sessions` | ✅ Salvat cloud |
| Workout Programs | `workout_programs` | ✅ Salvat cloud |

### 5. User Progress
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| Daily tracking | `daily_tracking` | ✅ Salvat cloud |
| Journal entries | `daily_progress` | ✅ Salvat cloud (când user e autentificat) |
| XP / Achievements | `user_xp`, `user_achievements` | ✅ Salvat cloud |
| Time entries | `time_entries` | ✅ Salvat cloud |
| Weekly objectives | `objectives` | ✅ Salvat cloud |

### 6. Reality Map / Fact Maps
| Componentă | Tabel Supabase | Status |
|------------|----------------|--------|
| Reality Map scores | `fact_maps` (category='reality-scores') | ✅ Salvat cloud |
| Warrior Power results | `warrior_power_results` | ✅ Salvat cloud |

---

## PROBLEME CRITICE - Ce NU se salvează în cloud 🔴

### 1. ThreeStepSystem (Annual Goals & Monthly Missions)

**Locație:** `src/components/mission/ThreeStepSystem.tsx`

**Problema:** Răspunsurile la întrebările anuale și misiunile lunare se salvează DOAR în localStorage:

```typescript
// Linia 60-61 - DOAR localStorage
function saveAnnualGoalAnswers(category, language, answers) {
  localStorage.setItem(getAnnualGoalAnswersKey(category, language), JSON.stringify(answers));
}

// Linia 74-76 - DOAR localStorage  
function saveMonthlyMissionAnswers(category, language, answers) {
  localStorage.setItem(getMonthlyMissionAnswersKey(category, language), JSON.stringify(answers));
}

// Linia 140-141 - Citește din localStorage
const storedMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
```

**Impact:** Utilizatorii PIERD Annual Goals și Monthly Missions dacă:
- Schimbă browser-ul
- Curăță cache-ul
- Folosesc alt dispozitiv

### 2. FactMaps Content - Răspunsuri la întrebări

**Locație:** `src/components/FactMapsContent.tsx` (liniile 227-242)

**Problema:** Răspunsurile la întrebările din Fact Maps se salvează DOAR în localStorage:

```typescript
// Linia 227 - Citește din localStorage
const savedAnswers = localStorage.getItem(answerKey);

// Linia 242 - Salvează în localStorage
localStorage.setItem('factMaps', JSON.stringify(updatedMaps));
```

**Notă:** Serviciul `factMapService.ts` ARE integrare cu Supabase, dar componenta NU îl folosește corect pentru răspunsuri.

### 3. DoorStorageManager - Backup-uri Locale

**Locație:** `src/services/doorStorageManager.ts`

**Problema:** Manager-ul face backup-uri DOAR în localStorage (liniile 130-175):

```typescript
// Salvează în localStorage, nu în cloud
localStorage.setItem('door-hot-list', JSON.stringify(data.hotList));
localStorage.setItem(`${this.backupPrefix}hot-list-${Date.now()}`, JSON.stringify(hotListBackup));
```

**Impact:** Backup-urile automate se pierd la ștergerea cache-ului.

### 4. Champion Routine Progress

**Locație:** `src/components/champion-routine/ChampionRoutineFlow.tsx`

**Problema:** Progresul în rutina de dimineață se salvează DOAR local:

```typescript
// Linia 462-463
localStorage.setItem(routineProgressKey, JSON.stringify({
  stepIndex,
  lastUpdate: Date.now()
}));
```

### 5. Morning Routine Items Order

**Locație:** `src/components/daily-flow/MorningRoutineStep.tsx`

**Problema:** Ordinea rutinei de dimineață = DOAR localStorage.

### 6. Onboarding Status

**Locație:** `src/components/door/WeeklySection.tsx`, `src/components/focus/WelcomeVisionModal.tsx`

**Problema:** Status-ul de onboarding = DOAR localStorage.

### 7. Stack Preferences (Audio Voice)

**Locație:** `src/components/stack/AiGuidedStack.tsx`

**Problema:** Preferința de voce TTS = DOAR localStorage:

```typescript
localStorage.getItem('preferred-tts-voice')
localStorage.setItem('preferred-tts-voice', voiceId);
```

### 8. Sound Settings

**Locație:** `src/hooks/useSoundSettings.tsx`

**Problema:** Setările de sunet = DOAR localStorage.

---

## Probleme de Sincronizare (Hibrid dar incomplet) 🟡

### 1. JournalWidget - Fallback la localStorage

**Locație:** `src/components/dashboard/widgets/JournalWidget.tsx`

**Comportament:**
- Dacă user autentificat → salvează în Supabase ✅
- Dacă user neautentificat → salvează în localStorage ⚠️

**Problema:** Datele din localStorage NU se sincronizează când user-ul se autentifică.

### 2. Divine Coaching / Gratitude Stack - Emergency Saves

**Locații:** 
- `src/components/stack/divine-stack/useDivinePrayerStack.tsx`
- `src/components/stack/gratitude-stack/useGratitudeStack.tsx`

**Comportament:** Salvează în localStorage ca "emergency backup":

```typescript
localStorage.setItem(`emergency-divine-${sessionId}`, JSON.stringify(emergencyData));
```

**Problema:** Emergency saves NU se sincronizează ulterior cu cloud-ul.

---

## Tabele Supabase Existente (pentru referință)

Tabele relevante care EXISTĂ și ar trebui folosite:

| Tabel | Scop |
|-------|------|
| `missions` | Pentru Annual Goals / Monthly Missions |
| `objectives` | Deja folosit pentru Weekly Objectives |
| `user_preferences` | Pentru setări utilizator (sunet, voce, etc.) |
| `fact_maps` | Deja folosit dar incomplet |
| `onboarding_progress` | Pentru status onboarding |
| `champion_routine_settings` | Pentru setări rutină |

---

## Plan de Remediere

### Prioritate CRITICĂ (Date utilizator pierdute)

| # | Componentă | Soluție | Efort |
|---|-----------|---------|-------|
| 1 | ThreeStepSystem | Migrare la tabel `missions` | 🔴 Mare |
| 2 | FactMaps Answers | Folosește `saveFactMapGoalAnswers` din service | 🟡 Mediu |
| 3 | JournalWidget Sync | Migrare localStorage → Supabase la login | 🟡 Mediu |

### Prioritate MEDIE (Preferințe pierdute)

| # | Componentă | Soluție | Efort |
|---|-----------|---------|-------|
| 4 | Sound Settings | Salvare în `user_preferences` | 🟢 Mic |
| 5 | TTS Voice Preference | Salvare în `user_preferences` | 🟢 Mic |
| 6 | Onboarding Status | Salvare în `onboarding_progress` | 🟢 Mic |
| 7 | Morning Routine Order | Salvare în `champion_routine_settings` | 🟢 Mic |

### Prioritate SCĂZUTĂ (Nice to have)

| # | Componentă | Soluție | Efort |
|---|-----------|---------|-------|
| 8 | Emergency Saves Sync | Background sync când user revine online | 🟡 Mediu |
| 9 | Champion Routine Progress | Sync cu `champion_routine_logs` | 🟡 Mediu |

---

## Recomandare Imediată

**Pasul 1:** Creez un serviciu `userPreferencesService.ts` care:
- Salvează preferințele în `user_preferences` 
- Fallback la localStorage pentru useri neautentificați
- Sincronizare automată la autentificare

**Pasul 2:** Migrez ThreeStepSystem pentru:
- Salvare Annual Goals în `missions` (type='annual')
- Salvare Monthly Missions în `missions` (type='monthly')
- Sync bidirectional cu localStorage

**Pasul 3:** Fix FactMapsContent:
- Înlocuiesc localStorage cu apeluri la `factMapService.saveFactMapGoalAnswers()`

---

## Rezumat

| Categorie | Count | Status |
|-----------|-------|--------|
| Funcționalități cu cloud COMPLET | 15+ | ✅ OK |
| Funcționalități cu cloud PARȚIAL | 3 | 🟡 Necesită sync |
| Funcționalități DOAR localStorage | 8 | 🔴 CRITIC |

**Concluzie:** Aproximativ **80%** din funcționalitățile critice SE SALVEAZĂ în cloud corect. Problemele principale sunt în:
1. Annual Goals & Monthly Missions (ThreeStepSystem)
2. FactMaps răspunsuri
3. Preferințe utilizator (sunet, voce, onboarding)

Dorești să implementez remedierea pentru aceste probleme?
