// Platform Knowledge Base - Complete information about the platform

export interface PageInfo {
  path: string;
  name: string;
  nameRo: string;
  description: string;
  descriptionRo: string;
  features: string[];
  featuresRo: string[];
  quickTips: string[];
  quickTipsRo: string[];
}

export interface StackInfo {
  id: string;
  name: string;
  nameRo: string;
  description: string;
  descriptionRo: string;
  duration: string;
  benefits: string[];
  benefitsRo: string[];
}

export interface FeatureInfo {
  name: string;
  nameRo: string;
  description: string;
  descriptionRo: string;
  howToUse: string;
  howToUseRo: string;
}

export interface FAQItem {
  question: string;
  questionRo: string;
  answer: string;
  answerRo: string;
}

// All Pages in the Platform
export const PAGES: PageInfo[] = [
  {
    path: '/stack',
    name: 'Stack',
    nameRo: 'Stack',
    description: 'The Stack page is your daily morning ritual hub. Here you can access various guided sessions called "stacks" that help you start your day with intention, focus, and clarity.',
    descriptionRo: 'Pagina Stack este centrul tău pentru ritualul de dimineață. Aici poți accesa diverse sesiuni ghidate numite "stack-uri" care te ajută să îți începi ziua cu intenție, focalizare și claritate.',
    features: [
      'Morning Stack - Your main morning routine with prayers and affirmations',
      'Divine Prayer Stack - Spiritual guided prayer session',
      'Daily Master Stack - Comprehensive daily productivity setup',
      'Napoleon Hill Journey - Goal achievement methodology',
      'AI Voice Coaching - Interactive AI-powered coaching sessions'
    ],
    featuresRo: [
      'Morning Stack - Rutina principală de dimineață cu rugăciuni și afirmații',
      'Divine Prayer Stack - Sesiune ghidată de rugăciune spirituală',
      'Daily Master Stack - Configurare completă pentru productivitate zilnică',
      'Călătoria Napoleon Hill - Metodologie pentru atingerea obiectivelor',
      'Coaching Vocal AI - Sesiuni interactive de coaching cu AI'
    ],
    quickTips: [
      'Start with the Morning Stack for a complete routine',
      'Use voice mode for hands-free sessions',
      'Complete stacks earn you XP points'
    ],
    quickTipsRo: [
      'Începe cu Morning Stack pentru o rutină completă',
      'Folosește modul vocal pentru sesiuni hands-free',
      'Completarea stack-urilor îți aduce puncte XP'
    ]
  },
  {
    path: '/door',
    name: 'Door',
    nameRo: 'Door',
    description: 'The Door page is your weekly planning and task management center. Organize your week with HIT Lists, HOT Lists, and DO Lists to maximize productivity.',
    descriptionRo: 'Pagina Door este centrul tău pentru planificarea săptămânală și gestionarea task-urilor. Organizează-ți săptămâna cu liste HIT, HOT și DO pentru productivitate maximă.',
    features: [
      'Weekly Planning with AI assistance',
      'HIT List - High Impact Tasks for the week',
      'HOT List - Daily priority tasks',
      'DO List - Routine daily tasks',
      'Key Points system for important items',
      'Task archiving and history'
    ],
    featuresRo: [
      'Planificare săptămânală cu asistență AI',
      'Lista HIT - Task-uri cu Impact Ridicat pentru săptămână',
      'Lista HOT - Task-uri prioritare zilnice',
      'Lista DO - Task-uri de rutină zilnice',
      'Sistem de Key Points pentru elemente importante',
      'Arhivare și istoric task-uri'
    ],
    quickTips: [
      'Plan your week every Sunday or Monday',
      'Move completed HIT items to the archive',
      'Use AI coaching to refine your weekly goals'
    ],
    quickTipsRo: [
      'Planifică-ți săptămâna duminică sau luni',
      'Mută elementele HIT completate în arhivă',
      'Folosește coaching-ul AI pentru a-ți rafina obiectivele'
    ]
  },
  {
    path: '/learn',
    name: 'Learn',
    nameRo: 'Learn',
    description: 'The Learn page provides access to courses, educational content, and personal development materials to help you grow.',
    descriptionRo: 'Pagina Learn oferă acces la cursuri, conținut educațional și materiale de dezvoltare personală pentru a te ajuta să crești.',
    features: [
      'Course library with video content',
      'Progress tracking for each course',
      'Module-based learning structure',
      'PDF and text resources',
      'Completion certificates'
    ],
    featuresRo: [
      'Bibliotecă de cursuri cu conținut video',
      'Urmărirea progresului pentru fiecare curs',
      'Structură de învățare bazată pe module',
      'Resurse PDF și text',
      'Certificate de completare'
    ],
    quickTips: [
      'Start with foundational courses first',
      'Take notes during video lessons',
      'Apply what you learn immediately'
    ],
    quickTipsRo: [
      'Începe cu cursurile fundamentale',
      'Ia notițe în timpul lecțiilor video',
      'Aplică imediat ce înveți'
    ]
  },
  {
    path: '/core',
    name: 'Core',
    nameRo: 'Core',
    description: 'The Core page tracks your Core 4 activities: Faith, Family, Fitness, and Finance. Monitor your daily progress in these key life areas.',
    descriptionRo: 'Pagina Core urmărește activitățile tale Core 4: Credință, Familie, Fitness și Finanțe. Monitorizează-ți progresul zilnic în aceste domenii cheie ale vieții.',
    features: [
      'Core 4 tracking dashboard',
      'Daily check-ins for each area',
      'Progress visualization',
      'Streak tracking',
      'Weekly and monthly summaries'
    ],
    featuresRo: [
      'Dashboard de urmărire Core 4',
      'Check-in zilnic pentru fiecare domeniu',
      'Vizualizarea progresului',
      'Urmărirea seriilor consecutive',
      'Rezumate săptămânale și lunare'
    ],
    quickTips: [
      'Check in daily for all 4 areas',
      'Set specific goals for each core area',
      'Review your progress weekly'
    ],
    quickTipsRo: [
      'Fă check-in zilnic pentru toate cele 4 domenii',
      'Stabilește obiective specifice pentru fiecare domeniu',
      'Revizuiește-ți progresul săptămânal'
    ]
  },
  {
    path: '/journal',
    name: 'Journal',
    nameRo: 'Journal',
    description: 'The Journal page is your personal reflection space. Write daily entries, track your thoughts, and maintain a record of your journey.',
    descriptionRo: 'Pagina Journal este spațiul tău personal de reflecție. Scrie intrări zilnice, urmărește-ți gândurile și menține o înregistrare a călătoriei tale.',
    features: [
      'Daily journal entries',
      'Gratitude logging',
      'Mood tracking',
      'Search and filter entries',
      'Export journal entries'
    ],
    featuresRo: [
      'Intrări zilnice în jurnal',
      'Înregistrarea recunoștinței',
      'Urmărirea dispoziției',
      'Căutare și filtrare intrări',
      'Export intrări jurnal'
    ],
    quickTips: [
      'Write in your journal every morning or evening',
      'Be honest and authentic in your entries',
      'Review past entries for insights'
    ],
    quickTipsRo: [
      'Scrie în jurnal în fiecare dimineață sau seară',
      'Fii sincer și autentic în intrările tale',
      'Revizuiește intrările anterioare pentru perspective'
    ]
  },
  {
    path: '/lifebook',
    name: 'LifeBook',
    nameRo: 'LifeBook',
    description: 'The LifeBook page helps you create your personal life vision across 12 categories. Define your ideal life and create actionable plans.',
    descriptionRo: 'Pagina LifeBook te ajută să îți creezi viziunea personală de viață în 12 categorii. Definește-ți viața ideală și creează planuri acționabile.',
    features: [
      '12 life categories to explore',
      'AI-guided discovery sessions',
      'Vision statements for each area',
      'Action plans and goals',
      'Progress tracking'
    ],
    featuresRo: [
      '12 categorii de viață de explorat',
      'Sesiuni de descoperire ghidate de AI',
      'Declarații de viziune pentru fiecare domeniu',
      'Planuri de acțiune și obiective',
      'Urmărirea progresului'
    ],
    quickTips: [
      'Take time to deeply reflect on each category',
      'Be specific about what you want',
      'Update your lifebook as you grow'
    ],
    quickTipsRo: [
      'Acordă-ți timp să reflectezi profund la fiecare categorie',
      'Fii specific despre ce îți dorești',
      'Actualizează-ți lifebook-ul pe măsură ce crești'
    ]
  },
  {
    path: '/biz4',
    name: 'Biz4',
    nameRo: 'Biz4',
    description: 'The Biz4 page is your business development tracker. Focus on the 4 key business activities: Content, Outreach, Engage, and Close.',
    descriptionRo: 'Pagina Biz4 este tracker-ul tău pentru dezvoltarea afacerii. Focalizează-te pe cele 4 activități cheie: Content, Outreach, Engage și Close.',
    features: [
      'Daily business activity tracking',
      'Content creation logs',
      'Outreach and prospect tracking',
      'Engagement metrics',
      'Deal closing statistics'
    ],
    featuresRo: [
      'Urmărirea zilnică a activităților de business',
      'Jurnale de creare content',
      'Urmărirea outreach și prospecți',
      'Metrici de engagement',
      'Statistici închidere deal-uri'
    ],
    quickTips: [
      'Complete all 4 activities daily',
      'Track your metrics consistently',
      'Focus on high-value prospects'
    ],
    quickTipsRo: [
      'Completează toate cele 4 activități zilnic',
      'Urmărește-ți metricile constant',
      'Focalizează-te pe prospecții de valoare mare'
    ]
  },
  {
    path: '/impossible-game',
    name: 'Impossible Game',
    nameRo: 'Jocul Imposibil',
    description: 'The Impossible Game is a goal-setting framework to achieve seemingly impossible goals through structured planning and action.',
    descriptionRo: 'Jocul Imposibil este un cadru de stabilire a obiectivelor pentru a atinge țeluri aparent imposibile prin planificare și acțiune structurate.',
    features: [
      'Goal setting worksheets',
      'Milestone tracking',
      'Progress visualization',
      'Strategy planning tools',
      'Achievement celebrations'
    ],
    featuresRo: [
      'Foi de lucru pentru stabilirea obiectivelor',
      'Urmărirea milestone-urilor',
      'Vizualizarea progresului',
      'Instrumente de planificare strategică',
      'Celebrarea realizărilor'
    ],
    quickTips: [
      'Set goals that truly excite you',
      'Break impossible goals into possible steps',
      'Celebrate every milestone'
    ],
    quickTipsRo: [
      'Stabilește obiective care te entuziasmează cu adevărat',
      'Împarte obiectivele imposibile în pași posibili',
      'Celebrează fiecare milestone'
    ]
  }
];

