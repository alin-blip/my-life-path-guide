

# Plan: Mind Coach Lead Magnet Optimizat + AI Voice Rapid

## Obiective
1. **AI Coach specializat pentru lead magnet** - focusat pe 4 probleme: Frustrare, Anxietate, Procrastinare, Frică
2. **Conversație scurtă de transformare** (3-5 schimburi) → apoi deblochează Challenge
3. **Pop-up de deblocare** cu oferta 7-Day Challenge
4. **Optimizare timp răspuns voice** de la 10+ sec la 2-4 sec

---

## Partea 1: Optimizare Timp Răspuns AI Voice

### Problema actuală (10+ secunde):
```text
User vorbește → STT (1s) → AI gemini-2.5-pro (5-8s) → TTS call separat (3-5s) → Play
Total: 10-15 secunde
```

### Soluția optimizată (2-4 secunde):
```text
User vorbește → STT (1s) → AI gemini-3-flash-preview (1-2s) → TTS streaming (0.5s) → Play
Total: 2-4 secunde
```

### Modificări:

#### 1. Edge Function `mind-coach-demo/index.ts`
- Schimbăm modelul de la `google/gemini-2.5-pro` → `google/gemini-3-flash-preview`
- Acest model e de 3-4x mai rapid cu calitate aproape identică pentru coaching

#### 2. TTS pentru demo (fără autentificare)
- Creăm `text-to-speech-demo` Edge Function (verify_jwt = false)
- Rate limiting bazat pe IP
- Răspunsuri scurte (max 200 caractere) = TTS instant

#### 3. `useTextToSpeech.tsx` - Versiune demo
- Adăugăm parametru `publicMode` pentru a folosi endpoint-ul fără auth
- Pre-fetch primele răspunsuri AI comune

---

## Partea 2: AI Coach Specializat Lead Magnet

### Flow nou:

