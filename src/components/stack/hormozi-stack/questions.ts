export const hormoziQuestions = [
  {
    id: 1,
    question: "Care e situația EXACTĂ a business-ului tău ACUM? Cât faci pe lună și din ce?",
    placeholder: "Ex: Fac 15k euro/lună din coaching 1-on-1, am 30 de clienți, lucrare 60 ore/săptămână..."
  },
  {
    id: 2,
    question: "Cu câți bani vrei să crești în următoarele 90 de zile? Fii SPECIFIC cu cifra.",
    placeholder: "Ex: Vreau să ajung la 30k euro/lună în 90 de zile..."
  },
  {
    id: 3,
    question: "Care e BOTTLENECK-ul principal care te blochează să ajungi la cifra aia?",
    placeholder: "Ex: Nu am destui leaduri, nu convert suficient, nu am timp să livrez..."
  },
  {
    id: 4,
    question: "Ce ai încercat până acum și de ce NU a funcționat? Fără scuze, doar fapte.",
    placeholder: "Ex: Am încercat Facebook ads dar nu știam să optimizez, am încercat să cresc prețurile dar..."
  },
  {
    id: 5,
    question: "Câți bani pierzi în fiecare ZI pentru că nu rezolvi problema principală?",
    placeholder: "Ex: Pierd 500 euro/zi pentru că refuz 10 clienți zilnic din lipsă de timp..."
  },
  {
    id: 6,
    question: "Care e OFERTA ta actuală? Cum sună exact ce vinzi?",
    placeholder: "Ex: Coaching 1-on-1 pentru 3 luni, 2000 euro, 2 sesiuni/săptămână..."
  },
  {
    id: 7,
    question: "Câți leaduri primești pe săptămână și din ce surse?",
    placeholder: "Ex: 50 leaduri/săptămână: 30 din referrals, 15 din social media, 5 din ads..."
  },
  {
    id: 8,
    question: "Care e rata ta de conversie din lead în client? Și din prospect în vânzare?",
    placeholder: "Ex: Din 100 leaduri, 20 devin prospects și 5 devin clienți plătitori..."
  },
  {
    id: 9,
    question: "Cât valorează un client pe toată durata colaborării? (Lifetime Value)",
    placeholder: "Ex: Un client aduce în medie 8000 euro în 12 luni..."
  },
  {
    id: 10,
    question: "Ce LEVERAGE ai acum? Echipă, sisteme, automatizări, capital?",
    placeholder: "Ex: Am 2 VA-uri, un sistem de CRM, 50k euro în bancă pentru investiții..."
  },
  {
    id: 11,
    question: "Care e cea mai mare FRICĂ ta legată de scaling business-ul?",
    placeholder: "Ex: Mă tem că nu voi putea menține calitatea dacă cresc prea repede..."
  },
  {
    id: 12,
    question: "Dacă ai avea o baghetă magică, care ar fi PRIMA schimbare pe care ai face-o MÂINE?",
    placeholder: "Ex: Aș automatiza procesul de onboarding să nu mai pierd 10 ore/săptămână..."
  }
];

export const getHormoziQuestionText = (step: number, answers: Record<number, string>): string => {
  const question = hormoziQuestions[step - 1];
  if (!question) return "";

  let questionText = question.question;

  // Replace placeholders with previous answers for context
  if (step === 3 && answers[2]) {
    questionText = questionText.replace("cifra aia", `${answers[2]}`);
  }

  return questionText;
};

export const getHormoziPlaceholder = (step: number): string => {
  const question = hormoziQuestions[step - 1];
  return question?.placeholder || "Scrie răspunsul tău aici...";
};