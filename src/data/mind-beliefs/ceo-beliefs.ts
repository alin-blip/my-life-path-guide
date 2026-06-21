// 10 fundamental CEO beliefs — Matricea Credințelor Antreprenorului
// Each belief: bilingual title + empowering statement + 10 reflection fields the user fills in.
// Recommendations are computed from `mind_axis_scores` — lowest axis → beliefs that target it.

import type { MindAxisId } from "@/data/mind-quizzes/types";

export interface BeliefField {
  key: string;
  label_ro: string;
  label_en: string;
  placeholder_ro: string;
  placeholder_en: string;
}

export interface CeoBelief {
  key: string;
  title_ro: string;
  title_en: string;
  /** The empowering belief statement, written in first person. */
  statement_ro: string;
  statement_en: string;
  /** Why this belief matters for a CEO/entrepreneur. */
  why_ro: string;
  why_en: string;
  /** Brain axes that this belief strengthens. */
  axes: MindAxisId[];
  /** Reflection fields the user fills in to install the belief. */
  fields: BeliefField[];
}

const STANDARD_FIELDS: BeliefField[] = [
  {
    key: "current_state",
    label_ro: "Cum trăiesc această credință acum",
    label_en: "How I live this belief today",
    placeholder_ro: "Onest — 1-3 fraze despre starea actuală.",
    placeholder_en: "Honestly — 1-3 sentences about your current state.",
  },
  {
    key: "old_belief",
    label_ro: "Credința veche care îmi blochează această credință",
    label_en: "The old belief blocking this one",
    placeholder_ro: "Ex.: «trebuie să fac totul singur»",
    placeholder_en: "E.g.: 'I have to do everything alone'",
  },
  {
    key: "evidence_for",
    label_ro: "3 dovezi din viața mea că această credință e adevărată",
    label_en: "3 pieces of evidence from my life that this belief is true",
    placeholder_ro: "Exemple concrete, fapte, nu opinii.",
    placeholder_en: "Concrete examples, facts — not opinions.",
  },
  {
    key: "daily_action",
    label_ro: "O acțiune zilnică care întărește credința",
    label_en: "A daily action that strengthens this belief",
    placeholder_ro: "Ex.: deleg 1 task înainte de prânz.",
    placeholder_en: "E.g.: delegate 1 task before lunch.",
  },
  {
    key: "weekly_action",
    label_ro: "Un ritual săptămânal aliniat",
    label_en: "A weekly ritual aligned with it",
    placeholder_ro: "Ex.: 1 oră de strategie vinerea.",
    placeholder_en: "E.g.: 1 hour of strategy on Fridays.",
  },
  {
    key: "boundary",
    label_ro: "O limită clară pe care o setez",
    label_en: "A clear boundary I set",
    placeholder_ro: "Ce nu mai accept, ce nu mai fac.",
    placeholder_en: "What I no longer accept, what I no longer do.",
  },
  {
    key: "support",
    label_ro: "Cine mă susține în această credință",
    label_en: "Who supports me in this belief",
    placeholder_ro: "Mentor, partener, coach, echipă.",
    placeholder_en: "Mentor, partner, coach, team.",
  },
  {
    key: "indicator",
    label_ro: "Cum voi măsura că trăiesc credința",
    label_en: "How I'll measure that I'm living it",
    placeholder_ro: "1-2 indicatori observabili.",
    placeholder_en: "1-2 observable indicators.",
  },
  {
    key: "next_30",
    label_ro: "Ce vreau să se schimbe în următoarele 30 de zile",
    label_en: "What I want to change in the next 30 days",
    placeholder_ro: "Rezultat concret, măsurabil.",
    placeholder_en: "Concrete, measurable outcome.",
  },
  {
    key: "anchor_phrase",
    label_ro: "Fraza-ancoră (o repet zilnic)",
    label_en: "Anchor phrase (I repeat it daily)",
    placeholder_ro: "Scurtă, la persoana I, prezent.",
    placeholder_en: "Short, first person, present tense.",
  },
];

