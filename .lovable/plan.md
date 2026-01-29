
# Plan: UX Îmbunătățit pentru Voice + Context AI Complet

## Rezumat

Voi implementa două îmbunătățiri:

1. **SpeakButton stabil** - fără pâlpâire, stare clară "apăsat"
2. **Context AI extins** - taskurile zilei + mai multe informații despre utilizator

---

## Partea 1: SpeakButton Fără Pâlpâire

### Problemă Identificată
În `SpeakButton.tsx`, linia 52:
```typescript
isRecording && "bg-destructive hover:bg-destructive animate-pulse ring-2 ring-destructive/50"
```

`animate-pulse` cauzează pâlpâirea. Butonul ar trebui să rămână SOLID când e apăsat.

### Soluție
Voi înlocui animația cu o stare vizuală fermă:
- Background solid roșu (fără pulsare)
- Efect de "apăsat" (scale-95, shadow-inner)
- Ring colorat pentru vizibilitate
- Indicator recording separat (pulsează doar el)

### Noul Design SpeakButton

```text
┌─────────────────────────────────────┐
│  NORMAL (neapăsat)                   │
│  ┌─────────────────────────────┐    │
│  │ 🎤 Apasă și vorbește        │    │
│  │ bg-outline, normal state    │    │
│  └─────────────────────────────┘    │
│                                      │
│  RECORDING (apăsat)                  │
│  ┌─────────────────────────────┐    │
│  │ 🎤 Vorbesc... ●(pulsează)   │    │
│  │ bg-red SOLID, scale-95     │    │
│  │ ring-4 glow, pressed effect │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Cod Propus

```typescript
className={cn(
  "relative flex items-center gap-2 transition-all select-none touch-none",
  isRecording && [
    "bg-red-600 hover:bg-red-600 text-white",
    "scale-[0.98] shadow-inner",           // Efect "apăsat"
    "ring-4 ring-red-500/50 ring-offset-2", // Glow vizibil
    "border-red-700"
  ].join(' '),
  className
)}
```

Indicatorul ● (ping) rămâne, dar butonul NU pâlpâie.

---

## Partea 2: Context AI Extins pentru Mind Coach

### Ce Are Acum
Din analiza edge function (`mind-coach/index.ts`):
- ✅ Missions (annual, quarterly, monthly)
- ✅ Weekly planning (domino_title, key_points)
- ✅ Today's breakthroughs

### Ce Îi Lipsește
- ❌ **Taskurile de azi** (user_tasks pentru ziua curentă)
- ❌ **Obiceiuri active** (daily_habits configurate)
- ❌ **Key Points specifice** (4 chei ale săptămânii)

### Adăugări în Edge Function

Voi adăuga un query pentru taskurile de azi:

```typescript
// 4. Fetch today's tasks (HIT List + DO List)
const todayAbbrev = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'][new Date().getDay()];
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
const weekKey = weekStart.toISOString().split('T')[0];

const { data: todayTasks } = await supabaseClient
  .from('user_tasks')
  .select('title, completed, task_type, day_of_week')
  .eq('user_id', user.id)
  .eq('week_key', weekKey)
  .in('task_type', ['hit', 'do'])
  .order('position', { ascending: true });
```

### Context String Actualizat

```typescript
// Adaug în userContext:
if (todayTasks && todayTasks.length > 0) {
  const todayOnly = todayTasks.filter(t => 
    !t.day_of_week || t.day_of_week.toLowerCase() === todayAbbrev.toLowerCase()
  );
  
  const completed = todayOnly.filter(t => t.completed);
  const remaining = todayOnly.filter(t => !t.completed);
  
  userContext += '\n\n📋 SARCINILE DE AZI:\n';
  userContext += `Completate: ${completed.length}/${todayOnly.length}\n`;
  
  if (remaining.length > 0) {
    userContext += '\nDe făcut:\n';
    remaining.forEach(t => {
      userContext += `• ${t.title}\n`;
    });
  }
}

