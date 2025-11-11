export const hormoziQuestions = [
  "Ce titlu vei da acestui stack de business?",
  "Care e EXACT situația ta în momentul asta?",
  "La ce business/domeniu lucrezi și cu cât vrei să crești în următoarele 90 de zile?",
  "Ce ai încercat până acum și care au fost rezultatele?",
  "Care este cel mai mare obstacol în calea scalării tale?",
  "Ce model de monetizare ai în momentul de față?",
  "Cum arată oferta ta actuală și de ce ar trebui cineva să cumpere de la tine?",
  "Ce acțiune concretă vei întreprinde pentru a scala business-ul?"
];

export const getHormoziQuestionText = (index: number, answers: Record<string, string>) => {
  return hormoziQuestions[index] || '';
};

export const getHormoziPlaceholder = (index: number) => {
  return "Descrie situația ta de business exact...";
};

export const questions: string[] = hormoziQuestions;
