

# Plan: Reframe Challenge Interior — De la "Transformare" la "Anti-Burnout & Momentum"

## Rezumat

Dupa ce am actualizat landing page-urile si scripturile, interiorul challenge-ului (pagina /challenge, paginile individuale per zi, si componentele Day 1) inca contine limbaj generic de "transformare". Acest plan actualizeaza TOATE textele ramase pentru a fi aliniate cu narativul "De la Burnout & Procrastinare la Claritate & Momentum".

---

## FISIER 1: `src/pages/ChallengeDay.tsx` (Continutul zilelor 1-7)

### Challenge Content Array (titluri, principii, descrieri, exercitii)

| Zi | Element | Actual | Nou |
|----|---------|--------|-----|
| 1 | subtitleEn | "Napoleon Hill Vision + Join Community + Invite Friends" | "Set your anti-burnout foundation + Join Community" |
| 1 | subtitleRo | "Viziune Napoleon Hill + Join Community + Invita Prieteni" | "Seteaza fundatia anti-burnout + Alatura-te comunitatii" |
| 1 | principleEn | "Day 1: Vision + Declaration (Napoleon Hill)" | "Day 1: Break the Fog — Set Your Direction" |
| 1 | principleRo | "Ziua 1: Viziune + Declaratie (Napoleon Hill)" | "Ziua 1: Sparge Ceata — Seteaza Directia" |
| 1 | descriptionEn | "Set your direction: how does your life look in 1 year across all 4 zones. Write your Personal Declaration..." | "Stop drifting. Map where you are today, discover WHY you're stuck, and write your anti-burnout declaration. This is where clarity replaces confusion." |
| 1 | descriptionRo | "Seteaza directia: cum arata viata ta peste 1 an in cele 4 zone..." | "Opreste deriva. Evalueaza unde esti azi, descopera DE CE esti blocat si scrie declaratia ta anti-burnout. Aici claritatea inlocuieste confuzia." |
| 2 | principleEn | "Day 2: Build Your Foundation - Energy + Peace + Connection" | "Day 2: Rebuild Energy — Body, Spirit & Relationships" |
| 2 | principleRo | "Ziua 2: Construieste Fundatia - Energie + Pace + Conexiune" | "Ziua 2: Reconstruieste Energia — Corp, Spirit & Relatii" |
| 2 | descriptionEn | "Set objectives for Body, Spirit, AND Relationships on 3 levels... These 3 areas are the foundation for everything else." | "Burnout drained your energy across 3 areas. Today you rebuild: set concrete goals for Body, Spirit, and Relationships. These 3 areas are the anti-burnout foundation." |
| 2 | descriptionRo | "Seteaza obiective pentru Corp, Spirit si Relatii pe 3 nivele..." | "Burnout-ul ti-a epuizat energia in 3 arii. Azi reconstruiesti: seteaza obiective concrete pentru Corp, Spirit si Relatii. Aceste 3 arii sunt fundatia anti-burnout." |
| 3 | principleEn | "Day 3: Business Vision + Weekly Execution System" | "Day 3: Stop Planning, Start Executing — The Domino System" |
| 3 | principleRo | "Ziua 3: Viziune Business + Sistem de Executie Saptamanala" | "Ziua 3: Nu Mai Planifica, Executa — Sistemul Domino" |
| 3 | descriptionEn | "The AI Wizard guides you through a complete flow..." | "The #1 burnout trigger: endless planning without executing. Today, the AI Wizard builds your execution machine: Vision to 90-day targets to Weekly Domino Door. No more procrastination loops." |
| 3 | descriptionRo | "Wizard-ul AI te ghideaza printr-un flow complet..." | "Cauza #1 a burnout-ului: planificare fara executie. Azi, Wizard-ul AI iti construieste masina de executie: de la Viziune la tinte pe 90 zile la Domino Door saptamanal. Fara cicluri de procrastinare." |
| 4 | principleEn | "Day 4: Automate Your Daily Execution" | "Day 4: Build Your Anti-Burnout Routine" |
| 4 | principleRo | "Ziua 4: Automatizeaza Executia Zilnica" | "Ziua 4: Construieste Rutina Ta Anti-Burnout" |
| 4 | descriptionEn | "Generate AI images for all 4 life areas. Create your personalized meditation... Start living your transformation." | "A routine that energizes instead of exhausting. Generate AI vision images, create your personalized anti-burnout meditation, and configure a daily flow that builds momentum without draining you." |
| 4 | descriptionRo | "Genereaza imagini AI pentru toate cele 4 arii... Incepe sa traiesti transformarea." | "O rutina care te energizeaza in loc sa te epuizeze. Genereaza imagini AI de viziune, creeaza meditatia ta anti-burnout personalizata si configureaza un flux zilnic care construieste momentum fara sa te consume." |
| 5 | principleEn | "Day 5: Transform Emotions into Power" | "Day 5: Break Emotional Resistance — From Stuck to Clarity" |
| 5 | principleRo | "Ziua 5: Transforma Emotiile in Putere" | "Ziua 5: Sparge Rezistenta Emotionala — De la Blocat la Claritate" |
| 5 | descriptionEn | "Accountability Coach knows everything... This isn't about suppressing emotions. It's about transforming them into fuel." | "Procrastination isn't laziness — it's emotional resistance. Accountability Coach shows what's done and what's missing. Mind Coach transforms fear, anger, anxiety into momentum. This is where you break the inner burnout cycle." |
| 5 | descriptionRo | "Accountability Coach stie tot... Nu e vorba sa suprim emotiile. E vorba sa le transformi in combustibil." | "Procrastinarea nu e lene — e rezistenta emotionala. Accountability Coach arata ce e facut si ce lipseste. Mind Coach transforma frica, furia, anxietatea in momentum. Aici spargi ciclul interior al burnout-ului." |
| 6 | principleEn | "Day 6: Impulse Control - Don't Let Ideas Destroy Execution" | "Day 6: Protect Your Focus — Strategic Impulse Control" |
| 6 | principleRo | "Ziua 6: Controlul Impulsului - Nu Lasa Ideile sa Distruga Executia" | "Ziua 6: Protejeaza-ti Focusul — Control Strategic al Impulsurilor" |
| 6 | descriptionEn | "This section is NOT for execution..." | "The biggest threat to momentum: shiny new ideas. This section teaches you to park ideas without losing focus. Classify with Eisenhower Matrix. Protect the execution system built on Day 3." |
| 6 | descriptionRo | "Aceasta sectiune NU este pentru executie..." | "Cea mai mare amenintare pentru momentum: ideile noi stralucitoare. Aceasta sectiune te invata sa parchezi ideile fara sa pierzi focusul. Clasifica cu Matricea Eisenhower. Protejeaza sistemul de executie construit in Ziua 3." |
| 7 | principleEn | "Day 7: Full System Integration + Membership" | "Day 7: From Burnout to Momentum — Make It Permanent" |
| 7 | principleRo | "Ziua 7: Integrare Completa a Sistemului + Membership" | "Ziua 7: De la Burnout la Momentum — Fa-l Permanent" |
| 7 | descriptionEn | "Recap what you've achieved: clear vision, yearly plan..." | "You broke the burnout cycle. You built clarity, energy, execution, and control. Now the question: do you let momentum fade, or do you make it permanent?" |
| 7 | descriptionRo | "Recapitulare ce ai realizat: viziune clara, plan anual..." | "Ai spart ciclul burnout-ului. Ai construit claritate, energie, executie si control. Acum intrebarea: lasi momentum-ul sa se stinga, sau il faci permanent?" |