if (weeklyPlan && weeklyPlan.key_points) {
  userContext += '\n\n🔑 CHEILE SĂPTĂMÂNII:\n';
  weeklyPlan.key_points.forEach((kp: any, i: number) => {
    userContext += `${i + 1}. ${kp.title || kp} ${kp.completed ? '✓' : ''}\n`;
  });
}
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/mind-coach/SpeakButton.tsx` | Înlocuiesc `animate-pulse` cu stare solidă "apăsat" |
| `supabase/functions/mind-coach/index.ts` | Adaug query pentru `user_tasks` + context extins |

---

## Detalii Tehnice

### 1. SpeakButton.tsx - Modificări

**Înainte:**
```typescript
isRecording && "bg-destructive hover:bg-destructive animate-pulse ring-2 ring-destructive/50"
```

**După:**
```typescript
isRecording && cn(
  "bg-red-600 hover:bg-red-600 text-white border-red-700",
  "scale-[0.98] shadow-inner",  // Efect apăsat
  "ring-4 ring-red-500/50"      // Glow fără animație
)
```

### 2. Edge Function - Query Adăugat

După linia 91 (după `todayBreakthroughs`):

```typescript
// 4. Fetch today's tasks
const dayNames = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
const todayAbbrev = dayNames[new Date().getDay()];
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
const weekKey = weekStart.toISOString().split('T')[0];

const { data: todayTasks } = await supabaseClient
  .from('user_tasks')
  .select('title, completed, task_type, day_of_week')
  .eq('user_id', user.id)
  .eq('week_key', weekKey)
  .in('task_type', ['hit', 'do'])
  .order('position', { ascending: true });
```

### 3. User Context - Adăugări

După linia 126 (după breakthroughs context):

```typescript
// Add today's tasks context
if (todayTasks && todayTasks.length > 0) {
  const todayOnly = todayTasks.filter((t: any) => 
    !t.day_of_week || t.day_of_week.toLowerCase() === todayAbbrev.toLowerCase()
  );
  
  if (todayOnly.length > 0) {
    const completed = todayOnly.filter((t: any) => t.completed);
    const remaining = todayOnly.filter((t: any) => !t.completed);
    
    userContext += '\n\n📋 SARCINILE DE AZI:\n';
    userContext += `Progres: ${completed.length}/${todayOnly.length} completate\n`;
    
    if (remaining.length > 0) {
      userContext += '\nDe făcut:\n';
      remaining.slice(0, 5).forEach((t: any) => {
        userContext += `• ${t.title}\n`;
      });
      if (remaining.length > 5) {
        userContext += `... și încă ${remaining.length - 5} taskuri\n`;
      }
    }
  }
}

// Add weekly keys context  
if (weeklyPlan && weeklyPlan.key_points && Array.isArray(weeklyPlan.key_points)) {
  userContext += '\n\n🔑 CHEILE SĂPTĂMÂNII:\n';
  weeklyPlan.key_points.slice(0, 4).forEach((kp: any, i: number) => {
    const title = typeof kp === 'string' ? kp : kp.title || kp.text || '';
    const completed = typeof kp === 'object' && kp.completed;
    userContext += `${i + 1}. ${title} ${completed ? '✓' : ''}\n`;
  });
}
```

---

## Ce Va Ști AI-ul Acum

**Înainte:**
- Obiective anuale/90 zile
- Focus săptămânal (domino_title)
- Transformări de azi

**După (+adăugări):**
- Obiective anuale/90 zile
- Focus săptămânal (domino_title)
- **📋 SARCINILE DE AZI:** Lista de taskuri și progresul
- **🔑 CHEILE SĂPTĂMÂNII:** Cele 4 puncte cheie din Domino Door
- Transformări de azi

---

## Testing

1. **SpeakButton:**
   - Ține apăsat → butonul rămâne solid roșu (nu pâlpâie)
   - Indicatorul ● continuă să pulseze (vizibilitate)
   - La eliberare → revine la normal

2. **Context AI:**
   - Întreabă AI-ul "Ce taskuri am de făcut azi?" → trebuie să le enumere
   - Întreabă "Care sunt cheile mele pentru săptămâna asta?" → le citește

---

## Impact pe Funcționalitate Existentă

- **SpeakButton:** Doar vizual - logica rămâne identică
- **Edge Function:** Doar adaug context - nu modific logica existentă
- **Fără breaking changes** - totul e aditiv
