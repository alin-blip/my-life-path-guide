

## Diagnoză — am verificat în baza de date

Am interogat direct `weekly_planning` și `user_tasks` pentru săptămâna ta `door-week-2026-17`.

### Ce am găsit (vești bune și mai puțin bune)

**Vești bune:**
Toate cele 4 chei sunt salvate corect în plan, cu pași pentru fiecare:
- **Cheia 1** „5 apeluri b2b - 2 contracte" → 1 pas (Luni)
- **Cheia 2** „nu este completă mai am key" → 3 pași (Luni, Miercuri, Joi)
- **Cheia 3** „platforma B2B - optimizare" → 1 pas (Luni)
- **Cheia 4** „Audit Angajare + Advertising" → 1 pas (Luni)

**Toate 6 task-urile EXISTĂ în baza de date** și sunt în HIT List, săptămâna 17. Nu lipsesc — am numărat în DB:

```
[Business] 5 apeluri b2b - 2 contracte                     | M  | hit  ← Cheia 1
[Business] "Finalizare contract Guest agency"              | W  | hit  ← Cheia 2
[Business] "Obtinere draft contract"                       | M  | hit  ← Cheia 2
[Business] "Meeting - Manager General"                     | Th | hit  ← Cheia 2
[Business] platforma B2B - optimizare si testare beta      | M  | hit  ← Cheia 3
[Business] Audit Angajare + Advertising - simulare         | M  | hit  ← Cheia 4
```

**Problema reală (de ce ți s-a părut că lipsesc):**

1. **AI-ul a generat doar 1 pas** pentru cheile 1, 3, 4 (practic doar o repetare a titlului cheii). Te așteptai la mai mulți pași concreți → ai văzut puține și ai crezut că lipsesc keys.
2. **4 din 6 task-uri sunt înghesuite Luni**, doar 2 sunt pe alte zile → când te uiți pe alte zile pari să vezi „nimic din celelalte chei".
3. **Etichetele „[Business]"** nu spun din care cheie vine task-ul → nu poți distinge vizual `Cheia 1 vs Cheia 4`.
4. **Cheia 2 are titlu defect** „nu este completa mai am key" — pare că AI-ul te-a întrebat despre o cheie deja existentă și răspunsul a devenit titlul.

## Soluție — 3 modificări concrete

### 1. Etichetează task-urile cu numărul cheii (UX clar instant)
În `DoorPlanningModal.tsx` (atât în `processSavePlanning` cât și în `persistFromCompletedKeys`), schimb prefixul:

**Acum:** `[Business] 5 apeluri b2b - 2 contracte`
**După:** `[K1] 5 apeluri b2b - 2 contracte`

→ Vezi instant pe HIT List că ai task-uri din toate cele 4 chei.

### 2. Forțează AI-ul să genereze MIN 2 pași per cheie
În `supabase/functions/door-ai-planning/index.ts`:
- În prompt-uri (`NEW_WEEK_SYSTEM_PROMPT` + `WIZARD_SYSTEM_PROMPT`), adaug regulă:
  > „REGULĂ CRITICĂ: Fiecare cheie TREBUIE să aibă MIN 2 pași concreți. Dacă utilizatorul oferă doar unul, întreabă: «Care e următorul micro-pas pentru această cheie?» Nu finaliza cheia cu mai puțin de 2 pași."
- În tool definition `save_planning`, adaug `minItems: 2` pe `steps` array.

### 3. Distribuie pașii pe zile diferite (anti-Monday-overload)
În `processSavePlanning` și `persistFromCompletedKeys`, adaug logică de fallback îmbunătățit:
- Dacă **>3 pași cad pe Luni**, redistribuie automat pe `M, T, W, Th, F` round-robin.
- Loghez vizibil: `⚠️ Redistributing N tasks from Monday across week`.

### 4. Recuperare imediată pentru săptămâna ta actuală
**Bonus:** task-urile actuale au prefixul `[Business]`. Pot rula un UPDATE one-time care:
- Le re-etichetează ca `[K1]`, `[K2]`, `[K3]`, `[K4]` corespunzător cheii din `weekly_planning.key_points` (matching după text)
- Mută unele de pe Luni pe alte zile pentru aerisire

Dacă vrei doar fix forward (fără retag retroactiv), pot omite pasul 4.

## Fișiere de modificat

1. **`supabase/functions/door-ai-planning/index.ts`** — `minItems: 2` pe `steps` + regulă "min 2 pași per cheie" în prompt
2. **`src/components/door/DoorPlanningModal.tsx`** — prefix `[K1]..[K4]` în loc de `[Business]` + logică anti-Monday-overload în ambele funcții de persistare (`processSavePlanning` și `persistFromCompletedKeys`)
3. **(Opțional) Migrație data:** UPDATE pe `user_tasks` pentru week-ul 2026-17 — re-tag și redistribuire zile

## Rezultat dorit

- **Vezi clar pe HIT List** care task vine din care cheie (`[K1]`, `[K2]`, `[K3]`, `[K4]`)
- **Minim 8 task-uri** generate (2/cheie × 4 chei) în loc de 6 cum ai acum
- **Distribuite pe zile**, nu toate pe Luni
- **Niciun task nu se pierde** — flow-ul actual e corect, doar AI-ul a fost prea zgârcit

