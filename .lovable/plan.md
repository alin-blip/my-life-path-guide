

# Plan: Mutare Challenge și Accelerator în Programs + Actualizare Tour Platformă

## Rezumat

Mutăm "Have It All Lifestyle Challenge" și "Warrior Launch Accelerator" într-o nouă secțiune **"Programs"** (în stilul Skool Classroom), păstrând toată funcționalitatea existentă și actualizând widget-ul de tour pentru a reflecta noua structură.

---

## Ce rămâne neschimbat

- **Side menu complet** cu Dashboard, The Door, Game Vision, Rutina Războinicului, Stacks, Brotherhood, Tools, etc.
- **Funcționalitatea Challenge** - toată logica de progres, autentificare, zile, premium gate
- **Funcționalitatea Accelerator** - toate lecțiile, modulele, video-uri, AI mentor
- **Rutele existente** - `/challenge`, `/challenge/:day`, `/warriors-way` continuă să funcționeze

---

## Ce se modifică

### 1. Creare pagină Programs.tsx (nouă)

Pagină nouă `/programs` care afișează un grid de carduri în stil Skool:

```text
┌─────────────────────────────────────────────────────┐
│  📚 Programe                                        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                   │
│  │  [THUMB]    │  │  [THUMB]    │                   │
│  │  🔥 FREE    │  │  ⭐ PREMIUM  │                   │
│  ├─────────────┤  ├─────────────┤                   │
│  │ Have It All │  │ Warrior     │                   │
│  │ 7-Day       │  │ Launch      │                   │
│  │ Challenge   │  │ Accelerator │                   │
│  │ ▓▓▓░░ 43%   │  │ ▓░░░░ 10%   │                   │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

### 2. Creare ProgramCard.tsx (nouă)

Componentă reutilizabilă pentru carduri de program:
- Thumbnail imagine
- Badge-uri: "FREE", "PREMIUM", "NEW"
- Titlu și descriere scurtă
- Progress bar cu procentaj
- Click navigă la program

### 3. Modificare SideMenu.tsx

Înlocuim cele 2 intrări separate cu o singură secțiune "Programs":

```text
ÎNAINTE:
- Have It All Challenge
- Warrior Launch Accelerator
---
- Dashboard
...

DUPĂ:
- 📚 Programs → /programs
---
- Dashboard
...
```

### 4. Actualizare SpotlightTour.tsx (DASHBOARD_TOUR_STEPS)

Modificăm pașii de tour pentru a reflecta noua structură:

**Înainte:**
- Step 6: `a[href="/challenge"]` - "Have It All Lifestyle Challenge"
- Step 7: `a[href="/warriors-way"]` - "Warrior Launch Accelerator"

**După:**
- Step 6: `a[href="/programs"]` - "📚 Programs - Cursuri și Challenge-uri"
  - Descriere: "Accesează toate programele: Challenge-ul de 7 zile (gratuit) și Warrior Launch Accelerator (premium). Fiecare program te ghidează pas cu pas."

### 5. Actualizare Day1PlatformTour.tsx

Adăugăm modulul "Programs" în lista de module prezentate:

```typescript
{
  id: 'programs',
  titleRo: 'Programe',
  titleEn: 'Programs',
  descriptionRo: 'Challenge-ul de 7 zile și Acceleratorul - cursuri structurate pas cu pas.',
  descriptionEn: '7-day Challenge and Accelerator - step-by-step structured courses.',
  icon: GraduationCap,
  gradient: 'from-orange-500 to-red-500'
}
```

### 6. Modificare App.tsx

Adăugăm ruta nouă pentru Programs:

```typescript
<Route path="/programs" element={
  <ProtectedRoute>
    <Programs />
  </ProtectedRoute>
} />
```

---

## Fișiere de creat

| Fișier | Descriere |
|--------|-----------|
| `src/pages/Programs.tsx` | Pagina principală Programs cu grid de carduri |
| `src/components/programs/ProgramCard.tsx` | Card individual pentru un program |
| `src/components/programs/ProgramGrid.tsx` | Container grid pentru carduri |

## Fișiere de modificat

| Fișier | Modificare |
|--------|------------|
| `src/components/SideMenu.tsx` | Înlocuire Challenge + Accelerator cu "Programs" |
| `src/components/onboarding/SpotlightTour.tsx` | Actualizare DASHBOARD_TOUR_STEPS |
| `src/components/challenge/day1/Day1PlatformTour.tsx` | Adăugare modul Programs |
| `src/App.tsx` | Adăugare rută `/programs` |

---

## Detalii tehnice

### Programs.tsx - Structura

```typescript
// Date pentru carduri - folosesc hook-urile existente
const programs = [
  {
    id: 'challenge-7-zile',
    title: 'Have It All Lifestyle Challenge',
    description: 'Break free from burnout in 7 days',
    thumbnail: '/challenge-thumbnail.jpg',
    path: '/challenge',
    isFree: true,
    badge: 'FREE',
    // Progres din useChallengeProgress()
  },
  {
    id: 'warrior-accelerator',
    title: 'Warrior Launch Accelerator',
    description: '47+ video lessons on business & transformation',
    thumbnail: '/accelerator-thumbnail.jpg',
    path: '/warriors-way',
    isPremium: true,
    price: '€497',
    badge: 'PREMIUM',
    // Progres din useWarriorsCourse()
  }
];
```

### ProgramCard.tsx - Design

Componentă în stil Skool cu:
- Aspect ratio 16:9 pentru thumbnail
- Badge overlay în colț (FREE/PREMIUM/NEW)
- Gradient overlay pe imagine
- Titlu bold, descriere truncată
- Progress bar în footer
- Hover effect cu scale și shadow

### SideMenu.tsx - Modificări

```typescript
// ÎNAINTE
{ title: 'Have It All Challenge', icon: Flame, path: '/challenge', badge: `${completedDays}/7` },
{ title: 'Warrior Launch Accelerator', icon: GraduationCap, path: '/warriors-way', badge: 'NEW' },

