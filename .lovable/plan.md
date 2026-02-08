
# Transformare Programs in Stil Skool.com Complet

## Problema Curenta

Pagina Programs arata doar un grid cu 2 carduri (Challenge si Accelerator) fara:
- Bara de navigare Skool-style (Community | Programs | Calendar | Members | Leaderboards)
- Cand deschizi un program, lectiile sa fie intr-un sidebar stanga (nu in accordion vertical cum e acum)

## Ce Facem

### 1. Adaugam Skool Navigation Bar in pagina Programs

O bara orizontala de navigare deasupra continutului, cu tab-uri:
- **Community** - reutilizeaza BrotherhoodFeed + BrotherhoodChat
- **Classroom** (Programs) - grid-ul actual cu carduri
- **Calendar** - placeholder pentru evenimente viitoare
- **Members** - reutilizeaza BrotherhoodMembers
- **Leaderboards** - reutilizeaza GlobalLeaderboard + QuestSystem

Pe mobil, bara va avea scroll orizontal cu touch-friendly spacing.

### 2. Restructuram view-ul unui Program deschis (Skool Classroom Style)

Cand utilizatorul da click pe un program (de ex. Warrior Launch Accelerator):
- **Sidebar stanga**: lista de lectii/module grupate pe sectiuni (cu progres, locked/unlocked, completed)
- **Area principala dreapta**: continutul lectiei selectate (video player, text, actiuni)
- Pe mobil: sidebar-ul devine un drawer/sheet care se deschide cu un buton

## Detalii Tehnice

### Fisiere Noi

| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/SkoolNavBar.tsx` | Bara navigare orizontala stil Skool |
| `src/components/programs/CommunityTab.tsx` | Tab comunitate (reuses BrotherhoodFeed/Chat) |
| `src/components/programs/CalendarTab.tsx` | Tab calendar (placeholder) |
| `src/components/programs/MembersTab.tsx` | Tab membri (reuses BrotherhoodMembers) |
| `src/components/programs/LeaderboardsTab.tsx` | Tab clasament (reuses GlobalLeaderboard) |
| `src/components/programs/ClassroomTab.tsx` | Tab classroom (gridul actual cu carduri) |

### Fisiere Modificate

| Fisier | Modificare |
|--------|------------|
| `src/pages/Programs.tsx` | Adauga SkoolNavBar + tab system cu continut conditional |
| `src/pages/WarriorsWay.tsx` | Restructurare: sidebar stanga cu lectii + area dreapta cu video (stil Skool classroom) |

### SkoolNavBar - Structura

```text
Desktop:
┌──────────────────────────────────────────────────────────────────────┐
│  Community  │  Classroom  │  Calendar  │  Members  │  Leaderboards  │
│                              ___                                     │
└──────────────────────────────────────────────────────────────────────┘

Mobile (scroll horizontal):
┌──────────────────────────────────...
│  👥 Community  │  📚 Classroom  │  📅 Calendar  │  👤 Members  │ ...
└──────────────────────────────────...
```

Tab-ul activ va avea underline colorat. Se va folosi `useState` + URL search params (`?tab=community`) pentru persistenta.

### Warrior Launch Accelerator - Layout Nou (Skool Classroom Style)

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [Sidebar Lectii]              │  [Continut Lectie]                   │
│                                │                                       │
│  ▼ Călătoria unui Războinic     │  ┌─────────────────────────────┐     │
│    ✓ 1. Punctul de Start       │  │                             │     │
│    ○ 2. Cele 6 Etape           │  │       VIDEO PLAYER          │     │
│    ○ 3. Cele 7 Etape           │  │                             │     │
│    ...                          │  └─────────────────────────────┘     │
│  ▼ Calea Războinicului          │                                       │
│    🔒 8. Prăpastia Sărăciei    │  Titlul lectiei                      │
│    🔒 9. Vârful Prosperității  │  Descriere si actiuni                 │
│    ...                          │                                       │
│  ▼ Codul Războinicului          │  [Comentarii lectie]                  │
│    🔒 13. Faptele Reale        │                                       │
│    ...                          │                                       │
└───────────────────────────────────────────────────────────────────────┘
```

Pe mobil, sidebar-ul devine un Sheet/Drawer care se deschide cu un buton hamburger, iar continutul lectiei ocupa tot ecranul.

### Programs.tsx - Restructurare Completa

Pagina `/programs` devine hub-ul principal cu tab-uri:

- **Tab default: "classroom"** - afiseaza gridul de programe
- Click pe **Community** - afiseaza BrotherhoodFeed
- Click pe **Calendar** - afiseaza placeholder cu evenimente
- Click pe **Members** - afiseaza BrotherhoodMembers
- Click pe **Leaderboards** - afiseaza GlobalLeaderboard + QuestSystem

### WarriorsWay.tsx - De la Accordion la Sidebar Layout

Restructuram complet layout-ul:
- Inlocuim layout-ul cu accordion cu un layout flex cu 2 coloane
- Sidebar stanga (w-80 pe desktop): lista sectiuni colapsabile cu lectii
- Area dreapta (flex-1): video player + informatii lectie + comentarii
- Pastram TOATA logica existenta (premium gate, admin access, purchase check, AI mentor)
- Sidebar-ul va avea evidenta lectiei selectate (highlight activ)

### Challenge.tsx

Challenge-ul ramane neschimbat deocamdata (are un format diferit cu zile, nu lectii video), dar este accesibil din grid-ul de programe.

## Plan de Implementare

**Pasul 1**: Cream `SkoolNavBar.tsx` - componenta de navigare orizontala
**Pasul 2**: Cream tab-urile individuale (CommunityTab, CalendarTab, MembersTab, LeaderboardsTab, ClassroomTab)
**Pasul 3**: Restructuram `Programs.tsx` pentru a integra SkoolNavBar + tab system
**Pasul 4**: Restructuram `WarriorsWay.tsx` cu layout sidebar stanga + continut dreapta
**Pasul 5**: Testare si ajustari responsive

## Ce Ramane Neschimbat

- Side menu-ul principal (Dashboard, The Door, etc.)
- Toate rutele existente (/challenge, /warriors-way, /brotherhood, /leaderboard)
- Logica de progres, autentificare, premium gate
- Tour-ul platformei (deja actualizat)
- Challenge-ul (format diferit, ramane ca atare)
