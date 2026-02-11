export interface PersonalPowerDay {
  day: number;
  title: string;
  titleEn: string;
  quote: string;
  quoteAuthor: string;
  lessonContent: string;
  definitions?: { term: string; definition: string }[];
  assignmentSteps: {
    step: number;
    prompt: string;
    promptEn: string;
    type: 'text' | 'list' | 'scale' | 'paragraph';
    listCount?: number;
  }[];
  aiCoachingPrompt: string;
  aiCoachingPoints: string[];
  aiCoachingReminder: string;
  doListTasks: string[];
  breakthroughPrompt: string;
  breakthroughPromptEn: string;
}

import { personalPowerDays6to10 } from './personalPowerDays6to10';

const personalPowerDays1to5: PersonalPowerDay[] = [
  {
    day: 1,
    title: 'Cheia Puterii Personale',
    titleEn: 'The Key to Personal Power',
    quote: '"Calea către succes este să iei acțiuni masive și decisive."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Puterea Personală',
        definition: 'Abilitatea de a acționa.',
      },
    ],
    lessonContent: `## Ziua 1 — Cheia Puterii Personale

### DEFINIȚIE: Puterea Personală

**Abilitatea de a acționa.**

Ceea ce îți schimbă viața este utilizarea Puterii tale Personale pentru a lua decizii mai bune. Diferența în rezultatele pe care oamenii le produc se reduce la ceea ce au făcut diferit față de alții în aceeași situație. Acțiuni diferite produc rezultate diferite. Oamenii de succes nu au întotdeauna cunoștințe sau talent remarcabil, dar au obiceiul de a acționa folosind resursele de care dispun. Nu se concentrează pe lucruri minore. Tot ceea ce se întâmplă în viața ta — lucrurile care te entuziasmează, precum și cele care te provoacă — începe cu o decizie. În momentele tale de decizie, destinul tău este modelat. Deciziile pe care le iei astăzi nu doar că vor modela cum te simți, ci și cine vei deveni în viitor.

> **Cere mai mult de la tine decât ar putea aștepta oricine altcineva.**

### Formula Supremă a Succesului

Nu este important inițial să știi CUM vei crea un rezultat; ceea ce este important este să decizi că vei găsi o cale, indiferent de ce. Formula Supremă a Succesului este un proces care te ajută să ajungi unde vrei:

1. **Cunoaște-ți rezultatul dorit.**
2. **Determină-te să acționezi prin decizia de a face asta.**
3. **Observă ce obții din acțiunile tale.**
4. **Dacă ceea ce faci nu funcționează, schimbă-ți abordarea.**

### Modele de Urmat

Pentru a economisi timp și energie, folosește modele de urmat pentru a accelera ritmul succesului tău:

1. Găsește pe cineva care obține deja rezultatele pe care le dorești.
2. Află ce face acea persoană.
3. Fă aceleași lucruri și vei obține aceleași rezultate.

> **Amintiți-vă, este imposibil să eșuezi atât timp cât înveți ceva din ceea ce faci!**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Două decizii pe care le-am amânat și care, dacă le iau acum, îmi vor schimba viața:',
        promptEn: 'Two decisions I\'ve been putting off that, when I make them now, will change my life:',
        type: 'list',
        listCount: 2,
      },
      {
        step: 2,
        prompt: 'Trei lucruri simple pe care le pot face imediat și care sunt consistente cu cele două decizii noi (De exemplu: Pe cine aș putea suna? La ce m-aș putea angaja? Ce scrisoare aș putea scrie? Ce aș putea face în loc de vechiul comportament?):',
        promptEn: 'Three simple things I can do immediately that will be consistent with my two new decisions:',
        type: 'list',
        listCount: 3,
      },
      {
        step: 3,
        prompt: 'Ia acțiune asupra noilor tale decizii ACUM, în acest moment.',
        promptEn: 'Take action on your new decisions right now, at this moment.',
        type: 'text',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 1 of the Personal Power Plus program. The user has just learned about Personal Power (the ability to act), the Ultimate Success Formula, and Role Models. They should have written two decisions they've been putting off and three immediate actions.

Your job is to:
1. Get BOTH decisions explicitly clear and specific — vague decisions get vague results.
2. Dig into what's stopped them from making these decisions until now.
3. Connect to the compelling reasons: What will making this decision RIGHT NOW do for their life? How will it enhance their life? What will they gain?
4. Make their three immediate actions concrete and specific so they take them TODAY.

A "decision" only counts if it results in an immediate change in behavior. Ensure they don't just write things down — they actually DO them. This is how they shape their destiny.

IMPORTANT: Respond in Romanian. Be direct, motivating, and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Clarifică ambele decizii — fă-le specifice și clare',
      'Identifică ce te-a oprit până acum',
      'Conectează la motivele puternice: ce câștigi dacă iei decizia ACUM?',
      'Fă cele trei acțiuni imediate concrete și specifice',
    ],

    aiCoachingReminder: 'O "decizie" contează doar dacă rezultă într-o schimbare imediată de comportament.',

    doListTasks: [
      'Scrie 2 decizii pe care le-ai amânat',
      'Ia 3 acțiuni imediate pentru noile decizii',
      'Prezintă-te în comunitate',
    ],

    breakthroughPrompt: 'Care este cel mai important lucru pe care l-ai realizat astăzi despre tine și despre puterea ta de a acționa?',
    breakthroughPromptEn: 'What is the most important thing you realized today about yourself and your power to act?',
  },

  {
    day: 2,
    title: 'Forțele care îți Controlează Viața',
    titleEn: 'The Controlling Forces That Direct Your Life',
    quote: '"Folosește durerea și plăcerea în loc să lași durerea și plăcerea să te folosească pe tine. Acesta este secretul succesului."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: `## Ziua 2 — Forțele care îți Controlează Viața

