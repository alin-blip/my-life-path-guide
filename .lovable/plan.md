
# Plan: English Challenge Landing Page with Audio + Text + AI Chat Experience

## Summary

Create a new English-focused landing page at `/challenge-en` that provides an innovative **Audio + Text + AI Chat** experience. This page will have all the same features as the Romanian version:
- Same tasks/exercises structure
- Same community comments system
- Same "Invite 1-3 Friends" functionality
- Same AI Coach (text + voice modes)

The key difference is the **hero section** which replaces video with:
1. Audio player (AI voice reads the coaching script)
2. Scrollable script text card
3. Inline embedded chat (not a floating widget)

---

## Architecture: Two Approaches

### Option A: Dedicated English Landing + Reuse Challenge Flow (Recommended)
- Create `/challenge-en` as the English landing page with audio + text + chat
- After signup/login, user goes to `/challenge` but with language context set to English
- Reuses all existing Day 1-7 components (they already support English translations)

### Option B: Full Duplicate (More Work)
- Create entirely separate `/challenge-en`, `/challenge-en/:day` routes
- Duplicate all components with hardcoded English

**I recommend Option A** as it minimizes code duplication while providing the unique landing experience.

---

## What the User Will Experience

```text
/challenge-en (New English Landing Page)
┌─────────────────────────────────────────────────────────────┐
│  🚀 HAVE IT ALL LIFESTYLE CHALLENGE                        │
│  7 Days to Transform Every Area of Your Life               │
│  [Badge: FREE ACCESS - Days 1-2]                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  🎧 AUDIO PLAYER                                        │ │
│ │  ▶️ Play the coaching introduction                      │ │
│ │  ━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━━━  2:34 / 8:45          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  📜 COACHING SCRIPT (scrollable)                        │ │
│ │                                                         │ │
│ │  Welcome to the Have It All Lifestyle Challenge...      │ │
│ │  I want you to think about something powerful:          │ │
│ │  What's the ONE story keeping you stuck?                │ │
│ │  ...                                                    │ │
│ │                                    (scroll for more)    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💬 ASK YOUR CHALLENGE COACH                               │
│  [Text] [Voice]                                            │
├─────────────────────────────────────────────────────────────┤
│  🤖: "Welcome! I'm your Challenge Coach. What questions    │
│       do you have about your transformation journey?"      │
│                                                             │
│  ┌──────────────────────────────────┐  ┌────────────────┐  │
│  │ Type your question...            │  │ 🎤 Talk │ 📞  │  │
│  └──────────────────────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📅 YOUR 7-DAY TRANSFORMATION MAP                          │
│                                                             │
│  Day 1: 🔥 Vision + Declaration                            │
│  Day 2: 💪✨💕 Body + Spirit + Relationships               │
│  Day 3: 💰 Business + Domino Door [Premium]                │
│  Day 4: ⚡ Warrior Routine + AI Vision [Premium]           │
│  Day 5: 🧠 Accountability + Mind Coach [Premium]           │
│  Day 6: 💡 Strategic Impulse Control [Premium]             │
│  Day 7: 🏆 Integration + Continuity [Premium]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🎁 INVITE 1-3 FRIENDS                                     │
│  Share your exclusive invite link                          │
│  [Share Button] [Copy Link]                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💬 COMMUNITY COMMENTS                                     │
│  See what other warriors are saying                        │
│  [Comment input + existing comments feed]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│      [🚀 START DAY 1 NOW - FREE ACCESS]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/ChallengeEnglish.tsx` | Main English landing page with audio + text + embedded chat |
| `src/components/challenge/english/ChallengeAudioPlayer.tsx` | Audio player with play/pause, progress, TTS integration |
| `src/components/challenge/english/ChallengeScriptCard.tsx` | Scrollable text card with coaching script |
| `src/components/challenge/english/ChallengeInlineChat.tsx` | Embedded chat (full interface, not floating widget) |
| `src/data/challengeScripts.ts` | English coaching scripts extracted from your document |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add route `/challenge-en` pointing to `ChallengeEnglish` |

---

## Feature Parity Checklist

