
# Unificare Cursuri, Programe si Napoleon Hill

## Problema

Exista doua locuri separate pentru continut educational:
1. **`/programs?tab=classroom`** - 4 cursuri (Challenge, Personal Power, Ultimate YOU, Warrior Accelerator)
2. **`/learn`** - Napoleon Hill (Carte zilnica, Master Plan, AI Coaching, Progres)

Utilizatorul trebuie sa navigheze in doua locuri diferite. SideMenu are "Programe" SI "Cursuri" ca intrari separate.

## Solutia

Mutam continutul Napoleon Hill (Learn) IN tab-ul "Classroom" din `/programs`, ca o sectiune separata. Eliminam pagina `/learn` ca destinatie independenta si redirectionam catre `/programs?tab=classroom`.

### Structura noua a tab-ului Classroom

```text
/programs?tab=classroom
  |
  +-- SECTIUNEA 1: Cursuri & Programe
  |   - Have It All Lifestyle Challenge
  |   - Personal Power Plus
  |   - The Ultimate YOU
  |   - Warrior Launch Accelerator
  |   + Admin courses (localStorage)
  |
  +-- SECTIUNEA 2: Success Principles (Napoleon Hill)
  |   - Carte Zilnica (DailyBookPage)
  |   - Master Plan (Proiecte + Journey)
  |   - AI Coaching (link-uri catre stacks)
  |   - Progres (Analytics + Leaderboard)
  |
  +-- Coming Soon
```

### Navigare simplificata

```text
GlobalTopBar:  [Comunitate]  [Cursuri]
SideMenu:      Programe (un singur link, nu doua)
```

## Fisiere modificate

| Fisier | Ce se schimba |
|---|---|
| `src/components/programs/ClassroomTab.tsx` | Adaugare sectiune "Success Principles" sub lista de cursuri - include Tabs cu Book / Master Plan / AI Coaching / Progress, refolosind componentele din Learn.tsx |
| `src/pages/Programs.tsx` | Fara modificari majore (ClassroomTab primeste deja programs ca prop) |
| `src/components/SideMenu.tsx` | Eliminare intrarea separata "Cursuri" (`/learn`). Pastram doar "Programe" (`/programs`) |
| `src/App.tsx` | Adaugare redirect: `/learn` -> `/programs?tab=classroom` (pastreaza backward compatibility) |
| `src/pages/Learn.tsx` | Ramane ca fisier dar nu mai este ruta principala (redirect) |

## Detalii tehnice

### ClassroomTab.tsx - Sectiunea Napoleon Hill

Sub grila de cursuri existenta, adaugam o sectiune noua cu un `Tabs` component intern:

- **Carte** - randeaza `DailyBookPage`
- **Master Plan** - randeaza proiecte, journey, dashboard, knowledge (exact ca in Learn.tsx)
- **AI Coaching** - link-uri catre `/stack?type=napoleon-hill`
- **Progres** - `AnalyticsDashboard` + `Leaderboard`

### SideMenu.tsx

Eliminam intrarea "Cursuri" (linia 158-162) care duce la `/learn`. Pastram doar "Programe" care duce la `/programs`.

### App.tsx

Adaugam: `<Route path="/learn" element={<Navigate to="/programs?tab=classroom" replace />} />`

Aceasta asigura ca orice link vechi catre `/learn` functioneaza in continuare.

## Nu sunt necesare migrari de baza de date

Toate componentele si datele sunt deja existente - doar le reorganizam vizual.