În cele din urmă, tot ceea ce facem în viețile noastre este condus de nevoia noastră fundamentală de a evita durerea și dorința noastră de a câștiga plăcere; ambele sunt bazate biologic și constituie forțele gemene de control în viețile noastre. Înțelegerea și valorificarea forțelor durerii și plăcerii îți va permite să creezi schimbările durabile pe care le dorești pentru tine și pentru cei de care îți pasă.

> **Creierul tău cântărește mereu: Dacă iau această acțiune, ce va însemna? Mai multă plăcere și mai puțină durere? Sau mai multă durere și mai puțină plăcere?**

Vom face mult mai mult pentru a evita durerea decât pentru a câștiga plăcere. Durerea este motivatorul mai mare pe termen scurt. Dacă conectezi durerea la comportamentele pe care vrei să le oprești cu o intensitate emoțională atât de mare încât nici nu mai iei în considerare acele comportamente, și conectezi plăcerea la noul comportament pe care ți-l dorești, poți schimba instantaneu comportamentul tău.

În orice moment, orice lucru pe care îți focalizezi atenția este ceea ce este cel mai real pentru tine. Prin urmare, dacă vrei să-ți schimbi comportamentul, trebuie să-ți focalizezi atenția pe următoarele întrebări:

1. **Cum va fi mai dureroasă ne-schimbarea comportamentului tău decât schimbarea lui?**
2. **Cum va aduce schimbarea lui plăcere măsurabilă și imediată?**