```text
┌─────────────────────────────────────────────────────────────────┐
│  PASUL 1: Selectare Problemă                                   │
│                                                                 │
│  Ce te blochează cel mai mult acum?                            │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  😤     │  │  😰     │  │  😴     │  │  😨     │           │
│  │FRUSTRARE│  │ANXIETATE│  │PROCRAS- │  │ FRICĂ   │           │
│  │         │  │         │  │ TINARE  │  │         │           │
│  │Obiective│  │Viitorul │  │Nu știu  │  │Eșec,    │           │
│  │blocate  │  │incert   │  │de unde  │  │judecată │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PASUL 2: Conversație Scurtă (3-5 mesaje)                      │
│                                                                 │
│  AI: "Văd că te simți frustrat. Care e situația specifică      │
│       care te-a adus în acest punct?"                          │
│                                                                 │
│  User: [răspuns]                                                │
│                                                                 │
│  AI: "Ce poveste îți spui despre tine în legătură cu asta?"    │
│                                                                 │
│  User: [răspuns]                                                │
│                                                                 │
│  AI: "Acum hai să înlocuim această poveste. Care e un pas      │
│       mic pe care îl poți face AZI?"                           │
│                                                                 │
│  User: [angajament la acțiune]                                 │
│                                                                 │
│  → TRIGGER: complete_transformation tool                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PASUL 3: Pop-up Deblocare (BreakthroughOverlay actualizat)    │
│                                                                 │
│  🎉 FELICITĂRI!                                                │
│  Ai făcut primul pas spre transformare.                        │
│                                                                 │
│  [Frustrare] → [Claritate & Acțiune]                           │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  ⭐ DEBLOCHEAZĂ ACUM:                                          │
│                                                                 │
│  ✓ Challenge de 7 Zile - Transformă-ți Viața                  │
│  ✓ Claritate despre ce vrei CU ADEVĂRAT                       │
│  ✓ Plan strategic pentru obiective                             │
│  ✓ Energie și productivitate zilnică                          │
│  ✓ Timp pentru familie și ce contează                          │
│                                                                 │
│  [🚀 ÎNCEPE CHALLENGE-UL GRATUIT - 7 ZILE]                     │
│                                                                 │
│  Fără card • Acces instant • 10,000+ transformări              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `supabase/functions/mind-coach-demo/index.ts` | Schimbăm model la `gemini-3-flash-preview`, simplificăm prompt pentru 4 probleme focusate |
| `supabase/functions/text-to-speech-demo/index.ts` | **NOU** - TTS public fără auth, rate limited |
| `src/components/mind-coach/MindCoachDemo.tsx` | Simplificăm emotion picker la 4 opțiuni, eliminăm intensitate |
| `src/components/mind-coach/BreakthroughOverlay.tsx` | Actualizăm cu oferta Challenge 7 zile |
| `src/hooks/useTextToSpeech.tsx` | Adăugăm `publicMode` pentru demo fără auth |
| `src/hooks/useMindCoachDemo.ts` | Folosim TTS demo |
| `supabase/config.toml` | Adăugăm `text-to-speech-demo` cu verify_jwt = false |

---

## Detalii Tehnice

### 1. Model AI optimizat
```typescript
// În mind-coach-demo/index.ts
model: 'google/gemini-3-flash-preview',  // 3x mai rapid
max_tokens: 150,  // Răspunsuri scurte
temperature: 0.8,
```

### 2. Prompt simplificat (4 probleme focusate)
```typescript
const systemPrompt = `Ești Mind Coach - transformi rapid blocajele în acțiune.

PROBLEMA UTILIZATORULUI: ${emotion} // frustration, anxiety, procrastination, fear

FLOW ULTRA-SCURT (max 4 schimburi):
1. Validează + întreabă situația concretă
2. Identifică povestea/credința limitatoare
3. Reframe + angajament la o acțiune mică
4. Folosește complete_transformation

RĂSPUNSURI: Maximum 2 propoziții. O singură întrebare.
VOCEA: Caldă dar directă. Fără fluff.

Răspunde doar în română.`;
```

### 3. TTS Demo (fără auth)
```typescript
// text-to-speech-demo/index.ts
serve(async (req) => {
  // Rate limit per IP
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 });
  }

  const { text, voiceId } = await req.json();
  
  // Limit text length for demo
  const truncatedText = text.substring(0, 250);
  
  // Call ElevenLabs cu turbo model
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      body: JSON.stringify({
        text: truncatedText,
        model_id: 'eleven_turbo_v2_5',  // Cel mai rapid model
        voice_settings: { stability: 0.5, similarity_boost: 0.7 }
      })
    }
  );
  
  return new Response(response.body, { headers: { 'Content-Type': 'audio/mpeg' } });
});
```

### 4. Emotion Picker Simplificat
```tsx
const LEAD_MAGNET_EMOTIONS = [
  { id: 'frustration', emoji: '😤', label: 'Frustrare', desc: 'Obiective blocate' },
  { id: 'anxiety', emoji: '😰', label: 'Anxietate', desc: 'Viitorul incert' },
  { id: 'procrastination', emoji: '😴', label: 'Amânare', desc: 'Nu știu de unde să încep' },
  { id: 'fear', emoji: '😨', label: 'Frică', desc: 'Eșec, judecată' }
];
```

### 5. Breakthrough Overlay cu Challenge CTA
```tsx
<div className="space-y-4">
  <h2 className="text-2xl font-bold">🎉 Felicitări!</h2>
  <p>Ai făcut primul pas spre transformare.</p>
  
  <div className="transformation-badge">
    {breakthroughData.emotionBefore} → Claritate & Acțiune
  </div>
  
  <div className="unlock-section">
    <h3>⭐ DEBLOCHEAZĂ ACUM:</h3>
    <ul className="benefits-list">
      <li>✓ Challenge de 7 Zile - Transformă-ți Viața</li>
      <li>✓ Claritate despre ce vrei CU ADEVĂRAT</li>
      <li>✓ Plan strategic pentru obiective</li>
      <li>✓ Energie și productivitate zilnică</li>
      <li>✓ Timp pentru familie și ce contează</li>
    </ul>
    
    <Button onClick={handleStartChallenge}>
      🚀 ÎNCEPE CHALLENGE-UL GRATUIT - 7 ZILE
    </Button>
    
    <p className="trust-line">
      Fără card • Acces instant • 10,000+ transformări
    </p>
  </div>
</div>
```

---

## Pași de Implementare

1. **Creez TTS Demo Edge Function** (`text-to-speech-demo`)
   - Fără autentificare
   - Rate limiting IP
   - Model turbo ElevenLabs

2. **Optimizez AI Edge Function** (`mind-coach-demo`)
   - Switch la `gemini-3-flash-preview`
   - Prompt simplificat pentru 4 probleme
   - Răspunsuri mai scurte

3. **Actualizez `useTextToSpeech.tsx`**
   - Adaug `publicMode` parameter
   - Folosește endpoint demo când e activ

4. **Simplific `MindCoachDemo.tsx`**
   - 4 emoții în loc de 14
   - Fără slider intensitate
   - Flow mai direct

5. **Actualizez `BreakthroughOverlay.tsx`**
   - Design nou cu oferta Challenge
   - Benefits list
   - CTA către signup/challenge

6. **Config update**
   - Adaug `text-to-speech-demo` în `config.toml`

---

## Comparație Timpi

| Acțiune | Înainte | După |
|---------|---------|------|
| AI Response | 5-8 sec | 1-2 sec |
| TTS Generation | 3-5 sec | 0.5-1 sec |
| **Total** | **10-15 sec** | **2-4 sec** |

---

## Rezultat Final

- **Lead magnet focusat**: 4 probleme clare (nu 14 emoții)
- **Conversație scurtă**: 3-5 mesaje → deblocare
- **Voice ultra-rapid**: 2-4 secunde în loc de 10+
- **CTA clar**: Challenge 7 zile cu benefits specifice