// DUPĂ
{ 
  title: 'Programs', 
  icon: BookOpen, // sau GraduationCap
  path: '/programs',
  badge: completedDays > 0 ? `${completedDays}/7` : undefined
},
```

### SpotlightTour.tsx - Pas nou

```typescript
{
  id: 'programs-info',
  targetSelector: 'a[href="/programs"]',
  route: '/dashboard',
  requiresSidebar: true,
  title: { 
    en: '📚 Programs - Courses & Challenges', 
    ro: '📚 Programe - Cursuri & Challenge-uri' 
  },
  description: { 
    en: 'Access all programs: 7-Day Challenge (free) and Warrior Launch Accelerator (premium). Each program guides you step by step.',
    ro: 'Accesează toate programele: Challenge-ul de 7 zile (gratuit) și Warrior Launch Accelerator (premium). Fiecare program te ghidează pas cu pas.'
  },
  icon: <BookOpen className="h-8 w-8 text-orange-500" />,
  position: 'right'
}
```

---

## Mobile UX

### Programs.tsx pe mobil
- Grid 1 coloană (full width)
- Carduri stacked vertical
- Touch-friendly (padding mare pe carduri)
- Progress bar vizibil clar

### SideMenu pe mobil
- "Programs" cu badge progres vizibil
- Click deschide pagina Programs
- Funcționalitatea drawer/sheet rămâne identică

---

## Compatibilitate inversă

- Ruta `/challenge` rămâne funcțională → navigare directă la challenge
- Ruta `/warriors-way` rămâne funcțională → navigare directă la accelerator
- Ruta `/challenge/:day` rămâne funcțională → zile individuale
- Progresul existent se păstrează (folosim aceleași hook-uri)

---

## Timeline estimat

1. **ProgramCard.tsx** - 15 min
2. **Programs.tsx** - 20 min
3. **SideMenu.tsx modificări** - 10 min
4. **SpotlightTour.tsx modificări** - 10 min
5. **Day1PlatformTour.tsx modificări** - 5 min
6. **App.tsx rută nouă** - 5 min
7. **Testare și ajustări** - 15 min

**Total: ~80 minute**

---

## Beneficii

1. **Organizare** - Toate programele/cursurile într-un singur loc
2. **Scalabilitate** - Ușor de adăugat noi cursuri în viitor
3. **Claritate** - Utilizatorii văd imediat ce programe sunt disponibile
4. **Stil Skool** - Familiar pentru utilizatorii care vin din Skool
5. **Side menu mai curat** - O singură intrare în loc de două

