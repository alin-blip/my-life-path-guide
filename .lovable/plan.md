

# Plan de Reparații Mind Coach
## Fixează Problemele Identificate în Audit

---

## 1. Rezumat Modificări

Acest plan rezolvă cele 4 probleme identificate în audit pentru a asigura funcționarea corectă a Mind Coach conform specificațiilor Tony Robbins.

---

## 2. Problemă #1: Welcome Message Static

### Fișier: `src/components/mind-coach/MindCoachChat.tsx`

**Locație:** Liniile 252-262

**Problema actuală:**
Afișează mereu același text generic indiferent de emoție/cluster selectat.

**Soluția:**
- Importez `getClusterOpeningMessage()` din `mind-coach-clusters.ts`
- Determin cluster-ul bazat pe emoție
- Afișez opening-ul specific cluster-ului (ex: "Văd că te simți blocat..." pentru stuck)

```typescript
// Adaug import
import { getClusterForEmotion, getClusterOpeningMessage } from '@/lib/mind-coach-clusters';

// În secțiunea welcome message (linia 252)
{messages.length === 0 && (
  <div className="bg-primary/10 rounded-xl p-4 text-sm">
    <p className="font-medium mb-2">
      {emotionInfo?.emoji} {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn} la {selectedIntensity}/10...
    </p>
    <p className="text-muted-foreground">
      {getClusterOpeningMessage(getClusterForEmotion(selectedEmotion), language)}
    </p>
  </div>
)}
```

---

## 3. Problemă #2: Cluster Nu Se Trimite la Edge Function

### Fișier: `src/hooks/useMindCoach.ts`

**Locație:** Liniile 150-156

**Problema actuală:**
Nu trimite `cluster` în request body, edge function-ul îl deduce singur.

**Soluția:**
- Calculez cluster-ul pe baza emoției
- Îl trimit explicit în request

```typescript
// Adaug import
import { getClusterForEmotion } from '@/lib/mind-coach-clusters';

// La linia 137, după getEmotionInfo
const cluster = getClusterForEmotion(emotion);

// Actualizez body la linia 150
body: JSON.stringify({
  messages: allMessages,
  emotion: emotionInfo?.labelRo || emotion,
  intensity,
  phase: newPhase,
  cluster, // ADĂUGAT
}),
```

---

## 4. Problemă #3: Parsarea Tool Calls Poate Eșua

### Fișier: `src/hooks/useMindCoach.ts`

**Locație:** Liniile 217-228

**Problema actuală:**
`tc.function.arguments` poate fi un string parțial când vine în streaming chunks, iar `JSON.parse()` eșuează.

**Soluția:**
- Acumulez arguments string pe parcurs folosind un Map
- Parse-uiesc JSON doar când primesc finish_reason

```typescript
// Înlocuiesc implementarea curentă cu una care acumulează tool calls

// Înainte de while loop
const toolCallsInProgress: Map<number, { name: string; arguments: string }> = new Map();

// În while loop, la tool_calls handling
const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
if (toolCalls) {
  for (const tc of toolCalls) {
    const idx = tc.index ?? 0;
    if (tc.function?.name) {
      // Începe un nou tool call
      toolCallsInProgress.set(idx, { 
        name: tc.function.name, 
        arguments: tc.function.arguments || '' 
      });
    } else if (tc.function?.arguments) {
      // Acumulează arguments
      const existing = toolCallsInProgress.get(idx);
      if (existing) {
        existing.arguments += tc.function.arguments;
      }
    }
  }
}

// La finish_reason, parse-uiesc toate tool calls acumulate
const finishReason = parsed.choices?.[0]?.finish_reason;
if (finishReason === 'tool_calls') {
  for (const [, tc] of toolCallsInProgress) {
    try {
      pendingToolCalls.push({
        name: tc.name,
        arguments: tc.arguments ? JSON.parse(tc.arguments) : {},
      });
    } catch (e) {
      console.error('Failed to parse tool call arguments:', e);
    }
  }
  await processToolCalls(pendingToolCalls);
}
```

---

## 5. Problemă #4: Sincronizare Prompturi

### Fișier: `supabase/functions/mind-coach/index.ts`

**Problema actuală:**
Edge function-ul are propriile versiuni scurtate ale prompturilor care pot diferi de cele din `mind-coach-clusters.ts`.

**Soluția:**
Actualizez prompturile din edge function pentru a fi identice cu cele din `mind-coach-clusters.ts`, păstrând structura completă cu OPENING, BRANCHING, DEEPENING, OWNERSHIP, ACTION, CLOSURE.

```typescript
// Actualizez clusterPrompts să aibă exact structura din mind-coach-clusters.ts
// Exemplu pentru stuck_procrastination:

const clusterPrompts: Record<string, string> = {
  stuck_procrastination: `
CLUSTER: STUCK & PROCRASTINATION

OPENING (prima ta replică dacă nu ai mesaje anterioare):
"Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Nu știu de unde să încep" → "Uneori claritatea e primul obstacol. Care e un pas mic, tangibil pe care îl poți face chiar acum, chiar dacă e incomod?"
- Dacă spune "Mi-e frică să eșuez" → "Frica poate paraliza, dar arată și că îți pasă profund. Care e cel mai rău lucru care s-ar putea întâmpla dacă încerci? Ai putea supraviețui și învăța din asta?"
- Dacă spune "E prea mult" → "Copleșirea ne spune să facem pauză și să prioritizăm. Care e un singur lucru care trebuie făcut azi?"
- Dacă spune "Nu mă simt motivat" → "Motivația e trecătoare; angajamentul creează rezultate. La ce angajament poți să te ții chiar acum?"

