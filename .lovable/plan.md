
# Audit Complet Challenge + Voice + Coach + Wizards

## Rezultatele Auditului

### 1. VOICE INPUT -- Bug Critic Identificat

**Problema principala**: `useVoiceInput.tsx` -- cand browser-ul opreste automat recunoasterea vocala dupa o pauza de cateva secunde (comportament normal al Web Speech API), hook-ul NU reporneste ascultarea. In `onend` handler (linia 153), se reseteaza toate state-urile la `false` si se curata ref-ul:

```text
recognition.onend = () => {
  browserSTTRef.current = null;  // Cleared!
  setIsConnected(false);         // Disconnected!
  setIsMicOn(false);             // Mic off!
  setIsUserSpeaking(false);
}
```

Asta inseamna ca dupa 5-10 secunde de tacere, microfonul se opreste complet si utilizatorul trebuie sa apese din nou butonul.

**Fix**: Adaugare logica de auto-restart in `onend` -- daca utilizatorul nu a oprit intentionat (isStoppingIntentionallyRef este false), restarteaza automat recunoasterea. Exact ca in pattern-ul recomandat de stack overflow:

```text
recognition.onend = () => {
  if (isStoppingIntentionallyRef.current) {
    // User stopped intentionally - clean up
    browserSTTRef.current = null;
    setIsConnected(false);
    setIsMicOn(false);
    ...
  } else if (browserSTTRef.current) {
    // Auto-restart after silence timeout
    try {
      recognition.start();
    } catch(e) { /* cleanup */ }
  }
};
```

**Locatii afectate de acest bug**:
- ChallengeInlineChat (Voice tab) -- pe /challenge si pe /challenge/:day
- ChallengeCoachWidget (Voice/Call mode) -- floating widget
- GoalWizardModal (Voice input in wizards)
- Toate stack-urile AI (EnhancedAiLiveCoaching, AngerStack, etc.)

### 2. CHALLENGE COACH -- Audit Contextual

**Status: Functional dar cu imbunatatiri necesare**

Edge function-ul `challenge-coach/index.ts` deja:
- Contine curriculum complet 7 zile (RO + EN) -- liniile 10-170
- Primeste `currentDay` de la frontend si il include in system prompt
- Fetch-uie progresul utilizatorului din `challenge_progress`
- Fetch-uie misiunile din `missions` table
- Fetch-uie planul saptamanal din `weekly_planning`
- Salveaza conversatiile in `challenge_coach_conversations`

**Probleme gasite**:

a) **Day 1 responses nu sunt incluse**: Coach-ul nu stie raspunsurile de la Ziua 1 (vision declaration, why answers) stocate in `challenge_day1_responses`. Un utilizator in Ziua 3 care intreaba "ce declaratie am scris?" nu va primi raspuns corect.

b) **Challenge exercise responses lipsesc**: Tabelul `challenge_responses` nu este interogat, deci coach-ul nu stie ce exercitii specifice a completat utilizatorul.

c) **No-speech error handling**: `onerror` din useVoiceInput trateaza `no-speech` ca error normal dar tot opreste STT-ul cand este urmat de `onend`.

### 3. GOAL WIZARD (Obiective Anuale/90 zile) -- Audit

**Status: Functional**

- Edge function `goal-wizard-ai` exista si raspunde corect (testat)
- Salveaza cascadat: Annual -> Quarterly -> Monthly -> Weekly tasks  
- Overwrite protection cu dubla confirmare
- Voice input functional in wizard (foloseste propriul SpeechRecognition, nu hook-ul comun)
- TTS in wizard are un bug: apeleaza `supabase.functions.invoke('text-to-speech')` care returneaza binary audio, dar `invoke()` parseaza ca JSON. Va esua la redare. (Acelasi bug documentat in memoria despre "binary streaming architecture")

### 4. AUDIO PLAYER -- Audit

**Status: Functional cu limitari**

- `ChallengeAudioPlayer` apeleaza `text-to-speech-demo` (public, fara auth) -- functioneaza
- Limita de 2000 caractere per request
- VoiceSelector integrat corect
- Race condition prevention cu `isGenerating` flag

### 5. CHALLENGE COACH WIDGET (ChallengeCoachWidget.tsx) -- Audit Voice Mode

**Probleme gasite**:
a) **Call mode voice send timing bug**: `handleVoiceSend` (linia 158) citeste `voiceTranscript` din state, dar cand `onMicStop` se declanseaza, transcript-ul poate fi deja trimis partial. Stale closure issue.
b) **speakResponse infinite loop risk**: `useEffect` pe linia 175 care monitorizeaza `messages` poate declanşa `speakResponse` de mai multe ori pentru acelasi mesaj daca AI-ul face streaming.

---

## Plan de Implementare

