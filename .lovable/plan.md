

# Plan: Reframe Challenge "De la Burnout la Momentum"

## Rezumat

Modificam textele si narativul pe 4 fisiere pentru a repozitiona challenge-ul de la "Transform your life" la "De la Procrastinare si Burnout la Momentum si Rezultate". Nu se schimba structura, task-urile, pricing-ul sau componentele tehnice.

## Fisiere de Modificat

### 1. `/challenge-7-zile` - Landing Page (`src/pages/Challenge7ZileLanding.tsx`)

| Sectiune | Actual | Nou |
|----------|--------|-----|
| **Meta Title** | "Transforma-ti Viata in 7 Zile / Free Challenge" | "Iesi din Burnout in 7 Zile / Challenge Gratuit" |
| **Meta Description** | "Join the free 7-day... Master Body, Being..." | "Opresti procrastinarea, iesi din burnout si construiesti momentum real in 7 zile" |
| **Hero H1 (RO)** | "Incepe Challenge-ul GRATUIT Acum" | "Iesi din Burnout in 7 Zile" |
| **Hero H1 (EN)** | "Start Your FREE Challenge Now" | "Break Free from Burnout in 7 Days" |
| **Hero Subtitle (RO)** | "Transforma-ti viata in 7 zile -- ZERO COST, ZERO OBLIGATII" | "De la procrastinare si oboseala cronica la momentum si rezultate reale" |
| **Hero Subtitle (EN)** | "Transform your life in 7 days -- ZERO COST, ZERO OBLIGATIONS" | "From procrastination and chronic exhaustion to momentum and real results" |
| **4 Pillars Title (RO)** | "Cei 4 Piloni ai Succesului" | "De Ce Esti Blocat? Lipsa Echilibrului in 4 Arii" |
| **4 Pillars Title (EN)** | "The 4 Pillars of Success" | "Why Are You Stuck? Imbalance in 4 Areas" |
| **4 Pillars Subtitle (RO)** | "Succesul adevarat inseamna sa prosperi..." | "Burnout-ul vine cand una din arii e neglijata. Fix asta reparam." |
| **4 Pillars Subtitle (EN)** | "True success means thriving in ALL areas..." | "Burnout happens when one area is neglected. That's exactly what we fix." |
| **Pillar Descriptions** | Generic ("Physical health & energy", etc.) | Pain-focused ("Opreste oboseala cronica", "Recapata pacea interioara", etc.) |
| **7-Day Journey Title (RO)** | "Calatoria ta de 7 Zile" | "Planul Tau Anti-Burnout in 7 Pasi" |
| **7-Day Journey Title (EN)** | "Your 7-Day Journey" | "Your 7-Step Anti-Burnout Plan" |
| **7-Day Journey Subtitle (RO)** | "Zilele 1-2 sunt GRATUITE..." | "Fiecare zi te scoate mai mult din ceata si te muta spre claritate" |
| **7-Day Journey Subtitle (EN)** | "Days 1-2 are FREE..." | "Each day pulls you further from the fog and closer to clarity" |
| **Benefits** | "Obiective anuale clare pentru 2026", "Plan de actiune structurat pe 90 de zile", etc. | "Opresti ciclul procrastinarii", "Iesi din burnout strategic", "Recapata energia si focusul", "Construiesti momentum zilnic", "Comunitate care te tine responsabil", "100% GRATUIT" |
| **FAQ "Cat timp"** | "Doar 15 minute pe zi..." | Adaugam: "Exact ce ai nevoie cand esti in burnout -- pasi mici, impact mare" |
| **Final CTA Title (RO)** | "Gata sa-ti Transformi Viata?" | "Gata de Momentum?" |
| **Final CTA Title (EN)** | "Ready to Transform Your Life?" | "Ready for Momentum?" |
| **Final CTA Subtitle (RO)** | "Alatura-te miilor..." | "Opreste ciclul burnout-ului. Primii 2 pasi sunt gratuit." |
| **Final CTA Subtitle (EN)** | "Join thousands who are already living..." | "Break the burnout cycle. The first 2 steps are free." |

---

### 2. `/challenge` - Progress Page (`src/pages/Challenge.tsx`)

