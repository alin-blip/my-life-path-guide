
# Plan: Restructurare Challenge 7 Zile conform Curriculum Nou

## Analiza Gap - Ce avem vs Ce cerem

### Structura CURENTĂ (Existentă):

| Zi | Titlu Curent | Focus Actual |
|-----|--------------|--------------|
| 1 | The Foundation | Tour platformă + Dashboard + Stack Explorer |
| 2 | Body + Being | Obiective anuale Corp & Spirit |
| 3 | Balance + Business | Obiective anuale Relații & Business |
| 4 | Champion Routine | Configurare rutină matinală |
| 5 | AI Vision | Vision Board + Meditație AI |
| 6 | Accountability | Notificări + Accountability Partner |
| 7 | Putting It All Together | Recap + Upgrade Premium |

### Structura CERUTĂ (Nouă):

| Zi | Titlu Nou | Focus Nou |
|-----|-----------|-----------|
| 1 | Viziune + Declarație (Napoleon Hill) | 4 zone vision + Declarație scrisă + Citire dimineață/seară + Share în comunitate |
| 2 | Corp + Spirit (Fundația) | Obiective 2026 / 90 zile / 30 zile + Ritualuri zilnice + Share declarație |
| 3 | Business + Relații (Conexiune) | Obiective 2026 / 90 zile / 30 zile + Pași săptămânali + Share obiective |
| 4 | Domino Door (Planul săptămânii) | AI Wizard Domino Door + Milestone + 4 Chei + Acțiuni + Ritual duminică |
| 5 | Vision AI + Warrior Routine | Vision AI pe 4 cadrane + Rutină personalizată + "Start Routine" |
| 6 | Accountability Coach + Mind Coach (STACK) | Coach care știe tot + STACK pentru frică/furie/îndoială + Breakthrough |
| 7 | Integrare + Continuare (Membership) | Tot sistemul împreună + Planuri early bird (Basic/Pro/Elite) |

---

## Diferențe Principale

### Ziua 1 - Trebuie păstrată (deja corectă)
Structura Napoleon Hill cu cele 5 întrebări + Viziune pe 4 zone + Declarație + Share în comunitate **EXISTĂ DEJA** și funcționează bine.

### Ziua 2 - Necesită modificări
**ACTUAL:** Doar obiective anuale pentru Body & Being
**NOU:** Obiective pe 3 nivele (2026 + 90 zile + 30 zile) + Ritualuri zilnice simple

### Ziua 3 - Necesită modificări
**ACTUAL:** Doar obiective anuale pentru Balance & Business
**NOU:** Obiective pe 3 nivele + Pași săptămânali

### Ziua 4 - Necesită schimbare completă
**ACTUAL:** Champion Routine + Personalizare Dashboard
**NOU:** **DOMINO DOOR** - AI Wizard pentru milestone săptămână + 4 chei + acțiuni concrete

### Ziua 5 - Necesită reorganizare
**ACTUAL:** AI Vision + Meditație AI
**NOU:** Vision AI pe 4 cadrane (Body/Being/Balance/Business) + **Warrior Routine** + "Start Routine" zilnic

### Ziua 6 - Necesită schimbare completă
**ACTUAL:** Notificări și accountability partner extern
**NOU:** **Accountability Coach** (știe tot) + **Mind Coach / STACK** pentru transformare emoțională

### Ziua 7 - Trebuie îmbunătățită
**ACTUAL:** Recap + Upgrade (ChallengeDay7Complete)
**NOU:** Integrare completă (vision + domino door + routine + stack + accountability) + Planuri early bird detaliate

---

## Modificări Concrete

### Fișier: `src/pages/Challenge.tsx`

Actualizăm array-ul `challengeDays[]`:

