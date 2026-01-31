
# Challenge AI Coach - Antrenor AI Dedicat pentru Challenge-ul de 7 Zile

## Obiectiv

Crearea unui AI Coach dedicat pentru Challenge-ul "Have It All Lifestyle" de 7 zile care:
- Cunoaște TOTUL despre cele 7 zile de Challenge (scripturi, exerciții, flow-uri)
- Cunoaște platforma complet (folosind `platformKnowledge.ts`)
- Funcționează cu TEXT și AUDIO (voce)
- Este disponibil pe `/challenge` și pe fiecare pagină de zi (`/challenge/1`, `/challenge/2`, etc.)
- Accountability Coach-ul general să fie ascuns pe paginile de Challenge

---

## Arhitectură Propusă

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CHALLENGE AI COACH                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Text Mode      │    │   Voice Mode      │                  │
│  │   (Chat input)   │    │   (Call/Speak)    │                  │
│  └────────┬─────────┘    └────────┬──────────┘                  │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              useChallengeCoach Hook                        │ │
│  │  - Tracks current day number                               │ │
│  │  - Injects day-specific context                            │ │
│  │  - Uses useVoiceConversation for audio                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                       │                                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Edge Function: challenge-coach                   │ │
│  │  - Full 7-day curriculum knowledge                         │ │
│  │  - Platform knowledge base                                 │ │
│  │  - User context (progress, tasks, missions)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fișiere Noi de Creat

| Fișier | Descriere |
|--------|-----------|
| `src/data/challengeKnowledge.ts` | Toate scripturile și cunoștințele despre cele 7 zile (din input-ul tău) |
| `src/hooks/useChallengeCoach.ts` | Hook principal pentru Challenge AI Coach |
| `src/components/challenge/ChallengeCoachWidget.tsx` | Widget-ul flotant pentru Challenge (similar cu Mind Coach) |
| `src/components/challenge/ChallengeCoachChat.tsx` | Interfața de chat text + voice |
| `src/components/challenge/ChallengeCoachInputBar.tsx` | Input bar cu suport text/speak/call |
| `supabase/functions/challenge-coach/index.ts` | Edge function pentru AI cu cunoștințe complete despre challenge |

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/components/Layout.tsx` | Ascunde AccountabilityCoachWidget pe rute /challenge |
| `src/pages/Challenge.tsx` | Adaugă ChallengeCoachWidget |
| `src/pages/ChallengeDay.tsx` | Adaugă ChallengeCoachWidget cu dayNumber |

---

## Detalii Tehnice

### 1. Challenge Knowledge Base (`challengeKnowledge.ts`)

Fișier cu toate scripturile furnizate de tine, structurate astfel:

```typescript
export interface ChallengeDayScript {
  day: number;
  titleEn: string;
  titleRo: string;
  scriptEn: string;
  scriptRo: string;
  focusAreas: ('body' | 'being' | 'balance' | 'business')[];
  exercisesEn: string[];
  exercisesRo: string[];
  keyInsightsEn: string[];
  keyInsightsRo: string[];
}

