
# Plan: Rezolvare Mind Coach - Finalizare Chat + Salvare HIT List + Library

## Probleme Identificate

### 1. Task-ul NU se salvează în HIT List
**Cauză:** `EmotionalCheckUnifiedStep.tsx` NU pasează callback-ul `onAddToHitList` către `MindCoachChat`.

```typescript
// EmotionalCheckUnifiedStep.tsx - linia 99
<MindCoachChat
  initialEmotion={emotion}
  embedded={true}
  showNavigationButtons={true}
  onContinueRoutine={handleContinueRoutine}
  onNewSession={handleNewSession}
  onComplete={handleMindCoachComplete}
  onBack={() => setPhase('emotion')}
  // LIPSEȘTE: onAddToHitList={???}
/>
```

### 2. Chatul rămâne vizibil după "da"/"nu"
**Cauză:** După ce AI-ul primește răspunsul și apelează `complete_transformation`, chatul rămâne deschis cu toate mesajele. Utilizatorul vrea să vadă doar butoanele.

### 3. Week key-ul este calculat greșit
**Cauză:** În `MindCoach.tsx`, calculul week key-ului nu corespunde cu cel din Domino Door:
```typescript
// Greșit:
const weekKey = `door-week-${now.getFullYear()}-${String(Math.ceil((now.getDate() + now.getDay()) / 7)).padStart(2, '0')}`;

// Corect (din edge function):
// Folosește getISOWeek sau logica Monday-based
```

### 4. Conversațiile nu sunt salvate
**Cauză:** Mind Coach nu salvează conversațiile în `stack_library` sau `stack_sessions` pentru a putea fi revizualizate ulterior.

---

## Soluții Propuse

### A. Adaug `onAddToHitList` în EmotionalCheckUnifiedStep

Voi adăuga un callback care salvează task-ul direct în baza de date:

```typescript
// În EmotionalCheckUnifiedStep.tsx
const handleAddToHitList = async (task: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculez week key corect (conform logicii Door)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    const weekNum = getISOWeek(weekStart);
    const year = getYear(weekStart);
    const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;

    // Day abbreviation
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const todayAbbrev = days[now.getDay()];

    await supabase.from('user_tasks').insert({
      user_id: user.id,
      title: task,
      task_type: 'hit',
      list_type: 'hit',
      day_of_week: todayAbbrev,
      week_key: weekKey,
      priority: 1,
      completed: false,
    });
  } catch (error) {
    console.error('Error adding to HIT list:', error);
  }
};

// Apoi pasez către MindCoachChat
<MindCoachChat
  onAddToHitList={handleAddToHitList}
  // ... restul props
/>
```

### B. Ascund chatul după finalizare

Adaug o stare `showChatMessages` care se setează pe `false` după `isComplete`:

```typescript
// În MindCoachChat.tsx
const [showChatMessages, setShowChatMessages] = useState(true);

// Când isComplete devine true, ascund mesajele
useEffect(() => {
  if (isComplete) {
    setShowChatMessages(false);
  }
}, [isComplete]);

// În render, condiționez afișarea mesajelor
{showChatMessages && (
  <ScrollArea className="flex-1 p-4">
    {/* Messages */}
  </ScrollArea>
)}

{/* Când isComplete și embedded, afișez doar butoanele */}
{embedded && isComplete && !showChatMessages && (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center">
      <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3>Transformare Completă!</h3>
      <p className="text-muted-foreground">
        Alege cum vrei să continui...
      </p>
    </div>
  </div>
)}
```

### C. Salvez conversația în Library

Adaug salvare în `stack_library` la finalizarea sesiunii:

```typescript
// În useMindCoach.ts - în processToolCalls, la complete_transformation
case 'complete_transformation':
  // ... cod existent ...
  
  // Salvez conversația în stack_library
  await saveConversationToLibrary(messages, breakthrough);
  break;

// Funcție nouă
const saveConversationToLibrary = async (msgs: Message[], breakthrough: BreakthroughData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('stack_library').insert({
      user_id: user.id,
      title: `Mind Coach - ${breakthrough.emotionBefore} → ${breakthrough.emotionAfter}`,
      type: 'mind-coach',
      content: {
        messages: msgs,
        breakthrough,
        savedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving to library:', error);
  }
};
```

### D. Corectez week key în MindCoach.tsx

```typescript
// Înlocuiesc calculul greșit cu unul corect
import { getISOWeek, getYear, startOfWeek } from 'date-fns';

const handleAddToHitList = async (task: string) => {
  // ...
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekNum = getISOWeek(weekStart);
  const year = getYear(weekStart);
  const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
  // ...
};
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx` | Adaug `handleAddToHitList` și pasez către MindCoachChat |
| `src/components/mind-coach/MindCoachChat.tsx` | Ascund mesajele după finalizare, afișez doar butoanele |
| `src/hooks/useMindCoach.ts` | Adaug salvare conversație în `stack_library` |
| `src/pages/MindCoach.tsx` | Corectez calculul week key |

---

## Detalii Tehnice

### 1. EmotionalCheckUnifiedStep.tsx