### Pas 1: Fix Voice Input -- Auto-Restart (useVoiceInput.tsx)

Modificari in `src/hooks/useVoiceInput.tsx`:
- In `onend` handler: verifica daca oprirea a fost intentionala
- Daca NU a fost intentionala si browserSTTRef exista, restarteaza `recognition.start()`
- Daca a fost intentionala (isStoppingIntentionallyRef = true), curata state-urile ca acum
- Adauga un counter de retry (max 3 restarturi consecutive fara speech) pentru a preveni bucle infinite

### Pas 2: Fix GoalWizardModal TTS (GoalWizardModal.tsx)

Modificari in `src/components/goal-wizard/GoalWizardModal.tsx`:
- In `playTTS`: inlocuieste `supabase.functions.invoke('text-to-speech')` cu `fetch()` direct + `response.blob()` + `URL.createObjectURL()` (pattern-ul corect pentru binary audio)

### Pas 3: Imbunatatire Context Coach (challenge-coach/index.ts)

Modificari in `supabase/functions/challenge-coach/index.ts`:
- Fetch Day 1 responses: `challenge_day1_responses` (vision declaration, why answers, napoleon hill declaration)
- Fetch exercise responses: `challenge_responses` (ziua curenta si anterioare)
- Adauga aceste informatii in `userContext` string-ul injectat in system prompt
- Adauga instructiuni explicite: "NU inventa sau presupune informatii despre utilizator. Daca nu ai date, intreaba."

### Pas 4: Fix ChallengeCoachWidget Voice Mode

Modificari in `src/components/challenge/ChallengeCoachWidget.tsx`:
- Fix `handleVoiceSend`: foloseste ref in loc de state pentru transcript
- Fix `speakResponse` effect: adauga tracking al ultimului mesaj vorbit (lastSpokenMessageId) pentru a preveni repetitia
- Opreste microfonul cand AI vorbeste si restarteaza dupa

### Pas 5: Testare End-to-End

Verificari automate:
- Test edge function `challenge-coach` cu contextul complet al utilizatorului
- Test edge function `goal-wizard-ai` cu flow complet
- Verificare vizuala pe ruta `/challenge/1`, `/challenge/3`, `/challenge-en/2`

---

## Detalii Tehnice

### useVoiceInput.tsx -- onend handler refactored

Logica noua:
1. Cand `onend` se declanseaza, verifica `isStoppingIntentionallyRef`
2. Daca false si `browserSTTRef.current !== null` -- auto-restart cu mic delay (100ms)
3. Incrementeaza un `consecutiveRestartsRef` counter
4. Daca counter > 3 fara niciun speech event, opreste complet (previne bucle)
5. Reseteaza counter-ul la 0 cand se primeste orice `onresult`

### GoalWizardModal.tsx -- TTS fix

Inlocuire apel:
```text
// Inainte (broken - invoke parseaza ca JSON)
const response = await supabase.functions.invoke('text-to-speech', { body: { text } });

// Dupa (corect - fetch direct pentru binary audio)
const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech-demo`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
  body: JSON.stringify({ text }),
});
const blob = await response.blob();
const audioUrl = URL.createObjectURL(blob);
const audio = new Audio(audioUrl);
```

Se foloseste `text-to-speech-demo` (public, fara auth) in loc de `text-to-speech` (care necesita auth).

### challenge-coach/index.ts -- Context enrichment

Adaugare query-uri noi dupa query-urile existente de missions/weekly_planning:

```text
// Fetch day 1 specific responses
const { data: day1Responses } = await supabaseClient
  .from('challenge_day1_responses')
  .select('vision_declaration, why_answers, napoleon_declaration')
  .eq('user_id', user.id)
  .maybeSingle();

// Fetch challenge exercise responses  
const { data: exerciseResponses } = await supabaseClient
  .from('challenge_responses')
  .select('day_number, exercise_key, response_text')
  .eq('user_id', user.id)
  .order('day_number');
```

Aceste date se adauga la userContext string:
```text
if (day1Responses?.vision_declaration) {
  userContext += `\nVISION DECLARATION: ${day1Responses.vision_declaration}\n`;
}
```

### ChallengeCoachWidget.tsx -- Voice mode fixes

- Transcript ref: `const voiceTranscriptRef = useRef('')` sincronizat cu state
- lastSpokenMsgIndex ref: prevent duplicate speakResponse calls  
- Stop mic during AI speech, restart after in call mode

---

## Ordine Executie

1. Fix `useVoiceInput.tsx` (auto-restart) -- impacteaza TOATE componentele voice
2. Fix `GoalWizardModal.tsx` TTS (binary audio fetch)
3. Fix `ChallengeCoachWidget.tsx` (voice mode bugs)
4. Update `challenge-coach/index.ts` (context enrichment) + deploy
5. Testare end-to-end pe challenge routes
