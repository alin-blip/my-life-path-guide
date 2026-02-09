
# Fix navigare automata + buton exercitii + AI Coach initiere conversatie

## Probleme identificate

### 1. Butonul "Am completat exercitiile" nu functioneaza
**Cauza**: Logica `allFilled` verifica `step-1`, `step-2`, etc., dar pentru exercitii de tip `list`, raspunsurile se salveaza cu chei `step-1-0`, `step-1-1`, etc. Astfel, `allFilled` nu gaseste niciodata valori si butonul ramane dezactivat.

**Fix**: Se modifica `allFilled` in `PersonalPowerExercise.tsx` sa verifice si cheile de tip lista (`step-{n}-{i}`).

### 2. Navigare automata intre pasi
Acum tab-urile sunt controlate manual (`defaultValue="lesson"`). Se transforma in controlled tabs cu `activeTab` state, si:
- Cand completezi lectia -> se trece automat la tab "exercise"
- Cand completezi exercitiile -> se trece automat la tab "coach"
- Cand completezi coaching-ul -> se trece automat la tab "breakthrough"

**Fix**: In `PersonalPowerDayPage.tsx`, se adauga state `activeTab` si callback-uri care schimba tab-ul dupa completare.

### 3. AI Coach sa initieze conversatia automat
Cand utilizatorul ajunge la tab-ul Coach, AI-ul trebuie sa inceapa conversatia singur (fara sa astepte input). Se trimite automat un mesaj initial cand componenta se monteaza si nu exista mesaje.

**Fix**: In `PersonalPowerCoach.tsx`, se adauga `useEffect` care trimite un mesaj de start automat (ex: "Am terminat lectia si exercitiile. Vreau sa discutam despre ce am invatat si sa ma ajuti sa merg mai departe.").

### 4. Audio AI Coach nu functioneaza
Din screenshot, se vede ca Call mode se activeaza dar audio nu merge. Problema este ca `voice` este folosit inainte de a fi definit (linia 151 refera `voice.isInCall` dar hook-ul e definit la linia 166).

**Fix**: Se muta declaratia hook-ului `useMindCoachVoice` inainte de `sendMessage` sau se restructureaza sa nu existe dependinta circulara.

---

## Detalii tehnice

### Fisier 1: `src/pages/PersonalPowerDay.tsx`
- Se adauga `const [activeTab, setActiveTab] = useState('lesson')`
- Se inlocuieste `<Tabs defaultValue="lesson">` cu `<Tabs value={activeTab} onValueChange={setActiveTab}>`
- Callback-urile de completare se modifica:
  - Lectie completata: `updateProgress({ lesson_completed: true })` + `setActiveTab('exercise')`
  - Exercitii completate: `updateProgress({ exercise_completed: true })` + `setActiveTab('coach')`
  - Coaching completat: `updateProgress({ coaching_completed: true })` + `setActiveTab('breakthrough')`

### Fisier 2: `src/components/personal-power/PersonalPowerExercise.tsx`
- Se repara `allFilled` pentru a gestiona si step-uri de tip `list`:
  ```
  const allFilled = dayData.assignmentSteps.every(step => {
    if (step.type === 'list' && step.listCount) {
      return Array.from({ length: step.listCount }, (_, i) => 
        responses[`step-${step.step}-${i}`]?.trim().length > 0
      ).every(Boolean);
    }
    const key = `step-${step.step}`;
    return responses[key]?.trim().length > 0;
  });
  ```

### Fisier 3: `src/components/personal-power/PersonalPowerCoach.tsx`
- Se muta `useMindCoachVoice` hook inainte de `sendMessage` (se rezolva referinta circulara folosind un ref pentru voice)
- Se adauga `useEffect` care la montare trimite automat primul mesaj catre AI:
  ```
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      sendMessage("Am terminat lecția și exercițiile. Vreau să discutăm.");
    }
  }, []);
  ```
  Aceasta va face AI-ul sa inceapa conversatia cu textul pe care l-ai descris (felicitari, clarificarea deciziilor, etc.) -- deoarece system prompt-ul din edge function contine deja instructiunile de coaching pentru fiecare zi.
