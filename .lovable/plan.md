
# Plan: Rezolvare Discrepanță Obiective Anuale

## Problema Identificată

Am găsit cauza exactă a problemei din baza de date:

| Locație | Ce Afișează | Perioada |
|---------|-------------|----------|
| Modal "Plan Next Week" | "2 case transformate în 12 unități..." | **2025** (obiectiv vechi) |
| "Viziune Anuală" | "1000 de studenți înrolați Eduforyou" | **2026** (obiectiv curent) |

### Cauza Tehnică

```text
┌─────────────────────────────────────────────────────────────────┐
│  AnnualVisionTab.tsx                                            │
│  ✓ CORECT - Filtrează după anul curent                          │
│                                                                 │
│  .eq('mission_type', 'annual')                                  │
│  .eq('period', '2026')   ← Afișează doar obiectivele din 2026   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  useObjectivesCheck.ts                                          │
│  ✗ PROBLEMĂ - NU filtrează după an                              │
│                                                                 │
│  .eq('user_id', user.id)  ← Preia TOATE obiectivele (2025+2026) │
│                                                                 │
│  Rezultat: catData.annual conține obiective din AMBII ani       │
│  → Afișează primul găsit, care poate fi din 2025                │
└─────────────────────────────────────────────────────────────────┘
```

### Date din Bază de Date

Pentru categoria **Business**, există multiple obiective anuale:

| ID | Perioadă | Titlu | Status |
|----|----------|-------|--------|
| 66636d80... | 2026 | "1000 de studenți înrolați Eduforyou - Recucerire piata" | ✓ Curent |
| 852e2b50... | 2026 | "Business" | Alt utilizator |
| acf16b8d... | **2025** | "2 case transformate în 12 unități..." | ← Acest apare în modal |

## Soluția

### Modificare în `src/hooks/useObjectivesCheck.ts`

Adaug filtrare pe perioada curentă pentru fiecare tip de obiectiv:

```typescript
// Calculez perioadele curente
const currentYear = new Date().getFullYear().toString();
const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${currentYear}`;
const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

// Query-uri separate pentru fiecare tip
const [annualData, quarterlyData, monthlyData] = await Promise.all([
  supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .eq('mission_type', 'annual')
    .eq('period', currentYear),
  supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .eq('mission_type', 'quarterly')
    .like('period', `%${currentYear}%`),
  supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .eq('mission_type', 'monthly')
    .like('period', `${currentYear}-%`)
]);
```

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/hooks/useObjectivesCheck.ts` | Adaug filtrare pe perioadele curente (2026) |

## Beneficii

- **Consistență**: Același obiectiv apare în toate locurile
- **Relevanță**: Se afișează doar obiectivele din anul curent, nu cele vechi
- **Prevenție**: Utilizatorii nu vor mai vedea obiective din trecut amestecate cu cele actuale
- **Compatibilitate**: Lead magnet-urile noi nu vor mai "suprascrie" vizual obiectivele existente

## Impact Minimal

Această modificare afectează doar `SundayPlanningModal` (singurul component care folosește acest hook), asigurând că modalul afișează aceleași obiective ca și pagina Viziune Anuală.
