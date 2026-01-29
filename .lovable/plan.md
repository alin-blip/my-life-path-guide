

# Plan: Implementare Matrice Eisenhower pentru Idei

## Rezumat

Adăugăm sistemul de **4 cadrane Eisenhower** pentru clasificarea ideilor bazat pe **Importanță** și **Urgență**:

| Cadran | Importanță | Urgență | Culoare | Acțiune |
|--------|------------|---------|---------|---------|
| **Q2** (CREATOR) | DA | NU | Verde | Planifică - CEL MAI BUN |
| **Q1** (REACTOR) | DA | DA | Roșu | Fă ACUM |
| **Q3** (DELEGATOR) | NU | DA | Portocaliu | Delegă |
| **Q4** (ELIMINATOR) | NU | NU | Gri | Șterge |

---

## Interfața de Selecție

Când utilizatorul dă click pe o idee sau pe un buton de "prioritate", apare un **selector vizual 2x2** cu cele 4 cadrane:

```text
┌─────────────────────────────────────────────┐
│           IMPORTANT + URGENT                │
│    ┌─────────────────┬──────────────────┐   │
│    │   🔴 REACTOR    │   🟢 CREATOR     │   │
│    │   Important +   │   Important +    │   │
│    │   Urgent        │   NU Urgent      │   │
│    │   "FĂ ACUM"     │   "PLANIFICĂ"    │   │
│    ├─────────────────┼──────────────────┤   │
│    │   🟠 DELEGATOR  │   ⚫ ELIMINATOR  │   │
│    │   NU Important  │   NU Important + │   │
│    │   + Urgent      │   NU Urgent      │   │
│    │   "DELEGĂ"      │   "ȘTERGE"       │   │
│    └─────────────────┴──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Componente de Creat

### 1. EisenhowerQuadrant (Tip și Configurare)
Definește cele 4 cadrane cu culori, etichete și acțiuni recomandate.

### 2. EisenhowerSelector (Componenta UI)
Popup/dropdown cu grila 2x2 pentru selecție vizuală.

### 3. QuadrantBadge (Badge vizual)
Badge colorat care arată cadranul selectat pe fiecare idee.

---

## Schema de Culori

| Cadran | Background | Text | Border | Emoji |
|--------|------------|------|--------|-------|
| Q2 Creator | `bg-green-500/20` | `text-green-400` | `border-green-500/30` | 🟢 sau ✨ |
| Q1 Reactor | `bg-red-500/20` | `text-red-400` | `border-red-500/30` | 🔴 sau ⚡ |
| Q3 Delegator | `bg-orange-500/20` | `text-orange-400` | `border-orange-500/30` | 🟠 sau 👥 |
| Q4 Eliminator | `bg-gray-500/20` | `text-gray-400` | `border-gray-500/30` | ⚫ sau 🗑️ |

---

## Modificări Database

### Opțiunea A: Folosim coloana `priority` existentă (INTEGER)
Mapare:
- `0` = Nesetat
- `1` = Q4 (Eliminator - NU important, NU urgent)
- `2` = Q3 (Delegator - NU important, Urgent)
- `3` = Q2 (Creator - Important, NU urgent)
- `4` = Q1 (Reactor - Important, Urgent)

### Opțiunea B: Adăugăm coloană nouă `eisenhower_quadrant`
Valori: `'q1_reactor'`, `'q2_creator'`, `'q3_delegator'`, `'q4_eliminator'`

**Recomandat: Opțiunea A** - folosim coloana `priority` existentă pentru a evita migrări.

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/types/eisenhower.ts` (NOU) | Tipuri și configurare pentru cele 4 cadrane |
| `src/components/ui/EisenhowerSelector.tsx` (NOU) | Componenta de selecție 2x2 |
| `src/components/ui/QuadrantBadge.tsx` (NOU) | Badge vizual pentru cadran |
| `src/components/door/HotList.tsx` | Integrare selector pe fiecare idee |
| `src/components/dashboard/widgets/IdeasWidget.tsx` | Integrare selector + filtrare |
| `src/services/ideasBankService.ts` | Update metodă pentru salvare quadrant |
| `src/types/door.ts` | Păstrăm TaskPriority existent, compatibilitate |

---

## Secțiune Tehnică

### Tip Eisenhower (src/types/eisenhower.ts)