```typescript
const challengeDays: ChallengeDay[] = [
  {
    day: 1,
    titleEn: "🔥 VISION + DECLARATION",
    titleRo: "🔥 VIZIUNE + DECLARAȚIE",
    subtitleEn: "Set your direction with Napoleon Hill style declaration",
    subtitleRo: "Setează direcția cu declarație în stilul Napoleon Hill",
    icon: Flame,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge/1",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 2,
    titleEn: "💪✨ BODY + SPIRIT (Foundation)",
    titleRo: "💪✨ CORP + SPIRIT (Fundația)",
    subtitleEn: "2026 / 90-day / 30-day goals + daily rituals",
    subtitleRo: "Obiective 2026 / 90 zile / 30 zile + ritualuri zilnice",
    icon: Dumbbell,
    color: "from-green-500 to-purple-500",
    actionPath: "/challenge/2",
    focusAreas: ['body', 'being']
  },
  {
    day: 3,
    titleEn: "💰💕 BUSINESS + RELATIONSHIPS",
    titleRo: "💰💕 BUSINESS + RELAȚII",
    subtitleEn: "2026 / 90-day / 30-day goals + weekly steps",
    subtitleRo: "Obiective 2026 / 90 zile / 30 zile + pași săptămânali",
    icon: Target,
    color: "from-blue-500 to-pink-500",
    actionPath: "/challenge/3",
    focusAreas: ['balance', 'business']
  },
  {
    day: 4,
    titleEn: "🎯 DOMINO DOOR (Weekly Plan)",
    titleRo: "🎯 DOMINO DOOR (Plan Săptămânal)",
    subtitleEn: "AI Wizard: Milestone + 4 Keys + Actions",
    subtitleRo: "AI Wizard: Milestone + 4 Chei + Acțiuni",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    actionPath: "/challenge/4",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 5,
    titleEn: "✨ VISION AI + WARRIOR ROUTINE",
    titleRo: "✨ VIZIUNE AI + WARRIOR ROUTINE",
    subtitleEn: "4-quadrant vision board + personalized routine",
    subtitleRo: "Vision board pe 4 cadrane + rutină personalizată",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    actionPath: "/challenge/5",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 6,
    titleEn: "🧠 ACCOUNTABILITY + MIND COACH",
    titleRo: "🧠 ACCOUNTABILITY + MIND COACH",
    subtitleEn: "AI Coach that knows everything + STACK for breakthroughs",
    subtitleRo: "Coach AI care știe tot + STACK pentru breakthrough-uri",
    icon: Brain,
    color: "from-red-500 to-pink-500",
    actionPath: "/challenge/6",
    focusAreas: ['body', 'being', 'balance', 'business']
  },
  {
    day: 7,
    titleEn: "🏆 INTEGRATION + MEMBERSHIP",
    titleRo: "🏆 INTEGRARE + CONTINUARE",
    subtitleEn: "Complete system + Early Bird plans",
    subtitleRo: "Sistemul complet + Planuri Early Bird",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600",
    actionPath: "/challenge/7",
    focusAreas: ['body', 'being', 'balance', 'business']
  }
];
```

### Fișier: `src/pages/ChallengeDay.tsx`

Actualizăm `challengeContent[]` cu noile descrieri, pași și exerciții pentru fiecare zi:

#### Ziua 1 (păstrează - deja corect cu Napoleon Hill flow)

#### Ziua 2 - Actualizare

```typescript
{
  day: 2,
  titleEn: "💪✨ BODY + SPIRIT (The Foundation)",
  titleRo: "💪✨ CORP + SPIRIT (Fundația)",
  principleEn: "Day 2: Build Your Foundation - Energy + Peace + Focus",
  principleRo: "Ziua 2: Construiește Fundația - Energie + Pace + Focus",
  descriptionEn: "Body and Spirit are your foundation. Today you set objectives on 3 levels: 2026, 90 days, 30 days + simple sustainable daily rituals.",
  descriptionRo: "Corpul și Spiritul sunt fundația ta. Astăzi setezi obiective pe 3 nivele: 2026, 90 zile, 30 zile + ritualuri zilnice simple și sustenabile.",
  // ... exercises actualizate cu link-uri la Game Objectives (annual/90-day/monthly)
}
```

#### Ziua 3 - Actualizare

```typescript
{
  day: 3,
  titleEn: "💰💕 BUSINESS + RELATIONSHIPS",
  titleRo: "💰💕 BUSINESS + RELAȚII",
  principleEn: "Day 3: Connection & Contribution",
  principleRo: "Ziua 3: Conexiune și Contribuție",
  descriptionEn: "Business and Relationships are interconnected. Today you complete your Have It All vision with objectives on 3 levels + weekly action steps.",
  descriptionRo: "Business-ul și Relațiile sunt interconectate. Astăzi completezi viziunea Have It All cu obiective pe 3 nivele + pași săptămânali.",
  // ... exercises actualizate
}
```

#### Ziua 4 - Schimbare completă (Domino Door)

