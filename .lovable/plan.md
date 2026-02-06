
# Plan: Widget Audio + Script + AI Coach pentru Challenge-ul Romanesc (si English Update)

## Rezumat

Versiunea engleza (`/challenge-en/:day`) are deja widget-ul unificat Audio + Text + Chat. Versiunea romana (`/challenge/:day`) nu il are - foloseste doar un video placeholder si un widget floating de coaching. Planul adauga acelasi widget unificat pe paginile romanesti, reutilizand scripturile bilingve existente din `challengeKnowledge.ts`.

---

## Ce exista deja

- **`src/data/challengeKnowledge.ts`**: Scripturi complete RO + EN pentru toate cele 7 zile (deja rescrise pe tema burnout-to-momentum)
- **`src/data/challengeScripts.ts`**: Scripturi EN (markdown format) pentru audio - doar engleza
- **`src/components/challenge/english/`**: 3 componente (AudioPlayer, ScriptCard, InlineChat) - hardcodate pe engleza
- **`text-to-speech-demo`**: Edge function activa, fara JWT, suporta orice limba

---

## Arhitectura Propusa

### Pas 1: Creare scripturi RO in format markdown (ca cele EN)

**Fisier nou: `src/data/challengeScriptsRo.ts`**

Scripturi romanesti in format markdown pentru fiecare zi (0-7), echivalent cu `challengeScripts.ts` dar in romana. Continutul va fi extras si adaptat din `challengeKnowledge.ts` care are deja textele romanesti pe tema anti-burnout.

Functii exportate:
- `getChallengeIntroScriptRo()` - intro landing
- `getDay1ScriptRo()` prin `getDay7ScriptRo()`
- `getDayScriptRo(day: number)` - selector
- `getPlainTextScript(script)` - reutilizat din EN

### Pas 2: Generalizare componente (din english/ la shared/)

In loc sa duplicam componentele, le facem bilingve prin props:

**2a. Componenta generica `ChallengeAudioPlayer`**
- Muta din `english/` in directorul parinte `challenge/`
- Adauga prop `language?: 'ro' | 'en'` (default 'ro')
- Etichete: "Coach Audio Challenge" (RO) / "Challenge Coach Audio" (EN)
- Sub-eticheta: "Asculta introducerea" / "Listen to the introduction"

**2b. Componenta generica `ChallengeScriptCard`**
- Deja generica (primeste `script` ca prop) - doar se muta
- Nu necesita modificari logice

**2c. Componenta generica `ChallengeInlineChat`**
- Adauga prop `language?: 'ro' | 'en'`
- Texte bilingve: "Intreaba Coach-ul" / "Ask Your Coach"
- Redirect auth: `/challenge/:day` (RO) vs `/challenge-en/:day` (EN)
- CTA neautentificat: "Autentifica-te pentru a discuta" / "Sign In to Start Chatting"

### Pas 3: Integrare widget in pagina romaneasca `/challenge/:day`

**Fisier: `src/pages/ChallengeDay.tsx`**

Pentru zilele 2-6 (renderul standard, liniile ~855-1117):
- Import componente generalizate
- Import `getDayScriptRo` si `getDayScript` (EN)
- Adauga widget-ul unificat Card (Audio + Script + Chat) INAINTEA sectiunii "Today's Steps"
- Selecteaza scriptul corect bazat pe `language`

Pentru ziua 1 (flow special, liniile ~567-853):
- Adauga widget-ul unificat Card DUPA header si INAINTEA Day1StepsSummary
- Foloseste scriptul zilei 1

### Pas 4: Integrare widget pe pagina overview `/challenge`

**Fisier: `src/pages/Challenge.tsx`**

- Adauga un Card cu Audio + Script + Chat pentru intro/overview
- Pozitionare: dupa Progress Card, inainte de grila zilelor
- Script: intro challenge (ziua 0) - versiunea romaneasca

### Pas 5: Update importuri in `ChallengeDayEnglish.tsx`

- Actualizeaza importurile sa pointeze la componentele mutate (din `challenge/` in loc de `challenge/english/`)
- Paseaza `language="en"` explicit

### Pas 6: Update importuri in `ChallengeEnglish.tsx`

- Actualizeaza importurile la noile locatii ale componentelor

---

## Structura Finala Fisiere

```text
src/
  data/
    challengeScripts.ts       (existent - EN)
    challengeScriptsRo.ts     (NOU - RO)
    challengeKnowledge.ts     (existent - ambele limbi, sursa de adevar)
  components/challenge/
    ChallengeAudioPlayer.tsx  (MUTAT + generalizat din english/)
    ChallengeScriptCard.tsx   (MUTAT din english/)
    ChallengeInlineChat.tsx   (MUTAT + generalizat din english/)
    english/                  (ramas gol sau sters)
  pages/
    Challenge.tsx             (MODIFICAT - adaugat widget intro)
    ChallengeDay.tsx          (MODIFICAT - adaugat widget per zi)
    ChallengeEnglish.tsx      (MODIFICAT - update importuri)
    ChallengeDayEnglish.tsx   (MODIFICAT - update importuri + language prop)
```

---

## Fisiere Afectate

| Fisier | Actiune | Detalii |
|--------|---------|---------|
| `src/data/challengeScriptsRo.ts` | NOU | Scripturi RO markdown, 8 functii (intro + 7 zile) |
| `src/components/challenge/ChallengeAudioPlayer.tsx` | NOU (mutat) | Generalizat cu prop `language` |
| `src/components/challenge/ChallengeScriptCard.tsx` | Exista deja la aceasta cale | Ramane neschimbat |
| `src/components/challenge/ChallengeInlineChat.tsx` | NOU (mutat) | Generalizat cu prop `language`, redirect-uri bilingve |
| `src/pages/ChallengeDay.tsx` | MODIFICAT | Import widget, adaugat Audio+Script+Chat Card |
| `src/pages/Challenge.tsx` | MODIFICAT | Import widget, adaugat intro Card |
| `src/pages/ChallengeEnglish.tsx` | MODIFICAT | Update importuri |
| `src/pages/ChallengeDayEnglish.tsx` | MODIFICAT | Update importuri, adaugat `language="en"` |

---

## Ce NU se schimba

- Structura zilelor, exercitiile, logica de unlock/complete
- Edge function `text-to-speech-demo` (functioneaza deja)
- Edge function `challenge-coach` (functioneaza deja)
- Componenta `ChallengeScriptCard.tsx` care exista deja in `challenge/` (este aceeasi)
- Logica de progress tracking
- Comunitate/comentarii (raman separate pe module_id)

---

## Detalii Tehnice: Continut Scripturi RO

Fiecare script RO va urma structura din `challengeKnowledge.ts` (deja scrisa pe tema anti-burnout), formatat ca markdown cu:
- Titlu H1 + H2 subtitluri
- Bullet points pentru exercitii
- Tabel rezumat (doar intro)
- Citat motivational la final
- Maxim ~2000 caractere (limita TTS)
