# CEO Mind OS — Design System v1 ("Monolith")

> Reset total. Navy + gold extras direct din logo. Un singur material, un singur accent, zero zgomot.

---

## 1. Filozofie

- **Claritate** — fiecare element are un motiv. Fără ornament. Fără glow gratuit.
- **Ierarhie** — aurul marchează decizia. Restul susține. Nimic nu strigă.
- **Ritm** — spațiu generos. Hairline 1px. Tipografie ca structură.

Distribuție vizuală: **70% navy**, **25% cream**, **5% gold**. Cyan (#3FD0E8) doar pentru detalii circuit, niciodată CTA.

---

## 2. Tokens (HSL, pentru `src/index.css`)

```css
:root {
  /* Surface */
  --background:        222 60% 11%;   /* #0B1733 */
  --surface:           222 50% 16%;   /* #162447 */
  --card:              222 50% 16%;
  --popover:           222 55% 13%;
  --border:            222 30% 24%;   /* #2B3A5C */
  --input:             222 30% 24%;
  --ring:              41 65% 55%;

  /* Accent */
  --primary:           41 65% 55%;    /* #D4A84A gold */
  --primary-foreground: 222 60% 11%;
  --primary-glow:      41 80% 70%;    /* #E8C778 */
  --accent-circuit:    190 85% 60%;   /* #3FD0E8 — RAR */

  /* Text */
  --foreground:        40 25% 95%;    /* #F5EFE0 cream */
  --muted:             222 30% 22%;
  --muted-foreground:  222 15% 65%;   /* #9AA3B8 */

  /* State */
  --destructive:       0 65% 55%;
  --success:           150 50% 50%;

  /* Geometry */
  --radius: 0.5rem;
}

/* Light mode (folosit doar pe câteva landing pages) */
.light {
  --background:        40 25% 97%;
  --surface:           40 20% 94%;
  --foreground:        222 60% 11%;
  --border:            222 15% 85%;
  --primary:           41 65% 45%;
  --primary-foreground: 40 25% 97%;
  --muted-foreground:  222 15% 40%;
}
```

**Rezervat — NU se modifică:** `#10172d` rămâne exclusiv pe `/ebook-*` (vezi memory `style/ebook-funnel-theme-color`).

---

## 3. Tipografie

| Rol | Font | Weight | Size scale |
|---|---|---|---|
| Display | **Fraunces** (serif) | 600/700 + italic | 36 → 72 |
| Body / UI | **Inter** | 400/500/600 | 12 → 18 |
| Mono / numere | **JetBrains Mono** | 500/700 | 12 → 64 |

Convenții:
- H1/Hero: Fraunces Bold cu un cuvânt cheie în Fraunces **Italic Gold** (ex: *"Build the empire. Keep your soul."*).
- Section labels: `Inter 500 uppercase 11px tracking-wider`, cu prefix `—`.
- Numere mari: Fraunces Bold sau JetBrains Bold în gold.

---

## 4. Componente — variants noi

### Button (`src/components/ui/button.tsx`)
- `default` → gold solid, text navy, **fără shadow, fără translate-y**.
- `outline` → border 1px cream, hover bg `surface`.
- `ghost` → fără bg, doar text cream/muted.
- **Eliminate**: `gradient`, `glow`, `glass`.
- Radius: `rounded-md` (0.5rem). Fără `rounded-2xl`.

### Card (`src/components/ui/card.tsx`)
- `default` → `bg-surface border border-border` (1px hairline).
- **Eliminate**: `glass`, `gradient`, `elevated` (translate-y, shadow-xl).
- Hover: doar schimbare `border-color → primary/40`.

### Componente noi
- `<SectionLabel />` — `— LABEL TEXT` în gold, uppercase, 11px.
- `<StatBlock />` — număr mare gold + hairline + caption muted.
- `<HairlineDivider />` — 1px border-border cu spacing controlat.

---

## 5. Patterns

- **Hairline-only** — `border border-border`, niciodată shadow ca element principal de elevație.
- **Section breaks** — `<SectionLabel>` + headline serif + body sans, separate prin `py-24` sau `py-32`.
- **Quote** — bară verticală 2px gold + text Fraunces Italic.
- **Grid** — 12 coloane, container max `1200px`, gutter `24px`.

---

## 6. Plan de implementare

### Faza 1 — Foundation (1 sesiune)
1. Rescrie `src/index.css` cu tokens noi.
2. Update `tailwind.config.ts`: scoate `glass`, `goddess`, `goddess-gradient`, gradiente, `shadow-glow`. Adaugă `font-display: Fraunces`.
3. Adaugă în `index.html` link Google Fonts pentru Fraunces + Inter + JetBrains Mono.
4. Refactor `button.tsx` + `card.tsx` (variantele de mai sus).
5. Creează `<SectionLabel />`, `<StatBlock />`, `<HairlineDivider />` în `src/components/ui/`.

### Faza 2 — Public surfaces
- `src/pages/Index.tsx` + `src/components/landing/*` — aplică pattern-urile noi.
- Funnels: `Challenge*Landing.tsx`, `B2BLanding.tsx`, `MindCoachLanding.tsx`.
- **Excepție:** `EbookLanding.tsx` păstrează `#10172d`.

### Faza 3 — App core
- `Dashboard.tsx`, `Door.tsx`, `MindCoach.tsx`, `ChampionRoutine.tsx`.
- `GlobalTopBar.tsx` — hairline border, fără gradient text pe brand.

### Faza 4 — Restul (token-only)
Pagini secundare se schimbă automat odată ce nu mai folosesc culori hardcodate. Audit final cu `rg "text-(white|black)|bg-(white|black|purple|violet)"`.

---

## 7. Constraints (NU se modifică)

- Logica business, Supabase, edge functions, Voomly, Stripe.
- Persona AI Alin.
- `localStorage` keys (`rowarrior-sound-settings`, `pending_challenge_plan`, `door-week-*`).
- `#10172d` pe `/ebook-*`.
- Numele moștenite: Warrior Routine, Launch Accelerator (memory `brand/feature-naming-consistency`).

---

## 8. Livrabile generate

- 📄 `CEOMindOS_MoodBoard.pdf` — 8 pagini (manifest, palette, typography, components, patterns, landing hero, app dashboard, funnel).
- 📄 `DESIGN_SYSTEM.md` — acest document.

Pasul următor: aprobă planul → trec la **Faza 1** (tokens + button + card + componente noi).
