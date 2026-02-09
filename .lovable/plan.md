

# Personal Power Plus -- Program de 30 de Zile (Plan Actualizat)

## Rezumat

Crearea unui curs complet de 30 de zile bazat pe PDF-ul "Personal Power Plus", integrat in platforma Warrior OS. Fiecare zi va avea: continut text complet (fara prescurtari), audio TTS, exercitii interactive, AI Coach, **sectiune de Breakthrough** si **integrare completa cu Community**.

**Important**: Continutul ramane EXACT asa cum este in carte. Nu se scurteaza, nu se inventeaza. Se inlocuieste doar referinta directa la Tony Robbins cu formulari de tipul "mentorul nostru", "din experienta de coaching", "asa cum am invatat de la Tony Robbins, acest plan..."

**Faza 1**: Zilele 1-5 (aceasta implementare)

---

## Structura fiecarei zile (5 sectiuni)

Fiecare zi din curs are urmatoarele tab-uri/sectiuni:

1. **Lectia** (Citeste / Asculta)
   - Textul complet din carte, formatat frumos
   - Buton TTS care citeste textul cu voce AI
   - Citatele si definitiile evidentiate vizual

2. **Planul de Executie** (Exercitii)
   - Exercitiile din carte, prezentate ca formulare interactive
   - Sarcinile rezultate se adauga automat in **Do List** (nu Hit List)

3. **AI Coach** (Chat)
   - Chat inline care ghideaza utilizatorul prin exercitii
   - Adauga automat sarcini relevante in Do List prin tool calling

4. **Breakthrough** (NOU)
   - Sectiune dedicata unde utilizatorul isi scrie breakthrough-ul zilei
   - Cand posteaza un breakthrough, acesta apare automat in Community cu categoria **"breakthrough"** (nu "general")
   - Badge vizual pe postare: "Personal Power Plus - Day X: [titlu]"
   - Adminul poate muta postarea din "breakthrough" in "general" din meniul de 3 puncte al postarii

5. **Discutii lectie** (Community Post)
   - Reutilizeaza componenta `LessonCommunityPost` existenta (deja folosita in Challenge)
   - Postari legate de lectie cu `source_context = 'personal-power-day-X'`
   - Apar si in feed-ul Community cu badge-ul lectiei

---

## Integrare Community -- Ce se schimba

### A. Categorie noua: "Breakthrough"
Se adauga o noua categorie in filtrul de pe Community:
- **`SkoolCategoryFilter.tsx`**: Se adauga `{ id: 'breakthrough', label: 'Breakthrough', labelRo: 'Breakthrough', icon: '💡' }`
- Postari cu `category = 'breakthrough'` apar cand selectezi acest filtru
- Postari de breakthrough au badge-ul sursei (ex: "Personal Power Plus - Day 3: Neuro-asocieri")

### B. Admin: Muta postare intre categorii
In meniul de 3 puncte (admin-only) de pe `SkoolPostCard`, se adauga optiunea:
- **"Muta la General"** -- daca postarea e pe "breakthrough", o schimba pe "general"
- **"Muta la Breakthrough"** -- daca postarea e pe "general", o schimba pe "breakthrough"
- Foloseste `UPDATE wall_posts SET category = 'general'/'breakthrough' WHERE id = ?`

### C. Prima lectie = Prezinta-te
Ziua 1 a cursului include un CTA (call-to-action) care trimite utilizatorul sa se prezinte in Community -- **aceeasi postare de bun venit** unde sunt trimisi toti utilizatorii noi, indiferent de curs.
- Link catre `/programs?tab=community` cu mesajul: "Spune-ne cine esti, de unde esti si ce te-a adus aici"
- Nu este o postare separata, ci un link/buton catre Community wall-ul principal

### D. Postare de promovare in Community
Cand cursul este lansat, se creaza o postare pinned in Community care promoveaza programul:
- Titlu: "Personal Power Plus -- Transforma-ti viata in 30 de zile"
- Link catre `/personal-power`
- Categoria: "general"
- Poate fi fixata (pinned) de admin

---

## Detalii tehnice

### 1. Fisier de date: `src/data/personalPowerContent.ts`

Contine pentru fiecare zi (1-5 initial):
- `day`: numarul zilei
- `title` / `titleEn`: titlul zilei
- `quote`: citatul zilei
- `lessonContent`: textul COMPLET al lectiei (exact din carte)
- `definitions`: definitii cheie evidentiate
- `assignmentSteps`: pasii exercitiului cu `prompt` si `type` (text/list/scale)
- `aiCoachingPrompt`: prompt-ul specific pentru AI Coach
- `doListTasks`: sarcini predefinite ce se adauga in Do List
- `breakthroughPrompt`: intrebarea/prompt-ul pentru sectiunea Breakthrough

### 2. Componente noi

| Componenta | Descriere |
|-----------|-----------|
| `src/pages/PersonalPowerDay.tsx` | Pagina zilei cu tabs: Lectie / Exercitii / AI Coach / Breakthrough / Discutii |
| `src/pages/PersonalPowerOverview.tsx` | Pagina overview cu lista zile si progres total |
| `src/components/personal-power/PersonalPowerLesson.tsx` | Afisare text lectie + buton TTS |
| `src/components/personal-power/PersonalPowerExercise.tsx` | Formulare interactive pentru exercitii |
| `src/components/personal-power/PersonalPowerCoach.tsx` | Chat AI inline |
| `src/components/personal-power/PersonalPowerSidebar.tsx` | Sidebar navigatie zile (similar Challenge) |
| `src/components/personal-power/PersonalPowerBreakthrough.tsx` | Sectiune breakthrough cu postare automata in Community |

