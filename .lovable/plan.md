
# Plan: Fix Voice Mode în MindCoachDemo (pagina /mind-coach-transform)

## Probleme Identificate

### 1. Butonul Speak (Microfonul)
- Există în UI dar **nu are feedback vizual suficient** când e apăsat
- Culoarea se schimbă doar ușor, nu e clar că funcționează
- Lipsesc indicatori vizuali ca pulsul roșu și starea activă

### 2. Butonul Call 
- **NU EXISTĂ** în interfața `MindCoachDemo.tsx`
- Există doar un toggle pentru Voice Mode (TTS) care nu e buton de Call
- Pagina normală Mind Coach (`MindCoachInputBar.tsx`) are Call, dar demo-ul nu

### 3. Feedback General
- Nu există indicatori de stare clare (Listening, Speaking, etc.)
- Utilizatorul nu știe dacă microfonul captează vocea

## Soluție Propusă

### Modificări în `src/components/mind-coach/MindCoachDemo.tsx`:

1. **Înlocuiește sistemul de voice cu hook-ul complet `useMindCoachVoice`**
   - Oferă atât Speak mode (push-to-talk) cât și Call mode (conversație continuă)
   - Gestionează automat TTS și STT

2. **Adaugă buton Call lângă butonul Speak**
   - Buton cu iconița Phone pentru a porni conversația vocală
   - Când e activ, afișează `CallModeOverlay` peste input

3. **Îmbunătățește feedback-ul vizual pentru Speak**
   - Fundal roșu intens când e apăsat
   - Animație de pulsare vizibilă
   - Indicator de recording în colțul butonului

4. **Adaugă stări vizuale**
   - Indicator când AI-ul vorbește
   - Indicator când microfonul e activ
   - Transcript live când vorbești

## Cod Tehnic

### Structura nouă a zonei de input:

```text
┌─────────────────────────────────────────────────────┐
│                    CHAT AREA                         │
├─────────────────────────────────────────────────────┤
│ [În modul Call → CallModeOverlay complet]           │
├─────────────────────────────────────────────────────┤
│ [În modul normal:]                                   │
│ ┌────┐ ┌──────────────────────────┐ ┌────┐ ┌──────┐ │
│ │ 🎤 │ │ Scrie aici...            │ │ 📞 │ │Trimite│ │
│ │Speak│ │                          │ │Call│ │      │ │
│ └────┘ └──────────────────────────┘ └────┘ └──────┘ │
└─────────────────────────────────────────────────────┘
```

### Importuri noi necesare:
```typescript
import { useMindCoachVoice } from '@/hooks/useMindCoachVoice';
import { CallModeOverlay } from './CallModeOverlay';
import { Phone, PhoneOff } from 'lucide-react';
```

### State nou:
```typescript
const [isCallMode, setIsCallMode] = useState(false);
```

### Integrare useMindCoachVoice:
```typescript
const voice = useMindCoachVoice({
  onUserMessage: (text) => {
    sendMessage(text);
  },
  onAIResponse: (text) => {
    // Handled by useMindCoachVoice internally
  },
  language: language,
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
  silenceThreshold: 3000,
  playbackRate: 1.15
});
```

### Hook nou pentru demo TTS fără auth:
Trebuie să modific `useMindCoachVoice` sau să creez o versiune demo care folosește `text-to-speech-demo` endpoint în loc de cel autentificat.

### Buton Speak îmbunătățit:
```tsx
<Button
  variant={isSpeakHeld ? "destructive" : "outline"}
  size="icon"
  className={cn(
    "shrink-0 transition-all relative",
    isSpeakHeld && [
      "bg-red-600 border-red-700 scale-95",
      "ring-4 ring-red-500/50 ring-offset-2"
    ]
  )}
  onMouseDown={handleSpeakStart}
  onMouseUp={handleSpeakStop}
  onMouseLeave={handleSpeakStop}
  onTouchStart={(e) => { e.preventDefault(); handleSpeakStart(); }}
  onTouchEnd={(e) => { e.preventDefault(); handleSpeakStop(); }}
  disabled={isLoading || isCallMode}
>
  <Mic className={cn("h-4 w-4", isSpeakHeld && "animate-pulse text-white")} />
  
  {/* Recording indicator dot */}
  {isSpeakHeld && (
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  )}
</Button>
```

### Buton Call nou:
```tsx
<Button
  variant={isCallMode ? "destructive" : "outline"}
  size="icon"
  onClick={() => {
    if (isCallMode) {
      voice.endCall();
      setIsCallMode(false);
    } else {
      setIsCallMode(true);
      // Start call with opening message
      const openingMsg = openingMessages[selectedProblem];
      voice.startCall(openingMsg);
    }
  }}
  className={cn(
    "shrink-0 transition-all",
    isCallMode && "bg-red-600 border-red-700"
  )}
  disabled={isLoading}
>
  {isCallMode ? (
    <PhoneOff className="h-4 w-4 text-white" />
  ) : (
    <Phone className="h-4 w-4" />
  )}
</Button>
```

### Call Mode Overlay condiționat:
```tsx
{isCallMode && (
  <CallModeOverlay
    isActive={isCallMode}
    isAISpeaking={voice.isAISpeaking}
    isListening={voice.isListening}
    isProcessing={isLoading}
    isTTSLoading={voice.isTTSLoading}
    currentTranscript={voice.currentTranscript}
    silenceTimer={voice.silenceTimer}
    audioLevel={voice.audioLevel}
    onSkipAI={voice.skipAISpeaking}
    onManualSend={voice.manualSendInCall}
    onEndCall={() => {
      voice.endCall();
      setIsCallMode(false);
    }}
    language={language}
  />
)}
```

## Probleme de Rezolvat

### Authentication pentru TTS
`useMindCoachVoice` folosește `useVoiceConversation` care apelează edge function-ul `text-to-speech` cu autentificare. Pentru demo (fără login), trebuie să:

**Opțiunea A**: Creez un hook `useMindCoachVoiceDemo` care folosește `text-to-speech-demo` endpoint
**Opțiunea B**: Modific `useDemoTextToSpeech` să fie folosit în loc de cel standard

**Recomandare**: Opțiunea A - creez `useMindCoachVoiceDemo.ts` similar cu `useMindCoachVoice.ts` dar care folosește endpoint-urile demo fără autentificare.

## Fișiere de Modificat

| Fișier | Acțiune |
|--------|---------|
| `src/components/mind-coach/MindCoachDemo.tsx` | Modificare majoră - UI complet pentru voice |
| `src/hooks/useMindCoachVoiceDemo.ts` | **Nou** - Hook pentru demo voice fără auth |
| `src/hooks/useVoiceConversationDemo.ts` | **Nou** - Versiune demo a useVoiceConversation |

## Flux Final

```text
Utilizator alege emoție
        │
        ▼
Chat UI cu 3 opțiuni de input:
├── 📝 Text input + Trimite
├── 🎤 Speak (push-to-talk) - ține apăsat
└── 📞 Call (conversație continuă)
        │
        ├── [Speak apăsat] ──► STT activ ──► Eliberează ──► Trimite mesaj
        │
        └── [Call activat] ──► CallModeOverlay
                                    │
                                    ├── AI vorbește prima replică
                                    ├── Ascultă utilizatorul  
                                    ├── 3s silence → trimite automat
                                    ├── AI răspunde vocal
                                    └── [Repetă până la End Call]
```
