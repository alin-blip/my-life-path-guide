// 1 quiz — Pattern Anti-CEO: thinking patterns that destroy entrepreneurial performance
import type { MindQuiz, BandKey } from "./types";

const SCORING: Record<BandKey, number> = { A: 1, B: 2, C: 3 };
const OPTIONS = [
  { key: "A" as const, text_ro: "Frecvent", text_en: "Frequently" },
  { key: "B" as const, text_ro: "Uneori", text_en: "Sometimes" },
  { key: "C" as const, text_ro: "Aproape niciodată", text_en: "Almost never" },
];
const build = (pairs: Array<{ ro: string; en: string }>) =>
  pairs.map((p, i) => ({ n: i + 1, text_ro: p.ro, text_en: p.en, options: OPTIONS }));

export const CEO_QUIZZES: MindQuiz[] = [
  {
    slug: "pattern-anti-ceo",
    category: "ceo",
    title_ro: "Pattern Anti-CEO",
    title_en: "Anti-CEO Pattern",
    description_ro: "10 tipare de gândire care sabotează performanța de antreprenor.",
    description_en: "10 thinking patterns that sabotage entrepreneurial performance.",
    instructions_ro: "Răspunde cum gândești în săptămânile încărcate, nu în vacanță.",
    instructions_en: "Answer how you think during loaded weeks, not on vacation.",
    scaleLabel_ro: "Scala A=Frecvent · B=Uneori · C=Aproape niciodată",
    scaleLabel_en: "Scale A=Frequently · B=Sometimes · C=Almost never",
    scoring: SCORING,
    axes: [
      { axis: "profesionala", weight: 1 },
      { axis: "volitiva", weight: 0.7 },
      { axis: "cognitiva", weight: 0.5 },
    ],
    questions: build([
      { ro: "Cred că dacă nu fac eu, nu se face bine.", en: "I believe if I don't do it, it won't be done well." },
      { ro: "Iau toate deciziile eu, chiar și pe cele operaționale.", en: "I make all decisions myself, even operational ones." },
      { ro: "Lucrez în business, nu pe business.", en: "I work in the business, not on the business." },
      { ro: "Reacționez la mailuri și apeluri toată ziua.", en: "I react to emails and calls all day long." },
      { ro: "Amân deciziile grele zile în șir.", en: "I postpone hard decisions for days on end." },
      { ro: "Sunt singurul care cunoaște procese cheie.", en: "I'm the only one who knows key processes." },
      { ro: "Mă identific cu compania — succes/eșec personal.", en: "I identify with the company — personal success/failure." },
      { ro: "Sacrific somnul/sportul pentru muncă mereu.", en: "I sacrifice sleep/sport for work constantly." },
      { ro: "Cred că nu pot lua o pauză sau totul se prăbușește.", en: "I believe I can't take a break or everything collapses." },
      { ro: "Reușita mă face să-mi ridic standardul fără să mă bucur.", en: "Success makes me raise the bar without celebrating." },
    ]),
    bands: [
      {
        key: "A",
        label_ro: "CEO blocat în operațional",
        label_en: "CEO stuck in ops",
        summary_ro: "Tiparul Anti-CEO este dominant. Ești în business, nu pe el. Riscul de burnout și plafonare a companiei este mare.",
        summary_en: "The Anti-CEO pattern dominates. You're in the business, not on it. High burnout and ceiling risk.",
        actions_ro: [
          "Listează 10 lucruri pe care le faci săptămânal — delegă 3 în 14 zile.",
          "Setează 2 ore/săptămână de lucru «pe business" — non-negociabil.",
          "Construiește un SOP pentru cel mai critic proces unde ești bottleneck.",
        ],
        actions_en: [
          "List 10 things you do weekly — delegate 3 in 14 days.",
          "Set 2 hrs/week of 'on the business' work — non-negotiable.",
          "Build an SOP for the most critical process where you're the bottleneck.",
        ],
      },
      {
        key: "B",
        label_ro: "CEO în tranziție",
        label_en: "CEO in transition",
        summary_ro: "Ai conștientizat tiparele Anti-CEO dar reaplici sub presiune. Construiește sisteme acum, nu eroism.",
        summary_en: "You've spotted the Anti-CEO patterns but fall back under pressure. Build systems now, not heroism.",
        actions_ro: [
          "Identifică 3 zone unde ești singurul punct de eșec și construiește redundanță.",
          "Setează limite clare: ore de început/sfârșit.",
          "Recrutează o persoană care preia operaționalul, nu doar execuția.",
        ],
        actions_en: [
          "Identify 3 areas where you're the single point of failure and build redundancy.",
          "Set clear limits: start/end hours.",
          "Hire someone who takes over operations, not just execution.",
        ],
      },
      {
        key: "C",
        label_ro: "CEO de nivel",
        label_en: "Leveled-up CEO",
        summary_ro: "Lucrezi pe business, nu în el. Compania funcționează fără ca tu să fii prezent constant.",
        summary_en: "You work on the business, not in it. The company runs without you being constantly present.",
        actions_ro: [
          "Documentează formula ta — viitoarea companie/franchize.",
          "Investește 20% din timp în strategie de creștere.",
          "Mentorizează un alt antreprenor în transformare.",
        ],
        actions_en: [
          "Document your formula — future company/franchise.",
          "Invest 20% of time in growth strategy.",
          "Mentor another entrepreneur in transition.",
        ],
      },
    ],
  },
];