| Sectiune | Actual | Nou |
|----------|--------|-----|
| **H1** | Pastram "Have It All Lifestyle Challenge" | Pastram (brand name) |
| **Subtitle (RO)** | "7 Zile pentru a Transforma Fiecare Arie a Vietii Tale" | "De la blocaj & burnout la claritate & momentum" |
| **Subtitle (EN)** | "7 Days to Transform Every Area of Your Life" | "From stuck & burnout to clarity & momentum" |
| **Progress text "Keep going"** | "Ziua X din 7 - Continua!" / "Day X of 7 - Keep going!" | "Ziua X din 7 - Momentum-ul creste!" / "Day X of 7 - Momentum is building!" |
| **Login Banner title** | "Salveaza-ti Progresul" / "Save Your Progress" | "Nu pierde momentum-ul -- Salveaza progresul" / "Don't lose momentum -- Save your progress" |
| **Upgrade Gate title** | "Deblocheaza Zilele 3-7" / "Unlock Days 3-7" | "Continua Momentum-ul -- Zilele 3-7" / "Continue the Momentum -- Days 3-7" |
| **Bottom CTA title** | "Incepe Challenge-ul GRATUIT: 2 Zile + 5-Day Trial" | "Iesi din burnout: 2 Zile Gratuit + 5 Zile Trial" / "Break free from burnout: 2 Days Free + 5-Day Trial" |

---

### 3. `/challenge-en` - English Landing (`src/pages/ChallengeEnglish.tsx`)

| Sectiune | Actual | Nou |
|----------|--------|-----|
| **H1** | "Have It All Lifestyle Challenge" | "Break Free from Burnout in 7 Days" |
| **Subtitle** | "7 Days to Transform Every Area of Your Life" | "From procrastination and exhaustion to clarity, energy and unstoppable momentum" |
| **7-Day Map title** | "Your 7-Day Transformation Map" | "Your 7-Step Anti-Burnout Plan" |
| **CTA Button** | "Start Day 1 Now -- Free Access" | "Escape Burnout Now -- Free Access" |
| **Bug fix: navigatie** | `handleDayClick` navigheaza la `/challenge/{day}` | Fix la `/challenge-en/{day}` |

---

### 4. Intro Script EN (`src/data/challengeScripts.ts`)

| Sectiune | Actual | Nou |
|----------|--------|-----|
| **Title** | "Welcome to the Have It All Lifestyle Challenge" | "Welcome to the Have It All Lifestyle Challenge" (pastram) |
| **Subtitle** | "7 Days to Transform Every Area of Your Life" | "7 Days to Break Free from Burnout and Build Unstoppable Momentum" |
| **Opening question** | "What's the ONE Story Keeping You Stuck?" | "Are You Stuck in a Burnout Loop?" |
| **Story examples** | "I don't know where to start", "I'm afraid I'll fail", etc. | "I keep planning but never executing", "I'm exhausted but can't stop", "I know what to do but I just can't start", "I feel burned out but guilty for resting" |
| **Truth statement** | "These stories aren't facts. They're patterns." | "This is the burnout-procrastination cycle. And today, you break it." |
| **Why This Works** | "This isn't just another program where you watch videos passively." | "This challenge breaks the burnout-procrastination cycle by rebuilding balance across all 4 areas of your life." |
| **7-Day Map title** | "Your 7-Day Transformation Map" | "Your 7-Step Anti-Burnout Plan" |

---

## Ce NU se schimba

- Structura celor 7 zile (task-uri, exercitii, ordine)
- Pricing si model freemium (Zilele 1-2 gratuite)
- Componentele tehnice (audio player, script card, chat, auth)
- Edge functions
- Componente de layout si design (culori, iconuri, animatii)
- Day scripts individuale (Day 1-7) -- doar intro script-ul se modifica

## Detalii Tehnice

### Fisier 1: `src/pages/Challenge7ZileLanding.tsx`
- Liniile 263-268: Helmet meta tags
- Liniile 286-296: Hero H1 + subtitle
- Liniile 360-367: 4 Pillars title + subtitle
- Liniile 147-184: Pillars array descriptions
- Liniile 393-399: 7-Day Journey title + subtitle
- Liniile 186-217: Benefits array items
- Liniile 219-244: FAQ items (adaugam text la primul FAQ)
- Liniile 529-558: Final CTA title + subtitle

### Fisier 2: `src/pages/Challenge.tsx`
- Linia 181-186: H1 subtitle
- Linia 265: Progress text "Keep going"
- Liniile 237-251: Login banner
- Liniile 282-310: Upgrade gate
- Liniile 375-387: Bottom CTA

### Fisier 3: `src/pages/ChallengeEnglish.tsx`
- Liniile 85-91: H1 + subtitle
- Liniile 59-67: handleDayClick navigatie fix (bug)
- Linia 109-112: 7-Day Map title
- Liniile 170-182: CTA button

### Fisier 4: `src/data/challengeScripts.ts`
- Liniile 4-62: getChallengeIntroScript() -- rescrierea intro script-ului