```typescript
{
  day: 4,
  titleEn: "🎯 DOMINO DOOR (Weekly Plan)",
  titleRo: "🎯 DOMINO DOOR (Planul Săptămânii)",
  principleEn: "Day 4: The Vital Few - Maximum Impact Actions",
  principleRo: "Ziua 4: Puținele Vitale - Acțiuni cu Impact Maxim",
  descriptionEn: "Choose the 'vital few' - few actions with big impact. Use the AI Wizard Domino Door to define your weekly milestone, 4 keys, and connect each action to your WHY. This becomes your Sunday ritual.",
  descriptionRo: "Alege 'puținele vitale' - acțiuni puține cu impact mare. Folosește AI Wizard Domino Door pentru a defini milestone-ul săptămânii, 4 chei, și conectează fiecare acțiune la DE CE-ul tău. Acesta devine ritualul de duminică.",
  icon: Target,
  actionPath: "/door",
  exercisesEn: [
    { id: "ex1", title: "Open Domino Door", description: "Navigate to the weekly planning system", link: "/door", linkLabel: "Open Door" },
    { id: "ex2", title: "Set Weekly Milestone", description: "Define the ONE thing that would make this week a success", area: "business" },
    { id: "ex3", title: "Define 4 Key Points", description: "Use AI Wizard to create 4 measurable keys for your milestone", area: "business" },
    { id: "ex4", title: "Connect to Your WHY", description: "Link each key to your vision declaration from Day 1", area: "being" },
    { id: "ex5", title: "Share in Comments", description: "Post your milestone + Domino Door tasks to the community", area: "balance" }
  ],
  // ... exercisesRo
}
```

#### Ziua 5 - Reorganizare (Vision AI + Warrior Routine)

```typescript
{
  day: 5,
  titleEn: "✨ VISION AI + WARRIOR ROUTINE",
  titleRo: "✨ VIZIUNE AI + WARRIOR ROUTINE",
  principleEn: "Day 5: One-Click Execution",
  principleRo: "Ziua 5: Execuție cu Un Click",
  descriptionEn: "Generate your Vision AI board on 4 quadrants: Body/Being/Balance/Business. Set up your personalized Warrior Routine with habits in each category. After setup: start daily with 'Start Routine' - no mental negotiation.",
  descriptionRo: "Generează Vision AI pe 4 cadrane: Corp/Spirit/Relații/Business. Setează Warrior Routine personalizată cu obiceiuri în fiecare categorie. După setare: începi zilnic cu 'Start Routine' - fără negociere mentală.",
  exercisesEn: [
    { id: "ex1", title: "Vision AI - Body", description: "Generate an AI image for your body/fitness goals", area: "body", link: "/vision-board", linkLabel: "Generate Vision" },
    { id: "ex2", title: "Vision AI - Being", description: "Generate an AI image for your spiritual/purpose goals", area: "being" },
    { id: "ex3", title: "Vision AI - Balance", description: "Generate an AI image for your relationship goals", area: "balance" },
    { id: "ex4", title: "Vision AI - Business", description: "Generate an AI image for your career/business goals", area: "business" },
    { id: "ex5", title: "Configure Warrior Routine", description: "Set up your morning routine with Champion Routine", area: "being", link: "/daily-flow", linkLabel: "Configure Routine" },
    { id: "ex6", title: "Share Daily Action", description: "Post 1 daily action from your routine that brings you closest to your vision", area: "being" }
  ]
}
```

#### Ziua 6 - Schimbare completă (Accountability Coach + STACK)

```typescript
{
  day: 6,
  titleEn: "🧠 ACCOUNTABILITY COACH + MIND COACH (STACK)",
  titleRo: "🧠 ACCOUNTABILITY COACH + MIND COACH (STACK)",
  principleEn: "Day 6: Transform Fear, Anger, Doubt into Power",
  principleRo: "Ziua 6: Transformă Frica, Furia, Îndoiala în Putere",
  descriptionEn: "The Accountability Coach knows everything: tells you what's missing and what's next. Mind Coach / STACK transforms fear, anger, sadness, doubt, procrastination into power.",
  descriptionRo: "Accountability Coach știe tot: îți spune ce lipsește și ce urmează. Mind Coach / STACK transformă frica, furia, tristețea, îndoiala, procrastinarea în putere.",
  exercisesEn: [
    { id: "ex1", title: "Meet Accountability Coach", description: "Open the Accountability Coach widget and see your status", area: "being", link: "/dashboard", linkLabel: "Open Dashboard" },
    { id: "ex2", title: "Check Missing Items", description: "Let the Coach tell you what's incomplete (routine, door, goals)", area: "business" },
    { id: "ex3", title: "Complete a STACK", description: "Do a Mind Coach STACK to transform a limiting emotion", area: "being", link: "/stack", linkLabel: "Open Stacks" },
    { id: "ex4", title: "Identify the Emotion", description: "Name the emotion + the story behind it + what you really want", area: "being" },
    { id: "ex5", title: "Share Your Breakthrough", description: "Post in comments: what story are you leaving behind / what changed", area: "balance" }
  ]
}
```

