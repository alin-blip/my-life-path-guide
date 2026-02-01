
# Plan: Decision Breakthrough Course + Learn Hub

## Rezumat Executiv

Vom crea un **curs complet bazat pe Tony Robbins' Decision Breakthrough** cu text, audio, AI coach și integrare în Domino Door. Vom restructura secțiunea Learn pentru a deveni un hub de cursuri și vom crea un landing page pentru lead magnet.

## Conținut Document Tony Robbins

Documentul conține framework-ul **Decide → Commit → Resolve** în 4 săptămâni:

| Săptămână | Focus | AI Prompt |
|-----------|-------|-----------|
| Week 1 | Identity & Vision | "Help me clarify who I am now versus who I need to become..." |
| Week 2 | Anticipate Challenges | "Help me identify the fears, beliefs, and patterns..." |
| Week 3 | Assess & Adjust | "Help me evaluate what's working, what's not..." |
| Week 4 | Lock In Habits | "Help me turn this momentum into daily habits..." |

### Principii Cheie din Document:
1. **Decision** = Cut off all other options (Latin: de-caedere)
2. **Commitment** = Taking decision into the future with 2+ actions
3. **Resolve** = Identity-level certainty, peace, effortless action
4. **Rule**: "Never leave the site of a decision without taking action immediately"

## Arhitectura Soluției

```text
┌─────────────────────────────────────────────────────────────────┐
│                    /learn - LEARN HUB                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Think & Grow │ │ Decision     │ │ Viitoare     │             │
│  │ Rich (Existent) │ Breakthrough│ │ Cursuri      │             │
│  │              │ │ (NOU!)       │ │              │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           /learn/decision-breakthrough - CURS                   │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: Citește | Ascultă | AI Coach | Implementează             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ CITEȘTE - Text structurat pe module:                        ││
│  │ • Intro: The Creator's Playbook                             ││
│  │ • Module 1: Mastering Invisible Forces                      ││
│  │ • Module 2: Decide (Present Moment)                         ││
│  │ • Module 3: Commit (Future Action)                          ││
│  │ • Module 4: Resolve (Identity Certainty)                    ││
│  │ • Week 1-4: Roadmap                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ASCULTĂ - Buton TTS pentru fiecare secțiune (ElevenLabs)    ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ AI COACH - Chat + Talk + Speak (ca Mind Coach)              ││
│  │ • Prompturile din document pre-încărcate                    ││
│  │ • Buton "Use This Prompt" pentru fiecare săptămână          ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ IMPLEMENTEAZĂ - Integrare Domino Door                       ││
│  │ • Transformă decizia în Domino (obiectivul săptămânii)      ││
│  │ • 2 Commitments → Key Points                                ││
│  │ • Resolve → Habit tracking                                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Integrarea cu Domino Door

Framework-ul Tony Robbins se potrivește PERFECT cu Domino Door:

```text
┌─────────────────────────────────────────────────────────────────┐
│  TONY ROBBINS               →      DOMINO DOOR                  │
├─────────────────────────────────────────────────────────────────┤
│  DECIDE (Cut off options)   →      Selectează Domino            │
│                                    (1 singur focus săptămânal)  │
│                                                                 │
│  COMMIT (2+ actions)        →      4 Key Points                 │
│                                    (acțiuni concrete)           │
│                                                                 │
│  RESOLVE (Identity)         →      Weekly Completion            │
│                                    + Add to Habits              │
└─────────────────────────────────────────────────────────────────┘
```

## Fișiere de Creat

| Fișier | Scop |
|--------|------|
| `src/pages/LearnHub.tsx` | Noul hub pentru cursuri (înlocuiește /learn curent) |
| `src/pages/DecisionBreakthroughCourse.tsx` | Pagina cursului complet |
| `src/components/learn/CourseTextReader.tsx` | Componentă pentru citit text + audio |
| `src/components/learn/DecisionCoach.tsx` | AI Coach specific pentru Decision Breakthrough |
| `src/components/learn/ImplementationTab.tsx` | Integrare cu Domino Door |
| `src/pages/DecisionBreakthroughLanding.tsx` | Landing page pentru lead magnet |
| `supabase/functions/decision-coach/index.ts` | Edge function pentru AI coach |
| `src/data/decisionBreakthroughContent.ts` | Conținutul cursului structurat |

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/App.tsx` | Adaugă rute noi: `/learn` (hub), `/learn/decision-breakthrough`, `/decision-breakthrough-landing` |
| `src/components/SideMenu.tsx` | Adaugă "Learn" în meniu lateral |
| `supabase/config.toml` | Adaugă funcția `decision-coach` |

## Structura Cursului în Cod

