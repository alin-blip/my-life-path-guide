export const getQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      "What title will you give this gratitude stack?",
      "What is the first thing from the WORLD you are grateful for today?",
      "What is the second thing from the WORLD you are grateful for?",
      "What is the third thing from the WORLD you are grateful for?",
      "What is the first thing from YOUR PERSONAL LIFE you are grateful for?",
      "What is the second thing from YOUR PERSONAL LIFE you are grateful for?",
      "What is the third thing from YOUR PERSONAL LIFE you are grateful for?",
      "What is the first thing from YOUR PROFESSIONAL LIFE you are grateful for?",
      "What is the second thing from YOUR PROFESSIONAL LIFE you are grateful for?",
      "What is the third thing from YOUR PROFESSIONAL LIFE you are grateful for?",
      "What is the first thing ABOUT YOURSELF you are grateful for?",
      "What is the second thing ABOUT YOURSELF you are grateful for?",
      "What is the third thing ABOUT YOURSELF you are grateful for?",
      "What is the most significant realization about gratitude from this exercise?",
      "What immediate action do you want to take to express this gratitude?",
      "Do you want to add this action to the HIT list? (YES or NO)",
      "Are there other actions you want to add? (YES or NO)"
    ];
  }
  
  return [
    "Ce titlu vei da acestui stack de recunoștință?",
    "Care este primul lucru din LUME pentru care ești recunoscător astăzi?",
    "Care este al doilea lucru din LUME pentru care ești recunoscător?",
    "Care este al treilea lucru din LUME pentru care ești recunoscător?",
    "Care este primul lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
    "Care este al doilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
    "Care este al treilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
    "Care este primul lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
    "Care este al doilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
    "Care este al treilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
    "Care este primul lucru DESPRE TINE pentru care ești recunoscător?",
    "Care este al doilea lucru DESPRE TINE pentru care ești recunoscător?",
    "Care este al treilea lucru DESPRE TINE pentru care ești recunoscător?",
    "Care este cea mai semnificativă realizare despre recunoștință din acest exercițiu?",
    "Ce acțiune imediată vrei să întreprinzi pentru a exprima această recunoștință?",
    "Vrei să adaugi această acțiune la HIT list? (DA sau NU)",
    "Mai există și alte acțiuni pe care vrei să le adaugi? (DA sau NU)"
  ];
};

export const getGratitudeCategories = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      world: { start: 1, end: 3, label: "🌍 World" },
      personal: { start: 4, end: 6, label: "💖 Personal Life" },
      professional: { start: 7, end: 9, label: "💼 Professional Life" },
      self: { start: 10, end: 12, label: "🌟 About Yourself" }
    };
  }
  
  return {
    world: { start: 1, end: 3, label: "🌍 Lume" },
    personal: { start: 4, end: 6, label: "💖 Viață Personală" },
    professional: { start: 7, end: 9, label: "💼 Viață Profesională" },
    self: { start: 10, end: 12, label: "🌟 Despre Tine" }
  };
};
