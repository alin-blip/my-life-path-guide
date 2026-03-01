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
  sections: BlogPostSection[];
  metaDescription: string;
  metaKeywords: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'rutina-razboinicului-ceo-mind-os',
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
