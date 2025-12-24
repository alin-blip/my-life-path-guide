export const getDivineGratitudeQuestions = () => {
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

export const getDivineGratitudeSections = () => [
  { key: 'intro', title: '🙏 Deschidere', questionCount: 5 },
  { key: 'divineConnection', title: '✨ Conexiune Divină', questionCount: 9 },
  { key: 'gratitude', title: '💝 Practică de Recunoștință', questionCount: 12 },
  { key: 'closing', title: '🎯 Lecții & Acțiuni', questionCount: 5 }
];
