// Complete lesson scripts for Warrior's Way Knowledge Base
// Used by AI Mentor to answer user questions and direct them to lessons

export interface LessonScript {
  moduleId: string;
  sectionId: string;
  title: string;
  orderNumber: number;
  fullScript: string;
  summary: string;
  keyConcepts: string[];
  actionPrompts: string[];
  tags: string[];
}

export const LESSON_SCRIPTS: Record<string, LessonScript> = {
  // ============================================
  // INTRO SECTION - 7 Modules
  // ============================================
  
  'intro-1': {
    moduleId: 'intro-1',
    sectionId: 'intro',
    title: 'Punctul de Start - Groapa',
    orderNumber: 1,
    fullScript: `7 ani. 7 ani mi-au trebuit să descopăr, să testez și să dovedesc drumul unui războinic. 7 ani în care am trecut prin burnout, spitalizare și depresie profundă. Am ajuns în punctul în care doctorii nu mi-au mai dat nici o șansă. Soția mea a fost distrusă. Am fost o legumă mintală timp de un an. Dar tu... trebuie să treci prin același calvar? Sau vei alege un alt drum, unul care îți va transforma corpul, relațiile și afacerea fără să-ți pui familia și sănătatea în pericol?

GROAPA - Acolo am început. În mijlocul confuziei, fără claritate, fără direcție. Eram prins în propria mea viață. Am încercat totul – de la afaceri eșuate, la metode rapide de succes – dar nu știam ce vreau cu adevărat.

Sunt sigur că știi cum e – să sari dintr-o idee de afacere în alta, să speri că următoarea va fi "acea idee", dar să te trezești mereu în același punct: epuizat, dezamăgit și mai confuz ca niciodată.

SIMPTOMELE GROPII:
- Confuzie: Nu știam ce vreau cu adevărat.
- Sedare: Fumam, mâncam compulsiv, stăteam treaz nopți întregi, doar pentru a-mi amorți frica și durerea.
- Izolare: Îmi pierdeam familia și conexiunea cu cei dragi. Spuneam mereu "mai un pic și vin", în timp ce soția plângea după atenția mea.
- Burnout: Am ajuns la spital. Psihiatrie. Depresie adâncă. Mi-am îngrășat 30 de kilograme pentru că singura alinare era mâncarea.

MOMENTUL DE DECIZIE: Acesta a fost punctul meu de cotitură. În acel moment, mi-am spus: "Trebuie să fie mai mult în viață decât asta." Am decis că nu voi rămâne în groapă. Și așa am început să caut o soluție.

METODA WARRIOR: Am descoperit metoda Warrior. Un sistem care m-a ajutat să ies din groapă și să mă transform, fără să mă mai întorc vreodată. Nu era vorba de promisiuni goale sau motivație temporară. Era un sistem structurat, testat pe peste 65.000 de oameni – inclusiv pe mine.

REZULTATELE TRANSFORMĂRII:
- Am slăbit 30 de kilograme în 4 luni.
- Am trecut de la depresie la putere mentală.
- Am construit un business de consultanță care a generat peste 5 milioane de euro în 3 ani.
- Am trecut de la o relație toxică și infidelitate la o căsnicie plină de pasiune, scop și conexiune.
- Am devenit un tată și un soț ghidat de divinitate.

CELE 3 ETAPE ALE CĂLĂTORIEI:
1️⃣ Fii Bărbatul: Eradichează lipsa. Recâștigă-ți puterea și construiește un fundament solid al adevărului.
2️⃣ Fii Regele: Creează abundență – în corp, relații și afaceri.
3️⃣ Construiește Regatul: Creează o moștenire care să dureze generații.

Aceasta nu este o călătorie de un weekend. Este un proces de transformare care îți va schimba viața pentru totdeauna.`,
    summary: 'Prima lecție despre Groapă - punctul de pornire al oricărei transformări. Recunoașterea simptomelor gropii (confuzie, sedare, izolare, burnout) și momentul de decizie de a ieși. Introducere în cele 3 etape: Fii Bărbatul, Fii Regele, Construiește Regatul.',
    keyConcepts: ['Groapa', 'Simptomele gropii', 'Confuzie', 'Sedare', 'Izolare', 'Burnout', 'Momentul de decizie', 'Metoda Warrior', 'Cele 3 etape', 'Fii Bărbatul', 'Fii Regele', 'Construiește Regatul'],
    actionPrompts: ['Identifică în ce groapă te afli acum', 'Recunoaște simptomele gropii din viața ta', 'Ia decizia de schimbare'],
    tags: ['groapa', 'inceput', 'transformare', 'depresie', 'burnout', 'decizie', 'simptome', 'cele 3 etape']
  },

  'intro-2': {
    moduleId: 'intro-2',
    sectionId: 'intro',
    title: 'Cele 6 Etape ale Creșterii și Expansiunii',
    orderNumber: 2,
    fullScript: `Există o călătorie pe care fiecare bărbat o parcurge. O numim călătoria eroului, dar pentru mine, aceasta este călătoria de la "adormit" la "ascensionat". În fiecare dintre cele trei etape – "Fii Bărbatul", "Fii Regele" și "Construiește Regatul" – vei trece prin aceste 6 faze care îți vor transforma complet viața.

FAZA 1 – ADORMIT (Asleep): Prima fază este cea de "adormit". Este momentul în care ești complet inconștient de adevărurile fundamentale din viața ta. Gândește-te la asta: lucruri pe care astăzi le consideri normale – cum ar fi să conduci o afacere, să îți crești copiii sau să îți îmbunătățești relația – odată păreau imposibile sau pur și simplu nu existau pentru tine. Așa începe fiecare călătorie: într-un loc de ignoranță totală.

FAZA 2 – TREZIREA (Awake): Dar ceva se întâmplă... Un eveniment – fie un moment de panică, fie unul de durere profundă – te trezește. Poate fi un divorț neașteptat, o problemă gravă de sănătate sau o cădere în afaceri. Acesta este momentul în care îți dai seama că viața pe care o trăiești acum nu este tot ceea ce poate fi. Te trezești la posibilitatea că ceva mai bun este posibil. Faza de trezire te mută din ignoranță în conștiență. Este primul pas către schimbare.

FAZA 3 – ACTIVAREA (Activation): Din momentul în care te trezești, următorul pas este activarea. Aceasta presupune două lucruri:
1️⃣ Alinierea mentală – să îți schimbi gândirea, să înțelegi cine ești cu adevărat.
2️⃣ Dezvoltarea abilităților – să înveți noi metode și să îți dezvolți capacitățile de execuție.
Activarea este momentul în care începi să iei controlul asupra vieții tale. Îți ajustezi mentalitatea și îți construiești setul de abilități pentru a te muta din ceea ce este acum spre ceea ce poate fi.

FAZA 4 – APLICAREA (Application): Dar activarea nu este suficientă. Trebuie să aplici ceea ce înveți. Aplicarea înseamnă să obții rezultate reale, măsurabile, în corpul tău, în relațiile tale, în afaceri. Nu este vorba despre teorii. Nu este vorba despre idei notate într-un jurnal. Este vorba despre rezultate tangibile care îți arată că ceea ce faci funcționează. Fără aplicare, totul rămâne doar un vis. Aplicarea este ceea ce transformă potențialul în realitate.

FAZA 5 – ACCELERAREA (Acceleration): Când începi să aplici constant, rezultatele încep să accelereze. Aici, momentum-ul intră în joc. Îți dai seama ce funcționează și începi să repeți acele acțiuni. Identifici ce nu funcționează și elimini acele obstacole din viața ta. Crești frecvența și calitatea rezultatelor tale. Accelerarea este despre transformarea acțiunilor mici în progrese mari. Este despre crearea unui efect de bulgăre de zăpadă care te propulsează spre succes.

FAZA 6 – ASCENSIUNEA (Ascension): Ultima fază este ascensiunea. Este momentul în care nu mai ești același bărbat care ai fost. Ai evoluat. Te-ai ridicat. Să ascensionezi înseamnă să devii cine ai fost menit să fii – în corp, în minte, în relații și în afaceri. Este procesul prin care mori față de cine ai fost și renaști ca o versiune complet nouă a ta.

CICLUL CONTINUĂ: Odată ce ai ascensionat la o etapă, ciclul reîncepe. După ce ai devenit bărbatul, trebuie să te trezești din nou, de data aceasta ca rege. După ce devii regele, trebuie să treci din nou prin proces, de data aceasta ca un constructor de regate. De fiecare dată când te ridici, descoperi noi provocări și noi posibilități. Acest proces nu se oprește niciodată. Este un ciclu continuu de expansiune și creștere.`,
    summary: 'Cele 6 faze ale călătoriei de la "adormit" la "ascensionat": Adormit (ignoranță), Trezire (conștientizare), Activare (schimbare mentală + abilități), Aplicare (rezultate reale), Accelerare (momentum), Ascensiune (transformare completă). Ciclul se repetă la fiecare nivel.',
    keyConcepts: ['Cele 6 etape', 'Adormit', 'Trezire', 'Activare', 'Aplicare', 'Accelerare', 'Ascensiune', 'Călătoria eroului', 'Ciclul continuu', 'Momentum'],
    actionPrompts: ['Identifică faza în care te afli acum', 'Înțelege ce urmează în călătoria ta'],
    tags: ['etape', 'crestere', 'expansiune', 'trezire', 'activare', 'ascensiune', 'transformare', 'ciclu']
  },

  'intro-3': {
    moduleId: 'intro-3',
    sectionId: 'intro',
    title: 'Cele 7 Etape ale Ascensiunii Tale',
    orderNumber: 3,
    fullScript: `Aceste șapte opriri din acest joc sunt critice. Deși discutăm despre ele prin prisma etapelor "Fii Bărbatul", care presupune eradicarea mentalității de lipsă, "Fii Regele", care implică stabilirea abundenței, și extinderea moștenirii tale prin construirea unui Regat, procesul merge dincolo de acestea.

ETAPA 1: GROAPA (Pit)
Prima oprire este groapa. Acesta este locul întunecat în care ascundem secretele, jumătățile de adevăr, rușinea, vina și minciunile. Groapa este inhibitorul și frâna ta în procesul de creștere. Este, de asemenea, punctul de pornire pentru orice bărbat care dorește să construiască un regat. Fără un fundament solid al faptelor, nu poți construi viitorul pe care ți-l dorești. Dacă minți, fie prin comitere (spunând minciuni) sau omitere (reținând adevărul), viitorul tău va fi o iluzie.
"Procesul Gropii este despre descoperirea unui fundament real pe care să construiești un regat."

ETAPA 2: PUTEREA (Power)
După ce ai stabilit un fundament al adevărului, următoarea oprire este puterea. Aceasta presupune înțelegerea a ceea ce înseamnă puterea: cum să o accesezi, să o păstrezi și să o folosești în mod previzibil, zi de zi. Puterea devine combustibilul necesar pentru a-ți susține călătoria și a construi viitorul pe care îl dorești.
"Când fundamentul tău este fantezie și ficțiune, viitorul tău va fi doar o iluzie."

ETAPA 3: PERSPECTIVA (Perspective)
Următoarea oprire este perspectiva. Modul în care îți gestionezi poveștile din capul tău va determina dacă creezi regatul pe care îl dorești sau dacă ajungi să trăiești într-un regat în flăcări. Perspectiva implică înțelegerea psihologiei și influenței, atât asupra ta, cât și asupra celor din jurul tău.
"Modul în care te ocupi de poveștile tale va determina dacă îți creezi regatul dorit sau unul în ruină."

ETAPA 4: SCOPUL (Purpose)
Scopul este puntea care face tranziția dintre "Fii Bărbatul" și "Fii Regele". Aici începi să îți pui întrebări fundamentale: "De ce fac asta?", "Ce îmi doresc cu adevărat?". Este punctul în care descoperi motivația din spatele producției tale, fie că e vorba de bani, afaceri sau familie.
"Ce mă împinge și mă motivează în cele mai întunecate nopți și cele mai luminoase zile este un scop profund în spatele a ceea ce produc."

ETAPA 5: PRODUCȚIA (Production)
După ce ai trecut de scop, intri în etapa producției. Producția este standardul. Este ceea ce face diferența între a visa și a transforma acele vise în realitate. Producția implică generarea de rezultate concrete, fie în afaceri, fie în familie sau în relații.
"Producția este cheia: cerem rezultate, iar lumea noastră este condusă de rezultate."

ETAPA 6: PROFITUL (Profit)
Profitul nu înseamnă doar bani. Înseamnă abundență în toate domeniile vieții tale: în afaceri, în căsnicie, în familie. Înseamnă eliminarea sentimentului de lipsă și crearea unui mediu de creștere și prosperitate.
"Profitabilitatea devine standardul în afaceri, căsnicie și familie."

ETAPA 7: PROTECȚIA (Protection)
Ultima oprire este protecția. Aceasta implică asigurarea că ceea ce ai construit va rezista. Este despre procese, echipe și sisteme care îți permit să îți protejezi regatul și să accelerezi expansiunea. Este etapa în care te asiguri că moștenirea ta va dura generații.
"Protecția înseamnă să construiești sisteme și echipe care să garanteze că moștenirea ta va rezista."`,
    summary: 'Cele 7 opriri strategice ale călătoriei: Groapa (fundament de adevăr), Puterea (combustibil zilnic), Perspectiva (gestionarea poveștilor), Scopul (de ce faci ce faci), Producția (rezultate concrete), Profitul (abundență în toate domeniile), Protecția (sisteme și moștenire).',
    keyConcepts: ['Cele 7 etape', 'Groapa', 'Puterea', 'Perspectiva', 'Scopul', 'Producția', 'Profitul', 'Protecția', 'Fundament', 'Moștenire', 'Abundență'],
    actionPrompts: ['Care dintre cele 7 opriri necesită cea mai multă atenție în viața ta acum?'],
    tags: ['7 etape', 'groapa', 'putere', 'perspectiva', 'scop', 'productie', 'profit', 'protectie', 'mostenire']
  },

  'intro-4': {
    moduleId: 'intro-4',
    sectionId: 'intro',
    title: 'Cele 5 Investiții Esențiale ale Regelui Războinic',
    orderNumber: 4,
    fullScript: `Călătoria de la a fi un simplu bărbat la a deveni un Rege Războinic și, în final, la construirea unui Regat necesită înțelegerea celor cinci investiții distincte.

INVESTIȚIA #1: TIMP
Timpul este un concept interesant. Îl putem măsura cu ceasul, însă adevărata lui valoare se află într-un echilibru delicat între oportunitate și provocare. Timpul este măsurabil – de exemplu, dacă începi la ora 5 și termini la ora 6, ai investit 1 oră. Dar timpul singur nu este suficient – este necesar, dar nu e tot ce contează.

În această călătorie, de la a fi bărbat la a fi Rege și apoi la construirea unui Regat, este nevoie de timp petrecut sub presiune:
- Timp investit în spunerea adevărului
- Timp investit în Codul Warrior
- Timp investit în Stacking
- Timp investit în Core 4
- Timp investit în Jocul Vieții

Însă timpul, de unul singur, nu e suficient. Doar timpul ne asigură prezența, dar nu și progresul.

INVESTIȚIA #2: ENERGIA
Poți să-ți investești timpul într-o activitate, dar să fii complet absent. Să fii fizic prezent, dar lipsit de energie. Adevărata investiție vine atunci când energia ta este aliniată cu timpul investit. Energia înseamnă prezență, intensitate, concentrare, pasiune și furie controlată. Dacă iei un bărbat care își infuzează energia, certitudinea, prezența și spiritualitatea în timpul investit, ceea ce vei obține este o comprimare a timpului. Când energia și timpul sunt sincronizate, creșterea se accelerează exponențial.

INVESTIȚIA #3: DORINȚA
Dorința este combustibilul care unește timpul și energia. Fără dorință, vei rămâne blocat în același loc. Dorința este angajamentul interior de a merge mai departe spre un loc care, momentan, nu există. Fără dorință, te vei îneca în deșertul propriilor tale frustrări și îndoieli. Fără dorință, timpul și energia ta vor deveni doar o simplă pierdere de resurse. Dorința este cea care deschide calea spre destin.

INVESTIȚIA #4: BANII
Nu există un drum gratuit spre a deveni Rege și spre a construi un Regat. Nu există scurtături. Nu există oferte speciale sau promoții. Va fi nevoie să investești bani. Fiecare Regat construit de-a lungul istoriei a necesitat resurse financiare. Unde îți pui banii, acolo îți este și viitorul. Dacă vrei să știi angajamentul unui om, nu te uita la ceea ce spune. Nu te uita nici măcar la ceea ce face. Dacă vrei să înțelegi adevărata lui dedicare, vezi unde își investește BANII.

Timp + Energie + Dorință + Bani = Fundația pentru succes.

INVESTIȚIA #5: CREDINȚA
Acesta este lipiciul care unește toate celelalte patru investiții. Credința este curajul de a sări în necunoscut. Credința este a crede în ceva real, chiar dacă încă nu există. Credința este siguranța că în interiorul tău există un Rege, chiar dacă acum ești doar un bărbat. Credința este certitudinea că ai fost chemat să construiești un Regat, chiar dacă încă nu-l poți vedea.`,
    summary: 'Cele 5 investiții esențiale: TIMP (petrecut sub presiune), ENERGIE (prezență și intensitate), DORINȚA (combustibilul interior), BANII (resurse financiare), CREDINȚA (curajul de a sări în necunoscut). Formula: Timp + Energie + Dorință + Bani + Credință = Fundația succesului.',
    keyConcepts: ['Cele 5 investiții', 'Timp', 'Energie', 'Dorință', 'Bani', 'Credință', 'Fundație', 'Angajament', 'Comprimarea timpului'],
    actionPrompts: ['Care dintre cele 5 investiții îți lipsește cel mai mult?', 'Unde pierzi cel mai mult?'],
    tags: ['investitii', 'timp', 'energie', 'dorinta', 'bani', 'credinta', 'angajament', 'resurse']
  },

  'intro-5': {
    moduleId: 'intro-5',
    sectionId: 'intro',
    title: 'Cele 5 Protocoale ale Războinicului',
    orderNumber: 5,
    fullScript: `Există cinci protocoale distincte care, atunci când sunt urmate și aplicate consecvent, creează întregul sistem Warrior. Acest sistem este fundația pe care un Rege Războinic își începe, își maximizează și își extinde puterea, scopul, certitudinea, producția, profitul și protecția.

PROTOCOL #1: CODUL
Codul este fundația. Este sistemul operațional pe care îl vei adopta și după care vei trăi în această călătorie. Acest prim protocol trebuie înțeles și asimilat în totalitate, fiind punctul central al Challenge-ului Be the Man.

Regula de aur a Codului? 👉 Încetează să mai trăiești în minciună.

Fundamentul pe care îți construiești viața este bazat fie pe adevăr, fie pe ficțiune. Dacă baza ta este construită pe ficțiune, viitorul tău devine o fantezie. Dacă baza ta este construită pe fapte reale, viitorul tău devine o realitate posibilă.

Acest protocol introduce Formula Warrior, care include:
✅ Faptele – Realitatea nefiltrată, fără scuze sau justificări.
✅ Sentimentele – Conștientizarea și exprimarea lor autentică.
✅ Focusul – Direcția clară către care te îndrepți.
✅ Rezultatele – Măsura reală a progresului tău.

Aplicarea Codului începe cu Fact Map – un instrument care te ajută să vezi realitatea clar, fără distorsiuni.

PROTOCOL #2: STACK-UL
Dacă Codul este fundația, atunci Stack-ul este instrumentul care îți oferă perspectivă. Stack-ul este un sistem de întrebări specifice, concepute pentru a naviga printre gândurile, emoțiile și poveștile care îți controlează viața.

Fie că vorbim de:
- Stack-ul de furie
- Mega Stack-ul
- Stack-ul de recunoștință
- Stack-ul de claritate

Aceste instrumente sunt folosite zilnic pentru a înțelege și a rescrie poveștile false pe care ni le spunem. Stack-ul îți oferă capacitatea de a vedea lumea altfel, de a reîncadra realitatea și de a prelua controlul asupra gândurilor tale.

PROTOCOL #3: CORE 4
Odată ce ai construit Codul și ai dobândit claritate prin Stack, acum e timpul să aplici totul în viața reală.

Protocolul Core 4 este fundamentul pentru a avea TOTUL:
✅ Corp – Energie, vitalitate, antrenament, nutriție.
✅ Spirit – Meditație, conexiune spirituală, claritate interioară.
✅ Relații – Soția, copiii, familia, conexiuni autentice.
✅ Business – Profitabilitate, productivitate, expansiune.

Acest protocol este planul zilnic, care te asigură că nu te abați de la traseu și că progresezi în toate domeniile.

PROTOCOL #4: UȘA (The Door)
Aici începe adevărata transformare. Pe măsură ce aplici Core 4 în fiecare zi, începi să deschizi uși care înainte nici nu existau pentru tine.

Realități alternative devin posibile:
- Dacă acum câștigi 10.000€/lună, există o versiune a ta care face 50.000€/lună.
- Dacă acum ești prins într-un job, există o versiune a ta care trăiește liber și prosper.
- Dacă acum ai relații tensionate, există o versiune a ta care trăiește în armonie și iubire autentică.

Dar acele uși nu se deschid singure. Trebuie să îți focalizezi atenția și energia pentru a accesa următorul nivel. Ușa este punctul de tranziție către o versiune mai avansată a ta.

PROTOCOL #5: JOCUL
Până acum, ai învățat să:
✔ Trăiești pe baza Codului.
✔ Îți gestionezi perspectiva prin Stack.
✔ Aplici Core 4 zilnic pentru rezultate în toate domeniile.
✔ Deschizi uși spre noi posibilități.

Acum vine miza finală – înțelegerea că viața este un joc. Dar nu un joc obișnuit. Ci un joc al obiectivelor imposibile.

În Warrior, nu jucăm pentru câștiguri mici. Jucăm pentru victorii masive, pentru obiective care te fac să crești exponențial. În decurs de 1-2 ani, vei deveni un om pe care nimeni nu-l va recunoaște.

Jocul se rezumă la o singură întrebare: 👉 Cine trebuie să devii pentru a construi regatul tău?`,
    summary: 'Cele 5 protocoale Warrior: CODUL (fundația adevărului, Formula Warrior), STACK-UL (perspectivă și claritate mentală), CORE 4 (Corp, Spirit, Relații, Business), UȘA (accesarea realităților alternative), JOCUL (obiective imposibile și transformare completă).',
    keyConcepts: ['Cele 5 protocoale', 'Codul', 'Stack-ul', 'Core 4', 'Ușa', 'Jocul', 'Formula Warrior', 'Fact Map', 'Obiective imposibile', 'Perspectivă'],
    actionPrompts: ['Care protocol îți pare cel mai provocator?', 'Pe care vrei să-l stăpânești primul?'],
    tags: ['protocoale', 'codul', 'stack', 'core4', 'usa', 'jocul', 'formula warrior', 'sistem']
  },

  'intro-6': {
    moduleId: 'intro-6',
    sectionId: 'intro',
    title: 'Cele 5 Legi ale Războinicului',
    orderNumber: 6,
    fullScript: `Ce sunt legile? Legile sunt reguli, principii fundamentale care guvernează viața noastră. Trăim într-o lume definită de legi – fie că sunt stabilite de guverne, de societate sau de propriile noastre convingeri. La fel este și în Calea Războinicului.

LEGEA #1: AI ÎNCREDERE ÎN PROCES
Această lege pare simplă, dar pe măsură ce avansezi pe acest drum, va deveni esențială pentru succesul tău.

Sistemul Warrior NU a fost creat la întâmplare. Nu am început să lucrăm cu bărbați ca tine ieri. Acest sistem a fost testat de zeci de mii de oameni. Am trecut prin evenimente live, programe online, bootcamp-uri și experiențe care au transformat mii de bărbați.

Am observat un model clar:
✅ Cei care reușesc sunt cei care urmează procesul.
❌ Cei care eșuează sunt cei care refuză să aibă încredere.

Dacă propriile tale reguli ar fi funcționat, nu ai fi aici. Dacă regulile tale ți-ar fi oferit viața pe care ți-o dorești, nu ai fi căutat acest sistem. Deci prima regulă este simplă: Ai încredere în proces. Chiar și atunci când ai dubii. Chiar și atunci când ai vrea să renunți. Chiar și atunci când pare imposibil.

LEGEA #2: DETALIILE CONTEAZĂ
Detaliile fac diferența dintre succes și eșec. În fiecare protocol, misiune și exercițiu din acest program, vei găsi instrucțiuni clare. Dar dacă ignori detaliile, vei ajunge din nou pierdut.

Problemele din căsnicia ta? Nu sunt cauzate de lucruri mari.
Problemele din afacerea ta? Nu sunt cauzate de un singur eșec major.
Problemele tale de sănătate? Nu sunt cauzate de o singură zi proastă.

Te distrug lucrurile mici. Lucrurile mici pe care le ignori. Lucrurile mici pe care le eviți. Lucrurile mici pe care te prefaci că nu există.

Vrei rezultate? Fii atent la detalii.

LEGEA #3: FII AICI, ACUM
Prezența este putere. Dacă nu ești 100% implicat în acest proces, nu vei obține nimic.

Fiecare lecție, fiecare exercițiu, fiecare evoluție îți oferă oportunitatea de a schimba ceva în tine. Dar singurul mod în care vei primi revelațiile de care ai nevoie este dacă ești prezent.

✔ Fii prezent în exerciții.
✔ Fii prezent în conversații.
✔ Fii prezent în propriul tău proces de creștere.

Dacă faci lucrurile pe jumătate, vei obține jumătate de rezultate.

LEGEA #4: NU RENUNȚA NICIODATĂ
Aceasta este una dintre cele mai dure legi. Călătoria unui Războinic NU este ușoară.

❌ Este dureroasă.
❌ Este incomodă.
❌ Este plină de momente în care vei vrea să renunți.

Dacă ar fi ușor, toți ar face asta. Dacă ar fi simplu, toți ar avea succes.

Dar lumea este plină de oameni care caută scurtături: Droguri, Distrageri, "Trucuri rapide", Totul, mai puțin munca reală.

Dar aici este partea interesantă:
✔ Procesul este greu, dar este SIMPLU.
✔ Calea unui Războinic este provocatoare, dar nu este complicată.

Cel mai periculos moment? 👉 Când vei vrea să spui "GATA! Renunț!". Și vei ajunge acolo. Nu este o întrebare de "dacă", ci de "când". Când va deveni greu, CE VEI FACE?

LEGEA #5: AI GRIJĂ DE FRAȚII TĂI
Tu nu ești singur în această călătorie. Chiar dacă pare că ești singur. Chiar dacă te simți singur. În acest sistem, sunt mii de bărbați care trec prin aceleași lupte ca tine.

Și iată ce se întâmplă:
✔ Uneori, vei primi ajutor de la cineva care îți schimbă viața.
✔ Alteori, TU vei fi cel care ajută pe altcineva.

Când crezi că nu mai ai nimic de oferit, vei descoperi că altcineva are nevoie de tine.

Acest sistem funcționează pentru că toți împărtășim și contribuim:
📌 Oferim atunci când putem.
📌 Luăm atunci când avem nevoie.

Acest echilibru între a primi și a oferi este ceea ce face ca Warrior să funcționeze.`,
    summary: 'Cele 5 legi fundamentale: AI ÎNCREDERE ÎN PROCES (urmează sistemul testat), DETALIILE CONTEAZĂ (lucrurile mici te construiesc sau te distrug), FII AICI, ACUM (prezența este putere), NU RENUNȚA NICIODATĂ (procesul e greu dar simplu), AI GRIJĂ DE FRAȚII TĂI (comunitatea te susține).',
    keyConcepts: ['Cele 5 legi', 'Încredere în proces', 'Detaliile contează', 'Prezență', 'Nu renunța', 'Comunitate', 'Frații tăi', 'Angajament'],
    actionPrompts: ['Care lege ți se pare cea mai dificilă de respectat?', 'Ce provocări anticipezi?'],
    tags: ['legi', 'incredere', 'detalii', 'prezenta', 'perseverenta', 'comunitate', 'frati', 'reguli']
  },

  'intro-7': {
    moduleId: 'intro-7',
    sectionId: 'intro',
    title: 'Coeficientul Puterii & Warrior Time-Warp',
    orderNumber: 7,
    fullScript: `Așadar, în concluzie, vreau să îți amintești un lucru esențial: ai cheia pentru a accelera acest joc cu viteza pe care ți-o dorești.

Singura limitare în modul în care acest sistem a fost construit ești TU.

Eu nu pot să te oblig să faci munca. Eu nu pot să te forțez să te trezești în fiecare dimineață și să urmezi acest proces.

Dar chiar dacă aș putea, nu aș face-o. Pentru că dacă te-aș forța să faci asta, victoria nu ar fi a ta. Ar fi a mea. Pentru că în acel caz, eu aș fi cel care ar crede mai mult în viitorul tău decât o faci tu.

Acest joc, în care tocmai ai intrat, se numește WARRIOR TIME-WARP.

Este un sistem de compunere exponențială a puterii și vitezei. Rezultatele care îți luau luni sau ani să le obții se vor accelera radical. Dacă înainte îți lua o lună să obții un rezultat, după ce vei începe să trăiești acest stil de viață vei produce aceleași rezultate în câteva zile.

VITEZA CREȘTERII TALE SE VA MULTIPLICA

Pe măsură ce avansezi prin:
✔ Be the Man – eliminarea mentalității de sărăcie și frică
✔ Be the King – crearea unei vieți bazate pe abundență
✔ Build the Kingdom – lăsarea unei moșteniri, construirea unui imperiu

Vei observa un efect ciudat. Începi să pierzi noțiunea timpului.
✔ Lucruri pe care le credeai făcute acum câteva luni, s-au întâmplat acum 10 zile.
✔ Obiective care păreau imposibile în 5 ani, devin realitate în 3-4 luni.

Acesta NU este doar cazul meu.
✔ Mii de bărbați au demonstrat că acest sistem funcționează.
✔ Mii de bărbați au eliminat mentalitatea de lipsă și și-au recâștigat puterea.
✔ Mii de bărbați au ajuns în faza de Rege și și-au creat viața exact așa cum au vrut.

CÂND DEVII REGE, JOCUL SE SCHIMBĂ COMPLET

Odată ce ai trecut prin procesul de transformare, viteza la care gândești și creezi realitatea devine uluitoare.
✔ Oamenii care te-au cunoscut în trecut nu te mai recunosc.
✔ Rezultatele pe care le produci par miraculoase.
✔ Ceea ce părea imposibil devine normal.

De la un bărbat care doar supraviețuia, devii un Rege care creează, produce și își impune viziunea asupra lumii.

ÎNTREBAREA NU ESTE DACĂ FUNCȚIONEAZĂ… CI DACĂ TU VEI FACE MUNCA

Eu am început acest sistem acum mai bine de un deceniu. La început, era doar o teorie. În 2012, când l-am lansat pentru alți bărbați, nu știam sigur dacă va funcționa la scară largă.

Dar astăzi?
✅ Este un FAPT că Warrior FUNCȚIONEAZĂ.
✅ Este un FAPT că acest sistem a transformat mii de vieți.
✅ Este un FAPT că acest sistem te poate duce de la mediocritate la măreție.

Întrebarea nu mai este: ❌ "Oare funcționează?"
Singura întrebare este: ✔ "TU FUNCȚIONEZI?" ✔ "TU VEI FACE MUNCA?"

CARE ESTE COSTUL DACĂ NU O FACI?

Dacă tratezi acest sistem ca pe "încă un seminar", "încă un curs", "încă o experiență"... Dacă îl tratezi ca pe o altă distragere...

Care este costul?
🔻 Un mariaj distrus?
🔻 Un business care nu decolează?
🔻 Un corp lipsit de energie și vitalitate?
🔻 O viață fără sens și direcție?

Ce preț vei plăti dacă nu iei această decizie ACUM?

CEL MAI MARE IAD PE CARE ÎL POȚI TRĂI

Imaginează-ți că ai murit. Și pe cealaltă parte, te întâlnești cu bărbatul care trebuia să fii. Bărbatul pe care ai fost CHEMAT să-l devii, dar nu l-ai devenit niciodată.

Pentru mine, acela este cel mai mare iad posibil. Nu focul. Nu suferința. Nu judecata. Ci întâlnirea cu omul care ar fi trebuit să fiu.

De aceea, mesajul meu pentru tine este simplu: DEVINO ACEL OM.`,
    summary: 'Warrior Time-Warp: sistemul de compunere exponențială a puterii și vitezei. Rezultatele care luau luni se obțin în zile. Întrebarea nu e "funcționează?" ci "TU vei face munca?". Cel mai mare iad: întâlnirea cu omul care ar fi trebuit să fii dar nu ai devenit.',
    keyConcepts: ['Warrior Time-Warp', 'Compunere exponențială', 'Accelerare', 'Viteza creșterii', 'Costul inacțiunii', 'Cel mai mare iad', 'Angajament', 'Tu funcționezi?'],
    actionPrompts: ['Răspunde sincer: TU funcționezi?', 'Tu vei face munca?', 'Ce angajament îți iei?'],
    tags: ['time-warp', 'accelerare', 'viteza', 'rezultate', 'angajament', 'cost', 'transformare', 'actiune']
  }
};

// Helper function to get all lessons as array
export const getAllLessons = (): LessonScript[] => {
  return Object.values(LESSON_SCRIPTS);
};

// Helper to search lessons by keyword
export const searchLessons = (query: string): LessonScript[] => {
  const lowerQuery = query.toLowerCase();
  return Object.values(LESSON_SCRIPTS).filter(lesson => 
    lesson.title.toLowerCase().includes(lowerQuery) ||
    lesson.summary.toLowerCase().includes(lowerQuery) ||
    lesson.fullScript.toLowerCase().includes(lowerQuery) ||
    lesson.keyConcepts.some(c => c.toLowerCase().includes(lowerQuery)) ||
    lesson.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};