export const CEO_BELIEFS: CeoBelief[] = [
  {
    key: "leader-integrity",
    title_ro: "Integritate de Leader",
    title_en: "Leader Integrity",
    statement_ro: "Cuvântul meu valorează cât semnătura mea. Spun adevărul chiar și când doare.",
    statement_en: "My word is as good as my signature. I tell the truth even when it hurts.",
    why_ro: "Fără integritate, echipa nu te urmează cu adevărat — execută din frică, nu din încredere.",
    why_en: "Without integrity, the team doesn't truly follow you — they execute from fear, not trust.",
    axes: ["profesionala", "comportamentala"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "self-care-ceo",
    title_ro: "Grija de Sine ca CEO",
    title_en: "Self-Care as a CEO",
    statement_ro: "Sănătatea mea fizică și mintală este activul principal al companiei. O protejez ca pe o resursă strategică.",
    statement_en: "My physical and mental health is the company's main asset. I protect it as a strategic resource.",
    why_ro: "Un CEO obosit ia decizii proaste. Burnout-ul costă mai mult decât 8 ore de somn.",
    why_en: "A tired CEO makes bad decisions. Burnout costs more than 8 hours of sleep.",
    axes: ["comportamentala", "emotionala"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "decision-wisdom",
    title_ro: "Înțelepciune Decizională",
    title_en: "Decision Wisdom",
    statement_ro: "Iau decizii din claritate, nu din presiune. Aleg cu cap rece, chiar și în furtună.",
    statement_en: "I decide from clarity, not pressure. I choose with a cool head, even in a storm.",
    why_ro: "90% din valoarea unui CEO vine din 10 decizii pe an. Calitatea deciziilor > cantitatea acțiunilor.",
    why_en: "90% of a CEO's value comes from 10 decisions per year. Decision quality beats action quantity.",
    axes: ["cognitiva", "volitiva"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "abundance-mindset",
    title_ro: "Gândire de Abundență",
    title_en: "Abundance Mindset",
    statement_ro: "Sunt destui clienți, destui bani și destui oameni buni pentru toată lumea. Cresc prin cooperare, nu prin competiție disperată.",
    statement_en: "There are enough clients, money and good people for everyone. I grow through cooperation, not desperate competition.",
    why_ro: "Frica de scarcitate generează decizii reactive: prețuri mici, parteneriate proaste, refuzul de a delega.",
    why_en: "Scarcity fear breeds reactive decisions: low pricing, bad partnerships, refusal to delegate.",
    axes: ["cognitiva", "emotionala"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "delegation-trust",
    title_ro: "Încredere în Delegare",
    title_en: "Trust in Delegation",
    statement_ro: "Oamenii sunt capabili să facă lucruri mai bine decât mine. Eu construiesc cadrul, ei aduc execuția.",
    statement_en: "People are capable of doing things better than me. I build the frame, they bring the execution.",
    why_ro: "Fără delegare nu există scalare. Ești singurul punct de eșec.",
    why_en: "No delegation, no scaling. You become the single point of failure.",
    axes: ["profesionala", "afectiva"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "long-game",
    title_ro: "Jocul pe Termen Lung",
    title_en: "The Long Game",
    statement_ro: "Construiesc ce contează în 10 ani, nu doar ce livrează săptămâna asta. Răbdarea e avantaj competitiv.",
    statement_en: "I build what matters in 10 years, not just what delivers this week. Patience is a competitive edge.",
    why_ro: "Majoritatea se uită la luna asta. Cine se uită la deceniu, câștigă deceniul.",
    why_en: "Most look at this month. Whoever looks at the decade, wins the decade.",
    axes: ["volitiva", "profesionala"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "service-orientation",
    title_ro: "Orientare spre Serviciu",
    title_en: "Service Orientation",
    statement_ro: "Compania mea există pentru a rezolva o problemă reală pentru oameni reali. Profitul vine ca rezultat, nu ca scop.",
    statement_en: "My company exists to solve a real problem for real people. Profit is the result, not the goal.",
    why_ro: "Branduri cu misiune clară atrag clienți loiali și talente bune. Cele fără misiune mor în război de preț.",
    why_en: "Mission-driven brands attract loyal clients and good talent. Mission-less ones die in price wars.",
    axes: ["profesionala", "afectiva"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "emotional-mastery",
    title_ro: "Maiestrie Emoțională",
    title_en: "Emotional Mastery",
    statement_ro: "Îmi observ emoțiile fără să fiu condus de ele. Răspund, nu reacționez.",
    statement_en: "I observe my emotions without being driven by them. I respond, not react.",
    why_ro: "Un CEO reactiv distruge echipe în 5 minute. Un CEO calm construiește încredere în luni.",
    why_en: "A reactive CEO destroys teams in 5 minutes. A calm CEO builds trust over months.",
    axes: ["emotionala", "afectiva"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "continuous-learning",
    title_ro: "Învățare Continuă",
    title_en: "Continuous Learning",
    statement_ro: "Nu există «am ajuns». Sunt în primul an la liceu — pentru tot restul vieții.",
    statement_en: "There is no 'I've arrived.' I'm a freshman — for the rest of my life.",
    why_ro: "Compania crește doar cât crește CEO-ul. Ego-ul de expert plafonează business-ul.",
    why_en: "The company grows only as much as the CEO grows. Expert ego caps the business.",
    axes: ["cognitiva", "volitiva"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "family-first",
    title_ro: "Familia Înaintea Companiei",
    title_en: "Family Before Company",
    statement_ro: "Compania e mijloc, familia e scop. Refuz să «câștig» dacă pierd oamenii care contează.",
    statement_en: "The company is a means, family is the end. I refuse to 'win' if I lose the people who matter.",
    why_ro: "Antreprenorii care divorțează sau pierd copiii ajung la 50 de ani cu cash și cu nimeni alături.",
    why_en: "Entrepreneurs who divorce or lose their kids end up at 50 with cash and no one beside them.",
    axes: ["afectiva", "emotionala"],
    fields: STANDARD_FIELDS,
  },
];

export const BELIEF_BY_KEY: Record<string, CeoBelief> = CEO_BELIEFS.reduce(
  (acc, b) => {
    acc[b.key] = b;
    return acc;
  },
  {} as Record<string, CeoBelief>,
);
