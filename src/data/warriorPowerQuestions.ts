// Warrior Power Assessment Quiz Data

export interface WarriorPowerLevel {
  range: [number, number, number];
  name: string;
  nameEn: string;
  title: string;
  description: string;
}

export interface WarriorPowerQuestion {
  id: string;
  dimension: 'body' | 'being' | 'balance' | 'business';
  dimensionName: string;
  dimensionNameEn: string;
  section: string;
  sectionEn: string;
  sectionDescription: string;
  levels: WarriorPowerLevel[];
}

export interface WarriorPowerScores {
  body_fitness: number;
  body_nutrition: number;
  being_connection: number;
  being_certainty: number;
  balance_relationship: number;
  balance_family: number;
  business_mechanics: number;
  business_money: number;
}

export const DIMENSION_INFO = {
  body: { name: 'Corpul', nameEn: 'Body', color: 'hsl(var(--chart-1))', icon: '💪' },
  being: { name: 'Ființa', nameEn: 'Being', color: 'hsl(var(--chart-2))', icon: '🧘' },
  balance: { name: 'Echilibru', nameEn: 'Balance', color: 'hsl(var(--chart-3))', icon: '⚖️' },
  business: { name: 'Business', nameEn: 'Business', color: 'hsl(var(--chart-4))', icon: '💼' },
};

