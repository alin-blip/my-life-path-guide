

# Plan de Actualizare AI Mind Coach
## Implementare Exactă a Sistemului Tony Robbins

---

## Rezumat Executiv

Acest plan actualizează sistemul Mind Coach pentru a urma **exact** prompturile și flow-urile din sesiunea de brainstorming cu Tony Robbins. Modificările principale includ:

1. **Lista extinsă de emoții** (14 opțiuni conform documentului)
2. **5 Clustere de Coaching** cu scripturi detaliate și branching logic
3. **Sistem de Habit & Task Management** integrat
4. **Reminder & Accountability Follow-up**
5. **Session Continuity & Dynamic Mode Transitions**

---

## 1. Actualizări Lista de Emoții

### Emoții Curente vs. Document Tony Robbins

| Curent | Document TR (14 emoții) |
|--------|-------------------------|
| angry, sad, anxious, stressed | Happy, Sad, Anxious, Angry |
| overwhelmed, procrastinating | Calm, Stressed, Enthusiastic |
| not_good_enough, happy | Natural, Stuck, Procrastinating |
| calm, excited, frustrated, confused | Overwhelmed, Motivated, Distracted, Conflicted |

### Fișier: `src/components/mind-coach/ExtendedEmotionPicker.tsx`

**Actualizări:**
- Adaug emoțiile lipsă: `Natural`, `Enthusiastic/Motivated`, `Stuck`, `Distracted`, `Conflicted`
- Reorganizez categoriile: Negative (pentru transformare) vs Positive (pentru amplificare)
- Actualizez etichetele RO/EN conform documentului

```typescript
export type MindCoachEmotion = 
  | 'happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'stressed'
  | 'enthusiastic' | 'natural' | 'stuck' | 'procrastinating'
  | 'overwhelmed' | 'motivated' | 'distracted' | 'conflicted';

const MIND_COACH_EMOTIONS = [
  // Negative - Need Transformation
  { id: 'stuck', emoji: '🧱', labelRo: 'Blocat', labelEn: 'Stuck', cluster: 'stuck_procrastination' },
  { id: 'procrastinating', emoji: '😴', labelRo: 'Amân', labelEn: 'Procrastinating', cluster: 'stuck_procrastination' },
  { id: 'anxious', emoji: '😰', labelRo: 'Anxios', labelEn: 'Anxious', cluster: 'fear_doubt' },
  { id: 'angry', emoji: '😤', labelRo: 'Supărat', labelEn: 'Angry', cluster: 'frustration_uncertainty' },
  { id: 'sad', emoji: '😢', labelRo: 'Trist', labelEn: 'Sad', cluster: 'fear_doubt' },
  { id: 'stressed', emoji: '😫', labelRo: 'Stresat', labelEn: 'Stressed', cluster: 'overwhelm_burnout' },
  { id: 'overwhelmed', emoji: '🤯', labelRo: 'Copleșit', labelEn: 'Overwhelmed', cluster: 'overwhelm_burnout' },
  { id: 'distracted', emoji: '🤷', labelRo: 'Distras', labelEn: 'Distracted', cluster: 'distraction_focus' },
  { id: 'conflicted', emoji: '😕', labelRo: 'Confuz', labelEn: 'Conflicted', cluster: 'frustration_uncertainty' },
  // Positive - Amplify
  { id: 'happy', emoji: '😊', labelRo: 'Fericit', labelEn: 'Happy', cluster: 'positive' },
  { id: 'calm', emoji: '😌', labelRo: 'Calm', labelEn: 'Calm', cluster: 'positive' },
  { id: 'enthusiastic', emoji: '🤩', labelRo: 'Entuziasmat', labelEn: 'Enthusiastic', cluster: 'positive' },
  { id: 'natural', emoji: '😐', labelRo: 'Neutru', labelEn: 'Natural', cluster: 'positive' },
  { id: 'motivated', emoji: '💪', labelRo: 'Motivat', labelEn: 'Motivated', cluster: 'positive' },
];
```

