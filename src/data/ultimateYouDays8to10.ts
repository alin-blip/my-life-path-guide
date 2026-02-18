import { UltimateYouDay } from './ultimateYouContent';

export const ultimateYouDays8to10: UltimateYouDay[] = [
  {
    day: 8,
    title: 'Atelierul de Obiective',
    titleEn: 'The Goal-Setting Workshop',
    quote: '"Oamenii cu obiective reușesc pentru că știu încotro se îndreaptă."',
    quoteAuthor: 'Earl Nightingale',
    definitions: [
      {
        term: 'Testul Balansoarului',
        definition: 'Imaginează-te la 85 de ani, stând pe un balansoar, reflectând asupra vieții tale. Ce ai face diferit? Ce ai regreta că nu ai încercat?',
      },
      {
        term: 'Cele 3 Categorii de Obiective',
        definition: 'Dezvoltare Personală (cine vrei să devii), Lucruri/Aventuri (ce vrei să faci și să ai), Economic/Financiar (ce vrei să câștigi și să investești).',
      },
    ],
    lessonContent: `## Ziua 8 — Atelierul de Obiective: Cum să Creezi un Viitor Convingător

Obiectivele au două componente importante:

1. **Identificarea obiectivelor** — Ce vrei cu adevărat?
2. **Identificarea scopului** — De ce vrei asta?

Când identifici scopul din spatele obiectivelor tale, creezi ceea ce numim un **viitor convingător** — o viziune atât de puternică încât te trage spre ea în loc să trebuiască să te împingi singur.

### Cele 3 Categorii de Obiective

Obiectivele tale se împart în trei categorii mari:

**1. Dezvoltare Personală** — Cine vrei să devii?
Ce abilități vrei să înveți? Ce fel de persoană vrei să fii? Ce calități vrei să dezvolți? Gândește-te la tot ceea ce vrei să devii: mai disciplinat, mai empatic, mai curajos, mai spiritual.

**2. Lucruri și Aventuri** — Ce vrei să faci și să ai?
Ce experiențe vrei să trăiești? Unde vrei să călătorești? Ce vrei să construiești sau să cumperi? Ce obiecte materiale îți dorești? Dar nu te opri la lucruri — include și aventuri, experiențe unice și momente memorabile.

**3. Economic/Financiar** — Ce vrei să câștigi?
Cât vrei să câștigi? Cât vrei să economisești? Ce investiții vrei să faci? Ce moștenire financiară vrei să lași?

### Exercițiu: Brainstorming de Obiective

Ia o foaie de hârtie (sau folosește câmpurile de mai jos) și nu te opri din scris timp de cel puțin 10-15 minute. Scrie orice obiectiv care îți vine în minte, fără cenzură, fără judecată. Cantitatea contează mai mult decât calitatea în acest moment.

### Timeline-uri

După ce ai lista, atribuie fiecare obiectiv unui timeline:
- **1 an** — Ce vrei să realizezi în următorul an?
- **3 ani** — Ce vrei să realizezi în următorii 3 ani?
- **5 ani** — Ce vrei să realizezi în următorii 5 ani?
- **10 ani** — Ce vrei să realizezi în următorii 10 ani?
- **20 de ani** — Ce vrei să realizezi în următorii 20 de ani?

### Testul Balansoarului (Rocking Chair Test)

Imaginează-te la 85 de ani, stând pe un balansoar pe verandă, reflectând asupra întregii tale vieți. Privind în urmă:

- Ce ai face diferit?
- Ce risc ai fi vrut să-l asumi?
- Ce experiență ai fi vrut să o trăiești?
- Ce relație ai fi vrut să o aprofundezi?
- Ce regrete ai vrea să eviți?

Folosește acest test pentru a-ți valida obiectivele. Dacă un obiectiv trece "Testul Balansoarului" — adică l-ai regreta dacă nu l-ai fi urmărit — atunci este un obiectiv care contează cu adevărat.

### Selectează Top 3

Din fiecare categorie, alege **cele mai importante 3 obiective**. Pentru fiecare:
1. Scrie un paragraf despre **DE CE** vrei acest obiectiv — cu cât motivele sunt mai emoționale și mai personale, cu atât mai puternică va fi motivația ta.
2. Ia **o acțiune imediată** — un telefon, un email, o comandă, o înscriere — orice te mișcă în direcția obiectivului.

> **Nu părăsi niciodată locul în care ai stabilit un obiectiv fără a lua vreo acțiune în direcția lui.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Scrie cel puțin 5 obiective de Dezvoltare Personală (cine vrei să devii, ce abilități vrei să înveți):',
        promptEn: 'Write at least 5 Personal Development goals (who you want to become, what skills you want to learn):',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Scrie cel puțin 5 obiective de Lucruri/Aventuri (ce vrei să faci, să ai, să experimentezi):',
        promptEn: 'Write at least 5 Things/Adventures goals (what you want to do, have, experience):',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Scrie cel puțin 5 obiective Economice/Financiare (ce vrei să câștigi, să economisești, să investești):',
        promptEn: 'Write at least 5 Economic/Financial goals (what you want to earn, save, invest):',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Alege TOP 3 obiective din TOATE categoriile și scrie DE CE le vrei (motivele tale profunde, emoționale):',
        promptEn: 'Choose your TOP 3 goals from ALL categories and write WHY you want them (your deep, emotional reasons):',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Pentru fiecare din cele 3 obiective de top, scrie O ACȚIUNE IMEDIATĂ pe care o vei face astăzi:',
        promptEn: 'For each of your top 3 goals, write ONE IMMEDIATE ACTION you will take today:',
        type: 'list',
        listCount: 3,
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 8 of The Ultimate YOU. Today's lesson: The Goal-Setting Workshop — identifying goals across 3 categories (Personal Development, Things/Adventures, Economic/Financial), timelines, the Rocking Chair Test, and selecting Top 3 goals with reasons and immediate actions.

The user should have written goals in 3 categories, selected Top 3, written emotional reasons, and committed to immediate actions.

Your job is to:
1. Review their goals — are they SPECIFIC enough? Vague goals create vague results.
2. Check the Rocking Chair Test: would they truly regret not pursuing these? If not, challenge them to dig deeper.
3. Explore their WHY — are the reasons emotional and personal, or intellectual and generic? The deeper the WHY, the stronger the drive.
4. Make sure their immediate actions are truly IMMEDIATE (today!) and specific.
5. Challenge them: Are they playing too small? What would they write if they knew they couldn't fail?

IMPORTANT: Respond in Romanian. Be visionary, challenging and supportive. Use "tu" form.`,

    aiCoachingPoints: [
      'Verifică specificitatea obiectivelor — vagi = rezultate vagi',
      'Aplică Testul Balansoarului pe Top 3',
      'Aprofundează motivele — emoționale vs. intelectuale',
      'Asigură-te că acțiunile imediate sunt specifice și fezabile ASTĂZI',
    ],

    aiCoachingReminder: 'Nu părăsi niciodată locul în care ai stabilit un obiectiv fără a lua vreo acțiune. Obiectivele fără acțiune sunt doar vise.',

    doListTasks: [
      'Brainstorming obiective pe 3 categorii (min. 15 total)',
      'Atribuie timeline-uri fiecărui obiectiv',
      'Selectează Top 3 obiective cu motive emoționale',
      'Ia o acțiune imediată per obiectiv',
    ],

    breakthroughPrompt: 'Ce obiectiv ai descoperit că este cu adevărat important pentru tine — și ce te-a oprit să-l urmărești până acum?',
    breakthroughPromptEn: 'What goal did you discover is truly important to you — and what has stopped you from pursuing it until now?',
  },

  {
    day: 9,
    title: 'Cele 6 Nevoi Umane',
    titleEn: 'The 6 Human Needs',
    quote: '"Un muzician trebuie să facă muzică, un artist trebuie să picteze, un poet trebuie să scrie, dacă vrea în cele din urmă să fie în pace cu sine însuși."',
    quoteAuthor: 'Abraham H. Maslow',
    definitions: [
      {
        term: 'Cele 4 Clase de Experiență',
        definition: 'Class 1: Iubești și ești bun la asta. Class 2: Nu iubești dar ești bun. Class 3: Iubești dar nu ești bun. Class 4: Nici nu iubești, nici nu ești bun.',
      },
      {
        term: 'Cele 6 Nevoi Umane',
        definition: 'Certitudine, Varietate/Incertitudine, Semnificație, Conexiune/Iubire, Creștere și Contribuție — forțele motrice din spatele tuturor comportamentelor umane.',
      },
    ],
    lessonContent: `## Ziua 9 — Forța Motrice: Cele 6 Nevoi Umane

### Cele 4 Clase de Experiență

Fiecare activitate pe care o facem se încadrează în una din aceste patru clase:

| Clasă | Descriere | Exemplu |
|-------|-----------|---------|
| **Class 1** | Iubești să o faci ȘI ești bun/bună la ea | Pasiunea ta care produce și rezultate |
| **Class 2** | NU iubești să o faci DAR ești bun/bună | Sarcini la serviciu pe care le faci bine dar nu te entuziasmează |
| **Class 3** | Iubești să o faci DAR NU ești bun/bună | Hobby-uri noi, lucruri la care ești pasionat dar începător |
| **Class 4** | Nici NU iubești, nici NU ești bun/bună | Sarcini pe care le eviți complet |

**Secretul:** Transformă experiențele de Class 2 în Class 1. Cum? Prin schimbarea asocierilor tale — conectează plăcere și sens la activitățile pe care le faci bine dar nu le iubești.

### Cele 6 Nevoi Umane

Totul ce facem în viață este condus de nevoia de a satisface **6 nevoi umane fundamentale**. Primele 4 sunt nevoile de bază (toată lumea găsește o modalitate de a le satisface). Ultimele 2 sunt nevoile spiritului.

**1. Certitudine / Confort**
Nevoia de siguranță, stabilitate, securitate, confort, ordine, predictibilitate și control. Vrem să știm că putem evita durerea și, ideal, câștiga plăcere.

**2. Varietate / Incertitudine**
Nevoia de necunoscut, schimbare, stimuli noi, surpriză. Dacă am ști exact ce se va întâmpla — când, cum, unde — am fi plictisiți de moarte. Avem nevoie de surprize pozitive.

**3. Semnificație**
Nevoia de a ne simți unici, speciali, importanți, necesari. Toată lumea are nevoie să simtă că viața ei contează — că este importantă pentru cineva sau pentru ceva.

**4. Conexiune / Iubire**
Nevoia de legături profunde cu alți oameni. Toată lumea are nevoie de conexiune, dar nu toată lumea este dispusă să fie vulnerabilă pentru a experimenta iubirea autentică.

**5. Creștere**
Totul în viață fie crește, fie moare — nu există stagnare. Nevoia de dezvoltare continuă, de a deveni mai mult, de a-ți extinde capacitățile.

**6. Contribuție**
Nevoia de a contribui dincolo de noi înșine — de a face o diferență în viețile altora. Secretul trăirii este dăruirea.

### Cum Funcționează

Orice lucru pe care îl faci care satisface cel puțin **3 din cele 6 nevoi** la un nivel înalt va deveni o **dependență** — fie pozitivă, fie negativă. De aceea anumite comportamente sunt atât de greu de schimbat: ele satisfac nevoi profunde.

Cheia este să găsești modalități **sănătoase și constructive** de a-ți satisface toate cele 6 nevoi, în loc de modalități distructive.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Scrie o activitate pe care o IUBEȘTI să o faci și ești bun/bună la ea (Class 1). Evaluează cât de mult satisface fiecare din cele 6 nevoi (0-10):',
        promptEn: 'Write an activity you LOVE doing and are good at (Class 1). Rate how much it satisfies each of the 6 needs (0-10):',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Scrie o activitate pe care NU o iubești dar ești bun/bună la ea (Class 2). Evaluează cele 6 nevoi (0-10). Ce nevoi NU sunt satisfăcute?',
        promptEn: 'Write an activity you DON\'T love but are good at (Class 2). Rate the 6 needs (0-10). Which needs are NOT met?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Cum poți transforma activitatea de Class 2 în Class 1? Ce ai putea schimba pentru a satisface nevoile lipsă?',
        promptEn: 'How can you transform the Class 2 activity into Class 1? What could you change to meet the missing needs?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 9 of The Ultimate YOU. Today's lesson: The 4 Classes of Experience and The 6 Human Needs (Certainty, Variety, Significance, Connection/Love, Growth, Contribution).

The user should have evaluated a Class 1 and Class 2 activity against the 6 needs, and brainstormed how to transform Class 2 into Class 1.

Your job is to:
1. Analyze their Class 1 activity — which needs does it satisfy most? This reveals their PRIMARY needs.
2. Identify the gap in their Class 2 activity — which needs are missing? This explains why they don't enjoy it.
3. Help them create a specific strategy to add the missing needs to the Class 2 activity.
4. Challenge them to think about which needs they prioritize in life — are they healthy or potentially destructive?
5. Explore: any behavior that satisfies 3+ needs at a high level becomes an addiction. Are there any negative addictions they can now understand through this lens?

IMPORTANT: Respond in Romanian. Be analytical, insightful and practical. Use "tu" form.`,

    aiCoachingPoints: [
      'Analizează care nevoi sunt dominante în Class 1',
      'Identifică nevoile lipsă din Class 2',
      'Creează strategie specifică de transformare Class 2 → Class 1',
      'Explorează dependențe negative prin prisma celor 6 nevoi',
    ],

    aiCoachingReminder: 'Orice satisface 3+ nevoi la nivel înalt devine dependență. Cheia: găsește modalități sănătoase de a satisface toate cele 6 nevoi.',

    doListTasks: [
      'Evaluează activități Class 1 și Class 2 pe cele 6 nevoi',
      'Identifică nevoile tale dominante',
      'Creează plan de transformare Class 2 → Class 1',
    ],

    breakthroughPrompt: 'Ce ai descoperit despre nevoile tale umane dominante? Cum influențează ele alegerile și comportamentele tale zilnice?',
    breakthroughPromptEn: 'What did you discover about your dominant human needs? How do they influence your daily choices and behaviors?',
  },

  {
    day: 10,
    title: 'Metoda de Planificare Rapidă (RPM)',
    titleEn: 'The Rapid Planning Method (RPM)',
    quote: '"Drumul spre a începe este să nu mai vorbești și să începi să faci."',
    quoteAuthor: 'Walt Disney',
    definitions: [
      {
        term: 'RPM',
        definition: 'R = Results (Ce dorești?), P = Purpose (De ce dorești asta?), M = MAP — Massive Action Plan (Ce trebuie să faci pentru a obține?). Un sistem de planificare focalizat pe rezultate, nu pe activități.',
      },
      {
        term: 'Chunking',
        definition: 'Gruparea informațiilor și sarcinilor în categorii logice pentru a reduce stresul și a crește eficiența. Mintea lucrează cel mai bine când organizează informația în "bucăți" gestionabile.',
      },
    ],
    lessonContent: `## Ziua 10 — Metoda de Planificare Rapidă (RPM): Mai Mult Timp pentru Ce Contează

### Ce Este Timpul?

Timpul este un **sentiment**, nu o cantitate. Ai avut vreodată o zi de 8 ore care a părut că durează 2 ore? Sau o oră care a părut că durează toată ziua? Timpul nu se schimbă — percepția ta se schimbă.

Majoritatea oamenilor trăiesc ca și cum timpul este ceva ce se **întâmplă cu ei**, nu ceva ce pot **controla**. Dar adevărul este: poți schimba experiența timpului prin schimbarea focalizării și a stării tale.

### Problema cu Lista de Sarcini

Majoritatea oamenilor operează cu o "to-do list" — o listă de sarcini. Problema? **O to-do list te focalizează pe activități, nu pe rezultate.** Poți bifa 20 de sarcini și să simți că nu ai realizat nimic semnificativ.

### Cele 3 Întrebări RPM

RPM este un sistem care te focalizează pe ce contează cu adevărat prin 3 întrebări simple:

**R — Result (Rezultat)**
> Ce doresc cu adevărat? Care este rezultatul specific pe care vreau să-l obțin?

**P — Purpose (Scop)**
> De ce doresc acest rezultat? Care sunt motivele profunde?

Motivele vin întâi. Răspunsurile vin după. Când ai suficiente motive, găsești întotdeauna o cale.

**M — MAP (Massive Action Plan)**
> Ce trebuie să fac pentru a obține acest rezultat? Care sunt acțiunile specifice?

### Puterea Chunking-ului

Chunking înseamnă gruparea informațiilor în categorii logice. În loc să ai o listă de 50 de sarcini neorganizate (care te copleșesc), le grupezi în 5-8 **categorii** sau **domenii de viață**.

De exemplu:
- **Sănătate și Energie** → Obiective și acțiuni legate de corp
- **Relații** → Familie, partener, prieteni
- **Carieră/Business** → Proiecte, obiective profesionale
- **Finanțe** → Economii, investiții, venituri
- **Dezvoltare Personală** → Învățare, creștere
- **Contribuție** → Cum ajuți pe alții

### RPM Block — Exemplu

Iată un exemplu complet de RPM Block:

| Element | Detalii |
|---------|---------|
| **RESULT** | Slăbesc 7 kg și mă simt sănătos, energic și vital până pe 1 iunie |
| **PURPOSE** | Merit asta; vreau să arăt și să mă simt extraordinar; să am energie pentru tot ce vreau să realizez; să am mai mult de oferit celorlalți; să fiu mândru de cine sunt |
| **MAP** | 1) Scot și conectez aparatul de exerciții (15 min) |
| | 2) Cumpăr echipament sport motivant (1h) |
| | 3) Rog un prieten să fie partenerul meu de antrenament (10 min) |
| | 4) Programez 5 dimineți pe săptămână pentru exerciții (10 min) |
| | 5) Creez 2 playlist-uri de antrenament (45 min) |

> **Regula 80/20:** 20% din acțiunile tale îți aduc de obicei 80% din rezultat. Identifică acțiunile cele mai importante și focalizează-te pe ele.

### Aplică RPM în Viața Ta

Identifică **6-8 domenii importante** ale vieții tale. Pentru fiecare domeniu, creează un RPM Block:
1. **Rezultat** la 90 de zile, 30 de zile și pentru săptămâna aceasta
2. **Motive** — De ce este important acest rezultat?
3. **2-3 Acțiuni** specifice pe care le poți lua imediat`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Identifică 6-8 domenii importante ale vieții tale (ex: Sănătate, Relații, Carieră, Finanțe, Dezvoltare Personală, Contribuție, Distracție, Spiritualitate):',
        promptEn: 'Identify 6-8 important areas of your life (e.g., Health, Relationships, Career, Finances, Personal Development, Contribution, Fun, Spirituality):',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Alege PRIMUL domeniu și creează un RPM Block complet: Rezultat (la 90 zile, 30 zile, săptămâna asta) + Motive + 2-3 Acțiuni:',
        promptEn: 'Choose the FIRST area and create a complete RPM Block: Result (90 days, 30 days, this week) + Reasons + 2-3 Actions:',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Creează un RPM Block pentru AL DOILEA domeniu cel mai important:',
        promptEn: 'Create an RPM Block for the SECOND most important area:',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Creează un RPM Block pentru AL TREILEA domeniu:',
        promptEn: 'Create an RPM Block for the THIRD area:',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 10 of The Ultimate YOU. Today's lesson: RPM (Result, Purpose, MAP), Chunking, and creating RPM Blocks for life areas.

The user should have identified 6-8 life areas and created RPM Blocks for at least 3 of them.

Your job is to:
1. Review their life areas — are they comprehensive? Are any critical areas missing?
2. Check each RPM Block — is the Result SPECIFIC and measurable? Are the Reasons emotional and compelling?
3. Evaluate the MAP — are the actions concrete and immediate? Apply the 80/20 rule: which 20% of actions will produce 80% of results?
4. Help them prioritize — which RPM Block, if accomplished, would have the biggest positive impact on ALL other areas?
5. Challenge them to commit to ONE action from their MAP that they will do TODAY.

IMPORTANT: Respond in Romanian. Be strategic, organized and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Verifică dacă domeniile de viață sunt comprehensive',
      'Evaluează specificitatea rezultatelor din RPM Blocks',
      'Aplică regula 80/20 pe MAP — care 20% aduc 80%?',
      'Identifică RPM Block-ul cu cel mai mare impact',
    ],

    aiCoachingReminder: 'RPM: Result (ce dorești), Purpose (de ce), MAP (cum). Motivele vin întâi, răspunsurile vin după. 20% din acțiuni aduc 80% din rezultate.',

    doListTasks: [
      'Identifică 6-8 domenii de viață',
      'Creează RPM Blocks pentru cele mai importante 3 domenii',
      'Aplică regula 80/20 pe fiecare MAP',
      'Ia o acțiune imediată din fiecare RPM Block',
    ],

    breakthroughPrompt: 'Cum a schimbat RPM felul în care te gândești la planificare? Ce diferență vezi între o "to-do list" și un RPM Block?',
    breakthroughPromptEn: 'How has RPM changed the way you think about planning? What difference do you see between a to-do list and an RPM Block?',
  },
];
