export interface BlogPostSection {
  id: string;
  title: string;
  content: string;
}

export interface BlogPost {
  slug: string;
  titleRo: string;
  titleEn: string;
  excerpt: string;
  author: string;
  authorBio: string;
  authorAvatar?: string;
  publishedAt: string;
  updatedAt: string;
  categories: string[];
  readingTime: string;
  thumbnail?: string;
  videoUrl?: string;
  videoEmbedId?: string;
  sections: BlogPostSection[];
  metaDescription: string;
  metaKeywords: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'rutina-razboinicului-ceo-mind-os',
    videoEmbedId: '4htQEgU0LNNG1iItSTVY0nrSKDhvaHDexzsxCEYsEMKzVzl8f',
    titleRo: 'Rutina Războinicului: Cum să-ți Începi Ziua ca un CEO cu Rezultate',
    titleEn: 'The Warrior Routine: How to Start Your Day as a CEO with Results',
    excerpt: 'Descoperă sistemul complet pe care antreprenorii de succes îl folosesc pentru a-și transforma dimineața, a elimina procrastinarea și a opera la capacitate maximă în toate ariile vieții.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO. Ajută antreprenorii să-și transforme viața prin rutine zilnice, mindset și planificare strategică.',
    publishedAt: '2026-03-01',
    updatedAt: '2026-03-01',
    categories: ['Training', 'Mindset'],
    readingTime: '12 min',
    metaDescription: 'Rutina Războinicului — sistemul complet CEO Mind OS pentru a-ți începe ziua cu viziune, energie și focus. Descoperă Napoleon Hill, CORE 4, Domino Door și AI Mind Coach.',
    metaKeywords: ['rutina dimineții', 'CEO', 'antreprenor', 'productivitate', 'Napoleon Hill', 'mindset', 'CEO Mind OS', 'warrior routine'],
    sections: [
      {
        id: 'problema',
        title: '1. Problema: Lista Nesfârșită fără Direcție',
        content: `În fiecare zi, ca antreprenori, ajungem la birou și ne vine să ne luăm cu mâinile de cap. Avem o listă cu task-uri nesfârșite și nu știm de unde să începem. Exact asta este problema — **ordinea greșită**.

Ne trezim confuzi, stresați, copleșiți de toate task-urile, supărați. Și dacă acționăm din aceeași stare, clar nu avem chef să facem nimic. Amânăm, procrastinăm, nu avem niciun entuziasm.

Plecăm pe fugă, cafeaua în mână, ajungem la birou și facem numai lucruri pe care nu ar trebui să le facem. Repetăm aceeași zi de 365 de ori într-un an. Nu trăim — trăim o zi pe repeat.

> „Mulți ajung la bătrânețe și nu știu ce au făcut, pentru că au trăit doar o zi de nenumărate ori."

**Soluția?** Un sistem. CEO Mind OS este singurul sistem de operare pentru Founderi, pentru CEO. Avem sisteme în business — email, marketing, sisteme peste tot — dar pentru viața noastră, pentru a avea un echilibru și a crește în toate ariile, nu avem un sistem.`
      },
      {
        id: 'viziunea-napoleon-hill',
        title: '2. Viziunea după Napoleon Hill: Scop, Dorință, Credință',
        content: `În primul rând, trebuie să ai **o viziune** — o viziune în care să crezi și să știi de ce vrei să realizezi acel lucru, fie că vorbim despre business, corp, relații sau spiritualitate.

Napoleon Hill spune că ai nevoie de trei lucruri fundamentale:

- **Viziune** — un scop clar definit
- **Dorință** — ardentă, necondiționată
- **Credință** — convingerea absolută că poți realiza acel lucru

Dar cum creezi credința dacă ești într-o groapă în care nu vezi nimic? Răspunsul: **prin autosugestie**.

### Declarația de Viziune — Cei 6 Pași Napoleon Hill

În CEO Mind OS, îți creezi o declarație personală de viziune, pe care o citești în fiecare dimineață și seară:

*„Eu, [Numele Tău], am un scop definit. Până la [data], voi fi transformat complet: Corp — [obiectivul tău fizic]. Spirit — [practica ta zilnică]. Relații — [angajamentul tău]. Business — [ținta financiară]. În schimb, eu ofer zilnic [ce dai în schimb]. Această declarație este sigilată cu credință absolută. Voi acționa ca și cum este deja realizată."*

Citind-o zilnic, hrănești subconștientul cu ceea ce vrei. 95% din viața noastră este rulată de subconștient — iar prin repetiție zilnică, subconștientul te va duce în direcția viziunii tale fără să realizezi conștient, până ajungi acolo.`
      },
      {
        id: 'rutina-razboinicului',
        title: '3. Rutina Războinicului: De la Copleșire la Acțiune',
        content: `Dimineața intri în platformă, vezi exact ce trebuie să faci. Intri în **Rutina Campionului** (sau Rutina Războinicului, cum îmi place să o numesc) și începi transformarea.

### AI Mind Coach — Antrenorul Tău Personal

Primul pas: conversația cu Mind Coach-ul AI, care este antrenat pe toată platforma, știe obiectivele tale, conversațiile din trecut, știe unde ești. Începi conversația pentru a schimba copleșirea asta și a te pune în starea de productivitate.

Exemplu real: „Am o grămadă de task-uri, nu știu de ce să mă apuc, parcă nu mai am chef să fac nimic." Mind Coach-ul te ajută să **izolezi ce contează cel mai mult**, să transformi „monstrul uriaș" într-un „pitic pe care îl poți controla" și să identifici primul pas concret.

### Recunoștința — Reset Emoțional

Creierul nostru nu poate percepe în același timp stresul, panica, anxietatea, frica **și** recunoștința. În momentul în care ești recunoscător — dar real, să simți în corpul tău — toată frica, anxietatea, toate lucrurile care perturbă performanța, **dispar**.

### Respirația — Controlul Sistemului Nervos

Sistemul nervos funcționează pe bază de respirație. Când ești panicat, respirația e rapidă, alertă — ești în Flight or Fight. Prin exerciții de respirație controlată, schimbi starea fiziologică.

### Meditația Ghidată de Empowerment

Meditația se creează automat pe obiectivele tale din toate ariile — combinând vizualizarea, legea atracției și programarea subconștientului. Vezi-te atingând fiecare obiectiv: corpul puternic, relațiile armonioase, business-ul în creștere.

### Autosugestia Zilnică

Mantrele zilnice reprogramează subconștientul:
- *„Every day, in every way, I am getting better and better."*
- *„Why do I solve everything that comes my way in a fun and easy way?"*

> „80% din tot ce facem este psihologie. Este identitatea pe care ne-o creăm, starea în care ne punem, locul de unde acționăm."*`
      },
      {
        id: 'core-4',
        title: '4. Cele 4 Arii Fundamentale — CORE 4',
        content: `CEO Mind OS nu este doar despre business. Este despre creștere în **toate ariile vieții**:

### 🏋️ Corp — Sănătate și Fitness

Dacă nu ai grijă de corpul tău, degeaba totul. Corpul determină starea noastră — cum ne simțim, felul în care ne mișcăm, încrederea noastră, absolut tot. Platforma include:
- Tracking antrenamente cu exerciții și repetări
- Meal Planning pentru nutriție organizată
- Obiective de greutate și compoziție corporală

### 💝 Relații — Investiție Zilnică

O relație, ca un business — nu investești în ea, se duce în jos. Apar problemele: lipsa conexiunii, a intimității, numai certuri.

**Tehnica zilnică**: Dedică câteva clipe pentru a adăuga valoare în relația cu soția/soțul și fiecare copil. Un mesaj de apreciere, un compliment, timp de calitate — fără să aștepți ceva în schimb.

> „Lucrul ăsta salvează căsătorii. Am lucrat cu oameni milionari, miliardari, care nu au vorbit cu copiii de ani de zile. Trimițând un mesaj consecvent, fără așteptări, repari încet-încet acea relație."

### 🧘 Spiritualitate — Meditație și Journaling

20 de minute de meditație zilnică, journaling, autosugestie — pentru claritate mentală și conectare cu scopul tău.

### 💼 Business — Content, Execuție, Task-uri

Content creation zilnic, învățare continuă, aplicare și predare a ceea ce ai învățat. Task-urile de business sunt structurate și prioritizate.`
      },
      {
        id: 'domino-door',
        title: '5. Domino Door: Planificarea Strategică Săptămânală',
        content: `În fiecare duminică, planifici următoarea săptămână în **Domino Door** — centrul de comandă strategic.

### Dominator-ul Săptămânal

Care este acel **un singur lucru** pe care, dacă îl faci, dărâmă toate celelalte? Acea acțiune ca lider, ca antreprenor, care face restul irelevant. De exemplu: „Creez webinarul — după aceea îl automatizez."

### Împărțirea în Chei Mici

Un Big Goal se împarte în chei mai mici, distribuite pe zilele săptămânii:
- **Luni-Marți**: Optimizare slide-uri, reînregistrare webinar
- **Miercuri**: Webinar „Înscrie-te cu un prieten"
- **Joi**: Adaugă o linie de venit B2B
- **Vineri**: Lansare carte / Lead Magnet

### Matricea Eisenhower pentru Idei

Când ai o idee nouă, o evaluezi prin matricea Eisenhower:
- **Urgent + Important** → Reacționezi imediat
- **Important + Neurgent** → Planifici și alegi ce să faci
- **Urgent + Neimportant** → Delegi
- **Neurgent + Neimportant** → Ștergi

### AI Planning

AI-ul te întreabă ce vrei să faci, de ce, care este prima cheie, și te ghidează prin întregul proces de planificare — astfel încât luni să mergi la birou și să știi exact ce execuți.`
      },
      {
        id: 'cta-final',
        title: '6. Sistemul Care Îți Schimbă Viața',
        content: `> „Indiferent unde ești acum, dacă nu ai un astfel de sistem — măcar pe hârtie — nu operezi la capacitatea ta maximă."

Nu ai timpul să faci ceea ce vrei tu, ce e important, pentru că consumi pe lucruri neimportante.

CEO Mind OS te pune într-o dispoziție mereu de **învingător, de lider** — nu de executant sau de negativist.

### Ce include platforma:

- ✅ **Rutina Războinicului** — rutină completă de dimineață cu AI Mind Coach
- ✅ **CORE 4** — creștere echilibrată: Corp, Relații, Spirit, Business
- ✅ **Domino Door** — planificare strategică săptămânală cu AI
- ✅ **Declarația Napoleon Hill** — viziune, credință, autosugestie
- ✅ **Meditație ghidată** — creată automat pe obiectivele tale
- ✅ **Accountability Coach** — asistentul tău personal 24/7
- ✅ **Programe și Challenge-uri** — Have It All Lifestyle Challenge, Personal Power, Ultimate You

### Începe Acum — 5 Zile Gratuit

Încearcă CEO Mind OS gratuit 5 zile și descoperă cum poate un sistem să-ți transforme complet dimineața, productivitatea și rezultatele.`
      }
    ]
  },
  {
    slug: 'walking-dead-antreprenor',
    titleRo: 'Walking Dead: De Ce Majoritatea Antreprenorilor Trăiesc o Zi pe Repeat',
    titleEn: 'Walking Dead: Why Most Entrepreneurs Live the Same Day on Repeat',
    excerpt: 'Descoperi de ce 90% dintre antreprenori repetă aceeași zi de 365 de ori pe an — și cum să ieși din acest ciclu toxic prin schimbarea identității.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO.',
    publishedAt: '2026-02-25',
    updatedAt: '2026-02-25',
    categories: ['Mindset'],
    readingTime: '8 min',
    metaDescription: 'De ce majoritatea antreprenorilor trăiesc aceeași zi pe repeat. Află cum să ieși din ciclul toxic al executantului și să devii CEO-ul propriei vieți.',
    metaKeywords: ['burnout antreprenor', 'mindset CEO', 'identitate antreprenor', 'productivitate', 'walking dead business'],
    sections: [
      {
        id: 'ziua-pe-repeat',
        title: '1. Ziua pe Repeat — Sindromul Walking Dead',
        content: `Te trezești dimineața cu aceeași senzație de copleșire. Aceeași cafea pe fugă, aceleași task-uri neterminate, aceleași probleme. Nu trăiești — **supraviețuiești**.

Mulți antreprenori ajung la finalul anului și realizează că au trăit o singură zi de 365 de ori. Nu au crescut, nu s-au transformat — au repetat aceleași pattern-uri distructive mascate sub eticheta de „muncă grea".

> „Definiția nebuniei este să faci același lucru iar și iar, așteptând rezultate diferite." — Albert Einstein`
      },
      {
        id: 'capcana-executantului',
        title: '2. Capcana Executantului',
        content: `Problema fundamentală: **nu ești CEO-ul vieții tale, ești cel mai bun angajat din propria firmă**. Reacționezi la urgențe în loc să creezi strategic. Stingi incendii în loc să construiești sisteme.

Executantul lucrează ÎN business. CEO-ul lucrează PE business. Diferența nu e de efort — e de identitate. Când te identifici ca executant, creierul tău filtrează realitatea prin acea lentilă și iei decizii de executant.`
      },
      {
        id: 'schimbarea-identitate',
        title: '3. Saltul de Identitate',
        content: `Transformarea începe cu o decizie: **nu mai accept această versiune a mea**. Nu ai nevoie de mai multe informații — ai nevoie de un sistem care să-ți susțină noua identitate zilnic.

CEO Mind OS te ajută să faci acest salt prin:
- **Declarația de viziune** citită zilnic — reprogramarea subconștientului
- **Rutina Războinicului** — acțiuni zilnice aliniate cu identitatea de CEO
- **AI Mind Coach** — conversații care te mențin în starea de lider

Primul pas? Recunoaște că repeți aceeași zi. Al doilea? Instalează un sistem care te scoate din ciclu.`
      }
    ]
  },
  {
    slug: 'de-ce-sistemele-esueaza',
    titleRo: 'De Ce Sistemele Eșuează: Diferența Dintre Informație și Transformare',
    titleEn: 'Why Systems Fail: The Difference Between Information and Transformation',
    excerpt: 'Ai citit 50 de cărți, ai fost la 10 cursuri, dar tot nu s-a schimbat nimic? Află de ce informația singură nu transformă și ce lipsește din ecuație.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO.',
    publishedAt: '2026-02-20',
    updatedAt: '2026-02-20',
    categories: ['Training'],
    readingTime: '7 min',
    metaDescription: 'De ce cursurile și cărțile nu funcționează singure. Descoperă diferența dintre informație și transformare și cum un sistem zilnic creează schimbarea reală.',
    metaKeywords: ['transformare personală', 'sisteme antreprenori', 'dezvoltare personală', 'informație vs transformare', 'CEO Mind OS'],
    sections: [
      {
        id: 'paradoxul-informatiei',
        title: '1. Paradoxul Informației',
        content: `Trăim în era cu cel mai mult acces la informație din istoria omenirii. Orice vrei să înveți este la un click distanță. Și totuși, **nivelul de burnout, anxietate și eșec antreprenorial nu a fost niciodată mai mare**.

De ce? Pentru că informația fără implementare este doar divertisment intelectual. Citești o carte, te simți motivat 3 zile, apoi revii la aceleași obiceiuri. Ciclul se repetă la infinit.`
      },
      {
        id: 'knowledge-gap',
        title: '2. The Knowledge-Action Gap',
        content: `Există o prăpastie enormă între **a ști** și **a face**. Știi că trebuie să te trezești devreme. Știi că trebuie să faci sport. Știi că trebuie să planifici. Dar nu o faci constant.

Motivul? Nu ai un **sistem de operare** care să transforme cunoștințele în acțiuni zilnice automate. Fără un sistem, depinzi de motivație — iar motivația este cel mai nesigur combustibil care există.`
      },
      {
        id: 'sistemul-vs-motivatie',
        title: '3. Sistemul vs. Motivația',
        content: `Un sistem funcționează indiferent de cum te simți. Nu aștepți să fii motivat — urmezi procesul. CEO Mind OS creează această structură:

- **Rutină zilnică** cu pași clari și măsurabili
- **Accountability** prin tracking și AI Coach
- **Feedback loop** — vezi progresul, ajustezi, continui

> „Nu te ridici la nivelul obiectivelor tale. Cazi la nivelul sistemelor tale." — James Clear

Transformarea reală vine din **repetiția zilnică** a unor acțiuni mici, susținute de un sistem inteligent care nu te lasă să cazi.`
      }
    ]
  },
  {
    slug: 'viziune-napoleon-hill-ceo',
    titleRo: 'Viziunea După Napoleon Hill: Cum Să-ți Creezi Scopul Definit ca CEO',
    titleEn: 'Vision After Napoleon Hill: How to Create Your Definite Purpose as CEO',
    excerpt: 'Cei 6 pași ai lui Napoleon Hill aplicați în era AI. Cum să-ți creezi declarația de viziune și să-ți reprogramezi subconștientul pentru succes ca antreprenor.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO.',
    publishedAt: '2026-02-15',
    updatedAt: '2026-02-15',
    categories: ['Mindset', 'Training'],
    readingTime: '10 min',
    metaDescription: 'Aplică cei 6 pași Napoleon Hill în era modernă. Creează-ți declarația de viziune ca CEO și reprogramează-ți subconștientul pentru succes antreprenorial.',
    metaKeywords: ['Napoleon Hill', 'viziune CEO', 'scop definit', 'autosugestie', 'Think and Grow Rich', 'declarație viziune', 'mindset antreprenor'],
    sections: [
      {
        id: 'napoleon-hill-modern',
        title: '1. Napoleon Hill în Era AI',
        content: `„Think and Grow Rich" a fost scrisă în 1937, dar principiile sunt eterne. Napoleon Hill a studiat 500 de milionari timp de 20 de ani și a descoperit un pattern comun: **toți aveau un scop definit și credința absolută că îl vor atinge**.

Cei 3 piloni fundamentali:
- **Viziune** — un scop clar, specific, cu deadline
- **Dorință** — ardentă, care te arde din interior
- **Credință** — convingerea că este deja realizat

Întrebarea este: cum creezi credință când ești într-o groapă? Răspunsul lui Hill: **autosugestia zilnică**.`
      },
      {
        id: 'declaratia-viziune',
        title: '2. Declarația de Viziune — Template Complet',
        content: `În CEO Mind OS, fiecare utilizator își creează o declarație personală bazată pe cei 6 pași Hill, adaptată pe cele 4 arii fundamentale:

*„Eu, [Numele], am un scop definit. Până la [data], voi fi transformat complet:*
- *Corp — [obiectiv fizic concret]*
- *Spirit — [practică zilnică]*
- *Relații — [angajament specific]*
- *Business — [țintă financiară]*

*În schimb, ofer zilnic: [ce dai]. Această declarație este sigilată cu credință absolută."*

O citești dimineața și seara. În 30 de zile, subconștientul tău începe să filtreze realitatea prin prisma viziunii — nu a fricilor.`
      },
      {
        id: 'autosugestia-practica',
        title: '3. Autosugestia în Practică',
        content: `95% din deciziile noastre sunt luate de subconștient. Autosugestia este procesul prin care **hrănești subconștientul cu instrucțiuni clare**.

Mantre zilnice recomandate:
- *„Every day, in every way, I am getting better and better."*
- *„Why do I solve everything in a fun and easy way?"*

CEO Mind OS automatizează acest proces: declarația apare în rutina de dimineață, meditația ghidată este generată pe obiectivele tale, iar AI Coach-ul te ghidează când credința scade.

> „Subconștientul nu distinge între o experiență reală și una imaginată intens." — Napoleon Hill`
      }
    ]
  },
  {
    slug: 'framework-4b-body-being-balance-business',
    titleRo: 'Framework-ul 4B: Corp, Minte, Echilibru și Business — Totul Într-un Sistem',
    titleEn: 'The 4B Framework: Body, Being, Balance & Business — Everything in One System',
    excerpt: 'Descoperă framework-ul 4B care integrează toate dimensiunile vieții într-un singur sistem de operare. Nu mai alege între succes și echilibru.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO.',
    publishedAt: '2026-02-10',
    updatedAt: '2026-02-10',
    categories: ['Training'],
    readingTime: '9 min',
    metaDescription: 'Framework-ul 4B: Body, Being, Balance, Business. Cum să integrezi toate dimensiunile vieții într-un sistem de operare unic pentru antreprenori.',
    metaKeywords: ['framework 4B', 'body being balance business', 'echilibru antreprenor', 'sistem operare CEO', 'CORE 4'],
    sections: [
      {
        id: 'de-ce-4b',
        title: '1. De Ce 4 Dimensiuni, Nu Una Singură?',
        content: `Majoritatea programelor de dezvoltare se concentrează pe o singură dimensiune: fie business, fie fitness, fie mindset. Dar viața nu funcționează în silos.

Când corpul suferă, business-ul suferă. Când relațiile sunt în criză, focusul dispare. Când mintea e toxică, totul se prăbușește. **Succesul real este holistic** — și necesită un sistem care adresează toate dimensiunile simultan.

Framework-ul 4B este răspunsul: **Body, Being, Balance, Business** — patru piloni interdependenți, tracked zilnic.`
      },
      {
        id: 'body-being',
        title: '2. Body & Being — Fundația',
        content: `**Body (Corp):** Corpul tău este vehiculul. Antrenamente structurate, nutriție trackuită, somn monitorizat. Nu e vorba de „six-pack" — e vorba de energie și reziliență. CEO Mind OS include workout tracking, meal planning și obiective personalizate.

**Being (Minte/Spirit):** Meditație zilnică, journaling, recunoștință, autosugestie. 20 de minute dimineața care schimbă toată ziua. Platforma generează meditații ghidate pe obiectivele tale și oferă un spațiu structurat de reflecție.`
      },
      {
        id: 'balance-business',
        title: '3. Balance & Business — Execuția',
        content: `**Balance (Relații/Echilibru):** Investiție zilnică în relațiile cheie. Un mesaj de apreciere, timp de calitate, acte de serviciu. Platforma te provoacă zilnic să adaugi valoare în relațiile cu familia și partenerii.

**Business (Afacere):** Content creation, outreach, execuție strategică. Nu task-uri aleatorii — acțiuni aliniate cu Dominator-ul săptămânal (obiectivul #1). Domino Door îți structurează săptămâna, iar AI Planning te ghidează prin proces.

> „Succesul fără echilibru este eșec déguisé. CEO Mind OS te ajută să ai ambele."

Toate cele 4 dimensiuni sunt vizibile într-un singur dashboard, cu scoruri zilnice și trend-uri săptămânale.`
      }
    ]
  },
  {
    slug: 'domino-door-planificare-strategica',
    titleRo: 'Domino Door: Planificarea Strategică Săptămânală Care Îți Triplează Rezultatele',
    titleEn: 'Domino Door: The Weekly Strategic Planning That Triples Your Results',
    excerpt: 'Cum să planifici fiecare săptămână folosind tehnica Dominator + Matricea Eisenhower + AI Planning. Sistemul complet de planificare pentru CEO.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — singurul sistem de operare pentru Founderi și CEO.',
    publishedAt: '2026-02-05',
    updatedAt: '2026-02-05',
    categories: ['Training', 'Business'],
    readingTime: '8 min',
    metaDescription: 'Domino Door — sistemul de planificare strategică săptămânală pentru antreprenori. Dominator, Matricea Eisenhower și AI Planning într-un singur framework.',
    metaKeywords: ['planificare strategică', 'Domino Door', 'Matricea Eisenhower', 'productivitate CEO', 'planificare săptămânală', 'dominator'],
    sections: [
      {
        id: 'dominator-concept',
        title: '1. Dominator-ul Săptămânal',
        content: `În fiecare duminică, răspunzi la o singură întrebare: **Care este acel UN SINGUR LUCRU pe care, dacă îl fac săptămâna aceasta, dărâmă toate celelalte?**

Aceasta este piesa de domino — acțiunea care, prin efectul de cascadă, face restul irelevant sau mult mai ușor. Nu 10 obiective, nu 5, ci **UNUL**.

Exemplu: „Lansez webinarul automatizat" → Asta rezolvă generarea de lead-uri, vânzările, și content-ul — totul dintr-o singură acțiune strategică.`
      },
      {
        id: 'cheile-zilnice',
        title: '2. Cheile Zilnice — De la Big Goal la Micro-Acțiuni',
        content: `Dominator-ul se împarte în **chei zilnice** — acțiuni concrete, executabile, distribuite pe zilele săptămânii:

- **Luni**: Research + outline webinar
- **Marți**: Slide-uri + script
- **Miercuri**: Înregistrare + editare
- **Joi**: Setup funnel + email sequence
- **Vineri**: Lansare + promovare

Fiecare cheie are un checkbox. La finalul săptămânii, vezi clar ce ai executat și ce nu. **Claritatea ucide procrastinarea.**`
      },
      {
        id: 'eisenhower-ai',
        title: '3. Matricea Eisenhower + AI Planning',
        content: `Când apare o idee sau un task neprevăzut, îl evaluezi instant:

| | Urgent | Ne-urgent |
|---|---|---|
| **Important** | Reacționezi imediat | Planifici (Domino Door) |
| **Neimportant** | Delegi | Ștergi |

AI Planning din CEO Mind OS te ajută să:
- Identifici Dominator-ul corect prin întrebări ghidate
- Împarți obiectivul în chei realiste
- Estimezi timpul necesar per cheie
- Ajustezi planul când apar urgențe

> „Planificarea nu elimină haosul — îl face gestionabil. Domino Door transformă haosul în execuție strategică."

Rezultatul? Luni dimineață știi exact ce faci. Nu mai pierzi 2 ore „gândindu-te la ce să faci".`
      }
    ]
  },
  {
    slug: 'startup-burnout-prevention',
    titleRo: 'Startup Burnout Prevention: Checklist-ul Founderului pentru 2026',
    titleEn: 'Startup Burnout Prevention: The Founder\'s Checklist for 2026',
    excerpt: 'Startup burnout nu apare peste noapte — se instalează în tăcere. Descoperă 8 semne timpurii și un checklist zilnic în 5 pași pentru a-l preveni fără să încetinești execuția.',
    author: 'Alin Florin Radu',
    authorBio: 'Fondator CEO Mind OS — sistemul de operare pentru Founderi. Ajută antreprenorii să crească fără să sacrifice sănătatea, relațiile sau pacea interioară.',
    publishedAt: '2026-07-03',
    updatedAt: '2026-07-03',
    categories: ['Mindset', 'Sănătate', 'Business'],
    readingTime: '9 min',
    metaDescription: 'Startup burnout prevention checklist: 8 early warning signs and a 5-step daily system founders use to stay sharp without sacrificing execution or health.',
    metaKeywords: ['startup burnout', 'founder burnout', 'burnout prevention', 'CEO wellbeing', 'entrepreneur mental health', 'warrior routine'],
    sections: [
      {
        id: 'why-founders-burn-out',
        title: '1. Why 63% of Founders Burn Out — And Why It\'s Preventable',
        content: `Startup burnout is not a badge of honor. It's a systems failure.

Recent studies from Startup Snapshot and Balderton Capital show **63% of founders** report symptoms of burnout, and **72% say it directly impacts their mental health**. The pattern is almost identical across industries: the founder outperforms their body, their relationships, and their nervous system — until one of them breaks first.

The uncomfortable truth is that burnout rarely arrives from working hard. It arrives from working hard **without a system to recover, prioritize, and course-correct**. Startup burnout prevention is not about doing less — it's about installing the operating system that lets you sustain intensity for years, not months.`
      },
      {
        id: 'early-warning-signs',
        title: '2. The 8 Early Warning Signs Most Founders Miss',
        content: `Burnout announces itself long before you collapse. If you notice 3 or more of these signs for two consecutive weeks, treat it as a red flag — not a phase.

1. **Morning dread** — you open your laptop with anxiety instead of curiosity.
2. **Decision fatigue by noon** — even trivial choices feel heavy.
3. **Shortened patience** with your team, co-founder, or family.
4. **Sleep quality drops** even when hours are the same.
5. **Cravings for sugar, alcohol, or dopamine loops** (Twitter, news, doom-scroll).
6. **Loss of vision clarity** — "why am I doing this?" starts creeping in.
7. **Physical symptoms**: chest tightness, jaw clenching, headaches, digestive issues.
8. **Cynicism** toward customers, investors, or your own product.

None of these are moral failures. They are your nervous system requesting maintenance.`
      },
      {
        id: 'daily-checklist',
        title: '3. The 5-Step Daily Burnout Prevention Checklist',
        content: `This is the exact checklist we teach inside CEO Mind OS as part of the Warrior Routine. It takes under 45 minutes and protects the 4 pillars: Body, Being, Balance, Business.

**Step 1 — Anchor the Body (10 min).** Sunlight in the first 30 minutes after waking, 500ml water, 10 minutes of movement (walk, breathwork, or mobility). This regulates cortisol before you touch a screen.

**Step 2 — Prime the Being (10 min).** Read your Napoleon Hill vision declaration out loud. Journal one sentence: "Today I will not sacrifice ___ for ___." This restores meaning before urgency hijacks the day.

**Step 3 — Lock the Domino (5 min).** Choose ONE Domino task — the single move that makes the rest of the day easier or unnecessary. Everything else is secondary.

**Step 4 — Protect the Balance (5 min).** Schedule one non-negotiable human interaction (partner, kid, friend, co-founder check-in that is not about work). Founders who guard this weekly report **47% lower burnout scores** in our internal audit.

**Step 5 — Close the Loop (15 min, evening).** Three questions: What worked? What drained me? What do I stop doing tomorrow? This is the compounding move — most founders never do it.`
      },
      {
        id: 'systemic-fixes',
        title: '4. Beyond the Checklist: Systemic Fixes That Compound',
        content: `A checklist buys you weeks. Systems buy you decades. If you want lasting startup burnout prevention, invest in the operating layer:

- **Calendar audit weekly** — remove any recurring meeting older than 90 days that no longer serves the current Domino.
- **Energy-first scheduling** — put deep work in your top-2 energy hours. Meetings live in your low-energy window, not the other way around.
- **Founder deload weeks** — every 10-12 weeks, schedule 3-5 days of zero pitching, zero new features, only recovery and reflection. This is not vacation; it is maintenance.
- **Accountability partner or coach** — not for advice, for pattern recognition. You cannot see your own blind spots at 3x speed.
- **Health telemetry** — HRV, sleep, resting heart rate. If your HRV drops 20% for a week, that is a fire alarm.

The founders who last 10+ years are not the toughest. They are the ones with the best feedback loops.`
      },
      {
        id: 'when-you-are-already-there',
        title: '5. If You\'re Already Burning Out: The 72-Hour Reset',
        content: `Prevention is ideal. But if you're reading this and already recognize yourself in 5+ warning signs, here is the emergency protocol:

**Hour 0-24 — Full stop.** Cancel every non-critical meeting for 3 days. Tell your team the truth: "I need 72 hours." Their trust in you will grow, not shrink.

**Hour 24-48 — Nervous system reset.** Sleep 9+ hours. Zero caffeine after noon. Two 30-minute walks in daylight. No pitch decks, no dashboards, no Twitter.

**Hour 48-72 — Reconnect with the "why".** Write, by hand, the answer to: *"If this company doubled next year but cost me my health or my marriage, would I still call it a win?"* Your honest answer is your next quarter's operating principle.

Then rebuild the daily checklist above. Slowly. Startup burnout prevention is a practice, not a project.

> "The mission is not to survive the sprint. The mission is to still be running the race in 2036."

Inside CEO Mind OS, the Warrior Routine, Domino Door, and AI Mind Coach are built exactly for this: to make burnout prevention automatic instead of heroic.`
      }
    ]
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getAllCategories = (): string[] => {
  const cats = new Set<string>();
  blogPosts.forEach(post => post.categories.forEach(c => cats.add(c)));
  return Array.from(cats);
};