| Feature | Romanian (`/challenge-7-zile`) | English (`/challenge-en`) |
|---------|-------------------------------|---------------------------|
| Video/Audio intro | Video embed | Audio player + text |
| AI Coach | Floating widget | Embedded inline chat |
| 7-Day overview | Yes | Yes |
| Invite 1-3 Friends | Yes | Yes (reuse `ChallengeInviteFriends`) |
| Community Comments | Yes | Yes (reuse `ChallengeComments`) |
| Create Account CTA | Yes | Yes (inline auth or redirect) |
| Free Days 1-2 badge | Yes | Yes |
| Premium gate Day 3+ | Yes | Yes (same logic) |

---

## Technical Details

### 1. ChallengeEnglish.tsx (Main Page)

```typescript
const ChallengeEnglish = () => {
  // Force English language for this page
  const forceEnglish = true;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <HeroSection />
      
      {/* Audio + Script Card */}
      <Card className="max-w-3xl mx-auto">
        <ChallengeAudioPlayer script={getIntroScript()} />
        <ChallengeScriptCard script={getIntroScript()} maxHeight="300px" />
      </Card>
      
      {/* Inline Chat (embedded, not widget) */}
      <Card className="max-w-3xl mx-auto mt-6">
        <ChallengeInlineChat currentDay={0} /> {/* 0 = pre-challenge intro */}
      </Card>
      
      {/* 7-Day Overview */}
      <ChallengeDaysOverview language="en" />
      
      {/* Invite Friends */}
      <ChallengeInviteFriends dayNumber={0} />
      
      {/* Community Comments (for landing page intro) */}
      <ChallengeComments dayNumber={0} /> {/* Special module_id for landing */}
      
      {/* CTA Button */}
      <CTAButton onClick={handleStartChallenge} />
    </div>
  );
};
```

### 2. ChallengeAudioPlayer.tsx

```typescript
interface Props {
  script: string;
}

const ChallengeAudioPlayer: React.FC<Props> = ({ script }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const generateAudio = async () => {
    setIsLoading(true);
    // Use existing text-to-speech edge function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/text-to-speech-demo`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: script.substring(0, 4000), // Limit for API
          voice: 'en-US-Neural2-J' // Male English voice
        })
      }
    );
    const blob = await response.blob();
    setAudioUrl(URL.createObjectURL(blob));
    setIsLoading(false);
  };
  
  const togglePlay = async () => {
    if (!audioUrl) await generateAudio();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="p-4 border-b">
      <audio 
        ref={audioRef} 
        src={audioUrl || ''} 
        onTimeUpdate={(e) => setProgress((e.target.currentTime / e.target.duration) * 100)}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={togglePlay} 
          size="lg" 
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 
           isPlaying ? <Pause /> : <Play />}
        </Button>
        
        <div className="flex-1">
          <Progress value={progress} />
        </div>
        
        <Volume2 className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
};
```

### 3. ChallengeScriptCard.tsx

```typescript
interface Props {
  script: string;
  maxHeight?: string;
}

