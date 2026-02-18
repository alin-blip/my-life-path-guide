
# Unificare Comunitate - Audit si Plan

## Situatia curenta

Exista 3 sisteme separate care fac partial acelasi lucru:

1. **Brotherhood** (`/brotherhood`) - redirectioneaza catre `/programs?tab=community`, contine Feed global, Chat, Tribes, Members
2. **Community Tab** (`/programs?tab=community`) - feed global cu postari, categorii, sidebar
3. **Group Page** (`/groups/:id`) - pagina individuala per grup cu Feed, Chat, Members, About

### Ce exista deja functional
- Postari cu like-uri, comentarii, media upload
- Chat realtime per grup
- Creare/join/leave grupuri (publice/private)
- Roluri de membri (owner, admin, moderator, member)
- **Componente coach** pentru cursuri, calendar si gamificare (exista in cod dar NU sunt integrate in pagina grupului)

### Ce lipseste

**A. Cursuri/Lectii in grupuri** - componentele `CoachTribeLessons` exista dar nu apar in GroupPage. Tabelele `tribe_courses` si `tribe_course_modules` exista in baza de date.

**B. Calendar/Evenimente in grupuri** - `CoachTribeCalendar` exista dar nu e integrat. Tabelul `tribe_events` exista.

**C. Gamificare in grupuri** - `CoachTribeGamification` exista dar nu e integrat. Tabelele `tribe_badges`, `tribe_points`, `tribe_user_badges` exista.

**D. Setari grup** - nu exista posibilitatea de a edita descrierea, cover image, toggle public/privat din interfata grupului.

**E. Moderare** - nu exista optiuni de pin/delete postari, promovare/retrogradare roluri, ban membri.

**F. Navigare unificata** - nu exista un punct unic de acces "Comunitate" in platforma.

---

## Plan de implementare

### Etapa 1: Integrare cursuri, calendar si gamificare in GroupPage

Adaugam tab-urile "Classroom", "Calendar" si "Leaderboard" in `GroupHeader.tsx` si le randam in `GroupPage.tsx`, reutilizand componentele existente din `src/components/coach/`:
- `CoachTribeLessons` - pentru cursuri si module
- `CoachTribeCalendar` - pentru evenimente
- `CoachTribeGamification` - pentru puncte, badge-uri, clasament

Aceste tab-uri vor fi vizibile tuturor membrilor, dar actiunile de creare/editare vor fi restrictionate la owner si admin.

### Etapa 2: Setari si moderare grup

Adaugam un tab "Settings" vizibil doar owner-ului/admin-ului care permite:
- Editare nume, descriere, cover image
- Toggle public/privat
- Managementul rolurilor membrilor (promovare la admin/mod, kick)

Adaugam actiuni de moderare pe postari (pin, delete) pentru owner/admin/mod.

### Etapa 3: Unificare navigare

- Redenumim totul la "Comunitate" / "Community"
- Eliminam duplicarile: pagina Brotherhood veche ramane redirect
- Adaugam "Community" ca tab vizibil in SkoolNavBar (deja exista ca tip dar nu e afisat)
- Feed-ul comunitar principal devine agregat din toate grupurile utilizatorului

### Detalii tehnice

**Fisiere modificate:**
- `src/components/groups/GroupHeader.tsx` - adaugam tab-uri: Classroom, Calendar, Leaderboard, Settings
- `src/pages/GroupPage.tsx` - randam componentele coach existente pe noile tab-uri
- `src/components/groups/GroupSettings.tsx` - componenta noua pentru setari grup
- `src/components/groups/GroupModActions.tsx` - componenta noua pentru actiuni moderare pe postari

**Componente reutilizate (fara modificari):**
- `CoachTribeLessons` - cursuri si module
- `CoachTribeCalendar` - evenimente
- `CoachTribeGamification` - puncte si badge-uri

**Baza de date:** Nu necesita migrari - tabelele `tribe_courses`, `tribe_course_modules`, `tribe_events`, `tribe_badges`, `tribe_points`, `tribe_user_badges` exista deja cu RLS configurat.

Vrei sa incepem cu Etapa 1 (integrarea cursurilor, calendarului si gamificarii)?
