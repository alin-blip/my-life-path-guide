

# Audit Complet Lansare: Domino Door - Idei și Sarcini

## Rezumat Executiv

Am identificat **3 probleme majore** care împiedică funcționarea corectă a sistemului Idei → Sarcini:

---

## Problemele Găsite

### 1. DOUĂ SISTEME DE DATE SEPARATE (Problema Principală)

Componenta `HotList.tsx` (Idei) folosește **tabelul `ideas_bank`** via `ideasBankService`, în timp ce restul sistemului (drag-drop, `useDoorLists`, `TaskList`) folosește **tabelul `user_tasks`** via `doorUserTasksService`.

```text
┌────────────────────────────────────────────────────────────────────┐
│                    ARHITECTURA ACTUALĂ (RUPTĂ)                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   HotList.tsx (Idei)          TaskList.tsx (Sarcini)              │
│         ↓                            ↓                            │
│   ideasBankService             doorUserTasksService               │
│         ↓                            ↓                            │
│   ideas_bank table             user_tasks table                   │
│                                                                    │
│   ❌ ACESTE DOUĂ NU COMUNICĂ!                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Dovadă din baza de date:**
- `ideas_bank`: 4 idei (inclusiv "adaugare fact map in ziua 1 challenge")
- `user_tasks` cu `list_type='hot'`: 10 task-uri cu titluri simple ("1", "2", "3", "4")

### 2. CALLBACK-URI LIPSĂ pentru Mutare Idei

În toate componentele părinte (`WeeklyTab.tsx`, `SimplifiedDoorContent.tsx`, `WeeklySection.tsx`), componenta `<HotList />` este randată **fără callback-uri**:

```tsx
// ACTUAL (GREȘIT):
<HotList isMobile={isMobile} />

// NECESAR:
<HotList 
  isMobile={isMobile}
  onMoveToHit={(idea) => handleMoveIdeaToHit(idea)}  // ← LIPSĂ
  onMoveToDo={(idea) => handleMoveIdeaToDo(idea)}   // ← LIPSĂ
/>
```

**Consecință:** Când apesi pe iconița Target (🎯) din Idei pentru a muta în Sarcini, funcția internă `handleMoveToHit` din HotList apelează `onMoveToHit?.()`, dar callback-ul este `undefined`, deci nu se întâmplă nimic în `user_tasks`.

### 3. DRAG & DROP ÎNTRE Idei → Sarcini NU FUNCȚIONEAZĂ

Sistemul actual de drag-drop (`useDoorDrag.tsx`) este proiectat pentru `HotListItem` din vechiul sistem (`user_tasks` cu `task_type='hot'`).

Când tragi o idee din `HotList` (care folosește `@hello-pangea/dnd` intern), aceasta NU setează `draggedItem` în contextul `useDoorDrag`, deci când faci drop pe `TaskList`, nu se întâmplă nimic.

```text
DragDropContext din HotList (hello-pangea)
          ↓
  NU COMUNICĂ CU
          ↓
handleDragStart/handleDrop din useDoorDrag (evenimente native)
```

---

## Problemele Secundare

### 4. "Top 4 Priorități" merge în Sarcini, NU în Idei

Când adaugi 4 priorități prin butonul din `EmptyTaskList.tsx`, acestea se salvează direct în `user_tasks` cu `task_type='hit'` pentru ziua/săptămâna curentă.

**NU există nicio "săgeată înapoi"** care să ducă task-urile în Idei. Butoanele de navigare (←/→) din header schimbă săptămâna, nu mută task-uri între secțiuni.

### 5. Duplicate în `user_tasks`

Am găsit task-uri duplicate în baza de date:
- Multiple înregistrări cu titluri "1", "2", "3", "4" (teste)
- Task-uri cu `week_key=''` (string gol) care nu apar în UI

---

## Planul de Reparație

### Pasul 1: Unificarea Arhitecturii (Decizie Necesară)

Există două opțiuni:

| Opțiune | Descriere | Pro | Contra |
|---------|-----------|-----|--------|
| **A: Migrare la `ideas_bank`** | HotList devine sursa principală; `user_tasks` doar pentru HIT/DO | Sistemul de clasificare Eisenhower rămâne | Necesită rescrierea drag-drop |
| **B: Migrare la `user_tasks`** | Revenire la vechiul sistem, HotList folosește `doorUserTasksService` | Drag-drop funcționează nativ | Pierdem clasificarea Eisenhower |

**Recomandare: Opțiunea A** - păstrăm `ideas_bank` pentru Idei, dar adăugăm funcții de transfer către `user_tasks` când ideea este mutată în Sarcini.

### Pasul 2: Implementare Callback-uri în Componente Părinte

**Fișiere de modificat:**
- `src/components/door/tabs/WeeklyTab.tsx`
- `src/components/door/SimplifiedDoorContent.tsx`
- `src/components/door/WeeklySection.tsx`

**Cod de adăugat:**

```tsx
// Funcție nouă pentru mutare idee în Sarcini
const handleMoveIdeaToHit = async (idea: IdeaBankItem) => {
  // 1. Adaugă în user_tasks
  await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
    id: idea.id,
    text: idea.text,
    category: 'hit',
    priority: idea.priority === 4 ? 'urgent-important' :
              idea.priority === 3 ? 'important' :
              idea.priority === 2 ? 'urgent' : 'none',
    day: activeDay
  });
  
  // 2. Refresh listele
  refreshLists();
  
  toast({
    title: "✅ Idee mutată în Sarcini",
    description: `"${idea.text}" adăugată pentru ${activeDay}`,
  });
};

