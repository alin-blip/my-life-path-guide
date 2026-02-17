

# Ce trebuie construit pentru a livra promisiunile din /b2b

## Situatia curenta

Din auditul facut, platforma are deja o baza solida pentru coachi. Iata ce exista si ce lipseste:

### EXISTA deja (functional):
- Coach Profiles cu Stripe Connect, referral code, comision 50%
- Coach Dashboard cu statistici, clienti, earnings
- Tribes (comunitate privata per coach) cu `coach_id` si `is_coach_tribe`
- Wall Posts in tribes (posturi, likes, comentarii)
- Content Manager (cursuri, ebook-uri, resurse cu pret)
- Referral System complet (link unic, tracking, comisioane automate)
- Coach Inbox (mesaje coach-client)
- Workout Programs (tabele: `workout_programs`, `workout_program_days`, `workout_day_exercises`)
- Champion Routine Settings (configurare rutina cu pasi, ordine, nutritie, meditatie)
- Coach Onboarding

### CE LIPSESTE (pentru a livra ce promitem pe /b2b):

---

## Prioritatea 1: Rutina Personalizata per Grup (Coach -> Clienti)

**Problema:** Acum fiecare user isi configureaza rutina individual. Coach-ul nu poate seta o rutina standard pentru grupul lui.

**Ce trebuie construit:**

1. **Tabela noua: `coach_routine_templates`**
   - `id`, `coach_id` (FK coach_profiles), `tribe_id` (optional, FK tribes)
   - `name`, `description`
   - `routine_steps_order` (JSONB - aceeasi structura ca `champion_routine_settings`)
   - `active_steps` (JSONB)
   - `step_configs` (JSONB - configuratii detaliate per pas)
   - `is_default` (boolean - rutina default pentru clientii noi)
   - `created_at`, `updated_at`

2. **UI in Coach Dashboard:**
   - Tab nou "Rutine" / "Routines"
   - Editor vizual de rutina (refolosim componenta existenta de configurare rutina)
   - Selectare grup/tribe caruia i se aplica
   - Buton "Aplica la toti membrii"

3. **Logica de aplicare:**
   - Cand un client se inscrie prin referral, mosteneste rutina default a coach-ului
   - Coach-ul poate forta update la toti membrii dintr-un tribe

**Complexitate:** Medie (2-3 mesaje)

---

## Prioritatea 2: Programe de Antrenament create de Coach

**Problema:** Tabelele `workout_programs` exista, dar nu au legatura cu coach-ul. Un coach nu poate crea programe si le atribui clientilor.

**Ce trebuie construit:**

1. **Modificare tabela `workout_programs`:**
   - Adaugare coloana `coach_id` (UUID, FK coach_profiles, nullable)
   - Adaugare coloana `tribe_id` (UUID, FK tribes, nullable)
   - Flag `is_coach_template` pentru a distinge de programele personale

2. **UI in Coach Dashboard:**
   - Tab "Programe Antrenament" / "Workout Programs"
   - Builder de program: zile, exercitii, seturi, repetari
   - Atribuire la tribe sau la client individual
   - Refolosim componentele existente din `useWorkoutProgram.ts`

3. **Logica:**
   - Clientii din tribe-ul coach-ului vad programul atribuit
   - Clientul poate accepta programul (se copiaza in `workout_programs` cu `user_id` propriu)

**Complexitate:** Medie (2-3 mesaje)

---

## Prioritatea 3: Plan de Mese (Meal Plans)

**Problema:** Exista nutritie in rutina (`nutrition_configured`, macro targets), dar nu exista un sistem de meal planning per se.

**Ce trebuie construit:**

1. **Tabele noi:**
   - `meal_plans` (id, coach_id, tribe_id, name, description, calorie_target, created_at)
   - `meal_plan_days` (id, meal_plan_id, day_of_week, meals JSONB)
   - Structura meals: `[{type: 'breakfast', name: '...', calories: 400, protein: 30, ...}]`

2. **UI in Coach Dashboard:**
   - Tab "Planuri de Mese" / "Meal Plans"
   - Builder de plan saptamanal cu mese per zi
   - Macro calculator integrat (refolosim ce exista in routine settings)

3. **UI pentru client:**
   - Sectiune "Planul Meu de Masa" in rutina zilnica
   - Check-off per masa

**Complexitate:** Mare (3-4 mesaje)

---

## Prioritatea 4: Tribe ca Skool (Comunitate Admin)

**Problema:** Tribes exista cu wall_posts, dar nu are functionalitati de admin avansat (categorii, anunturi pinned, discutii organizate).

**Ce exista deja:**
- `wall_posts` cu `is_pinned`, `category`, likes, comments
- `tribe_members` cu roluri (owner, member)
- Functii `is_tribe_owner()`, `is_tribe_member()`

**Ce lipseste:**
1. **UI de admin pentru coach:**
   - Panou de moderare (pin/unpin, delete posturi)
   - Categorii de posturi (Anunturi, Discutii, Resurse, Intrebari)
   - Sectiune "Despre" editabila
   - Gestionare membri (invite, remove, ban)

2. **UI imbunatatit pentru membri:**
   - Feed filtrat pe categorii
   - Notificari la posturi noi
   - Profil de membru in context tribe

**Complexitate:** Mare (4-5 mesaje)

---

## Prioritatea 5: Onboarding Flow imbunatatit

**Ce lipseste:**
- Un wizard pas-cu-pas clar: Profil -> Stripe Connect -> Link Referral -> Primul Client
- Progress bar vizual
- Checklist de completare

**Complexitate:** Mica (1 mesaj)

---

## Ordinea recomandata de implementare

| Pas | Feature | Mesaje estimate |
|-----|---------|----------------|
| 1 | Rutina Personalizata per Grup | 2-3 |
| 2 | Programe Antrenament Coach | 2-3 |
| 3 | Tribe Admin (Skool-like) | 4-5 |
| 4 | Plan de Mese | 3-4 |
| 5 | Onboarding Flow | 1 |

**Total estimat: 12-16 mesaje**

---

## Detalii tehnice

- Toate tabelele noi vor avea RLS policies bazate pe `coach_id` si `tribe_id`
- Coach-ul poate edita doar resursele proprii
- Clientii din tribe pot doar citi (nu edita) template-urile coach-ului
- Se refolosesc hook-urile existente (`useWorkoutProgram`, `useCoachDashboard`) extinse cu functionalitati noi
- UI-ul se adauga ca tab-uri noi in Coach Dashboard existent
- Toate componentele bilingue RO/EN cu `useLanguage()`

