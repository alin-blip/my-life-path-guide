

# Plan: Voice Input pentru Mind Coach
## Buton Call, Speak și Text Input

---

## Rezumat

Adaug 3 moduri de input în Mind Coach pentru o experiență conversațională completă:

| Mod | Descriere | Comportament |
|-----|-----------|--------------|
| **Text** | Input text clasic | Scrie și apasă Send (deja existent) |
| **Speak** | Push-to-talk | Apasă, vorbește, eliberează → transcrie și trimite |
| **Call** | Conversație telefonică | AI vorbește răspunsul, apoi ascultă automat |

---

## Arhitectură Tehnică

```text
┌─────────────────────────────────────────────────────┐
│                   MindCoachChat.tsx                 │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              Messages Area                     │  │
│  │  (Chat bubbles cu markdown support)            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │           Voice Status Bar (nou)               │  │
│  │  [Waveform] [Transcript live] [Timer]         │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              Input Area (redesign)             │  │
│  │                                                │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           Textarea (text input)          │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  ┌──────┐   ┌──────────┐   ┌──────────┐      │  │
│  │  │ Send │   │  Speak   │   │   Call   │      │  │
│  │  │  ▶   │   │   🎤     │   │   📞     │      │  │
│  │  └──────┘   └──────────┘   └──────────┘      │  │
│  │                                                │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 1. Buton SPEAK (Push-to-Talk)

**Comportament:**
- Utilizatorul ține apăsat butonul
- Se activează Browser STT (Web Speech API)
- Când eliberează → transcrie și trimite automat
- AI răspunde text (fără voce)

**Implementare:**
- Folosesc `useVoiceInput` existent din proiect
- Adaug `onMouseDown` / `onMouseUp` sau `onTouchStart` / `onTouchEnd`
- La stop → apelăm `sendMessage(transcript)`

```typescript
// În MindCoachChat.tsx
const {
  isConnected,
  isMicOn,
  isUserSpeaking,
  voiceLanguage,
  changeVoiceLanguage,
  toggleMic
} = useVoiceInput({
  onTranscript: (text) => {
    // Adaugă transcriptul la inputValue
    setInputValue(prev => prev ? `${prev} ${text}` : text);
  },
  onMicStop: () => {
    // Auto-submit când se oprește
    if (inputValue.trim()) {
      handleSend();
    }
  },
  voiceLanguage: language === 'ro' ? 'ro-RO' : 'en-US'
});
```

---

## 2. Buton CALL (Conversație Telefonică)

**Comportament:**
- Utilizatorul apasă Call → intră în mod conversație
- AI vorbește răspunsul (ElevenLabs TTS)
- După ce AI termină → microfonul pornește automat
- Utilizatorul vorbește → după 3 secunde de tăcere, se trimite automat
- Ciclul continuă până când utilizatorul închide

**Implementare:**
- Folosesc `useVoiceConversation` existent
- Integrare cu edge function `mind-coach`
- ElevenLabs TTS pentru răspunsuri (cheia există deja: `ELEVENLABS_API_KEY`)

```typescript
// Hook nou: useMindCoachVoice.ts
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export const useMindCoachVoice = (options: {
  onMessage: (text: string) => void;
  language: 'ro' | 'en';
  voiceId?: string;
}) => {
  const voiceConversation = useVoiceConversation({
    onUserMessage: options.onMessage,
    silenceThreshold: 3000,
    language: options.language === 'ro' ? 'ro-RO' : 'en-US',
    voiceId: options.voiceId || 'EXAVITQu4vr4xnSDxMaL',
    playbackRate: 1.15
  });
  
  return {
    // Call mode controls
    isInCall: voiceConversation.isActive,
    startCall: voiceConversation.startConversation,
    endCall: voiceConversation.stopConversation,
    speakResponse: voiceConversation.speakAI,
    
    // Status
    isAISpeaking: voiceConversation.isAISpeaking,
    isListening: voiceConversation.isListening,
    currentTranscript: voiceConversation.currentTranscript,
    silenceTimer: voiceConversation.silenceTimer,
    audioLevel: voiceConversation.audioLevel,
    
    // Actions
    skipAI: voiceConversation.skipAISpeaking,
    manualSend: voiceConversation.manualSend
  };
};
```

---

## 3. Redesign Input Area

### Layout Nou

```
┌────────────────────────────────────────────────────┐
│  [Textarea - Input text]                      [▶ Send]│
├────────────────────────────────────────────────────┤
│        [🎤 Speak]          [📞 Call]               │
│         Apasă pt voce      Conversație live        │
└────────────────────────────────────────────────────┘
```

### Când e în Call Mode

```
┌────────────────────────────────────────────────────┐
│  ╭──────────────────────────────────────────────╮  │
│  │  🔊 AI vorbește... [Skip] [⏸ Pauză]          │  │
│  ╰──────────────────────────────────────────────╯  │
│                                                    │
│  ╭──────────────────────────────────────────────╮  │
│  │  🎤 "Ce ai spus tu..." [3s] [Manual Send]    │  │
│  │  ▁▂▃▅▆▅▃▂▁  (audio waveform)                 │  │
│  ╰──────────────────────────────────────────────╯  │
│                                                    │
│               [📞 Închide Apelul]                  │
└────────────────────────────────────────────────────┘
```

---

## 4. Componente Noi

### A. `MindCoachInputBar.tsx`

Componenta principală pentru input area:

```typescript
interface MindCoachInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSpeakStart: () => void;
  onSpeakStop: () => void;
  onCallToggle: () => void;
  isLoading: boolean;
  isComplete: boolean;
  isSpeaking: boolean;
  isInCall: boolean;
  isListening: boolean;
  currentTranscript: string;
  silenceTimer: number;
  audioLevel: number;
  language: 'ro' | 'en';
}
```

### B. `CallModeOverlay.tsx`

Overlay pentru modul Call cu:
- Status indicator (AI Speaking / Listening / Processing)
- Audio waveform în timp real
- Transcript live
- Silence countdown
- Buton Skip AI
- Buton Închide Apel

### C. `SpeakButton.tsx`

Buton cu state vizual pentru Speak mode:
- Idle: Gri
- Recording: Roșu pulsând
- Processing: Spinner

---

## 5. Integrare cu useMindCoach

Modific hook-ul existent pentru a suporta TTS:

```typescript
// În useMindCoach.ts
export const useMindCoach = (options: UseMindCoachOptions & {
  onAIResponse?: (text: string) => void; // Callback pentru TTS
}) => {
  // ... existing code ...
  
  // În sendMessage, după ce primim răspunsul:
  const sendMessage = async (text: string) => {
    // ... streaming logic ...
    
    // Când avem răspunsul complet:
    if (options.onAIResponse && assistantMessage) {
      options.onAIResponse(assistantMessage);
    }
  };
};
```

---

## 6. Fișiere de Creat

| Fișier | Scop |
|--------|------|
| `src/hooks/useMindCoachVoice.ts` | Hook pentru voice mode în Mind Coach |
| `src/components/mind-coach/MindCoachInputBar.tsx` | Input area cu toate butoanele |
| `src/components/mind-coach/CallModeOverlay.tsx` | UI pentru call mode |
| `src/components/mind-coach/SpeakButton.tsx` | Buton push-to-talk |

## 7. Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/mind-coach/MindCoachChat.tsx` | Integrare voice hooks și noile componente |
| `src/hooks/useMindCoach.ts` | Adaug callback `onAIResponse` pentru TTS |

