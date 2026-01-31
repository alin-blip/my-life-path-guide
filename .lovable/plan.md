
# Plan: Story Framework pentru Content Creation în Rutina Războinicului

## Obiectiv
Adăugarea unui framework de storytelling bazat pe cele **7 Elemente ale unei Povești** în secțiunea de Content Creation din rutina campionului, care să:
1. Ghideze utilizatorul prin cele 7 întrebări ale framework-ului
2. Genereze un script bazat pe răspunsuri folosind AI
3. Fie accesibil și din secțiunea Tools/Stacks

## Cele 7 Elemente ale Storytelling-ului (din imagine)

```text
1. DESIRE       - Ce dorește protagonistul (audiența)?
2. PROBLEM/NEED - Ce problemă sau nevoie are?
3. OPPONENT     - Cine/ce se opune? (extern, intern, intim)
4. PLAN         - Care e planul de acțiune?
5. BATTLE       - Ce luptă trebuie dată?
6. SELF-REVELATION - Ce revelație/transformare apare?
7. EQUILIBRIUM  - Care e starea finală nouă?
```

## Arhitectura Soluției

### Componente Noi

| Fișier | Descriere |
|--------|-----------|
| `src/components/content-creation/StorytellingStack.tsx` | Componentă principală cu UI pentru cele 7 întrebări |
| `src/components/content-creation/storytellingQuestions.ts` | Definiție întrebări bilingve (RO/EN) |
| `src/components/content-creation/useStorytellingStack.ts` | Hook pentru state management și logică |
| `supabase/functions/generate-story-script/index.ts` | Edge function pentru generare script cu AI |

### Modificări Existente

| Fișier | Modificare |
|--------|------------|
| `src/components/champion-routine/steps/ContentCreationStep.tsx` | Adaugă opțiune Storytelling alături de Simple Topic |
| `src/components/stack/AiGuidedStack.tsx` | Adaugă `storytelling` ca stackType nou |
| `src/pages/Tools.tsx` sau echivalent | Adaugă Storytelling Stack în lista de tools |

---

## Detalii Tehnice

### 1. Definiția Întrebărilor (`storytellingQuestions.ts`)

