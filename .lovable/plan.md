
# Indicator vizual pentru cheile completate in DoorPlanningModal

## Ce adaugam

Un indicator compact in header-ul modalului care arata progresul cheilor (ex: "2/4 chei definite") si permite click pentru a vedea un rezumat rapid al cheilor completate pana acum.

## Componente noi

### 1. CompletedKeysIndicator (componentă nouă)

Cream `src/components/door/CompletedKeysIndicator.tsx` -- o componentă mică care:
- Afișează "0/4 chei", "1/4 chei", "2/4 chei" etc. cu iconițe CheckCircle colorate
- La click, deschide un Popover cu rezumatul detaliat al fiecărei chei completate
- Fiecare cheie din rezumat arată: titlu, pașii cu ziua și tipul (HIT/DO), responsabil, deadline
- Cheile nedefinite apar gri cu "Nedefinită încă"
- Folosește culori: verde pentru completate, gri pentru cele rămase

### 2. Integrare in DoorPlanningModal.tsx

- Adăugăm `CompletedKeysIndicator` în header-ul dialogului, lângă butonul "Șterge draft"
- Componenta primește `completedKeys` din state-ul existent (deja implementat)
- Nu modificăm logica existentă, doar adăugăm UI

## Design vizual

```text
┌──────────────────────────────────────────────────┐
│ ✨ Domino Door Planning  [🔑 2/4 chei] [Draft]  │
│─────────────────────────────────────────────────-│
│                                                  │
│  ... conversatia ...                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

La click pe "2/4 chei", apare un popover:

```text
┌─────────────────────────────────────┐
│  Rezumat Chei Definite              │
│                                     │
│  ✅ Cheia 1: "Lansare platforma"    │
│     1. Optimizare B2C - Luni (HIT)  │
│     2. Lead magnet - Miercuri (HIT) │
│     Responsabil: Alin | DL: Vineri  │
│                                     │
│  ✅ Cheia 2: "Marketing afiliat"    │
│     1. Campanie FB - Marți (DO)     │
│     Responsabil: Alin | DL: Joi     │
│                                     │
│  ⬚ Cheia 3: Nedefinita inca         │
│  ⬚ Cheia 4: Nedefinita inca         │
└─────────────────────────────────────┘
```

## Detalii tehnice

### Fișier nou: src/components/door/CompletedKeysIndicator.tsx

- Import Popover, PopoverTrigger, PopoverContent din shadcn
- Import CheckCircle, Circle din lucide-react
- Primeste props: `completedKeys: CompletedKeyInfo[]`
- Badge cu numarul de chei completate (verde cand > 0, gri cand 0)
- Popover cu ScrollArea pentru rezumatul detaliat
- Fiecare cheie completata arata steps cu day si type

### Modificare: src/components/door/DoorPlanningModal.tsx

- Import CompletedKeysIndicator
- Plasare in DialogHeader, intre titlu si butoanele de cloud/draft (linia ~833)
- Se afiseaza doar cand `planningStep === 'planning'` si `messages.length > 0`

### Fara alte dependente noi

- Folosim componente shadcn existente (Popover, ScrollArea, Badge)
- Folosim tipul CompletedKeyInfo deja definit in doorPlanningContext.ts
- Nu modificam logica de detectie sau salvare -- doar citim state-ul existent
