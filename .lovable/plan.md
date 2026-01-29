
# AI Mind Coach Implementation Plan
## Tony Robbins Transformation System - Exact Prompts & Flow

---

## 1. Executive Summary

Based on the brainstorming document with Tony Robbins, this plan implements a **unified AI Mind Coach** that replaces most STACK modules. The Mind Coach will be integrated into the Warrior Routine as the first step, following the exact Tony Robbins transformation methodology.

**Key Quote from Document (Day 6):**
> "This isn't about suppressing emotions. It's about transforming them into fuel. You don't avoid resistance. You learn how to move through it. That's how discipline is built. That's how momentum is protected."

---

## 2. The Tony Robbins Transformation Flow (EXACT from Document)

The Mind Coach STACK follows this **5-phase pattern** as described in the session:

```text
Phase 1: IDENTIFICATION
   "Cum te simti acum?" / "Ce nume dai acestei stari?"
              |
              v
Phase 2: INVESTIGATION  
   "Ce s-a intamplat?" / "Care e povestea din spatele emotiei?"
              |
              v
Phase 3: CLARIFICATION
   "E aceasta poveste 100% adevarata?" / "Ce ai dori de fapt?"
              |
              v
Phase 4: TRANSFORMATION
   "Ce poti controla in aceasta situatie?" / "Ce lectie primesti?"
              |
              v
Phase 5: ACTION
   "Cu ce energie vrei sa continui ziua?" / "Ce actiune concreta faci ACUM?"
```

---

## 3. Exact System Prompt (Tony Robbins Style)

From the document, here's the exact prompt structure:

```text
Tu ești Mind Coach-ul personal al utilizatorului - un ghid care transformă 
emoțiile negative în putere și acțiune.

CONTEXTUL ACTUAL:
- Utilizatorul se simte: {emotion_label} {emoji}
- Intensitatea: {intensity}/10

STILUL TĂU (Tony Robbins):
- Validezi ÎNTÂI emoția - "Înțeleg perfect ce simți... {emotion} la intensitate 
  {intensity} este real și valid"
- Nu judeci NICIODATĂ
- Ajuți să identifice FAPTELE vs POVEȘTILE pe care și le spune
- Ghidezi spre ce POATE controla
- Transformi "problema" în "oportunitate de creștere"
- La final, ajuți să aleagă o STARE de putere pentru zi

STRUCTURA CONVERSAȚIEI (max 10-12 schimburi):

1. IDENTIFICARE (1-2 schimburi)
   - "Cum te simți acum?" / "Ce nume dai acestei stări?"
   
2. INVESTIGARE (2-3 schimburi)
   - "Ce s-a întâmplat?" / "Care e povestea din spatele emoției?"
   
3. CLARIFICARE (2-3 schimburi)
   - "E această poveste 100% adevărată?"
   - "Ce ai dori de fapt să se întâmple?"
   
4. TRANSFORMARE (2-3 schimburi)
   - "Ce poți controla în această situație?"
   - "Ce lecție primești din asta?"
   
5. ACȚIUNE (1-2 schimburi)
   - "Cu ce energie vrei să continui ziua?"
   - "Ce acțiune concretă faci ACUM?"

REGULI IMPORTANTE:
- Răspunsuri SCURTE și la obiect (2-4 propoziții)
- Pune O SINGURĂ întrebare la un moment dat
- Celebrează fiecare progres făcut
- Folosește emoji-uri moderat pentru a crea căldură
- Când utilizatorul a găsit claritatea, întreabă: "Cu ce energie vrei să 
  începi această zi?"
- La final, rezumă transformarea și felicită-l
- Întreabă dacă vrea să adauge acțiunea în HIT List

EXEMPLU DE START:
"{emoji} {emotion_label} la {intensity}/10... Înțeleg, și apreciez că ești 
onest cu tine însuți chiar de dimineață. 

Spune-mi, ce s-a întâmplat care te face să te simți așa?"

Răspunde ÎNTOTDEAUNA în română.
```

---

## 4. Emotion Categories (Extended for Tony Robbins Method)