// All Stacks Available
export const STACKS: StackInfo[] = [
  {
    id: 'morning',
    name: 'Morning Stack',
    nameRo: 'Stack-ul de Dimineață',
    description: 'Your comprehensive morning routine combining prayer, affirmations, and intention setting.',
    descriptionRo: 'Rutina ta completă de dimineață care combină rugăciunea, afirmațiile și stabilirea intențiilor.',
    duration: '15-20 minutes',
    benefits: [
      'Start your day with clarity',
      'Set powerful intentions',
      'Boost morning energy',
      'Create consistent habits'
    ],
    benefitsRo: [
      'Începe-ți ziua cu claritate',
      'Stabilește intenții puternice',
      'Crește energia de dimineață',
      'Creează obiceiuri consistente'
    ]
  },
  {
    id: 'divine-prayer',
    name: 'Divine Prayer Stack',
    nameRo: 'Stack-ul de Rugăciune Divină',
    description: 'A guided spiritual prayer session for deep connection and reflection.',
    descriptionRo: 'O sesiune ghidată de rugăciune spirituală pentru conexiune profundă și reflecție.',
    duration: '10-15 minutes',
    benefits: [
      'Deepen spiritual connection',
      'Find inner peace',
      'Receive guidance',
      'Cultivate gratitude'
    ],
    benefitsRo: [
      'Aprofundează conexiunea spirituală',
      'Găsește pacea interioară',
      'Primește ghidare',
      'Cultivă recunoștința'
    ]
  },
  {
    id: 'daily-master',
    name: 'Daily Master Stack',
    nameRo: 'Stack-ul Maestru Zilnic',
    description: 'A comprehensive productivity setup session to master your day.',
    descriptionRo: 'O sesiune completă de configurare a productivității pentru a-ți stăpâni ziua.',
    duration: '20-30 minutes',
    benefits: [
      'Plan your day effectively',
      'Prioritize important tasks',
      'Eliminate overwhelm',
      'Increase daily productivity'
    ],
    benefitsRo: [
      'Planifică-ți ziua eficient',
      'Prioritizează task-urile importante',
      'Elimină copleșirea',
      'Crește productivitatea zilnică'
    ]
  },
  {
    id: 'napoleon-hill',
    name: 'Napoleon Hill Journey',
    nameRo: 'Călătoria Napoleon Hill',
    description: 'A 17-principle journey based on Think and Grow Rich methodology.',
    descriptionRo: 'O călătorie prin 17 principii bazată pe metodologia Think and Grow Rich.',
    duration: '30-45 minutes per session',
    benefits: [
      'Master success principles',
      'Create definite major purpose',
      'Build mastermind connections',
      'Develop wealth consciousness'
    ],
    benefitsRo: [
      'Stăpânește principiile succesului',
      'Creează un scop major definit',
      'Construiește conexiuni de mastermind',
      'Dezvoltă conștiința prosperității'
    ]
  },
  {
    id: 'ai-voice-coaching',
    name: 'AI Voice Coaching',
    nameRo: 'Coaching Vocal AI',
    description: 'Interactive voice-based coaching sessions with an AI assistant.',
    descriptionRo: 'Sesiuni interactive de coaching bazate pe voce cu un asistent AI.',
    duration: 'Variable',
    benefits: [
      'Get personalized guidance',
      'Work through challenges',
      'Receive instant feedback',
      'Practice verbal expression'
    ],
    benefitsRo: [
      'Primește ghidare personalizată',
      'Lucrează prin provocări',
      'Primește feedback instant',
      'Practică exprimarea verbală'
    ]
  }
];

