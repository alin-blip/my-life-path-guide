# Plan: Audit vizual — pachet complet (1–12)

## 1. Bare duplicate (critic)
- În `src/App.tsx` (sau layout-ul global): ascunde `GlobalTopBar` pe rutele care au deja sidebar + header propriu (`/dashboard`, `/tools`, `/door`, `/champion-routine`, `/stacks/*`, `/minte/*`, `/coach/*`).
- Sau invers: păstrează doar `GlobalTopBar` și scoate logo-block-ul de sus din `AppSidebar`. Decizie: păstrez `GlobalTopBar` pentru Comunitate/Cursuri/Mesaje/Notificări și scot logo-ul duplicat din sidebar (sidebar începe direct cu meniul).

## 2. Emoji-uri stricate (□) (critic)
- În `index.css` adaug `font-family` body cu fallback: `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla', emoji`.
- Verific dacă emoji-urile sunt hardcodate ca text — dacă da, le înlocuiesc cu iconițe `lucide-react` consistente (Brain, Sparkles, Dumbbell, Heart, Briefcase, Smile, Frown etc.) pentru cardurile de emoții din MindCoach și tour.

## 3. Ruta /chat → 404 (critic)
- Verific `src/App.tsx` routes. Ori adaug `<Route path="/chat" element={<Chat/>}/>` (există `src/pages/Chat.tsx`), ori redirecționez `/chat` → `/mind-coach` (sau spre ruta corectă).

## 4. Overlay-uri simultane (critic)
- În `TourContext` / `useOnboardingTour`: amână tour-ul cu un guard — nu se afișează dacă există `<Dialog open>` deja activ (Plan Next Week, Domino welcome). Show one-at-a-time queue.
- Setez ordine: 1) închide modal Plan Next Week → 2) închide welcome popover → 3) abia apoi lansează tour.

## 5. Door — coloana "Idei" se sparge (layout)
- `src/pages/Door.tsx` / componenta Idei: `min-w-0` pe coloană + `break-words` pe titlul ideii. Înlocuiesc grid-ul cu lățimi fixe cu `grid-cols-[minmax(220px,1fr)_minmax(280px,1.2fr)_minmax(280px,1fr)]` sau switch la stack vertical sub `lg`.

## 6. Rutina — gol vizual sub carduri (layout)
- `ChampionRoutineFlow`: containerul interior `min-h-[calc(100vh-headers)]` se duce la fundul ecranului. Fie umplem cu un `RoutineBackdrop` decorativ (radial gold faint în josul ecranului, hairline gold sus și pattern stele subtil), fie `max-h-fit` + fundal navy doar până la conținut.
- Decizie: lăsăm înălțimea, dar adăugăm un backdrop decorativ (radial faint gold + grain texture) pentru a evita golul plat.

## 7. NotFound pe temă navy (layout)
- Refactor `src/pages/NotFound.tsx`: fundal `bg-background` (navy), text `text-foreground`, accent gold pe „Return to Home", font Display pentru titlu.

## 8. Banner Membership — contrast slab
- Banner-ul de pe Dashboard (Early Bird / Activează Membership): schimb fundal de la gold solid la navy raised cu hairline gold + textul rămâne pe navy (text-foreground), iar prețul mare se păstrează gold pentru accent.

## 9. Vision Board — overlay-uri prea opace
- Pe imaginile pilon de pe Dashboard: reduc overlay-ul de la `bg-black/70` la gradient `from-background/95 via-background/40 to-transparent` doar de jos, ca etichetele Corp / Spiritualitate / Familie / Business să fie clare iar imaginea să respire.

## 10. MindCoach — bloc deconectat
- Unesc cardul cu 4 etape (Identifică / Clarifică / Transformă / Acționează) cu cardul de selecție emoții într-un singur shell premium (același bg navy gradient + hairline gold), separate doar de divider gold subțire.

## 11. GlobalTopBar pe paleta navy/gold
- `GlobalTopBar.tsx`: `bg-[hsl(222_55%_8%/0.85)] backdrop-blur` + border-bottom `border-[hsl(var(--primary)/0.18)]`. Hover pe taburi: `text-primary`. Icoanele Mesaje/Notificări primesc hover gold.

## 12. Sidebar navy/gold
- `AppSidebar`: bg `linear-gradient(180deg, hsl(222 55% 8%), hsl(222 60% 5%))`, divider-uri hairline gold, item activ: bg `hsl(var(--primary)/0.12)` + border-stânga gold + text gold, hover subtle `hsl(var(--primary)/0.06)`. Iconițele primesc tile-uri 28×28 cu radial gradient gold doar pentru item activ.
- Scot logo-block-ul de sus (conform pct.1). Adaug label discret "CEO MIND OS" jos cu micro-versiune + status streak.

## Fișiere atinse (estimat)
- `src/App.tsx` (routes /chat, gating GlobalTopBar)
- `src/components/global/GlobalTopBar.tsx`
- `src/components/AppSidebar.tsx` (sau echivalentul layout-ului)
- `src/index.css` (emoji font stack, possible token tweak)
- `src/context/TourContext.tsx` + `src/hooks/useOnboardingTour.ts`
- `src/pages/Door.tsx` + componenta Idei (DoorIdeasColumn)
- `src/components/champion-routine/ChampionRoutineFlow.tsx` (backdrop)
- `src/pages/NotFound.tsx`
- `src/pages/DashboardPage.tsx` (banner + Vision Board overlays)
- `src/pages/MindCoach.tsx` (shell unificat)

## Ordine de execuție
1. Quick wins (1, 2, 3, 7) → bara dublă, emoji-uri, ruta, NotFound.
2. Overlay queue (4).
3. Coerență brand (11, 12, 8, 9, 10).
4. Layout polish (5, 6).
