export interface StorytellingQuestion {
  step: number;
  element: string;
  emoji: string;
  question: string;
  placeholder: string;
  hint: string;
}

export const getStorytellingQuestions = (language: 'en' | 'ro' = 'ro'): StorytellingQuestion[] => {
  if (language === 'en') {
    return [
      {
        step: 1,
        element: 'Desire',
        emoji: '🎯',
        question: 'What does your audience/protagonist deeply WANT?',
        placeholder: 'E.g.: To feel confident, to make more money, to be healthy...',
        hint: 'The burning desire that drives action'
      },
      {
        step: 2,
        element: 'Problem/Need',
        emoji: '💔',
        question: 'What PROBLEM or NEED are they facing?',
        placeholder: 'E.g.: They feel stuck, overwhelmed, lacking direction...',
        hint: 'The gap between current reality and desire'
      },
      {
        step: 3,
        element: 'Opponent',
        emoji: '⚔️',
        question: 'Who or what is the OPPONENT? (external, internal, or intimate)',
        placeholder: 'External: competition, economy. Internal: fear, doubt. Intimate: family, friends...',
        hint: 'The force that blocks progress'
      },
      {
        step: 4,
        element: 'Plan',
        emoji: '📋',
        question: 'What is the PLAN to overcome this?',
        placeholder: 'E.g.: Follow these 5 steps, use this method, adopt this mindset...',
        hint: 'Your solution/framework/system'
      },
      {
        step: 5,
        element: 'Battle',
        emoji: '🔥',
        question: 'What BATTLE must be fought?',
        placeholder: 'E.g.: The moment of confrontation, the hard work required...',
        hint: 'The climax, the real test'
      },
      {
        step: 6,
        element: 'Self-Revelation',
        emoji: '💡',
        question: 'What REVELATION or transformation occurs?',
        placeholder: 'E.g.: They realize their true potential, discover hidden strength...',
        hint: 'The "aha" moment, the inner change'
      },
      {
        step: 7,
        element: 'Equilibrium',
        emoji: '✨',
        question: 'What is the NEW EQUILIBRIUM?',
        placeholder: 'E.g.: Living with confidence, financial freedom, peace of mind...',
        hint: 'The new normal after transformation'
      }
    ];
  }
  
  // Romanian version
  return [
    {
      step: 1,
      element: 'Dorință',
      emoji: '🎯',
      question: 'Ce DOREȘTE profund audiența/protagonistul tău?',
      placeholder: 'Ex: Să se simtă încrezător, să facă mai mulți bani, să fie sănătos...',
      hint: 'Dorința arzătoare care motivează acțiunea'
    },
    {
      step: 2,
      element: 'Problemă/Nevoie',
      emoji: '💔',
      question: 'Ce PROBLEMĂ sau NEVOIE are?',
      placeholder: 'Ex: Se simt blocați, copleșiți, fără direcție...',
      hint: 'Gap-ul între realitatea curentă și dorință'
    },
    {
      step: 3,
      element: 'Oponent',
      emoji: '⚔️',
      question: 'Cine sau ce este OPONENTUL? (extern, intern sau intim)',
      placeholder: 'Extern: competiția, economia. Intern: frica, îndoiala. Intim: familia, prietenii...',
      hint: 'Forța care blochează progresul'
    },
    {
      step: 4,
      element: 'Plan',
      emoji: '📋',
      question: 'Care este PLANUL pentru a depăși asta?',
      placeholder: 'Ex: Urmează acești 5 pași, folosește această metodă, adoptă această mentalitate...',
      hint: 'Soluția ta / framework-ul / sistemul'
    },
    {
      step: 5,
      element: 'Bătălie',
      emoji: '🔥',
      question: 'Ce BĂTĂLIE trebuie dată?',
      placeholder: 'Ex: Momentul confruntării, munca grea necesară...',
      hint: 'Climax-ul, testul real'
    },
    {
      step: 6,
      element: 'Revelație',
      emoji: '💡',
      question: 'Ce REVELAȚIE sau transformare apare?',
      placeholder: 'Ex: Realizează potențialul adevărat, descoperă forța ascunsă...',
      hint: 'Momentul "aha", schimbarea interioară'
    },
    {
      step: 7,
      element: 'Echilibru Nou',
      emoji: '✨',
      question: 'Care este NOUL ECHILIBRU?',
      placeholder: 'Ex: Trăiește cu încredere, libertate financiară, liniște sufletească...',
      hint: 'Normalul nou după transformare'
    }
  ];
};

export const getStorytellingLabels = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      title: 'Storytelling Framework',
      subtitle: '7 Elements of a Captivating Story',
      stepOf: 'Step {current} of {total}',
      back: 'Back',
      next: 'Continue',
      generateScript: 'Generate Script',
      generating: 'Generating...',
      previousAnswers: 'Previous answers',
      showAnswers: 'Show previous answers',
      hideAnswers: 'Hide answers',
      editScript: 'Edit',
      viewScript: 'View',
      confirmScript: 'Confirm Script',
      regenerate: 'Regenerate',
      contentType: 'Content type',
      reel: 'Reel/TikTok',
      video: 'YouTube Video',
      post: 'Post'
    };
  }
  
  return {
    title: 'Framework Storytelling',
    subtitle: '7 Elemente ale unei Povești Captivante',
    stepOf: 'Pasul {current} din {total}',
    back: 'Înapoi',
    next: 'Continuă',
    generateScript: 'Generează Script',
    generating: 'Generez...',
    previousAnswers: 'Răspunsuri anterioare',
    showAnswers: 'Arată răspunsurile anterioare',
    hideAnswers: 'Ascunde răspunsurile',
    editScript: 'Editează',
    viewScript: 'Vizualizare',
    confirmScript: 'Confirmă Script',
    regenerate: 'Regenerează',
    contentType: 'Tip conținut',
    reel: 'Reel/TikTok',
    video: 'Video YouTube',
    post: 'Postare'
  };
};
