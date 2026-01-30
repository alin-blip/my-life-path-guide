
# Plan: Pagina Mind Coach Transform - Română + Butoane Voce

## Obiectiv
1. Facem toată pagina în Română (eliminăm referințele Tony Robbins)
2. Adăugăm butoanele Speak și Call în demo

---

## Modificări

### 1. MindCoachLanding.tsx - Full Romanian + No Tony Robbins

**Schimbări:**
- Eliminăm secțiunea "Metodologia Tony Robbins în 5 Pași" (liniile 194-238)
- Schimbăm subtitle-ul default de la "Metodologia Tony Robbins" la "AI Coaching pentru transformare emoțională în 5 minute"
- Actualizăm footer CTA să nu mai menționeze Tony Robbins
- Forțăm limba română pe toată pagina (ignorăm context language)
- Înlocuim "Tony Robbins Method" cu o secțiune simplă "Cum Funcționează"

**Copy nou pentru secțiunea metodologie:**
```text
Cum Funcționează Mind Coach
5 pași spre transformare emoțională

Pas 1: Identificare → Ce simți?
Pas 2: Investigare → Ce poveste îți spui?
Pas 3: Clarificare → Fapte vs Ficțiune
Pas 4: Transformare → Reframe-ul puterii
Pas 5: Acțiune → Un pas mic, concret
```

### 2. MindCoachDemo.tsx - Adăugare Voice Integration

**Modificări majore:**
- Import `useMindCoachVoice` hook
- Import `SpeakButton` și `CallModeOverlay` componente
- Adaug state pentru voice în chat step
- Înlocuiesc input area simplu cu `MindCoachInputBar` complet

**Flow Voice:**
- Speak mode (push-to-talk): Apasă și vorbește, release pentru a trimite
- Call mode: Conversație continuă hands-free

**Structura nouă input area:**
```tsx
<MindCoachInputBar
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  placeholder="Scrie aici..."
  isLoading={isLoading}
  isComplete={isComplete}
  // Voice props
  isSpeaking={voice.isSpeaking}
  onSpeakStart={voice.handleSpeakStart}
  onSpeakStop={voice.handleSpeakStop}
  isInCall={voice.isInCall}
  isAISpeaking={voice.isAISpeaking}
  isListening={voice.isListening}
  isProcessing={voice.isProcessing}
  currentTranscript={voice.currentTranscript}
  silenceTimer={voice.silenceTimer}
  audioLevel={voice.audioLevel}
  onCallToggle={handleCallToggle}
  onSkipAI={voice.skipAISpeaking}
  onManualSend={voice.manualSendInCall}
  cluster={currentCluster}
  showQuickAnswers={showQuickAnswers}
  language="ro"
/>
```

### 3. useMindCoachDemo.ts - Adăugare onAIResponse callback

**Modificare:**
- Hook-ul deja are `onAIResponse` în options
- Trebuie să ne asigurăm că voice integration primește răspunsurile AI pentru TTS

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/pages/MindCoachLanding.tsx` | Full Romanian, no Tony Robbins, secțiune "Cum Funcționează" |
| `src/components/mind-coach/MindCoachDemo.tsx` | Adaug voice integration cu Speak/Call buttons |

---

## Copy Final (Română)

**Hero Badge:**
- "Mind Coach AI" + "TEST GRATUIT"

**Feature Pills:**
- "Identifică blocajul"
- "Fapte vs Povești"  
- "Transformă în putere"
- "Acțiune concretă"

**CTA:**
- "ÎNCEPE TESTUL GRATUIT"
- "✓ Fără cont necesar • ✓ Sesiune completă gratuită • ✓ Rezultate în 5 minute"

**Secțiunea Cum Funcționează:**
- Pas 1: Identificare 🎯
- Pas 2: Investigare 🔍
- Pas 3: Clarificare 💡
- Pas 4: Transformare ⚡
- Pas 5: Acțiune 🚀

**Demo Section:**
- "🧪 Testează GRATUIT Acum"
- "O sesiune completă de transformare - fără cont, fără card"

**Footer:**
- "💡 Mind Coach te ajută să transformi orice emoție în putere și acțiune concretă în doar 5 minute"

---

## Implementare Voice în Demo

1. Import hooks și componente voice
2. Inițializez `useMindCoachVoice` cu callback pentru sendMessage
3. Adaug handler pentru call toggle cu mesaj de deschidere
4. Înlocuiesc textarea simplu cu `MindCoachInputBar` full
5. Pass toate props-urile voice la input bar