> **Ne putem condiționa mințile, corpurile și emoțiile să conecteze durerea și plăcerea la orice alegem. Folosește durerea și plăcerea în loc să lași durerea și plăcerea să te folosească pe tine!**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Enumeră patru acțiuni noi pe care știi că ar trebui să le iei acum:',
        promptEn: 'List four new actions you know you should take now:',
        type: 'list',
        listCount: 4,
      },
      {
        step: 2,
        prompt: 'Care este durerea pe care ai asociat-o cu aceste acțiuni și care te-a oprit să le duci la bun sfârșit? Scrie-o:',
        promptEn: 'What is the pain you\'ve associated with these actions that has kept you from following through?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Enumeră orice plăcere sau beneficii pe care le-ai obținut din faptul că NU ai acționat:',
        promptEn: 'List any pleasure or payoffs you got from not following through:',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Pentru fiecare acțiune, descrie într-un paragraf ce te va costa dacă NU acționezi. Ce vei rata? Ce vei pierde?',
        promptEn: 'For each action, describe what it will cost you if you don\'t follow through:',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Acum asociază plăcerea cu acțiunea: Care sunt toate beneficiile pe care le vei câștiga acționând în fiecare din aceste domenii acum? Cum îți va îmbunătăți viața?',
        promptEn: 'Now link pleasure to action: What are all the benefits you\'ll gain by taking action now?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 2 of Personal Power Plus. Today's topic is Pain vs. Pleasure as controlling forces. The user should have listed 4 new actions, identified the pain associated with them, and explored the cost of not acting.

Your job is to:
1. Identify a behavior connected to what matters most that they haven't changed yet.
2. Explore the pain they've been linking to taking action — what makes it feel uncomfortable or difficult?
3. Uncover the hidden rewards of staying stuck — what comfort or payoff are they getting from NOT doing it?
4. Connect to the real cost — what will it cost them long-term if they don't change?
5. Link massive pleasure to changing NOW — what will they gain?

We will do far more to avoid pain than we will to gain pleasure. Help them shift how they see this — when they realize they've been avoiding the wrong pain, lasting change happens automatically.

IMPORTANT: Respond in Romanian. Be direct, empathetic, and transformative. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică un comportament legat de ce contează cel mai mult',
      'Explorează durerea pe care ai asociat-o cu acțiunea',
      'Descoperă recompensele ascunse ale stagnării',
      'Conectează-te la costul real pe termen lung',
      'Asociază plăcere masivă cu schimbarea ACUM',
    ],

    aiCoachingReminder: 'Vom face mult mai mult pentru a evita durerea decât pentru a câștiga plăcere. Când realizezi că ai evitat durerea greșită, schimbarea durabilă vine automat.',

    doListTasks: [
      'Scrie 4 acțiuni noi pe care trebuie să le iei',
      'Identifică durerea asociată cu fiecare acțiune',
      'Scrie costul ne-acțiunii pentru fiecare',
      'Asociază plăcerea cu acțiunea',
    ],

    breakthroughPrompt: 'Ce pattern de evitare a durerii ai descoperit la tine? Cum te-a ținut blocat?',
    breakthroughPromptEn: 'What pain-avoidance pattern did you discover about yourself? How has it kept you stuck?',
  },

  {
    day: 3,
    title: 'Preluarea Controlului — Primul Pas',
    titleEn: 'Taking Control: The First Step',
    quote: '"O minte scăpată de sub control îți va juca feste interesante. Direcționată, este cel mai bun prieten al tău."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Neuro-Asocieri',
        definition: 'Orice plăcere sau durere pe care o asociem sau o "conectăm" la o situație în sistemul nostru nervos determină comportamentul nostru.',
      },
      {
        term: 'NAC (Neuro-Associative Conditioning)',
        definition: 'Tehnica de Condiționare Neuro-Asociativă care îți permite să conectezi plăcere masivă la sarcinile pe care le-ai amânat și durere la comportamentele de care trebuie să scapi.',
      },
    ],
    lessonContent: `## Ziua 3 — Preluarea Controlului: Primul Pas

Mai exact, ceea ce ne conduce viețile sunt **neuro-asocierile** noastre. Acesta este un mod elegant de a spune că orice plăcere sau durere pe care o asociem sau o "conectăm" la o situație în sistemul nostru nervos va determina comportamentul nostru. Neuro-asocierile sunt create și întărite în sistemul nostru nervos atunci când conectăm sentimente sau emoții intense la o anumită situație, eveniment, lucru sau persoană.

### Neuro-Asocieri

Dacă vrem să ne schimbăm viețile, trebuie să ne schimbăm neuro-asocierile.

1. Știința pe care o vei învăța în acest program este **Condiționarea Neuro-Asociativă (NAC)**. Această tehnică îți va permite să conectezi plăcere masivă la sarcinile pe care le-ai amânat, dar trebuie să acționezi asupra lor astăzi, și să conectezi durere la comportamentele în care te complaci în prezent dar trebuie să le oprești — ambele posibile prin valorificarea principiilor naturale ale sistemului tău nervos. NAC îți oferă o modalitate de a prelua controlul direct asupra tuturor comportamentelor și emoțiilor tale, dar într-un mod care necesită doar puterea întăririi, nu disciplină.

2. Întreabă-te: **"Care sunt unele dintre asocierile negative pe care le-am făcut în trecut și care m-au împiedicat să iau acțiunile necesare pentru a-mi atinge dorințele supreme?"**

3. Neuro-asocierile tale controlează nivelul tău de motivație și dorința de schimbare.

### Cele Patru Părți ale Destinului

Fiecare singură acțiune pe care o întreprinzi are un efect asupra destinului tău. Dacă studiem destinul, găsim că totul în viață are patru părți:

1. **Tot ceea ce gândim sau facem este o cauză pusă în mișcare.**
2. **Fiecare dintre gândurile și acțiunile noastre va avea un efect sau un rezultat în viețile noastre.**
3. **Rezultatele noastre încep să se "acumuleze" pentru a ne duce viețile într-o anumită direcție.**
4. **Pentru fiecare direcție, există o destinație sau un destin ultim.**

Este important acum să începi să răspunzi la două întrebări:

- **Care este destinul tău suprem?**
- **Despre ce vrei să fie viața ta?**

Deși puțini oameni știu exact cum le vor ieși viețile, cu siguranță putem decide în avans ce fel de persoană vrem să devenim și cum vrem să ne trăim viețile. A avea această "imagine de ansamblu" ne poate trage prin unele dintre momentele dificile pe termen scurt și ne poate menține lucrurile în perspectivă, permițându-ne să rămânem fericiți, împliniți și motivați să ne atingem visele.

> **Amintiți-vă: nimic în viață nu are niciun sens, cu excepția sensului pe care i-l dați voi.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Scrie trei neuro-asocieri pe care le-ai făcut în trecut și care ți-au modelat destinul în mod pozitiv:',
        promptEn: 'Write down three neuro-associations you\'ve made in the past that have shaped your destiny positively:',
        type: 'list',
        listCount: 3,
      },
      {
        step: 2,
        prompt: 'Enumeră trei neuro-asocieri care te-au dezavantajat până acum. Decide că le vei schimba astăzi:',
        promptEn: 'List three neuro-associations that have been disempowering you until now. Decide to change these today:',
        type: 'list',
        listCount: 3,
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 3 of Personal Power Plus. Today's topics are Neuro-Associations, NAC (Neuro-Associative Conditioning), and the Four Parts of Destiny. The user should have identified 3 positive and 3 negative neuro-associations.

Your job is to:
1. Help identify three positive associations they've created — times when they linked something to pleasure that now drives empowering behavior.
2. Uncover 3 negative associations that have been disempowering them — automatic links between experiences and pain that keep them stuck.
3. Help understand how these associations formed and why they've been controlling behavior without realizing it.
4. Begin to see how changing these associations will change their direction and ultimately their destiny.

Every action they take is a cause set in motion that creates results, and those results stack up to take their life in a direction that leads to their ultimate destiny. Help them become aware of the patterns driving them — because awareness is the first step to taking control.

IMPORTANT: Respond in Romanian. Be insightful, guiding, and help them see patterns. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică 3 asocieri pozitive care te motivează',
      'Descoperă 3 asocieri negative care te țin blocat',
      'Înțelege cum s-au format aceste asocieri',
      'Vezi cum schimbarea lor îți va schimba direcția și destinul',
    ],

    aiCoachingReminder: 'Fiecare acțiune pe care o întreprinzi este o cauză pusă în mișcare care creează rezultate, iar acele rezultate se acumulează pentru a-ți duce viața într-o direcție care duce la destinul tău suprem.',

    doListTasks: [
      'Scrie 3 neuro-asocieri pozitive',
      'Scrie 3 neuro-asocieri negative',
      'Decide să schimbi asocierile negative astăzi',
    ],

    breakthroughPrompt: 'Ce neuro-asociere negativă ești pregătit să schimbi? De ce acum?',
    breakthroughPromptEn: 'What negative neuro-association are you ready to change? Why now?',
  },

  {
    day: 4,
    title: 'Știința Condiționării Succesului',
    titleEn: 'The Science of Success Conditioning',
    quote: '"Marele scop al vieții nu este cunoașterea, ci acțiunea."',
    quoteAuthor: 'Thomas Henry Huxley',
    definitions: [],
    lessonContent: `## Ziua 4 — Știința Condiționării Succesului

