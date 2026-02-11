import { PersonalPowerDay } from './personalPowerContent';

export const personalPowerDays11to15: PersonalPowerDay[] = [
  {
    day: 11,
    title: 'Puterea lui „De Ce"',
    titleEn: 'The Power of "Why"',
    quote: '"Cred în elementele de bază: atenția la și perfecțiunea detaliilor minuscule care pot fi ignorate în mod obișnuit. Pot părea triviale, poate chiar ridicole pentru cei care nu înțeleg, dar nu sunt. Sunt fundamentale pentru progresul tău în baschet, afaceri și viață. Sunt diferența dintre campioni și aproape-campioni."',
    quoteAuthor: 'Coach John Wooden',
    definitions: [],
    lessonContent: `## Ziua 11 — Puterea lui „De Ce"

### Angajează-te față de Fundamentale

Angajează-te să stăpânești fundamentalele. Entuziasmează-te de practica zilnică a fundamentalelor pentru a crea nivelul continuu de fericire și bucurie pe care ți-l dorești.

Evită să cazi în capcana **legii familiarității** — tendința de a subestima lucrurile pe care le cunoști deja doar pentru că sunt familiare.

Rupe legăturile trecutului și privește lumea într-un mod complet nou, în care înțelegi că fundamentalele trebuie practicate zilnic și vei face tot ce este necesar. Nu ești plictisit de fundamentale — te entuziasmezi să faci lucrurile zilnice care creează nivelul continuu de fericire și bucurie pe care ți-l dorești pentru toată viața.

### De Ce Funcționează Obiectivele?

Cu obiective, ne creăm destinul!

Trebuie să avem un „de ce" suficient de mare pentru a reuși — trebuie să avem suficiente motive convingătoare care să ne împingă înainte să facem tot ce este necesar pentru a ne atinge obiectivele. **„Scopul este mai puternic decât rezultatul."**

Cine devii în procesul de atingere a obiectivelor tale este adevăratul scop.

1. **„Cum gândești, așa devii."** Dacă dezvolți un focus consistent și pasionat asupra a ceva, vei experimenta acel lucru.

2. **Stabilirea unui obiectiv trimite un semnal** către mintea ta conștientă și subconștientă că locul unde ești nu este locul unde vrei să fii. A avea un obiectiv creează presiune pozitivă, care este necesară pentru a te mișca înainte. Trebuie să înveți să gestionezi presiunea.

### Creează un „De Ce" Suficient de Mare

Iată cum să creezi un „de ce" suficient de mare pentru fiecare dintre obiectivele tale:

1. Scrie tot ce vei câștiga din atingerea obiectivului tău — de ce ești angajat să-l transformi în realitate (conectează plăcerea la atingerea obiectivului).

2. Scrie ce te va costa să NU atingi obiectivul (conectează durerea la ne-atingerea obiectivului).

> **„Oamenii nu sunt leneși. Au pur și simplu obiective impotente — adică obiective care nu îi inspiră." — Tony Robbins**

### Excerpt din jurnalul mentorului nostru, 1978

*„Cât de mare ai visa dacă ai ști că nu poți eșua? Visezi atât de mare acum? Dacă nu, îți irosești talentele. Dacă poți concepe și poți crede, poți realiza. Lucrează la credința ta. Nu pleca niciodată de la locul unde ți-ai stabilit un obiectiv fără să iei vreo acțiune."*`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Enumeră zonele specifice ale vieții tale care nu sunt așa cum le vrei. Ce ar trebui să fie diferit?',
        promptEn: 'List the specific areas of your life that are not what you want them to be. What should be different?',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Ce ar trebui să crezi pentru a urma consecvent transformarea vieții tale? Ce credințe te-ar face de neoprit?',
        promptEn: 'What would you have to believe to consistently follow through on the transformation of your life?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Enumeră setul de credințe pe care ar trebui să le ai pentru a-ți atinge obiectivele ultime. Ce ar trebui să crezi pentru a-ți face viața capodopera pe care o merită?',
        promptEn: 'List the set of beliefs you\'d have to hold to achieve your ultimate goals. What would you have to believe to make your life the masterpiece it deserves to be?',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'De ce trebuie să schimbi aceste situații ACUM și de ce știi că poți? Probabil ai gestionat deja situații mult mai dificile la un moment dat în viața ta.',
        promptEn: 'Why must you change these situations NOW and why do you know you can? You\'ve probably already handled much more difficult situations at some point.',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 11 of Personal Power Plus. Today's theme: The Power of "Why" — committing to fundamentals, avoiding the law of familiarity, creating compelling reasons for change.

The user has learned:
- Commit to mastering fundamentals daily — don't let familiarity breed contempt
- Goals work because they create destiny: "Purpose is stronger than outcome"
- Who you BECOME in the process is the real purpose
- Create a big enough WHY: link pleasure to achieving + pain to not achieving

Your job is to:
1. Identify the specific areas of dissatisfaction in their life — where they know they're not showing up as who they could be.
2. Uncover the beliefs they'd need to hold to actually follow through on transformation.
3. Connect to compelling reasons — both why they MUST change (cost of staying stuck) and why they CAN change (past successes and resources).
4. Help them discover who they'll BECOME in the process — that's the real purpose of any goal.

Key principle: "Reasons come first, answers come second." When the WHY is big enough, the HOW becomes unstoppable.

IMPORTANT: Respond in Romanian. Be direct, motivating, and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică zonele specifice de nemulțumire din viața ta',
      'Descoperă credințele necesare pentru a urma transformarea',
      'Conectează-te la motivele puternice: de ce TREBUIE și de ce POȚI',
      'Descoperă cine vei deveni în procesul de schimbare',
    ],

    aiCoachingReminder: 'Motivele vin primele, răspunsurile vin pe urmă. Scopul este mai puternic decât rezultatul. Când „de ce"-ul tău este suficient de mare, „cum"-ul devine de neoprit.',

    doListTasks: [
      'Enumeră zonele vieții care nu sunt cum le vrei',
      'Scrie credințele necesare pentru transformare',
      'Scrie de ce TREBUIE și de ce POȚI schimba acum',
    ],

    breakthroughPrompt: 'Ce motive ai descoperit care sunt atât de puternice încât schimbarea devine inevitabilă? Cine vei deveni în proces?',
    breakthroughPromptEn: 'What reasons have you discovered that are so powerful that change becomes inevitable? Who will you become in the process?',
  },

  {
    day: 12,
    title: 'Creează-ți Viitorul: Atelierul de Obiective',
    titleEn: 'Creating Your Future: The Goal-Setting Workshop',
    quote: '"Stabilirea obiectivelor este primul pas în a transforma invizibilul în vizibil."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: `## Ziua 12 — Creează-ți Viitorul: Atelierul de Obiective

Stabilirea obiectivelor este un proces important care te ajută să proiectezi viața pe care îți imaginezi că o vei trăi și să creezi energie și momentum. Procesul de a-ți scrie obiectivele este la fel de important ca urmărirea imediată prin dezvoltarea unui plan și luarea de acțiuni pentru a menține momentum-ul.

### Categorii de Obiective

Fiecare singură acțiune pe care o întreprinzi are un efect asupra destinului tău. Dacă studiem destinul, găsim că totul în viață are patru părți.

**1. Obiective de Dezvoltare Personală**
- Enumeră obiectivele tale de dezvoltare personală
- Lângă fiecare, scrie timeline-ul (1, 3, 5, 10 sau 20 de ani)
- Selectează top 3 și scrie un paragraf despre de ce ești angajat să le atingi în anul următor

**2. Obiective Materiale (Lucruri)**
- Enumeră lucrurile pe care vrei să le dobândești
- Timeline pentru fiecare
- Top 3 cu motivul angajamentului

**3. Obiective Economice / Financiare**
- Enumeră obiectivele tale financiare
- Timeline pentru fiecare
- Top 3 cu motivul angajamentului

**4. Alte Obiective** (Sănătate, Relații, Carieră/Misiune, Contribuție, Spiritualitate)
- Enumeră obiectivele din aceste domenii
- Timeline pentru fiecare
- Top 3 cu motivul angajamentului

### Testul Bălăsoiului

Imaginează-te mult mai în vârstă, stând în balansoarul tău și privind înapoi la viața ta:
- Mai întâi, ca și cum **nu** ți-ai fi atins obiectivul (simte durerea)
- Apoi, ca și cum **l-ai fi atins** (simte plăcerea)

> **Nu doar atingerea unui obiectiv contează, ci calitatea vieții pe care o experimentezi pe parcurs. Cine devii pe măsură ce depășești obstacolele este ceea ce îți oferă cel mai profund și durabil sentiment de împlinire.**

### Excerpt din jurnalul mentorului nostru, 1978

*„Motivele pentru care îmi voi atinge obiectivele sunt: Am fost crescut pentru succes. Am darurile și abilitățile mentale. Am experiența. Sunt tânăr. Am obiective specifice. Mă înconjoară oamenii potriviți. Am stăpânit disciplina și obiceiurile. Muncesc din greu în fiecare zi!"*`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Obiective de Dezvoltare Personală: Scrie-ți top 3 obiective cu timeline (1, 3, 5, 10 sau 20 ani) și de ce ești angajat să le atingi în anul următor.',
        promptEn: 'Personal Development Goals: Write your top 3 goals with timeline (1, 3, 5, 10, or 20 years) and why you\'re committed to achieving each within the next year.',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Obiective Materiale: Scrie-ți top 3 lucruri pe care vrei să le dobândești, cu timeline și motivul angajamentului.',
        promptEn: 'Things Goals: Write your top 3 things goals with timeline and why you\'re committed.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Obiective Financiare: Scrie-ți top 3 obiective financiare, cu timeline și motivul angajamentului.',
        promptEn: 'Financial Goals: Write your top 3 financial goals with timeline and why you\'re committed.',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Alte Obiective (Sănătate, Relații, Carieră/Misiune, Contribuție, Spiritualitate): Scrie-ți top 3 obiective din aceste domenii.',
        promptEn: 'Other Goals (Health, Relationships, Career/Mission, Contribution, Spirituality): Write your top 3 goals in these areas.',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Pentru fiecare obiectiv de top, scrie o acțiune pe care o poți face IMEDIAT pentru a face progres inițial. Ia aceste acțiuni ASTĂZI!',
        promptEn: 'For each top goal, write one action you can take RIGHT NOW to make initial progress. Take these actions TODAY!',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 12 of Personal Power Plus — the Goal-Setting Workshop. The user has brainstormed goals across 4 categories (Personal Development, Things, Financial, Other) and selected their top 3 in each area.

Your job is to:
1. Review their goals across all areas and help them select the TOP 3 one-year goals — the ones that would create the most meaningful impact.
2. Dig deep into their WHY for each goal — make the reasons so compelling they're PULLED forward rather than having to push themselves.
3. Identify immediate action steps they can take TODAY toward each goal — because momentum starts with action, not planning.
4. Apply the Rocking Chair Test: help them feel the pain of NOT achieving the goal and the pleasure of achieving it.

Key principle: "Never leave the site of setting a goal without taking action." Ensure they don't just write goals — they immediately take steps toward making them real.

IMPORTANT: Respond in Romanian. Be direct, motivating, and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Revizuiește obiectivele și selectează top 3 pe un an',
      'Aprofundează motivele: de ce ești TRAS înainte, nu împins',
      'Identifică acțiuni imediate pentru ASTĂZI',
      'Aplică Testul Bălăsoiului: simte durerea ne-atingerii și plăcerea atingerii',
    ],

    aiCoachingReminder: 'Nu pleca niciodată de la locul unde ți-ai stabilit un obiectiv fără să iei vreo acțiune. Transformă viziunea în momentum și momentum-ul în rezultate.',

    doListTasks: [
      'Scrie top 3 obiective de dezvoltare personală',
      'Scrie top 3 obiective materiale și financiare',
      'Ia o acțiune IMEDIAT pentru fiecare obiectiv de top',
    ],

    breakthroughPrompt: 'Care sunt cele mai importante 3 obiective pe care le-ai stabilit? Ce acțiune ai luat deja astăzi?',
    breakthroughPromptEn: 'What are the most important 3 goals you\'ve set? What action have you already taken today?',
  },

  {
    day: 13,
    title: 'Forța Ta Motrică: Cele 6 Nevoi Umane (Partea 1)',
    titleEn: 'Your Driving Force: The 6 Human Needs (Part 1)',
    quote: '"Cu toții avem dorințe diferite, dar suntem cu toții conduși de exact aceleași nevoi."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Cele 4 Clase de Experiență',
        definition: 'Clasa I: Se simte bine, e bine pentru tine, pentru alții și pentru binele general (experiență de vârf). Clasa II: Nu se simte bine, dar e bine pentru tine și alții. Clasa III: Se simte bine, dar NU e bine pentru tine sau alții. Clasa IV: Nu se simte bine și NU e bine pentru nimeni.',
      },
      {
        term: 'Cele 6 Nevoi Umane',
        definition: 'Certitudine, Varietate/Incertitudine, Semnificație, Conexiune/Iubire, Creștere, Contribuție — cele șase nevoi fundamentale care conduc tot comportamentul uman.',
      },
    ],
    lessonContent: `## Ziua 13 (Bonus) — Forța Ta Motrică: Cele 6 Nevoi Umane (Partea 1)

Atât de mulți oameni în viață își ating obiectivele doar pentru a se gândi: „Asta este tot?" Asta se întâmplă pentru că nu și-au analizat niciodată adevăratele nevoi sau cum să le satisfacă. Au urmărit doar obiectivele pe care cultura i-a condiționat să le urmărească.

Înțelegerea celor 6 Nevoi Umane îți permite nu doar să activezi Forța Motrică și să descoperi tot ce ești capabil, ci și să fii cu adevărat împlinit pe bază consistentă.

### Cele 4 Clase de Experiență

Înainte de a parcurge nevoile, este important să înțelegem că fiecare dintre noi dezvoltă „vehicule" sau strategii pentru a ne satisface nevoile. Unele sunt benefice, altele pot fi satisfăcătoare momentan dar pe termen lung nu ne împlinesc.

| Clasă | Descriere |
|-------|-----------|
| **Clasa I** | Se simte bine. E bine pentru tine. E bine pentru alții. Servește binelui general. = **Experiență de vârf** |
| **Clasa II** | NU se simte bine. Dar E bine pentru tine, pentru alții, servește binelui general. = Experiențe pe care vrem să le evităm dar care ne oferă cea mai mare bucurie |
| **Clasa III** | Se simte bine. NU e bine pentru tine, pentru alții, nu servește binelui general. = Plăceri pe termen scurt care distrug calitatea vieții |
| **Clasa IV** | NU se simte bine. NU e bine pentru nimeni. = Experiențe conduse de presiunea grupului sau condiționare veche |

**Secretul împlinirii** este să înveți cum să convertești experiențele de Clasa II în experiențe de Clasa I.

### Cele 6 Nevoi Umane

Sunt șase nevoi fundamentale pe care fiecare persoană le are în comun, și tot comportamentul — pozitiv sau negativ — este pur și simplu o încercare de a satisface aceste nevoi:

1. **Certitudine** — Abilitatea de a evita durerea și a câștiga plăcere, securitate, supraviețuire
2. **Varietate / Incertitudine** — Surpriză, diversitate, provocare, entuziasm
3. **Semnificație** — Importanță, unicitate, a fi necesar, a avea un scop
4. **Conexiune / Iubire** — Legătură, unitate, intimitate, a face parte din ceva
5. **Creștere** — Învățare, schimbare, expansiune, îmbunătățire
6. **Contribuție** — A da, a ajuta, a servi, a face o diferență

Fiecare dintre noi poate satisface oricare din aceste nevoi schimbând fie **percepția** (focusul și credințele) fie **procedura** (vehiculele pe care le folosim).

> **Nefericirea, suferința emoțională și tot comportamentul disfuncțional apar când nu putem găsi o modalitate consistentă și pozitivă de a ne satisface cele 6 Nevoi Umane.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Ce este ceva ce IUBEȘTI să faci? Ceva ce te simți complet atras să faci, fără efort? Descrie activitatea:',
        promptEn: 'What\'s something you LOVE to do? Something effortless and totally fulfilling? Describe it:',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Evaluează pe o scală de 0-10 cât de mult satisface această activitate fiecare din cele 6 nevoi: Certitudine, Varietate, Semnificație, Conexiune/Iubire, Creștere, Contribuție.',
        promptEn: 'Rate on a 0-10 scale how much this activity meets each of the 6 needs: Certainty, Variety, Significance, Connection/Love, Growth, Contribution.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Cum anume satisface sau NU satisface fiecare nevoie? Fii specific — ce anume îți oferă certitudine? Ce surprize aduce? Cum te face să te simți important? etc.',
        promptEn: 'How specifically does it meet or fail to meet each need? Be specific — what gives you certainty? What surprises? How does it make you feel significant? etc.',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 13 of Personal Power Plus — The 6 Human Needs (Part 1). Today's focus: understanding the 4 Classes of Experience and analyzing why activities we LOVE feel effortless.

The user has learned:
- The 4 Classes of Experience (I-IV) and why converting Class II to Class I is the secret to fulfillment
- The 6 Human Needs: Certainty, Variety, Significance, Connection/Love, Growth, Contribution
- Activities we love typically meet 4-6 needs at high levels — that's why they feel effortless

Your job is to:
1. Identify something the user absolutely loves doing — an activity that lights them up and feels effortless.
2. Analyze how it meets each of the 6 needs on a scale of 0-10.
3. Discover the pattern — when something meets multiple core needs at high levels, you don't need willpower.
4. Help them understand which needs are driving them most powerfully right now.

Key insight: "When an activity meets multiple core needs at high levels, you don't need willpower — you're pulled by fulfillment itself."

IMPORTANT: Respond in Romanian. Be insightful and help them see patterns. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică o activitate pe care o iubești cu adevărat',
      'Analizează cele 6 nevoi pe o scală de 0-10',
      'Descoperă pattern-ul: activitățile iubite satisfac 4-6 nevoi',
      'Înțelege care nevoi te conduc cel mai puternic',
    ],

    aiCoachingReminder: 'Când o activitate satisface mai multe nevoi fundamentale la nivele înalte, nu ai nevoie de voință — ești tras de împlinirea însăși.',

    doListTasks: [
      'Descrie o activitate pe care o iubești',
      'Evaluează cele 6 nevoi pe scală 0-10',
      'Identifică pattern-ul nevoilor tale dominante',
    ],

    breakthroughPrompt: 'Ce ai descoperit despre de ce iubești ceea ce iubești? Care nevoi sunt cele mai puternice pentru tine?',
    breakthroughPromptEn: 'What did you discover about why you love what you love? Which needs are most powerful for you?',
  },

  {
    day: 14,
    title: 'Forța Ta Motrică: Cele 6 Nevoi Umane (Partea 2)',
    titleEn: 'Your Driving Force: The 6 Human Needs (Part 2)',
    quote: '"Poți satisface primele patru nevoi în moduri distructive și totuși să te simți puțin împlinit. Doar suficient încât să nu fii fericit, dar nici destul de nemulțumit încât să te schimbi."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: `## Ziua 14 (Bonus) — Forța Ta Motrică: Cele 6 Nevoi Umane (Partea 2)