### 3. Edge function: `supabase/functions/personal-power-coach/index.ts`

- Primeste: ziua curenta, mesajele conversatiei, contextul exercitiului
- System prompt specific pe zi cu continutul exact din carte
- Tool calling: `add_to_do_list` (adauga sarcini in Do List)
- Foloseste Lovable AI (google/gemini-3-flash-preview)
- Stream SSE

### 4. Tabel nou: `personal_power_progress`

```text
personal_power_progress
  - id (uuid, PK)
  - user_id (uuid, NOT NULL)
  - day_number (integer, 1-30)
  - lesson_completed (boolean, default false)
  - exercise_completed (boolean, default false)
  - coaching_completed (boolean, default false)
  - breakthrough_completed (boolean, default false)
  - exercise_responses (jsonb)
  - breakthrough_text (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - UNIQUE(user_id, day_number)
```

Politici RLS: SELECT/INSERT/UPDATE doar pentru `user_id = auth.uid()`

### 5. Modificari la fisiere existente

| Fisier | Modificare |
|--------|-----------|
| `src/components/programs/SkoolCategoryFilter.tsx` | Adaugare categorie "breakthrough" cu icon "💡" |
| `src/components/programs/SkoolPostCard.tsx` | Adaugare optiune admin "Muta la General" / "Muta la Breakthrough" in dropdown |
| `src/App.tsx` | Adaugare rute `/personal-power` si `/personal-power/:day` |

### 6. Integrare Do List

Cand exercitiul sau AI-ul genereaza sarcini:
- Se adauga in tabelul `door_user_tasks` cu `list_type = 'do'` folosind serviciul `doorUserTasksService`
- Sarcinile specifice fiecarei zile sunt predefinite in datele cursului

### 7. Breakthrough -> Community Flow

Cand utilizatorul posteaza un breakthrough:
1. Se salveaza `breakthrough_text` in `personal_power_progress`
2. Se marcheaza `breakthrough_completed = true`
3. Se creaza automat o postare in `wall_posts` cu:
   - `category = 'breakthrough'`
   - `source_context = 'personal-power-day-X'`
   - `source_label = 'Personal Power Plus - Day X: [titlu]'`
4. Postarea apare in Community sub filtrul "Breakthrough"

### 8. Rute noi

```text
/personal-power        -> Pagina overview curs (lista zile, progres total)
/personal-power/:day   -> Pagina zilei specifice (1-30)
```

---

## Continutul Zilelor 1-5 (extras EXACT din PDF)

### Ziua 1: Cheia Puterii Personale
- **Lectie**: Definitia puterii personale, Formula Succesului (4 pasi), Modele de urmat
- **Exercitiu**: 2 decizii amanate + 3 actiuni imediate pentru fiecare
- **AI Coach**: Clarifica deciziile, identifica ce te-a oprit
- **Breakthrough**: "Care este cel mai important lucru pe care l-ai realizat astazi despre tine?"
- **CTA**: Link catre Community -- "Prezinta-te: cine esti, de unde esti, ce te-a adus aici"

### Ziua 2: Fortele care iti Controleaza Viata
- **Lectie**: Durere vs. placere ca forte motrice
- **Exercitiu**: 4 actiuni noi + durerea/placerea asociata + costul ne-actiunii
- **AI Coach**: Identifica un comportament de schimbat
- **Breakthrough**: "Ce pattern de evitare a durerii ai descoperit la tine?"

### Ziua 3: Preluarea Controlului - Primul Pas
- **Lectie**: Neuro-asocierile, NAC, Cele 4 parti ale destinului
- **Exercitiu**: 3 neuro-asocieri pozitive + 3 negative
- **AI Coach**: Identifica pattern-urile, intelege cum s-au format
- **Breakthrough**: "Ce neuro-asociere negativa esti pregatit sa schimbi?"

### Ziua 4: Stiinta Conditionarii Succesului
- **Lectie**: Cele 3 fundamente NAC (leverage, intrerupere pattern, conditionare)
- **Exercitiu**: 10 motive pentru schimbare, 4-5 metode de intrerupere pattern
- **AI Coach**: Ghideaza prin cele 3 etape NAC pas cu pas
- **Breakthrough**: "Ce metoda de intrerupere a pattern-ului a functionat cel mai bine?"

### Ziua 5: Ce isi Doreste Toata Lumea si Cum Poti Obtine
- **Lectie**: Stari emotionale, fiziologie si stare
- **Exercitiu**: Experiment cu partener, biomarkeri, snapping in stare pasionala
- **AI Coach**: Descopera biomarkerii personali
- **Breakthrough**: "Cum te-a facut sa te simti schimbarea de fiziologie?"

---

## Ordinea implementarii

1. Migrare SQL -- tabel `personal_power_progress`
2. Fisier date -- `personalPowerContent.ts` cu continut COMPLET zilele 1-5
3. Componente personal-power (Lesson, Exercise, Coach, Breakthrough, Sidebar)
4. Pagini (Overview + Day)
5. Edge function `personal-power-coach`
6. Modificari Community (categorie breakthrough, admin move category)
7. Rute in `App.tsx`
8. Adaugare card curs in sectiunea Programs

