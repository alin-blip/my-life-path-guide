
# Plan: Chat General Challenge + Fix Wizard AI + Admin Vizibilitate Completa

## Probleme Identificate

### 1. Wizard Obiective AI - NU functioneaza (URGENT)
Edge function-ul `goal-wizard-ai` **nu este deployed**. Cand un client incearca sa seteze obiective, primeste eroare 404 ("Requested function was not found"). Aceasta este o problema critica de funnel - clientii nu pot finaliza setup-ul obiectivelor.

### 2. Lipseste Chat General in Challenge
In momentul de fata, in fiecare zi a challenge-ului exista:
- **AI Coach** (chat privat cu coach-ul AI - doar user-ul vede)
- **Comments** (sistem de comentarii pe `warriors_way_comments`)

Comments-ul functioneaza ca un forum, dar nu exista un **chat general live** unde toti participantii sa comunice in timp real, iar adminul sa poata modera (sterge mesaje, raspunde).

### 3. Admin nu are vizibilitate completa pe challenge
Tabul "Challenge" din CRM ContactProfile arata doar:
- Progresul pe zile (1-7)
- Timeline activitati

Nu arata:
- Ce comentarii a lasat user-ul in comunitate
- Ce a raspuns la exercitiile zilnice (declaratii, viziuni)
- Raspunsurile la intrebarile wizard-ului

---

## Ce se implementeaza

### Pas 1: Deploy `goal-wizard-ai` (Fix Urgent)
- Deploy edge function-ul care lipseste
- Aceasta rezolva eroarea "da eroare" raportata de client

### Pas 2: Chat General Challenge cu Moderare Admin
Se va adauga un **Chat de Grup** vizibil pe fiecare zi a challenge-ului, langa/sub AI Coach, unde:
- Toti participantii pot scrie si vedea mesajele tuturor
- Adminul poate **sterge** orice mesaj
- Adminul poate **raspunde** direct din chat

Implementare tehnica:
- Se reutilizeaza tabelul existent `warriors_way_comments` cu `module_id = "challenge-general-chat"` (sau per zi: `challenge-chat-day-1`)
- Se adauga politica RLS noua: **Adminii pot sterge orice comentariu** (acum doar user-ul isi poate sterge propriile mesaje)
- Se creeaza componenta `ChallengeLiveChat.tsx` - UI de chat live (nu forum) cu:
  - Mesaje in ordinea cronologica (cele mai noi jos)
  - Auto-scroll la mesaje noi
  - Buton de delete vizibil pentru admin pe fiecare mesaj
  - Badge "Admin" pe mesajele admin-ului
  - Realtime subscription pentru mesaje noi instant
- Se integreaza in paginile `ChallengeDay.tsx` si `ChallengeDayEnglish.tsx`

### Pas 3: Admin - Vizibilitate Completa per User in Challenge
Se va imbunatati tab-ul "Challenge" din `ContactProfile360` cu:
- **Comentariile user-ului**: Ce a scris in chat-ul general/comunitate (din `warriors_way_comments`)
- **Raspunsuri exercitii**: Declaratii Day 1, viziuni, raspunsuri la intrebari (din `challenge_responses` / `day1_responses`)
- **Conversatii AI Coach**: Deja exista in tab-ul "AI Chat" - ramane

### Pas 4: Pagina Admin dedicata Challenge
Se adauga un tab nou "Chat Moderare" in CRM Dashboard care afiseaza:
- Toate mesajele din chat-ul general challenge (toate zilele)
- Posibilitate de stergere si raspuns direct din admin
- Filtru pe zi

---

## Detalii Tehnice

### Deploy `goal-wizard-ai`
- Doar deploy - edge function-ul exista deja in cod (`supabase/functions/goal-wizard-ai/index.ts`)
- Functia foloseste `LOVABLE_API_KEY` cu modelul `google/gemini-2.5-flash`

### Tabel - Nu e nevoie de tabel nou
Se reutilizeaza `warriors_way_comments` cu `module_id` dedicat (ex: `challenge-live-chat-day-1`)

### RLS Policy noua pe `warriors_way_comments`
```sql
-- Adminii pot sterge orice comentariu
CREATE POLICY "Admins can delete any comment"
  ON warriors_way_comments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
```

### Componenta `ChallengeLiveChat.tsx`
- Afiseaza mesaje in ordine cronologica ascendenta (chat-style)
- Realtime subscription pe `warriors_way_comments` filtrat pe `module_id`
- Input de mesaj la baza
- Admin badge + buton delete pe fiecare mesaj

### Modificari pagini Challenge
- `ChallengeDay.tsx` si `ChallengeDayEnglish.tsx`: Se adauga `ChallengeLiveChat` ca tab sau sectiune separata alaturi de Comments si AI Coach
- Se adauga un Tabs component: "AI Coach" | "Chat General" | "Comunitate"

### Admin ChallengeProgressTab extins
- Query `warriors_way_comments` filtrat pe `user_id` si `module_id LIKE 'challenge%'` pentru a vedea toate comentariile user-ului
- Query `day1_responses` / `challenge_responses` pentru a vedea raspunsurile la exercitii

### CRM Dashboard - Tab "Chat Moderare"
- Componenta `ChallengeAdminChat.tsx`
- Lista mesaje din toate zilele cu filtru
- Delete + Reply direct din admin

## Ordine de Implementare
1. Deploy `goal-wizard-ai` (fix imediat)
2. RLS policy noua pentru admin delete
3. Componenta `ChallengeLiveChat.tsx` (chat general)
4. Integrare in paginile Challenge
5. Extindere `ChallengeProgressTab` cu comentarii + raspunsuri
6. Tab moderare chat in CRM Dashboard
