

# Adaugare Audio in Personal Power Plus (Speak + Call + TTS Lectie)

## Ce se schimba

### 1. Lectia -- buton TTS pentru a asculta textul
Se adauga componenta `TextToSpeechButton` existenta in `PersonalPowerLesson.tsx`, langa titlul lectiei sau deasupra continutului, pentru a citi textul lectiei cu voce AI.

### 2. AI Coach -- moduri Speak si Call
Se integreaza hook-ul `useMindCoachVoice` in `PersonalPowerCoach.tsx` si se inlocuieste input-ul simplu (Textarea + Send) cu un input bar care include:
- **Speak** (push-to-talk): butonul `SpeakButton` -- apesi si vorbesti, eliberezi si trimite mesajul
- **Call** (conversatie continua): butonul de Call + `CallModeOverlay` -- conversatie hands-free cu detectie de tacere la 3 secunde, AI raspunde vocal automat

---

## Detalii tehnice

### Fisier 1: `src/components/personal-power/PersonalPowerLesson.tsx`
- Import `TextToSpeechButton` din `@/components/ui/TextToSpeechButton`
- Adauga butonul TTS langa titlul lectiei cu `text={dayData.lessonContent}`
- Butonul va folosi edge function-ul `text-to-speech` existent (necesita autentificare)

### Fisier 2: `src/components/personal-power/PersonalPowerCoach.tsx`
- Import `useMindCoachVoice` din `@/hooks/useMindCoachVoice`
- Import `SpeakButton` din `@/components/mind-coach/SpeakButton`
- Import `CallModeOverlay` din `@/components/mind-coach/CallModeOverlay`
- Import `AISpeakingIndicator` din `@/components/stack/AISpeakingIndicator`
- Initializare hook `useMindCoachVoice` cu:
  - `onUserMessage` -> trimite mesajul prin `sendMessage()`
  - `language` -> din context
- Cand AI-ul raspunde in Call mode, se apeleaza `voice.speakAIResponse(text)` cu textul complet al raspunsului
- Inlocuire zona de input cu:
  - Textarea + Send button (raman)
  - Rand de butoane voce: SpeakButton (push-to-talk) + buton Call
  - CallModeOverlay (overlay full cand esti in call)
  - AISpeakingIndicator (indicator vizual cand AI vorbeste)

### Fara fisiere noi
Se reutilizeaza toate componentele existente -- nu se creaza componente noi.

### Fara modificari la edge functions
Edge function-ul `personal-power-coach` ramane acelasi (text streaming). TTS-ul foloseste edge function-ul `text-to-speech` existent prin hook-ul `useMindCoachVoice`.

