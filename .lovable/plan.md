

# Personalizare Individuala per Membru (Rutina + Antrenament + Mese)

## Problema

Acum toate cele 3 module (Rutine, Antrenamente, Mese) permit doar "Aplica la tot grupul". Coach-ul nu poate selecta un membru specific din grup pentru a-i trimite un plan personalizat.

## Solutia

Adaugam in toate cele 3 componente un **dialog de selectie** care permite:
- **Aplica la tot grupul** (cum functioneaza acum)
- **Aplica la un membru specific** (NOU) -- coach-ul alege grupul, apoi membrul

## Ce se modifica

### 1. Hook-uri -- adaugam functii `applyToMember`

**`useCoachRoutineTemplates.ts`**
- Functie noua `applyTemplateToMember(templateId, userId)` -- actualizeaza `champion_routine_settings` doar pentru un singur user

**`useCoachWorkoutPrograms.ts`**
- Functie noua `applyProgramToMember(programId, userId)` -- creaza copia programului doar pentru un singur user

**`useCoachMealPlans.ts`**
- Functie noua `applyPlanToMember(planId, userId)` -- actualizeaza nutrition targets doar pentru un singur user

### 2. Componente UI -- dialog de aplicare cu selectie membru

In fiecare componenta (`CoachRoutineTemplates`, `CoachWorkoutPrograms`, `CoachMealPlans`), cand coach-ul apasa "Aplica" / "Trimite":

- Se deschide un **dialog de aplicare** cu doua optiuni:
  - Radio 1: "Tot grupul" (comportament actual)
  - Radio 2: "Un membru specific" -- apare un dropdown cu membrii grupului
- Membrii se incarca din `tribe_members` JOIN `leaderboard_profiles` (pentru display_name)
- Dupa selectie, se apeleaza fie `applyToTribe` fie `applyToMember`

### 3. Fetch membrii grupului

Se adauga un query comun in fiecare componenta:
```text
SELECT tm.user_id, lp.display_name
FROM tribe_members tm
LEFT JOIN leaderboard_profiles lp ON lp.user_id = tm.user_id
WHERE tm.tribe_id = ?
ORDER BY lp.display_name
```

## Fisiere modificate

| Fisier | Ce se schimba |
|--------|--------------|
| `src/hooks/useCoachRoutineTemplates.ts` | + `applyTemplateToMember()` |
| `src/hooks/useCoachWorkoutPrograms.ts` | + `applyProgramToMember()` |
| `src/hooks/useCoachMealPlans.ts` | + `applyPlanToMember()` |
| `src/components/coach/CoachRoutineTemplates.tsx` | Dialog aplicare cu selectie grup/membru |
| `src/components/coach/CoachWorkoutPrograms.tsx` | Dialog aplicare cu selectie grup/membru |
| `src/components/coach/CoachMealPlans.tsx` | Dialog aplicare cu selectie grup/membru |

## Nu se modifica baza de date
Tabelele existente suporta deja aplicarea individuala -- logica e aceeasi, doar ca se ruleaza pentru un singur `user_id` in loc de toti membrii.

