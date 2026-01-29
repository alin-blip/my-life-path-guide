

# Plan: Îmbunătățiri UX Complete pentru Secțiunea "Idei" din /door

## Probleme Confirmate din Feedback Utilizator

| # | Problemă | Status Actual |
|---|----------|---------------|
| 1 | **Modal selecție cadran lipsește** | La adăugare, ideea se salvează direct cu priority=1, fără opțiune de clasificare |
| 2 | **Mobile: nu pot adăuga idei** | Butonul Send există (linia 194-203), dar utilizatorul nu îl vede sau nu funcționează |
| 3 | **Acțiuni ascunse pe hover** | `opacity-0 group-hover:opacity-100` - nu funcționează pe touch |

---

## Soluții Propuse

### 1. Mini-Modal Eisenhower după Adăugare Idee

La fel ca în screenshot, după ce utilizatorul adaugă o idee, va apărea un modal compact:

```text
┌─────────────────────────────────────────────┐
│         Clasifică ideea ta                  │
│                                             │
│  ┌─────────────┬─────────────┐              │
│  │ ⚡ Reactor  │ ✨ Creator  │  ← Important │
│  │  Fă ACUM   │  Planifică  │              │
│  ├─────────────┼─────────────┤              │
│  │ 👥 Delegator│ 🗑️ Eliminator│ ← Neimportant│
│  │  Delegă    │  Șterge     │              │
│  └─────────────┴─────────────┘              │
│      URGENT       NU URGENT                 │
│                                             │
│  [⏭️ Sari peste]                            │
│  sau                                        │
│  [🧠 Analizează cu AI]                      │
└─────────────────────────────────────────────┘
```

**Flow:**
1. Utilizatorul scrie ideea și apasă Enter/Send
2. Ideea se salvează temporar cu `priority: 0` (unset)
3. Apare modalul compact cu cele 4 cadrane
4. Utilizatorul alege cadranul SAU:
   - "Sări peste" → rămâne priority 0 (neclasificată)
   - "Analizează cu AI" → deschide IdeaAnalysisModal
5. Modalul se închide, focus revine la input

### 2. Fix Mobile Add Button

Problema identificată: butonul Send există dar posibil:
- E prea mic (w-9 h-9)
- Nu e suficient de vizibil

**Soluții:**
- Măresc butonul pe mobile
- Adaug culoare mai vizibilă (primary)
- Adaug text "+" în loc de Send pe ecrane mici
- Asigur că butonul e vizibil când input-ul are text

### 3. Acțiuni Always-Visible pe Mobile

Schimb comportamentul acțiunilor:

```typescript
// Din:
className="opacity-0 group-hover:opacity-100"

// În:
className={cn(
  "transition-opacity",
  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
)}
```

---

## Detalii Tehnice

### A. Creez componenta `IdeaQuadrantModal.tsx`

```typescript
// src/components/door/IdeaQuadrantModal.tsx
interface IdeaQuadrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaText: string;
  onSelectQuadrant: (priority: number) => void;
  onSkip: () => void;
  onAnalyze: () => void;
}
```

Caracteristici:
- Dialog compact (Dialog sau Sheet pe mobile)
- Grid 2x2 cu cele 4 cadrane (reutilizez QuadrantCell din EisenhowerSelector)
- Butoane "Sări peste" și "Analizează cu AI"
- Animație subtilă la deschidere

### B. Modific `HotList.tsx` - Flow Adăugare

```typescript
// State nou:
const [pendingIdea, setPendingIdea] = useState<IdeaBankItem | null>(null);
const [showQuadrantModal, setShowQuadrantModal] = useState(false);

// În handleAddItem:
const handleAddItem = async () => {
  if (newItemText.trim() && !isAdding) {
    setIsAdding(true);
    try {
      // Salvez cu priority 0 (unset)
      const newIdea = await ideasBankService.addIdea(newItemText.trim(), 'work', 0);
      setIdeas(prev => [newIdea, ...prev]);
      setNewItemText('');
      
      // Deschid modalul pentru clasificare
      setPendingIdea(newIdea);
      setShowQuadrantModal(true);
      
    } catch (error) { ... }
    finally { setIsAdding(false); }
  }
};

// Handler pentru selecție cadran:
const handleQuadrantSelect = async (priority: number) => {
  if (!pendingIdea) return;
  
  // Dacă e Eliminator (priority 1), confirm ștergere
  if (priority === 1) {
    await handleDelete(pendingIdea.id);
    toast({ title: "Idee eliminată", description: "Nu era importantă/urgentă" });
  } else {
    await ideasBankService.updateIdea(pendingIdea.id, { priority });
    setIdeas(prev => prev.map(i => 
      i.id === pendingIdea.id ? { ...i, priority } : i
    ));
    toast({ title: "Idee clasificată!", description: `Cadran: ${getQuadrantLabel(priority)}` });
  }
  
  setShowQuadrantModal(false);
  setPendingIdea(null);
  inputRef.current?.focus();
};

// Handler skip:
const handleSkipClassification = () => {
  setShowQuadrantModal(false);
  setPendingIdea(null);
  toast({ title: "Idee salvată", description: "Poți clasifica mai târziu" });
  inputRef.current?.focus();
};

// Handler analyze:
const handleAnalyzeFromModal = () => {
  setShowQuadrantModal(false);
  if (pendingIdea) {
    setSelectedIdea(pendingIdea);
    setIsAnalysisModalOpen(true);
  }
};
```

