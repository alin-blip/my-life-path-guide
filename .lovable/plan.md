

## Diagnoza reală a problemei

Am citit promptul și screenshot-ul. Sunt **2 probleme concrete**:

### Problema 1: Modelul nu respectă "1 fază pe mesaj"
`google/gemini-2.5-flash` este un model rapid dar prea "amabil" — ignoră instrucțiunile stricte de oprire și încearcă să dea valoare maximă într-un singur mesaj. Indiferent câte ❌ STOP punem în prompt, el tot combină.

**Soluție**: Trecem pe `google/gemini-2.5-pro` care respectă instrucțiunile mult mai bine, SAU mai bine — **forțăm controlul din cod, nu din prompt**.

### Problema 2: Faza Dickens (Leverage) are 2 întrebări într-un mesaj
Chiar și când respectă "1 fază pe mesaj", Faza 2 conține:
- "Ce pierzi în 1 an?" 
- "Ce câștigi în 1 an?"
- "Care e acceptabilă?"

Userul vede 3 întrebări → se simte copleșit. Tony nu face asta — **el pune o întrebare, aștepți, pune a doua, aștepți**.

## Soluție: Control determinist din cod (nu lăsăm AI-ul să decidă)

În loc să sperăm că AI-ul respectă fazele, **împărțim Dickens în 2 sub-faze controlate de cod**, identic cu ce am făcut cu PHASE_2/3/4 în quick answers.

### Schimbare 1: Spargem Faza 2 (Dickens) în 2A + 2B
- **Faza 2A** (mesaj separat): „Dacă mai stai 1 AN așa — ce PIERZI? (sănătate, bani, oameni, respect)" → STOP
- **Faza 2B** (mesaj separat): „Acum invers — dacă schimbi AZI, ce CÂȘTIGI în 1 an?" → STOP  
- **Faza 2C** (mesaj separat): „Care variantă e acceptabilă?" → STOP

### Schimbare 2: Trecem la `gemini-2.5-pro` pentru respectarea instrucțiunilor
Mai lent cu ~1-2s, dar respectă regulile stricte. Pentru breakthrough merită.

### Schimbare 3: Adăugăm "MAX 3 PROPOZIȚII" hard limit
Cap absolut pe lungime per mesaj. Dacă AI-ul vrea să spună mai mult — îl forțăm să spargă.

### Schimbare 4: Quick answers pentru noile sub-faze
- Phase 2A → "Sănătatea", "Banii", "Oamenii", "Respectul de sine"
- Phase 2B → "Cine devin", "Libertate", "Putere", "Bani"
- Phase 2C → "A doua — schimb"

## Rezultat

**Înainte (acum):**
```
Mesaj 1: Validare + întrebare (2 propoziții)
Mesaj 2: Pattern + "rezonezi?" (3-4 propoziții)
Mesaj 3: "Stai cu mine... ce pierzi? ce câștigi? care e acceptabilă?" ← 3 ÎNTREBĂRI
Mesaj 4: Power Move (mare bloc, dar OK pentru că e exercițiu)
```

**După:**
```
Mesaj 1: Validare + 1 întrebare
Mesaj 2: Pattern numit + "așa e?"
Mesaj 3: Doar "Ce PIERZI dacă rămâi 1 an așa?" 
Mesaj 4: Doar "Ce CÂȘTIGI dacă schimbi azi?"
Mesaj 5: Doar "Care variantă alegi?"
Mesaj 6: Power Move
Mesaj 7: Power Question
Mesaj 8: HIT List
```

8 mesaje în loc de 5, dar **fiecare cere UN SINGUR lucru** = userul nu se mai simte bombardat. Asta e exact stilul Tony pe scenă: o întrebare → pauză → următoarea.

## Fișiere de modificat

1. **`supabase/functions/mind-coach/index.ts`**
   - Schimb model: `gemini-2.5-flash` → `gemini-2.5-pro`
   - Rescriu Faza 2 în 2A/2B/2C separate
   - Adaug "MAX 3 PROPOZIȚII PER MESAJ. NICIODATĂ MAI MULT."
   - Adaug exemple de mesaje GREȘITE vs CORECTE

2. **`src/components/mind-coach/QuickAnswerSuggestions.tsx`**
   - Adaug PHASE_2A_ANSWERS (ce pierzi)
   - Adaug PHASE_2B_ANSWERS (ce câștigi)
   - Mut PHASE_2 actual → PHASE_2C

3. **`src/components/mind-coach/PhaseIndicator.tsx`**
   - Update `getPhaseFromMessageCount` pentru noile sub-faze
   - Sub-faze 2A/2B/2C apar tot ca „Faza 2 — Leverage" în UI (nu confuzia userului)

Niciun pas în plus pentru utilizator. Doar mesaje mai scurte și o întrebare pe rând. **Exact ce face Tony.**

