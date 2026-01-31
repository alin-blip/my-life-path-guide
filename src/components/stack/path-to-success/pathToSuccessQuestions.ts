export interface PathToSuccessQuestion {
  step: number;
  title: string;
  titleEn: string;
  emoji: string;
  question: string;
  subQuestions?: string[];
  placeholder: string;
  hint: string;
}

export function getPathToSuccessQuestions(language: 'en' | 'ro' = 'ro'): PathToSuccessQuestion[] {
  if (language === 'en') {
    return [
      {
        step: 1,
        title: 'Activate Your Hunger',
        titleEn: 'What Do You Really Want?',
        emoji: '🔥',
        question: 'What do you REALLY want? Develop a compelling vision.',
        subQuestions: [
          'What is your vision? Your purpose? Your compelling future?',
          'WHAT do you want and WHY do you want it?',
          'Remember: REASONS COME FIRST, ANSWERS COME SECOND'
        ],
        placeholder: 'Describe your vision... What does your ideal life look like? What drives you?',
        hint: 'Be specific. The clearer your vision, the more powerful your hunger.'
      },
      {
        step: 2,
        title: 'Face the Truth',
        titleEn: 'The Truth Will Set You Free',
        emoji: '🪞',
        question: 'Get CLEAR and HONEST about where you are vs. where you want to be.',
        subQuestions: [
          "CLOSE THE GAP: What's gotten in the way?",
          '(1) Is it fear? (2) Limiting beliefs? (3) Emotions? (4) Bad habits? (5) Missing skills?',
          'What old story/identity kept you from succeeding?',
          'What NEW story/identity do you need to become?'
        ],
        placeholder: 'Be brutally honest... What has stopped you? What story are you telling yourself?',
        hint: 'The truth hurts, but it also heals. Face it courageously.'
      },
      {
        step: 3,
        title: 'Create a M.A.P.',
        titleEn: 'Massive Action Plan',
        emoji: '🗺️',
        question: 'Resolve & Create your Massive Action Plan.',
        subQuestions: [
          'What are 2-3 things you can do RIGHT NOW to move forward? (Small + Big actions)',
          'How will you get the skills you need?',
          'How will you embody the qualities necessary to achieve your vision?',
          'Identify the TOP 20% actions that will get you 80% of results'
        ],
        placeholder: 'List your action plan... What specific steps will you take?',
        hint: 'Focus on the vital few, not the trivial many. 80/20 your plan.'
      },
      {
        step: 4,
        title: 'Slay Your Dragons',
        titleEn: 'Do What\'s Hard',
        emoji: '⚔️',
        question: 'What dragons must you slay? What hard things must you do?',
        subQuestions: [
          'What needs to be CHANGED in your life?',
          'What skills are necessary to acquire?',
          'What MASSIVE ACTION will you take?',
          'How will you transform to your new identity, story, and reality?'
        ],
        placeholder: 'Name your dragons... What challenges are you committing to overcome?',
        hint: 'Growth happens outside your comfort zone. Name your fears to conquer them.'
      },
      {
        step: 5,
        title: 'Daily Practice',
        titleEn: 'Develop Consistency',
        emoji: '📅',
        question: 'Small, daily actions GUARANTEE long-term success.',
        subQuestions: [
          'What NEW habit(s) or practice will move you forward?',
          'What will you do to embody the character, skills, and psychology of who you need to become?',
          'How will you measure your state (0-10) and make immediate adjustments?'
        ],
        placeholder: 'Define your daily practice... What rituals will you commit to?',
        hint: 'Success is a habit, not an event. What you do daily determines your destiny.'
      },
      {
        step: 6,
        title: 'Raise Your Standard',
        titleEn: 'Measure & Become',
        emoji: '📏',
        question: 'You get what you TOLERATE. Become your true self.',
        subQuestions: [
          'What will you no longer tolerate in yourself?',
          'How will you measure your progress more often?',
          'Remember: You can\'t manage what you don\'t measure',
          'What standard are you raising TODAY?'
        ],
        placeholder: 'Set your new standard... What will you no longer accept from yourself?',
        hint: 'The quality of your life equals your standards.'
      },
      {
        step: 7,
        title: 'Celebrate & Give Back',
        titleEn: 'Life Is a Gift',
        emoji: '🎁',
        question: 'You only build on SUCCESS. Celebrate, appreciate, and give back.',
        subQuestions: [
          'How will you celebrate your victories as you achieve them?',
          'What will you give back to others?',
          'The process starts again... What do you want at the NEXT level?'
        ],
        placeholder: 'Plan your celebration and contribution... How will you honor your journey?',
        hint: 'Success without fulfillment is the ultimate failure. Celebrate and share.'
      }
    ];
  }

  // Romanian version
  return [
    {
      step: 1,
      title: 'Activează-ți Foamea',
      titleEn: 'Ce Vrei Cu Adevărat?',
      emoji: '🔥',
      question: 'Ce VREI CU ADEVĂRAT? Dezvoltă o viziune captivantă.',
      subQuestions: [
        'Care este viziunea ta? Scopul tău? Viitorul tău captivant?',
        'CE vrei și DE CE vrei?',
        'Ține minte: MOTIVELE VIN PRIMELE, RĂSPUNSURILE VIN DUPĂ'
      ],
      placeholder: 'Descrie viziunea ta... Cum arată viața ta ideală? Ce te motivează?',
      hint: 'Fii specific. Cu cât viziunea e mai clară, cu atât foamea e mai puternică.'
    },
    {
      step: 2,
      title: 'Înfruntă Adevărul',
      titleEn: 'Adevărul Te Va Elibera',
      emoji: '🪞',
      question: 'Fii CLAR și ONEST despre unde ești vs. unde vrei să fii.',
      subQuestions: [
        'ÎNCHIDE GAP-UL: Ce te-a blocat până acum?',
        '(1) Este frică? (2) Credințe limitative? (3) Emoții? (4) Obiceiuri proaste? (5) Abilități lipsă?',
        'Ce poveste/identitate veche te-a ținut pe loc?',
        'Ce poveste/identitate NOUĂ trebuie să devii?'
      ],
      placeholder: 'Fii brutal de onest... Ce te-a oprit? Ce poveste îți spui?',
      hint: 'Adevărul doare, dar vindecă. Înfruntă-l cu curaj.'
    },
    {
      step: 3,
      title: 'Creează un M.A.P.',
      titleEn: 'Plan de Acțiune Masivă',
      emoji: '🗺️',
      question: 'Rezolvă și Creează Planul tău de Acțiune Masivă.',
      subQuestions: [
        'Care sunt 2-3 lucruri pe care le poți face ACUM pentru a avansa? (Acțiuni mici + mari)',
        'Cum vei obține abilitățile de care ai nevoie?',
        'Cum vei întruchipa calitățile necesare pentru a-ți atinge viziunea?',
        'Identifică TOP 20% acțiuni care îți vor aduce 80% din rezultate'
      ],
      placeholder: 'Listează planul de acțiune... Ce pași specifici vei face?',
      hint: 'Focusează-te pe puținele vitale, nu pe multele triviale. 80/20 planul tău.'
    },
    {
      step: 4,
      title: 'Ucide-ți Dragonii',
      titleEn: 'Fă Ce E Greu',
      emoji: '⚔️',
      question: 'Ce dragoni trebuie să ucizi? Ce lucruri grele trebuie să faci?',
      subQuestions: [
        'Ce trebuie SCHIMBAT în viața ta?',
        'Ce abilități sunt necesare de dobândit?',
        'Ce ACȚIUNE MASIVĂ vei lua?',
        'Cum te vei transforma în noua ta identitate, poveste și realitate?'
      ],
      placeholder: 'Numește-ți dragonii... Ce provocări te angajezi să învingi?',
      hint: 'Creșterea se întâmplă în afara zonei de confort. Numește-ți fricile pentru a le cuceri.'
    },
    {
      step: 5,
      title: 'Practica Zilnică',
      titleEn: 'Dezvoltă Consistența',
      emoji: '📅',
      question: 'Acțiunile mici, zilnice GARANTEAZĂ succesul pe termen lung.',
      subQuestions: [
        'Ce OBICEI(URI) noi sau practici te vor propulsa înainte?',
        'Ce vei face pentru a întruchipa caracterul, abilitățile și psihologia de care ai nevoie?',
        'Cum îți vei măsura starea (0-10) și cum vei face ajustări imediate?'
      ],
      placeholder: 'Definește-ți practica zilnică... La ce ritualuri te angajezi?',
      hint: 'Succesul este un obicei, nu un eveniment. Ce faci zilnic îți determină destinul.'
    },
    {
      step: 6,
      title: 'Ridică-ți Standardul',
      titleEn: 'Măsoară și Devino',
      emoji: '📏',
      question: 'Primești ce TOLEREZI. Devino sinele tău adevărat.',
      subQuestions: [
        'Ce nu vei mai tolera la tine?',
        'Cum îți vei măsura progresul mai des?',
        'Ține minte: Nu poți gestiona ce nu măsori',
        'Ce standard ridici AZI?'
      ],
      placeholder: 'Stabilește-ți noul standard... Ce nu vei mai accepta de la tine?',
      hint: 'Calitatea vieții tale egalează standardele tale.'
    },
    {
      step: 7,
      title: 'Celebrează și Dăruiește',
      titleEn: 'Viața E un Dar',
      emoji: '🎁',
      question: 'Construiești doar pe SUCCES. Celebrează, apreciază și dă înapoi.',
      subQuestions: [
        'Cum vei celebra victoriile pe măsură ce le obții?',
        'Ce vei dărui altora?',
        'Procesul începe din nou... Ce vrei la URMĂTORUL nivel?'
      ],
      placeholder: 'Planifică-ți celebrarea și contribuția... Cum vei onora călătoria?',
      hint: 'Succesul fără împlinire este eșecul suprem. Celebrează și împărtășește.'
    }
  ];
}