---

## 2. Implementare 5 Clustere de Coaching

Fiecare cluster va avea propriul prompt și flow de branching conform scripturilor din document.

### Fișier NOU: `src/lib/mind-coach-clusters.ts`

Acest fișier va conține toate prompturile exacte pentru fiecare cluster:

### A. Cluster: Stuck & Procrastination

```typescript
export const STUCK_PROCRASTINATION_FLOW = {
  opening: "Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?",
  
  branches: {
    "dont_know_where_to_start": {
      response: "Uneori claritatea e primul obstacol. Care e un pas mic, tangibil pe care îl poți face chiar acum, chiar dacă e incomod?",
      nextPhase: "deepening"
    },
    "afraid_of_failure": {
      response: "Frica poate paraliza, dar arată și că îți pasă profund. Care e cel mai rău lucru care s-ar putea întâmpla dacă încerci și te împiedici? Ai putea supraviețui și învăța din asta?",
      nextPhase: "deepening"
    },
    "too_much": {
      response: "Copleșirea ne spune să facem pauză și să prioritizăm. Care e un singur lucru care trebuie făcut azi și care ar muta lucrurile înainte?",
      nextPhase: "deepening"
    },
    "not_motivated": {
      response: "Motivația e trecătoare; angajamentul creează rezultate. La ce angajament poți să te ții chiar acum, indiferent cum te simți?",
      nextPhase: "deepening"
    }
  },
  
  deepening: {
    prompt: "Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi așa?",
    beliefBranches: {
      "not_good_enough": "Această poveste te împiedică să dovedești de ce ești cu adevărat capabil. Care e un mic succes pe care ți-l amintești și care contrazice această credință?",
      "always_mess_up": "Greșelile sunt modul în care învățăm. Ce lecție ți-a dat ultima 'greșeală'?",
      "not_ready": "Pregătit e un mit; creșterea vine din acțiune. Care e cel mai mic pas pe care îl poți face azi să mergi înainte?",
      "overwhelmed_perfection": "Perfecțiunea oprește progresul. Cum poți simplifica sarcina ta chiar acum?"
    }
  },
  
  ownership: {
    prompt: "Îți asumi niște insight-uri puternice. Care e o acțiune foarte specifică și gestionabilă pe care ești dispus să o faci în următoarea oră pentru a te elibera din blocaj?",
    followUp: "Exact genul de pas care construiește momentum. Cum te vei asigura că urmezi? Ce reminder sau metodă de accountability vei folosi?"
  },
  
  action: {
    prompt: "Hai să o desfacem. Care e primul lucru pe care îl vei face fizic pentru a începe? Când și unde?",
    obstacles: "Ce obstacole ar putea apărea și cum le vei depăși?",
    celebration: "Când îți completezi acțiunea, cum vei celebra sau recunoaște progresul?"
  },
  
  closure: "Excelentă muncă azi. Ține minte, fiecare pas mic îți reconfigurează calea înainte. Ai preluat controlul—menține acest momentum!"
};
```

### B. Cluster: Fear & Doubt