// În randare:
<HotList 
  isMobile={isMobile}
  onMoveToHit={handleMoveIdeaToHit}
  onMoveToDo={(idea) => handleMoveIdeaToHit(idea)} // Sau DO logic
/>
```

### Pasul 3: Implementare Cross-Library Drag & Drop

Pentru a permite tragerea din `HotList` (hello-pangea) către `TaskList`:

1. Adăugăm un wrapper de drag nativ pe fiecare idee
2. Setăm `dataTransfer` cu informații serializate ale ideii
3. `TaskList.handleDrop` citește aceste date și apelează `doorUserTasksService`

**Modificări necesare în `HotList.tsx`:**

```tsx
// Pe fiecare item din lista de idei, adăugăm:
onDragStart={(e) => {
  e.dataTransfer.setData('application/json', JSON.stringify({
    type: 'idea-bank-item',
    id: idea.id,
    text: idea.text,
    priority: idea.priority
  }));
  e.dataTransfer.effectAllowed = 'copyMove';
}}
draggable={true}
```

**Modificări necesare în `useDoorDrag.tsx`:**

```tsx
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  
  // Verifică dacă vine din Ideas Bank
  const jsonData = e.dataTransfer.getData('application/json');
  if (jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.type === 'idea-bank-item') {
        // Adaugă ideea în user_tasks
        await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
          id: data.id,
          text: data.text,
          category: activeList,
          priority: mapPriority(data.priority),
          day: activeDay
        });
        return;
      }
    } catch {}
  }
  
  // ... restul logicii existente
};
```

### Pasul 4: Curățare Date Invalide

Rulăm un query pentru a elimina task-urile cu `week_key` gol sau invalid:

```sql
-- Șterge task-urile cu week_key gol sau invalid
DELETE FROM user_tasks 
WHERE user_id = '74f5b904-95ba-4aaa-af7a-bee4c7ee6a98'
  AND (week_key IS NULL OR week_key = '' OR week_key NOT LIKE 'door-week-%')
  AND task_type IN ('hit', 'do');
```

### Pasul 5: Adăugare Buton "Mută în Idei" în TaskList

Pentru a permite mutarea înapoi din Sarcini în Idei:

```tsx
// În TaskItem.tsx, adăugăm un nou callback:
onMoveToIdeas={(taskId) => {
  const task = hitList.find(t => t.id === taskId);
  if (task) {
    // 1. Adaugă în ideas_bank
    await ideasBankService.addIdea(task.text, 'work', 0);
    // 2. Șterge din user_tasks
    // 3. Refresh
  }
}}
```

---

## Fișiere Afectate

| Fișier | Acțiune |
|--------|---------|
| `src/components/door/tabs/WeeklyTab.tsx` | Adaugă `onMoveToHit`/`onMoveToDo` la HotList |
| `src/components/door/SimplifiedDoorContent.tsx` | Idem |
| `src/components/door/WeeklySection.tsx` | Idem |
| `src/components/door/HotList.tsx` | Adaugă `draggable` și `onDragStart` nativ |
| `src/hooks/useDoorDrag.tsx` | Extinde `handleDrop` pentru `idea-bank-item` |
| `src/context/DoorContext.tsx` | Expune funcția `moveIdeaToTasks` |

---

## Rezultat Așteptat

După implementare:

1. ✅ Ideile din secțiunea "Idei" pot fi trase și lăsate în "Sarcini"
2. ✅ Click pe iconița 🎯 mută ideea în lista de sarcini pentru ziua activă
3. ✅ "Top 4 Priorități" adaugă task-uri în Sarcini (nu în Idei) - acesta este comportamentul corect
4. ✅ Toate task-urile au `week_key` valid
5. ✅ Nu mai există duplicare date între cele două tabele

---

## Confirmare Necesară

Înainte de implementare, te rog confirmă:
- **Opțiunea A** (păstrăm `ideas_bank` + adăugăm integrare) este acceptabilă?
- "Top 4 Priorități" ar trebui să meargă în Sarcini (comportament actual) sau în Idei?

