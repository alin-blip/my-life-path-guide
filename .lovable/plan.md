
# Implementare Comunitate Interna tip Skool pentru Warriors OS

## Situatia actuala

Platforma are deja o infrastructura solida de grupuri ("Tribes") cu:
- **Feed social** cu postari, comentarii, like-uri (GroupFeed)
- **Chat** in timp real (GroupChat)
- **Classroom** cu lectii si module (CoachTribeLessons)
- **Calendar** cu evenimente (CoachTribeCalendar)
- **Leaderboard** cu gamificare (CoachTribeGamification)
- **Members** management (GroupMembers)
- **Grup principal** "Warrior Tribe" (366 membri, auto-join la signup)

Problema: Tab-ul "Comunitate" din GlobalTopBar duce la `/programs?tab=community` care **nu are content** - cade pe `default` si afiseaza ClassroomTab.

## Solutia propusa

Transformam tab-ul "Comunitate" din navigarea principala intr-un **hub de comunitate real**, folosind grupul principal "Warrior Tribe" (ID: `07825fb0-4d6c-4716-b2f3-27a1708cf680`) ca sursa de date. Exact ca in Skool - primul lucru pe care il vede utilizatorul este **feed-ul comunitatii**.

### Structura de navigare (identica cu Skool)

```text
GlobalTopBar:
  [Comunitate]  -->  /programs?tab=community  (Feed-ul principal - DEFAULT)
  [Cursuri]     -->  /programs?tab=classroom  (Lista cursuri)

SkoolNavBar (sub-navigare):
  Community | Classroom | Groups | Calendar | Members | Leaderboards | Settings(admin)
```

## Ce se modifica

### 1. SkoolNavBar - Adaugare tab "Community" ca PRIMUL tab

Se adauga `{ id: 'community', labelEn: 'Community', labelRo: 'Comunitate', icon: Users }` la inceputul listei de tab-uri. Aceasta este prima pagina pe care o vad utilizatorii - exact ca in Skool.

### 2. Componenta noua: CommunityFeedTab

O componenta care afiseaza feed-ul grupului principal WarriorOS cu:
- **Zona de scriere post** (SkoolWritePost) - pentru membri
- **Feed de postari** cu like-uri, comentarii (SkoolPostCard)
- **Sidebar** cu informatii despre comunitate (numar membri, descriere, reguli)

Refoloseste `GroupFeed` existent cu `tribeId` hardcodat la grupul principal.

### 3. Programs.tsx - Adaugare case 'community' + fix default

- Adaugare `case 'community': return <CommunityFeedTab />`
- Fix linia 22: default de la `'community'` la `'community'` (acum cu content real)

### 4. GlobalTopBar - Corectare logica isActive

Fixarea detectiei tab-ului activ pentru ca "Comunitate" sa fie highlighted corect cand e selectat.

### 5. Groups tab ramane separat

Tab-ul "Groups" continua sa afiseze lista tuturor grupurilor (inclusiv ale coach-ilor). Click pe un grup duce la `/groups/:groupId` cu experienta completa existenta (feed, chat, classroom, calendar, leaderboard).

## Arhitectura pentru Coach-i

Sistemul functioneaza la 2 niveluri:

| Nivel | Cine | Ce vede |
|-------|-------|---------|
| **Comunitatea Platformei** | Toti utilizatorii | Feed-ul din tab-ul "Community" - grupul principal "Warrior Tribe" |
| **Grupul Coach-ului** | Clientii coach-ului | Grup separat in "Groups" cu feed, cursuri, calendar, leaderboard proprii |

Coach-ii isi creeaza propriul grup din tab-ul "Groups", invita clientii, si au control total (feed, lectii, calendar, gamificare) - infrastructura deja existenta.

## Fisiere implicate

| Fisier | Modificare |
|---|---|
| `src/components/programs/CommunityFeedTab.tsx` | **NOU** - feed comunitate principala cu sidebar |
| `src/components/programs/SkoolNavBar.tsx` | Adaugare tab "Community" ca primul din lista |
| `src/pages/Programs.tsx` | Adaugare `case 'community'`, fix default tab |
| `src/components/global/GlobalTopBar.tsx` | Fix logica `isActive` |

## Fara migrari de baza de date

Toata infrastructura exista deja:
- Tabelul `tribes` cu grupul principal (366 membri)
- `tribe_members` cu auto-join la signup
- `wall_posts` cu `tribe_id` pentru filtrare
- Componente `GroupFeed`, `SkoolPostCard`, `SkoolWritePost` functionale
- Realtime updates deja configurate
