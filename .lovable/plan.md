
# Imbunatatire extractie context chei - detalii complete cu pasi, zile si HIT/DO

## Problema curenta

Sistemul de context injection exista dar extrage prea putin. Rezumatul injectat arata doar "3 pasi" fara sa specifice CE pasi, in CE zi si daca sunt HIT sau DO. AI-ul nu poate reconstrui planul complet din acest rezumat minimal.

## Solutia: extractie detaliata a pasilor

In loc sa crestem limita la 150 mesaje (costisitor, lent, risc de limita API), imbunatatim extractia din conversatie pentru a capta toate detaliile fiecarei chei.

## Ce se schimba

### 1. Structura CompletedKeyInfo extinsa (doorPlanningContext.ts)

Adaugam campuri noi pentru a stoca detaliile complete:

```text
CompletedKeyInfo {
  keyNumber: number;
  title: string;
  steps: Array<{
    text: string;      // "Optimizare platforma B2C"
    day: string;       // "Luni"
    type: string;      // "HIT" sau "DO"
  }>;
  responsible: string;
  deadline: string;
  objective: string;    // Ce vrei sa faci
  whyImportant: string; // De ce
  positiveResult: string;
  negativeResult: string;
}
```

### 2. Extractie inteligenta din conversatie (doorPlanningContext.ts)

Parsarea devine mai completa:
- Extrage fiecare pas individual cu ziua si tipul HIT/DO din pattern-uri precum "Pasul 1: Optimizare platforma (Luni, HIT)"
- Extrage obiectivul, motivatia, rezultatul pozitiv si negativ cautand intrebarile AI + raspunsurile utilizatorului
- Foloseste ultimele 40 de mesaje din conversatie (zona relevanta pentru cheia curenta)

### 3. Rezumat complet injectat (doorPlanningContext.ts)

Noul format al contextului injectat:

```text
[CONTEXT AUTOMAT] Cheile deja completate (NU intreba din nou):
--- Cheia 1: "Lansare platforma afiliere" ---
Obiectiv: Reconfigurarea platformei vechi
Pasi:
  1. Optimizare platforma B2C si B2B - Luni (HIT)
  2. Optimizare pagina lead magnet - Miercuri (HIT)
  3. Optimizare UX inregistrare studenti - Joi (HIT)
Responsabil: Alin Radu | Deadline: Vineri

--- Cheia 2: "Marketing afiliat B2B si B2C" ---
...

Cheile completate: 1, 2 (2 din 4). Mai trebuie: 3, 4.
```

### 4. MAX_MESSAGES_TO_SEND ramane 60

Cu extractia detaliata, 60 mesaje sunt suficiente. Contextul complet al cheilor anterioare vine din rezumatul injectat, nu din mesajele vechi.

## Detalii tehnice

### Fisiere modificate

**src/utils/doorPlanningContext.ts** - refactorizare completa:
- `CompletedKeyInfo` extins cu `steps[]`, `objective`, `whyImportant`, `positiveResult`, `negativeResult`
- `detectCompletedKey()` - extractie imbunatatita: cauta pattern-uri AI de confirmare pas ("Am notat. Pasul 1, Luni, HIT") si perechi intrebare-raspuns pentru obiectiv/motivatie
- `buildCompletedKeysContext()` - genereaza rezumat detaliat cu fiecare pas enumerat individual
- Functii helper noi: `extractStepsDetailed()` care parseaza pasii cu ziua si tipul lor

**src/components/door/DoorPlanningModal.tsx** - actualizare minora:
- Adaptat tipul `completedKeys` la noua interfata (steps devine array de obiecte in loc de stepsCount)
- localStorage persistence actualizata pentru noua structura

**supabase/functions/door-ai-planning/index.ts** - fara modificari (system prompt-ul deja instruieste AI-ul sa respecte contextul injectat)

## Rezultat asteptat

- Utilizatorul defineste Cheia 1 cu 3 pasi detaliati
- Cand trece la Cheia 2+, AI-ul primeste rezumatul COMPLET al Cheii 1 (cu fiecare pas, ziua, HIT/DO)
- La intrebarea "arata-mi ce avem", AI-ul poate raspunde cu toate detaliile
- Nu mai e nevoie de 150 mesaje - contextul vine din extractie, nu din istoricul brut