#### Ziua 7 - Îmbunătățire (Integrare + Early Bird)

Componenta `ChallengeDay7Complete.tsx` va fi actualizată să includă:
- Recapitulare a tuturor 6 zilelor (vizual)
- Prezentarea planurilor Early Bird (Basic/Pro/Elite) cu detalii clare
- CTA puternic pentru upgrade

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/pages/Challenge.tsx` | Update `challengeDays[]` array cu noi titluri și subtitluri |
| `src/pages/ChallengeDay.tsx` | Update `challengeContent[]` cu noi descrieri, pași și exerciții pentru zilele 2-7 |
| `src/components/challenge/ChallengeDay7Complete.tsx` | Îmbunătățire cu recap complet + prezentare planuri |

---

## Engagement în Comentarii

Fiecare zi va include exerciții de tip "Share in Comments":

| Zi | Ce se postează în comentarii |
|----|------------------------------|
| 1 | Declarația Napoleon Hill |
| 2 | Declarația + 2-3 obiective cheie Corp/Spirit |
| 3 | 1 obiectiv Business + 1 intenție relație importantă |
| 4 | Milestone + task-urile Domino Door |
| 5 | 1 acțiune zilnică din rutină |
| 6 | Breakthrough după STACK |
| 7 | (opțional) Ce nivel aleg și de ce |

---

## Secțiune Tehnică

### Workflow Day 4 - Domino Door

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ZIUA 4 - DOMINO DOOR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User deschide /door                                         │
│     ↓                                                           │
│  2. Selectează domeniu (Body/Being/Balance/Business)            │
│     ↓                                                           │
│  3. Folosește AI Wizard pentru:                                 │
│     - Definire milestone săptămânal                             │
│     - 4 Chei măsurabile                                         │
│     - Acțiuni concrete per cheie                                │
│     ↓                                                           │
│  4. Conectează fiecare cheie la DE CE (viziunea din Ziua 1)     │
│     ↓                                                           │
│  5. Salvează și marchează exercițiile complete                  │
│     ↓                                                           │
│  6. Postează milestone în comentarii                            │
│                                                                 │
│  RITUAL DUMINICĂ: Planificare + Recap săptămâna următoare       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Day 6 - Accountability + STACK

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ZIUA 6 - MIND COACH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ACCOUNTABILITY COACH (Widget Dashboard):                       │
│  - Dacă nu ai routine → "Start Routine"                         │
│  - Dacă nu ai Domino Door → "Create Domino Door"                │
│  - Te readuce pe traseu                                         │
│                                                                 │
│  MIND COACH / STACK (zilnic, la începutul rutinei):             │
│  1. Identifică emoția (frică, furie, tristețe, îndoială)        │
│  2. Povestea din spate                                          │
│  3. Ce vrei de fapt                                             │
│  4. De ce                                                       │
│  5. Următorul pas                                               │
│     ↓                                                           │
│  TRANSFORMARE: Emoție limitatoare → Putere                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Timp Estimat

| Task | Timp |
|------|------|
| Update Challenge.tsx (titluri/subtitluri) | 15 min |
| Update ChallengeDay.tsx Ziua 2 | 15 min |
| Update ChallengeDay.tsx Ziua 3 | 15 min |
| Update ChallengeDay.tsx Ziua 4 (Domino Door) | 25 min |
| Update ChallengeDay.tsx Ziua 5 (Vision + Routine) | 20 min |
| Update ChallengeDay.tsx Ziua 6 (Accountability + STACK) | 25 min |
| Update ChallengeDay7Complete.tsx | 20 min |
| Testing | 15 min |
| **Total** | **~150 min** |