```typescript
export type EisenhowerQuadrant = 
  | 'q1_reactor'      // Important + Urgent → FĂ ACUM
  | 'q2_creator'      // Important + NU Urgent → PLANIFICĂ (BEST!)
  | 'q3_delegator'    // NU Important + Urgent → DELEGĂ
  | 'q4_eliminator'   // NU Important + NU Urgent → ȘTERGE
  | 'unset';          // Nesetat

export interface QuadrantConfig {
  id: EisenhowerQuadrant;
  label: string;
  labelRo: string;
  action: string;
  actionRo: string;
  important: boolean;
  urgent: boolean;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: number; // Pentru mapare la DB
}

export const EISENHOWER_QUADRANTS: Record<EisenhowerQuadrant, QuadrantConfig> = {
  q2_creator: {
    id: 'q2_creator',
    label: 'Creator',
    labelRo: 'Creator',
    action: 'Plan & Schedule',
    actionRo: 'Planifică',
    important: true,
    urgent: false,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: '✨',
    priority: 3
  },
  q1_reactor: {
    id: 'q1_reactor',
    label: 'Reactor',
    labelRo: 'Reactor',
    action: 'Do Now',
    actionRo: 'Fă ACUM',
    important: true,
    urgent: true,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: '⚡',
    priority: 4
  },
  q3_delegator: {
    id: 'q3_delegator',
    label: 'Delegator',
    labelRo: 'Delegator',
    action: 'Delegate',
    actionRo: 'Delegă',
    important: false,
    urgent: true,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    icon: '👥',
    priority: 2
  },
  q4_eliminator: {
    id: 'q4_eliminator',
    label: 'Eliminator',
    labelRo: 'Eliminator',
    action: 'Delete',
    actionRo: 'Șterge',
    important: false,
    urgent: false,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    icon: '🗑️',
    priority: 1
  },
  unset: {
    id: 'unset',
    label: 'Unset',
    labelRo: 'Nesetat',
    action: 'Classify',
    actionRo: 'Clasifică',
    important: false,
    urgent: false,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    icon: '❓',
    priority: 0
  }
};

// Helper: priority number → quadrant
export function priorityToQuadrant(priority: number): EisenhowerQuadrant {
  switch (priority) {
    case 4: return 'q1_reactor';
    case 3: return 'q2_creator';
    case 2: return 'q3_delegator';
    case 1: return 'q4_eliminator';
    default: return 'unset';
  }
}

// Helper: quadrant → priority number
export function quadrantToPriority(quadrant: EisenhowerQuadrant): number {
  return EISENHOWER_QUADRANTS[quadrant].priority;
}
```

### EisenhowerSelector Component (src/components/ui/EisenhowerSelector.tsx)

Componenta va afișa o grilă 2x2 într-un Popover:

```typescript
// Structură vizuală a selectorului:
//
//              IMPORTANT
//        ┌─────────┬─────────┐
// URGENT │ Q1 ⚡   │ Q2 ✨   │
//        │ Reactor │ Creator │
//        ├─────────┼─────────┤
//   NU   │ Q3 👥   │ Q4 🗑️  │
// URGENT │Delegator│Eliminator│
//        └─────────┴─────────┘
//            NU        DA
//         IMPORTANT  IMPORTANT
```

### Integrare în HotList.tsx

Adăugăm un buton/badge pe fiecare idee care deschide EisenhowerSelector:

```tsx
{/* Quadrant Badge - click to change */}
<QuadrantBadge 
  quadrant={priorityToQuadrant(idea.priority)}
  onClick={() => openQuadrantSelector(idea.id)}
  size="sm"
/>
```

### Integrare în IdeasWidget.tsx

Similar, înlocuim `CategoryBadge` cu `QuadrantBadge` sau adăugăm alături.

---

## Flow Utilizator

1. Utilizatorul adaugă o idee nouă → default `unset` (❓)
2. Click pe badge-ul de prioritate → apare selector 2x2
3. Selectează cadranul dorit (ex: ✨ Creator)
4. Badge-ul se actualizează vizual + salvare în DB
5. Ideile pot fi filtrate după cadran

---

## Comportament Special Q4 (Eliminator)

Când utilizatorul selectează Q4 (NU important, NU urgent):
- Afișăm un dialog de confirmare: "Această idee nu este importantă și nici urgentă. Vrei să o ștergi?"
- Opțiuni: "Șterge", "Păstrează totuși", "Anulează"

---

## Timp Estimat

| Task | Timp |
|------|------|
| Creare tipuri Eisenhower | 10 min |
| Creare EisenhowerSelector | 25 min |
| Creare QuadrantBadge | 10 min |
| Integrare HotList | 20 min |
| Integrare IdeasWidget | 15 min |
| Update servicii | 10 min |
| Testing | 15 min |
| **Total** | **~105 min** |

