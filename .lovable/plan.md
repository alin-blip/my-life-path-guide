
# Audit Complet: Funcționalitate Platformă în Limba Engleză

## Sumar Executiv

Platforma WarriorOS are un **sistem de traduceri robust** implementat în `src/context/LanguageContext.tsx` cu peste 1600 de linii de traduceri pentru atât română cât și engleză. Cu toate acestea, există **zone semnificative cu text hardcodat în română** care împiedică funcționarea completă în engleză.

---

## Stare Curentă: Ce Funcționează Bine

| Componentă | Status |
|------------|--------|
| Landing Page Principal | Tradus |
| Pagina de Autentificare | Tradus |
| Dashboard Principal | Tradus |
| Sistemul XP/Gamificare | Tradus |
| Meniu Navigare | Tradus |
| Door (Planificare Săptămânală) | Tradus |
| Setări | Tradus |

---

## Probleme Identificate: Zone cu Text Hardcodat în Română

### Categoria 1: AI Coaching Stacks (CRITICĂ)

Următoarele stack-uri AI au **system prompts** și **welcome messages** hardcodate în română:

| Fișier | Problemă |
|--------|----------|
| `src/components/stack/daily-master/DailyMasterStack.tsx` | System prompt și welcome message în română |
| `src/components/stack/gods-school/GodsSchoolStack.tsx` | System prompt și welcome message în română |
| `src/components/stack/divine-gratitude/DivineGratitudeStack.tsx` | System prompt în română |
| `src/components/stack/gratitude-stack/GratitudeStack.tsx` | Welcome message în română |
| `src/components/stack/introspection-stack/IntrospectionStack.tsx` | System prompt și welcome message în română |
| `src/components/stack/master-plan/MasterPlanQuickStack.tsx` | Welcome messages în română |
| `src/components/stack/HormoziCoachingStack.tsx` | Welcome message în română |

### Categoria 2: Fișiere de Întrebări (CRITICĂ)

| Fișier | Problemă |
|--------|----------|
| `src/components/stack/divine-stack/questions.ts` | 19 întrebări complet în română, fără versiune EN |
| `src/components/stack/gods-school/questions.ts` | 8 întrebări în română |
| `src/components/stack/divine-gratitude/questions.ts` | Toate întrebările în română |
| `src/components/stack/daily-master/questions.ts` | Toate secțiunile în română |
| `src/components/stack/emotional-transform/questions.ts` | 15 întrebări în română |

### Categoria 3: Edge Functions (MODERATĂ-CRITICĂ)

| Edge Function | Problemă |
|---------------|----------|
| `supabase/functions/warrior-ai-coach/index.ts` | System prompt complet în română (NU verifică limba) |
| `supabase/functions/door-ai-planning/index.ts` | REVIEW_SYSTEM_PROMPT în română (NU verifică limba) |
| `supabase/functions/hormozi-platform-analysis/index.ts` | System prompt în română |
| `supabase/functions/send-power-results/index.ts` | Email content în română |

Unele edge functions au suport pentru limbă (verifică `language === 'ro'`):
- `sales-coach/index.ts` - Are versiuni RO și EN
- `goal-wizard-ai/index.ts` - Are suport pentru limbă
- `lifebook-mission-suggest/index.ts` - Are suport pentru limbă

### Categoria 4: UI Components cu Text Hardcodat (MODERATĂ)

| Componentă | Problemă |
|------------|----------|
| `src/components/admin/ai-studio/AIFeatureImageGenerator.tsx` | "Se încarcă...", "Se salvează..." |
| `src/components/journal/JournalList.tsx` | "Se încarcă intrările..." |
| `src/components/champion-routine/CardioTimer.tsx` | "Progresul se salvează automat", "Continuă", "Stop & Salvează" |
| `src/components/fitness/TodaysWorkoutDashboard.tsx` | "Adaugă exercițiu...", "Selectează exercițiu..." |
| `src/components/setup/steps/ProfileStep.tsx` | "Selectează nivelul" |
| `src/pages/SetupWizard.tsx` | "Continuă" button |
| `src/pages/ChallengeDay.tsx` | Multiple exerciții în română |
| `src/components/admin/ClientManager.tsx` | Toast messages în română |
| `src/components/door/WeeklyPlanningHistory.tsx` | "Șterge plan" tooltip |

### Categoria 5: Challenge Content (MODERATĂ)

