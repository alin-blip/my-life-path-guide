export const getDivineGratitudeQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      intro: [
        "What title will you give this sacred moment of connection and gratitude?",
        "Who or what do you bring before God today?",
        "Why has this person or situation caused you to pray at this moment?",
        "What is the story you tell yourself about this situation?",
        "Describe in a single word the feeling that arises when you think about this."
      ],
      divineConnection: [
        "Lord, I want you to know that... (first category or situation from your heart):",
        "Lord, I want you to know that... (second category or situation):",
        "Lord, I want you to know that... (third category or situation):",
        "Lord, I want you to know that... (fourth category or situation):",
        "Lord, what is here that you want me to SEE?",
        "Lord, what is here to be HEARD?",
        "Lord, what do you want me to FEEL?",
        "Lord, what do you want me to KNOW?",
        "What do you want me to DO, Lord?"
      ],
      gratitude: [
        "🌍 What is the first thing from the WORLD you are grateful for?",
        "🌍 What is the second thing from the WORLD you are grateful for?",
        "🌍 What is the third thing from the WORLD you are grateful for?",
        "💖 What is the first thing from YOUR PERSONAL LIFE you are grateful for?",
        "💖 What is the second thing from YOUR PERSONAL LIFE you are grateful for?",
        "💖 What is the third thing from YOUR PERSONAL LIFE you are grateful for?",
        "💼 What is the first thing from YOUR PROFESSIONAL LIFE you are grateful for?",
        "💼 What is the second thing from YOUR PROFESSIONAL LIFE you are grateful for?",
        "💼 What is the third thing from YOUR PROFESSIONAL LIFE you are grateful for?",
        "🌟 What is the first thing ABOUT YOURSELF you are grateful for?",
        "🌟 What is the second thing ABOUT YOURSELF you are grateful for?",
        "🌟 What is the third thing ABOUT YOURSELF you are grateful for?"
      ],
      closing: [
        "What is the SINGULAR life lesson you take from this experience?",
        "What is the most significant REVELATION you leave with?",
        "What IMMEDIATE ACTIONS are you determined to take?",
        "Do you want to add these actions to the HIT List? (YES or NO)",
        "Are there other actions you want to add? (YES or NO)"
      ]
    };
  }
  
  return {
    intro: [
      "Ce titlu vei da acestui moment sacru de conexiune și recunoștință?",
      "Pe cine sau ce aduci în fața lui Dumnezeu astăzi?",
      "De ce te-a determinat această persoană sau situație să te rogi în acest moment?",
      "Care este povestea pe care ți-o spui despre această situație?",
      "Descrie într-un singur cuvânt sentimentul care apare când te gândești la asta."
    ],
    divineConnection: [
      "Doamne, vreau să știi că... (prima categorie sau situație din inima ta):",
      "Doamne, vreau să știi că... (a doua categorie sau situație):",
      "Doamne, vreau să știi că... (a treia categorie sau situație):",
      "Doamne, vreau să știi că... (a patra categorie sau situație):",
      "Doamne, ce este aici și vrei să VAD?",
      "Doamne, ce este aici de AUZIT?",
      "Doamne, ce vrei să SIMT?",
      "Doamne, ce vrei să ȘTIU?",
      "Ce vrei să FAC, Doamne?"
    ],
    gratitude: [
      "🌍 Care este primul lucru din LUME pentru care ești recunoscător?",
      "🌍 Care este al doilea lucru din LUME pentru care ești recunoscător?",
      "🌍 Care este al treilea lucru din LUME pentru care ești recunoscător?",
      "💖 Care este primul lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
      "💖 Care este al doilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
      "💖 Care este al treilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?",
      "💼 Care este primul lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
      "💼 Care este al doilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
      "💼 Care este al treilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?",
      "🌟 Care este primul lucru DESPRE TINE pentru care ești recunoscător?",
      "🌟 Care este al doilea lucru DESPRE TINE pentru care ești recunoscător?",
      "🌟 Care este al treilea lucru DESPRE TINE pentru care ești recunoscător?"
    ],
    closing: [
      "Care este LECȚIA SINGULARĂ de viață pe care o iei din această experiență?",
      "Care este cea mai semnificativă REVELAȚIE cu care pleci?",
      "Ce ACȚIUNI IMEDIATE ești hotărât să întreprinzi?",
      "Vrei să adaugi aceste acțiuni la HIT List? (DA sau NU)",
      "Mai există și alte acțiuni pe care vrei să le adaugi? (DA sau NU)"
    ]
  };
};

export const getDivineGratitudeSections = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      { key: 'intro', title: '🙏 Opening', questionCount: 5 },
      { key: 'divineConnection', title: '✨ Divine Connection', questionCount: 9 },
      { key: 'gratitude', title: '💝 Gratitude Practice', questionCount: 12 },
      { key: 'closing', title: '🎯 Lessons & Actions', questionCount: 5 }
    ];
  }
  
  return [
    { key: 'intro', title: '🙏 Deschidere', questionCount: 5 },
    { key: 'divineConnection', title: '✨ Conexiune Divină', questionCount: 9 },
    { key: 'gratitude', title: '💝 Practică de Recunoștință', questionCount: 12 },
    { key: 'closing', title: '🎯 Lecții & Acțiuni', questionCount: 5 }
  ];
};
