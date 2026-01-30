
# Plan: Implementare Completă Funcționalitate Notițe

## Problema Curentă

Pagina `/notes` este un **placeholder gol** care nu face nimic:
- Butonul "Notiță Nouă" nu are funcționalitate
- Nu există stocare (nici în baza de date, nici în localStorage)
- Nu se pot crea, vizualiza sau edita notițe

## Soluție Propusă

Vom implementa un sistem de notițe funcțional similar cu Jurnalul, dar cu diferențe:
- **Jurnal**: intrări zilnice cu reflecții și lecții
- **Notițe**: note rapide, fără restricții de dată, cu categorii

---

## Fișiere de Creat/Modificat

| Fișier | Acțiune |
|--------|---------|
| `src/pages/Notes.tsx` | **Rescris complet** - pagină cu CRUD pentru notițe |
| `src/components/notes/NoteEditor.tsx` | **NOU** - Editor pentru creare/editare notițe |
| `src/components/notes/NotesList.tsx` | **NOU** - Lista de notițe cu căutare și filtrare |
| `src/components/notes/NoteCard.tsx` | **NOU** - Card pentru afișare notiță individuală |
| `src/hooks/useNotes.ts` | **NOU** - Hook pentru management notițe (localStorage + DB) |

---

## Detalii Tehnice

### 1. Structura Notelor

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'business' | 'health' | 'relationships' | 'ideas' | 'other';
  color?: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. Hook useNotes

Strategia de stocare (în absența unui tabel dedicat):

**Opțiunea A** - localStorage (imediat funcțional):
```typescript
const STORAGE_KEY = 'sacred-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setNotes(JSON.parse(saved));
  }, []);
  
  const saveNote = (note: Note) => { /* ... */ };
  const deleteNote = (id: string) => { /* ... */ };
  const updateNote = (id: string, updates: Partial<Note>) => { /* ... */ };
  
  return { notes, saveNote, deleteNote, updateNote };
};
```

**Opțiunea B** - Tabel Supabase (necesită migrare):
- Creăm tabel `notes` cu RLS policies
- Sincronizare cloud pentru utilizatori autentificați

Propun **Opțiunea A acum** (localStorage) + **Opțiunea B mai târziu** când e nevoie.

### 3. Pagina Notes.tsx Rescrisă

```text
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                        │
│  [← Back to Dashboard]  Notițe Sacre  [+ Notiță Nouă]         │
│                                                                 │
│  [🔍 Caută...]  [Filtru Categorie ▼]                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NOTES GRID (2-3 coloane responsive)                           │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │ 📌 Note │  │   Note  │  │   Note  │                        │
│  │ Titlu   │  │  Titlu  │  │  Titlu  │                        │
│  │ Preview │  │ Preview │  │ Preview │                        │
│  │ [Cat]   │  │  [Cat]  │  │  [Cat]  │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
│                                                                 │
│  ┌─────────┐  ┌─────────┐                                     │
│  │   Note  │  │   Note  │                                     │
│  │  Titlu  │  │  Titlu  │                                     │
│  │ Preview │  │ Preview │                                     │
│  │  [Cat]  │  │  [Cat]  │                                     │
│  └─────────┘  └─────────┘                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NOTE EDITOR (Dialog/Modal)                                    │
│                                                                 │
│  [Titlu: ____________________________________________]         │
│                                                                 │
│  [Categorie: Personal ▼]                                       │
│                                                                 │
│  [Conținut:                                                    │
│   _______________________________________________________     │
│   _______________________________________________________     │
│   _______________________________________________________]    │
│                                                                 │
│  [📌 Pin]  [🗑️ Șterge]           [Anulează] [💾 Salvează]    │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Funcționalități

- **Creare**: Modal cu titlu, categorie, conținut
- **Vizualizare**: Grid de carduri cu preview
- **Editare**: Click pe card → editor modal
- **Ștergere**: Confirmare + ștergere
- **Căutare**: Filtrare în timp real
- **Categorii**: Personal, Business, Sănătate, Relații, Idei, Altele
- **Pin**: Note importante apar primele
- **Culori**: Opțional - fundal colorat per notă

### 5. Design

- **Stil**: Consistent cu restul aplicației (dark theme, gradients)
- **Grid responsive**: 1 coloană mobile, 2 tablet, 3 desktop
- **Animații**: Fade in/out pentru adăugare/ștergere
- **Iconuri**: Lucide icons (Pin, Trash2, Edit, Plus, Search)

---

## Pași de Implementare

1. **Creez hook `useNotes.ts`** - logica de stocare localStorage
2. **Creez `NoteCard.tsx`** - componentă pentru afișare notiță
3. **Creez `NoteEditor.tsx`** - modal/dialog pentru creare/editare
4. **Creez `NotesList.tsx`** - grid cu căutare și filtrare
5. **Rescriu `Notes.tsx`** - pagina completă cu toate componentele
6. **Opțional**: Adaug tabel Supabase pentru sincronizare cloud

---

## Rezultat Așteptat

După implementare:
- Utilizatorii pot crea notițe rapide
- Notițele se salvează în localStorage (instant funcțional)
- Pot căuta și filtra după categorie
- Pot fixa (pin) notițe importante
- Pot edita și șterge notițe existente
- Design consistent cu restul platformei
