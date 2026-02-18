
# Eliminare Coach-i Nefolosiți (Therapist, Performance, Relationship, Sales)

## Rezumat

Se elimina 4 coach-i AI neesentiali si componentele asociate lor. Se pastreaza doar Accountability Coach si Mind Coach.

## Ce se sterge

### Pagini (3 fisiere)
- `src/pages/TherapistCoach.tsx`
- `src/pages/PerformanceCoach.tsx`
- `src/pages/RelationshipCoach.tsx`

### Componente AI Chat (3 fisiere)
- `src/components/ai/TherapistCoachChat.tsx`
- `src/components/ai/PerformanceCoachChat.tsx`
- `src/components/ai/RelationshipCoachChat.tsx`

### Dashboard (1 fisier)
- `src/components/dashboard/DualCoachCard.tsx` - nu este importat NICAIERI, complet nefolosit

### Landing / Sales Coach (2 fisiere)
- `src/components/landing/SalesCoachWidget.tsx`
- `src/hooks/useSalesCoach.ts`

### Edge Functions (4 directoare)
- `supabase/functions/therapist-coach/`
- `supabase/functions/performance-coach/`
- `supabase/functions/relationship-coach/`
- `supabase/functions/sales-coach/`

**Total: 9 fisiere frontend + 4 edge functions = 13 stergeri**

## Ce se modifica

### `src/App.tsx`
- Stergere 3 import-uri lazy: `RelationshipCoach`, `TherapistCoach`, `PerformanceCoachPage`
- Stergere 3 Route-uri: `/relationship-coach`, `/therapist-coach`, `/performance-coach`

### `src/pages/Index.tsx`
- Stergere import `SalesCoachWidget`
- Stergere render `<SalesCoachWidget />` din landing page
- Stergere state-ul `pendingSalesMessage` si handler-ul asociat (daca exista)

### `src/utils/navigationRoutes.ts`
- Stergere rutele `/relationship-coach`, `/therapist-coach`, `/performance-coach` (daca exista - nu sunt in fisierul curent dar trebuie verificat)

## Ce NU se modifica
- Accountability Coach (widget persistent) - ramane intact
- Mind Coach (Challenge + landing page) - ramane intact
- Napoleon Hill Coach (widget dashboard) - ramane intact
- Toate celelalte edge functions raman neatinse