**Imports noi:**
```typescript
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getYear, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
```

**Handler nou:**
```typescript
const handleAddToHitList = async (task: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekNum = getISOWeek(weekStart);
    const year = getYear(weekStart);
    const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
    
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const todayAbbrev = days[now.getDay()];

    await supabase.from('user_tasks').insert({
      user_id: user.id,
      title: task,
      task_type: 'hit',
      list_type: 'hit',
      day_of_week: todayAbbrev,
      week_key: weekKey,
      priority: 1,
      completed: false,
    });

    toast.success('Acțiune adăugată în HIT List! 🎯');
  } catch (error) {
    console.error('Error adding to HIT list:', error);
    toast.error('Eroare la adăugarea în HIT List');
  }
};
```

**Pasare către MindCoachChat (linia ~99):**
```typescript
<MindCoachChat
  initialEmotion={emotion}
  initialIntensity={intensity}
  embedded={true}
  showNavigationButtons={true}
  onContinueRoutine={handleContinueRoutine}
  onNewSession={handleNewSession}
  onComplete={handleMindCoachComplete}
  onAddToHitList={handleAddToHitList}  // ADĂUGAT
  onBack={() => setPhase('emotion')}
/>
```

### 2. MindCoachChat.tsx

**Stare nouă:**
```typescript
const [showChatContent, setShowChatContent] = useState(true);
```

**Effect pentru ascundere:**
```typescript
useEffect(() => {
  if (isComplete && embedded) {
    // Ascundem chatul după ce transformarea e completă
    setShowChatContent(false);
  }
}, [isComplete, embedded]);
```

**UI condiționat - în secțiunea chat (în loc de ScrollArea):**
```typescript
{/* Messages area - hide when complete in embedded mode */}
{showChatContent ? (
  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
    {/* ... mesajele existente ... */}
  </ScrollArea>
) : (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center space-y-3">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Transformare Completă!
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {breakthroughData?.emotionBefore} → {breakthroughData?.emotionAfter}
      </p>
    </div>
  </div>
)}
```

### 3. useMindCoach.ts

**Funcție nouă pentru salvare:**
```typescript
const saveConversationToLibrary = async (msgs: Message[], breakthrough: BreakthroughData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('stack_library').insert({
      user_id: user.id,
      title: `Mind Coach - ${breakthrough.emotionBefore} → ${breakthrough.emotionAfter}`,
      type: 'mind-coach',
      content: {
        messages: msgs.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString()
        })),
        breakthrough,
        savedAt: new Date().toISOString()
      }
    });
    
    console.log('Conversation saved to library');
  } catch (error) {
    console.error('Error saving conversation to library:', error);
  }
};
```

**În processToolCalls, la complete_transformation:**
```typescript
case 'complete_transformation':
  // ... cod existent până la setIsComplete(true) ...
  
  // Salvăm conversația în library
  await saveConversationToLibrary(
    [...messages, { role: 'assistant', content: '' }],  // Include all messages
    breakthrough
  );
  
  // Save to database (existent)
  await saveBreakthrough(breakthrough);
  
  if (options.onComplete) {
    options.onComplete(breakthrough);
  }
  break;
```

### 4. MindCoach.tsx

**Import corectat:**
```typescript
import { getISOWeek, getYear, startOfWeek } from 'date-fns';
```

**Calculul week key corectat:**
```typescript
const handleAddToHitList = async (task: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculez week key corect
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekNum = getISOWeek(weekStart);
    const year = getYear(weekStart);
    const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
    
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const dayOfWeek = days[now.getDay()];

    await supabase.from('user_tasks').insert({
      user_id: user.id,
      title: task,
      task_type: 'hit',
      list_type: 'hit',
      day_of_week: dayOfWeek,
      week_key: weekKey,
      priority: 1,
      completed: false,
    });

    toast.success('Acțiune adăugată în HIT List! 🎯');
  } catch (error) {
    console.error('Error adding to HIT list:', error);
    toast.error('Eroare la adăugarea în HIT List');
  }
};
```

---

## Flow Final

1. Utilizatorul parcurge sesiunea Mind Coach
2. AI întreabă: "Vrei să adaug în HIT List?"
3. Utilizatorul răspunde "da" sau "nu"
4. AI apelează `add_to_hit_list` (dacă da) apoi `complete_transformation`
5. `processToolCalls` execută:
   - `add_to_hit_list` → salvează în `user_tasks` cu week key corect
   - `complete_transformation` → salvează în `breakthrough_logs` + `stack_library`
6. `isComplete = true` → chatul dispare, rămân doar butoanele
7. Utilizatorul alege "Altă Sesiune" sau "Continuă Rutina"

---

## Testing

1. **HIT List:** Verifică în Door → Sarcini că apare task-ul pentru ziua curentă
2. **Chat ascuns:** După "da"/"nu", chatul dispare, rămân doar butoanele
3. **Library:** Verifică în stack_library (sau Tools dacă există UI) că apare conversația
4. **Week key:** Verifică că week_key corespunde săptămânii curente (ex: `door-week-2026-05`)
