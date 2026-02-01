
# Plan de Restructurare: Domino Door + Goal Wizards + Habits

## Partea 1: Schimbarea Săptămânii (Duminică → Sâmbătă)

### Analiză: De ce NU recomand această schimbare

Ai dreptate că schimbând săptămâna să înceapă duminică am evita complexitatea "Sunday planning logic". Totuși, există câteva motive importante pentru care NU recomand această abordare:

1. **Incompatibilitate ISO-8601**: Standardul internațional (folosit de `date-fns`, calendare, rapoarte) definește săptămâna ca Luni→Duminică. Schimbarea ar crea conflicte cu:
   - Funcțiile `getWeek()`, `startOfWeek()` din date-fns
   - Exporturi/rapoarte care trebuie să se alinieze cu calendare standard
   - Alte integrări (calendare Google, Outlook etc.)

2. **Datele existente**: Ai deja sute de înregistrări în `weekly_planning` și `user_tasks` cu format `door-week-YYYY-WW` bazat pe ISO. Migrarea ar fi riscantă.

3. **Soluția corectă este mai simplă**: Bug-ul actual vine doar din 2-3 locuri unde se folosește `getWeekKey()` în loc de `getActiveWeekKey()`. Fixul e minimal.

### Soluția Recomandată (Fix Minimal)
În loc să schimbăm întreaga logică de săptămână, vom repara cele 3-4 locuri unde week key-ul se calculează greșit:

| Fișier | Problema | Fix |
|--------|----------|-----|
| `EmptyTaskList.tsx` | Folosește `getWeekKey()` + `getTodayAbbrev()` | Primește `weekKey` și `activeDay` din props |
| `HierarchicalGoalsView.tsx` | Calculează manual week key greșit | Folosește `getActiveWeekKey()` |
| `Stack.tsx` | Calculează manual week key | Folosește `getActiveWeekKey()` |
| `useStackTodoIntegration.tsx` | Folosește `getWeekKey()` | Folosește `getActiveWeekKey()` |

---

## Partea 2: Audit Goal Wizards (Anual → 90 zile → Lunar)

Am identificat 3 sisteme de planificare:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     WIZARDS DE PLANIFICARE                              │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. GoalWizardModal         │ Folosit în /dashboard pentru obiective     │
│    - Salvează: missions    │ specifice pe categorii                      │
│    - Integrare Domino: DA  │ (la Business cu opțiunea "Massive")         │
│    - Integrare Habits: NU  │                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. VisionPlanningWizard    │ Folosit după Life Score Quiz               │
│    - Salvează: missions    │ 3 pași: Annual → 90 zile → 30 zile          │
│    - Integrare Domino: NU  │ ⚠️ LIPSĂ - doar salvează misiuni           │
│    - Integrare Habits: NU  │                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. LifeScorePlanningFlow   │ Flow complet cu AI conversational           │
│    - Salvează: missions +  │ Cel mai avansat                             │
│      weekly_planning +     │                                             │
│      user_tasks            │                                             │
│    - Integrare Domino: DA  │ ✅ Complet                                  │
│    - Integrare Habits: NU  │                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Partea 3: Implementare Cerințe Noi

### A) BUSINESS: Integrare Domino Door Automată

**Unde**: `VisionPlanningWizard.tsx` și `GoalWizardModal.tsx`

**Logică nouă**:
```text
După salvarea misiunii lunare:
  IF category === 'business':
    → Deschide automat dialog: "Vrei să setezi Domino pentru săptămâna asta?"
    → Dacă DA: Creează weekly_planning cu:
       - domino_title = obiectivul anual
       - week_goal = misiunea lunară
       - category = 'business'
    → Navighează la /door sau afișează success
```

### B) BODY / BEING / BALANCE: Integrare Habits

**Unde**: `VisionPlanningWizard.tsx`, `GoalWizardModal.tsx`, și la finalul pasului lunar

**Logică nouă**:
```text
După salvarea misiunii lunare:
  IF category IN ('body', 'being', 'balance'):
    → Afișează dialog: "Transformă obiectivul în habit zilnic?"
    → Exemple sugerate AI:
       - Body: "30 min mișcare", "10.000 pași", "Stretching 10 min"
       - Being: "Meditație 15 min", "Jurnal seara", "Lectură 20 pag"
       - Balance: "Apel familie", "Timp calitate copii"
    → Dacă DA: 
       - Inserează în `daily_habits` cu:
         - category = categoria selectată
         - habit_group = 'custom'
         - is_active = true
         - sync_to_routine = true (NOU - flag pentru sincronizare)
```

### C) Sincronizare cu Rutina Războinicului

**Unde**: `HabitCheckStep.tsx` și `useDailyHabits.ts`