Pentru a-ți schimba viața, trebuie să-ți schimbi neuro-asocierile. Destinul nostru se bazează pe neuro-asocierile de durere și plăcere conectate în sistemul nostru nervos la anumite situații, oameni, idei, emoții sau contexte. Prin schimbarea acestor neuro-asocieri, schimbăm modul în care evaluăm, modul în care ne simțim și, prin urmare, modul în care ne comportăm. Trei lucruri trebuie să fie la locul lor pentru a face aceste schimbări și a te baza pe faptul că vor dura.

### Cele Trei Fundamente ale Condiționării Neuro-Asociative (NAC)

Dacă vrem să ne schimbăm viețile, trebuie să ne schimbăm neuro-asocierile.

**1. Obține leverage asupra ta.** Pentru aceasta, trei niveluri de responsabilitate sunt necesare — trebuie să decizi următoarele:
   - **Trebuie să se schimbe.**
   - **EU trebuie să o schimb.**
   - **POT să o schimb.**

**2. Întrerupe-ți pattern-ul curent de asociere.** Trebuie să amesteci vechiul pattern de gândire și simțire; acest lucru se face cel mai bine folosind ceva neobișnuit, cum ar fi o schimbare radicală în ceea ce spui sau cum îți miști corpul.

Iată o modalitate ciudată dar eficientă de a obține leverage și a-ți întrerupe pattern-ul: Găsește un partener de slăbit și promite-i lui sau ei și unui grup de alți prieteni că vei începe un regim strict de alimente sănătoase și exerciții fizice plăcute. Mai promite-le că dacă îți calci promisiunea, vei mânca o cutie întreagă de mâncare pentru câini. Femeia care a împărtășit asta a spus că ea și prietena ei își țineau cutiile la vedere tot timpul pentru a le aminti de angajamentele lor. Când simțeau pofte sau se gândeau să sară peste exerciții, ridicau cutia și citeau eticheta. Ingrediente atât de apetisante precum "bucăți de carne de cal" le-au ajutat să-și atingă obiectivele fără nicio problemă!