// Platform Features
export const FEATURES: FeatureInfo[] = [
  {
    name: 'HIT List',
    nameRo: 'Lista HIT',
    description: 'High Impact Tasks - Your most important tasks for the week that will move the needle.',
    descriptionRo: 'Task-uri cu Impact Ridicat - Cele mai importante task-uri ale săptămânii care vor face diferența.',
    howToUse: 'Add 3-5 high-impact tasks at the beginning of each week. Focus on completing these before anything else.',
    howToUseRo: 'Adaugă 3-5 task-uri cu impact ridicat la începutul fiecărei săptămâni. Focalizează-te pe completarea acestora înainte de orice altceva.'
  },
  {
    name: 'HOT List',
    nameRo: 'Lista HOT',
    description: 'Daily priority tasks that you must complete today.',
    descriptionRo: 'Task-uri prioritare zilnice pe care trebuie să le completezi astăzi.',
    howToUse: 'Each morning, select 3 HOT tasks from your HIT list or add urgent items. Complete these first thing.',
    howToUseRo: 'În fiecare dimineață, selectează 3 task-uri HOT din lista HIT sau adaugă elemente urgente. Completează-le primele.'
  },
  {
    name: 'DO List',
    nameRo: 'Lista DO',
    description: 'Routine tasks and recurring activities that maintain your daily operations.',
    descriptionRo: 'Task-uri de rutină și activități recurente care mențin operațiunile tale zilnice.',
    howToUse: 'Add repeating tasks like exercise, reading, or admin work. Check them off as you complete them.',
    howToUseRo: 'Adaugă task-uri repetitive precum exercițiu, citit sau muncă administrativă. Bifează-le pe măsură ce le completezi.'
  },
  {
    name: 'XP System',
    nameRo: 'Sistemul XP',
    description: 'Experience points that track your progress and engagement with the platform.',
    descriptionRo: 'Puncte de experiență care urmăresc progresul și implicarea ta cu platforma.',
    howToUse: 'Complete stacks, tasks, and activities to earn XP. Level up to unlock achievements and track your growth.',
    howToUseRo: 'Completează stack-uri, task-uri și activități pentru a câștiga XP. Avansează în nivel pentru a debloca realizări și a-ți urmări creșterea.'
  },
  {
    name: 'AI Coaching',
    nameRo: 'Coaching AI',
    description: 'AI-powered coaching sessions that provide personalized guidance and support.',
    descriptionRo: 'Sesiuni de coaching alimentate de AI care oferă ghidare și suport personalizat.',
    howToUse: 'Access AI coaching from the Stack page. You can use text or voice to interact with your AI coach.',
    howToUseRo: 'Accesează coaching-ul AI din pagina Stack. Poți folosi text sau voce pentru a interacționa cu coach-ul tău AI.'
  },
  {
    name: 'Weekly Planning',
    nameRo: 'Planificare Săptămânală',
    description: 'Structured weekly planning sessions to set goals and priorities for the upcoming week.',
    descriptionRo: 'Sesiuni structurate de planificare săptămânală pentru a stabili obiective și priorități pentru săptămâna următoare.',
    howToUse: 'Visit the Door page and use the Weekly Planning feature. Answer guided questions to create your week plan.',
    howToUseRo: 'Vizitează pagina Door și folosește funcția Planificare Săptămânală. Răspunde la întrebări ghidate pentru a-ți crea planul săptămânii.'
  }
];