DEEPENING (după răspunsul inițial):
"Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi așa?"

CREDINȚE LIMITATIVE:
- "Nu sunt destul de bun" → "Această poveste te împiedică să dovedești de ce ești cu adevărat capabil. Care e un mic succes care contrazice această credință?"
- "Întotdeauna dau greș" → "Greșelile sunt modul în care învățăm. Ce lecție ți-a dat ultima 'greșeală'?"
- "Nu sunt pregătit" → "Pregătit e un mit; creșterea vine din acțiune. Care e cel mai mic pas pe care îl poți face azi?"
- "Perfecționism" → "Perfecțiunea oprește progresul. Cum poți simplifica sarcina ta chiar acum?"

OWNERSHIP:
"Îți asumi niște insight-uri puternice. Care e o acțiune foarte specifică și gestionabilă pe care ești dispus să o faci în următoarea oră pentru a te elibera din blocaj?"
Follow-up: "Exact genul de pas care construiește momentum. Cum te vei asigura că urmezi? Ce reminder sau metodă de accountability vei folosi?"

ACTION:
"Hai să o desfacem. Care e primul lucru pe care îl vei face fizic pentru a începe? Când și unde?"
Obstacole: "Ce obstacole ar putea apărea și cum le vei depăși?"
Celebrare: "Când îți completezi acțiunea, cum vei celebra sau recunoaște progresul?"

CLOSURE:
"Excelentă muncă azi. Ține minte, fiecare pas mic îți reconfigurează calea înainte. Ai preluat controlul—menține acest momentum! 🚀"
`,
  // ... similar pentru celelalte clustere
};
```

---

## 6. Fișier Nou: Helper Functions în mind-coach-clusters.ts

### Adaug funcții helper pentru frontend

**Locație:** La finalul fișierului `src/lib/mind-coach-clusters.ts`

```typescript
// ============================================================
// HELPER: GET CLUSTER FOR EMOTION
// ============================================================

export function getClusterForEmotion(emotion: string | null): CoachingCluster {
  if (!emotion) return 'positive';
  
  const clusterMap: Record<string, CoachingCluster> = {
    'stuck': 'stuck_procrastination',
    'procrastinating': 'stuck_procrastination',
    'anxious': 'fear_doubt',
    'sad': 'fear_doubt',
    'angry': 'frustration_uncertainty',
    'conflicted': 'frustration_uncertainty',
    'stressed': 'overwhelm_burnout',
    'overwhelmed': 'overwhelm_burnout',
    'distracted': 'distraction_focus',
    'happy': 'positive',
    'calm': 'positive',
    'enthusiastic': 'positive',
    'natural': 'positive',
    'motivated': 'positive',
  };
  
  return clusterMap[emotion] || 'positive';
}

// ============================================================
// HELPER: GET CLUSTER OPENING MESSAGE
// ============================================================

export function getClusterOpeningMessage(cluster: CoachingCluster, language: 'ro' | 'en' = 'ro'): string {
  const openings: Record<CoachingCluster, { ro: string; en: string }> = {
    stuck_procrastination: {
      ro: STUCK_PROCRASTINATION_FLOW.opening,
      en: "I see you're feeling stuck right now. Tell me, what's the story you're telling yourself that's keeping you frozen?"
    },
    fear_doubt: {
      ro: FEAR_DOUBT_FLOW.opening,
      en: "I sense fear or doubt might be influencing you today. What's the biggest 'what if' running through your mind right now?"
    },
    overwhelm_burnout: {
      ro: OVERWHELM_BURNOUT_FLOW.opening,
      en: "I hear things feel overwhelming right now. What are the biggest sources of stress or overload in your life today?"
    },
    frustration_uncertainty: {
      ro: FRUSTRATION_UNCERTAINTY_FLOW.opening,
      en: "I sense frustration or uncertainty in your experience today. What's the biggest challenge or question on your mind?"
    },
    distraction_focus: {
      ro: DISTRACTION_FOCUS_FLOW.opening,
      en: "I notice maintaining focus is a challenge right now. What's pulling your attention away the most today?"
    },
    positive: {
      ro: POSITIVE_AMPLIFICATION_FLOW.opening,
      en: "How wonderful that you're feeling good! Let's anchor and amplify this state. What contributed to how you feel now?"
    }
  };
  
  return openings[cluster]?.[language] || openings.positive[language];
}
```

---

## 7. Ordinea Implementării

1. **Pas 1:** Adaug funcțiile helper în `mind-coach-clusters.ts`
2. **Pas 2:** Actualizez `useMindCoach.ts` cu:
   - Import `getClusterForEmotion`
   - Trimitere cluster la edge function
   - Parsare robustă pentru tool calls
3. **Pas 3:** Actualizez `MindCoachChat.tsx` cu welcome message dinamic
4. **Pas 4:** Actualizez edge function cu prompturi complete
5. **Pas 5:** Redeploy edge function
6. **Pas 6:** Testare end-to-end

---

## 8. Fișiere Afectate

| Fișier | Modificări |
|--------|------------|
| `src/lib/mind-coach-clusters.ts` | +2 funcții helper |
| `src/hooks/useMindCoach.ts` | Import, cluster param, robust tool parsing |
| `src/components/mind-coach/MindCoachChat.tsx` | Welcome message dinamic |
| `supabase/functions/mind-coach/index.ts` | Prompturi complete sincronizate |

