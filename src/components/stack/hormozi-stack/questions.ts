export const getHormoziQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      "What title will you give this business stack?",
      "What is your EXACT situation right now?",
      "What business/field are you working on and how much do you want to grow in the next 90 days?",
      "What have you tried so far and what were the results?",
      "What is the biggest obstacle to your scaling?",
      "What monetization model do you have right now?",
      "What does your current offer look like and why should someone buy from you?",
      "What concrete action will you take to scale your business?"
    ];
  }
  
  return [
    "Ce titlu vei da acestui stack de business?",
    "Care e EXACT situația ta în momentul asta?",
    "La ce business/domeniu lucrezi și cu cât vrei să crești în următoarele 90 de zile?",
    "Ce ai încercat până acum și care au fost rezultatele?",
    "Care este cel mai mare obstacol în calea scalării tale?",
    "Ce model de monetizare ai în momentul de față?",
    "Cum arată oferta ta actuală și de ce ar trebui cineva să cumpere de la tine?",
    "Ce acțiune concretă vei întreprinde pentru a scala business-ul?"
  ];
};

export const hormoziQuestions = getHormoziQuestions('ro');

export const getHormoziQuestionText = (index: number, answers: Record<string, string>, language: 'en' | 'ro' = 'ro') => {
  const questions = getHormoziQuestions(language);
  return questions[index] || '';
};

export const getHormoziPlaceholder = (language: 'en' | 'ro' = 'ro') => {
  return language === 'en' 
    ? "Describe your business situation exactly..." 
    : "Descrie situația ta de business exact...";
};

export const questions = hormoziQuestions;
