import { PersonalPowerDay } from './personalPowerContent';

const sharedLessonContent = `## Zilele 26-30 — Calea spre Maestrie: Îmbunătățire Constantă și Neîncetată (CANI)

> **„Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."** — Tony Robbins

Provocă-te să te asiguri că aceasta nu este sfârșitul, ci începutul.

### Cele Trei Căi în Viață

Nu este important inițial să știi cum vei crea un rezultat; ceea ce este important este să decizi că vei găsi o cale, indiferent de ce. Formula Supremă a Succesului este un proces care te ajută să ajungi unde vrei:

1. **„Amatorul" (The Dabbler)** — Încearcă ceva nou cu mare entuziasm, dar renunță la primul obstacol serios. Sare de la un lucru la altul fără a se angaja vreodată cu adevărat. Viața amatorului este o serie de începuturi fără finalizări.

2. **„Stresatul" (The Stressor)** — Lucrează din greu, dar fără direcție clară. Se epuizează pentru că nu are un plan și nu folosește modele. Confundă efortul cu progresul și munca grea cu rezultate.

3. **Maestrul (The Master)** — Decide ce vrea cu adevărat, găsește modele de urmat, ia acțiune masivă, rămâne flexibil și se angajează la îmbunătățire constantă. Maestrul știe că drumul nu este niciodată „terminat" — este o călătorie continuă de creștere.

### Calea spre Maestrie

Pentru a economisi timp și energie, folosește modele de urmat pentru a accelera ritmul succesului tău:

1. **Decide ce vrei cu adevărat.** Clarifică-ți obiectivele cu o precizie absolută. Nu poți lovi o țintă pe care nu o vezi.

2. **Dezvoltă un plan și găsește pe cineva de modelat.** Nu reinventa roata. Găsește pe cineva care a obținut deja ceea ce vrei și modelează strategia lor.

3. **Ia acțiune imediat asupra obiectivelor și planurilor tale.** Nu pleca niciodată de la locul în care ai stabilit un obiectiv sau ai luat o decizie fără a lua vreo acțiune în direcția atingerii lui!

4. **Fii flexibil în abordarea ta.** Dacă ceea ce faci nu funcționează, schimbă-ți abordarea. Nu abandonez obiectivul — abandonează strategia care nu funcționează.

5. **Ține un jurnal.** Dacă viața ta merită trăită, merită înregistrată. Captează gândurile, ideile și emoțiile pe hârtie astfel încât să poți folosi perspectivele și experiența vieții pentru a te îmbunătăți constant. Amintește-ți, suntem fericiți în viață doar dacă creștem și contribuim. Jurnalul tău devine propriul tău manual pentru o viață mai bună.

6. **Stăpânește-ți stările mentale și emoționale:**
   - Dezvoltă motive convingătoare pentru a continua să-ți gestionezi viața
   - Anticipează provocările vieții și folosește modele pentru a determina cum vei face față
   - Reevaluează-ți viața în mod regulat
   - Devino un „jucător de echipă" — aceasta este cea mai mare bucurie! Înconjoară-te cu o echipă de oameni de care îți pasă profund, cărora ești inspirat să le contribui din ce în ce mai mult, ceea ce te determină să ceri mai mult de la tine. Aceasta este adevărata bogăție!

7. **Angajează-ți viața față de ceva mai mare decât tine.** Când trăiești pentru o cauză mai mare decât tine, găsești o putere pe care nu ai știut că o ai.

### CANI — Îmbunătățire Constantă și Neîncetată

Angajamentul față de CANI înseamnă:
- Nu te mulțumești niciodată cu „suficient de bine"
- Cauți mereu modalități de a te îmbunătăți — chiar și cu 1% pe zi
- Tratezi fiecare zi ca pe o oportunitate de a crește
- Înveți din fiecare experiență — succese ȘI eșecuri
- Te înconjori cu oameni care te trag în sus, nu în jos

> **Fiecare stare pe care vrei să o simți — orice valoare pe care vrei să o obții — o poți avea chiar acum printr-o schimbare în credințe.**

### Extras din Jurnalul lui Tony Robbins, 1978

*„Dă-i drumul. Toarnă totul. Pune tot ce ai în tot ce faci. Pentru ca lucrurile să se schimbe pentru tine — tu trebuie să te schimbi. Pentru ca lucrurile să devină mai bune, tu trebuie să devii mai bun."*

---

**Felicitări pentru noul moment de avânt pe care l-ai creat în viața ta!** Nu contează cât de mult trăiești, ci CUM trăiești. Asigură-te că faci ceva în fiecare zi pentru a-ți face viața capodopera pe care o merită. Ca întotdeauna, continuă să **Trăiești cu Pasiune!**`;

