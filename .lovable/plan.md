
# Plan: Integrare Tracking Challenge în Admin CRM

## Problema identificată
Sistemul de tracking (`useActivityTracker`) există dar **nu este activ** - nu este integrat nicăieri în aplicație. De aceea tabelul `crm_activity_timeline` este gol și nu există vizibilitate în admin asupra utilizatorilor care accesează Challenge-ul.

## Soluție în 4 pași

### 1. Activare Activity Tracker Global
Integrarea hook-ului `useActivityTracker` în componenta `Layout.tsx` pentru a începe să înregistreze automat:
- Page views (inclusiv `/challenge`, `/challenge/1`, `/challenge/2`, etc.)
- Sesiuni utilizator
- Device type și timestamp

Aceasta va popula automat tabelul `crm_activity_timeline` cu activitatea tuturor utilizatorilor autentificați.

### 2. Tracking Events Specifice pentru Challenge
Adăugarea de events explicite în `useChallengeProgress.tsx`:
- `challenge_started` - când un utilizator intră prima dată în challenge
- `challenge_day_started` - când deschide o zi
- `challenge_video_watched` - când marchează videoul ca vizionat  
- `challenge_day_completed` - când completează o zi
- `challenge_completed` - când termină toate cele 7 zile

### 3. Câmpuri noi în CRM pentru Challenge
Adăugarea de coloane în tabelul `crm_contact_profiles`:
- `challenge_started_at` - data când a intrat prima dată în challenge
- `challenge_current_day` - ziua curentă (1-7)
- `challenge_days_completed` - numărul de zile completate
- `challenge_completed_at` - data finalizării complete

### 4. Vizualizare Challenge în ContactProfile360
Adăugarea unui tab nou "Challenge" în profilul contactului care afișează:
- Progresul vizual pe cele 7 zile
- Data la care a completat fiecare zi
- Status curent (în curs, completat, abandonat)
- Timeline cu toate activitățile challenge

---

## Detalii Tehnice

### Fișiere de modificat:
1. `src/components/Layout.tsx` - import și utilizare useActivityTracker
2. `src/hooks/useChallengeProgress.tsx` - adăugare tracking events la fiecare acțiune
3. `src/hooks/useActivityTracker.ts` - extindere cu funcții helper pentru challenge
4. `src/components/admin/crm/ContactProfile360.tsx` - tab nou pentru challenge progress

### Migrație bază de date:
```sql
ALTER TABLE crm_contact_profiles 
ADD COLUMN challenge_started_at TIMESTAMPTZ,
ADD COLUMN challenge_current_day INTEGER DEFAULT 0,
ADD COLUMN challenge_days_completed INTEGER DEFAULT 0,
ADD COLUMN challenge_completed_at TIMESTAMPTZ;
```

### Estimare timp implementare:
~15-20 minute

### Rezultat final:
În admin vei putea vedea pentru fiecare contact:
- Dacă a intrat în challenge și când
- Care e progresul său (ziua curentă)
- Toate acțiunile făcute în challenge (timeline)
- Statistici agregate în ChallengeDropOffStats