const ChallengeScriptCard: React.FC<Props> = ({ script, maxHeight = "300px" }) => {
  return (
    <div className="relative">
      <ScrollArea style={{ maxHeight }} className="p-6">
        <div className="prose prose-sm dark:prose-invert">
          <ReactMarkdown>{script}</ReactMarkdown>
        </div>
      </ScrollArea>
      
      {/* Fade gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
};
```

### 4. ChallengeInlineChat.tsx

Reuses the existing `useChallengeCoach` hook but renders as an embedded component instead of a floating widget:

```typescript
const ChallengeInlineChat: React.FC<{ currentDay: number }> = ({ currentDay }) => {
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  
  const {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
  } = useChallengeCoach({ currentDay });
  
  // Initialize on mount
  useEffect(() => {
    initializeChat();
  }, []);
  
  return (
    <div className="flex flex-col h-[400px]">
      {/* Header with tabs */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Ask Your Challenge Coach</h3>
        </div>
        <Tabs value={activeMode} onValueChange={setActiveMode}>
          <TabsList>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        {activeMode === 'text' ? (
          <TextInputWithSend onSend={sendMessage} />
        ) : (
          <VoiceInputControls onSend={sendMessage} />
        )}
      </div>
    </div>
  );
};
```

### 5. challengeScripts.ts (English Coaching Scripts)

```typescript
// Extracted from the AI Coaching document

export const getChallengeIntroScript = (): string => `
# Welcome to the Have It All Lifestyle Challenge

**7 Days to Transform Every Area of Your Life**

I want you to think about something powerful right now...

## What's the ONE Story Keeping You Stuck?

Maybe you're telling yourself:
- "I don't know where to start"
- "I'm afraid I'll fail"
- "It's too much; I can't handle it"
- "I just don't feel motivated"

Here's the truth: **These stories aren't facts. They're patterns.**

And today, you break them.

## Your 7-Day Transformation Map

| Day | Focus | What You'll Achieve |
|-----|-------|---------------------|
| 1 | 🔥 Vision + Declaration | Crystal clear direction for your life |
| 2 | 💪✨💕 Body + Spirit + Relationships | 3-level goals for 3 core areas |
| 3 | 💰 Business + Domino Door | Weekly execution system |
| 4 | ⚡ Warrior Routine + AI Vision | Automated daily habits |
| 5 | 🧠 Accountability + Mind Coach | Emotional transformation |
| 6 | 💡 Strategic Impulse Control | Master the Idea List filter |
| 7 | 🏆 Integration + Continuity | Lock in permanent change |

## Why This Challenge Works

This isn't just another program where you watch videos passively.

**You will engage. You will answer. You will transform.**

Every day, you'll:
1. Complete a specific exercise
2. Post your commitment to the community
3. Invite friends to join your journey
4. Get AI coaching support whenever you need it

## Today: Day 1 - Vision + Declaration

Your mission for Day 1:
1. ✅ Complete the Reality Check (where are you now?)
2. ✅ Discover your BIG WHY (what truly drives you?)
3. ✅ Write your Napoleon Hill Declaration (your future self)
4. ✅ Share with the community (accountability)
5. ✅ Invite 1-3 friends to transform together

**Ready to begin?**

Ask me any questions below, then click "Start Day 1" to dive in.

Remember: *Fear is a signal, not a stop sign.*

Let's go! 🚀
`;

// Day-specific scripts for coaching context
export const getDayScript = (day: number): string => {
  switch (day) {
    case 0: return getChallengeIntroScript();
    case 1: return getDay1VisionScript();
    case 2: return getDay2FoundationScript();
    // ... etc
    default: return getChallengeIntroScript();
  }
};
```

---

## Route Flow

```text
User lands on /challenge-en
         │
         ▼
   Sees Audio + Text + Chat experience
         │
         ▼
   Clicks "Start Day 1 Now"
         │
         ▼
   If not logged in → /auth?redirect=/challenge/1&lang=en
   If logged in → /challenge/1 (with language set to 'en')
         │
         ▼
   Goes through Day 1 flow (Reality Check → WHY → Declaration → Commitment → Invite)
         │
         ▼
   Continue to Day 2, 3, etc. (same existing components)
```

---

## Implementation Steps

1. **Create data file** (`src/data/challengeScripts.ts`)
   - Extract intro and day scripts from your document
   - Format with Markdown for rich display

2. **Create audio player** (`ChallengeAudioPlayer.tsx`)
   - Play/pause controls
   - Progress bar
   - TTS integration via existing edge function

3. **Create script card** (`ChallengeScriptCard.tsx`)
   - Scrollable container
   - Markdown rendering

4. **Create inline chat** (`ChallengeInlineChat.tsx`)
   - Reuse existing `useChallengeCoach` hook
   - Full embedded chat interface

5. **Create main page** (`ChallengeEnglish.tsx`)
   - Compose all components
   - Include same features: 7-day overview, invite friends, comments
   - Handle CTA and auth redirect

6. **Add route** (`App.tsx`)
   - Add `/challenge-en` lazy-loaded route

---

## Existing Components Reused

These components already support English translations and will be reused:
- `ChallengeInviteFriends` - Already has English messages
- `ChallengeComments` - Works for any module_id
- `useChallengeCoach` - Already supports English
- `ChallengeUpgradeGate` - Already has English translations
- Day 1 components (`Day1RealityCheck`, `Day1VisionDeclaration`, etc.) - All have English translations

---

## No Database Changes Required

This implementation uses existing infrastructure:
- `warriors_way_comments` table (for comments)
- `challenge_progress` table (for tracking)
- `email_leads` table (for lead capture)
- Existing Edge Functions for TTS