### Day 1 - Header Titlu (linia 660)

| Element | Actual | Nou |
|---------|--------|-----|
| Day 1 H1 (EN) | "THE FOUNDATION" | "BREAK THE FOG" |
| Day 1 H1 (RO) | "FUNDATIA TRANSFORMARII" | "SPARGE CEATA" |
| Day 1 description (EN) | "Discover your BIG WHY and create your vision declaration in Napoleon Hill style." | "Map your reality, discover WHY you're stuck, and write your anti-burnout declaration." |
| Day 1 description (RO) | "Descopera-ti MARELE DE CE si creeaza declaratia ta de viziune in stilul Napoleon Hill." | "Evalueaza-ti realitatea, descopera DE CE esti blocat si scrie declaratia ta anti-burnout." |

### Day Completed Messages (linia 1077-1080)

| Element | Actual | Nou |
|---------|--------|-----|
| Completed congratulation (EN) | "Great work! You're building your Have It All lifestyle!" | "Great work! You're building momentum!" |
| Completed congratulation (RO) | "Excellent! Iti construiesti stilul de viata Have It All!" | "Excelent! Construiesti momentum!" |

### Challenge Overview Subtitles (fisier `src/pages/Challenge.tsx`, liniile 31-96)

| Zi | Element | Actual | Nou |
|----|---------|--------|-----|
| 1 | subtitleEn | "Napoleon Hill Vision + Join Community + Invite Friends" | "Map reality + Set direction + Join community" |
| 1 | subtitleRo | "Viziune Napoleon Hill + Join Community + Invita Prieteni" | "Evalueaza realitatea + Seteaza directia + Comunitate" |
| 2 | subtitleEn | "2026 / 90-day / 30-day goals for all 3 areas" | "Rebuild energy: Body, Spirit & Relationships goals" |
| 2 | subtitleRo | "Obiective 2026 / 90 zile / 30 zile pentru toate 3 ariile" | "Reconstruieste energia: obiective Corp, Spirit & Relatii" |
| 3 | subtitleEn | "Business Vision + 90 Days + Monthly + Weekly Door (ONE GO)" | "Stop the planning loop — Build your execution machine" |
| 3 | subtitleRo | "Business Vision + 90 Zile + Lunar + Weekly Door (ONE GO)" | "Opreste ciclul planificarii — Construieste masina de executie" |
| 4 | subtitleEn | "Daily routine + AI images + personalized meditation" | "Anti-burnout routine + AI vision + personalized meditation" |
| 4 | subtitleRo | "Rutina zilnica + Imagini AI + Meditatie personalizata" | "Rutina anti-burnout + Viziune AI + Meditatie personalizata" |
| 5 | subtitleEn | "Status check + Transform emotions into power" | "Break emotional resistance + Transform procrastination into momentum" |
| 5 | subtitleRo | "Status check + Transforma emotiile in putere" | "Sparge rezistenta emotionala + Transforma procrastinarea in momentum" |
| 6 | subtitleEn | "Impulse control + Eisenhower classification" | "Protect your momentum from shiny distractions" |
| 6 | subtitleRo | "Controlul impulsului + Clasificare Eisenhower" | "Protejeaza-ti momentum-ul de distractii stralucitoare" |
| 7 | subtitleEn | "Recap + Upgrade + Invite final friends" | "Make the momentum permanent + Continue the system" |
| 7 | subtitleRo | "Recap + Upgrade + Invita prieteni finali" | "Fa momentum-ul permanent + Continua sistemul" |

