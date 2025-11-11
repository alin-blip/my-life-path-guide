export const godsSchoolQuestions = [
  "Ce titlu vei da acestui stack de învățătură divină?",
  "Ce provocare spirituală sau întrebare ai astăzi?",
  "Ce dorești să înveți din înțelepciunea divină?",
  "Cum se manifestă această situație în viața ta acum?",
  "Ce te împiedică să avansezi în această călătorie spirituală?",
  "Ce lecție spirituală vrei să integrezi în viața ta?",
  "Cum vei aplica această înțelepciune în viața de zi cu zi?",
  "Ce acțiune concretă vei întreprinde bazată pe această învățătură?"
];

export const getGodsSchoolQuestionText = (index: number, answers: Record<string, string>) => {
  return godsSchoolQuestions[index] || '';
};

export const getGodsSchoolPlaceholder = (index: number) => {
  return "Împărtășește gândurile tale divine...";
};

export const questions: string[] = godsSchoolQuestions;
