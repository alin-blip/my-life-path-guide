// 2 quizzes — Percepție: how you see reality, others and yourself
import type { MindQuiz, BandKey } from "./types";

const SCORING: Record<BandKey, number> = { A: 1, B: 2, C: 3 };
const OPTIONS = [
  { key: "A" as const, text_ro: "Tot timpul", text_en: "All the time" },
  { key: "B" as const, text_ro: "Uneori", text_en: "Sometimes" },
  { key: "C" as const, text_ro: "Niciodată", text_en: "Never" },
];
const build = (pairs: Array<{ ro: string; en: string }>) =>
  pairs.map((p, i) => ({ n: i + 1, text_ro: p.ro, text_en: p.en, options: OPTIONS }));

const bands = (label_ro: string, label_en: string) => [
  {
    key: "A" as const,
    label_ro: "Distorsionată",
    label_en: "Distorted",
    summary_ro: `Percepția pe «${label_ro}» este distorsionată. Reacționezi la realitatea filtrată, nu la realitatea reală.`,
    summary_en: `Your perception on "${label_en}" is distorted. You react to filtered reality, not real reality.`,
    actions_ro: [
      "Practică «verificarea faptelor» zilnic: ce e gând, ce e fapt.",
      "Cere a doua opinie înainte să decizi.",
      "Notează predicțiile tale și verifică-le după 30 de zile.",
    ],
    actions_en: [
      "Practice daily 'fact-check': what's a thought, what's a fact.",
      "Get a second opinion before deciding.",
      "Write your predictions down and check them after 30 days.",
    ],
  },
  {
    key: "B" as const,
    label_ro: "În tranziție",
    label_en: "In transition",
    summary_ro: `Percepția ta pe «${label_ro}» oscilează. În momente bune e clară, sub stres alunecă.`,
    summary_en: `Your perception on "${label_en}" oscillates. Clear in good moments, slipping under stress.`,
    actions_ro: [
      "Identifică contextele care declanșează percepția distorsionată.",
      "Folosește un ritual scurt (3 respirații) înainte de a reacționa.",
      "Caută feedback pe interpretările tale recente.",
    ],
    actions_en: [
      "Identify contexts that trigger distorted perception.",
      "Use a short ritual (3 breaths) before reacting.",
      "Seek feedback on your recent interpretations.",
    ],
  },
  {
    key: "C" as const,
    label_ro: "Clară",
    label_en: "Clear",
    summary_ro: `Percepția pe «${label_ro}» este lucidă. Iei decizii din realitate, nu din interpretare.`,
    summary_en: `Perception on "${label_en}" is lucid. You decide from reality, not interpretation.`,
    actions_ro: [
      "Ajută-i pe alții să-și verifice propriile percepții.",
      "Documentează exemple pentru tine — pentru momentele grele.",
      "Continuă rutina de verificare a faptelor.",
    ],
    actions_en: [
      "Help others fact-check their own perceptions.",
      "Document examples for yourself — for hard times.",
      "Keep up the fact-check routine.",
    ],
  },
];

const make = (
  slug: string,
  ro: string,
  en: string,
  desc_ro: string,
  desc_en: string,
  axes: MindQuiz["axes"],
  pairs: Array<{ ro: string; en: string }>,
): MindQuiz => ({
  slug,
  category: "perception",
  title_ro: ro,
  title_en: en,
  description_ro: desc_ro,
  description_en: desc_en,
  instructions_ro: "Răspunde despre ce ți se întâmplă în realitate, nu despre ce ai vrea.",
  instructions_en: "Answer about what actually happens, not what you wish for.",
  scaleLabel_ro: "Scala A=Tot timpul · B=Uneori · C=Niciodată",
  scaleLabel_en: "Scale A=All the time · B=Sometimes · C=Never",
  scoring: SCORING,
  axes,
  questions: build(pairs),
  bands: bands(ro, en),
});

export const PERCEPTION_QUIZZES: MindQuiz[] = [
  make(
    "perceptie-despre-altii",
    "Percepția despre Ceilalți",
    "Perception of Others",
    "Cum interpretezi intențiile și comportamentele celor din jur.",
    "How you interpret others' intentions and behaviors.",
    [{ axis: "afectiva", weight: 0.7 }, { axis: "cognitiva", weight: 0.5 }],
    [
      { ro: "Presupun automat că oamenii au intenții rele.", en: "I automatically assume people have bad intentions." },
      { ro: "Citesc atacuri personale acolo unde nu există.", en: "I read personal attacks where there are none." },
      { ro: "Cred că oamenii vorbesc despre mine pe la spate.", en: "I believe people talk about me behind my back." },
      { ro: "Nu am încredere în noi cunoscuți.", en: "I don't trust new acquaintances." },
      { ro: "Interpretez tăcerea cuiva ca dezaprobare.", en: "I interpret someone's silence as disapproval." },
      { ro: "Cred că oamenii vor ceva de la mine mereu.", en: "I believe people always want something from me." },
      { ro: "Mă aștept ca cineva să mă trădeze.", en: "I expect someone to betray me." },
      { ro: "Iau personal feedback-ul profesional.", en: "I take professional feedback personally." },
      { ro: "Cred că ceilalți sunt mai răi decât arată.", en: "I believe others are worse than they appear." },
      { ro: "Văd manipulare în comportamente neutre.", en: "I see manipulation in neutral behaviors." },
    ],
  ),
  make(
    "perceptie-despre-realitate",
    "Percepția despre Realitate",
    "Perception of Reality",
    "Cum interpretezi evenimentele neutre din viața ta.",
    "How you interpret the neutral events in your life.",
    [{ axis: "cognitiva", weight: 1 }],
    [
      { ro: "Văd dificultățile ca dovadă că nimic nu funcționează.", en: "I see difficulties as proof that nothing works." },
      { ro: "Cred că un eșec înseamnă că totul e pierdut.", en: "I believe one failure means everything is lost." },
      { ro: "Confund interpretarea cu faptul.", en: "I confuse interpretation with fact." },
      { ro: "Cred că lumea e împotriva mea.", en: "I believe the world is against me." },
      { ro: "Văd doar ce confirmă convingerile mele.", en: "I only see what confirms my beliefs." },
      { ro: "Cred că dacă ceva merge bine, va veni «pedeapsa».", en: "I believe if something goes well, 'punishment' is coming." },
      { ro: "Ignor dovezile care îmi contrazic părerea.", en: "I ignore evidence that contradicts my view." },
      { ro: "Cred că o impresie e mai adevărată decât realitatea.", en: "I believe an impression is truer than reality." },
      { ro: "Iau coincidențele ca semne personale.", en: "I take coincidences as personal signs." },
      { ro: "Cred că schimbarea e imposibilă în viața mea.", en: "I believe change is impossible in my life." },
    ],
  ),
];
