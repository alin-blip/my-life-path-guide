
# Plan: Pagina Tools + Integrare Framework-uri de Storytelling

## Problema Identificată

| Problemă | Cauză |
|----------|-------|
| `/tools` dă 404 | Ruta nu există în App.tsx - doar în meniu |
| Storytelling Framework nu e accesibil | Componenta există dar nu e integrată |
| Hero's Journey nu e accesibil | Componenta există dar nu e integrată |
| Path to Success funcționează | Este în Stack.tsx dar necesită URL direct |

## Soluția

### 1. Crearea paginii `/tools` - Tools.tsx

O pagină dedicată care listează toate tool-urile AI disponibile în formă de carduri:

```text
┌─────────────────────────────────────────────────────────────────┐
│  🛠️ AI Tools & Frameworks                                       │
│  Unelte AI pentru transformare și creație de conținut           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ 📖 Storytelling │ │ 🗺️ Hero's      │ │ 🏔️ Path to     │    │
│  │ Framework       │ │ Journey         │ │ Success         │    │
│  │                 │ │                 │ │                 │    │
│  │ 7 Elemente ale  │ │ 7 Etape ale     │ │ 7 Pași spre     │    │
│  │ unei povești    │ │ călătoriei      │ │ transformare    │    │
│  │ captivante      │ │ eroului         │ │ totală          │    │
│  │                 │ │                 │ │                 │    │
│  │  [Deschide →]   │ │  [Deschide →]   │ │  [Deschide →]   │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📂 Alte unelte existente:                                 │  │
│  │ Lifebook • Vibe Canvas • Vision Board • Focus Room        │  │
│  │ Journal • Notes • Time Tracker • Emotional Tracker        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Integrarea în Stack.tsx

Adăugarea Storytelling și Hero's Journey în switch-ul din `renderActiveStack()`:

```typescript
case "storytelling":
  return <StorytellingStack language={language} onAddToHitList={stackProps.onAddToHitList} />;
case "hero-journey":
  return <HeroJourneyStack language={language} onAddToHitList={stackProps.onAddToHitList} />;
```

### 3. Adăugarea rutei în App.tsx

```typescript
const Tools = lazy(() => import("./pages/Tools"));

// În Routes:
<Route path="/tools" element={
  <ProtectedRoute>
    <Tools />
  </ProtectedRoute>
} />
```

## Fișiere de Creat

| Fișier | Descriere |
|--------|-----------|
| `src/pages/Tools.tsx` | Pagina principală pentru AI Tools cu carduri interactive |

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/App.tsx` | Adaugă ruta `/tools` și lazy import |
| `src/pages/Stack.tsx` | Adaugă case-uri pentru `storytelling` și `hero-journey` |

## Detalii Tehnice

### Tools.tsx - Structura Paginii

```typescript
// Categorii de tools
const aiFrameworks = [
  {
    id: 'storytelling',
    name: 'Storytelling Framework',
    description: '7 Elemente ale unei Povești Captivante',
    icon: BookOpen,
    color: 'purple',
    path: '/stack?type=storytelling'
  },
  {
    id: 'hero-journey',
    name: "Hero's Journey",
    description: '7 Etape ale Călătoriei Eroului (Joseph Campbell)',
    icon: Compass,
    color: 'cyan',
    path: '/stack?type=hero-journey'
  },
  {
    id: 'path-to-success',
    name: 'Calea spre Succes',
    description: '7 Pași pentru Transformare Totală (Tony Robbins)',
    icon: Mountain,
    color: 'amber',
    path: '/stack?type=path-to-success'
  }
];

const existingTools = [
  { name: 'Lifebook', path: '/lifebook', icon: BookOpen },
  { name: 'Vibe Canvas', path: '/vibe-canvas', icon: Palette },
  { name: 'Vision Board', path: '/vision-board', icon: Sparkles },
  // ... etc
];
```

### Stack.tsx - Import și Switch Update

```typescript
// Importuri noi
import { StorytellingStack } from '@/components/content-creation/StorytellingStack';
import { HeroJourneyStack } from '@/components/content-creation/HeroJourneyStack';

// În switch din renderActiveStack():
case "storytelling":
  return <StorytellingStack 
    language={language} 
    onComplete={(script) => {
      toast({ title: "Script generat!", description: "Verifică scriptul și salvează-l." });
    }}
  />;
case "hero-journey":
  return <HeroJourneyStack 
    language={language}
    onComplete={(script) => {
      toast({ title: "Script generat!", description: "Verifică scriptul și salvează-l." });
    }}
  />;
```

## URL-uri Finale

| Tool | URL |
|------|-----|
| Tools Page | `/tools` |
| Storytelling | `/stack?type=storytelling` |
| Hero's Journey | `/stack?type=hero-journey` |
| Path to Success | `/stack?type=path-to-success` |

## Beneficii

- **Un singur loc** pentru toate AI tools-urile
- **Carduri vizuale** care arată clar ce face fiecare tool
- **Navigare rapidă** între diferite framework-uri
- **Extensibilitate** - ușor de adăugat noi tools în viitor
