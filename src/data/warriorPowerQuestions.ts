// Warrior Power Assessment Quiz Data

export interface BilingualString {
  ro: string;
  en: string;
}

export interface WarriorPowerLevel {
  range: [number, number, number];
  name: string;      // Romanian key (used for LEVEL_CONFIG lookup)
  nameEn: string;
  title: BilingualString;
  description: BilingualString;
}

export interface WarriorPowerQuestion {
  id: string;
  dimension: 'body' | 'being' | 'balance' | 'business';
  dimensionName: string;
  dimensionNameEn: string;
  section: string;
  sectionEn: string;
  sectionDescription: BilingualString;
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
  body:     { name: 'Corpul',   nameEn: 'Body',     color: 'hsl(var(--chart-1))', icon: '💪' },
  being:    { name: 'Ființa',   nameEn: 'Being',    color: 'hsl(var(--chart-2))', icon: '🧘' },
  balance:  { name: 'Echilibru',nameEn: 'Balance',  color: 'hsl(var(--chart-3))', icon: '⚖️' },
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
    sectionDescription: {
      ro: 'Starea și condiția de a fi sănătos și puternic din punct de vedere fizic, mai ales ca rezultat al exercițiilor fizice.',
      en: 'The state and condition of being healthy and strong from a physical standpoint, especially as the result of physical exercise.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Corpul tău este irelevant pentru tine',
          en: 'Your body is irrelevant to you',
        },
        description: {
          ro: 'Ești ignorant și leneș când vine vorba de exerciții fizice. Nu știi cum funcționează corpul tău și ignori complet realitatea legată de fitness. Nici măcar nu îți amintești ultima dată când ai fost la sală sau ai încercat măcar să transpiri. Nu ai acordat aproape deloc atenție modului în care corpul tău îți afectează viața, așa că fitness-ul nu face parte din realitatea ta. Ești supraponderal și/sau complet ieșit din formă și, sincer, nici nu-ți mai pasă de corpul tău.',
          en: "You are ignorant and lazy when it comes to physical exercise. You don't know how your body works and completely ignore the reality of fitness. You can't even remember the last time you went to the gym or tried to break a sweat. You've paid almost no attention to how your body affects your life, so fitness is not part of your reality. You are overweight and/or completely out of shape, and honestly, you don't even care about your body anymore.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Corpul tău este un obstacol pentru tine',
          en: 'Your body is an obstacle for you',
        },
        description: {
          ro: 'Ești conștient și apreciezi ideea și beneficiile fitness-ului. Mergi la sală de câteva ori pe lună, dar fără o consistență reală care să îți transforme corpul. Știi cât de mult îți afectează corpul viața și îți dai seama că trebuie să îți îmbunătățești condiția fizică. Ai gânduri frecvente despre cum să îți îmbunătățești forma fizică, dar faci foarte puțin pentru a schimba lucrurile. Te antrenezi din când în când, dar corpul tău nu se schimbă, ceea ce te lasă mereu dezamăgit.',
          en: "You are aware of and appreciate the idea and benefits of fitness. You go to the gym a few times a month, but without real consistency that would transform your body. You know how much your body affects your life and realize you need to improve your physical condition. You frequently think about how to improve your physique, but do very little to change things. You train occasionally, but your body doesn't change, which always leaves you disappointed.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Corpul tău este un sprijin pentru tine',
          en: 'Your body is a support for you',
        },
        description: {
          ro: 'Ești foarte bine informat și activ în ceea ce privește fitness-ul. Ești consecvent în antrenamentele tale și te antrenezi între 3-5 ori pe săptămână de ani de zile pentru a-ți menține aspectul fizic actual. Ești extrem de conștient de impactul corpului tău asupra vieții tale și ai făcut o treabă bună menținându-ți fizicul an de an. Îți amintești vremurile când forțai progresul, dar în acest moment fitness-ul este un sprijin zilnic, nu o provocare.',
          en: "You are very well-informed and active when it comes to fitness. You are consistent in your training and work out 3–5 times per week, year after year, to maintain your current physique. You are extremely aware of your body's impact on your life and have done a great job maintaining your physical condition year after year. You remember the days when you pushed for progress, but right now fitness is a daily support, not a challenge.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Corpul tău este o armă pentru tine',
          en: 'Your body is a weapon for you',
        },
        description: {
          ro: 'Te antrenezi ca un atlet, cu pasiune și un scop clar. Nu doar că te antrenezi constant... Tu TE ANTRENEZI CU INTENSITATE. Te vezi pe tine ca pe un atlet, iar corpul tău este o armă prin care experimentezi viața. Îți stabilești provocări zilnice, săptămânale, lunare și trimestriale care îți împing corpul la un nou nivel, indiferent de vârstă. Pentru tine, competiția și fitness-ul sunt una și aceeași.',
          en: 'You train like an athlete, with passion and a clear purpose. You don\'t just work out… you TRAIN WITH INTENSITY. You see yourself as an athlete, and your body is a weapon through which you experience life. You set daily, weekly, monthly, and quarterly challenges that push your body to a new level, regardless of age. For you, competition and fitness are one and the same.',
        },
      },
    ],
  },
  {
    id: 'body_nutrition',
    dimension: 'body',
    dimensionName: 'Corpul',
    dimensionNameEn: 'Body',
    section: 'Alimentație',
    sectionEn: 'Nutrition',
    sectionDescription: {
      ro: 'Substanțele consumate (mâncare, băuturi sau suplimente) pentru a susține viața, a furniza energie și a stimula creșterea și dezvoltarea.',
      en: 'The substances consumed (food, drinks, or supplements) to sustain life, provide energy, and promote growth and development.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Selecția alimentelor este irelevantă pentru tine',
          en: 'Food selection is irrelevant to you',
        },
        description: {
          ro: 'Nu știi aproape nimic despre nutriție și nu te gândești deloc la alimentația ta în mod conștient. Mănânci ceea ce ai în față, iar de cele mai multe ori, asta înseamnă fast food și alegeri nesănătoase pe care le-ai acceptat ca fiind normale. Îți alimentezi corpul cu alimente de calitate slabă și te confrunți des cu lipsa de energie, dar nu ai făcut niciodată legătura între ceea ce mănânci și modul în care trăiești.',
          en: "You know almost nothing about nutrition and never think consciously about what you eat. You eat whatever is in front of you, and most of the time that means fast food and unhealthy choices you've accepted as normal. You fuel your body with low-quality food and frequently deal with low energy, but you've never connected what you eat with how you live.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Alimentația este un obstacol pentru tine',
          en: 'Nutrition is an obstacle for you',
        },
        description: {
          ro: 'Ai început să studiezi puțin despre nutriție, dar încă nu înțelegi pe deplin efectele pe care mâncarea le are asupra stării tale generale de bine și a nivelului tău de energie. Ocazional alegi să mănânci „sănătos", dar dacă ești sincer cu tine, încă nu ai o idee clară despre ce înseamnă cu adevărat „mâncat sănătos". Ai învățat cel puțin că controlul porțiilor este un mod de a gestiona nutriția, dar tot te simți pierdut.',
          en: "You've started studying a little about nutrition, but still don't fully understand the effects food has on your overall wellbeing and energy levels. You occasionally choose to eat 'healthy,' but if you're honest with yourself, you still have no clear idea what 'eating healthy' actually means. You've learned at least that portion control is a way to manage nutrition, but you still feel lost.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Alimentația este un sprijin pentru tine',
          en: 'Nutrition is a support for you',
        },
        description: {
          ro: 'Ai un plan general pentru alimentație și, chiar dacă nu mănânci perfect, ești mult mai conștient de ce și când consumi zilnic. Îți place să mănânci, dar începi să privești mâncarea mai mult ca pe un combustibil și mai puțin ca pe o sursă de plăcere. Ești foarte conștient de legătura dintre nivelul tău de energie și alimentele pe care le consumi.',
          en: "You have a general plan for eating and, even if you don't eat perfectly, you are much more aware of what and when you consume daily. You enjoy eating, but you're starting to see food more as fuel and less as a source of pleasure. You are very aware of the connection between your energy levels and the foods you consume.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Alimentația este o armă pentru tine',
          en: 'Nutrition is a weapon for you',
        },
        description: {
          ro: 'Privești mâncarea ca pe un combustibil esențial pentru un corp optimizat și puternic. Smoothie-uri verzi, suplimente și controlul porțiilor fac parte din rutina ta zilnică, iar mănânci pentru putere. Nu ești perfect în alimentație, dar te cunoști foarte bine, îți înțelegi tendințele și ai creat un plan de nutriție care îți oferă acces maxim la energie și putere.',
          en: "You see food as essential fuel for an optimized and powerful body. Green smoothies, supplements, and portion control are part of your daily routine, and you eat for power. You're not perfect in your nutrition, but you know yourself very well, understand your tendencies, and have created a nutrition plan that gives you maximum access to energy and strength.",
        },
      },
    ],
  },
  // DIMENSION 2: FIINȚA
  {
    id: 'being_connection',
    dimension: 'being',
    dimensionName: 'Ființa',
    dimensionNameEn: 'Being',
    section: 'Conexiune',
    sectionEn: 'Connection',
    sectionDescription: {
      ro: 'Actul de a te conecta cu Sinele, Spiritul, Sursa, Dumnezeu.',
      en: 'The act of connecting with the Self, Spirit, Source, God.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Conexiunea ta spirituală este irelevantă pentru tine',
          en: 'Your spiritual connection is irrelevant to you',
        },
        description: {
          ro: 'Ești complet ignorant față de orice dincolo de ceea ce poți vedea cu ochii tăi. Ideea că ar putea exista ceva mai mare decât tine în lumea nevăzută ți se pare ridicolă. Nu crezi în Dumnezeu (sau orice altceva ar putea fi), iar viața de dinaintea nașterii tale sau de după moarte nu intră niciodată în preocupările tale.',
          en: "You are completely ignorant of anything beyond what you can see with your eyes. The idea that there might be something greater than you in the unseen world seems ridiculous to you. You don't believe in God (or whatever it might be), and life before your birth or after your death never enters your thoughts.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Conexiunea ta spirituală este un obstacol pentru tine',
          en: 'Your spiritual connection is an obstacle for you',
        },
        description: {
          ro: 'Crezi într-un Dumnezeu sau simți că există o forță invizibilă care guvernează viața, dar nu știi cum să o accesezi sau cum funcționează. Ai momente în care cauți să înțelegi și să valorifici această legătură, dar te simți pierdut și nu ai o cale clară. Deși îți dorești să ai o relație mai profundă cu Divinitatea, acțiunile tale nu reflectă această dorință.',
          en: "You believe in God or sense there is an invisible force governing life, but you don't know how to access it or how it works. You have moments when you seek to understand and leverage this connection, but you feel lost and have no clear path. Although you desire a deeper relationship with the Divine, your actions don't reflect that desire.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Conexiunea ta spirituală este un sprijin pentru tine',
          en: 'Your spiritual connection is a support for you',
        },
        description: {
          ro: 'Știi că Dumnezeu există și ai experimentat puterea Sa în viața ta. Practici în mod regulat discipline spirituale care îți întăresc conexiunea și te sprijină în momentele dificile. Rugăciunea și/sau meditația fac parte din rutina ta, iar credințele tale spirituale contribuie activ la o viață mai fericită și mai împlinită.',
          en: "You know God exists and have experienced His power in your life. You regularly practice spiritual disciplines that strengthen your connection and support you in difficult moments. Prayer and/or meditation are part of your routine, and your spiritual beliefs actively contribute to a happier, more fulfilling life.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Conexiunea ta spirituală este o armă pentru tine',
          en: 'Your spiritual connection is a weapon for you',
        },
        description: {
          ro: 'Ai descoperit, prin experiență, că cea mai mare putere din această viață vine din ceea ce nu poate fi văzut. Simți zilnic o voce interioară care te ghidează, iar acum ai învățat să ai încredere în ea mai mult ca niciodată. Conexiunea ta spirituală nu este doar un sprijin, ci un element de bază al vieții tale. Te eliberează, te conduce și îți oferă claritate în fiecare zi.',
          en: "You have discovered, through experience, that the greatest power in this life comes from what cannot be seen. You daily feel an inner voice guiding you, and you've now learned to trust it more than ever. Your spiritual connection is not just a support — it is a foundational element of your life. It frees you, leads you, and gives you clarity every day.",
        },
      },
    ],
  },
  {
    id: 'being_certainty',
    dimension: 'being',
    dimensionName: 'Ființa',
    dimensionNameEn: 'Being',
    section: 'Certitudine',
    sectionEn: 'Certainty',
    sectionDescription: {
      ro: 'Starea de convingere în propria persoană și în propriul drum în viață.',
      en: 'The state of conviction in oneself and in one\'s own path in life.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Cunoașterea de sine este irelevantă pentru tine',
          en: 'Self-knowledge is irrelevant to you',
        },
        description: {
          ro: 'Nu vezi rostul să te înțelegi pe tine însuți. Nu ai nicio idee despre sentimentele tale, sistemele tale de credință, obiceiurile sau dependențele tale. Nici măcar nu ai luat în considerare faptul că autocunoașterea ar putea avea vreun impact asupra realității tale. Trăiești pe pilot automat – te trezești, îți faci treburile zilnice, mergi la culcare și repeți același joc în fiecare zi.',
          en: "You see no point in understanding yourself. You have no idea about your feelings, belief systems, habits, or addictions. You haven't even considered that self-awareness might have any impact on your reality. You live on autopilot — you wake up, go through your daily routine, go to sleep, and repeat the same game every day.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Cunoașterea de sine este un obstacol pentru tine',
          en: 'Self-knowledge is an obstacle for you',
        },
        description: {
          ro: 'Ai realizat că viața ta este direct influențată de cine EȘTI. Ai început să explorezi cine ești, ce crezi și cum acestea îți afectează viața de zi cu zi. Te lupți să înțelegi de unde să începi această călătorie de autocunoaștere. Deși știi că acesta este secretul schimbării, încă nu ai reușit să-l aplici cu succes.',
          en: "You've realized that your life is directly influenced by who you ARE. You've started exploring who you are, what you believe, and how these affect your daily life. You struggle to understand where to start this journey of self-discovery. Although you know this is the secret to change, you haven't yet managed to apply it successfully.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Cunoașterea de sine este un sprijin pentru tine',
          en: 'Self-knowledge is a support for you',
        },
        description: {
          ro: 'Ai devenit extrem de clar cu privire la cine ai fost și de ce ai făcut ceea ce ai făcut în trecut. Ești aproape obsedat de a-ți studia tiparele, valorile și motivațiile. Din această conștientizare de sine, ai început să produci schimbări semnificative în viața ta. Ai realizat că accesul la tine însuți este cheia pentru a înțelege viața.',
          en: "You have become extremely clear about who you were and why you did what you did in the past. You are almost obsessed with studying your patterns, values, and motivations. From this self-awareness, you've started producing significant changes in your life. You've realized that access to yourself is the key to understanding life.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Cunoașterea de sine este o armă pentru tine',
          en: 'Self-knowledge is a weapon for you',
        },
        description: {
          ro: 'TU EȘTI SCHIMBAREA pe care vrei să o vezi în lume. Știi 100% că nimic din lumea ta nu se schimbă fără să îți schimbi credințele, comportamentele și modul în care creezi. Autocunoașterea ta a devenit o artă, iar disciplinele tale zilnice de introspecție îți permit să îți transformi viața în fiecare aspect.',
          en: "YOU ARE THE CHANGE you wish to see in the world. You know 100% that nothing in your world changes without changing your beliefs, behaviors, and the way you create. Your self-knowledge has become an art, and your daily introspection disciplines allow you to transform your life in every aspect.",
        },
      },
    ],
  },
  // DIMENSION 3: ECHILIBRU
  {
    id: 'balance_relationship',
    dimension: 'balance',
    dimensionName: 'Echilibru',
    dimensionNameEn: 'Balance',
    section: 'Căsnicie / Relații',
    sectionEn: 'Marriage / Relationships',
    sectionDescription: {
      ro: 'Uniunea legală și/sau emoțională dintre două persoane care aleg să își trăiască viața împreună, cu consecvență și angajament.',
      en: 'The legal and/or emotional union between two people who choose to live their lives together, with consistency and commitment.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Relația ta este irelevantă pentru tine',
          en: 'Your relationship is irrelevant to you',
        },
        description: {
          ro: 'Te lupți să înțelegi de ce te-ai căsătorit sau ai început această relație. Aproape tot ceea ce asociezi cu căsnicia/relația ta este bazat pe durere și frustrare. Viața voastră intimă este inexistentă, iar tu te-ai resemnat cu ideea că veți trăi așa, în suferință, pentru totdeauna. Nu comunicați aproape deloc, iar atunci când o faceți, discuțiile sunt superficiale și lipsite de sens.',
          en: "You struggle to understand why you got married or started this relationship. Almost everything you associate with your marriage/relationship is based on pain and frustration. Your intimate life is nonexistent, and you've resigned yourself to the idea that you'll live this way, in suffering, forever. You barely communicate, and when you do, the conversations are superficial and meaningless.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Relația ta este un obstacol pentru tine',
          en: 'Your relationship is an obstacle for you',
        },
        description: {
          ro: 'Înțelegi de ce vrei să fii căsătorit/angajat într-o relație, dar indiferent ce încerci, nu reușiți să vă sincronizați ca un cuplu. Viața voastră intimă a început să dea semne de viață, dar nu este nici pe departe ceea ce îți dorești. Începeți să comunicați pe subiecte mai profunde, dar aproape fiecare discuție sensibilă se transformă într-o ceartă.',
          en: "You understand why you want to be married/committed in a relationship, but no matter what you try, you can't sync up as a couple. Your intimate life has started to show some signs of life, but it's nowhere near what you desire. You're starting to communicate on deeper topics, but almost every sensitive discussion turns into a fight.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Relația ta este un sprijin pentru tine',
          en: 'Your relationship is a support for you',
        },
        description: {
          ro: 'Partenera ta a devenit un adevărat aliat datorită faptului că ați învățat să comunicați unul cu celălalt. Pentru prima dată în viața ta, căsnicia/relația nu mai este o povară, ci o sursă de inspirație și motivație pentru amândoi. Viața voastră intimă nu este perfectă, dar vă conectați constant, ceea ce vă oferă împlinire și apropiere.',
          en: "Your partner has become a true ally because you've learned to communicate with each other. For the first time in your life, your marriage/relationship is no longer a burden but a source of inspiration and motivation for both of you. Your intimate life isn't perfect, but you connect consistently, which gives you both fulfillment and closeness.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Relația ta este o armă pentru tine',
          en: 'Your relationship is a weapon for you',
        },
        description: {
          ro: 'Partenera ta este mai mult decât un aliat – a devenit literalmente o armă în viața ta. Comunicarea dintre voi este deschisă și autentică, iar viața voastră intimă este o sursă de energie, conexiune și inspirație pentru amândoi. Nu mai ai niciun dubiu despre faptul că ea este persoana potrivită și că veți fi împreună pentru totdeauna.',
          en: "Your partner is more than an ally — she has literally become a weapon in your life. Communication between you is open and authentic, and your intimate life is a source of energy, connection, and inspiration for both of you. You no longer have any doubt that she is the right person and that you will be together forever.",
        },
      },
    ],
  },
  {
    id: 'balance_family',
    dimension: 'balance',
    dimensionName: 'Echilibru',
    dimensionNameEn: 'Balance',
    section: 'Copii / Familie',
    sectionEn: 'Children / Family',
    sectionDescription: {
      ro: 'Descendenții tăi – fiii și fiicele tale. (Dacă nu ai copii, înlocuiește cu familie, frați, prieteni apropiați sau alte persoane dragi.)',
      en: 'Your descendants — your sons and daughters. (If you have no children, substitute with family, siblings, close friends, or other loved ones.)',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Copiii tăi sunt irelevanți pentru tine',
          en: 'Your children are irrelevant to you',
        },
        description: {
          ro: 'Îi eviți și faci tot posibilul să pasezi responsabilitățile de părinte soției, școlii, bisericii, guvernului sau chiar vecinilor. Te întrebi de ce ai devenit tată, iar dacă ești complet sincer, în multe zile îți dorești să nu fi avut niciodată această responsabilitate. Nu comunici aproape deloc cu copiii tăi.',
          en: "You avoid them and do everything possible to pass parenting responsibilities to your wife, school, church, the government, or even neighbors. You wonder why you became a father, and if you're completely honest, many days you wish you'd never had this responsibility. You barely communicate with your children.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Copiii tăi sunt un obstacol pentru tine',
          en: 'Your children are an obstacle for you',
        },
        description: {
          ro: 'Încerci să te implici, dar abilitatea ta de a comunica este atât de slabă încât de fiecare dată când încerci totul o ia razna. Îți dorești să faci parte din viața lor, dar pur și simplu nu știi cum. Și cu fiecare zi care trece, devine tot mai greu să te conectezi cu ei. Totuși, îți lipsesc abilitățile fundamentale pentru a reuși să creezi o legătură reală.',
          en: "You try to get involved, but your ability to communicate is so poor that every time you try, everything falls apart. You want to be part of their lives, but you simply don't know how. And with each passing day, it becomes harder to connect with them. You lack the fundamental skills needed to create a real bond.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Copiii tăi sunt un sprijin pentru tine',
          en: 'Your children are a support for you',
        },
        description: {
          ro: 'Îți iubești copiii, iar ei simt același lucru pentru tine – nu doar în vorbe, ci și în acțiuni. Ai conversații semnificative cu ei și le-ai construit încrederea astfel încât vin la tine atunci când au nevoie de sprijin în fața provocărilor vieții. Ești o parte activă în viața lor și poți simți cum legătura dintre voi devine tot mai puternică.',
          en: "You love your children, and they feel the same about you — not just in words, but in actions. You have meaningful conversations with them and have built their trust so they come to you when they need support facing life's challenges. You are an active part of their lives and can feel the bond between you growing stronger.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Copiii tăi sunt o sursă de putere pentru tine',
          en: 'Your children are a source of power for you',
        },
        description: {
          ro: 'Îți onorezi copiii și îi ghidezi spre creștere și dezvoltare. Nu îi vezi ca fiind „ai tăi", ci ca o responsabilitate sacră pe care ai primit-o pentru a-i îngriji și a-i ajuta să evolueze. Investiți timp, energie și bani în dezvoltarea lor zilnic. Rolul de tată îți oferă putere și inspirație.',
          en: "You honor your children and guide them toward growth and development. You don't see them as 'yours,' but as a sacred responsibility entrusted to you to nurture and help them evolve. You invest time, energy, and money in their development daily. The role of father gives you strength and inspiration.",
        },
      },
    ],
  },
  // DIMENSION 4: BUSINESS
  {
    id: 'business_mechanics',
    dimension: 'business',
    dimensionName: 'Business',
    dimensionNameEn: 'Business',
    section: 'Mecanica Afacerii',
    sectionEn: 'Business Mechanics',
    sectionDescription: {
      ro: 'Arta și știința de a crea valoare pe piață și profit în afacerea ta (fie ca antreprenor, fie ca intraprenor).',
      en: 'The art and science of creating value in the market and profit in your business (whether as an entrepreneur or intrapreneur).',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Afacerea ta este irelevantă pentru tine',
          en: 'Your business is irrelevant to you',
        },
        description: {
          ro: 'Ai o afacere, dar eșuează și te deține ea pe tine, nu invers. Trăiești în lipsă și frică – de cele mai multe ori te gândești să renunți și să îți cauți un job unde să lucrezi pentru altcineva. Ești complet confuz în ceea ce privește marketingul, vânzările, livrarea serviciilor, sistemele, automatizările, contabilitatea și orice altceva legat de business.',
          en: "You have a business, but it's failing and it owns you — not the other way around. You live in scarcity and fear — most of the time you think about giving up and finding a job working for someone else. You are completely confused about marketing, sales, service delivery, systems, automation, accounting, and everything else related to business.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Afacerea ta este un obstacol pentru tine',
          en: 'Your business is an obstacle for you',
        },
        description: {
          ro: 'Ai o afacere și aceasta îți plătește facturile, dar te-a transformat într-un sclav, iar în tot acest proces ți-a furat bucuria. Ai un nivel foarte de bază de înțelegere a marketingului, vânzărilor, livrării, sistemelor și contabilității. Afacerea ta nu este pe pierdere în fiecare lună, dar îți consumă toată energia.',
          en: "You have a business and it pays your bills, but it has turned you into a slave and in the process has stolen your joy. You have a very basic understanding of marketing, sales, delivery, systems, and accounting. Your business isn't losing money every month, but it consumes all your energy.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Afacerea ta este un sprijin pentru tine',
          en: 'Your business is a support for you',
        },
        description: {
          ro: 'Ai o afacere și ai învățat să O DEȚII TU, nu să te dețină ea pe tine. Pentru prima dată în cariera ta, simți că ai construit ceva cu adevărat special. Ai un nivel ridicat de expertiză în Marketing, Vânzări, Livrare, Sisteme, Automatizări, Contabilitate. Te simți în control deplin asupra afacerii și ești foarte profitabil.',
          en: "You have a business and have learned to OWN IT, not be owned by it. For the first time in your career, you feel you've built something truly special. You have a high level of expertise in Marketing, Sales, Delivery, Systems, Automation, and Accounting. You feel in full control of the business and are highly profitable.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Afacerea ta este o armă pentru tine',
          en: 'Your business is a weapon for you',
        },
        description: {
          ro: 'Ai o afacere de top în industrie și știi asta. Nu mai ai nicio grijă legată de dacă afacerea ta funcționează sau dacă va genera bani, deoarece ai stăpânit aceste aspecte iar echipa ta îți susține viziunea. Ai ieșit complet din mentalitatea de lipsă și frică și ai pășit într-o realitate unde prosperitatea este noua ta normalitate.',
          en: "You have a top business in your industry and you know it. You no longer worry about whether your business is working or whether it will generate money, because you've mastered these aspects and your team supports your vision. You have completely exited the scarcity and fear mindset and stepped into a reality where prosperity is your new normal.",
        },
      },
    ],
  },
  {
    id: 'business_money',
    dimension: 'business',
    dimensionName: 'Business',
    dimensionNameEn: 'Business',
    section: 'Bani',
    sectionEn: 'Money',
    sectionDescription: {
      ro: 'Moneda pe care ai generat-o prin producție și care acum este disponibilă pentru a fi cheltuită, împrumutată sau investită.',
      en: 'The currency you have generated through production and that is now available to be spent, lent, or invested.',
    },
    levels: [
      {
        range: [1, 2, 3],
        name: 'Adormit',
        nameEn: 'Asleep',
        title: {
          ro: 'Banii sunt irelevanți pentru tine',
          en: 'Money is irrelevant to you',
        },
        description: {
          ro: 'Nu ai un plan financiar și, dacă ești sincer cu tine, nici măcar nu te simți demn de a avea unul. Aproape 100% din energia ta mentală este concentrată pe supraviețuire, iar această mentalitate de lipsă îți îngustează viziunea și nu îți permite să vezi mai departe de ziua de azi. Riști totul doar pentru a supraviețui.',
          en: "You have no financial plan and, if you're honest with yourself, you don't even feel worthy of having one. Almost 100% of your mental energy is focused on survival, and this scarcity mindset narrows your vision and doesn't allow you to see beyond today. You risk everything just to survive.",
        },
      },
      {
        range: [4, 5, 6],
        name: 'Treaz',
        nameEn: 'Awake',
        title: {
          ro: 'Banii sunt un obstacol pentru tine',
          en: 'Money is an obstacle for you',
        },
        description: {
          ro: 'Ai pășit pentru prima dată în abundența financiară și începi să vezi importanța unui plan. Vezi oameni care au un plan și îți dorești și tu să creezi unul, dar poveștile din trecut legate de lipsă și frică sunt încă foarte puternice. Trăiești de la salariu la salariu și, indiferent cât de mult câștigi, cheltuiești aproape tot.',
          en: "You've stepped into financial abundance for the first time and are starting to see the importance of a plan. You see people who have a plan and wish you could create one too, but the old stories of scarcity and fear are still very powerful. You live paycheck to paycheck and, no matter how much you earn, you spend almost all of it.",
        },
      },
      {
        range: [7, 8, 9],
        name: 'Activ',
        nameEn: 'Active',
        title: {
          ro: 'Banii sunt un sprijin pentru tine',
          en: 'Money is a support for you',
        },
        description: {
          ro: 'Ai depășit poveștile din trecut legate de lipsă și ai reușit să creezi un plan financiar solid. Simți cu adevărat abundența intrând în viața ta la niveluri pe care nici nu le credeai posibile înainte. Ideea de a reveni la haosul și nesiguranța financiară din trecut este de neconceput pentru tine.',
          en: "You've overcome past stories of scarcity and managed to create a solid financial plan. You truly feel abundance entering your life at levels you never thought possible before. The idea of returning to the chaos and financial insecurity of the past is inconceivable to you.",
        },
      },
      {
        range: [10, 11, 12],
        name: 'Accelerat',
        nameEn: 'Accelerated',
        title: {
          ro: 'Banii sunt o armă pentru tine',
          en: 'Money is a weapon for you',
        },
        description: {
          ro: 'Ai stabilizat abundența și ai un plan financiar care îți susține fiecare mișcare zilnică. Orice s-ar întâmpla în lume, știi că nu vei mai pierde niciodată ceea ce ai construit. Știi clar că restul vieții tale va fi dedicat construirii unui IMPERIU pe care să-l transmiți generațiilor viitoare.',
          en: "You've stabilized abundance and have a financial plan that supports your every daily move. Whatever happens in the world, you know you will never again lose what you've built. You clearly know that the rest of your life will be dedicated to building an EMPIRE to pass on to future generations.",
        },
      },
    ],
  },
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