```typescript
// src/data/decisionBreakthroughContent.ts
export const courseModules = [
  {
    id: 'intro',
    title: "The Creator's Playbook",
    content: `We are living through the most extraordinary moment...`,
    aiPrompt: null,
    duration: '3 min'
  },
  {
    id: 'week-1',
    title: 'Week 1: Build Your Foundation',
    subtitle: 'Identity, Inner Work & Vision',
    content: `...`,
    aiPrompt: "Help me clarify who I am now versus who I need to become. What identity shift must I make to create real transformation across my life?",
    duration: '15 min'
  },
  // ... more modules
];
```

## AI Coach - Prompturi din Document

```typescript
const weeklyPrompts = [
  {
    week: 1,
    title: 'Build Your Foundation',
    prompt: "Help me clarify who I am now versus who I need to become. What identity shift must I make to create real transformation across my life?"
  },
  {
    week: 2,
    title: 'Anticipate Challenges',
    prompt: "Help me identify the fears, beliefs, and patterns that will surface when resistance appears. Build a plan to stay empowered under pressure."
  },
  {
    week: 3,
    title: 'Assess & Adjust',
    prompt: "Help me evaluate what's working, what's not, and what I can learn from setbacks. What adjustments will accelerate momentum?"
  },
  {
    week: 4,
    title: 'Lock In Habits',
    prompt: "Help me turn this month's momentum into daily habits. What rituals will reinforce my new identity and sustain progress?"
  }
];
```

## Landing Page pentru Lead Magnet

```text
┌─────────────────────────────────────────────────────────────────┐
│  /decision-breakthrough-landing                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎯 DECISION BREAKTHROUGH                                       │
│  Sistemul în 3 Pași pentru a Lua Decizii Care Îți Schimbă Viața │
│                                                                 │
│  "Așa cum Tony Robbins ne învață..."                           │
│                                                                 │
│  ✓ Framework: Decide → Commit → Resolve                         │
│  ✓ 4 Săptămâni de Transformare Ghidată                          │
│  ✓ AI Coach pentru Fiecare Etapă                                │
│  ✓ Integrare cu Sistemul tău de Planificare                     │
│                                                                 │
│  [Începe GRATUIT - 3 Zile Trial]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Side Menu Update

```typescript
// În SideMenu.tsx - după Stacks
{
  title: 'Learn',
  icon: GraduationCap,  // sau BookOpen
  path: '/learn',
  badge: 'NEW'
},
```

## Edge Function pentru Decision Coach

```typescript
// supabase/functions/decision-coach/index.ts
// Similar cu mind-coach dar cu system prompt specific:

const systemPrompt = `You are Tony Robbins' Decision Breakthrough Coach.

Your role is to guide users through the 3-step decision process:
1. DECIDE - Cut off all other options
2. COMMIT - Take 2+ actions while in state
3. RESOLVE - Reach identity-level certainty

Key principles:
- "Never leave the site of a decision without taking action immediately"
- Commitment reaches into the future with emotional fuel
- Resolve is peace, not pressure

You have access to tools:
- add_to_domino: Set user's weekly focus decision
- add_key_point: Add commitment actions to Domino Door
- add_habit: Lock in resolve as daily habit

Guide users through their specific decisions using this framework.`;
```

## Flux Utilizator

```text
1. User accesează /learn
   └→ Vede hub-ul cu cursurile disponibile

2. Click pe "Decision Breakthrough"
   └→ /learn/decision-breakthrough

3. Navighează prin tabs:
   ├→ Citește: Text structurat pe module
   ├→ Ascultă: Play audio pentru fiecare secțiune
   ├→ AI Coach: Conversație cu prompturi pregătite
   └→ Implementează: 
       ├→ Scrie decizia → devine Domino
       ├→ Scrie 2 commitments → devin Key Points
       └→ Definește resolve → devine Habit

4. Utilizatorul are decizia integrată în Door-ul său săptămânal
```

## Migrare Database

Nu e nevoie de tabele noi - folosim:
- `weekly_planning` pentru Domino integration
- `daily_habits` pentru Resolve → Habits
- `user_tasks` pentru Key Points → HIT List
- `email_leads` pentru lead magnet tracking

## Prioritizare Implementare

| Prioritate | Component | Timp Estimat |
|------------|-----------|--------------|
| 1 | Conținut curs (data file) | 30 min |
| 2 | LearnHub.tsx + routing | 20 min |
| 3 | DecisionBreakthroughCourse.tsx | 45 min |
| 4 | CourseTextReader + TTS | 30 min |
| 5 | DecisionCoach + Edge Function | 45 min |
| 6 | ImplementationTab (Domino integration) | 30 min |
| 7 | Landing Page | 30 min |
| 8 | Side Menu update | 5 min |

## Beneficii

- **Educație + Execuție**: Nu doar citești, ci implementezi
- **AI Personalizat**: Prompturile Tony Robbins adaptate la contextul tău
- **Integrare Nativă**: Deciziile devin automat parte din planificarea săptămânală
- **Lead Magnet Puternic**: Landing page cu valoare reală pentru achiziții
- **Scalabilitate**: Structura permite adăugarea de noi cursuri în viitor