### 100% Complete Message (linia 265)

| Element | Actual | Nou |
|---------|--------|-----|
| EN | "Challenge Complete! You are a Have It All Achiever!" | "Challenge Complete! You broke the burnout cycle!" |
| RO | "Challenge Complet! Esti un Realizator Have It All!" | "Challenge Complet! Ai spart ciclul burnout-ului!" |

---

## FISIER 2: `src/components/challenge/day1/Day1StepsSummary.tsx`

| Pas | Element | Actual | Nou |
|-----|---------|--------|-----|
| 2 | descriptionEn | "Answer 5 questions to find your deep motivation for transformation." | "Answer 5 questions to find your deep motivation to break free from burnout." |
| 2 | descriptionRo | "Raspunde la 5 intrebari pentru a-ti gasi motivatia profunda de transformare." | "Raspunde la 5 intrebari pentru a-ti gasi motivatia profunda de a iesi din burnout." |
| 5 | descriptionEn | "Send the exclusive invite to friends who want to transform!" | "Send the exclusive invite to friends who need to escape burnout!" |
| 5 | descriptionRo | "Trimite invitatia exclusiva prietenilor care vor sa se transforme!" | "Trimite invitatia exclusiva prietenilor care au nevoie sa iasa din burnout!" |

---

## FISIER 3: `src/components/challenge/day1/Day1Commitment.tsx`

| Element | Actual | Nou |
|---------|--------|-----|
| Commitment benefit 1 (EN) | "7 days of transformation" | "7 days to break the burnout cycle" |
| Commitment benefit 1 (RO) | "7 zile de transformare" | "7 zile sa spargi ciclul burnout-ului" |
| Commitment text (EN) | "...I understand that consistency is the key to transformation." | "...I understand that consistency is the key to building lasting momentum." |
| Commitment text (RO) | "...Inteleg ca consistenta este cheia transformarii." | "...Inteleg ca consistenta este cheia construirii unui momentum durabil." |

---

## FISIER 4: `src/components/challenge/ChallengeUpgradeGate.tsx`

| Element | Actual | Nou |
|---------|--------|-----|
| H2 subtitle (RO) | "Continua transformarea ta cu acces complet la Challenge" | "Continua momentum-ul cu acces complet la Challenge" |
| H2 subtitle (EN) | "Continue your transformation with full Challenge access" | "Continue your momentum with full Challenge access" |

