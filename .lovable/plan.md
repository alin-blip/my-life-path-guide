
# Plan: Hero's Journey Framework pentru Content Creation

## Obiectiv
Adăugarea unui al doilea framework de storytelling bazat pe **"The Hero's Journey"** (Joseph Campbell) în secțiunea de Content Creation din rutina campionului, care să:
1. Ghideze utilizatorul prin cele 7 etape ale călătoriei eroului
2. Genereze un script bazat pe răspunsuri folosind AI (cu prompt de copywriter/storyteller expert)
3. Fie accesibil atât din rutină (alegere între Storytelling și Hero's Journey) cât și din Tools (ambele disponibile)

## Cele 7 Etape ale Hero's Journey (din imaginea ta)

```text
Step 1: The Ordinary World        - Lumea obișnuită a protagonistului
Step 2: The Call to Adventure     - Chemarea la aventură
Step 3: Refusal of the Call       - Refuzul chemării
Step 4: Meeting the Mentor        - Întâlnirea cu mentorul / Găsirea aliaților
Step 5: Crossing the Threshold    - Traversarea pragului (Punctul fără întoarcere)
Step 6: The Ordeal/Transformation - Încercarea / Transformarea
Step 7: The Return and Elixir     - Întoarcerea cu elixirul
```

## Arhitectura Soluției

### Componente Noi

| Fișier | Descriere |
|--------|-----------|
| `src/components/content-creation/HeroJourneyStack.tsx` | Componentă UI pentru cele 7 etape (similar cu StorytellingStack) |
| `src/components/content-creation/heroJourneyQuestions.ts` | Întrebări bilingve (RO/EN) pentru Hero's Journey |
| `src/components/content-creation/useHeroJourneyStack.ts` | Hook pentru state management și logică |
| `supabase/functions/generate-hero-journey-script/index.ts` | Edge function pentru generare script cu AI |

### Modificări Existente

| Fișier | Modificare |
|--------|------------|
| `src/components/champion-routine/steps/ContentCreationStep.tsx` | Adaugă opțiune Hero's Journey ca a 3-a metodă |
| Tools/Stacks page | Adaugă ambele framework-uri (Storytelling + Hero's Journey) |

---

## Detalii Tehnice

### 1. Întrebările Hero's Journey (`heroJourneyQuestions.ts`)

**Română:**
```text
🏠 Step 1 - Lumea Obișnuită
   "Cum arată viața protagonistului ÎNAINTE de schimbare?"
   Placeholder: "Ex: Trăiește în rutină, are un job stabil dar nu e fericit..."
   Hint: "Status quo-ul inițial, zona de confort"

📢 Step 2 - Chemarea la Aventură  
   "Ce EVENIMENT sau SITUAȚIE îl cheamă spre schimbare?"
   Placeholder: "Ex: Pierde jobul, descoperă o oportunitate, întâlnește pe cineva..."
   Hint: "Catalizatorul, momentul care schimbă totul"

😰 Step 3 - Refuzul Chemării
   "De ce EZITĂ sau REFUZĂ inițial?"
   Placeholder: "Ex: Frica de eșec, lipsa de încredere, ce vor spune alții..."
   Hint: "Fricile și barierele interne"

🧙 Step 4 - Întâlnirea cu Mentorul
   "Cine/ce îl AJUTĂ să accepte provocarea?"
   Placeholder: "Ex: Un mentor, o carte, o experiență, TU ca ghid..."
   Hint: "Suportul, cunoștințele, uneltele primite"

🚪 Step 5 - Traversarea Pragului
   "Care este PUNCTUL FĂRĂ ÎNTOARCERE?"
   Placeholder: "Ex: Demisionează, investește, face primul pas public..."
   Hint: "Decizia ireversibilă, commitment-ul"

🔥 Step 6 - Încercarea/Transformarea
   "Ce TESTE și TRANSFORMĂRI traversează?"
   Placeholder: "Ex: Eșecuri, lecții, momente de creștere..."
   Hint: "Provocările care îl schimbă"

👑 Step 7 - Întoarcerea cu Elixirul
   "Ce ADUCE ÎNAPOI în lumea lui?"
   Placeholder: "Ex: Cunoștințe, succes, transformare pe care o împărtășește..."
   Hint: "Lecția, rezultatul, ce oferă lumii"
```

### 2. Componenta HeroJourneyStack

**UI identic cu StorytellingStack dar cu:**
- Culoarare diferită (cyan/teal în loc de purple)
- Icon diferit (Compass/Map în loc de BookOpen)
- 7 etape cu emojis specifici

```text
┌─────────────────────────────────────────┐
│ 🗺️ Hero's Journey Framework            │
│ ─────────────────────────────────────── │
│  🏠 📢 😰 🧙 🚪 🔥 👑                    │
│        ↑ (current: 3)                   │
├─────────────────────────────────────────┤
│ 😰 Pasul 3: Refuzul Chemării            │
│                                         │
│ "De ce EZITĂ sau REFUZĂ inițial?"       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Textarea pentru răspuns]           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Hint: Fricile și barierele interne   │
│                                         │
│ [← Înapoi]              [Continuă →]    │
└─────────────────────────────────────────┘
```

### 3. Edge Function pentru Generare Script (`generate-hero-journey-script`)

**Prompt de Copywriter Expert:**

```typescript
const systemPrompt = language === 'en' 
  ? `You are an expert storyteller and copywriter specializing in the Hero's Journey framework by Joseph Campbell.
You create captivating social media scripts that take the audience on an emotional journey.

YOUR EXPERTISE:
- Master of narrative structure and story arcs
- Expert in emotional triggers and audience psychology  
- Skilled in transforming abstract concepts into relatable stories
- Specialist in hooks that stop the scroll

THE 7 STAGES YOU WORK WITH:
1. Ordinary World - Establish relatability
2. Call to Adventure - Create intrigue
3. Refusal of the Call - Build tension through relatable fears
4. Meeting the Mentor - Introduce hope and guidance
5. Crossing the Threshold - Show commitment and courage
6. The Ordeal - Build through challenges and transformation
7. Return with Elixir - Deliver the payoff and CTA

SCRIPT STRUCTURE:
- HOOK (3 sec): Start in the Ordinary World OR with a provocative question
- SETUP (10 sec): Call to Adventure + initial refusal
- BUILD (20-30 sec): Mentor + Crossing threshold + Ordeal
- PAYOFF (10 sec): Transformation + Return with wisdom
- CTA (5 sec): Invite audience to their own journey

TONE: Conversational, empathetic, inspiring. Speak as if sharing a powerful story with a close friend.`
  : `Ești un storyteller și copywriter expert specializat în Hero's Journey framework de Joseph Campbell.
Creezi scripturi captivante pentru social media care duc audiența printr-o călătorie emoțională.

EXPERTIZA TA:
- Maestru în structura narativă și arcuri narative
- Expert în triggere emoționale și psihologia audienței
- Abil în transformarea conceptelor abstracte în povești relatable
- Specialist în hook-uri care opresc scroll-ul

CELE 7 ETAPE CU CARE LUCREZI:
1. Lumea Obișnuită - Stabilește relatability
2. Chemarea la Aventură - Creează intriga
3. Refuzul Chemării - Construiește tensiune prin frici relatable
4. Întâlnirea cu Mentorul - Introduce speranța și ghidarea
5. Traversarea Pragului - Arată commitment și curaj
6. Încercarea - Construiește prin provocări și transformare
7. Întoarcerea cu Elixirul - Livrează payoff-ul și CTA

STRUCTURA SCRIPTULUI:
- HOOK (3 sec): Începe în Lumea Obișnuită SAU cu o întrebare provocatoare
- SETUP (10 sec): Chemarea + refuzul inițial
- BUILD (20-30 sec): Mentor + Traversarea pragului + Încercarea
- PAYOFF (10 sec): Transformarea + Întoarcerea cu înțelepciune
- CTA (5 sec): Invită audiența la propria călătorie

TON: Conversațional, empatic, inspirațional. Vorbește ca și cum împărtășești o poveste puternică cu un prieten apropiat.`;

const userPrompt = `Creează un script pentru ${contentTypeLabel} bazat pe Hero's Journey:

🏠 LUMEA OBIȘNUITĂ: ${answers[1]}
📢 CHEMAREA LA AVENTURĂ: ${answers[2]}
😰 REFUZUL CHEMĂRII: ${answers[3]}
🧙 MENTORUL/ALIAȚII: ${answers[4]}
🚪 TRAVERSAREA PRAGULUI: ${answers[5]}
🔥 ÎNCERCAREA/TRANSFORMAREA: ${answers[6]}
👑 ÎNTOARCEREA CU ELIXIRUL: ${answers[7]}

Format:
- 🎬 HOOK (3 sec) - captează atenția
- ⚡ SETUP (10 sec) - stabilește contextul
- 🚀 BUILD (20-30 sec) - călătoria și transformarea
- 💫 PAYOFF (10 sec) - revelația finală
- 🎯 CTA (5 sec) - invitația la acțiune

Scrie natural, ca și cum spui o poveste unui prieten. Include pauze [PAUZĂ] și accent *unde e nevoie*.`;
```

### 4. Integrare în ContentCreationStep

**Modificare pentru 3 opțiuni:**

```text
┌─────────────────────────────────────────────────────┐
│ 🎬 Content Creation                                 │
│                                                     │
│ Alege metoda pentru a crea conținut captivant:      │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ │
│ │ 📝 Topic    │ │ 📖 Story-   │ │ 🗺️ Hero's      │ │
│ │ Simplu      │ │ telling     │ │ Journey        │ │
│ │             │ │             │ │                │ │
│ │ Rapid       │ │ 7 Elemente  │ │ 7 Etape ale    │ │
│ │ și direct   │ │ ale unei    │ │ călătoriei     │ │
│ │             │ │ povești     │ │ eroului        │ │
│ └─────────────┘ └─────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 5. Integrare în Tools (ambele framework-uri)

Trebuie să găsim pagina/componenta pentru Tools și să adăugăm:

```typescript
// În configurația tools/stacks
[
  {
    id: 'storytelling',
    name: 'Storytelling Framework',
    icon: BookOpen,
    color: 'purple',
    description: '7 Elemente ale unei Povești Captivante',
    component: StorytellingStack
  },
  {
    id: 'hero-journey',
    name: "Hero's Journey",
    icon: Compass,
    color: 'cyan',
    description: '7 Etape ale Călătoriei Eroului (Joseph Campbell)',
    component: HeroJourneyStack
  }
]
```

---

## Fișiere de Creat

| Fișier | Descriere |
|--------|-----------|
| `src/components/content-creation/heroJourneyQuestions.ts` | Întrebări bilingve pentru cele 7 etape |
| `src/components/content-creation/useHeroJourneyStack.ts` | Hook similar cu useStorytellingStack |
| `src/components/content-creation/HeroJourneyStack.tsx` | Componentă UI cu styling cyan/teal |
| `supabase/functions/generate-hero-journey-script/index.ts` | Edge function cu prompt expert |

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/components/champion-routine/steps/ContentCreationStep.tsx` | Adaugă Hero's Journey ca a 3-a opțiune |
| `supabase/config.toml` | Adaugă noua edge function |
| Tools/Stacks page (de identificat) | Adaugă ambele framework-uri |

---

## Comparație Vizuală: Storytelling vs Hero's Journey

| Aspect | Storytelling | Hero's Journey |
|--------|-------------|----------------|
| **Culoare** | Purple (#8B5CF6) | Cyan (#06B6D4) |
| **Icon** | BookOpen 📖 | Compass 🗺️ |
| **Focus** | Elemente narative | Etape de transformare |
| **Utilizare** | Content educațional | Content inspirațional |
| **Pași** | 7 (Desire → Equilibrium) | 7 (Ordinary → Return) |

---

## Beneficii

1. **Diversitate** - Două framework-uri diferite pentru nevoi diferite
2. **Flexibilitate** - Alegere în rutină, ambele în Tools
3. **Expertiză** - Prompt-uri scrise ca un copywriter/storyteller profesionist
4. **Consistență** - Aceeași experiență UI, culori și iconuri diferite pentru diferențiere clară