export const CHALLENGE_SCRIPTS: ChallengeDayScript[] = [
  {
    day: 1,
    titleEn: "VISION & DECLARATION",
    titleRo: "VIZIUNE ȘI DECLARAȚIE",
    scriptEn: `Welcome to Day One of your transformation journey...`,
    scriptRo: `Bine ai venit în Prima Zi a călătoriei tale de transformare...`,
    // ... restul conținutului din input-ul tău
  },
  // ... zilele 2-7
];
```

### 2. Edge Function (`challenge-coach/index.ts`)

System prompt care include:
- **Cunoștințe complete despre Challenge** (toate cele 7 zile, scripturi, exerciții)
- **Cunoștințe despre platformă** (din `platformKnowledge.ts`)
- **Context utilizator** (progres challenge, zi curentă, missions, weekly plan)
- **Tool calling** pentru `complete_exercise`, `navigate_to_page`

Modelul recomandat: `google/gemini-3-flash-preview` pentru latenŢă mică

### 3. Challenge Coach Widget (`ChallengeCoachWidget.tsx`)

Widget flotant care:
- Apare pe `/challenge` și `/challenge/:dayNumber`
- Arată buton cu icon și badge pentru ziua curentă
- Se deschide ca Sheet (drawer) din dreapta
- Suportă 3 moduri: Text, Speak (push-to-talk), Call (conversație continuă)

### 4. Voice Integration

Reutilizează infrastructura existentă:
- `useVoiceConversation.tsx` pentru Call mode
- `useVoiceInput.ts` pentru Speak mode
- `text-to-speech` edge function pentru TTS
- Voice ID: `EXAVITQu4vr4xnSDxMaL` (Sarah - multilingual)

### 5. Layout Modification

```typescript
// src/components/Layout.tsx
const isChallengeRoute = location.pathname.startsWith('/challenge');

// In return:
{!isChallengeRoute && <AccountabilityCoachWidget />}
```

---

## Flow Utilizator

1. Utilizatorul intră pe `/challenge` sau `/challenge/3`
2. Vede butonul flotant "Challenge Coach" (nu Accountability Coach)
3. Click pe buton deschide drawer-ul
4. Poate:
   - **Scrie** întrebări în română/engleză
   - **Speak** (push-to-talk): ține apăsat, vorbește, eliberează
   - **Call** (conversație): click pentru a începe conversația hands-free
5. AI-ul știe:
   - În ce zi este utilizatorul
   - Ce exerciții are de făcut
   - Ce a completat deja
   - Cum funcționează întreaga platformă

---

## Exemple de Interacțiuni

**Utilizator pe Ziua 3:**
> "Ce trebuie să fac azi?"

**Challenge Coach:**
> "Astăzi e Ziua 3 - Business + Domino Door! 🎯
> 
> Ai de parcurs un flow complet ghidat de AI:
> 1. Viziune Business pentru 1 an
> 2. Ținte pe 90 de zile
> 3. Milestone pentru prima lună
> 4. Configurare Domino Door cu 4 chei + WHY pentru fiecare
> 
> Apasă pe 'Start AI Wizard' pentru a începe. Vrei să îți explic mai multe despre Domino Door?"

---

**Utilizator:**
> "Unde pot să văd progresul meu?"

**Challenge Coach:**
> "Progresul tău apare în partea de sus a paginii Challenge - vezi bara de progres care arată zilele completate. Ai terminat 2 din 7 zile. De asemenea, poți vedea un rezumat complet în Ziua 7 când vei avea Recap-ul transformării tale!"

---

## Beneficii

1. **Contextual**: Știe exact în ce zi ești și ce ai de făcut
2. **Hands-free**: Modul Call permite coaching vocal continuu
3. **Personalizat**: Cunoaște obiectivele și progresul tău
4. **Consistent**: Același mesaj ca în videoclipuri, dar interactiv
5. **Separat**: Nu interferează cu Accountability Coach-ul general

---

## Estimare Efort

| Component | Timp Estimat |
|-----------|--------------|
| `challengeKnowledge.ts` | 30 min |
| Edge Function `challenge-coach` | 1-2 ore |
| `useChallengeCoach.ts` hook | 45 min |
| `ChallengeCoachWidget.tsx` | 1 oră |
| `ChallengeCoachChat.tsx` + InputBar | 1 oră |
| Modificări Layout + Pages | 30 min |
| Testare și ajustări | 1 oră |
| **TOTAL** | **5-7 ore** |

---

## Internationalizare (i18n)

Toate componentele vor suporta RO/EN folosind `useLanguage()`:
- System prompts cu versiuni RO și EN
- UI labels bilingve
- Scripturi în ambele limbi din `challengeKnowledge.ts`