---

## FISIER 5: `src/components/challenge/ChallengeWalkthrough.tsx`

| Element | Actual | Nou |
|---------|--------|-----|
| Header subtitle (EN) | "Learn how to use each module to achieve your goals" | "Learn how to use each module to maintain momentum" |
| Header subtitle (RO) | "Invata cum sa folosesti fiecare modul pentru a-ti atinge obiectivele" | "Invata cum sa folosesti fiecare modul pentru a-ti mentine momentum-ul" |

---

## FISIER 6: `src/components/challenge/day1/Day1WhyQuestions.tsx`

| Element | Actual | Nou |
|---------|--------|-----|
| Header title (EN) | "STEP 1: THE BIG WHY" | "STEP 1: WHY ARE YOU STUCK?" |
| Header title (RO) | "PASUL 1: MARELE DE CE" | "PASUL 1: DE CE ESTI BLOCAT?" |
| Header subtitle (EN) | "Answer these 5 questions to discover your deep motivation" | "Answer these 5 questions to uncover the root of your burnout" |
| Header subtitle (RO) | "Raspunde la aceste 5 intrebari pentru a-ti descoperi motivatia profunda" | "Raspunde la aceste 5 intrebari pentru a descoperi radacina burnout-ului tau" |
| Question 1 (EN) | "Why do you want to HAVE IT ALL in life?" | "What drove you to burnout? Why do you want to break free?" |
| Question 1 (RO) | "De ce vrei sa ai TOTUL in viata?" | "Ce te-a adus in burnout? De ce vrei sa iesi?" |
| Question 1 hint (EN) | "What motivates you to be better in all areas..." | "What's the real cost of continuing like this? What's at stake?" |
| Question 1 hint (RO) | "Ce te motiveaza sa fii mai bun in toate ariile..." | "Care e costul real daca continui asa? Ce e in joc?" |
| Question 2 (EN) | "What brought you here, to this moment?" | "What's the #1 area draining your energy right now?" |
| Question 2 (RO) | "Ce te-a adus aici, in acest moment?" | "Care e aria #1 care iti consuma energia acum?" |
| Question 2 hint (EN) | "What situation or realization made you seek a profound change?" | "Body, Spirit, Relationships, or Business — where is the biggest gap?" |
| Question 2 hint (RO) | "Ce situatie sau realizare te-a facut sa cauti o schimbare profunda?" | "Corp, Spirit, Relatii sau Business — unde e cel mai mare decalaj?" |

---

## FISIER 7: `src/components/challenge/ChallengeDay6Ideas.tsx`

| Element | Actual | Nou |
|---------|--------|-----|
| Description (EN) | "This section is NOT for execution. It's for getting ideas out of your head without destroying the focus set on Day 3." | "This section is NOT for execution. It's for parking ideas safely so they don't destroy the momentum you built on Day 3." |
| Description (RO) | "Aceasta sectiune NU este pentru executie. Este pentru a scoate ideile din cap fara sa distruga focusul setat in Ziua 3." | "Aceasta sectiune NU este pentru executie. Este pentru a parca ideile in siguranta ca sa nu distruga momentum-ul construit in Ziua 3." |
| Brain paragraph (EN) | "Your brain constantly generates new ideas. Without a 'parking' system, these ideas will distract you from strategic execution." | "Your brain constantly generates new ideas. Without a 'parking' system, these ideas will destroy the momentum you've been building." |
| Brain paragraph (RO) | "Creierul tau genereaza constant idei noi. Fara un sistem de 'parcare', aceste idei te vor distrage de la executia strategica." | "Creierul tau genereaza constant idei noi. Fara un sistem de 'parcare', aceste idei vor distruge momentum-ul pe care l-ai construit." |

---

## Ce NU se schimba

- Structura celor 7 zile (task-uri, exercitii, ordine)
- Pricing si model freemium
- Componentele tehnice (audio player, script card, chat, auth)
- Edge functions
- Componente de layout si design (culori, iconuri, animatii)
- Logica de unlock/complete/progress

## Detalii Tehnice

- **7 fisiere** de modificat, toate prin `lov-line-replace` (editari de text, fara logica noua)
- **~80 de string-uri** actualizate (RO + EN)
- Fara componente noi, fara dependente noi
- Toate modificarile sunt backward-compatible