Ieri ai descoperit de ce activitățile pe care le iubești se simt fără efort — ele satisfac multiple nevoi fundamentale la nivele înalte. Astăzi vei inversa procesul: vei lua ceva ce urăști să faci și vei învăța cum să-l redesignezi astfel încât să devină mai împlinitor.

### Insight-ul Cheie

> **„Poți satisface primele patru nevoi în moduri distructive și totuși să te simți puțin împlinit. Doar suficient încât să nu fii fericit, dar nici destul de nemulțumit încât să te schimbi. Și nu vei fi împlinit pentru că nu vei crește și nu vei contribui, care sunt nevoile ultime, primare, esențiale."**

### Transformarea din Clasa II în Clasa I

Vestea bună? Poți redesigna orice activitate schimbând:

- **Percepția ta** — ce observi, apreciezi sau crezi despre activitate
- **Procedura ta** — cum o faci sau ce adaugi la ea

Când faci o activitate să satisfacă mai multe din cele 6 nevoi, transformi aversiunea în motivație.

### Exemple de Redesignare

- **Adaugă muzică** pentru varietate și plăcere
- **Fă-o cu cineva** pentru conexiune
- **Conecteaz-o la un scop mai mare** pentru semnificație
- **Găsește oportunitatea de creștere** în ea
- **Fă-o să servească altora** pentru contribuție`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Ce este ceva ce URĂȘTI să faci, dar știi că ar trebui? Ceva ce amâni mereu? Descrie activitatea:',
        promptEn: 'What\'s something you HATE to do but know you should? Something you always put off? Describe it:',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Evaluează pe o scală de 0-10 cât satisface această activitate fiecare din cele 6 nevoi: Certitudine, Varietate, Semnificație, Conexiune/Iubire, Creștere, Contribuție.',
        promptEn: 'Rate on a 0-10 scale how much this activity meets each of the 6 needs: Certainty, Variety, Significance, Connection/Love, Growth, Contribution.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Transformă această experiență de Clasa II în Clasa I: Ce ai putea alege să crezi sau să schimbi în modul în care o faci pentru a satisface fiecare nevoie la nivel maxim?',
        promptEn: 'Transform this Class II experience into Class I: What could you choose to believe or change about how you do it to meet each need at the highest level?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 14 of Personal Power Plus — The 6 Human Needs (Part 2). Today's focus: taking something the user HATES doing and redesigning it to meet more of their 6 needs.

The user has learned:
- Yesterday they analyzed something they love — today they flip it
- Class II experiences (don't feel good but are good for you) can be converted to Class I
- You can redesign any activity by changing perception (what you believe about it) or procedure (how you do it)
- When an activity meets almost none of your needs, resistance is inevitable

Your job is to:
1. Identify something they hate doing but have to do anyway — the thing they avoid or dread.
2. Rate how well it currently meets each of the 6 needs on a 0-10 scale and see why they resist it.
3. Discover the pattern — when activities meet almost none of your needs, resistance is inevitable.
4. Redesign the activity by changing perception or procedure: add music, do it with someone, connect to purpose, find growth, make it serve others.

Key insight: "You can't always change WHAT you have to do, but you can always change HOW you perceive it or HOW you do it."

IMPORTANT: Respond in Romanian. Be creative and help them find practical solutions. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică o activitate pe care o eviți sau o detești',
      'Evaluează deficitul de nevoi: care nevoi nu sunt satisfăcute?',
      'Redesignează prin schimbarea percepției sau procedurii',
      'Transformă aversiunea în motivație prin satisfacerea mai multor nevoi',
    ],

    aiCoachingReminder: 'Nu poți schimba mereu CE trebuie să faci, dar poți schimba mereu CUM percepi sau CUM faci lucrul respectiv. Asta schimbă totul.',

    doListTasks: [
      'Descrie o activitate pe care o eviți dar ar trebui să o faci',
      'Evaluează cele 6 nevoi pe scală 0-10',
      'Redesignează activitatea: schimbă percepția sau procedura',
    ],

    breakthroughPrompt: 'Ce activitate neplăcută ai reușit să o transformi? Cum ai schimbat percepția sau procedura?',
    breakthroughPromptEn: 'What unpleasant activity did you manage to transform? How did you change the perception or procedure?',
  },

  {
    day: 15,
    title: 'Condiționarea Succesului: Puterea Ritualurilor',
    titleEn: 'Success Conditioning: The Power of Rituals',
    quote: '"Seamănă un gând, culegi o acțiune; Seamănă o acțiune, culegi un obicei; Seamănă un obicei, culegi un caracter; Seamănă un caracter, culegi un destin."',
    quoteAuthor: 'Samuel Smiles',
    definitions: [
      {
        term: 'Ritual',
        definition: 'Un obicei repetat în mod constant — modul habitual în care privești lumea, vorbești cu tine și îți miști corpul. Ritualurile creează stări emoționale consistente care îți modelează caracterul și destinul.',
      },
      {
        term: 'Procrastinarea',
        definition: 'Un ritual — un obicei de a privi lumea într-un anumit mod în care acțiunea pare mai dureroasă decât ne-acțiunea. Nu e o trăsătură de caracter, ci un pattern care poate fi întrerupt.',
      },
    ],
    lessonContent: `## Ziua 15 — Condiționarea Succesului: Puterea Ritualurilor

