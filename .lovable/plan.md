
# Fix: AI Coach pierde contextul cheilor 1 si 2 in Domino Door

## Problema identificata

Cand planifici cele 4 chei in Domino Door, conversatia devine foarte lunga (80-120+ mesaje). Dar sistemul trimite doar **ultimele 40 mesaje** catre AI (limita setata in cod). Asta inseamna ca dupa ce termini Cheia 3 si 4, mesajele despre Cheia 1 si 2 de la inceput sunt taiate complet -- AI-ul nu le mai vede si intreaba din nou.

## Solutia

### 1. Tracker de chei completate pe frontend (DoorPlanningModal.tsx)

- Adaugam un state `completedKeys` care tine evidenta cheilor finalizate
- Cand AI-ul raspunde cu "Cheia [N] completa!", parsam mesajul si extragem datele structurate (titlu, pasi, responsabil, deadline)
- Aceste date se pastreaza in state-ul componentei, independent de istoricul conversatiei

### 2. Injectare context sumar la fiecare request (DoorPlanningModal.tsx)

- Inainte de a trimite mesajele catre AI, cream un mesaj de tip "system" cu un rezumat al cheilor deja completate
- Acest mesaj se adauga la inceputul array-ului de mesaje, DUPA system prompt
- Exemplu de context injectat:

```text
CONTEXT DEJA DEFINIT (NU intreba din nou pentru aceste chei):
- Cheia 1: "Titlul cheii 1" - 3 pasi programati, responsabil: Alin Radu, deadline: Miercuri
- Cheia 2: "Titlul cheii 2" - 2 pasi programati, responsabil: Alin Radu, deadline: Miercuri
Cheile deja completate: 2 din 4. Mai trebuie definite cheile: 3, 4.
```

### 3. Cresterea limitei de mesaje (DoorPlanningModal.tsx)

- `MAX_MESSAGES_TO_SEND` se creste de la 40 la 60 pentru a acoperi mai mult context
- Nu putem pune prea mult (limita backend 100) dar 60 ajuta semnificativ

### 4. Actualizare system prompt (door-ai-planning/index.ts)

- Adaugam in NEW_WEEK_SYSTEM_PROMPT si WIZARD_SYSTEM_PROMPT instructiuni clare:
  - "Daca primesti un mesaj de context cu chei deja completate, NU intreba din nou pentru acele chei"
  - "Treci direct la urmatoarea cheie nedefinita"

## Detalii tehnice

### DoorPlanningModal.tsx -- Modificari

**Nou state pentru tracking chei:**
```text
const [completedKeys, setCompletedKeys] = useState<Array<{
  keyNumber: number;
  title: string;
  stepsCount: number;
  responsible: string;
  deadline: string;
}>>([]);
```

**Detectie automata a cheilor completate:**
- Dupa fiecare raspuns AI, verificam daca mesajul contine pattern-ul "Cheia [N] completa" sau "Cheia [N] completă"
- Parsam din contextul conversatiei recente titlul, pasii, responsabilul si deadline-ul
- Adaugam in `completedKeys`

**Injectare context la trimitere:**
- In `streamChat()`, inainte de a trimite `safeMessages`, construim un mesaj de context cu cheile completate
- Acest mesaj se adauga ca prim mesaj (role: 'user') cu prefixul `[CONTEXT AUTOMAT]`
- Limita crescuta: `MAX_MESSAGES_TO_SEND = 60`

### door-ai-planning/index.ts -- Modificari

**NEW_WEEK_SYSTEM_PROMPT** -- adaugam la sfarsit:
```text
REGULA IMPORTANTA CONTEXT:
- Daca primul mesaj contine "[CONTEXT AUTOMAT]" cu chei deja completate, NU intreba din nou pentru acele chei
- Treci direct la urmatoarea cheie care nu a fost definita
- Foloseste informatiile din context pentru a sti cate chei mai trebuie
```

Aceeasi regula se adauga si in WIZARD_SYSTEM_PROMPT si REVIEW_SYSTEM_PROMPT.

### Persistenta in draft

- `completedKeys` se salveaza si in draft (atat localStorage cat si database) pentru a nu pierde datele la refresh
- La reload, se restaureaza din draft impreuna cu mesajele

## Fisiere modificate

1. `src/components/door/DoorPlanningModal.tsx` -- tracking chei, injectare context, crestere limita mesaje
2. `supabase/functions/door-ai-planning/index.ts` -- instructiuni noi in system prompts

## Rezultat asteptat

- Utilizatorul defineste Cheia 1 si 2 la inceput
- Cand ajunge la Cheia 3, chiar daca mesajele vechi sunt taiate, AI-ul primeste un rezumat compact cu cheile 1 si 2
- AI-ul nu mai intreaba din nou despre chei deja definite
- Daca utilizatorul cere "arata-mi ce avem pana acum", AI-ul poate raspunde corect
