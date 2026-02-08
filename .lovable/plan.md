

# Transformare Layout Programe in Stil Skool Complet

## Rezumat

Cand utilizatorul deschide sectiunea "Programs" sau orice program (Challenge / Warrior Launch), side menu-ul principal WarriorOS dispare complet. In locul lui apare doar un buton "Warrior OS" pentru a reveni la dashboard, iar lectiile programului apar in sidebar-ul din stanga (exact ca in screenshot-ul Skool).

## Ce se schimba

### 1. Nou Layout: `ProgramsLayout.tsx`

Inlocuieste `<Layout>` pe toate paginile din zona Programs. Structura:

```text
Desktop:
┌──────────────────────────────────────────────────────────────────────┐
│  [← Warrior OS]                                    [🌙] [RO] [👤]  │
├──────────────────────────────────────────────────────────────────────┤
│  Community  │  Classroom  │  Calendar  │  Members  │  Leaderboards  │
├──────────────────────────────────────────────────────────────────────┤
│  [Optional Sidebar]        │  [Content Area]                        │
│  (Lectii/Zile program)     │  (Video + text + exercitii)            │
└──────────────────────────────────────────────────────────────────────┘

Mobile:
┌───────────────────────────┐
│  [← WOS]           [🌙👤] │
├───────────────────────────┤
│  👥 | 📚 | 📅 | 👤 | 🏆    │
├───────────────────────────┤
│  [☰ Lectii]  Titlu lectie │
├───────────────────────────┤
│  [Content - full width]   │
└───────────────────────────┘
```

Acest layout:
- NU afiseaza side menu-ul WarriorOS
- Are un header minimal cu butonul "Warrior OS" (link catre `/dashboard`)
- Include SkoolNavBar (Community | Classroom | Calendar | Members | Leaderboards)
- Accepta un `sidebar` prop optional pentru continutul sidebar-ului de lectii
- Pe mobil, sidebar-ul devine un Sheet/Drawer

### 2. Challenge cu Sidebar de Zile

Pagina `/challenge` si `/challenge/:day` primesc un sidebar in stanga cu toate cele 7 zile:

```text
┌──────────────────────────────────────────────────┐
│  Have It All Challenge                            │
│  ▓▓▓░░░░ 3/7 zile                                │
├──────────────────────────────────────────────────┤
│  ✓ Ziua 1 - Viziune + Declaratie                 │
│  ✓ Ziua 2 - Corp + Spirit                        │
│  ✓ Ziua 3 - Business + Domino Door               │
│  ▶ Ziua 4 - Warrior Routine (activa)              │
│  🔒 Ziua 5 - Accountability                      │
│  🔒 Ziua 6 - Idea List                           │
│  🔒 Ziua 7 - Membership                          │
└──────────────────────────────────────────────────┘
```

- Click pe o zi navigheaza la `/challenge/:day`
- Ziua curenta este evidentiata
- Zile completate au check verde
- Zile blocate au lacat

### 3. Warrior Launch pastreaza sidebar-ul existent

WarriorsWay.tsx deja are un sidebar cu module - il pastram, doar inlocuim `<Layout>` cu `<ProgramsLayout>`.

### 4. Programs.tsx (Classroom) fara sidebar

Cand esti pe pagina `/programs` (tab Classroom), nu exista sidebar - doar gridul de programe.

---

## Fisiere de creat

| Fisier | Descriere |
|--------|-----------|
| `src/components/programs/ProgramsLayout.tsx` | Layout nou pentru zona Programs (fara side menu WarriorOS, cu header minimal + SkoolNavBar) |
| `src/components/programs/ChallengeSidebar.tsx` | Sidebar cu cele 7 zile ale Challenge-ului (progres, locked/unlocked, activ) |

## Fisiere de modificat

