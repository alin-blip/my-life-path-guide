

# Plan: Fix Categorii Custom pentru Habits

## Problema Identificată

Baza de date are un **CHECK constraint** care permite doar 4 categorii:
```sql
CHECK (category IN ('body', 'being', 'balance', 'business'))
```

Când încerci să adaugi "caracter-abilitati", primești eroarea:
```
"new row violates check constraint daily_habits_category_check"
```

## Opțiuni de Rezolvare

### Opțiunea A: Elimină CHECK Constraint (RECOMANDAT)
Permite orice categorie custom, păstrând flexibilitatea utilizatorului.

### Opțiunea B: Mapează Categoriile Noi la Cele Existente
Transformă UI-ul pentru a grupa categoriile custom sub cele 4 existente (ex: "caracter-abilitati" -> "being").

---

## Soluție Propusă: Opțiunea A

### 1. Migrare Database
Eliminăm CHECK constraint-ul restrictiv:

```sql
ALTER TABLE daily_habits DROP CONSTRAINT daily_habits_category_check;
```

Opțional, adăugăm una nouă mai permisivă (minimum lungime, caractere valide):
```sql
ALTER TABLE daily_habits 
ADD CONSTRAINT daily_habits_category_check 
CHECK (category ~ '^[a-z0-9_-]+$' AND length(category) >= 2);
```

### 2. Update Frontend

**Fișier: `src/hooks/useDailyHabits.ts`**
- Schimbăm tipul `HabitCategory` din union literal la `string`:
```typescript
// DE LA:
export type HabitCategory = 'body' | 'being' | 'balance' | 'business';

// LA:
export type HabitCategory = string;
```

**Fișier: `src/components/habits/AddHabitDialog.tsx`**
- Adăugăm validare frontend (caractere permise, lungime minimă)
- Afișăm eroare clară dacă categoria are caractere invalide

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| **Database** | DROP și recreare CHECK constraint |
| `src/hooks/useDailyHabits.ts` | Schimbă `HabitCategory` la `string` |
| `src/components/habits/AddHabitDialog.tsx` | Adaugă validare frontend pentru categorii custom |

---

## Validare Frontend Nouă

```typescript
// În AddHabitDialog.tsx
const validateCategory = (cat: string): boolean => {
  // Doar litere mici, numere, underscore, dash
  // Minim 2 caractere
  return /^[a-z0-9_-]{2,}$/.test(cat);
};

// La submit:
if (showNewCategory && newCategory.trim()) {
  const normalized = newCategory.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, ''); // Remove invalid chars
  
  if (!validateCategory(normalized)) {
    toast.error('Categoria trebuie să aibă minim 2 caractere (litere, numere, _ sau -)');
    return;
  }
  finalCategory = normalized;
}
```

---

## Secțiune Tehnică

### Migrare SQL Completă

```sql
-- 1. Elimină constraint-ul existent
ALTER TABLE public.daily_habits 
DROP CONSTRAINT IF EXISTS daily_habits_category_check;

-- 2. Adaugă constraint nou mai permisiv (opțional)
-- Permite: a-z, 0-9, underscore, dash
-- Minim 2 caractere, maxim 50
ALTER TABLE public.daily_habits 
ADD CONSTRAINT daily_habits_category_valid 
CHECK (
  category ~ '^[a-z0-9_-]+$' 
  AND length(category) >= 2 
  AND length(category) <= 50
);
```

### Categorii Default (păstrăm)
Cele 4 categorii principale rămân standard:
- `body` - Corp/Fizic
- `being` - Spiritualitate/Mindset  
- `balance` - Relații/Echilibru
- `business` - Afaceri/Productivitate

Utilizatorul poate adăuga oricâte categorii custom dorește.

---

## Timp Estimat

| Task | Timp |
|------|------|
| Migrare database | 5 min |
| Update HabitCategory type | 5 min |
| Validare frontend AddHabitDialog | 10 min |
| Testing | 5 min |
| **Total** | **~25 min** |

