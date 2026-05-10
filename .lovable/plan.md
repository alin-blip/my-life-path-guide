# Time-Block Calendar Widget pe Dashboard

## Scop
Un widget tip calendar pe dashboard care afișează **azi** și **mâine** lângă lângă, cu taskurile așezate pe ore (ca în Google Calendar). Poți muta taskurile între zile / între ore prin drag & drop. Sus ai un selector de săptămână. Taskurile vin direct din Domino Door (Hit List / Do List). Coach-ul Accountability știe ce ai planificat la fiecare oră și te anunță.

## Ce vede utilizatorul

```text
┌──────────────────────────────────────────────────────────────┐
│  ⏱  Time-Block Calendar         [‹ Săpt 20 ›] [Azi] [+ Task] │
├───────────────────────────┬──────────────────────────────────┤
│  AZI — Lun 11 Mai         │  MÂINE — Mar 12 Mai              │
├───────────────────────────┼──────────────────────────────────┤
│ 06:00                     │ 06:00                            │
│ 07:00 ▓ Workout (60m) 🔥  │ 07:00                            │
│ 08:00                     │ 08:00 ▓ Deep work (90m) 🔥       │
│ 09:00 ▓ Email batch (30m) │ 09:30                            │
│  ...                      │  ...                             │
│ 22:00                     │ 22:00                            │
├───────────────────────────┼──────────────────────────────────┤
│ 📥 Fără oră (3)           │ 📥 Fără oră (1)                  │
│  • Call client            │  • Reply Andrei                  │
└───────────────────────────┴──────────────────────────────────┘
```

- **Header**: navigator săptămână (◂ ▸), buton "Azi", buton "+ Task".
- **2 coloane**: Azi și Mâine (când navighezi cu săpt., devin "Ziua X" și "Ziua X+1").
- **Grid orar**: 06:00–22:00, slot la 30 min. Cardul de task are înălțime proporțională cu `duration_minutes`.
- **Card task**: titlu, durată, badge Eisenhower (1=🔥 urgent+important, 2=⭐, 3=⚡, 4=💤). Click → popover cu editare (oră, durată, ziua, șterge).
- **Bin "Fără oră"**: taskuri din Domino Door fără `scheduled_time`. Le tragi sus în grid pentru a le ancora.
- **Drag & drop**: schimbi ora, durata (resize), ziua (între coloane).
- **Sub form +Task inline**: titlu + oră + durată + zi + prioritate.

## Sursa de date
Folosește tabelul existent `user_tasks` (deja are `scheduled_time` și `duration_minutes`, `day_of_week`, `week_key`, `priority`, `list_type`). Nu se duplică datele — exact aceleași taskuri din Domino Door apar în calendar.

## Integrare Domino Door
- Modificările făcute în calendar (mutare zi, ora, durată) se reflectă instant în Domino Door (același `user_tasks` + Supabase Realtime).
- Reciproc: ce setezi în Domino Door (Hit/Do list) apare în calendar (în "Fără oră" dacă nu are `scheduled_time`).

## Integrare AI Coach (Accountability)
Edge function `accountability-coach` primește în context lista de taskuri programate cu ora pentru azi. Adaugă o regulă:
> "Dacă ora curentă este în interval de ±15 min față de un task programat, menționează-l proactiv: «E 09:00 — ai blocat 90 min pentru Deep Work. Începi acum?»"

## Fișiere noi
- `src/components/dashboard/widgets/TimeBlockCalendarWidget.tsx` — container principal
- `src/components/dashboard/widgets/timeblock/DayColumn.tsx` — coloană zi (grid orar + bin)
- `src/components/dashboard/widgets/timeblock/HourSlot.tsx` — drop target pe oră
- `src/components/dashboard/widgets/timeblock/TimeBlockTask.tsx` — card task draggable + popover edit
- `src/components/dashboard/widgets/timeblock/InlineAddTaskForm.tsx` — formular adaugă rapid
- `src/hooks/useTimeBlockTasks.ts` — load/save/realtime + handlers drag
- `src/utils/timeBlockHelpers.ts` — conversii oră↔slot, calcul înălțime card

## Fișiere modificate
- `src/config/dashboardWidgets.ts` — înregistrează widget `time-block-calendar` (size: large, category: productivity)
- `src/components/dashboard/widgets/index.ts` — export
- `supabase/functions/accountability-coach/index.ts` — interogare taskuri programate + injectare în prompt

## Tehnologii
- `@dnd-kit/core` (deja folosit în proiect dacă există; altfel `react-dnd`) pentru drag & drop
- `date-fns` pentru manipulare săptămână (`startOfWeek`, `addDays`, `format`)
- Supabase Realtime channel pe `user_tasks` filtrat după `user_id` + `week_key` curent

## DB — fără migrație necesară
Coloanele `scheduled_time` (time) și `duration_minutes` (int) deja există pe `user_tasks` conform investigării anterioare. Adăugăm doar un index opțional pentru performanță.

## În afara scopului
- Push notifications native (rămâne pe AI Coach textual)
- Vizualizare pe lună / vizualizare 7 zile complete
- Sync Google Calendar / Outlook
- Repeat tasks (zilnic/săptămânal automat)
- Notificări sonore în browser

## Confirmare
Apasă "Implement plan" ca să încep construcția widget-ului.
