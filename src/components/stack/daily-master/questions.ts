export const getDailyMasterQuestions = () => {
  return {
    awakening: [
      "Bun venit într-o nouă zi plină de posibilități! Cum te simți chiar în acest moment, fizic și emoțional?",
      "Ce intenție puternică vrei să setezi pentru ziua de azi? Ce vrei să reprezinte această zi pentru tine?"
    ],
    spiritual: [
      "Hai să ne conectăm cu sursa interioară. Închide ochii pentru câteva secunde și respiră adânc... Ce mesaj primești de la sinele tău superior pentru ziua de azi?",
      "Pentru ce sau pentru cine te rogi în această dimineață? Ce binecuvântare ceri?"
    ],
    gratitude: [
      "Care sunt 3 lucruri pentru care ești profund recunoscător chiar acum, în acest moment?",
      "Cum te face să te simți această recunoștință? Lasă-ți inima să se umple de această energie."
    ],
    mentalPower: [
      "Care este o credință limitantă pe care alegi să o abandonezi astăzi? Ce te-a ținut pe loc?",
      "Care este NOUA credință puternică care te va ghida azi? Ce crezi acum despre tine?",
      "Spune-mi o afirmație puternică - mantra ta pentru ziua de azi. Ceva care te energizează!"
    ],
    dailyFocus: [
      "Care sunt cele 3 priorități ABSOLUTE pentru ziua de azi? Ce TREBUIE să se întâmple?",
      "Dintre aceste 3, care este SINGURA acțiune care va face cea mai mare diferență? Care este piesa de domino?"
    ],
    commitment: [
      "Pe o scară de la 1 la 10, cât de hotărât ești să faci din azi o zi extraordinară?",
      "Ce te-ar ajuta să urci acel număr cu 1-2 puncte? Ce ai nevoie?"
    ]
  };
};

export const getDailyMasterSections = () => [
  { key: 'awakening', title: '🌅 Trezire & Intenție', icon: '🌅' },
  { key: 'spiritual', title: '🧘 Centrare Spirituală', icon: '🧘' },
  { key: 'gratitude', title: '🙏 Recunoștință Rapidă', icon: '🙏' },
  { key: 'mentalPower', title: '💪 Putere Mentală', icon: '💪' },
  { key: 'dailyFocus', title: '🎯 Focus Zilnic', icon: '🎯' },
  { key: 'commitment', title: '🚀 Angajament & Lansare', icon: '🚀' }
];
