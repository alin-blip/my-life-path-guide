# Plan: Auto-activare Calendar Time-Block + Sync Domino Door

## Obiectiv
1. Activează automat widget-ul `time-block-calendar` pentru toți userii (existenți și noi).
2. Taskurile din Domino Door („sarcini") apar automat pe ore în calendar, nu doar în coșul de „nealocate".

---

## 1. Auto-activare widget

**`src/config/dashboardWidgets.ts`**
- Schimbă `DEFAULT_WIDGETS` din `[]` în:
  ```ts
  [{ id: 'time-block-calendar', enabled: true, order: 0, size: 'large' }]
  ```

**`src/hooks/useDashboardWidgets.ts`**
- În `fetchWidgets()`, după ce se citesc preferințele din DB:
  - Dacă `time-block-calendar` **nu există** în array-ul salvat → injectează-l ca enabled și salvează silent.
  - Dacă există dar e `enabled: false` → respectăm decizia userului (nu forțăm).

---

## 2. Auto-sync Domino Door → ore în calendar

Domino Door scrie deja în `user_tasks` (același tabel pe care îl citește calendarul). Problema: taskurile au `scheduled_time = null` → nu apar pe grila orară, doar în bin.

**Fișier nou: `src/utils/autoScheduleTasks.ts`**

Funcție `autoScheduleUnscheduledTasks(tasks)`:
- Filtrează taskurile cu `scheduled_time = null` AND `completed = false`.
- Pentru fiecare zi (`day_of_week`), distribuie pe ore începând **09:00**, sortat după:
  1. `priority` (1 → 4)
  2. `is_key_point = true` primul
  3. `position` / `created_at`
- Durată default: **60 min** (sau `duration_minutes` existent dacă e setat).
- Sare peste sloturi deja ocupate de taskuri cu `scheduled_time` setat.
- Limită superioară: **20:00** (taskurile rămase rămân în bin).
- Pentru taskuri fără `day_of_week` → atribuie ziua curentă.
- Returnează `[{ id, scheduled_time, day_of_week, duration_minutes }]`.

**`src/hooks/useTimeBlockTasks.ts`**
- După `load()`, dacă există taskuri ne-programate → rulează `autoScheduleUnscheduledTasks` și face batch update prin `Promise.all` de `update().eq('id', ...)`.
- Marker `localStorage` `auto-scheduled-{weekKey}` ca să nu reruleze auto-schedule după ce userul mută manual taskurile înapoi în bin (în aceeași săptămână).

**`src/components/dashboard/widgets/TimeBlockCalendarWidget.tsx`**
- Buton mic „🪄 Re-distribuie" în header → șterge marker-ul localStorage și forțează re-rularea.

---

## Out of scope
- Nu modific Domino Door în sine.
- Nu adaug notificări push noi (Coach-ul Accountability deja vede taskurile programate).
- Fără modificări de schemă DB (toate coloanele necesare există deja).

---

## Detalii tehnice
- Algoritm rulează **client-side**; persistăm în DB doar prima dată per săptămână.
- Realtime subscription existent propagă update-urile între tab-uri.
- Folosim helper-ul existent `jsDayToAbbrev(new Date())` pentru ziua curentă.
