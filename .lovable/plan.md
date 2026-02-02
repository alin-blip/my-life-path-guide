
# Plan: Reparare Eroare Salvare Obiective Anuale

## Problema Identificată

**Eroarea din baza de date:**
```
there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Cauza root:**
- Indexul unic din baza de date folosește `COALESCE()`:
  ```sql
  CREATE UNIQUE INDEX missions_user_category_type_period_project_idx 
  ON public.missions USING btree (user_id, category, mission_type, period, COALESCE(project_name, ''::text))
  ```
- Codul încearcă să facă `upsert` cu:
  ```typescript
  onConflict: 'user_id,category,mission_type,period,project_name'
  ```
- **PostgREST NU poate** face match pe indecși care folosesc funcții (COALESCE) - are nevoie de un constraint simplu pe coloane directe.

---

## Soluția

Trebuie să creăm un **UNIQUE CONSTRAINT** pe coloane simple (nu index cu funcție) pentru ca `onConflict` să funcționeze corect.

### Pas 1: Migrare SQL

Vom executa o migrare care:
1. Șterge indexul vechi cu `COALESCE`
2. Creează un constraint unic pe coloane simple
3. Gestionează valorile `NULL` din `project_name` setându-le la string gol

```sql
-- 1. Actualizăm project_name NULL la string gol pentru consistență
UPDATE public.missions 
SET project_name = '' 
WHERE project_name IS NULL;

-- 2. Ștergem indexul vechi care folosește COALESCE
DROP INDEX IF EXISTS public.missions_user_category_type_period_project_idx;

-- 3. Creăm un CONSTRAINT unic pe coloane simple (nu funcție)
ALTER TABLE public.missions 
ADD CONSTRAINT missions_unique_user_category_type_period_project 
UNIQUE (user_id, category, mission_type, period, project_name);

-- 4. Setăm default pentru project_name să fie string gol în loc de NULL
ALTER TABLE public.missions 
ALTER COLUMN project_name SET DEFAULT '';
```

### Pas 2: Actualizare Cod (opțional dar recomandat)

În `GoalWizardModal.tsx`, ne asigurăm că `project_name` nu e niciodată NULL:

```typescript
// Linia 450 - asigurăm că project_name e string gol dacă e undefined
project_name: project.name || '',
```

---

## De ce funcționează

| Înainte | După |
|---------|------|
| Index cu `COALESCE(project_name, '')` | Constraint pe `project_name` (coloană simplă) |
| PostgREST nu găsește constraint | PostgREST găsește constraint exact |
| Eroare la `onConflict` | `upsert` funcționează corect |

---

## Checklist Implementare

1. [ ] Execută migrarea SQL pentru a crea constraint-ul unic
2. [ ] Actualizează codul pentru a seta default `''` la `project_name`
3. [ ] Testează salvarea obiectivelor prin Goal Wizard
4. [ ] Verifică că obiectivele existente nu sunt afectate
