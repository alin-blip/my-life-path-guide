

# Audit Fix: RLS Gamification + State Sync

## Probleme identificate

### 1. RLS Gamification - rolul `owner` lipseste
Politicile RLS pentru `tribe_points`, `tribe_badges` si `tribe_user_badges` verifica doar `role = 'admin'`, dar coach-ul care creeaza tribul primeste rolul `owner`. Rezultat: coach-ul NU poate acorda puncte sau badge-uri in propriul trib.

### 2. State Sync - `requires_approval` nu se incarca din DB
In `CoachMemberManager.tsx`, starea `requiresApproval` porneste ca `false` si nu se sincronizeaza cu valoarea reala din baza de date la montare.

---

## Plan de implementare

### Pas 1: Migrare SQL - Fix RLS policies
Creare migrare care inlocuieste toate politicile de INSERT/UPDATE/DELETE pentru cele 3 tabele de gamificare, schimband conditia:
- De la: `tm.role = 'admin'`
- La: `tm.role IN ('admin', 'owner')`

Afecteaza 5 politici:
- `tribe_points`: INSERT (coach awards points)
- `tribe_badges`: INSERT, UPDATE, DELETE (coach manages badges)
- `tribe_user_badges`: INSERT (coach awards badges to members)

### Pas 2: Fix state sync in CoachMemberManager.tsx
Adaugare `useEffect` care citeste `requires_approval` din tabela `tribes` la montare si seteaza starea initiala corect. Se va folosi `supabase.from('tribes').select('requires_approval').eq('id', tribeId).single()`.

---

## Detalii tehnice

### Migrare SQL
```sql
-- Drop and recreate affected policies with owner role included
DROP POLICY IF EXISTS "Coach can award points" ON public.tribe_points;
CREATE POLICY "Coach can award points" ON public.tribe_points
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_points.tribe_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));

-- Same pattern for tribe_badges (INSERT, UPDATE, DELETE)
-- Same pattern for tribe_user_badges (INSERT)
```

### CoachMemberManager.tsx
Adaugare useEffect dupa linia 123:
```typescript
useEffect(() => {
  if (!tribeId) return;
  supabase.from('tribes').select('requires_approval')
    .eq('id', tribeId).single()
    .then(({ data }) => {
      if (data) setRequiresApproval(!!data.requires_approval);
    });
}, [tribeId]);
```

