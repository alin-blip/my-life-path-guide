
# Pasul 2: Fix ProtectedRoute + Curatenie + HeroInlineChat

## 1. ProtectedRoute - Adaugare rute lipsa in BASIC_ROUTES

Toate rutele protejate din App.tsx care NU sunt in `BASIC_ROUTES` si ar trebui sa fie accesibile pentru utilizatorii BASIC:

| Ruta lipsa | Ce face |
|---|---|
| `/stack` | Stack System (sesiuni transformare) |
| `/stack-library` | Biblioteca de stack-uri |
| `/stack/view` | Vizualizare stack individual |
| `/master-plan` | Master Plan System |
| `/core` | Core values |
| `/daily-four` | Daily Four routine |
| `/library` | Biblioteca de resurse |
| `/notes` | Note personale |
| `/business` | Business dashboard |
| `/voice-analysis` | Analiza vocala |
| `/daily-timeline` | Timeline zilnic |
| `/empowerment-meditation` | Meditatie empowerment |
| `/biz4-report` | Raport Business 4 |
| `/champion-routine-history` | Istoric rutina campion |
| `/workout` | Antrenamente |
| `/workout-history` | Istoric antrenamente |
| `/relationships` | Relatii |
| `/widget-dashboard` | Dashboard widget-uri |
| `/leaderboard` | Clasament |
| `/achievements` | Realizari |
| `/emotional-tracker` | Tracker emotional |
| `/time-tracker` | Tracker timp |
| `/accountability-coach` | Coach responsabilitate |
| `/quick-quiz` | Quiz rapid |
| `/coach` | Coach Dashboard |
| `/programs` | Pagina programe |
| `/personal-power` | Personal Power curs |
| `/ultimate-you` | Ultimate You curs |
| `/groups` | Pagini grupuri |
| `/messages` | Mesaje |
| `/mind-coach` | Mind Coach AI |
| `/support` | Suport |
| `/dashboard/settings` | Setari dashboard |
| `/warrior-accelerator-thank-you` | Thank you page |
| `/vision-2026/dashboard` | Vision dashboard |

**Total: ~35 rute lipsa care trebuie adaugate**

### Fisier modificat
`src/components/ProtectedRoute.tsx` - adaugare rute in `BASIC_ROUTES`

---

## 2. Curatenie HeroInlineChat (cod mort dupa eliminarea SalesCoach)

Dupa eliminarea SalesCoachWidget, componentele `HeroInlineChat` si `NewHeroSection` inca au props `onAskQuestion` si `onOpenChat` care nu mai fac nimic (sunt apelate cu `undefined`). Butoanele din HeroInlineChat apar pe landing page dar nu au niciun efect la click.

### Optiuni:
- **Eliminam complet HeroInlineChat** din hero section (nu mai are functionalitate)
- **Sau** il transformam sa redirectioneze la `/auth` in loc sa deschida chat-ul

### Fisiere modificate:
- `src/components/landing/NewHeroSection.tsx` - eliminare props si HeroInlineChat
- `src/components/landing/HeroInlineChat.tsx` - stergere fisier (optional)

---

## 3. Stergere fisiere temporare nefolosite

| Fisier | Motiv |
|---|---|
| `src/components/stack/TemporaryDatabaseFix.tsx` | Nu este importat nicaieri |
| `src/services/napoleonHillDraftService.ts` | Re-export legacy |
| `src/services/napoleonHillBackupService.ts` | Re-export legacy |
| `src/services/napoleonHillProjectService.ts` | Re-export legacy |

Inainte de stergerea fisierelor Napoleon Hill, se verifica daca sunt importate undeva.

---

## Rezumat tehnic

| Actiune | Fisier |
|---|---|
| Adaugare ~35 rute | `src/components/ProtectedRoute.tsx` |
| Eliminare HeroInlineChat | `src/components/landing/NewHeroSection.tsx` |
| Stergere HeroInlineChat | `src/components/landing/HeroInlineChat.tsx` |
| Stergere temp fix | `src/components/stack/TemporaryDatabaseFix.tsx` |
| Stergere legacy re-exports | 3 fisiere napoleonHill*.ts |

Nu sunt necesare migrari de baza de date.
