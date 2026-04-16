
## Analiza problemei

Da — ai dreptate. Dacă doar „sărim” direct la empowerment fără să identificăm ce se întâmplă, riscăm să punem energie peste confuzie. Dar aici e cheia:

**Tony nu stă în poveste.**
El:
1. identifică rapid problema reală,
2. o separă de poveste,
3. schimbă starea prin fiziologie,
4. instalează un nou sens și o nouă acțiune.

### Ce am găsit în cod
Problema nu mai e UI-ul inițial. Acum după selectarea emoției chiar se intră direct în chat.
Problema reală este că **fricțiunea s-a mutat în primele mesaje din chat**:

- `src/components/champion-routine/steps/EmotionalCheckUnifiedStep.tsx` deja face jump direct în `MindCoachChat`
- dar `supabase/functions/mind-coach/index.ts` obligă coach-ul să înceapă cu:
  - validare
  - „Spune-mi pe scurt ce s-a întâmplat?”
  - apoi 1-2 schimburi înainte de transformare
- iar `src/lib/mind-coach-clusters.ts` are opening-uri destul de generale, orientate spre poveste

Rezultatul: **nu mai vezi slider/textarea, dar simți același proces lung**, doar mutat în conversație.

## Ce ar spune Tony

Nu:
- „Spune-mi toată povestea”
- „Hai să analizăm mult”
- „Stai în stres și descrie-l”

Ci:
- „Ce te doare cu adevărat aici?”
- „Ce sens îi dai?”
- „Care e pattern-ul?”
- „Bun. Acum schimbăm starea.”

Pe scurt: **nu eliminăm analiza, o comprimăm.**
Tony ar face o **diagnoză rapidă de pattern**, nu o explorare lungă.

## Flow-ul corect Tony pentru acest pas

```text
Selectezi emoția
→ intri direct în chat
→ 1 întrebare scurtă de diagnostic
→ coach-ul numește pattern-ul / sensul toxic
→ întrerupere de pattern + schimbare de fiziologie
→ power move / ancoră
→ acțiune concretă
```

Exemplu pentru „stresat”:
- „Când spui stres, ce te apasă de fapt acum?”
  - [muncesc mult, dar nu apar rezultate]
  - [am prea multe lucruri odată]
  - [mi-e teamă că trag degeaba]
  - [nu mai am claritate]
- apoi:
  - „Bun. Deci problema nu e doar volumul. Problema e sensul: începi să crezi că efortul tău nu produce. Asta îți taie puterea.”
- apoi imediat:
  - respirație
  - postură
  - power move
  - nouă comandă internă
  - acțiune

## Plan de implementare

### 1. Păstrăm intrarea directă în conversație
Nu reintroducem formulare sau ecrane intermediare.

### 2. Rescriem deschiderea Mind Coach-ului
În `supabase/functions/mind-coach/index.ts` schimb promptul astfel încât:
- analiza problemei să dureze **maxim 1-2 schimburi**
- coach-ul să caute:
  - trigger-ul
  - sensul/interpretarea
  - pattern-ul
- după asta să forțeze trecerea la **physiology + interrupt**

### 3. Înlocuim întrebarea generică „ce s-a întâmplat?”
În `src/lib/mind-coach-clusters.ts` schimb opening-urile cu întrebări mai precise, Tony-style:
- stres: „Ce te apasă de fapt aici?”
- overwhelm: „E prea mult sau nu e clar ce contează?”
- procrastinare: „Ce eviți cu adevărat?”
- frică: „Ce crezi că s-ar întâmpla dacă ai merge all in?”
- frustrare: „Ce așteptare ți-a fost încălcată?”

### 4. Adăugăm răspunsuri rapide pentru diagnostic
În `MindCoachChat` / quick answers:
- după prima întrebare a coach-ului, afișăm 3-4 opțiuni scurte relevante clusterului
- utilizatorul nu mai scrie paragrafe
- obținem analiză reală, dar rapidă

### 5. După un singur răspuns, coach-ul trebuie să numească pattern-ul
Exemplu:
- „Nu e doar lipsa rezultatelor. Sensul pe care îl dai este că «poate nu funcționează / poate nu sunt suficient». Aici pierzi puterea.”

Asta este partea de analiză care rezolvă, nu storytelling-ul.

### 6. Intrăm imediat în întrerupere de pattern + fiziologie
Tot în promptul edge function:
- leverage scurt
- pattern interrupt
- breathing/posture/voice
- power move
- noua asociere / identitate
- acțiune pentru azi

Asta aliniază flow-ul cu ce ai în cursuri:
- **Ziua 4:** leverage + interrupt the pattern + condition a new association
- **Ziua 5:** physiology first, biomarkers, state change through movement/breath/voice

## Fișiere de modificat

1. `supabase/functions/mind-coach/index.ts`
   - prompt nou: diagnoză rapidă → interrupt → conditioning → action

2. `src/lib/mind-coach-clusters.ts`
   - opening-uri mai precise, orientate pe pattern și sens, nu pe poveste largă

3. `src/components/mind-coach/MindCoachChat.tsx`
   - afișare quick answers relevante de la primul mesaj
   - normalizare flow embedded ca să pornească mai fluid direct în conversația utilă

4. `src/components/mind-coach/QuickAnswerSuggestions.tsx`
   - dacă e nevoie, extindere cu variante specifice pe cluster

## Rezultatul dorit

Nu mai avem:
- analiză lungă
- repetarea aceleiași probleme în mai multe mesaje
- senzația de „tot aia e”

Vom avea:
- **problemă identificată rapid**
- **pattern numit clar**
- **stare schimbată imediat**
- **nou sens + nouă acțiune**

Pe românește:
**nu mai ocolim problema, dar nici nu ne îngropăm în ea.**
Asta este mult mai aproape de Tony.
