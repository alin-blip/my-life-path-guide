

# Fix: Activare Voice/Speak mode in ChallengeInlineChat

## Problema

Butonul "Voce" din widget-ul AI Coach (pe `/challenge` si pe fiecare zi) nu functioneaza. Functia `toggleVoice` (linia 155) este un **stub gol** -- doar schimba o variabila locala fara sa porneasca recunoasterea vocala:

```
const toggleVoice = () => {
  setIsListening(!isListening);
  // Voice input would be implemented here with Web Speech API
};
```

## Solutia

Integram hook-ul `useVoiceInput` (care deja functioneaza in Mind Coach, stacks, etc.) in componenta `ChallengeInlineChat`.

## Modificari

### Fisier: `src/components/challenge/ChallengeInlineChat.tsx`

1. **Import `useVoiceInput`** din `@/hooks/useVoiceInput`
2. **Stergem** state-ul local `isListening` (linia 87) -- nu mai e nevoie de el
3. **Adaugam hook-ul `useVoiceInput`** cu:
   - `onTranscript`: cand se primeste text din voce, il trimitem direct ca mesaj prin `sendMessage(text)`
   - `voiceLanguage`: setat automat pe baza prop-ului `language` (`'ro-RO'` / `'en-US'`)
   - `enabled`: true doar cand user-ul e autentificat
4. **Inlocuim `toggleVoice()`** cu `toggleMic()` din hook
5. **Actualizam UI-ul** butonului de microfon sa reflecte starea reala (`isMicOn`, `isUserSpeaking`) din hook
6. **Adaugam feedback vizual**: cand user-ul vorbeste activ, butonul pulseaza + textul se schimba

### Comportament dupa fix

- User apasa butonul mic -> porneste recunoasterea vocala
- Vorbeste -> textul este recunoscut automat
- Cand se opreste (final transcript) -> mesajul se trimite automat la AI Coach
- User apasa din nou butonul -> opreste microfonul

### Ce NU se schimba

- Modul "Text" ramane identic
- Componenta `ChallengeAudioPlayer` (player-ul audio) nu e afectata
- Hook-ul `useChallengeCoach` ramane neschimbat
- Nu e nevoie de dependente noi

