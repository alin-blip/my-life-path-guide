
# Plan: Fix Global Mouse Scroll

## Problema Identificată

Scroll-ul de pe mouse nu funcționează din cauza mai multor conflicte CSS:

1. **`overflow-y: visible !important`** pe `#root` - această valoare NU permite scroll
2. **Lipsă `position: relative`** pe containere - framer-motion aruncă warning pentru calcule scroll
3. **Container Index.tsx** fără overflow explicit

## Soluția

### 1. Modificare `src/index.css` (liniile 170-214)

**Problema:** `overflow-y: visible` pe `#root` blochează scroll-ul

```css
html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  height: auto;
  min-height: 100%;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
  overflow-x: hidden;
  overflow-y: scroll;
  max-width: 100vw;
  min-height: 100vh;
  height: auto;
  position: relative; /* CRITICAL pentru framer-motion */
}

#root {
  overflow-x: hidden;
  overflow-y: auto; /* SCHIMBAT de la visible */
  max-width: 100vw;
  min-height: 100vh;
  height: auto;
  position: relative; /* CRITICAL pentru framer-motion */
}
```

**Schimbări cheie:**
- `#root`: `overflow-y: visible` → `overflow-y: auto`
- Adăugat `position: relative` pe `body` și `#root` pentru framer-motion
- Eliminat `!important` care poate crea conflicte

### 2. Modificare `src/pages/Index.tsx` (linia 53)

**Problema:** Container-ul paginii nu are proprietăți de scroll

```tsx
// Înainte:
<div className="light min-h-screen bg-background">

// După:
<div className="light min-h-screen bg-background relative overflow-y-auto">
```

### 3. Modificare `src/components/landing/NewHeroSection.tsx` (linia 79)

**Problema:** Container cu `overflow-hidden` poate interfera

```tsx
// Înainte:
<section className="relative min-h-screen flex items-center ... overflow-hidden n8n-hero-gradient">

// După:
<section className="relative min-h-screen flex items-center ... overflow-x-hidden n8n-hero-gradient">
```

**Schimbat `overflow-hidden` în `overflow-x-hidden`** pentru a permite scroll vertical.

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/index.css` | Fix `#root` overflow + adăugare `position: relative` |
| `src/pages/Index.tsx` | Adăugare `relative overflow-y-auto` pe container |
| `src/components/landing/NewHeroSection.tsx` | Schimbare `overflow-hidden` → `overflow-x-hidden` |

## Detalii Tehnice

**De ce `overflow-y: visible` blochează scroll:**
- `visible` nu creează un scroll container
- Body/html au `overflow-y: scroll` dar `#root` cu `visible` nu propagă scroll-ul corect
- Când `#root` are `overflow-y: auto`, devine un scroll container valid

**De ce `position: relative` este necesar:**
- Framer-motion calculează scroll offset relativ la primul container cu poziție non-statică
- Fără `position: relative`, calculul eșuează și scroll events pot fi ignorate
- Warning-ul din consolă confirmă această problemă

**Testare după implementare:**
- Verifică scroll pe pagina Index (`/`)
- Verifică scroll în Challenge Day 1 (`/challenge/1`)
- Verifică scroll pe dashboard (`/dashboard`)
- Testează pe mobile și desktop