```typescript
export const getStorytellingQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      {
        step: 1,
        element: 'Desire',
        emoji: '🎯',
        question: 'What does your audience/protagonist deeply WANT?',
        placeholder: 'E.g.: To feel confident, to make more money, to be healthy...',
        hint: 'The burning desire that drives action'
      },
      {
        step: 2,
        element: 'Problem/Need',
        emoji: '💔',
        question: 'What PROBLEM or NEED are they facing?',
        placeholder: 'E.g.: They feel stuck, overwhelmed, lacking direction...',
        hint: 'The gap between current reality and desire'
      },
      {
        step: 3,
        element: 'Opponent',
        emoji: '⚔️',
        question: 'Who or what is the OPPONENT? (external, internal, or intimate)',
        placeholder: 'External: competition, economy. Internal: fear, doubt. Intimate: family, friends...',
        hint: 'The force that blocks progress'
      },
      {
        step: 4,
        element: 'Plan',
        emoji: '📋',
        question: 'What is the PLAN to overcome this?',
        placeholder: 'E.g.: Follow these 5 steps, use this method, adopt this mindset...',
        hint: 'Your solution/framework/system'
      },
      {
        step: 5,
        element: 'Battle',
        emoji: '🔥',
        question: 'What BATTLE must be fought?',
        placeholder: 'E.g.: The moment of confrontation, the hard work required...',
        hint: 'The climax, the real test'
      },
      {
        step: 6,
        element: 'Self-Revelation',
        emoji: '💡',
        question: 'What REVELATION or transformation occurs?',
        placeholder: 'E.g.: They realize their true potential, discover hidden strength...',
        hint: 'The "aha" moment, the inner change'
      },
      {
        step: 7,
        element: 'Equilibrium',
        emoji: '✨',
        question: 'What is the NEW EQUILIBRIUM?',
        placeholder: 'E.g.: Living with confidence, financial freedom, peace of mind...',
        hint: 'The new normal after transformation'
      }
    ];
  }
  
  // Romanian version
  return [
    {
      step: 1,
      element: 'Dorință',
      emoji: '🎯',
      question: 'Ce DOREȘTE profund audiența/protagonistul tău?',
      placeholder: 'Ex: Să se simtă încrezător, să facă mai mulți bani, să fie sănătos...',
      hint: 'Dorința arzătoare care motivează acțiunea'
    },
    {
      step: 2,
      element: 'Problemă/Nevoie',
      emoji: '💔',
      question: 'Ce PROBLEMĂ sau NEVOIE are?',
      placeholder: 'Ex: Se simt blocați, copleșiți, fără direcție...',
      hint: 'Gap-ul între realitatea curentă și dorință'
    },
    {
      step: 3,
      element: 'Oponent',
      emoji: '⚔️',
      question: 'Cine sau ce este OPONENTUL? (extern, intern sau intim)',
      placeholder: 'Extern: competiția, economia. Intern: frica, îndoiala. Intim: familia, prietenii...',
      hint: 'Forța care blochează progresul'
    },
    {
      step: 4,
      element: 'Plan',
      emoji: '📋',
      question: 'Care este PLANUL pentru a depăși asta?',
      placeholder: 'Ex: Urmează acești 5 pași, folosește această metodă, adoptă această mentalitate...',
      hint: 'Soluția ta / framework-ul / sistemul'
    },
    {
      step: 5,
      element: 'Bătălie',
      emoji: '🔥',
      question: 'Ce BĂTĂLIE trebuie dată?',
      placeholder: 'Ex: Momentul confruntării, munca grea necesară...',
      hint: 'Climax-ul, testul real'
    },
    {
      step: 6,
      element: 'Revelație',
      emoji: '💡',
      question: 'Ce REVELAȚIE sau transformare apare?',
      placeholder: 'Ex: Realizează potențialul adevărat, descoperă forța ascunsă...',
      hint: 'Momentul "aha", schimbarea interioară'
    },
    {
      step: 7,
      element: 'Echilibru Nou',
      emoji: '✨',
      question: 'Care este NOUL ECHILIBRU?',
      placeholder: 'Ex: Trăiește cu încredere, libertate financiară, liniște sufletească...',
      hint: 'Normalul nou după transformare'
    }
  ];
};
```

### 2. Componenta StorytellingStack

Structură UI modernă cu:
- **Progress indicator** vizual pentru cele 7 etape
- **Card pentru fiecare întrebare** cu emoji și context
- **Textarea** pentru răspuns
- **Navigare înainte/înapoi** între etape
- **Preview colapsabil** al răspunsurilor anterioare
- **Buton "Generează Script"** la final

```text
UI Flow:
┌─────────────────────────────────────────┐
│ 🎬 Storytelling Framework               │
│ ─────────────────────────────────────── │
│  ① ② ③ ④ ⑤ ⑥ ⑦                          │
│        ↑ (current: 3)                   │
├─────────────────────────────────────────┤
│ ⚔️ Pasul 3: Oponent                     │
│                                         │
│ "Cine sau ce este OPONENTUL?"           │
│ (extern, intern sau intim)              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Textarea pentru răspuns]           │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Hint: Forța care blochează progresul │
│                                         │
│ [← Înapoi]              [Continuă →]    │
├─────────────────────────────────────────┤
│ ▼ Vezi răspunsurile anterioare          │
│   ① Dorință: "Să devină influencer..."  │
│   ② Problemă: "Nu știe de unde..."      │
└─────────────────────────────────────────┘
```

### 3. Edge Function pentru Generare Script

```typescript
// supabase/functions/generate-story-script/index.ts

const systemPrompt = `Ești un expert în storytelling pentru social media.
Creezi scripturi captivante bazate pe cele 7 elemente ale unei povești:
Desire, Problem, Opponent, Plan, Battle, Self-Revelation, Equilibrium.

