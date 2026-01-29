
# Plan: Fix Mind Coach Flow în Rutina Campionului

## Probleme Identificate

1. **TTS nu termină de vorbit** - AI-ul trece la pasul următor înainte ca vocea să termine
2. **Lipsesc butoanele de navigare manuală** - utilizatorul nu poate alege să continue
3. **Dialog-ul de finalizare nu apare corect** în modul embedded

---

## Soluție

### 1. Adaug Butoane de Navigare Manuală în EmotionalCheckUnifiedStep

Când Mind Coach rulează inline, voi adăuga butoane floating pentru:
- **"Continuă Rutina"** - trece la pasul următor
- **"Altă Sesiune"** - resetează Mind Coach pentru o nouă emoție

```
┌─────────────────────────────────────────────────────┐
│          Mind Coach Chat (embedded)                  │
│  ┌─────────────────────────────────────────────────┐│
│  │  [Messages...]                                   ││
│  │                                                  ││
│  │  AI: "Excelent! Ai identificat..."              ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │  [Input area with voice controls]               ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ╔═════════════════════════════════════════════════╗│
│  ║  🎯 Butoane de Navigare                         ║│
│  ║  ┌─────────────────┐  ┌─────────────────────┐  ║│
│  ║  │  Altă Sesiune   │  │  Continuă Rutina →  │  ║│
│  ║  │       🧠        │  │       ✓             │  ║│
│  ║  └─────────────────┘  └─────────────────────┘  ║│
│  ╚═════════════════════════════════════════════════╝│
└─────────────────────────────────────────────────────┘
```

---

### 2. Oprire TTS înainte de Navigare

Când utilizatorul apasă "Continuă Rutina":
1. Stop TTS imediat (`voice.endCall()` sau `voice.skipAISpeaking()`)
2. Apelează `onComplete` pentru a trece la pasul următor

---

### 3. Modificări în MindCoachChat pentru Modul Embedded

Adaug prop-uri noi:
- `showNavigationButtons?: boolean` - arată butoane de navigare
- `onContinueRoutine?: () => void` - callback pentru "Continuă Rutina"
- `onNewSession?: () => void` - callback pentru "Altă Sesiune"

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/mind-coach/MindCoachChat.tsx` | Adaug prop-uri și butoane de navigare pentru modul embedded |
| `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx` | Transmit callback-uri pentru navigare și gestionez flow-ul |

---

## Detalii Implementare

### A. MindCoachChat.tsx

Adaug la interface:
```typescript
interface MindCoachChatProps {
  // ... existing props
  showNavigationButtons?: boolean;
  onContinueRoutine?: () => void;
  onNewSession?: () => void;
}
```

Adaug butoane floating după input area:
```typescript
{/* Navigation buttons for embedded mode */}
{embedded && showNavigationButtons && (
  <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-primary/10 to-transparent">
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={() => {
          // Stop any ongoing TTS
          if (voice.isInCall) voice.endCall();
          onNewSession?.();
        }}
      >
        <Brain className="h-4 w-4" />
        Altă Sesiune
      </Button>
      <Button
        className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
        onClick={() => {
          // Stop TTS and continue
          if (voice.isInCall) voice.endCall();
          onContinueRoutine?.();
        }}
      >
        Continuă Rutina
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}
```

### B. EmotionalCheckUnifiedStep.tsx

Modific `handleMindCoachComplete`:
```typescript
const handleMindCoachComplete = (breakthrough?: any) => {
  // NU mai apelăm automat onComplete
  // Așteptăm ca utilizatorul să aleagă manual
};
```

Adaug handlers pentru navigare:
```typescript
const handleContinueRoutine = () => {
  onComplete({ 
    emotion: emotion!, 
    intensity, 
    stackCompleted: true,
    transformedEnergy: 'transformed'
  });
};

const handleNewSession = () => {
  setPhase('emotion');
  // Reset state for new session
};
```

Transmit la MindCoachChat:
```typescript
<MindCoachChat
  initialEmotion={emotion}
  initialIntensity={intensity}
  embedded={true}
  showNavigationButtons={true}
  onContinueRoutine={handleContinueRoutine}
  onNewSession={handleNewSession}
  onComplete={handleMindCoachComplete}
  onBack={() => setPhase('emotion')}
/>
```

---

## UX Flow Nou

1. Utilizator selectează emoție negativă
2. Mind Coach pornește inline
3. Conversația progresează (text sau voce)
4. **Oricând**, utilizatorul poate:
   - Apăsa **"Continuă Rutina"** → oprește TTS, trece la pasul următor
   - Apăsa **"Altă Sesiune"** → resetează pentru altă emoție
5. Dacă AI completează transformarea (tool call), butoanele rămân vizibile
6. Utilizatorul decide când e gata să continue

---

## Testing

- Testează că TTS se oprește când apeși "Continuă Rutina"
- Testează că "Altă Sesiune" resetează corect starea
- Verifică că butoanele sunt vizibile în timpul conversației
- Verifică flow-ul în call mode și speak mode