export const WARRIOR_POWER_QUESTIONS: WarriorPowerQuestion[] = [
  // DIMENSION 1: CORPUL
  {
    id: 'body_fitness',
    dimension: 'body',
    dimensionName: 'Corpul',
    dimensionNameEn: 'Body',
    section: 'Exerciții',
    sectionEn: 'Fitness',
    sectionDescription: 'Starea și condiția de a fi sănătos și puternic din punct de vedere fizic, mai ales ca rezultat al exercițiilor fizice.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Corpul tău este irelevant pentru tine',
        description: 'Ești ignorant și leneș când vine vorba de exerciții fizice. Nu știi cum funcționează corpul tău și ignori complet realitatea legată de fitness. Nici măcar nu îți amintești ultima dată când ai fost la sală sau ai încercat măcar să transpiri. Nu ai acordat aproape deloc atenție modului în care corpul tău îți afectează viața, așa că fitness-ul nu face parte din realitatea ta. Ești supraponderal și/sau complet ieșit din formă și, sincer, nici nu-ți mai pasă de corpul tău.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Corpul tău este un obstacol pentru tine',
        description: 'Ești conștient și apreciezi ideea și beneficiile fitness-ului. Mergi la sală de câteva ori pe lună, dar fără o consistență reală care să îți transforme corpul. Știi cât de mult îți afectează corpul viața și îți dai seama că trebuie să îți îmbunătățești condiția fizică. Ai gânduri frecvente despre cum să îți îmbunătățești forma fizică, dar faci foarte puțin pentru a schimba lucrurile. Te antrenezi din când în când, dar corpul tău nu se schimbă, ceea ce te lasă mereu dezamăgit.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Corpul tău este un sprijin pentru tine',
        description: 'Ești foarte bine informat și activ în ceea ce privește fitness-ul. Ești consecvent în antrenamentele tale și te antrenezi între 3-5 ori pe săptămână de ani de zile pentru a-ți menține aspectul fizic actual. Ești extrem de conștient de impactul corpului tău asupra vieții tale și ai făcut o treabă bună menținându-ți fizicul an de an. Îți amintești vremurile când forțai progresul, dar în acest moment fitness-ul este un sprijin zilnic, nu o provocare.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Corpul tău este o armă pentru tine',
        description: 'Te antrenezi ca un atlet, cu pasiune și un scop clar. Nu doar că te antrenezi constant... Tu TE ANTRENEZI CU INTENSITATE. Te vezi pe tine ca pe un atlet, iar corpul tău este o armă prin care experimentezi viața. Îți stabilești provocări zilnice, săptămânale, lunare și trimestriale care îți împing corpul la un nou nivel, indiferent de vârstă. Pentru tine, competiția și fitness-ul sunt una și aceeași.'
      }
    ]
  },
  {
    id: 'body_nutrition',
    dimension: 'body',
    dimensionName: 'Corpul',
    dimensionNameEn: 'Body',
    section: 'Alimentație',
    sectionEn: 'Nutrition',
    sectionDescription: 'Substanțele consumate (mâncare, băuturi sau suplimente) pentru a susține viața, a furniza energie și a stimula creșterea și dezvoltarea.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Selecția alimentelor este irelevantă pentru tine',
        description: 'Nu știi aproape nimic despre nutriție și nu te gândești deloc la alimentația ta în mod conștient. Mănânci ceea ce ai în față, iar de cele mai multe ori, asta înseamnă fast food și alegeri nesănătoase pe care le-ai acceptat ca fiind normale. Îți alimentezi corpul cu alimente de calitate slabă și te confrunți des cu lipsa de energie, dar nu ai făcut niciodată legătura între ceea ce mănânci și modul în care trăiești.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Alimentația este un obstacol pentru tine',
        description: 'Ai început să studiezi puțin despre nutriție, dar încă nu înțelegi pe deplin efectele pe care mâncarea le are asupra stării tale generale de bine și a nivelului tău de energie. Ocazional alegi să mănânci „sănătos", dar dacă ești sincer cu tine, încă nu ai o idee clară despre ce înseamnă cu adevărat „mâncat sănătos". Ai învățat cel puțin că controlul porțiilor este un mod de a gestiona nutriția, dar tot te simți pierdut.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Alimentația este un sprijin pentru tine',
        description: 'Ai un plan general pentru alimentație și, chiar dacă nu mănânci perfect, ești mult mai conștient de ce și când consumi zilnic. Îți place să mănânci, dar începi să privești mâncarea mai mult ca pe un combustibil și mai puțin ca pe o sursă de plăcere. Ești foarte conștient de legătura dintre nivelul tău de energie și alimentele pe care le consumi.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Alimentația este o armă pentru tine',
        description: 'Privești mâncarea ca pe un combustibil esențial pentru un corp optimizat și puternic. Smoothie-uri verzi, suplimente și controlul porțiilor fac parte din rutina ta zilnică, iar mănânci pentru putere. Nu ești perfect în alimentație, dar te cunoști foarte bine, îți înțelegi tendințele și ai creat un plan de nutriție care îți oferă acces maxim la energie și putere.'
      }
    ]
  },
  // DIMENSION 2: FIINȚA
  {
    id: 'being_connection',
    dimension: 'being',
    dimensionName: 'Ființa',
    dimensionNameEn: 'Being',
    section: 'Conexiune',
    sectionEn: 'Connection',
    sectionDescription: 'Actul de a te conecta cu Sinele, Spiritul, Sursa, Dumnezeu.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Conexiunea ta spirituală este irelevantă pentru tine',
        description: 'Ești complet ignorant față de orice dincolo de ceea ce poți vedea cu ochii tăi. Ideea că ar putea exista ceva mai mare decât tine în lumea nevăzută ți se pare ridicolă. Nu crezi în Dumnezeu (sau orice altceva ar putea fi), iar viața de dinaintea nașterii tale sau de după moarte nu intră niciodată în preocupările tale.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Conexiunea ta spirituală este un obstacol pentru tine',
        description: 'Crezi într-un Dumnezeu sau simți că există o forță invizibilă care guvernează viața, dar nu știi cum să o accesezi sau cum funcționează. Ai momente în care cauți să înțelegi și să valorifici această legătură, dar te simți pierdut și nu ai o cale clară. Deși îți dorești să ai o relație mai profundă cu Divinitatea, acțiunile tale nu reflectă această dorință.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Conexiunea ta spirituală este un sprijin pentru tine',
        description: 'Știi că Dumnezeu există și ai experimentat puterea Sa în viața ta. Practici în mod regulat discipline spirituale care îți întăresc conexiunea și te sprijină în momentele dificile. Rugăciunea și/sau meditația fac parte din rutina ta, iar credințele tale spirituale contribuie activ la o viață mai fericită și mai împlinită.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Conexiunea ta spirituală este o armă pentru tine',
        description: 'Ai descoperit, prin experiență, că cea mai mare putere din această viață vine din ceea ce nu poate fi văzut. Simți zilnic o voce interioară care te ghidează, iar acum ai învățat să ai încredere în ea mai mult ca niciodată. Conexiunea ta spirituală nu este doar un sprijin, ci un element de bază al vieții tale. Te eliberează, te conduce și îți oferă claritate în fiecare zi.'
      }
    ]
  },
  {
    id: 'being_certainty',
    dimension: 'being',
    dimensionName: 'Ființa',
    dimensionNameEn: 'Being',
    section: 'Certitudine',
    sectionEn: 'Certainty',
    sectionDescription: 'Starea de convingere în propria persoană și în propriul drum în viață.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Cunoașterea de sine este irelevantă pentru tine',
        description: 'Nu vezi rostul să te înțelegi pe tine însuți. Nu ai nicio idee despre sentimentele tale, sistemele tale de credință, obiceiurile sau dependențele tale. Nici măcar nu ai luat în considerare faptul că autocunoașterea ar putea avea vreun impact asupra realității tale. Trăiești pe pilot automat – te trezești, îți faci treburile zilnice, mergi la culcare și repeți același joc în fiecare zi.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Cunoașterea de sine este un obstacol pentru tine',
        description: 'Ai realizat că viața ta este direct influențată de cine EȘTI. Ai început să explorezi cine ești, ce crezi și cum acestea îți afectează viața de zi cu zi. Te lupți să înțelegi de unde să începi această călătorie de autocunoaștere. Deși știi că acesta este secretul schimbării, încă nu ai reușit să-l aplici cu succes.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Cunoașterea de sine este un sprijin pentru tine',
        description: 'Ai devenit extrem de clar cu privire la cine ai fost și de ce ai făcut ceea ce ai făcut în trecut. Ești aproape obsedat de a-ți studia tiparele, valorile și motivațiile. Din această conștientizare de sine, ai început să produci schimbări semnificative în viața ta. Ai realizat că accesul la tine însuți este cheia pentru a înțelege viața.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Cunoașterea de sine este o armă pentru tine',
        description: 'TU EȘTI SCHIMBAREA pe care vrei să o vezi în lume. Știi 100% că nimic din lumea ta nu se schimbă fără să îți schimbi credințele, comportamentele și modul în care creezi. Autocunoașterea ta a devenit o artă, iar disciplinele tale zilnice de introspecție îți permit să îți transformi viața în fiecare aspect.'
      }
    ]
  },
  // DIMENSION 3: ECHILIBRU
  {
    id: 'balance_relationship',
    dimension: 'balance',
    dimensionName: 'Echilibru',
    dimensionNameEn: 'Balance',
    section: 'Căsnicie / Relații',
    sectionEn: 'Marriage / Relationships',
    sectionDescription: 'Uniunea legală și/sau emoțională dintre două persoane care aleg să își trăiască viața împreună, cu consecvență și angajament.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Relația ta este irelevantă pentru tine',
        description: 'Te lupți să înțelegi de ce te-ai căsătorit sau ai început această relație. Aproape tot ceea ce asociezi cu căsnicia/relația ta este bazat pe durere și frustrare. Viața voastră intimă este inexistentă, iar tu te-ai resemnat cu ideea că veți trăi așa, în suferință, pentru totdeauna. Nu comunicați aproape deloc, iar atunci când o faceți, discuțiile sunt superficiale și lipsite de sens.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Relația ta este un obstacol pentru tine',
        description: 'Înțelegi de ce vrei să fii căsătorit/angajat într-o relație, dar indiferent ce încerci, nu reușiți să vă sincronizați ca un cuplu. Viața voastră intimă a început să dea semne de viață, dar nu este nici pe departe ceea ce îți dorești. Începeți să comunicați pe subiecte mai profunde, dar aproape fiecare discuție sensibilă se transformă într-o ceartă.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Relația ta este un sprijin pentru tine',
        description: 'Partenera ta a devenit un adevărat aliat datorită faptului că ați învățat să comunicați unul cu celălalt. Pentru prima dată în viața ta, căsnicia/relația nu mai este o povară, ci o sursă de inspirație și motivație pentru amândoi. Viața voastră intimă nu este perfectă, dar vă conectați constant, ceea ce vă oferă împlinire și apropiere.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Relația ta este o armă pentru tine',
        description: 'Partenera ta este mai mult decât un aliat – a devenit literalmente o armă în viața ta. Comunicarea dintre voi este deschisă și autentică, iar viața voastră intimă este o sursă de energie, conexiune și inspirație pentru amândoi. Nu mai ai niciun dubiu despre faptul că ea este persoana potrivită și că veți fi împreună pentru totdeauna.'
      }
    ]
  },
  {
    id: 'balance_family',
    dimension: 'balance',
    dimensionName: 'Echilibru',
    dimensionNameEn: 'Balance',
    section: 'Copii / Familie',
    sectionEn: 'Children / Family',
    sectionDescription: 'Descendenții tăi – fiii și fiicele tale. (Dacă nu ai copii, înlocuiește cu familie, frați, prieteni apropiați sau alte persoane dragi.)',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Copiii tăi sunt irelevanți pentru tine',
        description: 'Îi eviți și faci tot posibilul să pasezi responsabilitățile de părinte soției, școlii, bisericii, guvernului sau chiar vecinilor. Te întrebi de ce ai devenit tată, iar dacă ești complet sincer, în multe zile îți dorești să nu fi avut niciodată această responsabilitate. Nu comunici aproape deloc cu copiii tăi.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Copiii tăi sunt un obstacol pentru tine',
        description: 'Încerci să te implici, dar abilitatea ta de a comunica este atât de slabă încât de fiecare dată când încerci totul o ia razna. Îți dorești să faci parte din viața lor, dar pur și simplu nu știi cum. Și cu fiecare zi care trece, devine tot mai greu să te conectezi cu ei. Totuși, îți lipsesc abilitățile fundamentale pentru a reuși să creezi o legătură reală.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Copiii tăi sunt un sprijin pentru tine',
        description: 'Îți iubești copiii, iar ei simt același lucru pentru tine – nu doar în vorbe, ci și în acțiuni. Ai conversații semnificative cu ei și le-ai construit încrederea astfel încât vin la tine atunci când au nevoie de sprijin în fața provocărilor vieții. Ești o parte activă în viața lor și poți simți cum legătura dintre voi devine tot mai puternică.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Copiii tăi sunt o sursă de putere pentru tine',
        description: 'Îți onorezi copiii și îi ghidezi spre creștere și dezvoltare. Nu îi vezi ca fiind „ai tăi", ci ca o responsabilitate sacră pe care ai primit-o pentru a-i îngriji și a-i ajuta să evolueze. Investiți timp, energie și bani în dezvoltarea lor zilnic. Rolul de tată îți oferă putere și inspirație.'
      }
    ]
  },
  // DIMENSION 4: BUSINESS
  {
    id: 'business_mechanics',
    dimension: 'business',
    dimensionName: 'Business',
    dimensionNameEn: 'Business',
    section: 'Mecanica Afacerii',
    sectionEn: 'Business Mechanics',
    sectionDescription: 'Arta și știința de a crea valoare pe piață și profit în afacerea ta (fie ca antreprenor, fie ca intraprenor).',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Afacerea ta este irelevantă pentru tine',
        description: 'Ai o afacere, dar eșuează și te deține ea pe tine, nu invers. Trăiești în lipsă și frică – de cele mai multe ori te gândești să renunți și să îți cauți un job unde să lucrezi pentru altcineva. Ești complet confuz în ceea ce privește marketingul, vânzările, livrarea serviciilor, sistemele, automatizările, contabilitatea și orice altceva legat de business.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Afacerea ta este un obstacol pentru tine',
        description: 'Ai o afacere și aceasta îți plătește facturile, dar te-a transformat într-un sclav, iar în tot acest proces ți-a furat bucuria. Ai un nivel foarte de bază de înțelegere a marketingului, vânzărilor, livrării, sistemelor și contabilității. Afacerea ta nu este pe pierdere în fiecare lună, dar îți consumă toată energia.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Afacerea ta este un sprijin pentru tine',
        description: 'Ai o afacere și ai învățat să O DEȚII TU, nu să te dețină ea pe tine. Pentru prima dată în cariera ta, simți că ai construit ceva cu adevărat special. Ai un nivel ridicat de expertiză în Marketing, Vânzări, Livrare, Sisteme, Automatizări, Contabilitate. Te simți în control deplin asupra afacerii și ești foarte profitabil.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Afacerea ta este o armă pentru tine',
        description: 'Ai o afacere de top în industrie și știi asta. Nu mai ai nicio grijă legată de dacă afacerea ta funcționează sau dacă va genera bani, deoarece ai stăpânit aceste aspecte iar echipa ta îți susține viziunea. Ai ieșit complet din mentalitatea de lipsă și frică și ai pășit într-o realitate unde prosperitatea este noua ta normalitate.'
      }
    ]
  },
  {
    id: 'business_money',
    dimension: 'business',
    dimensionName: 'Business',
    dimensionNameEn: 'Business',
    section: 'Bani',
    sectionEn: 'Money',
    sectionDescription: 'Moneda pe care ai generat-o prin producție și care acum este disponibilă pentru a fi cheltuită, împrumutată sau investită.',
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: 'Banii sunt irelevanți pentru tine',
        description: 'Nu ai un plan financiar și, dacă ești sincer cu tine, nici măcar nu te simți demn de a avea unul. Aproape 100% din energia ta mentală este concentrată pe supraviețuire, iar această mentalitate de lipsă îți îngustează viziunea și nu îți permite să vezi mai departe de ziua de azi. Riști totul doar pentru a supraviețui.'
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: 'Banii sunt un obstacol pentru tine',
        description: 'Ai pășit pentru prima dată în abundența financiară și începi să vezi importanța unui plan. Vezi oameni care au un plan și îți dorești și tu să creezi unul, dar poveștile din trecut legate de lipsă și frică sunt încă foarte puternice. Trăiești de la salariu la salariu și, indiferent cât de mult câștigi, cheltuiești aproape tot.'
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: 'Banii sunt un sprijin pentru tine',
        description: 'Ai depășit poveștile din trecut legate de lipsă și ai reușit să creezi un plan financiar solid. Simți cu adevărat abundența intrând în viața ta la niveluri pe care nici nu le credeai posibile înainte. Ideea de a reveni la haosul și nesiguranța financiară din trecut este de neconceput pentru tine.'
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: 'Banii sunt o armă pentru tine',
        description: 'Ai stabilizat abundența și ai un plan financiar care îți susține fiecare mișcare zilnică. Orice s-ar întâmpla în lume, știi că nu vei mai pierde niciodată ceea ce ai construit. Știi clar că restul vieții tale va fi dedicat construirii unui IMPERIU pe care să-l transmiți generațiilor viitoare.'
      }
    ]
  }
];

