
# Fix: Voice Mode în Challenge Coach Widget

## Problema Identificată

Funcția `speakResponse` din `ChallengeCoachWidget.tsx` folosește `supabase.functions.invoke()` care așteaptă un răspuns JSON, dar edge function-ul `text-to-speech` returnează un stream audio mpeg binar direct.

**Cod curent (incorect):**
```typescript
const { data, error } = await supabase.functions.invoke('text-to-speech', {
  body: { text, voiceId }
});
if (data?.audioContent) {
  const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
```

**Problema:** `supabase.functions.invoke()` nu gestionează corect răspunsurile binare și încearcă să parseze JSON, rezultând în `data` care e audio raw, nu un obiect JSON.

## Soluția

Înlocuiește implementarea cu pattern-ul corect folosit în `useTextToSpeech.tsx`:

1. Folosește `fetch()` direct cu header-ele de autentificare
2. Convertește răspunsul în `Blob` cu `response.blob()`
3. Creează URL din blob cu `URL.createObjectURL()`
4. Redă audio-ul cu elementul `Audio`

## Modificări Tehnice

### Fișier: `src/components/challenge/ChallengeCoachWidget.tsx`

**Înlocuiește funcția `speakResponse` (liniile 87-120):**

```typescript
// Text-to-speech for AI responses
const speakResponse = useCallback(async (text: string) => {
  if (!text || isSpeaking) return;
  
  try {
    setIsSpeaking(true);
    
    // Get user session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Use fetch directly to get binary audio response
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          text, 
          voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah multilingual
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error:', errorText);
      throw new Error('Failed to generate speech');
    }

    // Get audio blob directly from response
    const audioBlob = await response.blob();
    
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Invalid audio data received');
    }
    
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create and play audio
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      // In call mode, restart listening after AI finishes speaking
      if (isCallActive) {
        startVoice();
      }
    };
    
    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    };
    
    await audio.play();
  } catch (error) {
    console.error('TTS error:', error);
    setIsSpeaking(false);
  }
}, [isSpeaking, isCallActive, startVoice]);
```

## Flux Corectat

```text
User clicks "Start Conversation"
        │
        ▼
startVoice() - activează microfonul
        │
        ▼
User vorbește → transcript se acumulează
        │
        ▼
handleVoiceSend() → sendMessage(transcript)
        │
        ▼
AI răspunde → messages se actualizează
        │
        ▼
useEffect detectează noul mesaj AI
        │
        ▼
speakResponse(lastMessage.content)
        │
        ├─ fetch() → edge function → audio/mpeg stream
        ├─ response.blob() → Blob
        ├─ URL.createObjectURL(blob) → blob:// URL
        └─ new Audio(url).play() → Audio redă
                │
                ▼ (onended)
        isCallActive ? startVoice() : idle
```

## De Ce Funcționează Acum

1. **Fetch Direct**: `fetch()` gestionează corect răspunsurile binare, spre deosebire de `supabase.functions.invoke()` care așteaptă JSON
2. **Blob API**: `response.blob()` convertește stream-ul audio în format utilizabil
3. **Object URL**: `URL.createObjectURL()` creează un URL valid pentru elementul Audio
4. **Cleanup**: `URL.revokeObjectURL()` în `onended` previne memory leaks

## Testare

După implementare, verifică:
1. Navighează la `/challenge`
2. Click pe widget-ul Challenge Coach
3. Selectează tab-ul "Voce"
4. Click pe butonul de telefon pentru a începe conversația
5. Vorbește - AI-ul ar trebui să răspundă verbal
6. Iconița verde ar trebui să apară în loc de cea roșie