From the document, the Mind Coach handles specific emotional states:

| Emotion | Category | Transformation Goal |
|---------|----------|---------------------|
| Angry (Supărat) | Negative | Transform to determination |
| Sad (Trist) | Negative | Transform to gratitude |
| Anxious (Anxios) | Negative | Transform to excitement |
| Stressed (Stresat) | Negative | Transform to focused calm |
| Overwhelmed | Negative | Transform to clarity |
| Procrastinating | Negative | Transform to momentum |
| "Not good enough" | Negative | Transform to confidence |
| Happy (Fericit) | Positive | Amplify |
| Calm (Calm) | Positive | Maintain |
| Excited (Entuziasmat) | Positive | Channel |

---

## 5. Technical Implementation

### 5.1 New Edge Function: `supabase/functions/mind-coach/index.ts`

**Model:** `google/gemini-2.5-pro` (as requested - for precision and complex reasoning)

**Features:**
- Fetches user context (missions, weekly plan, breakthrough history)
- Uses tool calling for actions: `add_to_hit_list`, `add_habit`, `log_breakthrough`
- Tracks conversation phase (1-5) to guide flow
- Saves session to `stack_sessions` table

**Tool Definitions:**
```javascript
tools: [
  {
    type: "function",
    function: {
      name: "add_to_hit_list",
      description: "Add an action to the user's HIT list for today",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string", description: "The action to add" },
          priority: { type: "string", enum: ["urgent", "important", "normal"] }
        },
        required: ["task"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "add_habit",
      description: "Suggest adding a new daily habit",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: ["body", "being", "balance", "business"] }
        },
        required: ["name", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "complete_transformation",
      description: "Mark the transformation session as complete",
      parameters: {
        type: "object",
        properties: {
          emotion_before: { type: "string" },
          emotion_after: { type: "string" },
          breakthrough_insight: { type: "string" },
          action_committed: { type: "string" }
        },
        required: ["emotion_before", "emotion_after"]
      }
    }
  }
]
```

### 5.2 New Database Table: `breakthrough_logs`

```sql
CREATE TABLE IF NOT EXISTS breakthrough_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emotion_before TEXT NOT NULL,
  intensity_before INTEGER CHECK (intensity_before BETWEEN 1 AND 10),
  emotion_after TEXT,
  intensity_after INTEGER CHECK (intensity_after BETWEEN 1 AND 10),
  story_identified TEXT,
  transformation_insight TEXT,
  action_committed TEXT,
  action_added_to_hit_list BOOLEAN DEFAULT FALSE,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE breakthrough_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own breakthroughs"
  ON breakthrough_logs
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_breakthrough_logs_user_date 
  ON breakthrough_logs(user_id, created_at DESC);
```

### 5.3 New Component: `src/components/mind-coach/MindCoachChat.tsx`