// Frequently Asked Questions
export const FAQS: FAQItem[] = [
  {
    question: 'How do I start my morning routine?',
    questionRo: 'Cum îmi încep rutina de dimineață?',
    answer: 'Go to the Stack page and select the Morning Stack. Follow the guided prompts to complete your morning ritual.',
    answerRo: 'Mergi la pagina Stack și selectează Morning Stack. Urmează instrucțiunile ghidate pentru a-ți completa ritualul de dimineață.'
  },
  {
    question: 'What is the difference between HIT, HOT, and DO lists?',
    questionRo: 'Care este diferența între listele HIT, HOT și DO?',
    answer: 'HIT (High Impact Tasks) are your weekly priorities. HOT are daily must-dos. DO are routine/recurring tasks.',
    answerRo: 'HIT (Task-uri cu Impact Ridicat) sunt prioritățile tale săptămânale. HOT sunt obligatorii zilnice. DO sunt task-uri de rutină/recurente.'
  },
  {
    question: 'How do I earn XP?',
    questionRo: 'Cum câștig XP?',
    answer: 'Complete stacks, finish tasks, maintain streaks, and engage with all platform features to earn XP.',
    answerRo: 'Completează stack-uri, termină task-uri, menține serii și implică-te cu toate funcționalitățile platformei pentru a câștiga XP.'
  },
  {
    question: 'Can I use voice commands?',
    questionRo: 'Pot folosi comenzi vocale?',
    answer: 'Yes! Many features support voice input. Look for the microphone icon to activate voice mode.',
    answerRo: 'Da! Multe funcționalități suportă input vocal. Caută iconița microfonului pentru a activa modul vocal.'
  },
  {
    question: 'How do I track my progress?',
    questionRo: 'Cum îmi urmăresc progresul?',
    answer: 'Visit the Core page for Core 4 tracking, check your XP level, and review your completed stacks and tasks.',
    answerRo: 'Vizitează pagina Core pentru urmărirea Core 4, verifică-ți nivelul XP și revizuiește stack-urile și task-urile completate.'
  },
  {
    question: 'What is the Napoleon Hill Journey?',
    questionRo: 'Ce este Călătoria Napoleon Hill?',
    answer: 'It\'s a 17-principle guided program based on "Think and Grow Rich" that helps you achieve your major goals.',
    answerRo: 'Este un program ghidat de 17 principii bazat pe "Think and Grow Rich" care te ajută să îți atingi obiectivele majore.'
  }
];