**Logică**:
```text
La încărcarea HabitCheckStep:
  → Citește toate habits din `daily_habits` pentru categoria curentă
  → Include automat habit-urile noi adăugate din planning
  → Nu necesită configurare manuală din setările rutinei
```

Aceasta deja funcționează parțial - `HabitCheckStep` citește din `useDailyHabits` care încarcă toate habit-urile active. Trebuie doar să ne asigurăm că habit-urile nou create apar în categorie corectă.

---

## Detalii Tehnice de Implementare

### Fișiere de Creat/Modificat

| Fișier | Acțiune | Descriere |
|--------|---------|-----------|
| `src/components/goal-wizard/HabitCreationDialog.tsx` | **NOU** | Dialog pentru a transforma obiectiv în habit |
| `src/components/goal-wizard/DominoCreationDialog.tsx` | **NOU** | Dialog pentru a crea Domino din obiectiv Business |
| `src/components/goal-wizard/GoalWizardModal.tsx` | Modificare | Adaugă dialog-uri la finalizare bazat pe categorie |
| `src/components/vision-quiz/planning/VisionPlanningWizard.tsx` | Modificare | Adaugă integrare Domino (Business) și Habits (restul) |
| `src/components/door/task-list/EmptyTaskList.tsx` | Modificare | Primește weekKey + activeDay din props |
| `src/components/door/TaskList.tsx` | Modificare | Pasează weekKey + activeDay |
| `src/components/door/tabs/WeeklyTab.tsx` | Modificare | Pasează weekKey în TaskList |
| `src/components/door/HierarchicalGoalsView.tsx` | Modificare | Fix week key calculation |
| `src/hooks/useDailyHabits.ts` | Modificare | Adaugă funcție `addHabitFromGoal(category, name, icon)` |
| `src/services/habitService.ts` | **NOU** | Service centralizat pentru habit-uri |

### Migrare Bază de Date

**Adăugare coloană nouă în `daily_habits`**:
```sql
ALTER TABLE daily_habits 
ADD COLUMN IF NOT EXISTS source_mission_id UUID REFERENCES missions(id),
ADD COLUMN IF NOT EXISTS sync_to_routine BOOLEAN DEFAULT true;
```

### Flow Diagram pentru Goal Wizard

```text
┌──────────────────────────────────────────────────────────────────┐
│                    GOAL WIZARD FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Anual] ──→ [90 zile] ──→ [Lunar] ──→ ┌──────────────────┐    │
│                                          │ Verifică Categorie│    │
│                                          └────────┬─────────┘    │
│                                                   │              │
│                    ┌──────────────────────────────┼──────────────┤
│                    │                              │              │
│                    ▼                              ▼              │
│           ┌───────────────┐              ┌───────────────┐       │
│           │   BUSINESS    │              │  BODY/BEING/  │       │
│           │               │              │   BALANCE     │       │
│           └───────┬───────┘              └───────┬───────┘       │
│                   │                              │              │
│                   ▼                              ▼              │
│           ┌───────────────┐              ┌───────────────┐       │
│           │ Creează Domino│              │ Adaugă Habit  │       │
│           │ + 4 Keys      │              │ în daily_     │       │
│           │ + Tasks       │              │ habits        │       │
│           └───────┬───────┘              └───────┬───────┘       │
│                   │                              │              │
│                   ▼                              ▼              │
│           ┌───────────────┐              ┌───────────────┐       │
│           │  /door        │              │ Apare în      │       │
│           │  (Domino)     │              │ Rutina        │       │
│           │               │              │ Războinicului │       │
│           └───────────────┘              └───────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Rezumat Executiv

1. **NU schimbăm** săptămâna de la Luni→Duminică la Duminică→Sâmbătă (risc prea mare, date existente incompatibile)

2. **Fixăm** bug-urile existente de week key în 4 fișiere (30 min muncă)

3. **Adăugăm** integrare Domino automată DOAR pentru Business (după lunar mission)

4. **Adăugăm** opțiune de creare habit pentru Body/Being/Balance (după lunar mission)

5. **Habit-urile noi** vor apărea automat în Rutina Războinicului (folosind sistemul existent din `HabitCheckStep`)

---

## Următorii Pași (Ordine Implementare)

1. ✅ Fix bug-uri week key (EmptyTaskList, HierarchicalGoalsView, Stack)
2. ✅ Creare `HabitCreationDialog.tsx` 
3. ✅ Creare `DominoCreationDialog.tsx`
4. ✅ Integrare în `GoalWizardModal.tsx`
5. ✅ Integrare în `VisionPlanningWizard.tsx`
6. ✅ Migrare DB pentru noile coloane
7. ✅ Testare end-to-end toate fluxurile

