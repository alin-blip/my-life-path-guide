export const getGodsSchoolQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      "What title will you give this divine learning stack?",
      "What spiritual challenge or question do you have today?",
      "What do you want to learn from divine wisdom?",
      "How does this situation manifest in your life right now?",
      "What prevents you from advancing on this spiritual journey?",
      "What spiritual lesson do you want to integrate into your life?",
      "How will you apply this wisdom in your daily life?",
      "What concrete action will you take based on this teaching?"
    ];
  }
  
  return [
    "Ce titlu vei da acestui stack de învățătură divină?",
    "Ce provocare spirituală sau întrebare ai astăzi?",
    "Ce dorești să înveți din înțelepciunea divină?",
    "Cum se manifestă această situație în viața ta acum?",
    "Ce te împiedică să avansezi în această călătorie spirituală?",
    "Ce lecție spirituală vrei să integrezi în viața ta?",
    "Cum vei aplica această înțelepciune în viața de zi cu zi?",
    "Ce acțiune concretă vei întreprinde bazată pe această învățătură?"
  ];
};

export const godsSchoolQuestions = getGodsSchoolQuestions('ro');

export const getGodsSchoolQuestionText = (index: number, answers: Record<string, string>, language: 'en' | 'ro' = 'ro') => {
  const questions = getGodsSchoolQuestions(language);
  return questions[index] || '';
};

export const getGodsSchoolPlaceholder = (language: 'en' | 'ro' = 'ro') => {
  return language === 'en' 
    ? "Share your divine thoughts..." 
    : "Împărtășește gândurile tale divine...";
};

export const questions = godsSchoolQuestions;