export function getLevelForScore(score: number): { name: string; nameEn: string } {
  if (score <= 3) return { name: 'Adormit', nameEn: 'Asleep' };
  if (score <= 6) return { name: 'Treaz', nameEn: 'Awake' };
  if (score <= 9) return { name: 'Activ', nameEn: 'Active' };
  return { name: 'Accelerat', nameEn: 'Accelerated' };
}

export function calculateDimensionScore(scores: Partial<WarriorPowerScores>, dimension: 'body' | 'being' | 'balance' | 'business'): number {
  switch (dimension) {
    case 'body':
      return (scores.body_fitness || 0) + (scores.body_nutrition || 0);
    case 'being':
      return (scores.being_connection || 0) + (scores.being_certainty || 0);
    case 'balance':
      return (scores.balance_relationship || 0) + (scores.balance_family || 0);
    case 'business':
      return (scores.business_mechanics || 0) + (scores.business_money || 0);
    default:
      return 0;
  }
}

export function calculateTotalScore(scores: Partial<WarriorPowerScores>): number {
  return Object.values(scores).reduce((sum, val) => sum + (val || 0), 0);
}

export function getScorePercentage(scores: Partial<WarriorPowerScores>): number {
  const total = calculateTotalScore(scores);
  const maxScore = 96; // 8 questions * 12 max each
  return Math.round((total / maxScore) * 100);
}

export function getOverallLevel(scores: Partial<WarriorPowerScores>): { name: string; nameEn: string } {
  const percentage = getScorePercentage(scores);
  if (percentage <= 25) return { name: 'Adormit', nameEn: 'Asleep' };
  if (percentage <= 50) return { name: 'Treaz', nameEn: 'Awake' };
  if (percentage <= 75) return { name: 'Activ', nameEn: 'Active' };
  return { name: 'Accelerat', nameEn: 'Accelerated' };
}