### C. Modific `HotList.tsx` - Mobile Add Button

```typescript
// Linia 194-203, îmbunătățesc butonul:
{isMobile && newItemText.trim() && (
  <Button
    size="sm"
    onClick={handleAddItem}
    disabled={isAdding}
    className="h-10 px-4 shrink-0 bg-primary text-primary-foreground font-medium"
  >
    {isAdding ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <>
        <Plus className="w-4 h-4 mr-1" />
        <span>Adaugă</span>
      </>
    )}
  </Button>
)}
```

**Schimbări cheie:**
- Butonul apare DOAR când există text (evită confuzie)
- Măresc din `h-9 w-9` în `h-10 px-4`
- Adaug text "Adaugă" pentru claritate
- Adaug Loader în timpul salvării

### D. Modific `HotList.tsx` - Acțiuni Mobile

```typescript
// Linia 327, schimb:
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

// În:
<div className={cn(
  "flex items-center gap-1 transition-opacity",
  isMobile ? "opacity-70" : "opacity-0 group-hover:opacity-100"
)}>
```

### E. Input Hint pe Desktop

```typescript
// Adaug text hint în input:
placeholder={isAdding 
  ? "Se salvează..." 
  : `${t('addItem')}... ${!isMobile ? '(Enter ↵)' : ''}`
}
```

---

## Fișiere de Modificat/Creat

| Fișier | Acțiune |
|--------|---------|
| **NOU:** `src/components/door/IdeaQuadrantModal.tsx` | Creez componenta modal |
| `src/components/door/HotList.tsx` | Integrez modalul, fix mobile, acțiuni vizibile |
| `src/types/eisenhower.ts` | Export funcție `getQuadrantLabel()` helper |

---

## Flow Complet după Implementare

### Desktop:
1. Utilizatorul scrie ideea în input
2. Apasă Enter
3. Apare mini-modalul cu 4 cadrane
4. Click pe cadran → clasifică și închide
5. "Sări peste" → salvează fără clasificare
6. "Analizează" → deschide AI chat
7. Focus revine automat la input

### Mobile:
1. Utilizatorul scrie ideea
2. Apare butonul "➕ Adaugă" vizibil
3. Tap pe buton → salvează ideea
4. Apare Sheet (de jos) cu 4 cadrane
5. Tap pe cadran → clasifică
6. Acțiunile pe fiecare idee sunt vizibile permanent (opacity-70)

---

## UI Modal Propus

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│  📝 "Finalizează raportul Q1"                        │
│                                                      │
│  ┌─────────────────────┬─────────────────────┐       │
│  │                     │                     │       │
│  │    ⚡ REACTOR       │    ✨ CREATOR       │       │
│  │    Important+Urgent │    Important        │       │
│  │       Fă ACUM       │     Planifică       │       │
│  │                     │                     │       │
│  ├─────────────────────┼─────────────────────┤       │
│  │                     │                     │       │
│  │   👥 DELEGATOR      │   🗑️ ELIMINATOR     │       │
│  │      Urgent         │    Neimportant      │       │
│  │      Delegă         │      Șterge         │       │
│  │                     │                     │       │
│  └─────────────────────┴─────────────────────┘       │
│                                                      │
│       ← URGENT                    NU URGENT →        │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │    ⏭️ Sări peste (clasifici mai târziu)      │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │    🧠 Analizează cu AI                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Testing

1. **Desktop - Modal:** Adaugă idee → verifică că apare modalul → selectează cadran → verifică salvare
2. **Desktop - Skip:** Adaugă idee → click "Sări" → verifică că ideea rămâne neclasificată
3. **Desktop - AI:** Adaugă idee → click "Analizează" → verifică că se deschide AI modal
4. **Mobile - Buton:** Scrie text → verifică că apare butonul "Adaugă"
5. **Mobile - Acțiuni:** Verifică că Brain/Target/X sunt vizibile fără hover
6. **Mobile - Modal:** Adaugă idee → verifică că apare Sheet de jos
7. **Eliminator:** Selectează Eliminator → verifică că se șterge ideea