```typescript
export const FEAR_DOUBT_FLOW = {
  opening: "Simt că frica sau îndoiala te influențează azi. Care e cel mai mare 'dar dacă' care îți trece prin minte acum?",
  
  branches: {
    "what_if_fail": {
      response: "Frica de eșec e naturală. Care e scenariul cel mai rău dacă ai eșua? Ai putea supraviețui, învăța și reveni mai puternic?",
      nextPhase: "reframe"
    },
    "not_good_enough": {
      response: "Asta e o frică comună, dar e o poveste, nu un fapt. Îți amintești un moment când ai reușit deși te simțeai așa?",
      nextPhase: "reframe"
    },
    "dont_know_what_doing": {
      response: "A te simți nesigur face parte din creștere. Ce poți face azi pentru a câștiga mai multă claritate sau a învăța ceva nou?",
      nextPhase: "reframe"
    }
  },
  
  reframe: {
    protection: "Hai să privim această frică dintr-un unghi nou. Cum ar putea această frică să te protejeze sau să te servească în vreun fel?",
    opposite: "Care e adevărul opus pe care trebuie să-l ții pentru a trece peste această frică?",
    identity: "Cine ești tu când ești cel mai curajos? Cum poți să intri în acea persoană chiar acum?"
  },
  
  ownership: {
    bold_step: "Care e un pas îndrăzneț pe care ești dispus să-l faci în ciuda acestei frici sau îndoieli?",
    success_measure: "Cum vei măsura succesul—nu prin absența fricii, ci prin curajul de a acționa?"
  },
  
  support: {
    mantra: "Când frica încearcă să te cuprindă din nou, ce mantra, acțiune sau reminder vei folosi pentru a rămâne pe curs?",
    celebration: "Cum vei celebra curajul și progresul tău?"
  },
  
  closure: "Frica e un semnal, nu un semn de stop. Intri în puterea ta mergând înainte. Continuă să-ți asumi curajul!"
};
```

### C. Cluster: Overwhelm & Burnout

```typescript
export const OVERWHELM_BURNOUT_FLOW = {
  opening: "Aud că lucrurile se simt copleșitoare acum. Care sunt cele mai mari surse de stres sau supraîncărcare în viața ta azi?",
  
  branches: {
    "too_many_tasks": {
      response: "Uneori cheia e să spui nu sau să delegi. Care e o sarcină pe care o poți elimina sau preda imediat?",
      nextPhase: "energy"
    },
    "decision_fatigue": {
      response: "Oboseala decizională te epuizează. Care e o prioritate pe care te poți concentra acum, și ce poate aștepta?",
      nextPhase: "energy"
    },
    "lack_of_energy": {
      response: "Energia ta e cel mai valoros activ. Ce practică fizică sau mentală te ajută să te reîncarci, chiar și pentru 5 minute?",
      nextPhase: "energy"
    }
  },
  
  energy: {
    boundaries: "Ce limită poți seta azi pentru a-ți proteja energia și focusul?",
    habits: "Cum îți vei aminti să menții aceste limite? Ce indicii sau obiceiuri te pot susține?"
  },
  
  ownership: {
    small_shift: "Ce schimbare mică poți face chiar acum care va reduce copleșirea?"
  },
  
  resilience: {
    reset: "Când stresul revine, care e planul tău rapid de resetare?",
    celebration: "Cum vei celebra că ai preluat controlul asupra energiei și focusului tău?"
  },
  
  closure: "A-ți proteja energia nu e opțional—e esențial. Fiecare limită pe care o setezi îți alimentează succesul."
};
```

### D. Cluster: Frustration & Uncertainty

```typescript
export const FRUSTRATION_UNCERTAINTY_FLOW = {
  opening: "Simt frustrare sau incertitudine în experiența ta de azi. Care e cea mai mare provocare sau întrebare din mintea ta?",
  
  branches: {
    "obstacles_blocking": {
      response: "Hai să o desfacem. Care e o parte a provocării pe care o poți aborda prima?",
      nextPhase: "problem_solving"
    },
    "not_sure_what_step": {
      response: "Care e un mic pas clar care te-ar putea apropia de obiectiv?",
      nextPhase: "problem_solving"
    },
    "slow_no_progress": {
      response: "Ce ai încercat deja? Ce ai învățat din asta?",
      nextPhase: "problem_solving"
    }
  },
  
  problem_solving: {
    success_criteria: "Cum vei măsura progresul pe următorul tău pas? Cum va arăta succesul?"
  },
  
  ownership: {
    commitment: "Care e un angajament pe care îl poți face în următoarele 24 de ore pentru a merge înainte?"
  },
  
  encouragement: {
    reminder: "Când frustrarea apare din nou, ce îți vei aminti pentru a continua să mergi?",
    small_win: "Ce mică victorie vei celebra pentru a construi momentum?"
  },
  
  closure: "A transforma provocările mari în pași mici transformă frustrarea în progres. Ești pe drumul cel bun."
};
```

