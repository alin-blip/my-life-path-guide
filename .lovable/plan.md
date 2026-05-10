## Brain Dump în Rutina de Seară

Adaug un tab nou „Brain Dump" în `EveningRoutineCard` care permite să scrii liber gândurile, iar AI-ul le clasifică și le rutează automat către Jurnal, Domino Door (HIT List cu Eisenhower), Ideas Bank sau Gratitudine.

### Flux UX

1. Tab nou **„🧠 Brain Dump"** (al 4-lea) lângă tab-urile existente
2. **Sus**: Input titlu + textarea mare (ca la Jurnal) — „Scrie tot ce ai în cap, fără filtru..."
3. **Buton „Analizează cu AI"** → trimite textul la edge function
4. **Jos**: Listă de itemi clasificați, fiecare cu:
   - Iconiță tip (📝 task / 💭 gând / 💡 idee / 🙏 gratitudine)
   - Text extras
   - Pentru task: badge Eisenhower (editabil) + selector zi (M/T/W/Th/F/Sa/Su) + selector destinație (HIT List / Do List)
   - Pentru gând: merge în Jurnal
   - Pentru idee: merge în Ideas Bank
   - Buton ✓ Confirmă / ✗ Ignoră per item
5. **Buton final**: „Salvează tot" → execută rutarea în paralel

### Fișiere

**Nou:**
- `supabase/functions/evening-brain-dump/index.ts` — folosește Lovable AI (`google/gemini-3-flash-preview`) cu tool `classify_brain_dump` care returnează array de `{type, text, priority?, suggestedDay?, destination?}`
- `src/components/dashboard/evening/BrainDumpTab.tsx` — UI tab + state
- `src/components/dashboard/evening/BrainDumpItem.tsx` — render per item cu `EisenhowerSelector` + day selector
- `src/hooks/useBrainDump.ts` — orchestrator: apel edge → parsing → save în paralel către `daily_progress` (gânduri/gratitudine), `user_tasks` (taskuri cu `week_key` + `task_type='hit'`/`'do'`), `user_ideas` (idei)

**Modificat:**
- `src/components/dashboard/EveningRoutineCard.tsx` — adaug al 4-lea tab `braindump`
- `supabase/config.toml` — `verify_jwt = false` nu e necesar (default OK pentru auth)

### Date salvate

| Tip AI | Tabel | Detalii |
|---|---|---|
| `task` | `user_tasks` | `week_key=door-week-YYYY-WW`, `task_type='hit'` (default) sau `'do'`, `priority` din Eisenhower (1-4), `day_of_week`, `title=text` |
| `thought` / `lesson` | `daily_progress` | append în `notes` cu prefix `[Brain Dump dd.MM]:`, `progress_data.brain_dump=true` |
| `idea` | `user_ideas` | `title=text`, `category='personal'` default |
| `gratitude` | `daily_progress` | append în `progress_data.gratitudes[]` |

### AI Prompt (esența)

System: „Ești un asistent care clasifică gânduri brute scrise seara. Pentru fiecare gând, returnează tipul (task/thought/idea/gratitude) și — dacă e task — sugerează prioritate Eisenhower (Q1-Q4) și zi din săptămâna curentă (Mar-Sâm). Tonul e empatic, ca Alin."

Tool `classify_brain_dump`:
```ts
{ items: [{ text: string, type: 'task'|'thought'|'idea'|'gratitude', priority?: 1|2|3|4, suggestedDay?: 'M'|'T'|...|'Su', destination?: 'hit'|'do', reasoning?: string }] }
```

### În afara scopului

- Voice input (faza 2)
- Editare retroactivă brain dumps vechi
- Notificări push reminder seara
- Vizualizare istoric brain dumps (poate veni separat)

### Verificare

- Tab apare la 4-lea în `EveningRoutineCard`
- Scriu „mâine sun 5 clienți + sunt anxios pentru meeting + ar fi mișto un newsletter săptămânal + mulțumesc pentru ziua bună" → AI separă 4 itemi cu tipuri corecte
- Confirm tot → task apare în Door HIT List Marți cu badge ⚡ Reactor, gândul în Jurnal, ideea în Ideas Bank, gratitudinea în secțiunea de mulțumiri