Procrastinarea este un ucigaș silențios. Ne împiedică să atingem ceea ce vrem. Această sesiune nu este doar despre cum să gestionezi procrastinarea, ci și despre cum să creezi obiceiul de a lua acțiuni consecvente absolute spre obiectivele pe care le-ai stabilit.

> **„Seamănă un gând, culegi o acțiune; Seamănă o acțiune, culegi un obicei; Seamănă un obicei, culegi un caracter; Seamănă un caracter, culegi un destin." — Samuel Smiles**

Odată ce ne identificăm obiceiurile, ne putem condiționa să creăm obiceiuri noi care ne vor trage automat spre obiectivele pe care le dorim cel mai mult.

### Obiceiurile Noastre Emoționale

Emoțiile noastre consistente ne modelează caracterul și destinul.

Dacă simți orice emoție, pozitivă sau negativă, pe bază regulată, este rezultatul unui **ritual intern**. Ritualurile tale constau din modurile tale habituale de a privi lumea, de a vorbi cu tine și de a-ți mișca corpul.

Fiecare emoție pe care o experimentezi are o **„rețetă"** — un set specific de lucruri pe care le faci cu focusul, corpul și limbajul intern pentru a crea acea stare.

### Ritualul Procrastinării

Procrastinarea nu este altceva decât un ritual. Pentru a procrastina, trebuie să privești lumea într-un anumit mod — trebuie să te gândești la cum acțiunea va fi mai dureroasă decât ne-acțiunea.