### E. Cluster: Distraction & Lack of Focus

```typescript
export const DISTRACTION_FOCUS_FLOW = {
  opening: "Observ că menținerea focusului e o provocare acum. Ce îți atrage atenția cel mai mult azi?",
  
  branches: {
    "too_many_notifications": {
      response: "Notificările îți pot fura momentum-ul. Care e o schimbare simplă pe care o poți face pentru a reduce întreruperile?",
      nextPhase: "focus_building"
    },
    "multitasking": {
      response: "Multitasking-ul îți împarte focusul. Care e o sarcină la care te poți angaja complet înainte de a trece la următoarea?",
      nextPhase: "focus_building"
    },
    "lack_clear_priorities": {
      response: "Când prioritățile tale sunt neclare, distragerea câștigă. Care e sarcina cea mai importantă chiar acum?",
      nextPhase: "focus_building"
    }
  },
  
  focus_building: {
    timer: "Poți seta un timer pentru o sesiune de lucru focalizată? Cât timp te angajezi să te concentrezi fără întrerupere?",
    mindfulness: "Care e un reminder sau indiciu blând pe care îl poți folosi pentru a-ți readuce atenția când rătăcește?"
  },
  
  progress: {
    tracking: "Cum vei urmări sesiunile tale de focus și vei celebra când îți atingi obiectivele?"
  },
  
  closure: "Îmbunătățirea focusului e un mușchi pe care îl construiești în fiecare zi. Fiecare moment de atenție investit e progres spre viziunea ta."
};
```

---

## 3. Actualizare Edge Function

### Fișier: `supabase/functions/mind-coach/index.ts`

**Modificări Principale:**

1. **Adaug parametru `cluster`** pentru a determina flow-ul potrivit
2. **Actualizez System Prompt** cu logică de cluster-based coaching
3. **Adaug prompturi specifice** pentru fiecare cluster

```typescript
// Determină cluster-ul bazat pe emoție
function getClusterForEmotion(emotion: string): string {
  const clusterMap: Record<string, string> = {
    'stuck': 'stuck_procrastination',
    'procrastinating': 'stuck_procrastination',
    'anxious': 'fear_doubt',
    'sad': 'fear_doubt',
    'angry': 'frustration_uncertainty',
    'conflicted': 'frustration_uncertainty',
    'stressed': 'overwhelm_burnout',
    'overwhelmed': 'overwhelm_burnout',
    'distracted': 'distraction_focus',
    'happy': 'positive_amplify',
    'calm': 'positive_amplify',
    'enthusiastic': 'positive_amplify',
    'natural': 'positive_amplify',
    'motivated': 'positive_amplify',
  };
  return clusterMap[emotion] || 'general';
}

// System prompt actualizat cu cluster-specific instructions
const getClusterPrompt = (cluster: string, emotion: string, intensity: number) => {
  const basePrompt = `Tu ești Mind Coach-ul personal al utilizatorului...`;
  
  const clusterPrompts: Record<string, string> = {
    stuck_procrastination: `
CLUSTER: STUCK & PROCRASTINATION

OPENING:
"Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?"

BRANCHING (bazat pe răspuns):
- "Nu știu de unde să încep" → "Uneori claritatea e primul obstacol..."
- "Mi-e frică să nu eșuez" → "Frica poate paraliza, dar arată și că îți pasă..."
- "E prea mult" → "Copleșirea ne spune să prioritizăm..."
- "Nu mă simt motivat" → "Motivația e trecătoare; angajamentul creează rezultate..."