**Key Features:**
- Initial emotion picker with extended options (from Tony's list)
- Intensity slider (1-10)
- Streaming chat interface
- Phase indicator (showing progress through 5 phases)
- Action buttons when AI suggests adding to HIT list
- Breakthrough celebration with confetti on completion

**Props Interface:**
```typescript
interface MindCoachChatProps {
  initialEmotion?: Emotion;
  intensity?: number;
  onComplete?: (breakthrough: BreakthroughData) => void;
  onAddToHitList?: (task: string) => void;
  onAddHabit?: (name: string, category: string) => void;
  embedded?: boolean; // For Warrior Routine integration
}

interface BreakthroughData {
  emotionBefore: string;
  intensityBefore: number;
  emotionAfter: string;
  intensityAfter: number;
  insight: string;
  actionCommitted: string;
}
```

### 5.4 Warrior Routine Integration

Modify `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx`:

**Current Flow:**
1. Emotion picker
2. Stack selection (3 fixed options)

**New Flow:**
1. Emotion picker (extended)
2. Intensity check
3. IF negative/low intensity: **Offer Mind Coach** (primary) or quick stack
4. Mind Coach runs inline with full Tony Robbins flow
5. On completion: log breakthrough, offer to add action to HIT list

### 5.5 Challenge Day 6 Update

From the document script:

**Video Script (Day 6):**
> "Welcome to Day 6. Today is where accountability and mindset come together to keep you moving — even on the days you don't feel like it.
>
> The second tool is your Mind Coach — the STACK. This is the tool you use when:
> - you feel stuck
> - you start procrastinating  
> - you feel angry, sad, overwhelmed, or 'not good enough'
>
> The STACK helps you pause and reset. It guides you to:
> - identify what you're feeling
> - uncover the story behind that feeling
> - understand how you ended up here
> - reconnect with what you truly want and why
> - and choose a powerful next action
>
> This isn't about suppressing emotions. It's about transforming them into fuel."

**Exercises for Day 6:**
1. **Deschide Mind Coach** - Link to `/mind-coach` or inline widget
2. **Postează Breakthrough-ul** - Share in comments

---

## 6. Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/mind-coach/index.ts` | Edge function with Tony Robbins prompts |
| `src/pages/MindCoach.tsx` | Standalone landing page |
| `src/components/mind-coach/MindCoachChat.tsx` | Main chat interface |
| `src/components/mind-coach/ExtendedEmotionPicker.tsx` | Extended emotions (10+) |
| `src/components/mind-coach/PhaseIndicator.tsx` | Shows current transformation phase |
| `src/components/mind-coach/BreakthroughCelebration.tsx` | Completion animation |
| `src/hooks/useMindCoach.ts` | State management & API calls |

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx` | Replace stack selection with Mind Coach primary option |
| `src/pages/ChallengeDay.tsx` | Update Day 6 exercises |
| `src/components/SideMenu.tsx` | Add Mind Coach link |
| `src/App.tsx` | Add `/mind-coach` route |
| `supabase/functions/accountability-coach/index.ts` | Fetch breakthrough context |
| `supabase/config.toml` | Add mind-coach function |

---

## 8. Stacks to Keep vs Replace

**KEEP:**
- `AngerStack` (Alchimia Furiei) - Specialized deep 42-question process

**REPLACE with Mind Coach:**
- `AiLiveCoaching` - General coaching
- `DailyMasterStack` - Mind Coach becomes opening step
- `EmotionalTransformStep` - Replaced by Mind Coach
- `IntrospectionStack` - Replaced by investigation phase

---

## 9. Accountability Coach Sync

From the document:
> "Your Accountability Coach knows your entire journey. It knows:
> - if you've started your Warrior Routine
> - if you've created your Domino Door  
> - and what your next logical step is"

**Implementation:**
- Accountability Coach fetches latest `breakthrough_logs`
- If user completed transformation today, celebrates it
- If user hasn't done Mind Coach when feeling negative, suggests it
- Shared context between both coaches

---

## 10. Priority Implementation Order

1. **Phase 1** - Create `mind-coach` edge function with exact Tony Robbins prompts
2. **Phase 2** - Create `MindCoachChat` component with streaming
3. **Phase 3** - Create `breakthrough_logs` table and RLS
4. **Phase 4** - Integrate into `EmotionalCheckUnifiedStep`
5. **Phase 5** - Update Challenge Day 6
6. **Phase 6** - Create standalone `/mind-coach` page
7. **Phase 7** - Sync with Accountability Coach

---

## 11. Technical Notes

- **Model:** `google/gemini-2.5-pro` (requested for complex emotional reasoning)
- **Streaming:** Use SSE for real-time token display
- **Session Storage:** Save to `stack_sessions` with `stack_type = 'mind-coach'`
- **Conversation Limit:** Max 12 exchanges before suggesting action
- **Voice Mode:** Support via existing `useVoiceInput` hook
- **Mobile:** Full-screen chat experience

---

## 12. Key Differentiators from Current STACK

| Current STACK | New Mind Coach |
|---------------|----------------|
| Fixed questions | Dynamic AI conversation |
| Generic coaching | Tony Robbins methodology |
| No action tracking | Adds to HIT List automatically |
| No breakthrough logging | Saves transformation data |
| Separate from routine | Integrated first step |
| No phase indication | Visual 5-phase progress |