---

## 8. Flow Detaliat

### Flow SPEAK (Push-to-Talk)

```text
1. User apasă buton Speak
2. Browser STT pornește
3. User vorbește
4. User eliberează buton
5. Transcript se adaugă în textarea
6. Auto-submit sau user apasă Send
7. AI răspunde (text only)
```

### Flow CALL (Conversație)

```text
1. User apasă Call
2. AI salută vocal (TTS): "Bun venit! Cum te pot ajuta?"
3. Microfonul pornește automat
4. User vorbește
5. După 3s tăcere → mesaj trimis automat
6. AI procesează și răspunde vocal
7. Ciclul se repetă (pasul 3)
8. User apasă "Închide" → conversația se oprește
```

---

## 9. Dependențe

**Existente în proiect:**
- `useVoiceInput` - Browser STT simplu
- `useVoiceConversation` - Conversație vocală completă
- `useTextToSpeech` - ElevenLabs TTS
- `ELEVENLABS_API_KEY` - Secret deja configurat

**Nu sunt necesare dependențe noi.**

---

## 10. Ordinea Implementării

1. **Pas 1:** Creez `useMindCoachVoice.ts` - wrapper pentru voice in Mind Coach
2. **Pas 2:** Creez `SpeakButton.tsx` - buton push-to-talk
3. **Pas 3:** Creez `CallModeOverlay.tsx` - UI pentru call mode
4. **Pas 4:** Creez `MindCoachInputBar.tsx` - input area complet
5. **Pas 5:** Actualizez `useMindCoach.ts` cu callback TTS
6. **Pas 6:** Actualizez `MindCoachChat.tsx` cu noile componente
7. **Pas 7:** Testare end-to-end

---

## 11. Note UX

- **Speak Button**: Afișez feedback vizual clar (pulsare roșie) când se înregistrează
- **Call Mode**: Afișez countdown vizual pentru silence timer
- **Audio Waveform**: Animație fluidă pentru nivel audio
- **Language Toggle**: Permite schimbarea limbii (RO/EN) pentru recunoaștere vocală
- **Skip Button**: Permite utilizatorului să sară peste AI speaking dacă vrea să vorbească mai repede