DEEPENING:
"Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi așa?"

OWNERSHIP:
"Care e o acțiune foarte specifică pe care ești dispus să o faci în următoarea oră?"

ACTION:
"Care e primul lucru pe care îl vei face fizic pentru a începe? Când și unde?"

CLOSURE:
"Excelentă muncă azi. Fiecare pas mic îți reconfigurează calea înainte!"
`,
    // ... alte clustere similare
  };
  
  return basePrompt + (clusterPrompts[cluster] || '');
};
```

---

## 4. Habit & Task Management System

### Actualizări în Edge Function

**Noi Tool Definitions:**

```typescript
{
  type: "function",
  function: {
    name: "add_habit",
    description: "Adaugă un obicei nou când utilizatorul menționează că vrea să înceapă ceva regulat",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Numele obiceiului" },
        category: { 
          type: "string", 
          enum: ["body", "being", "balance", "business", "custom"],
          description: "Categoria: Body, Being, Balance, Business, sau Custom"
        },
        reminder_time: { type: "string", description: "Când să primească reminder" },
        frequency: { type: "string", enum: ["daily", "weekly"], description: "Frecvența" }
      },
      required: ["name", "category"]
    }
  }
}
```

### Flow Prompts pentru Habit Addition

```typescript
const HABIT_ADDITION_PROMPTS = {
  trigger: "Am observat că vrei să începi un nou obicei. Să-l adăugăm!",
  name: "Ce obicei sau task ai vrea să adaugi?",
  category: "Cărei arii a vieții tale îi aparține acest obicei? (Body, Being, Balance, Business, sau Custom)",
  reminder: "Când ai vrea să-ți reamintesc să lucrezi la acest obicei? (ex: 'în fiecare dimineață la 7' sau 'de 3 ori pe săptămână')",
  confirmation: "Grozav! Ai setat un nou obicei pentru [{category}]: '[{habit}]' cu reminder-e [{reminder}]. Te voi ajuta să rămâi responsabil!"
};
```

---

## 5. Reminder & Accountability Follow-up

### Prompturi pentru Follow-up (în Edge Function)

```typescript
const REMINDER_FOLLOWUP_PROMPTS = {
  scheduled: "Salut! Acesta e un reminder prietenos să lucrezi la obiceiul/task-ul tău: '[{habit}]' în aria [{category}]. L-ai completat?",
  
  responses: {
    done: "Grozav! Consistența ta creează momentum real. Cum te simți după ce l-ai completat?",
    not_yet: "E în regulă. Ce te blochează să-l faci chiar acum?",
    partially: "Super că ai făcut progres. Care e următorul pas pentru a-l termina?"
  },
  
  encouragement: "Ține minte, fiecare pas contează. La ce angajament îți vei ține pentru a urmări azi?",
  
  streak_celebration: "Ai completat [{habit}] consistant pentru [{days}] zile—asta construiește momentum de neoprit! Continuă să-ți asumi progresul!",
  
  missed_support: "Am observat că ai ratat acest obicei de câteva ori recent. Ce ajustări putem face pentru a te ajuta să revii pe drum?"
};
```

---

## 6. Session Continuity & Progress Tracking

### Prompturi pentru Continuitate