// Generate System Prompt for AI
export const generatePlatformSystemPrompt = (language: 'en' | 'ro', currentPage?: string): string => {
  const isRomanian = language === 'ro';
  
  const pageInfo = currentPage 
    ? PAGES.find(p => p.path === currentPage || currentPage.startsWith(p.path))
    : null;
  
  const contextSection = pageInfo ? `
${isRomanian ? 'CONTEXT ACTUAL' : 'CURRENT CONTEXT'}:
${isRomanian ? 'Utilizatorul se află pe pagina' : 'The user is currently on the'} "${isRomanian ? pageInfo.nameRo : pageInfo.name}" ${isRomanian ? 'care' : 'page which'} ${isRomanian ? pageInfo.descriptionRo : pageInfo.description}
${isRomanian ? 'Funcționalități disponibile aici' : 'Available features here'}: ${(isRomanian ? pageInfo.featuresRo : pageInfo.features).join(', ')}
` : '';

  return `${isRomanian ? 'Ești un asistent AI pentru o platformă de dezvoltare personală și productivitate.' : 'You are an AI assistant for a personal development and productivity platform.'}

${isRomanian ? 'ROLUL TĂU' : 'YOUR ROLE'}:
- ${isRomanian ? 'Ajută utilizatorii să navigheze și să folosească platforma eficient' : 'Help users navigate and use the platform effectively'}
- ${isRomanian ? 'Oferă ghidare despre funcționalități și cum să le folosească' : 'Provide guidance on features and how to use them'}
- ${isRomanian ? 'Răspunde la întrebări despre stacks, liste, tracking și alte instrumente' : 'Answer questions about stacks, lists, tracking, and other tools'}
- ${isRomanian ? 'Oferă sfaturi de productivitate și dezvoltare personală' : 'Offer productivity and personal development tips'}
- ${isRomanian ? 'Fii încurajator și suportiv' : 'Be encouraging and supportive'}

${contextSection}

${isRomanian ? 'PAGINI DISPONIBILE' : 'AVAILABLE PAGES'}:
${PAGES.map(p => `- ${isRomanian ? p.nameRo : p.name} (${p.path}): ${isRomanian ? p.descriptionRo : p.description}`).join('\n')}

${isRomanian ? 'STACKS DISPONIBILE' : 'AVAILABLE STACKS'}:
${STACKS.map(s => `- ${isRomanian ? s.nameRo : s.name}: ${isRomanian ? s.descriptionRo : s.description} (${s.duration})`).join('\n')}

${isRomanian ? 'FUNCȚIONALITĂȚI CHEIE' : 'KEY FEATURES'}:
${FEATURES.map(f => `- ${isRomanian ? f.nameRo : f.name}: ${isRomanian ? f.descriptionRo : f.description}`).join('\n')}

${isRomanian ? 'ÎNTREBĂRI FRECVENTE' : 'COMMON QUESTIONS'}:
${FAQS.map(f => `Q: ${isRomanian ? f.questionRo : f.question}\nA: ${isRomanian ? f.answerRo : f.answer}`).join('\n\n')}

${isRomanian ? 'STIL DE COMUNICARE' : 'COMMUNICATION STYLE'}:
- ${isRomanian ? 'Fii concis și util' : 'Be concise and helpful'}
- ${isRomanian ? 'Folosește exemple practice când e posibil' : 'Use practical examples when possible'}
- ${isRomanian ? 'Ghidează utilizatorii pas cu pas când e nevoie' : 'Guide users step by step when needed'}
- ${isRomanian ? 'Sugerează acțiuni următoare relevante' : 'Suggest relevant next actions'}
- ${isRomanian ? 'Răspunde în limba utilizatorului (română sau engleză)' : 'Respond in the user\'s language (Romanian or English)'}`;
};