Reguli:
1. Hook puternic bazat pe DESIRE + PROBLEM
2. Introduce OPPONENT ca obstacol relatable
3. Prezintă PLAN ca soluție concretă
4. BATTLE = momentul de turning point
5. SELF-REVELATION = insight-ul cheie
6. EQUILIBRIUM = CTA + viziunea finală
7. Ton conversațional, empatic, direct`;

const userPrompt = `Creează un script pentru ${contentType} bazat pe aceste elemente:

🎯 DESIRE: ${answers[1]}
💔 PROBLEM: ${answers[2]}
⚔️ OPPONENT: ${answers[3]}
📋 PLAN: ${answers[4]}
🔥 BATTLE: ${answers[5]}
💡 REVELATION: ${answers[6]}
✨ EQUILIBRIUM: ${answers[7]}

Format:
- HOOK (3 sec) - bazat pe desire/problem
- CONFLICT (10-15 sec) - opponent + stakes
- JOURNEY (20-30 sec) - plan + battle
- TRANSFORMATION (10 sec) - revelation
- CTA (5 sec) - equilibrium + action`;
```

### 4. Integrare în ContentCreationStep

Modificare pentru a oferi două opțiuni:

```text
┌─────────────────────────────────────────┐
│ 🎬 Content Creation                     │
│                                         │
│ Alege metoda de creare:                 │
│                                         │
│ ┌─────────────┐  ┌─────────────────────┐│
│ │ 📝 Simple   │  │ 📖 Storytelling     ││
│ │ Topic       │  │ Framework           ││
│ │             │  │                     ││
│ │ Scrie un    │  │ Ghidare pas cu pas  ││
│ │ topic și AI │  │ prin 7 elemente     ││
│ │ generează   │  │ pentru povești care ││
│ │             │  │ captează atenția    ││
│ └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────┘
```

### 5. Integrare ca Tool/Stack

Adăugare în lista de stacks disponibile pentru acces independent:

```typescript
// În configurația stacks-urilor
{
  id: 'storytelling',
  name: 'Storytelling Framework',
  icon: BookOpen,
  description: 'Creează content captivant cu cele 7 elemente ale unei povești',
  category: 'business',
  component: StorytellingStack
}
```

---

## Flux Utilizator

### Din Rutina Campionului

```text
User în ContentCreationStep
        │
        ▼
Alege "Storytelling Framework"
        │
        ▼
Răspunde la cele 7 întrebări
        │
        ▼
Click "Generează Script"
        │
        ▼
AI generează script bazat pe poveste
        │
        ▼
Editează/Confirmă script
        │
        ▼
Trece la Pomodoro pentru creare
```

### Acces Direct din Tools

```text
User în Tools/Stacks
        │
        ▼
Click pe "Storytelling Framework"
        │
        ▼
UI identic cu cel din rutină
        │
        ▼
Script salvat în Stack Library
```

---

## Fișiere de Creat/Modificat

| Acțiune | Fișier |
|---------|--------|
| **Creare** | `src/components/content-creation/storytellingQuestions.ts` |
| **Creare** | `src/components/content-creation/useStorytellingStack.ts` |
| **Creare** | `src/components/content-creation/StorytellingStack.tsx` |
| **Creare** | `supabase/functions/generate-story-script/index.ts` |
| **Modificare** | `src/components/champion-routine/steps/ContentCreationStep.tsx` |
| **Modificare** | Configurația stacks/tools pentru adăugare în lista disponibilă |

---

## Beneficii

1. **Structură clară** - Utilizatorul nu mai trebuie să știe storytelling, framework-ul îl ghidează
2. **Scripturi mai bune** - AI-ul primește context complet, nu doar un topic vag
3. **Refolosibil** - Poate fi accesat și din Tools, nu doar din rutină
4. **Educativ** - Utilizatorul învață storytelling prin practică
5. **Consistent** - Folosește aceleași pattern-uri UI ca celelalte stacks (Hormozi, Gods School, etc.)