| Componentă | Problemă |
|------------|----------|
| `src/pages/ChallengeDay.tsx` | `exercisesRo` sunt hardcodate, dar există și `exercisesEn` |
| `src/pages/ChallengeLanding.tsx` | "Alege Calea Ta de Transformare" hardcodat |

---

## Plan de Implementare

### Faza 1: AI Stack System Prompts (Prioritate ÎNALTĂ)
**Efort estimat: 4-6 ore**

1. **Modificare pattern pentru toate Stack-urile AI**:
   - Adaugă parametrul `language` din `useLanguage()` în toate componentele
   - Creează funcții `getSystemPrompt(language)` și `getWelcomeMessage(language)` pentru fiecare stack
   - Implementează versiuni EN pentru toate prompt-urile

2. **Fișiere de modificat**:
   - `DailyMasterStack.tsx`
   - `GodsSchoolStack.tsx`
   - `DivineGratitudeStack.tsx`
   - `GratitudeStack.tsx`
   - `IntrospectionStack.tsx`
   - `MasterPlanQuickStack.tsx`
   - `HormoziCoachingStack.tsx`

### Faza 2: Fișiere de Întrebări (Prioritate ÎNALTĂ)
**Efort estimat: 3-4 ore**

1. **Refactorizare pattern întrebări**:
```text
// Înainte:
export const getQuestions = () => ["Întrebare în română..."];

// După:
export const getQuestions = (language: 'en' | 'ro') => 
  language === 'en' 
    ? ["Question in English..."]
    : ["Întrebare în română..."];
```

2. **Fișiere de modificat**:
   - `divine-stack/questions.ts`
   - `gods-school/questions.ts`
   - `divine-gratitude/questions.ts`
   - `daily-master/questions.ts`
   - `emotional-transform/questions.ts`

### Faza 3: Edge Functions (Prioritate MEDIE)
**Efort estimat: 3-4 ore**

1. **Adaugă suport pentru limbă în edge functions**:
   - Acceptă parametrul `language` în request body
   - Creează versiuni EN pentru system prompts
   - Implementează condiționare `language === 'ro' ? promptRo : promptEn`

2. **Edge functions de modificat**:
   - `warrior-ai-coach/index.ts`
   - `door-ai-planning/index.ts`
   - `hormozi-platform-analysis/index.ts`

### Faza 4: UI Components Hardcodate (Prioritate MEDIE)
**Efort estimat: 2-3 ore**

1. **Adaugă chei noi în LanguageContext.tsx** pentru textele lipsă
2. **Înlocuiește text hardcodat** cu `t('cheiaTradusă')`

**Chei noi necesare** (exemplu):
```text
en: {
  "uploading": "Uploading...",
  "saving": "Saving...",
  "loadingEntries": "Loading entries...",
  "progressAutoSaved": "Progress auto-saved",
  "addExercise": "Add exercise...",
  "selectExercise": "Select exercise...",
  "selectLevel": "Select level",
  "deletePlan": "Delete plan",
  ...
}
```

### Faza 5: QA și Testare
**Efort estimat: 2-3 ore**

1. Setează limba pe EN și testează fiecare pagină
2. Verifică toate AI coaching flows
3. Testează edge functions cu language='en'
4. Documentează orice text rămas în română

---

## Rezumat Efort Total

| Fază | Efort | Prioritate |
|------|-------|------------|
| Faza 1: AI Stack System Prompts | 4-6 ore | ÎNALTĂ |
| Faza 2: Fișiere de Întrebări | 3-4 ore | ÎNALTĂ |
| Faza 3: Edge Functions | 3-4 ore | MEDIE |
| Faza 4: UI Components | 2-3 ore | MEDIE |
| Faza 5: QA | 2-3 ore | ÎNALTĂ |
| **TOTAL** | **14-20 ore** | - |

---

## Recomandare

Recomand să implementăm **Faza 1 și Faza 2** imediat, deoarece afectează experiența utilizatorilor englezofoni cel mai mult (AI coaching e funcționalitatea principală). Fazele 3-4 pot fi implementate incremental.

Dacă aprobi, voi începe cu:
1. Refactorizarea `DailyMasterStack.tsx` ca model
2. Crearea funcțiilor `getSystemPrompt(language)` pentru toate stack-urile
3. Traducerea fișierelor de întrebări
