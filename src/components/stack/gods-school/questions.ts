export const godsSchoolQuestions = [
  {
    id: 1,
    question: "Care este provocarea spirituală sau existențială cu care te confrunți în acest moment?",
    placeholder: "Descrie provocarea ta actuală..."
  },
  {
    id: 2,
    question: "Cum te simți în relația ta cu divinitatea sau cu dimensiunea spirituală a vieții?",
    placeholder: "Împărtășește-ți experiența spirituală..."
  },
  {
    id: 3,
    question: "Ce pattern sau comportament din viața ta simți că te limitează în evoluția spirituală?",
    placeholder: "Identifică ce te ține în urmă..."
  },
  {
    id: 4,
    question: "În ce situații din viața ta ai simțit prezența sau ghidarea divină?",
    placeholder: "Povestește despre momentele de conexiune..."
  },
  {
    id: 5,
    question: "Ce principiu divin sau înțelepciune spirituală simți că trebuie să înveți sau să aplici mai bine?",
    placeholder: "Ce principiu îți lipsește..."
  },
  {
    id: 6,
    question: "Cum crezi că te-ar ghida înțelepciunea zeilor în situația ta actuală?",
    placeholder: "Ce sfat divin ai primi..."
  },
  {
    id: 7,
    question: "Ce lecție profundă îți oferă această experiență pentru evoluția ta spirituală?",
    placeholder: "Ce înveți din această provocare..."
  },
  {
    id: 8,
    question: "Cum poți transforma această provocare într-o oportunitate de creștere divină?",
    placeholder: "Găsește oportunitatea din provocare..."
  },
  {
    id: 9,
    question: "Ce calitate divină (înțelepciune, compasiune, curaj, răbdare) ai nevoie să dezvolți?",
    placeholder: "Ce calitate îți lipsește..."
  },
  {
    id: 10,
    question: "Care este calea înțeleaptă de a acționa în concordanță cu principiile divine?",
    placeholder: "Cum acționezi conform principiilor supreme..."
  },
  {
    id: 11,
    question: "Ce schimbare concretă vei face în viața ta pentru a te alinia cu înțelepciunea divină?",
    placeholder: "Descrie schimbarea ta concretă..."
  },
  {
    id: 12,
    question: "Care este viziunea ta despre cum va arăta viața ta când vei integra această înțelepciune?",
    placeholder: "Vizualizează transformarea ta..."
  }
];

export const getGodsSchoolQuestionText = (step: number, answers: Record<number, string>): string => {
  const question = godsSchoolQuestions.find(q => q.id === step);
  if (!question) return "";
  
  let questionText = question.question;
  
  // Replace placeholders with previous answers for context
  if (step > 1 && answers[1]) {
    questionText = questionText.replace("{provocarea}", answers[1]);
  }
  
  return questionText;
};

export const getGodsSchoolPlaceholder = (step: number): string => {
  const question = godsSchoolQuestions.find(q => q.id === step);
  return question?.placeholder || "Împărtășește-ți gândurile...";
};