

# Plan de Reparație: Task-uri cu `week_key` Gol

## Problema Identificată

Din audit-ul bazei de date, am descoperit că task-urile adăugate prin butonul "Adaugă Top 4 Priorități" au **`week_key` gol** (string `""`):

```
week_key: ""  ← GOL!
day_of_week: M
created_at: 2026-02-01 22:17:36
title: "introducere fact map inainte de scrisoare ziua 1 challenge"
```

Asta înseamnă că task-urile se salvează în baza de date, dar când UI-ul încarcă listele (filtrând după `week_key = door-week-2026-06`), aceste task-uri nu apar pentru că nu au week key valid.

## Cauza Rădăcină

1. **Inițializare cu string gol**: În `useDoorDate.tsx` (linia 9):
   ```tsx
   const [currentWeekKey, setCurrentWeekKey] = useState('');
   ```
   
2. **Week key se setează asincron** în `useEffect` (linia 66-73), dar **componenta se randează imediat** cu `weekKey = ''`.

3. **Timing issue**: Dacă utilizatorul interacționează rapid sau dacă `useEffect` nu s-a executat încă, `weekKey` care se pasează la `EmptyTaskList` este gol.

4. **Flow-ul complet**:
   ```
   useDoorDate: currentWeekKey = '' (inițial)
       ↓
   DoorContext: expune currentWeekKey = ''
       ↓
   WeeklyTab: primește currentWeekKey = ''
       ↓
   TaskList: weekKey = ''
       ↓
   EmptyTaskList: weekKey = '' ← SALVEAZĂ CU WEEK KEY GOL!
   ```

## Soluția

### Partea 1: Validare în `EmptyTaskList.tsx`

Adăugăm validare înainte de insert pentru a preveni salvarea cu week key gol:

```tsx
// În handleAddPriorities(), ÎNAINTE de insert:
if (!weekKey || weekKey.trim() === '') {
  console.error('❌ Cannot add tasks: weekKey is empty');
  toast({
    title: language === 'en' ? 'Error' : 'Eroare',
    description: language === 'en' 
      ? 'Week not loaded yet. Please wait and try again.' 
      : 'Săptămâna nu s-a încărcat încă. Așteaptă și încearcă din nou.',
    variant: 'destructive'
  });
  return;
}
```

### Partea 2: Inițializare corectă în `useDoorDate.tsx`

Schimbăm inițializarea pentru a calcula week key-ul imediat (nu în useEffect):

```tsx
// ÎNAINTE (problematic):
const [currentWeekKey, setCurrentWeekKey] = useState('');

// DUPĂ (corect):
const [currentWeekKey, setCurrentWeekKey] = useState(() => getActiveWeekKey(new Date()));
```

### Partea 3: Dezactivare buton când week key lipsește

În `EmptyTaskList.tsx`, dezactivăm butonul "Add" dacă `weekKey` este gol:

```tsx
<Button
  size="sm"
  onClick={handleAddPriorities}
  disabled={!hasAnyPriority || isAdding || !weekKey}  // ← adăugat !weekKey
  className="gap-2"
>
```

### Partea 4: Migrare date existente (opțional)

Task-urile deja create cu `week_key = ''` pot fi reparate cu un query SQL:

```sql
-- Găsește și afișează task-urile cu week_key gol
SELECT id, title, day_of_week, created_at 
FROM user_tasks 
WHERE user_id = '74f5b904-95ba-4aaa-af7a-bee4c7ee6a98' 
  AND (week_key IS NULL OR week_key = '');

-- Opțional: Șterge-le sau setează-le la săptămâna curentă
-- UPDATE user_tasks SET week_key = 'door-week-2026-06' WHERE week_key = '';
```

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/hooks/useDoorDate.tsx` | Inițializare `currentWeekKey` cu valoare calculată |
| `src/components/door/task-list/EmptyTaskList.tsx` | Validare week key înainte de insert + dezactivare buton |

## Cod Final

### `useDoorDate.tsx` - Linia 9

```tsx
// Schimbă din:
const [currentWeekKey, setCurrentWeekKey] = useState('');

// În:
const [currentWeekKey, setCurrentWeekKey] = useState(() => getActiveWeekKey(new Date()));
```

### `EmptyTaskList.tsx` - În `handleAddPriorities()`

```tsx
const handleAddPriorities = async () => {
  const validPriorities = priorities.filter(p => p.trim());
  if (validPriorities.length === 0) return;

  // ADAUGĂ ACEASTĂ VALIDARE:
  if (!weekKey || weekKey.trim() === '') {
    console.error('❌ Cannot add tasks: weekKey is empty!', { weekKey, activeDay });
    toast({
      title: language === 'en' ? 'Loading...' : 'Se încarcă...',
      description: language === 'en' 
        ? 'Week data is loading. Please wait a moment and try again.' 
        : 'Datele săptămânii se încarcă. Te rog așteaptă un moment.',
      variant: 'destructive'
    });
    return;
  }

  // Log pentru debugging
  console.log('✅ Adding priorities to:', { weekKey, activeDay });

  setIsAdding(true);
  // ... restul codului
};
```

### `EmptyTaskList.tsx` - Butonul Add (linia ~182)

```tsx
<Button
  size="sm"
  onClick={handleAddPriorities}
  disabled={!hasAnyPriority || isAdding || !weekKey}
  className="gap-2"
>
```

## Rezultat Așteptat

1. Task-urile adăugate prin "Top 4 Priorități" vor avea întotdeauna `week_key` valid
2. Utilizatorul nu poate adăuga task-uri până când week key-ul nu s-a încărcat
3. Task-urile vor apărea imediat în ziua și săptămâna selectată
4. Navigarea între săptămâni/zile va funcționa corect pentru adăugare