| Fisier | Modificare |
|--------|------------|
| `src/pages/Programs.tsx` | Inlocuire `<Layout>` cu `<ProgramsLayout>`, structura ramane |
| `src/pages/WarriorsWay.tsx` | Inlocuire `<Layout>` cu `<ProgramsLayout>`, sidebar-ul existent integrat in layout |
| `src/pages/Challenge.tsx` | Inlocuire `<Layout>` cu `<ProgramsLayout>` + adaugare `ChallengeSidebar` |
| `src/pages/ChallengeDay.tsx` | Inlocuire `<Layout>` cu `<ProgramsLayout>` + adaugare `ChallengeSidebar` cu ziua curenta evidentiata |

---

## Detalii Tehnice

### ProgramsLayout.tsx

Props:
```typescript
interface ProgramsLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;       // Optional sidebar content (lesson list)
  activeTab?: SkoolTab;            // Which Skool tab is active (default: 'classroom')
  showNavBar?: boolean;            // Whether to show SkoolNavBar (default: true)
  onTabChange?: (tab: SkoolTab) => void;
}
```

Structura:
- Header fix cu: buton "Warrior OS" (navigate to /dashboard), theme toggle, language selector, user dropdown
- SkoolNavBar sub header (daca showNavBar=true)
- Area de continut: sidebar (daca exista) + main content
- Pe mobil: sidebar devine Sheet, deschis cu buton hamburger

### ChallengeSidebar.tsx

Props:
```typescript
interface ChallengeSidebarProps {
  currentDay?: number;  // Highlight current day
}
```

Foloseste `useChallengeProgress()` hook-ul existent pentru:
- `isDayUnlocked(day)` - determina daca ziua e accesibila
- `isDayCompleted(day)` - determina daca ziua e finalizata
- `completedDaysCount` - pentru progress bar
- `currentDay` - pentru highlight

Click pe o zi navigheaza la `/challenge/:day`. Ziua curenta are border activ.

### Modificari Challenge.tsx

Pagina `/challenge` (overview) va folosi:
```typescript
<ProgramsLayout 
  sidebar={<ChallengeSidebar />}
  activeTab="classroom"
>
  {/* Continutul existent: hero video, progress card, audio+script+chat */}
</ProgramsLayout>
```

Se scoate grid-ul de carduri cu zile (se muta in sidebar).

### Modificari ChallengeDay.tsx

Fiecare pagina de zi (`/challenge/:day`) va folosi:
```typescript
<ProgramsLayout 
  sidebar={<ChallengeSidebar currentDay={dayNumber} />}
  activeTab="classroom"
>
  {/* Continutul zilei: video, exercitii, comentarii */}
</ProgramsLayout>
```

### Modificari WarriorsWay.tsx

```typescript
<ProgramsLayout activeTab="classroom">
  <div className="flex h-full">
    {/* Sidebar-ul existent cu module */}
    <aside>{sidebarContent}</aside>
    {/* Area de continut */}
    <main>{selectedModule ? <VideoPlayer /> : <WelcomeScreen />}</main>
  </div>
</ProgramsLayout>
```

---

## Rezolvare Erori de Build

Analiza arata ca erorile de build sunt probabil legate de probleme de tip TypeScript. Vom verifica si rezolva orice erori la implementare.

---

## Compatibilitate

- Rutele existente (`/challenge`, `/challenge/:day`, `/warriors-way`, `/programs`) raman neschimbate
- Toata logica de progres, premium gate, autentificare se pastreaza
- SkoolNavBar permite navigarea intre Community/Classroom/Calendar/Members/Leaderboards din orice pagina de program
- Side menu-ul WarriorOS ramane functional pe toate celelalte pagini (Dashboard, The Door, Game Vision, etc.)

---

## Flux Utilizator

1. Din side menu, click pe **"Programs"** → se deschide `/programs` cu SkoolNavBar, fara side menu
2. Tab **Classroom** (default) → grid cu Challenge + Accelerator  
3. Click pe **Challenge** → `/challenge` cu sidebar de zile in stanga
4. Click pe **Ziua 3** din sidebar → `/challenge/3` cu sidebar activ pe Ziua 3
5. Click pe **"Warrior OS"** (buton din header) → inapoi la `/dashboard` cu side menu normal
6. Click pe **Community** tab → feed-ul comunitatii (BrotherhoodFeed)
7. Click pe **Members** tab → lista de membri
