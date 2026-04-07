

# Audit Door: De ce nu se salvează task-urile

## Probleme identificate

### 1. CRITIC: Auto-save pentru HIT/DO liste este complet stricat
`useDoorStorageState.tsx` (linia 50-55) are un `useEffect` care setează un `setTimeout`, dar callback-ul doar face `return true` — **valoarea este ignorată complet**. Nimeni nu apelează `saveState()` automat. Aceasta înseamnă că dacă adaugi un task prin drag-drop sau alte mecanisme care nu apelează explicit `saveWeekLists`, modificările **nu se persistează niciodată** în baza de date.

Singurele salvări care funcționează sunt cele explicit codate în `useDoorLists` (toggle completion, update priority, delete). Dar drag-drop din HotList sau KeyPoints în TaskList (handleDrop în `useDoorDrag.tsx`, liniile 209-279) **nu apelează `saveWeekLists`** — doar actualizează starea locală React.

### 2. Realtime nu este activat pentru `user_tasks`
`useDoorLists` setează o subscripție realtime pe `user_tasks`, dar tabela **nu este adăugată în publicația `supabase_realtime`**. Subscripția nu primește niciun eveniment.

### 3. Build errors (NodeJS.Timeout) — stale
Fișierele afectate au deja `ReturnType<typeof setTimeout>`. Erorile de build pot fi cauzate de cache. Voi face o re-scriere minimală pe un fișier canonic pentru a forța rebuild.

---

## Plan de rezolvare

### Step 1: Adaugă auto-save real pentru HIT/DO în `useDoorStorage.tsx`
Adaugă un `useEffect` care, la schimbarea `hitList` sau `doList`, apelează `saveState` cu debounce de 1.5s (similar cu efectul existent pentru weekly plan). Aceasta este piesa lipsă — `useDoorStorageState` va fi simplificat doar la tracking refs.

### Step 2: Persistă drag-drop din HotList/KeyPoint în TaskList
În `useDoorDrag.tsx`, la handleDrop (liniile 209-237), după ce se adaugă în starea locală, apelează și `doorUserTasksService.addIdeaToWeek()` pentru a persista în DB — similar cu blocul deja existent pentru `idea-bank-item` (liniile 175-199).

### Step 3: Activează realtime pentru `user_tasks`
Creează o migrare SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE public.user_tasks;`

### Step 4: Forțează rebuild pentru a elimina erorile NodeJS stale
Adaugă `/// <reference lib="dom" />` în `tsconfig.json` sau fă un touch minimal pe fișierele afectate.

---

## Fișiere de modificat
1. `src/hooks/useDoorStorage.tsx` — adaugă auto-save effect pentru hitList/doList
2. `src/hooks/door/useDoorStorageState.tsx` — simplifică (elimină efectul broken)
3. `src/hooks/useDoorDrag.tsx` — persistă drag-drop HotList→TaskList în DB
4. Migrare SQL — activează realtime pe `user_tasks`
5. `tsconfig.json` sau fișiere timer — forțează rebuild curat