```typescript
const SESSION_CONTINUITY_PROMPTS = {
  welcome_back: "Bine ai revenit! Hai să vedem progresul tău de la ultimul check-in. Cum au mers obiceiurile, rutinele și obiectivele tale?",
  
  responses: {
    great_progress: "Asta e uimitor! Ce a funcționat bine pentru tine? Hai să construim pe acel succes.",
    ups_and_downs: "E normal să ai fluctuații. Ce provocări au apărut și cum le-ai gestionat?",
    struggling: "Te aud. Care crezi că e cea mai mare barieră acum? Hai să găsim o cale înainte împreună."
  },
  
  personalized_suggestions: "Bazat pe cum te simți, ai vrea să...\n- Intrăm mai adânc în schimbări de mindset? (Mindset coaching)\n- Ne focusăm pe energie și managementul stresului? (Energy coaching)\n- Revizuim și ajustăm planul tău de accountability? (Accountability mode)\n- Lucrăm pe focus și claritate? (Focus coaching)",
  
  milestone: "Ești la {days} zile în călătoria ta cu [{habit}]. Asta e consistență puternică. Care e următorul tău milestone?",
  
  next_steps: "Hai să setăm următorul tău focus sau intenție. Care e un pas imediat pe care îl vei face înainte de următorul check-in?",
  
  closure: "Ține minte, progresul e o călătorie, nu un sprint. Sunt aici să te ajut să rămâi pe drum la fiecare pas."
};
```

---

## 7. Dynamic Mode Transitions

### Logică de Tranziție

```typescript
const MODE_TRANSITION_LOGIC = {
  // Detectare nevoie de schimbare mod
  triggers: {
    disengagement: "Simți că ai ieșit din ritm? Uneori o perspectivă proaspătă ajută.",
    emotional_shift: "Simt că e o nouă zonă de focus care te-ar putea ajuta acum.",
    completion: "Ai făcut progres excelent aici. Vrei să explorezi altceva?"
  },
  
  transition_prompt: "Simt că e o nouă zonă de focus care te-ar putea ajuta acum. Ai vrea să explorezi [{next_mode}]? Sau preferi să continuăm aici?",
  
  mode_intro: {
    mindset: "Grozav! Hai să intrăm în [{mode}]. Asta te va ajuta să [{purpose}].",
    energy: "Perfect! Hai să ne focusăm pe energia ta...",
    accountability: "Să vedem cum merge planul tău de accountability...",
    focus: "Hai să îți construim capacitatea de focus..."
  },
  
  rejection_handling: "Nicio problemă. Putem rămâne focalizați aici. Ține minte, oricând vrei să explorezi alte zone, spune-mi.",
  
  summary_after_transition: "Hai să rezumăm progresul recent și acțiunile viitoare pentru a te menține ancorat și motivat."
};
```

---

## 8. Fișiere de Creat

| Fișier | Scop |
|--------|------|
| `src/lib/mind-coach-clusters.ts` | Toate prompturile pentru cele 5 clustere |
| `src/lib/mind-coach-accountability.ts` | Prompturi pentru reminder și follow-up |
| `src/lib/mind-coach-continuity.ts` | Session continuity și mode transitions |

---

## 9. Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `supabase/functions/mind-coach/index.ts` | System prompt actualizat cu clustere, tools extinse |
| `src/components/mind-coach/ExtendedEmotionPicker.tsx` | 14 emoții conform documentului TR |
| `src/components/mind-coach/MindCoachChat.tsx` | UI pentru cluster selection, habit addition |
| `src/hooks/useMindCoach.ts` | Logică pentru cluster routing, accountability tracking |

---

## 10. Ordinea Implementării

1. **Faza 1** - Actualizez lista de emoții (14 opțiuni)
2. **Faza 2** - Creez fișierul cu clustere și prompturi exacte
3. **Faza 3** - Actualizez edge function cu logică de cluster routing
4. **Faza 4** - Actualizez UI pentru a afișa cluster-ul curent
5. **Faza 5** - Implementez habit addition flow
6. **Faza 6** - Adaug reminder prompts
7. **Faza 7** - Implementez session continuity
8. **Faza 8** - Adaug dynamic mode transitions

---

## 11. Note Tehnice

- **Model:** `google/gemini-2.5-pro` pentru raționament complex
- **Streaming:** Menținut pentru răspunsuri în timp real
- **Tool Calling:** Extins pentru habit management
- **Database:** Folosește `breakthrough_logs` existent + `daily_habits`
- **Integrare:** Sincronizare cu Accountability Coach existent