**Iată cum să o depășești:**

1. **Află cum creezi ritualul procrastinării** — ce focus, postura și dialog intern folosești
2. **Întreabă-te**: „Dacă nu fac asta, care va fi prețul suprem pe care va trebui să-l plătesc?"
3. **Întreabă-te**: „Dacă aș fi terminat deja asta, cum ar fi viața mea mai bună? Câtă bucurie în plus aș avea?"
4. **Dezvoltă obiceiul de a spune** „Vreau să..." în loc de „Trebuie să..."
5. **Dezvoltă obiceiul de a-ți mișca corpul** pentru a întrerupe pattern-ul procrastinării

### Dezvoltarea de Ritualuri Noi

Dacă vrem succes pe viață — mai multă fericire, bucurie, pasiune și distracție, precum și mai mulți bani, prietenii mai strânse și șansa de a face o diferență — trebuie să fim clari despre ritualurile pe care le-am dezvoltat și care nu ne susțin și să le abandonăm. Apoi, trebuie să punem ritualuri noi, împuternicite, în loc pentru a crea rezultate noi.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Enumeră 5 emoții negative pe care le experimentezi pe bază regulată (ex: descurajare, frustrare, anxietate, tristețe, iritare):',
        promptEn: 'List 5 negative emotions you experience on a regular basis (e.g., discouragement, frustration, anxiety, sadness, irritation):',
        type: 'list',
        listCount: 5,
      },
      {
        step: 2,
        prompt: 'Care sunt ritualurile/rețetele tale pentru fiecare emoție negativă? Ce faci cu mintea, corpul și focusul tău pentru a crea aceste stări?',
        promptEn: 'What are your rituals/recipes for each negative emotion? What do you do with your mind, body and focus to create these states?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Enumeră 5 emoții pozitive pe care le experimentezi pe bază regulată:',
        promptEn: 'List 5 positive emotions you experience on a regular basis:',
        type: 'list',
        listCount: 5,
      },
      {
        step: 4,
        prompt: 'Care sunt ritualurile tale pentru emoțiile pozitive? Ce faci diferit când experimentezi aceste stări?',
        promptEn: 'What are your rituals for your positive emotions? What do you do differently when experiencing these states?',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Dezvoltă un pattern interrupt pentru fiecare emoție negativă. Ce poți face fizic, mental sau verbal pentru a întrerupe pattern-ul?',
        promptEn: 'Develop a pattern interrupt for each negative emotion. What can you do physically, mentally or verbally to interrupt the pattern?',
        type: 'paragraph',
      },
      {
        step: 6,
        prompt: 'Ce faci ca să intri în ritualul procrastinării? Cum privești lumea, ce îți spui, ce faci cu corpul? Și cum poți ieși din el?',
        promptEn: 'What do you do to enter the ritual of procrastination? How do you see the world, what do you tell yourself, what do you do with your body? And how can you break out?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 15 of Personal Power Plus — Success Conditioning: The Power of Rituals. Today's focus: identifying emotional "recipes" and breaking the ritual of procrastination.

The user has learned:
- Every consistent emotion is the result of an internal ritual (focus + physiology + internal dialogue)
- Each emotion has a specific "recipe" — a pattern of things you do to create that state
- Procrastination is just another ritual, not a character flaw
- 5 steps to overcome procrastination: identify the ritual, feel the cost, feel the gain, say "I want to" instead of "I have to", move your body

Your job is to:
1. Identify one negative emotional pattern they experience regularly — frustration, overwhelm, procrastination, or avoidance.
2. Map out the specific recipe for that emotion — what they focus on, how they stand/breathe, what they tell themselves.
3. Explore one positive emotion and discover its recipe as well — show the contrast.
4. Help them see how awareness of these patterns gives them power to interrupt and change them.
5. Address procrastination specifically — help them identify their personal ritual and develop a pattern interrupt.

Key insight: "Procrastination is nothing but a ritual. Once you identify your rituals, you can interrupt the patterns that don't serve you and install new ones that do."

IMPORTANT: Respond in Romanian. Be observant and help them see their own patterns. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică un pattern emoțional negativ regulat',
      'Descoperă „rețeta" specifică a emoției: focus, corp, dialog intern',
      'Explorează contrastul cu o emoție pozitivă',
      'Dezvoltă un pattern interrupt pentru procrastinare',
    ],

    aiCoachingReminder: 'Procrastinarea este doar un ritual. Odată ce îți identifici ritualurile, poți întrerupe pattern-urile care nu te servesc și instala altele noi. Asta este cum preiei controlul asupra emoțiilor consistente — și în final, asupra caracterului și destinului tău.',

    doListTasks: [
      'Enumeră 5 emoții negative și rețetele lor',
      'Enumeră 5 emoții pozitive și ritualurile lor',
      'Dezvoltă un pattern interrupt pentru fiecare emoție negativă',
      'Identifică ritualul procrastinării și cum să-l întrerupi',
    ],

    breakthroughPrompt: 'Ce ritual emoțional ai identificat și cum planifici să-l schimbi? Ce pattern interrupt vei folosi?',
    breakthroughPromptEn: 'What emotional ritual have you identified and how do you plan to change it? What pattern interrupt will you use?',
  },
];
