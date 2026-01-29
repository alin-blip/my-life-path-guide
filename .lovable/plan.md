

# Plan: Remediere Bug Salvare Domino Door

## Probleme Identificate

### 1. CRITICĂ: Categoria nu se transmite corect la salvare
**Locație:** `useDoorStorage.tsx` linia 233-237 (visibility change handler)

Când tab-ul devine vizibil din nou, se apelează `forceSaveWeeklyPlan()` dar **fără parametrul `category`**:

```typescript
// PROBLEMA - linia 233-237:
forceSaveWeeklyPlan({
  currentWeekKey: props.currentWeekKey,
  selectedDomino: props.selectedDomino,
  dominoKeyPoints: props.dominoKeyPoints
  // ❌ LIPSEȘTE: category: activeCategoryRef.current
});
```

Aceasta cauzează salvarea cu categoria default `'business'` în loc de categoria activă.

### 2. CRITICĂ: Local Draft Override Distructiv
**Locație:** `useDoorStorage.tsx` liniile 110-131

Când draft-ul local este considerat "mai complet", suprascrie datele din cloud fără să verifice categoria:

```typescript
// PROBLEMA - linia 111:
if (draft && isDraftMoreComplete(draft, props.selectedDomino?.text || '', props.dominoKeyPoints)) {
  console.log('📋 Restoring from local draft (more complete than cloud)');
  // ❌ Nu verifică dacă draft-ul este pentru aceeași categorie!
```

### 3. MEDIE: Draft localStorage nu salvează categoria
**Locație:** `useWeeklyPlanDraft.tsx` liniile 31-55

Draft-ul local nu include categoria, deci la restaurare nu știm dacă e pentru Body, Business, etc.

```typescript
// PROBLEMA - linia 31:
const draft: WeeklyPlanDraft = {
  timestamp: Date.now(),
  weekKey,
  dominoTitle: selectedDomino?.text || '',
  dominoId: selectedDomino?.id,
  keyPoints: dominoKeyPoints.map(...),
  // ❌ LIPSEȘTE: category: currentCategory
};
```

---

## Date din Baza de Date (Dovezi)

| week_key | category | domino_title | updated_at |
|----------|----------|--------------|------------|
| door-week-2026-05 | business | Creșterea impactului... | 2026-01-28 12:09:01 |

Există doar **un singur plan** pentru săptămâna 05 (business). Dacă setezi ceva pentru Body sau Being, se pierde pentru că:
- La salvare se suprascrie business (categoria default)
- La încărcare se ia planul cu updated_at cel mai recent (business)

---

## Soluție

### Fix 1: Adaugă categoria la forceSaveWeeklyPlan (visibility change)

**Fișier:** `src/hooks/useDoorStorage.tsx`

```typescript
// Linia 233-237 - DE LA:
forceSaveWeeklyPlan({
  currentWeekKey: props.currentWeekKey,
  selectedDomino: props.selectedDomino,
  dominoKeyPoints: props.dominoKeyPoints
});

// LA:
forceSaveWeeklyPlan({
  currentWeekKey: props.currentWeekKey,
  selectedDomino: props.selectedDomino,
  dominoKeyPoints: props.dominoKeyPoints,
  category: activeCategoryRef.current
});
```

### Fix 2: Adaugă categoria în Draft localStorage

**Fișier:** `src/hooks/door/useWeeklyPlanDraft.tsx`

```typescript
// Update interface:
interface WeeklyPlanDraft {
  timestamp: number;
  weekKey: string;
  dominoTitle: string;
  dominoId?: string;
  category?: DomainCategory;  // ← ADAUGĂ
  keyPoints: Array<{...}>;
}

// Update saveDraft function signature și logica
const saveDraft = useCallback((
  weekKey: string,
  selectedDomino: HotListItem | null,
  dominoKeyPoints: DominoKeyPoint[],
  category?: DomainCategory  // ← ADAUGĂ
) => {
  const draft: WeeklyPlanDraft = {
    timestamp: Date.now(),
    weekKey,
    dominoTitle: selectedDomino?.text || '',
    dominoId: selectedDomino?.id,
    category,  // ← ADAUGĂ
    keyPoints: ...
  };
});
```

### Fix 3: Verifică categoria la restaurare din draft

**Fișier:** `src/hooks/useDoorStorage.tsx`

```typescript
// Linia 111 - Adaugă verificare categorie:
if (draft && 
    isDraftMoreComplete(draft, props.selectedDomino?.text || '', props.dominoKeyPoints) &&
    draft.category === activeCategoryRef.current) {  // ← ADAUGĂ
  console.log('📋 Restoring from local draft (same category, more complete)');
  ...
}
```

### Fix 4: Actualizează apelurile saveDraft să trimită categoria

**Fișier:** `src/hooks/useDoorStorage.tsx`

Toate apelurile `saveDraft()` trebuie să primească `activeCategoryRef.current`:

```typescript
// Linia 201:
saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints, activeCategoryRef.current);

// Linia 228:
saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints, activeCategoryRef.current);

// Linia 246:
saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints, activeCategoryRef.current);
```

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/hooks/useDoorStorage.tsx` | 4 locuri: adaugă categoria la forceSave și saveDraft |
| `src/hooks/door/useWeeklyPlanDraft.tsx` | Update interface + saveDraft pentru a include categoria |

---

## Fluxul Corectat

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUX SALVARE CORECTAT                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User selectează domeniu (ex: Body)                              │
│     ↓                                                               │
│  2. doorCategoryLoaded event → activeCategoryRef = 'body'           │
│     ↓                                                               │
│  3. User modifică Domino/Key Points                                 │
│     ↓                                                               │
│  4. Auto-save (1.5s debounce):                                      │
│     - saveDraft(weekKey, domino, keyPoints, 'body') ← localStorage  │
│     - saveWeeklyPlanOnly({ ..., category: 'body' }) ← cloud         │
│     ↓                                                               │
│  5. Visibility change (tab hidden/visible):                         │
│     - forceSaveWeeklyPlan({ ..., category: 'body' }) ← cu categorie │
│     ↓                                                               │
│  6. La reload:                                                      │
│     - Load plans for week → sort by updated_at                      │
│     - Draft restore DOAR dacă same category                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Verificare Suplimentară

După implementare, verifică în consolă:
1. `📤 Saving weekly plan: { weekKey, category: 'body', ... }` - să conțină categoria corectă
2. `📝 Weekly plan draft saved locally: { category: 'body', ... }` - să conțină categoria
3. `📋 Restoring from local draft (same category)` - doar dacă categoria se potrivește

---

## Timp Estimat

| Task | Timp |
|------|------|
| Fix 1: Category în forceSaveWeeklyPlan | 5 min |
| Fix 2: Update useWeeklyPlanDraft | 10 min |
| Fix 3: Verificare categorie la restore | 5 min |
| Fix 4: Update toate apelurile saveDraft | 10 min |
| Testing | 10 min |
| **Total** | **~40 min** |