export function getPathToSuccessLabels(language: 'en' | 'ro' = 'ro') {
  if (language === 'en') {
    return {
      title: "The Path to Success",
      subtitle: "7 Steps of Personal Transformation",
      stepOf: 'Step {current} of {total}',
      next: 'Continue',
      back: 'Back',
      generatePlan: 'Generate My Transformation Plan',
      generating: 'Creating your plan...',
      showAnswers: 'Show previous answers',
      hideAnswers: 'Hide previous answers',
      editPlan: 'Edit',
      viewPlan: 'View',
      regenerate: 'Regenerate',
      confirmPlan: 'Confirm & Save Plan',
      planTitle: 'Your Transformation Plan'
    };
  }

  return {
    title: "Calea spre Succes",
    subtitle: "7 Pași ai Transformării Personale",
    stepOf: 'Pasul {current} din {total}',
    next: 'Continuă',
    back: 'Înapoi',
    generatePlan: 'Generează Planul Meu de Transformare',
    generating: 'Creez planul tău...',
    showAnswers: 'Vezi răspunsurile anterioare',
    hideAnswers: 'Ascunde răspunsurile anterioare',
    editPlan: 'Editează',
    viewPlan: 'Vizualizare',
    regenerate: 'Regenerează',
    confirmPlan: 'Confirmă și Salvează Planul',
    planTitle: 'Planul Tău de Transformare'
  };
}
