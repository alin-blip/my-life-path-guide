export const getQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      "What title will you give this stack?",
      "Who or what are you Stacking?",
      "Why has {peCine} prompted you to pray at this moment?",
      "What is the story you tell yourself, created by this trigger, about {peCine} and the situation?",
      "Describe in a single word the feelings that arise for you when you tell yourself that story?",
      "Lord I want you to know that: Category or situation 1:",
      "Lord I want you to know that: Category or situation 2:",
      "Lord I want you to know that: Category or situation 3:",
      "Lord I want you to know that: Category or situation 4:",
      "Lord, what is here that you want me to see?",
      "Lord, what is here to be heard?",
      "Lord, what do you want me to feel?",
      "Lord what do you want me to know?",
      "What do you want me to do, Lord?",
      "What is the singular life lesson you take from this prayer stack?",
      "What is the most significant revelation or understanding you leave with from this prayer stack and why do you feel that way?",
      "What immediate actions are you determined to take after completing this prayer stack?",
      "Do you want to add to hot list?",
      "More actions?"
    ];
  }
  
  return [
    "Ce titlu vei da acestui stack?",
    "Pe cine sau ce Stackuiesti?",
    "De ce te-a determinat {peCine} să te rogi în acest moment?",
    "Care este povestea pe care ți-o spui, creată de acest declanșator, despre {peCine} și situație?",
    "Descrie sentimentele într-un singur cuvânt care apar pentru tine când îți spui acea poveste?",
    "Doamne vreau sa stii ca: Categoria sau situatia 1:",
    "Doamne vreau sa stii ca: Categoria sau situatia 2:",
    "Doamne vreau sa stii ca: Categoria sau situatia 3:",
    "Doamne vreau sa stii ca: Categoria sau situatia 4:",
    "Doamne, ce este aici si vrei sa vad?",
    "Doamne, ce este aici de auzit?",
    "Doamne, ce vrei sa simt?",
    "Doamne ce vrei sa stiu?",
    "Ce vrei sa fac doamne?",
    "Care este lecția singulară de viață pe care o iei din acest stack de rugăciuni?",
    "Care este cea mai semnificativă revelație sau înțelegere cu care pleci din acest stack de rugăciuni și de ce simți așa?",
    "Ce acțiuni imediate ești hotărât să întreprinzi după ce ai terminat acest teanc de rugăciuni?",
    "Vrei să adaugi la hot list?",
    "Mai multe acțiuni?"
  ];
};
