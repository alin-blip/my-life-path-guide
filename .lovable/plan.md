
Obiectiv: repar Domino Door wizard ca să nu mai afișeze progres fals, să răspundă mai rapid și să salveze sigur planul final.

Ce am găsit
- `DoorPlanningModal.tsx` afișează `questionsAnswered / totalQuestions`, unde `totalQuestions` este fix `18` sau `22`, dar flow-ul real pune mult mai multe întrebări pe pași/zile/HIT-DO. De aici `56/18` și `311%`.
- Conversația ta s-a salvat doar ca draft, nu ca plan final: în logs apare `Draft saved to database` cu 100 mesaje, dar Door încarcă `hotCount: 0, hitCount: 0, doCount: 0` și „No cloud data for week”. Asta arată că draftul există, dar planul final și task-urile nu au fost persistate.
- Cauza principală: planul final se salvează numai dacă AI-ul emite tool call-ul `save_planning`. În `DoorPlanningModal.tsx`, `processSavePlanning()` rulează doar dacă vine acel tool call. Dacă AI termină conversația fără el, utilizatorul vede totul în chat, dar nimic nu ajunge în Door.
- „AI gândește...” poate dura mult pentru că flow-ul folosește modelul `google/gemini-2.5-pro`, trimite până la 60 mesaje/context, are retry de 3 încercări în edge function și nu are timeout/abort pe client.

Plan de implementare
1. Curăț UI-ul wizardului
- Scot complet blocul cu:
  - `Progres: X/Y întrebări`
  - procentul
  - bara `Progress`
- Păstrez doar input-ul, statusul de salvare și eventual un text scurt de stare.
- Fișier: `src/components/door/DoorPlanningModal.tsx`

2. Fac salvarea finală deterministă, nu opțională
- Păstrez tool-ul `save_planning`, dar nu mă mai bazez exclusiv pe el spontan.
- După ce este detectată `Cheia 4 completă`, lansez automat un pas de finalizare:
  - fie un `finalize` mode nou în `door-ai-planning`,
  - fie un al doilea request care forțează tool call-ul `save_planning`.
- La finalizare, trimit contextul deja acumulat (`completedKeys` + conversația recentă) și cer strict payload-ul final de salvare.
- Dacă tool call-ul nu vine sau nu se parsează, adaug fallback clar:
  - draftul rămâne salvat,
  - apare acțiune explicită de retry/finalizare.
- Fișiere: `src/components/door/DoorPlanningModal.tsx`, `supabase/functions/door-ai-planning/index.ts`, posibil `src/utils/doorPlanningContext.ts`

3. Reduc latența
- Schimb modelul conversațional din wizard pe o variantă mai rapidă pentru dialog interactiv.
- Reduc contextul trimis, deoarece există deja `[CONTEXT AUTOMAT]` cu cheile completate.
- Adaug `AbortController` / timeout pe client, ca să nu rămână infinit pe „AI gândește...”.
- Îmbunătățesc starea finală: „Se salvează planul...” când intră în pasul de finalizare.
- Fișiere: `src/components/door/DoorPlanningModal.tsx`, `supabase/functions/door-ai-planning/index.ts`

4. Întăresc fluxul după save
- După save reușit:
  - salvez în `weekly_planning`
  - adaug pașii în task-uri
  - emit refresh pentru Door
  - actualizez imediat UI-ul local cu domino + cele 4 chei
- Verific că draftul este șters doar după confirmarea save-ului final.
- Fișiere: `src/components/door/DoorPlanningModal.tsx`, `src/services/weeklyPlanningService.ts` dacă apare nevoie

5. Fix secundar de consistență
- Aliniez cheia de draft/restore dintre `DominoDoor` și `DoorPlanningModal`, ca să nu existe comportamente confuze la reluarea unui draft.
- Fișier: `src/components/door/DominoDoor.tsx`

Detalii tehnice
- Probleme confirmate în cod:
  - `DoorPlanningModal.tsx`: progres bazat pe `totalQuestions = 18/22`
  - `DoorPlanningModal.tsx`: save final doar prin `toolCallName === 'save_planning'`
  - `door-ai-planning/index.ts`: model greu + `tool_choice: 'auto'` + retry de 3 încercări
  - logs: draftul există, planul final nu există
- Rezultatul după implementare:
  - nu mai apare deloc numărul de întrebări și progresul
  - userul nu mai trebuie să spună „ok” la final ca să se salveze
  - dacă AI completează 4 chei, planul se finalizează și se salvează automat
  - dacă AI se blochează sau durează prea mult, wizardul iese elegant cu retry/timeout

Fișiere țintă
1. `src/components/door/DoorPlanningModal.tsx`
2. `supabase/functions/door-ai-planning/index.ts`
3. `src/utils/doorPlanningContext.ts`
4. `src/components/door/DominoDoor.tsx`
