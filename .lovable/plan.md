
# Plan: Fix English Challenge Audio + Unified Card Layout

## Summary

Rezolvăm cele 3 probleme principale:

1. **Audio doar 20 secunde** - Eliminăm truncarea la 300 caractere din Audio Player (edge function-ul are deja o limită, dar o creștem la 2000 caractere pentru audio mai lung)
2. **Două carduri separate → Un singur card** - Combinăm Audio + Text + Chat într-un singur card unificat
3. **Scroll nu funcționează** - Fixăm ScrollArea cu height fix în loc de maxHeight pe style

---

## Scripturile Existente (Day 0-7)

Deja ai scripturi complete în `src/data/challengeScripts.ts`:

| Day | Script Function | Conținut |
|-----|-----------------|----------|
| **Day 0** | `getChallengeIntroScript()` | Welcome + 7-Day Map + Why This Works |
| **Day 1** | `getDay1VisionScript()` | Vision + Declaration (Reality Check, WHY, Napoleon Hill) |
| **Day 2** | `getDay2FoundationScript()` | Body + Spirit + Relationships goals |
| **Day 3** | `getDay3BusinessScript()` | Business + Domino Door system |
| **Day 4** | `getDay4RoutineScript()` | Warrior Routine + AI Vision + Meditation |
| **Day 5** | `getDay5MindCoachScript()` | Accountability + Mind Coach (emotional transformation) |
| **Day 6** | `getDay6ImpulseScript()` | Idea List + Eisenhower Matrix filter |
| **Day 7** | `getDay7IntegrationScript()` | Integration + 90-Day Commitment |

---

## Problem 1: Audio Duration Fix

### Cauza
În `ChallengeAudioPlayer.tsx` linia 41:
```typescript
const truncatedText = plainText.substring(0, 300);
```
300 caractere = ~20 secunde audio.

### Soluția
Creștem limita la 2000 caractere (aproximativ 2-3 minute audio):
```typescript
const truncatedText = plainText.substring(0, 2000);
```

Edge function-ul are deja propria limită (300 chars), dar o vom crește și acolo la 2000 pentru a permite scripturi mai lungi.

---

## Problem 2: Un Singur Card Unificat

### Layout Actual (2 carduri)
```
┌─────────────────────────────┐
│ Audio Player + Script Text  │  ← Card 1
└─────────────────────────────┘
┌─────────────────────────────┐
│ Ask Your Challenge Coach    │  ← Card 2
└─────────────────────────────┘
```

### Layout Nou (1 card)
```
┌─────────────────────────────┐
│ 🎧 Audio Player             │
├─────────────────────────────┤
│ 📜 Script Text (scrollable) │
├─────────────────────────────┤
│ 💬 Ask Your Challenge Coach │
└─────────────────────────────┘
```

---

## Problem 3: ScrollArea Fix

### Cauza
`ScrollArea` cu `style={{ maxHeight }}` nu activează scroll-ul corect.

### Soluția
Folosim o clasă cu height fix și overflow:
```typescript
<div className="relative h-[300px]">
  <ScrollArea className="h-full p-6">
    ...
  </ScrollArea>
  {/* Fade gradient */}
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/challenge/english/ChallengeAudioPlayer.tsx` | Crește limita text la 2000 caractere |
| `src/components/challenge/english/ChallengeScriptCard.tsx` | Fix ScrollArea cu height fix |
| `src/pages/ChallengeEnglish.tsx` | Unifică Audio + Text + Chat într-un singur card |
| `src/pages/ChallengeDayEnglish.tsx` | Unifică Audio + Text + Chat într-un singur card (ambele flow-uri: Day 1 și Days 2-7) |
| `supabase/functions/text-to-speech-demo/index.ts` | Crește limita de truncare la 2000 caractere |

---

## Technical Implementation

### 1. ChallengeAudioPlayer.tsx - Increase Text Limit

```typescript
// Line 41 - change from:
const truncatedText = plainText.substring(0, 300);

// To:
const truncatedText = plainText.substring(0, 2000);
```

### 2. ChallengeScriptCard.tsx - Fix Scroll

```typescript
interface ChallengeScriptCardProps {
  script: string;
  maxHeight?: string; // e.g., "300px"
}

export const ChallengeScriptCard = ({ script, maxHeight = '300px' }) => {
  return (
    <div className="relative" style={{ height: maxHeight }}>
      <ScrollArea className="h-full">
        <div className="p-6 prose prose-sm ...">
          <ReactMarkdown>...</ReactMarkdown>
        </div>
      </ScrollArea>
      {/* Fade gradient */}
      <div className="absolute bottom-0 ..." />
    </div>
  );
};
```

### 3. ChallengeEnglish.tsx - Unified Card

```tsx
{/* BEFORE: Two separate cards */}
<Card>
  <ChallengeAudioPlayer />
  <ChallengeScriptCard />
</Card>
<Card>
  <ChallengeInlineChat />
</Card>

{/* AFTER: One unified card */}
<Card className="...">
  <ChallengeAudioPlayer script={script} />
  <ChallengeScriptCard script={script} maxHeight="300px" />
  <ChallengeInlineChat currentDay={0} />
</Card>
```

### 4. ChallengeDayEnglish.tsx - Unified Card (Both Day 1 and Days 2-7)

Same pattern - merge the two cards into one.

### 5. Edge Function - Increase Truncation Limit

```typescript
// Line 66 - change from:
const truncatedText = text.substring(0, 300);

// To:
const truncatedText = text.substring(0, 2000);
```

---

## Visual Result

### After Fix: Landing Page (`/challenge-en`)

```text
┌─────────────────────────────────────────────────────────────┐
│ 🎧 Challenge Coach Audio                                    │
│ ▶️ Play ━━━━━━━━━━○━━━━━━━━━━━━━━━━  1:45 / 5:30            │
├─────────────────────────────────────────────────────────────┤
│ Welcome to the Have It All Lifestyle Challenge              │
│                                                             │
│ 7 Days to Transform Every Area of Your Life                │
│                                                             │
│ I want you to think about something powerful...             │
│                                                             │
│ ## What's the ONE Story Keeping You Stuck?                  │
│ - "I don't know where to start."                           │
│ - "I'm afraid I'll fail."                                  │
│ ...                                   ▼ (scroll for more)   │
├─────────────────────────────────────────────────────────────┤
│ 💬 Ask Your Challenge Coach                    [Text][Voice]│
│                                                             │
│ 🤖 Your Challenge Coach is ready!                           │
│    Ask any question about the challenge                     │
│                                                             │
│ ┌──────────────────────────────────────────────┐  [Send]    │
│ │ Type your question...                        │            │
│ └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Audio Duration Comparison

| Current | After Fix |
|---------|-----------|
| 300 chars = ~20 seconds | 2000 chars = ~2-3 minutes |

---

## Testing After Implementation

1. Go to `/challenge-en` and click Play - audio should be 2-3 minutes
2. Scroll the script text - should scroll smoothly
3. Audio + Text + Chat should be in ONE card
4. Go to `/challenge-en/1` - same unified layout
5. Repeat for `/challenge-en/2` through `/challenge-en/7`