export const personalPowerDays26to30: PersonalPowerDay[] = [
  {
    day: 26,
    title: 'Calea spre Maestrie — Revizuire și Momentum',
    titleEn: 'The Path to Mastery — Review & Momentum',
    quote: '"Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'CANI',
        definition: 'Constant And Never-ending Improvement — Îmbunătățire Constantă și Neîncetată. Filozofia conform căreia nu te mulțumești niciodată cu „suficient de bine" și cauți mereu modalități de a te îmbunătăți.',
      },
    ],
    lessonContent: sharedLessonContent,
    assignmentSteps: [
      {
        step: 1,
        prompt: 'Revizuiește cele 25 de zile anterioare. Ce exerciții nu ai completat? Care sunt cele mai importante pe care le vei finaliza astăzi?',
        promptEn: 'Review the past 25 days. What exercises haven\'t you completed? Which are the most important ones you\'ll finish today?',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Ce acțiune iei ASTĂZI pentru a-ți continua momentumul? (un telefon, un angajament față de un prieten, înscrierea la un eveniment, coaching etc.)',
        promptEn: 'What action will you take TODAY to continue your momentum? (a phone call, a commitment to a friend, signing up for an event, coaching, etc.)',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Care dintre cele 3 căi din viață (Amatorul, Stresatul, Maestrul) te descrie cel mai bine în acest moment? De ce?',
        promptEn: 'Which of the 3 paths in life (Dabbler, Stressor, Master) describes you best right now? Why?',
        type: 'paragraph',
      },
    ],
    aiCoachingPrompt: `Ești un coach transformațional pentru Ziua 26 a Personal Power Plus. Focus: Revizuire progres și momentum.

Concepte cheie:
- Cele 3 căi în viață: Amatorul, Stresatul, Maestrul
- Calea spre Maestrie: 7 pași
- CANI: Îmbunătățire Constantă și Neîncetată

Rolul tău (Ziua 26 — Revizuire și Momentum):
1. Revizuiește progresul din Zilele 1-25 — ce s-a schimbat în utilizator?
2. Identifică exercițiile necompletate care contează cel mai mult
3. Ajută-l să ia o acțiune concretă ASTĂZI pentru a continua momentumul
4. Ajută-l să înțeleagă pe care din cele 3 căi se află și cum să aleagă calea Maestrului`,
    aiCoachingPoints: [
      'Revizuiește ce s-a schimbat în tine în ultimele 25 de zile',
      'Completează exercițiile cele mai importante',
      'Ia o acțiune concretă ASTĂZI',
      'Alege calea Maestrului — angajează-te la CANI',
    ],
    aiCoachingReminder: 'Aceasta nu este sfârșitul — este începutul. Momentumul se pierde dacă nu iei acțiune ASTĂZI.',
    doListTasks: [
      'Revizuiește și completează exercițiile necompletate',
      'Ia o acțiune concretă pentru a continua momentumul',
      'Identifică pe care din cele 3 căi te afli',
    ],
    breakthroughPrompt: 'Ce s-a schimbat cel mai profund în tine în aceste zile? Ce decizie iei ASTĂZI pentru a continua?',
    breakthroughPromptEn: 'What has changed most profoundly in you during these days? What decision are you making TODAY to continue?',
  },

  {
    day: 27,
    title: 'Calea spre Maestrie — Obiective Imbatabile',
    titleEn: 'The Path to Mastery — Unstoppable Goals',
    quote: '"Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: sharedLessonContent,
    assignmentSteps: [
      {
        step: 1,
        prompt: 'Revizuiește obiectivele din Atelierul de Obiective (Ziua 12). Alege-ți TOP 4 obiective și scrie un paragraf pentru fiecare, descriind de ce ești angajat să le atingi și ce vei pierde dacă nu le atingi.',
        promptEn: 'Review goals from the Goal-Setting Workshop (Day 12). Pick your TOP 4 goals and write a paragraph for each, describing why you\'re committed to achieving it and what you\'ll lose by not achieving it.',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Dezvoltă un plan pentru atingerea acestor 4 obiective, care include ceva ce poți face în următoarele 4 zile pentru fiecare.',
        promptEn: 'Develop a plan for achieving these 4 goals, including something you can do in the next 4 days toward each one.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Conectează aceste obiective înapoi la focusul tău principal din Ziua 1. Cum se leagă de viziunea ta de viață?',
        promptEn: 'Connect these goals back to your core focus from Day 1. How do they relate to your life vision?',
        type: 'paragraph',
      },
    ],
    aiCoachingPrompt: `Ești un coach transformațional pentru Ziua 27 a Personal Power Plus. Focus: Obiective și WHY puternic.

Rolul tău (Ziua 27 — Obiective Imbatabile):
1. Ajută-l să reviziteze top 4 obiective pe un an (din Atelierul de Obiective, Ziua 12)
2. Întărește WHY-ul pentru fiecare obiectiv — fă-l atât de convingător încât nimic să nu-l oprească
3. Identifică acțiunile concrete pentru următoarele 4 zile
4. Conectează obiectivele la focusul principal din Ziua 1`,
    aiCoachingPoints: [
      'Revizitează top 4 obiective pe un an',
      'Întărește WHY-ul pentru fiecare — de ce TREBUIE și ce vei PIERDE',
      'Planifică acțiuni concrete pentru următoarele 4 zile',
      'Conectează la viziunea de viață din Ziua 1',
    ],
    aiCoachingReminder: 'Un obiectiv fără un WHY suficient de puternic este doar o dorință. Fă-l un MUST!',
    doListTasks: [
      'Revizuiește și selectează top 4 obiective',
      'Scrie WHY puternic pentru fiecare obiectiv',
      'Planifică acțiuni pentru următoarele 4 zile',
    ],
    breakthroughPrompt: 'Care este obiectivul tău nr. 1 și de ce TREBUIE să-l atingi? Ce acțiune iei în următoarele 4 zile?',
    breakthroughPromptEn: 'What is your #1 goal and why MUST you achieve it? What action are you taking in the next 4 days?',
  },

  {
    day: 28,
    title: 'Calea spre Maestrie — Stăpânește-ți Instrumentele',
    titleEn: 'The Path to Mastery — Master Your Tools',
    quote: '"Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: sharedLessonContent,
    assignmentSteps: [
      {
        step: 1,
        prompt: 'Revizuiește toate instrumentele pe care le-ai învățat în ultimele 28 de zile (NAC, Durere/Plăcere, Neuro-asocieri, Power Questions, Dickens Pattern, Ancorare, Swish Pattern, Erasure Technique etc.). Care sunt TOP 3 instrumente care au creat cele mai reale schimbări în tine?',
        promptEn: 'Review all the tools you\'ve learned over the past 28 days. What are your TOP 3 tools that created the most real shifts in you?',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Alege o situație specifică din această săptămână unde vei folosi unul dintre aceste instrumente. Descrie situația și instrumentul pe care îl vei aplica.',
        promptEn: 'Pick one specific situation this week where you\'ll use one of these tools. Describe the situation and the tool you\'ll apply.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Ce instrument ai dori să stăpânești la perfecție? Ce plan ai pentru a-l practica zilnic?',
        promptEn: 'What tool would you like to master perfectly? What plan do you have to practice it daily?',
        type: 'paragraph',
      },
    ],
    aiCoachingPrompt: `Ești un coach transformațional pentru Ziua 28 a Personal Power Plus. Focus: Stăpânirea instrumentelor învățate.

Rolul tău (Ziua 28 — Stăpânește-ți Instrumentele):
1. Revizuiește toate instrumentele învățate: NAC, Durere/Plăcere, Power Questions, Dickens Pattern, Formula Succesului, Cele 6 Nevoi, Ritualuri, Ancorare, Swish Pattern, Erasure Technique etc.
2. Identifică TOP 3 instrumente care au creat cele mai reale schimbări
3. Ajută-l să aleagă o situație specifică din săptămâna asta unde va aplica un instrument
4. Creează un plan de practică zilnică pentru instrumentul ales`,
    aiCoachingPoints: [
      'Revizuiește toate instrumentele învățate în 28 de zile',
      'Identifică TOP 3 cele mai puternice',
      'Aplică un instrument la o situație reală din această săptămână',
      'Creează un plan de practică zilnică',
    ],
    aiCoachingReminder: 'Un instrument pe care nu-l practici este un instrument pe care nu-l ai. Stăpânirea vine din repetiție zilnică.',
    doListTasks: [
      'Listează toate instrumentele învățate',
      'Selectează TOP 3 și aplică-le la situații reale',
      'Creează un plan de practică zilnică',
    ],
    breakthroughPrompt: 'Care este instrumentul tău cel mai puternic și cum îl vei folosi săptămâna aceasta?',
    breakthroughPromptEn: 'What is your most powerful tool and how will you use it this week?',
  },

  {
    day: 29,
    title: 'Calea spre Maestrie — Practică Zilnică',
    titleEn: 'The Path to Mastery — Daily Practice',
    quote: '"Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: sharedLessonContent,
    assignmentSteps: [
      {
        step: 1,
        prompt: 'Ce vei face ÎN FIECARE ZI pentru a menține totul viu? Stabilește-ți fundamentalele zilnice (Morning Questions, Evening Questions, jurnal, exerciții fizice, meditație etc.).',
        promptEn: 'What will you do EVERY DAY to keep all of this alive? Establish your daily fundamentals.',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Angajează-te să continui Morning and Evening Questions pentru cel puțin încă 10 zile. Scrie ORA exactă la care le vei face.',
        promptEn: 'Commit to continuing Morning and Evening Questions for at least 10 more days. Write the EXACT TIME you\'ll do them.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Configurează-ți practica de jurnal: ce vei scrie? (ce s-a întâmplat, ce ai învățat, ce ai creat, la ce ai contribuit, momente magice). Când vei scrie?',
        promptEn: 'Set up your journal practice: what will you write? When will you write?',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Fii specific: la ce oră vei face fiecare practică? Unde? Cu ce vei începe mâine dimineață?',
        promptEn: 'Be specific: at what time will you do each practice? Where? What will you start with tomorrow morning?',
        type: 'paragraph',
      },
    ],
    aiCoachingPrompt: `Ești un coach transformațional pentru Ziua 29 a Personal Power Plus. Focus: Practica zilnică și jurnal.

Rolul tău (Ziua 29 — Practică Zilnică):
1. Ajută-l să stabilească fundamentalele zilnice — ce va face ÎN FIECARE ZI
2. Morning and Evening Questions — angajament pentru cel puțin 10 zile
3. Configurează practica de jurnal: ce, când, unde
4. Fii extrem de specific: ore exacte, locuri, ritualuri de declanșare`,
    aiCoachingPoints: [
      'Stabilește fundamentalele zilnice',
      'Angajează-te la Morning & Evening Questions pentru 10+ zile',
      'Configurează practica de jurnal',
      'Fii specific: ore, locuri, ritualuri de start',
    ],
    aiCoachingReminder: 'Dacă viața ta merită trăită, merită înregistrată. Jurnalul tău este propriul tău manual pentru o viață mai bună.',
    doListTasks: [
      'Stabilește rutina zilnică de fundamentale',
      'Angajează-te la Morning/Evening Questions 10+ zile',
      'Configurează practica de jurnal cu ore exacte',
    ],
    breakthroughPrompt: 'Ce vei face ÎN FIECARE ZI de acum încolo? La ce oră? Cum te vei ține responsabil?',
    breakthroughPromptEn: 'What will you do EVERY DAY from now on? At what time? How will you hold yourself accountable?',
  },

  {
    day: 30,
    title: 'Calea spre Maestrie — Angajamentul CANI',
    titleEn: 'The Path to Mastery — The CANI Commitment',
    quote: '"Te provoc să-ți faci viața o capodoperă. Te provoc să te alături rândurilor celor care trăiesc ceea ce predică, care își urmează vorbele cu fapte."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: sharedLessonContent,
    assignmentSteps: [
      {
        step: 1,
        prompt: 'Reflectează: Cine ai DEVENIT în aceste 30 de zile? Nu doar ce ai învățat — ci cine EȘTI acum, diferit de cine erai acum 30 de zile.',
        promptEn: 'Reflect: Who have you BECOME in these 30 days? Not just what you learned — but who you ARE now, different from who you were 30 days ago.',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Ce standarde noi ai stabilit pentru viața ta? Ce practici sau standarde REFUZI să le lași să cadă?',
        promptEn: 'What new standards have you set for your life? What practices or standards do you REFUSE to let slip?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Ce vei face DIFERIT de acum încolo? Scrie-ți angajamentul tău personal față de CANI — Îmbunătățire Constantă și Neîncetată.',
        promptEn: 'What will you do DIFFERENTLY from now on? Write your personal commitment to CANI — Constant And Never-ending Improvement.',
        type: 'paragraph',
      },
    ],
    aiCoachingPrompt: `Ești un coach transformațional pentru Ziua 30 a Personal Power Plus. Focus: Identitate, standarde și angajament CANI.

Aceasta este ULTIMA ZI a programului. Fă-o memorabilă.

Rolul tău (Ziua 30 — Angajamentul CANI):
1. Ajută-l să reflecteze asupra cine a DEVENIT — nu doar ce a învățat, ci cine ESTE acum
2. Blochează identitatea nouă, standardele și angajamentele
3. Identifică standardele sau practicile pe care REFUZĂ să le lase să cadă
4. Creează un angajament puternic față de CANI
5. Încheie cu o celebrare și o provocare: „Aceasta nu este sfârșitul — este ÎNCEPUTUL cine devii."`,
    aiCoachingPoints: [
      'Reflectează asupra cine ai DEVENIT, nu doar ce ai învățat',
      'Blochează identitatea nouă și standardele',
      'Ce standarde REFUZI să le lași să cadă?',
      'Angajamentul tău personal față de CANI',
    ],
    aiCoachingReminder: 'Aceasta nu este sfârșitul — este ÎNCEPUTUL cine devii. Maestria nu se construiește în 30 de zile — se construiește prin practică zilnică.',
    doListTasks: [
      'Scrie cine ai DEVENIT în 30 de zile',
      'Stabilește standardele pe care refuzi să le lași să cadă',
      'Scrie angajamentul tău față de CANI',
    ],
    breakthroughPrompt: 'Ce ai devenit în aceste 30 de zile? Ce standarde refuzi să le lași să cadă? Care este angajamentul tău față de CANI?',
    breakthroughPromptEn: 'What have you become in these 30 days? What standards do you refuse to let slip? What is your commitment to CANI?',
  },
];
