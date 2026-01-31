export interface HeroJourneyQuestion {
  step: number;
  element: string;
  emoji: string;
  question: string;
  placeholder: string;
  hint: string;
}

export function getHeroJourneyQuestions(language: 'en' | 'ro' = 'ro'): HeroJourneyQuestion[] {
  if (language === 'en') {
    return [
      {
        step: 1,
        element: 'The Ordinary World',
        emoji: '🏠',
        question: 'What does the protagonist\'s life look like BEFORE the change?',
        placeholder: 'E.g.: Living in routine, has a stable job but isn\'t happy...',
        hint: 'The initial status quo, the comfort zone'
      },
      {
        step: 2,
        element: 'The Call to Adventure',
        emoji: '📢',
        question: 'What EVENT or SITUATION calls them toward change?',
        placeholder: 'E.g.: Loses their job, discovers an opportunity, meets someone...',
        hint: 'The catalyst, the moment that changes everything'
      },
      {
        step: 3,
        element: 'Refusal of the Call',
        emoji: '😰',
        question: 'Why do they HESITATE or REFUSE initially?',
        placeholder: 'E.g.: Fear of failure, lack of confidence, what others will say...',
        hint: 'The fears and internal barriers'
      },
      {
        step: 4,
        element: 'Meeting the Mentor',
        emoji: '🧙',
        question: 'Who/what HELPS them accept the challenge?',
        placeholder: 'E.g.: A mentor, a book, an experience, YOU as guide...',
        hint: 'The support, knowledge, tools received'
      },
      {
        step: 5,
        element: 'Crossing the Threshold',
        emoji: '🚪',
        question: 'What is the POINT OF NO RETURN?',
        placeholder: 'E.g.: Quits job, invests, takes first public step...',
        hint: 'The irreversible decision, the commitment'
      },
      {
        step: 6,
        element: 'The Ordeal/Transformation',
        emoji: '🔥',
        question: 'What TESTS and TRANSFORMATIONS do they go through?',
        placeholder: 'E.g.: Failures, lessons, moments of growth...',
        hint: 'The challenges that change them'
      },
      {
        step: 7,
        element: 'Return with the Elixir',
        emoji: '👑',
        question: 'What do they BRING BACK to their world?',
        placeholder: 'E.g.: Knowledge, success, transformation they share...',
        hint: 'The lesson, the result, what they offer the world'
      }
    ];
  }

  // Romanian version
  return [
    {
      step: 1,
      element: 'Lumea Obișnuită',
      emoji: '🏠',
      question: 'Cum arată viața protagonistului ÎNAINTE de schimbare?',
      placeholder: 'Ex: Trăiește în rutină, are un job stabil dar nu e fericit...',
      hint: 'Status quo-ul inițial, zona de confort'
    },
    {
      step: 2,
      element: 'Chemarea la Aventură',
      emoji: '📢',
      question: 'Ce EVENIMENT sau SITUAȚIE îl cheamă spre schimbare?',
      placeholder: 'Ex: Pierde jobul, descoperă o oportunitate, întâlnește pe cineva...',
      hint: 'Catalizatorul, momentul care schimbă totul'
    },
    {
      step: 3,
      element: 'Refuzul Chemării',
      emoji: '😰',
      question: 'De ce EZITĂ sau REFUZĂ inițial?',
      placeholder: 'Ex: Frica de eșec, lipsa de încredere, ce vor spune alții...',
      hint: 'Fricile și barierele interne'
    },
    {
      step: 4,
      element: 'Întâlnirea cu Mentorul',
      emoji: '🧙',
      question: 'Cine/ce îl AJUTĂ să accepte provocarea?',
      placeholder: 'Ex: Un mentor, o carte, o experiență, TU ca ghid...',
      hint: 'Suportul, cunoștințele, uneltele primite'
    },
    {
      step: 5,
      element: 'Traversarea Pragului',
      emoji: '🚪',
      question: 'Care este PUNCTUL FĂRĂ ÎNTOARCERE?',
      placeholder: 'Ex: Demisionează, investește, face primul pas public...',
      hint: 'Decizia ireversibilă, commitment-ul'
    },
    {
      step: 6,
      element: 'Încercarea/Transformarea',
      emoji: '🔥',
      question: 'Ce TESTE și TRANSFORMĂRI traversează?',
      placeholder: 'Ex: Eșecuri, lecții, momente de creștere...',
      hint: 'Provocările care îl schimbă'
    },
    {
      step: 7,
      element: 'Întoarcerea cu Elixirul',
      emoji: '👑',
      question: 'Ce ADUCE ÎNAPOI în lumea lui?',
      placeholder: 'Ex: Cunoștințe, succes, transformare pe care o împărtășește...',
      hint: 'Lecția, rezultatul, ce oferă lumii'
    }
  ];
}

export function getHeroJourneyLabels(language: 'en' | 'ro' = 'ro') {
  if (language === 'en') {
    return {
      title: "Hero's Journey",
      subtitle: "Create captivating content using Joseph Campbell's framework",
      stepOf: 'Step {current} of {total}',
      next: 'Continue',
      back: 'Back',
      generateScript: 'Generate Script',
      generating: 'Generating...',
      reel: 'Reel/TikTok',
      video: 'YouTube Video',
      post: 'Social Post',
      showAnswers: 'Show previous answers',
      hideAnswers: 'Hide previous answers',
      editScript: 'Edit',
      viewScript: 'View',
      regenerate: 'Regenerate',
      confirmScript: 'Confirm Script'
    };
  }

  return {
    title: "Hero's Journey",
    subtitle: "Creează conținut captivant folosind framework-ul lui Joseph Campbell",
    stepOf: 'Pasul {current} din {total}',
    next: 'Continuă',
    back: 'Înapoi',
    generateScript: 'Generează Script',
    generating: 'Generez...',
    reel: 'Reel/TikTok',
    video: 'Video YouTube',
    post: 'Postare',
    showAnswers: 'Vezi răspunsurile anterioare',
    hideAnswers: 'Ascunde răspunsurile anterioare',
    editScript: 'Editează',
    viewScript: 'Vizualizare',
    regenerate: 'Regenerează',
    confirmScript: 'Confirmă Script'
  };
}
