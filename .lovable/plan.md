
# Respiratie cu Muzica si Ritm Personalizat

## Ce se va face

### 1. Stocare melodii (Backend)
- Creare bucket storage `breathing-music` pentru upload-uri audio
- Creare tabel `breathing_music` cu: `id`, `user_id`, `title`, `file_url`, `duration_seconds`, `created_at`
- RLS policies: fiecare user vede si gestioneaza doar melodiile lui

### 2. Ritm respiratie personalizat cu faze multiple
- In loc de tehnici fixe (box, 4-7-8), utilizatorul poate seta fiecare faza individual:
  - **Inspira** (secunde) 
  - **Tine** (secunde, 0 = fara pauza)
  - **Expira** (secunde)
  - **Pauza dupa expirare** (secunde, 0 = fara pauza) -- faza noua!
- Exemple presetate: 4/4/4/4, 4/7/8/0, 7/8/8/8 etc.
- Ritmul se salveaza in config

### 3. Upload si selectare melodie
- In configurarea pasului de respiratie (BreathingStepConfig), sectiune noua: "Melodie de fundal"
- Buton upload fisier audio (mp3, wav, m4a, max 20MB)
- Lista melodiilor uploadate cu optiune de stergere
- Selectare melodie activa

### 4. Mod durata: Cicluri vs Durata melodie
- Selector: "Durata exercitiului"
  - **Numar de cicluri** (ca acum, slider 3-30)
  - **Cat dureaza melodia** (exercitiul se opreste cand se termina melodia)
- Cand e selectat "durata melodie", ciclurile se calculeaza automat bazat pe durata melodiei impartita la durata unui ciclu complet

### 5. Player audio in BreathingStep
- Cand incepe exercitiul, melodia porneste automat pe fundal
- Cand se face pauza, melodia se pune pe pauza
- Cand se termina exercitiul, melodia se opreste
- Volum controlabil

## Detalii tehnice

### Tabel nou: `breathing_music`
```text
id          UUID PRIMARY KEY
user_id     UUID NOT NULL (references auth.users)
title       TEXT NOT NULL
file_path   TEXT NOT NULL (storage path)
duration_seconds  INTEGER
created_at  TIMESTAMPTZ DEFAULT now()
```

### BreathingStepConfig actualizat
```text
technique: 'box' | '478' | 'wim_hof' | 'custom'
cycles: number
inhaleDuration: number      -- NOU
holdDuration: number        -- NOU  
exhaleDuration: number      -- NOU
holdAfterExhale: number     -- NOU (pauza dupa expirare)
durationMode: 'cycles' | 'music'  -- NOU
selectedMusicId: string     -- NOU
showGuide: boolean
```

### Fisiere modificate
- `src/hooks/useStepConfig.ts` -- actualizare tip BreathingStepConfig
- `src/components/champion-routine/config/BreathingStepConfig.tsx` -- adaugare sectiuni ritm custom, upload muzica, mod durata
- `src/components/champion-routine/steps/BreathingStep.tsx` -- player audio, 4 faze (inhale/hold/exhale/hold2), mod durata muzica
- Hook nou: `src/hooks/useBreathingMusic.ts` -- CRUD melodii + upload storage

### Flux utilizator
1. Deschide configurarea respiratiei
2. Alege ritm preset (box, 4-7-8) sau seteaza manual fiecare faza
3. Uploadeaza una sau mai multe melodii
4. Alege daca durata e dupa cicluri sau dupa melodie
5. Salveaza
6. In exercitiu: melodia porneste cu respiratia, cercul se animeaza pe ritmul ales
