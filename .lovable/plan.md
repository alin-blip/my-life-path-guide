

# Plan: Sincronizare Posturi + Calendar Complet stil Skool

## Problema 1: Postari lipsa in Warrior Tribe

**Cauza**: Toate postarile din `wall_posts` au `tribe_id = NULL`. Cand navighezi la grupul Warrior Tribe, componenta `GroupFeed` filtreaza dupa `tribe_id = '07825fb0-...'`, deci nu gaseste nimic. Postariie apar in Community doar daca acea componenta le afiseaza fara filtru (sau pe alta cale).

**Solutia**: 
- Migrare SQL: seteaza `tribe_id = MAIN_TRIBE_ID` pe toate postarile existente care au `tribe_id IS NULL`
- Adauga un default pe coloana `tribe_id` in `wall_posts` pentru a preveni pe viitor

## Problema 2: Calendar Tab - placeholder -> calendar complet

**Solutia**: Inlocuim `CalendarTab` (placeholder "Coming soon") cu un calendar lunar complet, inspirat de Skool (ca in imaginile atasate).

### Ce construim:

**A) Componenta Calendar Lunar** (`CalendarTab.tsx` - rescriere completa)
- Grid lunar (Luni-Duminica) cu navigare luna anterioara/urmatoare
- Buton "Today" pentru a reveni la luna curenta
- Ziua curenta evidentiata (cerc rosu/primary)
- Evenimentele apar in celulele zilelor respective (ex: "6pm - Warriors OS ...")
- Buton "+" pentru adaugare eveniment (vizibil doar pentru admin)
- Click pe eveniment deschide un dialog cu detalii (cover image, titlu, data/ora, location, descriere, buton "ADD TO CALENDAR")

**B) Dialog "Add Event"** (stil Skool - ca in screenshot)
- Campuri: Title, Date (date picker), Time (dropdown), Duration (dropdown), Timezone (auto-detectat din profil)
- Checkbox "Recurring event"
- Location (dropdown: Skool call, Custom link, In person)
- Description (textarea cu limita 300 caractere)
- Upload cover image
- Access control: All members / Members on level / Members in group
- Checkbox "Remind members by email 1 day before"
- Butoane: CANCEL, ADD

**C) Dialog detalii eveniment** (la click pe eveniment in calendar)
- Cover image (daca exista)
- Titlu, data/ora formatata, timezone
- Meeting URL (link clickable)
- Descriere
- Buton "ADD TO CALENDAR" (genereaza link .ics / Google Calendar)
- RSVP status si numar participanti

### Date din baza de date

Tabelul `tribe_events` exista deja cu toate campurile necesare:
- id, tribe_id, created_by, title, description, event_type
- start_at, end_at, location, meeting_url
- is_recurring, recurrence_rule, max_attendees

Hook-ul `useCoachTribeEvents` exista si gestioneaza CRUD + RSVP. Il vom refolosi, conectandu-l la `MAIN_TRIBE_ID`.

### Coloane noi necesare pe `tribe_events`:
- `cover_image_url` (text, nullable) - pentru cover image
- `timezone` (text, nullable) - timezone-ul evenimentului
- `duration_minutes` (integer, nullable) - durata in minute
- `remind_before` (boolean, default false) - reminder email

## Detalii tehnice

### Fisiere modificate

| Fisier | Ce se schimba |
|---|---|
| `src/components/programs/CalendarTab.tsx` | Rescriere completa: calendar lunar cu grid, evenimente, navigare |
| `src/hooks/useCoachTribeEvents.ts` | Fara modificari - deja functional |

### Fisiere noi

| Fisier | Descriere |
|---|---|
| `src/components/programs/CalendarGrid.tsx` | Componenta grid lunar cu celule zilnice si afisare evenimente |
| `src/components/programs/AddEventDialog.tsx` | Dialog "Add event" stil Skool cu toate campurile din screenshot |
| `src/components/programs/EventDetailDialog.tsx` | Dialog detalii eveniment cu cover, info si "Add to Calendar" |

### Migrare SQL

1. Update posturi existente: `UPDATE wall_posts SET tribe_id = '07825fb0-...' WHERE tribe_id IS NULL`
2. Adauga coloane pe `tribe_events`: `cover_image_url`, `timezone`, `duration_minutes`, `remind_before`

### Logica "Add to Calendar"

Generam un link Google Calendar cu parametrii:
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={description}&location={location}
```

### Fluxul utilizatorului

1. User navigheaza la /programs?tab=calendar
2. Vede calendarul lunar cu evenimentele existente
3. Admin-ul vede butonul "+" si poate adauga eveniment
4. Click pe eveniment -> dialog cu detalii si "Add to Calendar"
5. Timezone-ul se detecteaza automat din `Intl.DateTimeFormat().resolvedOptions().timeZone`

