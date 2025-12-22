export const getQuestions = () => {
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

export const getGratitudeCategories = () => ({
  world: { start: 1, end: 3, label: "🌍 Lume" },
  personal: { start: 4, end: 6, label: "💖 Viață Personală" },
  professional: { start: 7, end: 9, label: "💼 Viață Profesională" },
  self: { start: 10, end: 12, label: "🌟 Despre Tine" }
});
