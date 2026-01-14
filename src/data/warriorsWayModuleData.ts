// Complete module data with descriptions, key points, and action prompts
// Extracted from the 40 chapters of Warrior's Way

export interface ModuleData {
  id: string;
  title: string;
  duration: string;
  order: number;
  description: string;
  keyPoints: string[];
  actionPrompt: string;
  videoUrl?: string;
}

export const MODULE_DESCRIPTIONS: Record<string, Omit<ModuleData, 'id' | 'title' | 'duration' | 'order'>> = {
  // INTRO Section
  'intro-1': {
    description: 'Bine ai venit în călătoria Warrior\'s Way. Descoperă ce înseamnă să devii un Războinic modern și cum acest program îți va transforma viața.',
    keyPoints: [
      'Ce înseamnă să fii un Războinic în lumea modernă',
      'Structura programului și ce vei învăța',
      'Angajamentul necesar pentru transformare',
      'Prima ta declarație de intenție'
    ],
    actionPrompt: 'Scrie în jurnalul tău de ce ai ales să pornești pe această cale și ce speri să obții.'
  },
  'intro-2': {
    description: 'Cele 6 Etape ale Jocului reprezintă ciclul complet prin care trece fiecare Războinic: de la inconștientă la maestrie.',
    keyPoints: [
      'Ignoranța - nu știi că nu știi',
      'Conștientizarea - realizezi unde ești',
      'Competența conștientă - faci cu efort',
      'Maestria - devine a doua natură'
    ],
    actionPrompt: 'Identifică în care din cele 6 etape te afli acum în fiecare domeniu al vieții tale.'
  },
  'intro-3': {
    description: 'Cele 7 Nivele ale Jocului îți arată ierarhia nevoilor și aspirațiilor unui Războinic, de la supraviețuire la transcendență.',
    keyPoints: [
      'De la supraviețuire la prosperitate',
      'De la siguranță la libertate',
      'De la conexiune la impact',
      'Transcendența și moștenirea'
    ],
    actionPrompt: 'Evaluează la ce nivel te afli acum și stabilește următorul nivel țintă.'
  },
  'intro-4': {
    description: 'Cele 5 Investiții reprezintă resursele fundamentale pe care le ai la dispoziție: Timp, Energie, Atenție, Bani și Relații.',
    keyPoints: [
      'Timpul - resursa neregenerabilă',
      'Energia - combustibilul acțiunii',
      'Atenția - direcția puterii',
      'Banii și Relațiile - multiplicatorii'
    ],
    actionPrompt: 'Care dintre cele 5 investiții îți lipsește cel mai mult? Unde pierzi cel mai mult?'
  },
  'intro-5': {
    description: 'Cele 5 Protocoale care creează întregul sistem Warrior: Codul, Stack-ul, Core 4, Ușa și Jocul.',
    keyPoints: [
      'CODUL - fundamentul adevărului, Formula Warrior (Fapte, Sentimente, Focus, Rezultate)',
      'STACK-UL - sistemul de întrebări pentru navigarea gândurilor și emoțiilor',
      'CORE 4 - Corp, Spirit, Relații, Business - planul zilnic complet',
      'UȘA - accesarea unei realități superioare, deschiderea posibilităților',
      'JOCUL - angajamentul de a câștiga obiective imposibile'
    ],
    actionPrompt: 'Care protocol îți pare cel mai provocator? Pe care vrei să-l stăpânești primul?'
  },
  'intro-6': {
    description: 'Cele 5 Legi fundamentale care ghidează călătoria de la bărbat la Rege și la construirea unui Regat.',
    keyPoints: [
      'AI ÎNCREDERE ÎN PROCES - sistemul a fost testat pe zeci de mii de oameni',
      'DETALIILE CONTEAZĂ - lucrurile mici te distrug sau te construiesc',
      'FII AICI, ACUM - prezența este putere, fără prezență nu primești nimic',
      'NU RENUNȚA NICIODATĂ - călătoria e grea dar simplă',
      'AI GRIJĂ DE FRAȚII TĂI - nu ești singur, oferim când putem, luăm când avem nevoie'
    ],
    actionPrompt: 'Care lege ți se pare cea mai dificilă de respectat? Care necesită cea mai multă atenție?'
  },
  'intro-7': {
    description: 'Coeficientul Puterii și Warrior Time-Warp - sistemul de compunere exponențială a vitezei și rezultatelor.',
    keyPoints: [
      'WARRIOR TIME-WARP - comprimarea timpului prin intensitate și angajament',
      'Rezultatele care îți luau luni se vor produce în zile',
      'Be the Man → Be the King → Build the Kingdom - accelerarea pe fiecare nivel',
      'Întrebarea nu este "funcționează?" ci "TU VEI FACE MUNCA?"',
      'Cel mai mare iad: întâlnirea cu omul care ar fi trebuit să fii'
    ],
    actionPrompt: 'Răspunde sincer: TU funcționezi? Tu vei face munca? Care este angajamentul tău?'
  },

  // FUNDAMENT Section
  'fund-1': {
    description: 'Ce înseamnă să Ai Totul? Nu e vorba de posesiuni, ci de plinătatea interioară și capacitatea de a experimenta viața la maximum.',
    keyPoints: [
      'Definiția adevărată a abundenței',
      'Plinătatea interioară vs acumularea externă',
      'Cum să te simți complet în fiecare moment',
      'Paradoxul: cu cât dai mai mult, cu atât ai mai mult'
    ],
    actionPrompt: 'Listează 10 lucruri pentru care ești recunoscător ACUM și simte abundența prezentă.'
  },
  'fund-2': {
    description: 'Cele 3 E: Experiență, Expresie și Expansiune. Ciclul continuu al creșterii personale.',
    keyPoints: [
      'Experiența - ce trăiești și înveți',
      'Expresia - cum te manifești în lume',
      'Expansiunea - cum crești și te extinzi',
      'Ciclul continuu al evoluției'
    ],
    actionPrompt: 'Alege un domeniu unde vrei să te extinzi și planifică o experiență nouă pentru săptămâna aceasta.'
  },
  'fund-3': {
    description: 'Paradoxul Vieții: cu cât încerci mai mult să controlezi, cu atât pierzi mai mult control. Secretul e în acceptare și acțiune simultană.',
    keyPoints: [
      'Controlul vs fluența cu viața',
      'Acceptarea realității prezente',
      'Acțiunea din pace, nu din frică',
      'Încrederea în procesul vieții'
    ],
    actionPrompt: 'Identifică un lucru pe care încerci să-l controlezi obsesiv și practică eliberarea lui.'
  },
  'fund-4': {
    description: 'Alegerea Ta fundamentală: victimă sau creator? Reactivitate sau proactivitate? Această alegere definește totul.',
    keyPoints: [
      'Momentul alegerii - punctul zero',
      'Reactivitate vs proactivitate',
      'Responsabilitate totală',
      'Puterea de a alege răspunsul'
    ],
    actionPrompt: 'Observă azi câte decizii iei reactiv vs proactiv. Notează-le în jurnal.'
  },
  'fund-5': {
    description: 'Cele 4 Opțiuni pe care le ai în orice situație: Accept, Schimb, Părăsesc sau Sufăr. Alege conștient.',
    keyPoints: [
      'Accept - acceptarea completă fără rezistență',
      'Schimb - iau acțiune pentru a modifica',
      'Părăsesc - mă retrag din situație',
      'Sufăr - refuz să aleg (opțiunea toxică)'
    ],
    actionPrompt: 'Pentru fiecare situație stresantă din viața ta, decide: Accept, Schimb sau Părăsesc?'
  },
  'fund-6': {
    description: 'Care Este Costul? Totul are un preț. Întrebarea nu e dacă plătești, ci CE plătești și dacă merită.',
    keyPoints: [
      'Costul vizibil vs costul ascuns',
      'Costul inacțiunii',
      'Evaluarea corectă a prețurilor',
      'Investiție vs cheltuială'
    ],
    actionPrompt: 'Calculează costul real al unei decizii pe care o amâni. Ce pierzi în fiecare zi?'
  },
  'fund-7': {
    description: 'Filosofia Elitelor: cum gândesc și acționează cei care au reușit la cel mai înalt nivel.',
    keyPoints: [
      'Mentalitatea de abundență',
      'Gândirea pe termen lung',
      'Disciplina peste motivație',
      'Excelența ca standard, nu excepție'
    ],
    actionPrompt: 'Adoptă un obicei al elitelor pentru următoarele 30 de zile. Care va fi?'
  },

  // CODUL Section
  'cod-1': {
    description: 'Prăpastia și Vârful: ciclul etern al vieții. Fiecare vârf devine următoarea prăpastie, fiecare prăpastie devine următorul vârf.',
    keyPoints: [
      'Ciclurile naturale ale vieții',
      'De ce succesul duce la complacere',
      'Cum să folosești prăpastia ca trambulină',
      'Menținerea umilității la vârf'
    ],
    actionPrompt: 'Identifică unde te afli acum - prăpastie sau vârf? Ce lecție trebuie să înveți?'
  },
  'cod-2': {
    description: 'Fundamentul Adevărului: să trăiești în realitate, nu în iluzie. Adevărul te eliberează, minciuna te înlănțuie.',
    keyPoints: [
      'Onestitatea radicală cu tine',
      'Curajul de a vedea realitatea',
      'Eliminarea autoamăgirii',
      'Puterea vulnerabilității'
    ],
    actionPrompt: 'Scrie 3 adevăruri despre tine pe care le eviți. Confruntă-le azi.'
  },
  'cod-3': {
    description: 'Cele 4 Principii ale Codului: Honor, Integrity, Courage, Discipline - fundația caracterului Războinicului.',
    keyPoints: [
      'Honor - respectul de sine și al altora',
      'Integrity - alinierea gânduri-vorbe-fapte',
      'Courage - acțiunea în ciuda fricii',
      'Discipline - consecvența în timp'
    ],
    actionPrompt: 'Evaluează-te pe o scară de 1-10 pentru fiecare principiu. Ce trebuie îmbunătățit?'
  },
  'cod-4': {
    description: 'Trăind după Cod: cum să integrezi principiile în viața de zi cu zi, nu doar în momente speciale.',
    keyPoints: [
      'Codul în deciziile mici',
      'Consistența bate intensitatea',
      'Când Codul e testat cel mai tare',
      'Recuperarea după eșec'
    ],
    actionPrompt: 'Alege un principiu și trăiește-l la maximum pentru următoarele 24 de ore.'
  },
  'cod-5': {
    description: 'Codul în Acțiune: exemple practice și scenarii reale unde aplici Codul Războinicului.',
    keyPoints: [
      'Situații de business și Codul',
      'Relații și Codul',
      'Sănătate și Codul',
      'Când e greu să menții Codul'
    ],
    actionPrompt: 'Identifică o situație recentă unde nu ai urmat Codul. Ce ai face diferit?'
  },

  // FORMULA Section
  'form-1': {
    description: 'FACT - Fapte Reale: Prima etapă a formulei. Separarea faptelor de interpretări și povești.',
    keyPoints: [
      'Ce e un fapt vs ce e o poveste',
      'Cum ne mințim singuri',
      'Tehnici de identificare a faptelor',
      'Jurnalul faptelor'
    ],
    actionPrompt: 'Pentru o situație problematică, scrie DOAR faptele obiective, fără interpretări.'
  },
  'form-2': {
    description: 'FEELINGS - Sentimente Sincere: Recunoașterea și procesarea emoțiilor autentice.',
    keyPoints: [
      'Emoții primare vs secundare',
      'Cum să simți fără să reacționezi',
      'Inteligența emoțională practică',
      'Emoțiile ca mesageri'
    ],
    actionPrompt: 'Practică "check-in" emoțional de 3 ori azi. Ce simți cu adevărat?'
  },
  'form-3': {
    description: 'FOCUS - Focus Relevant: Direcționarea atenției spre ce contează cu adevărat.',
    keyPoints: [
      'Atenția ca resursă limitată',
      'Ce poți controla vs ce nu',
      'Eliminarea distragerilor',
      'Focus intențional'
    ],
    actionPrompt: 'Identifică top 3 priorități pentru săptămâna aceasta. Focusează-te DOAR pe ele.'
  },
  'form-4': {
    description: 'FRUIT - Rezultate Tangibile: Transformarea focusului în acțiuni și rezultate măsurabile.',
    keyPoints: [
      'De la intenție la acțiune',
      'Măsurarea progresului',
      'Ajustarea bazată pe rezultate',
      'Celebrarea victoriilor'
    ],
    actionPrompt: 'Stabilește un rezultat tangibil pentru săptămâna aceasta și creează planul de acțiune.'
  },

  // JOCUL Section
  'joc-1': {
    description: 'Frame Map - Harta Realității: Cum percepi lumea determină cum o experimentezi. Schimbă cadrul, schimbi totul.',
    keyPoints: [
      'Ce e un "frame" mental',
      'Cum cadrele limitează sau eliberează',
      'Tehnici de reframare',
      'Crearea cadrelor împuternicitoare'
    ],
    actionPrompt: 'Identifică un cadru limitant pe care îl folosești. Cum l-ai putea rescrie?'
  },
  'joc-2': {
    description: 'Freedom Map - Harta Libertății: Definirea libertății personale și crearea drumului spre ea.',
    keyPoints: [
      'Ce înseamnă libertatea pentru tine',
      'Libertate DE vs libertate PENTRU',
      'Pași concreți spre libertate',
      'Costul libertății'
    ],
    actionPrompt: 'Definește exact ce înseamnă libertatea pentru tine în fiecare domeniu al vieții.'
  },
  'joc-3': {
    description: 'Fire Map - Harta Focului: Pasiunea, motivația și energia care te împinge înainte.',
    keyPoints: [
      'Descoperirea pasiunii autentice',
      'Combustibilul motivației durabile',
      'Cum să menții focul aprins',
      'Transformarea fricii în foc'
    ],
    actionPrompt: 'Ce te aprinde cu adevărat? Scrie despre momentele când te-ai simțit cel mai viu.'
  },
  'joc-4': {
    description: 'Focus Map - Harta Concentrării: Unde îți îndrepți atenția, acolo curge energia.',
    keyPoints: [
      'Prioritizarea strategică',
      'Eliminarea neesențialului',
      'Concentrare profundă (Deep Work)',
      'Protejarea atenției'
    ],
    actionPrompt: 'Creează-ți "Focus Map" pentru luna aceasta. Ce primește atenția ta?'
  },
  'joc-5': {
    description: 'The Great Tapestry - Țesătura Mare: Cum toate piesele se conectează într-un întreg coerent.',
    keyPoints: [
      'Vederea de ansamblu',
      'Conexiunile dintre domenii',
      'Sinergia elementelor',
      'Viața ca operă de artă'
    ],
    actionPrompt: 'Desenează-ți propria "Great Tapestry" - cum se conectează toate domeniile vieții tale.'
  },

  // STACK Section
  'stack-1': {
    description: 'STOP - Oprește Haosul: Prima etapă a Stack-ului. Crearea spațiului mental prin oprirea gândurilor haotice.',
    keyPoints: [
      'Tehnica STOP în practică',
      'Oprirea reacțiilor automate',
      'Crearea pauzei sacre',
      'Respirația ca ancoră'
    ],
    actionPrompt: 'Practică STOP de 5 ori azi când simți stres sau reactivitate.'
  },
  'stack-2': {
    description: 'SUBMIT - Supunere Divină: Abandonarea egoului și conectarea cu ceva mai mare decât tine.',
    keyPoints: [
      'Supunere vs supunere',
      'Eliberarea controlului',
      'Încrederea în proces',
      'Conexiunea spirituală'
    ],
    actionPrompt: 'Practică predarea completă a unei situații pe care încerci să o controlezi.'
  },
  'stack-3': {
    description: 'STRUGGLE - Lupta cu Sinele: Confruntarea cu umbrele interioare și poveștile false.',
    keyPoints: [
      'Identificarea poveștilor toxice',
      'Lupta cu ego-ul',
      'Transformarea suferinței',
      'Puterea vulnerabilității'
    ],
    actionPrompt: 'Identifică o poveste limitantă pe care ți-o spui. Scrie versiunea adevărată.'
  },
  'stack-4': {
    description: 'STRIKE - Lovitura Finală: Acțiunea decisivă care vine din claritate și pace interioară.',
    keyPoints: [
      'Acțiune din pace, nu din frică',
      'Momentul potrivit pentru strike',
      'Precizia în acțiune',
      'Angajamentul total'
    ],
    actionPrompt: 'Identifică o acțiune pe care o tot amâni. Fă STRIKE azi.'
  },

  // CORE 4 Section
  'core-1': {
    description: 'BODY - Puterea Corpului: Templul fizic care susține toate celelalte domenii.',
    keyPoints: [
      'Corpul ca fundație a performanței',
      'Nutriție, mișcare, odihnă',
      'Energia fizică și mentală',
      'Disciplina corporală'
    ],
    actionPrompt: 'Evaluează-ți starea fizică actuală. Ce obicei mic poți îmbunătăți imediat?'
  },
  'core-2': {
    description: 'BEING - Spiritualitatea: Conexiunea cu esența ta și cu universul.',
    keyPoints: [
      'Meditația și prezența',
      'Sensul și scopul',
      'Conexiunea spirituală',
      'Practicile contemplative'
    ],
    actionPrompt: 'Stabilește o practică spirituală zilnică, chiar și de 5 minute.'
  },
  'core-3': {
    description: 'BALANCE - Relațiile: Echilibrul între dăruire și primire în relațiile cu ceilalți.',
    keyPoints: [
      'Relații de calitate vs cantitate',
      'Comunicarea autentică',
      'Granițe sănătoase',
      'Investiția în relații'
    ],
    actionPrompt: 'Identifică o relație importantă care are nevoie de atenție. Ce acțiune vei lua?'
  },
  'core-4': {
    description: 'BUSINESS - Prosperitatea: Crearea valorii și abundenței financiare.',
    keyPoints: [
      'Valoarea pe care o oferi lumii',
      'Mentalitatea de abundență',
      'Strategii de creștere',
      'Libertatea financiară'
    ],
    actionPrompt: 'Care e următorul pas concret pentru a crește valoarea pe care o oferi?'
  },
  'core-5': {
    description: 'Jocul Zilnic Core 4: Cum să integrezi toate cele 4 domenii în rutina zilnică.',
    keyPoints: [
      'Structura zilei ideale',
      'Micro-acțiuni în fiecare domeniu',
      'Echilibrarea priorităților',
      'Tracking și ajustare'
    ],
    actionPrompt: 'Creează-ți rutina zilnică Core 4 cu minimum o acțiune pentru fiecare domeniu.'
  },

  // UȘA Section
  'door-1': {
    description: 'Ușa - Stâlpul Perspectivei: Ușa reprezintă jocul producției zilnice. În timp ce stack-ul se ocupă de perspectivă și core four-ul de putere, ușa se concentrează pe producția zilnică.',
    keyPoints: [
      'Haosul abundenței și cum să-l gestionezi',
      'Cele 4 componente: Potențial, Plan, Producție, Profit',
      'A face mai puțin pentru a crea mai mult',
      'Sistemul de prioritizare'
    ],
    actionPrompt: 'Identifică un element din viața ta care ar putea deveni "Ușa" săptămânală.'
  },
  'door-2': {
    description: 'Ușa Posibilităților - Hot List: Tezaurul ideilor tale. Toate acțiunile potențiale capturate într-un singur loc.',
    keyPoints: [
      'Capturarea tuturor ideilor',
      'Organizarea Hot List',
      'Revizuirea săptămânală',
      'De la idee la acțiune'
    ],
    actionPrompt: 'Creează-ți Hot List-ul cu toate ideile și proiectele care îți vin în minte.'
  },
  'door-3': {
    description: 'Ușa Războiului - Cadranele Deciziei: Important vs Urgent. Alegeți deliberat ce e important dar nu urgent.',
    keyPoints: [
      'Matricea Eisenhower aplicată',
      'Focusul pe Important, nu Urgent',
      'Eliminarea distragărilor',
      'Decizii strategice zilnice'
    ],
    actionPrompt: 'Clasifică sarcinile tale actuale în cele 4 cadrane. Ce elimini? Ce prioritizezi?'
  },
  'door-4': {
    description: 'War Stack și Planificarea: Pregătirea strategică pentru săptămâna de luptă.',
    keyPoints: [
      'Planificarea săptămânală',
      'War Stack - pregătirea mentală',
      'Obiective clare și măsurabile',
      'Anticiparea obstacolelor'
    ],
    actionPrompt: 'Fă-ți War Stack pentru săptămâna viitoare duminica seara.'
  },
  'door-5': {
    description: 'Blackjack - Scorul 21: 4 lovituri pe zi x 5 zile = 20 + Ușa = 21 puncte pe săptămână.',
    keyPoints: [
      'Sistemul de scoring zilnic',
      'Cele 4 lovituri zilnice',
      'Consistența bate perfecțiunea',
      'Gamificarea productivității'
    ],
    actionPrompt: 'Începe să urmărești scorul tău Blackjack pentru săptămâna aceasta.'
  },
  'door-6': {
    description: 'Jocul Final al Profitului: Transformarea producției în rezultate tangibile și profitabile.',
    keyPoints: [
      'De la acțiune la rezultat',
      'Măsurarea profitului real',
      'Optimizarea pentru output',
      'Celebrarea victoriilor'
    ],
    actionPrompt: 'Definește ce înseamnă "profit" pentru tine în afara banilor. Ce alte rezultate contează?'
  },
  'door-7': {
    description: 'Cortul Generalului: Revizuirea săptămânală și planificarea strategică. Locul unde devii strateg, nu doar soldat.',
    keyPoints: [
      'Revizuirea săptămânală completă',
      'Analiza victoriilor și lecțiilor',
      'Planificarea săptămânii următoare',
      'Mentalitatea de general'
    ],
    actionPrompt: 'Stabilește un moment fix săptămânal pentru "Cortul Generalului". Când va fi?'
  }
};

// Helper function to get module data
export const getModuleData = (moduleId: string): Omit<ModuleData, 'id' | 'title' | 'duration' | 'order'> | undefined => {
  return MODULE_DESCRIPTIONS[moduleId];
};
