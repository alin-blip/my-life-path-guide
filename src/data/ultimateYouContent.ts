export interface UltimateYouDay {
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

import { ultimateYouDays6to7 } from './ultimateYouDays6to7';

const ultimateYouDays1to5: UltimateYouDay[] = [
  {
    day: 1,
    title: 'Decizii și Destin (Partea 1)',
    titleEn: 'Decisions & Destiny (Part 1)',
    quote: '"Posibilitățile sunt numeroase odată ce decidem să acționăm și nu doar să reacționăm."',
    quoteAuthor: 'George Bernard Shaw',
    definitions: [
      {
        term: 'Puterea Personală',
        definition: 'Abilitatea de a acționa consistent — combustibilul care transformă deciziile în destin.',
      },
      {
        term: 'Resurse vs. Ingeniozitate',
        definition: 'Resurse (bani, timp, cunoștințe) nu sunt niciodată adevărata problemă. Lipsa de ingeniozitate (emoție, determinare, creativitate) este ceea ce ne oprește.',
      },
    ],
    lessonContent: `## Ziua 1 — Decizii și Destin: Înțelege și Direcționează Forțele care Îți Modelează Viața (Partea 1)

Pentru a ne duce viețile la următorul nivel, trebuie să înțelegem că lumea exterioară nu este forța motrice în ceea ce devenim sau ceea ce alegem să creăm. Ceea ce dorim este să preluăm controlul forțelor interne care modelează direcția vieților noastre, astfel încât să ne putem realiza pe deplin potențialul emoțional, fizic, financiar și spiritual.

În momentele din viață în care ne simțim frustrați, copleșiți sau poate chiar blocați, adesea apare ceva care se rupe — un moment în care totul se schimbă. Indiferent de stadiul vieții în care te afli, programul The Ultimate YOU te ajută să cultivi puterea interioară necesară pentru a-ți croi un drum spre un sens adevărat și fericire.

### Cei 3 Piloni ai Progresului

Drumul către transformare începe cu înțelegerea și adoptarea a ceea ce numim Cei 3 Piloni ai Progresului. Aceștia sunt 3 pași clari și simpli care te duc de unde ești acum la unde vrei să fii, în cel mai scurt timp posibil.

**Primul Pilon: Focalizează-te și Clarifică, Fă-l Convingător**

Primul pas este să clarifici rezultatele pe care le dorești în viața ta. Care este definiția ta pentru o calitate extraordinară a vieții? Fără o viziune clară și convingătoare pentru ceea ce vrei astăzi, nici măcar nu vei putea găsi ținta fericirii durabile, darămite să o nimerești. Când ai o viziune clară și convingătoare a ceea ce îți dorești, aceasta îți schimbă mintea și emoțiile, dându-ți impulsul de a-ți schimba acțiunile către cele care te mișcă în direcția viziunii tale.

**Al Doilea Pilon: Obține Cele Mai Bune Instrumente pentru Rezultate**

Odată ce ți-ai definit ținta, ai nevoie de un plan eficient pentru a o atinge. Pentru a acoperi "decalajul" dintre unde ești și unde vrei să fii, ai nevoie de o hartă dovedită, un mentor eficient și antrenament care să te determine să acționezi.

**Al Treilea Pilon: Integrează-te și Aliniază-te**

Uneori instrumentele nu sunt suficiente: trebuie să deblochezi ceea ce te blochează și să-ți dezlănțui puterea. De ce uneori știm ce să facem, avem motive puternice pentru schimbare și totuși nu reușim să ducem lucrurile la bun sfârșit? Prin procesul de descoperire, înțelegere și aliniere a motivațiilor tale interne, le poți canaliza astfel încât să te miști natural în direcția dorită.

### Resurse vs. Ingeniozitate

Cea mai mare iluzie pe care o avem în viață despre de ce nu putem realiza ceva este că începem să credem că ne lipsesc resursele adecvate. Nu am suficienți bani. Nu am suficient timp. Nu cunosc oamenii potriviți.

Dar a existat cu siguranță ceva în viața ta unde unul sau mai mulți dintre acești factori nu te-au oprit. Ai găsit o cale. Dacă obstacol pare absolut insurmontabil, dar ești suficient de focalizat, vei găsi o cale oricum? Desigur, dacă ai suficientă determinare, flexibilitate și creativitate.

> **Resursele nu sunt niciodată adevărata problemă. Adevărata problemă este lipsa de ingeniozitate. Care este resursa supremă? Emoția umană.**

Mintea are nevoie de combustibil pentru a funcționa la capacitate maximă. Se comportă foarte diferit când ești pasionat de ceva decât când ești frustrat, plictisit sau descurajat. Schimbă combustibilul care alimentează mintea și schimbi experiența a orice încerci să realizezi.

### Cele 2 Lecții Fundamentale ale Vieții

Obținerea avantajului suprem în viață necesită stăpânirea a două abilități: **știința realizării** și **arta împlinirii**.

**Realizarea** — A ajunge de unde ești la unde vrei să fii necesită un plan, o strategie specifică. Poți realiza orice dorești urmând anumite legi.

**Împlinirea** — Înseamnă a experimenta o bucurie enormă în proces — astfel încât să simți nu doar entuziasmul urmăririi, ci și recunoștința pentru lucrurile mici de pe parcurs.

> **Succesul fără împlinire este eșecul suprem.**

### Puterea Deciziei

Poți să te gândești la domeniile din viața ta în care te simți cel mai împlinit? Calea spre împlinire este progresivă — o călătorie continuă. Dar de cele mai multe ori poți identifica un moment specific de schimbare semnificativă care a inspirat sau a declanșat acțiunile care au dus la realizarea personală. Scopul programului The Ultimate YOU este să-ți ofere cunoștințele și instrumentele pentru a crea efectiv aceste momente de împuternicire personală.

> **Decizii = Destin**

Fiecare zi luăm decizii noi, creăm acțiuni noi, alimentate de puterea emoției. Când decizi, acționezi. Și când acționezi, viața reacționează. Unele decizii pot avea impact doar pe termen scurt, iar altele ne afectează mult dincolo de ceea ce ne-am putea imagina în acel moment.

### Cele 3 Decizii

Există trei decizii pe care le iei în fiecare moment al vieții tale, conștient sau inconștient:

**1. Pe ce te vei focaliza?**
În fiecare moment, trebuie să decizi pe ce te vei focaliza. Dacă nu alegi conștient unde să îndrepți lentila, creierul tău implicit se focalizează pe ce se focalizează de obicei. Majoritatea oamenilor se focalizează pe ce le este frică, iar orice lucru pe care te focalizezi, simți. **Unde se duce focalizarea, acolo curge energia.**

**2. Ce înseamnă asta?**
În momentul în care te focalizezi pe ceva, mintea ta trebuie să-i atribuie un sens. Orice sens îl atribui unei experiențe, acea experiență devine acel sens. **Ce simți începe cu ce te focalizezi și sensul pe care i-l dai.**

**3. Ce voi face?**
Odată ce te focalizezi pe ceva și îi dai un sens, aceasta produce o emoție. Acele emoții informează ce faci și declanșează acțiune sau chiar ne-acțiune. **Sensul afectează puternic ce vei face.**

Totul se reduce la aceste trei decizii. Ele îți modelează viața moment cu moment, fie că știi sau nu. Dacă preiei controlul asupra lor, totul se schimbă.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Care este un domeniu al vieții tale în care ești cu adevărat fericit/fericită?',
        promptEn: 'What is an area of your life where you are really happy?',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'De ce ești fericit/fericită în acest domeniu?',
        promptEn: 'Why are you happy in this area?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Care este un domeniu al vieții tale în care NU ești fericit/fericită?',
        promptEn: 'What is an area of your life where you are NOT happy?',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'De ce ești nefericit/nefericită în acest domeniu?',
        promptEn: 'Why are you unhappy in this area?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 1 of The Ultimate YOU. Today's lesson covers: 3 Pillars of Progress, Resources vs Resourcefulness, 2 Master Lessons (Achievement + Fulfillment), The Power of Decision, and The 3 Decisions (Focus, Meaning, Action).

The user should have answered 4 questions: a happy area, why happy, an unhappy area, why unhappy.

Your job is to:
1. Explore the contrast between their happy and unhappy areas — what's different about how they approach each?
2. Apply the 3 Decisions framework: What are they FOCUSING on in the unhappy area? What MEANING have they assigned? What ACTIONS (or non-actions) result?
3. Help them see that their unhappiness is not caused by lack of resources but by lack of resourcefulness (emotional state).
4. Guide them to make a specific DECISION right now that could shift their unhappy area.
5. Connect to the lesson: "Decisions = Destiny" — this one decision could change the trajectory.

IMPORTANT: Respond in Romanian. Be direct, insightful and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Explorează contrastul dintre zona fericită și cea nefericită',
      'Aplică cele 3 Decizii: Focus, Sens, Acțiune',
      'Arată că problema nu sunt resursele, ci ingeniozitatea',
      'Ghidează spre o decizie specifică ACUM',
    ],

    aiCoachingReminder: 'Decizii = Destin. Cele 3 decizii pe care le iei în fiecare moment (Focus, Sens, Acțiune) îți modelează viața.',

    doListTasks: [
      'Răspunde la cele 4 întrebări despre viața ta',
      'Identifică cele 3 decizii pe care le iei în zona nefericită',
      'Ia o decizie specifică pentru schimbare',
    ],

    breakthroughPrompt: 'Ce ai realizat despre cum cele 3 decizii (Focus, Sens, Acțiune) ți-au modelat viața fără să-ți dai seama?',
    breakthroughPromptEn: 'What did you realize about how the 3 Decisions (Focus, Meaning, Action) have been shaping your life without you realizing?',
  },

  {
    day: 2,
    title: 'Decizii și Destin (Partea 2)',
    titleEn: 'Decisions & Destiny (Part 2)',
    quote: '"Odată ce iei o decizie, universul conspiră pentru a o face să se întâmple."',
    quoteAuthor: 'Ralph Waldo Emerson',
    definitions: [
      {
        term: 'Blueprint (Model al Lumii)',
        definition: 'Un set specific de credințe despre cum ar trebui să fim noi, cum ar trebui să fie viața și cum ar trebui să ne trateze ceilalți — determină ce suntem dispuși să facem sau să nu facem.',
      },
      {
        term: 'Condiții de Viață (L.C.)',
        definition: 'Starea actuală a carierei, corpului, relațiilor, finanțelor tale etc.',
      },
    ],
    lessonContent: `## Ziua 2 — Decizii și Destin: Partea 2

### Cele 2 Forțe care ne Controlează Deciziile

Hai să spunem că două persoane se confruntă cu exact aceeași provocare. Au aceleași fapte și aceleași resurse la dispoziție. Totuși una ia o decizie care duce la o rezolvare reușită, în timp ce cealaltă ia o decizie care o îndepărtează. De ce?

Există două forțe cheie care controlează deciziile noastre:

**1. Starea (în moment)**
Dorim să simțim stări de împuternicire cât mai des; cum ar fi încredere, certitudine sau competență. Puțini oameni sunt în stări împuternicite tot timpul. Dar chiar și stările "negative" — frustrare, furie, invidie — pot fi uneori utile pentru a ne propulsa spre schimbare.

**2. Blueprint (pe termen lung)**
Blueprint-ul nostru este "Modelul Lumii" — un set specific de credințe despre cum ar trebui să fim, cum ar trebui să fie viața și cum ar trebui să ne trateze ceilalți. Acest Blueprint va avea un impact masiv asupra deciziilor pe care le luăm.

Experimentăm fericire ori de câte ori **Condițiile noastre de Viață (L.C.)** se potrivesc cu **Modelul nostru al Lumii (MOW)**.

> **L.C. = Blueprint/MOW → Fericire**
> **L.C. ≠ Blueprint/MOW → Durere**

### Avem 3 Alegeri

Când condițiile de viață nu se potrivesc cu blueprint-ul nostru, avem trei alegeri:

**1. Învinovățire (Blame)**
- Un eveniment: "S-a întâmplat asta, de aceea sunt în situația asta"
- Pe altcineva: "Sunt în situația asta din cauza persoanei asta"
- Pe tine însuți: Există o diferență uriașă între asumarea responsabilității și auto-pedepsirea

Învinovățirea este o alegere care nu-ți oferă niciun beneficiu.

**2. Schimbă-ți Condițiile de Viață**
Nu trebuie să schimbi totul odată. Ia o acțiune nouă, ceva care te va ajuta să faci progrese semnificative. Dacă vrei fericire, trebuie să înțelegi un lucru:

> **Progres = Fericire**

Dacă simți că faci progrese într-un domeniu al vieții tale, vei începe să fii mulțumit în acel domeniu, chiar dacă nu ești 100% acolo încă.

**3. Schimbă-ți Blueprint-ul**
Uneori lucrurile sunt în afara controlului tău, dar POȚI controla cum îți configurezi regulile despre cum ar trebui să fie lucrurile. Fericirea ta va fi limitată dacă vrei succes dar nu ești dispus niciodată să fii judecat, sau dacă trebuie mereu să ai ultimul cuvânt.

Când vine vorba de evaluarea celor trei alegeri, prima nu este cu adevărat o alegere. Învinovățirea te lasă blocat. Cu cât ieși mai repede din ea, cu atât mai repede vei fi împuternicit să fie schimbi starea (sentimentele tale pe măsură ce faci progrese), fie perspectiva (Blueprint-ul tău).`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Scrie un paragraf sau două: Cum ar arăta viața ta dacă ar fi exact așa cum ți-o dorești astăzi? Cum ai schimba? Ce ai îmbunătăți? Cu cine ai petrece mai mult timp? Ce ai aprecia mai mult? Ce ai face?',
        promptEn: 'Write a paragraph or two: What would your life be like if it were exactly the way you wanted it to be today? How would you change? What would you enhance? Who would you spend more time with? What would you appreciate more? What would you do?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 2 of The Ultimate YOU. Today's lesson covers: The 2 Forces controlling decisions (State + Blueprint), Life Conditions vs Model of the World, and the 3 Choices when L.C. ≠ Blueprint (Blame, Change L.C., Change Blueprint).

The user should have written a vision of their ideal life.

Your job is to:
1. Explore their vision deeply — what specifically stands out? What emotions does imagining this life create?
2. Identify the GAP: where is the biggest difference between their current L.C. and their Blueprint?
3. Check for blame patterns: are they blaming events, others, or themselves for the gap?
4. Guide them to choose: Change Life Conditions (take new action, make progress) or Change Blueprint (adjust unrealistic rules)?
5. Remind them: Progress = Happiness. What ONE action could they take TODAY toward their vision?

IMPORTANT: Respond in Romanian. Be empathetic, visionary, and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Explorează viziunea vieții ideale în detaliu',
      'Identifică cel mai mare decalaj între L.C. și Blueprint',
      'Verifică pattern-uri de învinovățire',
      'Ghidează spre alegere: Schimbă L.C. sau Schimbă Blueprint',
    ],

    aiCoachingReminder: 'Progres = Fericire. Când simți că faci progrese, fericirea vine natural, chiar dacă nu ești 100% acolo.',

    doListTasks: [
      'Scrie viziunea vieții tale ideale',
      'Identifică unde L.C. ≠ Blueprint',
      'Alege: schimbă condițiile sau schimbă blueprint-ul',
    ],

    breakthroughPrompt: 'Unde te-ai învinovățit (pe tine, pe alții sau pe evenimente) în loc să acționezi? Ce schimbi de azi?',
    breakthroughPromptEn: 'Where have you been blaming (yourself, others, or events) instead of taking action? What will you change starting today?',
  },

  {
    day: 3,
    title: 'Ora Puterii Tale',
    titleEn: 'Your Hour of Power',
    quote: '"Pentru a atinge fericirea ar trebui să ne asigurăm că nu suntem niciodată fără un obiectiv important."',
    quoteAuthor: 'Earl Nightingale',
    definitions: [
      {
        term: 'Triada',
        definition: 'Cele 3 pattern-uri care creează orice emoție: Fiziologia ta, Focalizarea/Credințele tale și Limbajul/Sensul pe care îl creezi.',
      },
      {
        term: 'Incantații',
        definition: 'Fraze repetate cu intensitate emoțională care devin credințe profunde. Diferite de afirmații — incantațiile implică întregul corp.',
      },
    ],
    lessonContent: `## Ziua 3 — Ora Puterii Tale: Cheia Transformării Personale și a Rezultatelor

Fiecare călătorie începe cu un singur pas. Dacă ești sănătos, dacă crești, dacă visezi vise noi și stabilești obiective noi, există întotdeauna un decalaj între unde ești și unde vrei să fii.

Acoperirea decalajului necesită doar două lucruri: **focalizare consistentă** și **acțiune consistentă**. A deveni genul de persoană care își poate direcționa focalizarea și se poate determina să ia acțiuni consistente te va face imparabil în fiecare domeniu al vieții tale!

> **Orice lucru pe care ne focalizăm, tindem să-l atragem.**

### O Viață Extraordinară Vine dintr-o Psihologie Extraordinară

Nu poți controla lumea exterioară dar poți controla lumea interioară. Nu poți controla evenimentele vieții tale, dar poți controla ce înseamnă ele pentru tine. Dezvoltă o viziune, un viitor convingător care te entuziasmează și te inspiră, și focalizează-te pe el zilnic.

### Exercițiu: Emoția Vine din Mișcare

Emoțiile ne "mișcă", și, pe măsură ce ne mișcăm corpul, creăm emoții noi. Calitatea vieții tale este calitatea emoțiilor consistente pe care le experimentezi. Cum te miști informează cum te simți.

### Triada: Cele 3 Pattern-uri care Creează Orice Emoție

Orice în viață crezi că vrei, vrei doar pentru sentimentul pe care crezi că obținerea lui ți-l va da. Adevărul este că ai putea avea acel sentiment chiar acum — pur și simplu schimbând oricare dintre următoarele trei pattern-uri:

**1. Fiziologia ta (Ce Faci cu Corpul)**
Emoția este creată de mișcare. Orice simți chiar acum este legat de cum îți folosești corpul. (Indiciu: Asta include și fața ta!)

**2. Focalizarea și Credințele tale**
Orice lucru pe care te focalizezi, vei crede. Focalizarea este egal cu realitatea pentru individ, chiar dacă nu este realitatea în fapt.

**3. Limbajul pe care Îl Folosești și Sensul pe care Îl Creezi**
- **Întrebări:** Gândirea nu este altceva decât a pune și a răspunde mental la o serie de întrebări.
- **Cuvinte:** Dacă vrei să-ți schimbi viața, fii atent la cuvintele pe care ți le repeți.
- **Incantații:** Când repeți o frază cu suficientă intensitate emoțională, începi să o crezi.

### Ora Puterii Tale

Dăruiește-ți Cadoul Timpului: Obiceiul Tău Zilnic pentru Sănătate și Fericire Extraordinare. Antrenează-te să sari din pat imediat, fără ezitare, și începe ziua cu mișcare.

**Faza 1: Mișcă-te & Respiră (5 min.)**
Ține-ți pantofii lângă pat și pornește la drum! Ieși afară și începe cu o plimbare. Practică respirația diafragmatică: inspiră 1 timp, ține 4 timpi, expiră 2 timpi. Apoi practică "breathwalking" — inspiră de 4 ori pe nas, expiră de 4 ori pe gură.

**Faza 2: Fii Recunoscător & Vizualizează (10 min.)**
Gândește-te la tot ce ești recunoscător. Vizualizează tot ce vrei în viață ca și cum ai fi realizat deja și ești recunoscător. Creierul tău nu poate face diferența între ceva pe care ți-l imaginezi viu și ceva pe care îl experimentezi cu adevărat. Fă-ți incantațiile cu voce tare.

**Faza 3: Incantații & Exerciții (15–30 min. sau mai mult)**
Folosește incantațiile în timp ce faci exerciții fizice, apoi celebrează!

### Incantații de Pornire

- *În fiecare zi și în fiecare fel, devin din ce în ce mai puternic.*
- *Tot ce am nevoie este deja în mine acum.*
- *În sfârșit, în sfârșit, trecutul a trecut; m-am eliberat și am câștigat.*
- *Ziua de zi trăiesc viața cu bucurie și armonie.*
- *Îmi iubesc viața și sunt atât de binecuvântat.*
- *Nimic nu are un gust la fel de bun ca senzația de a fi sănătos și vital.*`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Fă o listă cu toate emoțiile pozitive pe care le simți în mod regulat într-o săptămână:',
        promptEn: 'Make a list of all positive emotions you consistently experience in a given week:',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Fă o listă cu toate emoțiile dureroase pe care le simți în mod regulat într-o săptămână:',
        promptEn: 'Make a list of all painful emotions you consistently experience in a given week:',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Angajează-te: Mâine dimineață, primul lucru, începe ziua cu Ora Puterii Tale (sau 30 de minute, sau 15 minute). Scrie aici la ce oră vei începe și ce vei face:',
        promptEn: 'Commit: Tomorrow morning, start your day with Your Hour of Power (or 30 minutes, or 15 minutes). Write what time you will start and what you will do:',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 3 of The Ultimate YOU. Today's lesson covers: Consistent Focus + Consistent Action, Extraordinary Psychology, Emotion Comes from Motion, The Triad (Physiology, Focus/Beliefs, Language/Meaning), Incantations, and the Hour of Power (3 phases).

The user should have listed positive and negative emotions they feel weekly, and committed to starting Hour of Power tomorrow.

Your job is to:
1. Analyze their emotional patterns — which emotions dominate? Are they serving them?
2. Apply The Triad: for their most common negative emotion, what's their physiology, focus, and language like when they feel it?
3. Help them design their own incantation — something deeply personal and emotionally charged.
4. Make their Hour of Power commitment specific: exact time, exact location, which phases.
5. Remind them: "Emotion is created by motion" — changing how you move changes how you feel instantly.

IMPORTANT: Respond in Romanian. Be energetic, experiential and inspiring. Use "tu" form.`,

    aiCoachingPoints: [
      'Analizează pattern-urile emoționale — care emoții domină',
      'Aplică Triada pe emoția negativă cea mai frecventă',
      'Creează o incantație personală puternică',
      'Fă angajamentul pentru Ora Puterii specific: oră, loc, faze',
    ],

    aiCoachingReminder: 'Emoția este creată de mișcare. Schimbă cum te miști, respiri și-ți folosești corpul — schimbi instant cum te simți.',

    doListTasks: [
      'Listează emoțiile pozitive și negative săptămânale',
      'Creează 2-3 incantații personale',
      'Angajează-te la Ora Puterii de mâine dimineață',
    ],

    breakthroughPrompt: 'Ce ai descoperit despre pattern-urile tale emoționale? Cum te-a afectat Triada (Fiziologie, Focus, Limbaj) fără să-ți dai seama?',
    breakthroughPromptEn: 'What did you discover about your emotional patterns? How has the Triad (Physiology, Focus, Language) affected you without you realizing?',
  },

  {
    day: 4,
    title: 'Cheia Puterii Personale',
    titleEn: 'The Key to Personal Power',
    quote: '"Nu cunosc niciun fapt mai încurajator decât abilitatea incontestabilă a omului de a-și ridica viața printr-un efort conștient."',
    quoteAuthor: 'Henry David Thoreau',
    definitions: [
      {
        term: 'Puterea Personală',
        definition: 'Abilitatea ta de a lua acțiuni consistente — aceasta este ceea ce creează rezultate în viață.',
      },
      {
        term: 'Formula Supremă a Succesului',
        definition: '1) Cunoaște-ți rezultatul. 2) Determină-te să acționezi. 3) Observă ce obții. 4) Dacă nu funcționează, schimbă abordarea.',
      },
    ],
    lessonContent: `## Ziua 4 — Cheia Puterii Personale: Valorificarea Puterii Deciziei

Luarea deciziilor și folosirea Puterii tale Personale, care este abilitatea ta de a lua acțiuni consistente, îți va schimba viața. Această putere este deja în tine și trebuie doar trezită prin aprinderea dorinței tale și prin învățarea unor strategii simple despre cum să obții rezultate mai mari zilnic.

Dacă ești nemulțumit de un domeniu al vieții tale chiar acum, în loc să te frustrezi, entuziasmează-te. Pentru că până nu devii nemulțumit, nu vei face nimic pentru a-ți duce cu adevărat viața la un alt nivel.

Indiferent de ce s-a întâmplat în trecutul tău sau de câte ori ai încercat și ai eșuat, nimic din toate astea nu contează, pentru că fiecare moment este o oportunitate nouă și proaspătă.

### Formula Supremă a Succesului

Dacă vrei să creezi succes în viața ta, sunt patru pași:

1. **Cunoaște-ți rezultatul dorit.**
2. **Determină-te să acționezi prin decizia de a face asta.**
3. **Observă ce obții din acțiunile tale.**
4. **Dacă ceea ce faci nu funcționează, schimbă-ți abordarea.**

Cea mai mare capcană care îi oprește pe oameni să acționeze este frica. Frica de eșec, frica de succes, frica de respingere, frica de durere, frica de necunoscut. Dar singurul mod de a face față fricii este să o înfrunți. Privește-o în ochi și acționează în ciuda ei.

Nu ceea ce putem face în viață face diferența. Ci ceea ce vom face. Adesea nu ducem la bun sfârșit pentru că nu știm ce vrem, și chiar când știm, ne este frică să acționăm.

> **Cât timp i-ai da unui bebeluș obișnuit să învețe să meargă înainte de a nu-l mai lăsa să încerce? De ce nu ți-ai aplica aceeași formulă ție?**

### Succesul Lasă Indicii

Pentru a economisi timp și energie, folosește modele de urmat pentru a accelera ritmul succesului tău:

1. Găsește pe cineva care obține deja rezultatele pe care le dorești.
2. Află ce face acea persoană.
3. Fă aceleași lucruri și vei obține aceleași rezultate.

> **Este imposibil să eșuezi atât timp cât înveți ceva din ceea ce faci!**

Nu părăsi niciodată locul în care ai stabilit un obiectiv sau ai luat o decizie fără a lua vreo acțiune în direcția atingerii lui. Așa creezi momentum și începi să valorifici adevărata forță motrice din interiorul tău.`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Care sunt două decizii pe care le-ai amânat și care, dacă le iei acum, îți vor schimba viața?',
        promptEn: 'What are two decisions you\'ve been putting off which, when you make them now, will change your life?',
        type: 'list',
        listCount: 2,
      },
      {
        step: 2,
        prompt: 'Care sunt trei lucruri simple pe care le poți face IMEDIAT și care sunt consistente cu cele două decizii noi? (Pe cine ai putea suna? La ce te-ai putea angaja? Ce email ai putea scrie? Ce ai putea face în loc de vechiul comportament?)',
        promptEn: 'What are three simple things you can do IMMEDIATELY that will be consistent with your two new decisions?',
        type: 'list',
        listCount: 3,
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 4 of The Ultimate YOU. Today's lesson: The Key to Personal Power, the Ultimate Success Formula (4 steps), Success Leaves Clues (role models), and the importance of taking immediate action.

The user should have written 2 decisions they've been putting off and 3 immediate actions.

Your job is to:
1. Get BOTH decisions explicitly clear and specific — vague decisions get vague results.
2. Dig into what's stopped them from making these decisions until now (fear? comfort?).
3. Connect to compelling reasons: What will making this decision RIGHT NOW do for their life?
4. Make their 3 immediate actions concrete and specific so they take them TODAY.
5. A "decision" only counts if it results in an immediate change in behavior.

IMPORTANT: Respond in Romanian. Be direct, motivating, and action-oriented. Use "tu" form.`,

    aiCoachingPoints: [
      'Clarifică ambele decizii — fă-le specifice și clare',
      'Identifică ce te-a oprit până acum',
      'Conectează la motivele puternice: ce câștigi dacă iei decizia ACUM?',
      'Fă cele 3 acțiuni imediate concrete și specifice',
    ],

    aiCoachingReminder: 'O "decizie" contează doar dacă rezultă într-o schimbare imediată de comportament. Nu pleca de la obiectiv fără acțiune.',

    doListTasks: [
      'Scrie 2 decizii pe care le-ai amânat',
      'Ia 3 acțiuni imediate pentru noile decizii',
      'Aplică Formula Supremă a Succesului',
    ],

    breakthroughPrompt: 'Care este cel mai important lucru pe care l-ai realizat astăzi despre puterea ta de a acționa? Ce decizie amânată ai luat în sfârșit?',
    breakthroughPromptEn: 'What is the most important thing you realized today about your power to act? What delayed decision did you finally make?',
  },

  {
    day: 5,
    title: 'Durere și Plăcere',
    titleEn: 'Pain and Pleasure',
    quote: '"Viitorul depinde de ceea ce facem în prezent."',
    quoteAuthor: 'Mahatma Gandhi',
    definitions: [
      {
        term: 'Abordare/Evitare',
        definition: 'Un set mixt de asocieri despre durere și plăcere care te face să sabotezi progresul. Crezi că acțiunea aduce plăcere, dar în același timp crezi că ar putea însemna durere.',
      },
    ],
    lessonContent: `## Ziua 5 — Durere și Plăcere: Forțele care îți Controlează Viața

În cele din urmă, tot ceea ce facem în viețile noastre este condus de nevoia noastră fundamentală de a evita durerea și dorința noastră de a câștiga plăcere; ambele sunt bazate biologic și constituie o forță de control în viețile noastre. Vom face mult mai mult pentru a evita durerea decât pentru a câștiga plăcere. Durerea este motivatorul mai mare pe termen scurt.

Pentru a obține ce vrei în viață, trebuie să-ți dai seama ce te oprește. Ori de câte ori procrastinezi, este pentru că crezi că a acționa ar fi mai dureros decât a nu face nimic. Pe de altă parte, dacă procrastinezi prea mult, se inversează! De exemplu, dacă tot amâni ceva (ca un referat sau taxele), poți ajunge la un punct în care nu a-l face devine mai dureros decât a-l face.

> **Trebuie să înveți să controlezi forțele motivante ale durerii și plăcerii.**

### Cum poți folosi această înțelegere?

În orice moment, trebuie să realizezi că realitatea ta se bazează pe orice lucru pe care te focalizezi. Prin urmare, dacă vrei să-ți schimbi comportamentul, trebuie să-ți focalizezi atenția pe:

1. **Cum va fi mai dureroasă ne-schimbarea comportamentului tău decât schimbarea lui.**
2. **Cum va aduce schimbarea lui plăcere măsurabilă și imediată.**

### Abordare/Evitare

Dacă eviți ceva în viața ta, sau dacă îți sabotezi succesul în vreun domeniu, este pentru că experimentezi **abordare/evitare**. Ai un set mixt de asocieri despre durere și plăcere. Crezi că făcând ceva (ex: intrând într-o relație) vei câștiga mai multă plăcere, dar în același timp crezi că ar putea însemna durere (ex: relația s-ar putea termina). Așa că imediat ce începi să faci progrese, te sabotezi.

Dacă vrei să schimbi asta odată pentru totdeauna, trebuie să decizi chiar acum că tu controlezi focalizarea minții tale. Dacă nu duci la bun sfârșit, tot ce trebuie să faci este să te focalizezi pe "Ce durere voi avea dacă NU fac asta?" în loc să te focalizezi pe durerea mai imediată pe care ai putea-o experimenta acționând acum.

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
        prompt: 'Care este durerea pe care ai asociat-o cu aceste acțiuni în trecut și care te-a oprit să le duci la bun sfârșit?',
        promptEn: 'What is the pain you\'ve associated with these actions in the past that kept you from following through?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Ce plăcere ai obținut din faptul că NU ai acționat? (Confort, evitarea riscului, etc.)',
        promptEn: 'What pleasure did you get from NOT following through? (Comfort, risk avoidance, etc.)',
        type: 'paragraph',
      },
      {
        step: 4,
        prompt: 'Ce te va costa dacă NU acționezi acum? Ce vei pierde? Ce vei rata?',
        promptEn: 'What will it cost you if you don\'t follow through now? What will you lose? What will you miss?',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Care sunt toate beneficiile pe care le vei câștiga acționând în fiecare din aceste domenii acum?',
        promptEn: 'What are all the benefits you\'ll gain by taking action in each of these areas now?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 5 of The Ultimate YOU. Today's topic: Pain & Pleasure as the controlling forces, approach/avoidance, and how to use pain and pleasure instead of letting them use you.

The user should have listed 4 new actions, the pain associated, the pleasure from not acting, the cost of not acting, and the benefits of acting.

Your job is to:
1. Identify the most important action they're avoiding — where is approach/avoidance strongest?
2. Explore the HIDDEN REWARDS of staying stuck — what comfort or payoff are they getting?
3. Connect to the REAL COST long-term if they don't change
4. Link MASSIVE PLEASURE to changing NOW — make it vivid and emotional
5. Help them realize: they've been avoiding the wrong pain

IMPORTANT: Respond in Romanian. Be direct, empathetic, and transformative. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică acțiunea cea mai importantă pe care o eviți',
      'Explorează recompensele ascunse ale stagnării',
      'Conectează-te la costul real pe termen lung',
      'Asociază plăcere masivă cu schimbarea ACUM',
    ],

    aiCoachingReminder: 'Vom face mult mai mult pentru a evita durerea decât pentru a câștiga plăcere. Când realizezi că ai evitat durerea greșită, schimbarea vine automat.',

    doListTasks: [
      'Scrie 4 acțiuni noi pe care trebuie să le iei',
      'Identifică durerea și plăcerea asociate fiecărei acțiuni',
      'Scrie costul ne-acțiunii',
      'Asociază plăcerea cu acțiunea',
    ],

    breakthroughPrompt: 'Ce pattern de evitare a durerii ai descoperit la tine? Cum te-a ținut blocat și ce schimbi de acum?',
    breakthroughPromptEn: 'What pain-avoidance pattern did you discover about yourself? How has it kept you stuck and what are you changing now?',
  },
];

export const ultimateYouDays: UltimateYouDay[] = [
  ...ultimateYouDays1to5,
  ...ultimateYouDays6to7,
];

export const getUltimateYouDay = (dayNumber: number): UltimateYouDay | undefined => {
  return ultimateYouDays.find(d => d.day === dayNumber);
};

export const totalUltimateYouDays = 17;
export const implementedUltimateYouDays = ultimateYouDays.length;