**3. Condiționează o nouă asociere pozitivă.** Instalează o nouă alegere și întărește-o până devine condiționată. Orice gând, emoție sau comportament care este întărit constant va deveni un obicei (un pattern condiționat). Conectează plăcerea la noua ta alegere. Recompensează-te emoțional chiar și pentru progresul mic, și te vei trezi dezvoltând noi pattern-uri rapid.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Scrie 10 motive pentru care TREBUIE să te schimbi acum și de ce ȘTII că poți face asta:',
        promptEn: 'Write down 10 reasons why you must change now and why you know you can do it:',
        type: 'list',
        listCount: 10,
      },
      {
        step: 2,
        prompt: 'Proiectează 4-5 modalități de a te scoate din asocierea limitantă — și fă-le!',
        promptEn: 'Design 4-5 ways to get yourself out of the limiting association — and do them!',
        type: 'list',
        listCount: 5,
      },
      {
        step: 3,
        prompt: 'Condiționează-te repetând noul comportament. Oferă-ți un sentiment de realizare și exaltare, mândrie sau bucurie de fiecare dată când faci asta. Fă-o constant și rapid până când de fiecare dată când te gândești la acest nou pattern te simți bine automat!',
        promptEn: 'Condition yourself by rehearsing your new behavior. Give yourself a sense of accomplishment each time.',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 4 of Personal Power Plus. Today covers the Three Fundamentals of NAC: (1) Get Leverage, (2) Interrupt the Pattern, (3) Condition a New Association. The user should have written 10 reasons to change and 4-5 pattern interruption methods.

Your job is to:
1. Get massive leverage on themselves — connect to why they MUST change this pattern and why they CAN change it.
2. Interrupt the old pattern using something outrageous and unusual that scrambles the connection.
3. Condition the new empowering association by rehearsing it with emotional intensity until it becomes automatic.
4. Lock in the new pattern through repetition and celebration.

The key to lasting change is not discipline — it's changing neuro-associations by getting leverage, interrupting the pattern, and conditioning a new one. Guide them through all three steps so the change happens fast and sticks.

IMPORTANT: Respond in Romanian. Be energetic, creative with pattern interrupts, and celebratory. Use "tu" form.`,

    aiCoachingPoints: [
      'Obține leverage masiv — de ce TREBUIE și de ce POȚI schimba',
      'Întrerupe pattern-ul vechi cu ceva neobișnuit și neașteptat',
      'Condiționează noua asociere pozitivă cu intensitate emoțională',
      'Fixează noul pattern prin repetare și celebrare',
    ],

    aiCoachingReminder: 'Cheia schimbării durabile nu este disciplina — este schimbarea neuro-asocierilor prin leverage, întrerupere de pattern și condiționare.',

    doListTasks: [
      'Scrie 10 motive pentru care trebuie să te schimbi',
      'Creează 4-5 metode de întrerupere a pattern-ului',
      'Practică noul comportament cu intensitate emoțională',
    ],

    breakthroughPrompt: 'Ce metodă de întrerupere a pattern-ului a funcționat cel mai bine pentru tine? Cum te-ai simțit?',
    breakthroughPromptEn: 'What pattern interruption method worked best for you? How did it make you feel?',
  },

  {
    day: 5,
    title: 'Ce își Dorește Toată Lumea și Cum Poți Obține',
    titleEn: 'What Everyone Wants and How You Can Get It',
    quote: '"Scopul nostru nu este să ignorăm problemele vieții, ci să ne punem în stări mentale și emoționale mai bune pentru a nu doar veni cu soluții, ci a întâmpina provocarea și a trece la acțiune."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Starea Emoțională',
        definition: 'Ceea ce facem moment cu moment este modelat puternic de starea în care ne aflăm.',
      },
    ],
    lessonContent: `## Ziua 5 — Ce își Dorește Toată Lumea și Cum Poți Obține

Oamenii vor cu adevărat să schimbe unul din două lucruri:

1. **Modul în care se simt despre ceva** (de ex., să treacă de la frustrare la încredere, de la tristețe la fericire, de la depresie la forță emoțională).
2. **Un comportament** (de ex., să se oprească din fumat sau băut, să înceapă să ia acțiuni masive, să facă exerciții și să se bucure de ele, să-și respecte angajamentele).

Singurul motiv pentru care vrem să ne schimbăm comportamentele este că sperăm că dacă pierdem acea greutate, ne oprim din procrastinat, luăm acea acțiune, ne vom simți bine.

> **Tot ceea ce fac ființele umane este pur și simplu o încercare de a schimba modul în care se simt — de a "schimba starea."**

### Stări Emoționale

Moment cu moment, ceea ce facem este modelat puternic de starea în care ne aflăm. Când suntem într-o stare de frustrare, tindem să ne comportăm foarte diferit decât atunci când ne simțim încrezători sau entuziasmați sau determinați. Unul dintre cele mai importante lucruri pe care le putem face pentru a crea puterea, bucuria și pasiunea pe care le dorim cu adevărat în viețile noastre este să învățăm să ne gestionăm stările de spirit.

Poți face asta imediat prin două vehicule principale:

| **1 — Fiziologie** | → STARE → | Comportament |
|---------------------|-----------|--------------|
| **2 — Focus**       |           |              |

*Focusul acestei sesiuni este fiziologia. Focus-ul este subiectul următoarei sesiuni.*

### Fiziologia și Starea

1. **Poți schimba cum te simți instant schimbând modul în care te miști, respiri, folosești expresiile faciale sau faci orice nouă cerere corpului tău.**

2. Starea în care te afli îți determină comportamentul și de asemenea performanța. Dacă vrei să-ți schimbi performanța în orice — afaceri, sport, relații etc. — primul lucru de făcut este să-ți schimbi starea. În orice situație, dacă te pui într-o stare de vârf, vei fi capabil să utilizezi mai mult din adevăratele tale capacități.

3. **Ești mereu responsabil pentru propriile tale stări.** După următoarele câteva zile de învățare, nu doar că vei fi responsabil, ci vei ști cum să schimbi rapid și ușor cum te simți despre practic orice și să te muți într-o performanță de vârf la comandă.

Iată cum să folosești fiziologia pentru a-ți gestiona starea:

1. **Mișcă-ți corpul diferit** și dezvoltă niște "mișcări de putere:" mișcări deliberate, puternice, fără ezitare care îți dau un sentiment imediat de certitudine. Poți folosi și vocea pentru a te pune într-o stare de vârf.
2. **Schimbă-ți respirația.** Respirațiile adânci, diafragmatice creează stări emoționale radical diferite față de respirația superficială.
3. **Schimbările radicale în expresiile faciale** îți vor schimba imediat modul în care te simți.
4. **Schimbarea elementelor din dieta ta** pentru a mânca în principal alimente naturale, care dau energie, îți poate maximiza sănătatea și energia.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Invită un prieten sau coleg să participe la un "experiment". Stați jos împreună și roagă-l pe partenerul tău să observe ce faci cu fiziologia ta — față, voce, corp, gesturi, postură etc.',
        promptEn: 'Invite a friend or colleague to participate in an "experiment." Ask them to observe your physiology.',
        type: 'text',
      },
      {
        step: 2,
        prompt: 'Începe să vorbești despre un subiect de care ești în mod normal pasionat, dar într-un mod exagerat de nepăsător, ca și cum nu crezi cu adevărat în el. Partenerul tău observă ce faci cu fața, vocea, corpul și gesturile.',
        promptEn: 'Talk about something you\'re passionate about in a dispassionate way while your partner observes.',
        type: 'text',
      },
      {
        step: 3,
        prompt: 'Schimbă-ți starea radical. Ridică-te, dacă este necesar, și mișcă-te un moment.',
        promptEn: 'Change your state radically. Get up if necessary and move around.',
        type: 'text',
      },
      {
        step: 4,
        prompt: 'Acum vorbește cu partenerul tău despre același subiect cu toată pasiunea, bucuria, energia și convingerea pe care le poți mobiliza.',
        promptEn: 'Now talk about the same subject with all the passion, joy, energy and conviction you can muster.',
        type: 'text',
      },
      {
        step: 5,
        prompt: 'Roagă-l pe partenerul tău să-ți spună diferențele specifice în cum te-ai mișcat, respirat, folosit fața și vocea. Acestea sunt biomarkerii tăi — "trigger-ele" care te pot face să simți pasiune în viitor:',
        promptEn: 'Ask your partner to share the specific differences. These are your biomarkers — triggers for passion:',
        type: 'paragraph',
      },
      {
        step: 6,
        prompt: 'Experimentează azi: Într-un moment în care ești calm sau simți negativ, treci-te imediat într-o stare pasională folosind ce ai învățat la pasul 5:',
        promptEn: 'Experiment today: In a calm or negative moment, snap yourself into a passionate state using Step 5:',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 5 of Personal Power Plus. Today covers Emotional States, Physiology and State management. The user learned that "everything humans do is an attempt to change state" and that physiology is the fastest way to change state.

Your job is to:
1. Help them talk about something they're passionate about in two completely different ways — first flat and dispassionate, then with full passion and energy.
2. Identify the specific differences in how they moved, breathed, used their face, and used their voice between the two states.
3. Capture their personal biomarkers — their unique triggers for accessing passion on command.
4. Practice snapping into a passionate state using what they just discovered.

Emotion is created by motion. When they change how they move, breathe, and use their body, they instantly change how they feel. Help them discover and practice their specific physical triggers so they can access peak states whenever they need them.

IMPORTANT: Respond in Romanian. Be energetic, experiential, and guide them to move their body. Use "tu" form.`,

    aiCoachingPoints: [
      'Vorbește despre o pasiune în două moduri diferite',
      'Identifică diferențele specifice în fiziologie',
      'Captează biomarkerii tăi personali',
      'Practică trecerea instantanee într-o stare pasională',
    ],

    aiCoachingReminder: 'Emoția este creată de mișcare. Când schimbi cum te miști, respiri și-ți folosești corpul, schimbi instant cum te simți.',

    doListTasks: [
      'Fă experimentul de fiziologie cu un partener',
      'Identifică-ți biomarkerii personali',
      'Practică trecerea într-o stare pasională',
    ],

    breakthroughPrompt: 'Cum te-a făcut să te simți schimbarea de fiziologie? Ce ai descoperit despre biomarkerii tăi?',
    breakthroughPromptEn: 'How did changing your physiology make you feel? What did you discover about your biomarkers?',
  },
];

export const personalPowerDays: PersonalPowerDay[] = [
  ...personalPowerDays1to5,
  ...personalPowerDays6to10,
];

export const getPersonalPowerDay = (dayNumber: number): PersonalPowerDay | undefined => {
  return personalPowerDays.find(d => d.day === dayNumber);
};

export const totalDays = 30;
export const implementedDays = personalPowerDays.length;