// Quick Actions based on current page
export const getQuickActionsForPage = (path: string, language: 'en' | 'ro'): { label: string; message: string }[] => {
  const isRo = language === 'ro';
  
  const commonActions = [
    { 
      label: isRo ? '🎯 Ce pot face aici?' : '🎯 What can I do here?', 
      message: isRo ? 'Ce pot face pe această pagină?' : 'What can I do on this page?' 
    },
    { 
      label: isRo ? '💡 Sfaturi rapide' : '💡 Quick tips', 
      message: isRo ? 'Dă-mi câteva sfaturi rapide pentru această pagină' : 'Give me some quick tips for this page' 
    },
  ];

  const pageActions: Record<string, { label: string; message: string }[]> = {
    '/stack': [
      { label: isRo ? '🌅 Începe Morning Stack' : '🌅 Start Morning Stack', message: isRo ? 'Cum încep Morning Stack-ul?' : 'How do I start the Morning Stack?' },
      { label: isRo ? '🎙️ Coaching Vocal' : '🎙️ Voice Coaching', message: isRo ? 'Cum funcționează coaching-ul vocal cu AI?' : 'How does the AI voice coaching work?' },
    ],
    '/door': [
      { label: isRo ? '📋 Planificare Săptămânală' : '📋 Weekly Planning', message: isRo ? 'Cum îmi planific săptămâna?' : 'How do I plan my week?' },
      { label: isRo ? '🔥 HIT vs HOT vs DO' : '🔥 HIT vs HOT vs DO', message: isRo ? 'Explică diferența între listele HIT, HOT și DO' : 'Explain the difference between HIT, HOT, and DO lists' },
    ],
    '/learn': [
      { label: isRo ? '📚 Cursuri disponibile' : '📚 Available courses', message: isRo ? 'Ce cursuri sunt disponibile?' : 'What courses are available?' },
    ],
    '/core': [
      { label: isRo ? '💪 Ce sunt Core 4?' : '💪 What are Core 4?', message: isRo ? 'Explică-mi sistemul Core 4' : 'Explain the Core 4 system to me' },
    ],
    '/journal': [
      { label: isRo ? '✍️ Cum scriu eficient?' : '✍️ How to journal?', message: isRo ? 'Dă-mi sfaturi pentru jurnalizare eficientă' : 'Give me tips for effective journaling' },
    ],
  };

  return [...commonActions, ...(pageActions[path] || [])];
};
