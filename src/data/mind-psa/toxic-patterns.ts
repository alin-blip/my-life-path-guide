// PSA Reconstruction — 8 toxic CEO thinking patterns rewritten with the
// Problem → Substitute → Action framework. Bilingual RO/EN.
// Each pattern is mapped to the brain axes it most damages, so we can
// auto-route the user from low Brain Map scores or low quiz bands.

import type { MindAxisId } from "@/data/mind-quizzes/types";

export interface PsaField {
  key: string;
  label_ro: string;
  label_en: string;
  placeholder_ro: string;
  placeholder_en: string;
}

export interface PsaPattern {
  key: string;
  title_ro: string;
  title_en: string;
  /** The toxic belief in first person. */
  problem_ro: string;
  problem_en: string;
  /** Why it sabotages a CEO. */
  cost_ro: string;
  cost_en: string;
  /** The substitute belief — also first person, present tense. */
  substitute_ro: string;
  substitute_en: string;
  /** 3 short reframes the user can read daily. */
  reframes_ro: string[];
  reframes_en: string[];
  /** 3 concrete actions that train the substitute belief. */
  actions_ro: string[];
  actions_en: string[];
  /** Brain axes weakened by this pattern. */
  axes: MindAxisId[];
  /** Mind-test slugs that, when scored in band C, surface this pattern. */
  relatedQuizSlugs: string[];
  /** Reflection fields the user fills in to install the substitute. */
  fields: PsaField[];
}

const STANDARD_FIELDS: PsaField[] = [
  {
    key: "trigger",
    label_ro: "Situația care declanșează tiparul",
    label_en: "The situation that triggers this pattern",
    placeholder_ro: "Când, cu cine, în ce context apare?",
    placeholder_en: "When, with whom, in what context does it appear?",
  },
  {
    key: "old_voice",
    label_ro: "Vocea veche — ce îmi spun în acel moment",
    label_en: "The old voice — what I say to myself in that moment",
    placeholder_ro: "Transcrie literal gândul.",
    placeholder_en: "Transcribe the thought literally.",
  },
  {
    key: "cost",
    label_ro: "Prețul concret pe care îl plătesc",
    label_en: "The concrete cost I pay",
    placeholder_ro: "Bani, timp, energie, relații pierdute.",
    placeholder_en: "Money, time, energy, relationships lost.",
  },
  {
    key: "new_voice",
    label_ro: "Vocea nouă — fraza-substitut, la persoana I",
    label_en: "The new voice — substitute phrase, first person",
    placeholder_ro: "Scurtă, prezentă, credibilă.",
    placeholder_en: "Short, present-tense, believable.",
  },
  {
    key: "micro_action",
    label_ro: "Micro-acțiunea pe care o fac în 24h",
    label_en: "The micro-action I take within 24h",
    placeholder_ro: "Sub 15 minute, măsurabilă.",
    placeholder_en: "Under 15 minutes, measurable.",
  },
  {
    key: "weekly_protocol",
    label_ro: "Protocolul săptămânal de antrenament",
    label_en: "Weekly training protocol",
    placeholder_ro: "Cum repet noua credință 7 zile la rând.",
    placeholder_en: "How I'll rehearse the new belief 7 days in a row.",
  },
  {
    key: "evidence_target",
    label_ro: "Dovada pe care o vânez în 30 de zile",
    label_en: "The evidence I'll hunt in 30 days",
    placeholder_ro: "Rezultat concret care confirmă noua credință.",
    placeholder_en: "Concrete result that confirms the new belief.",
  },
];

export const PSA_PATTERNS: PsaPattern[] = [
  {
    key: "perfectionism",
    title_ro: "Perfecționism Paralizant",
    title_en: "Paralyzing Perfectionism",
    problem_ro: "«Dacă nu e perfect, nu lansez. Mai bine deloc decât prost.»",
    problem_en: "«If it isn't perfect, I won't ship it. Better nothing than wrong.»",
    cost_ro: "Lansări amânate cu luni, oportunități pierdute, echipa învață că nimic nu e «destul de bun».",
    cost_en: "Launches delayed by months, missed opportunities, team learns that nothing is «good enough».",
    substitute_ro: "Lansez la 80%. Piața mă învață restul de 20% în 7 zile.",
    substitute_en: "I ship at 80%. The market teaches me the other 20% in 7 days.",
    reframes_ro: [
      "Făcut bine acum bate perfect niciodată.",
      "Versiunea 1 nu trebuie să fie bună — trebuie să existe.",
      "Feedback-ul real > opinia mea despre perfecțiune.",
    ],
    reframes_en: [
      "Done well now beats perfect never.",
      "Version 1 doesn't have to be good — it has to exist.",
      "Real feedback beats my opinion of perfection.",
    ],
    actions_ro: [
      "Setează un deadline pe 7 zile pentru următoarea lansare — neschimbabil.",
      "Arată varianta «urâtă» la 3 oameni înainte de a polisha.",
      "Definește pragul «destul de bun» înainte să începi, nu după.",
    ],
    actions_en: [
      "Set a 7-day deadline for the next launch — non-negotiable.",
      "Show the «ugly» version to 3 people before polishing.",
      "Define the «good enough» threshold before you start, not after.",
    ],
    axes: ["cognitiva", "volitiva"],
    relatedQuizSlugs: ["perfectionism", "control"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "impostor",
    title_ro: "Sindromul Impostorului",
    title_en: "Impostor Syndrome",
    problem_ro: "«Sunt doar norocos. Curând își vor da seama că nu merit locul ăsta.»",
    problem_en: "«I'm just lucky. Soon they'll figure out I don't deserve this seat.»",
    cost_ro: "Sub-prețuiești, eviți scena, refuzi oportunități mari, te ascunzi de echipă.",
    cost_en: "You under-price, avoid the stage, refuse big opportunities, hide from your team.",
    substitute_ro: "Sunt aici pentru că am construit cu mâinile mele. Dovezile mele vorbesc mai tare decât frica.",
    substitute_en: "I'm here because I built this with my own hands. My evidence speaks louder than my fear.",
    reframes_ro: [
      "Nu trebuie să știu totul ca să conduc.",
      "Fiecare lider mare a simțit asta — diferența e că nu s-a oprit.",
      "Norocul nu construiește 5 ani de rezultate.",
    ],
    reframes_en: [
      "I don't need to know everything to lead.",
      "Every great leader felt this — the difference is they didn't stop.",
      "Luck doesn't build 5 years of results.",
    ],
    actions_ro: [
      "Scrie un «evidence log» cu 20 de dovezi din ultimii 3 ani.",
      "Spune cu voce tare în oglindă, dimineața, fraza-substitut, 30 zile.",
      "Acceptă următorul proiect care «te sperie puțin».",
    ],
    actions_en: [
      "Write an «evidence log» with 20 proofs from the last 3 years.",
      "Say the substitute phrase out loud in the mirror every morning, 30 days.",
      "Accept the next project that «scares you a little».",
    ],
    axes: ["emotionala", "afectiva"],
    relatedQuizSlugs: ["self-sabotage", "comparison"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "scarcity",
    title_ro: "Mentalitate de Scarcitate",
    title_en: "Scarcity Mindset",
    problem_ro: "«Nu sunt destui clienți / bani / oameni buni. Trebuie să prind ce pot, când pot.»",
    problem_en: "«There aren't enough clients / money / good people. I have to grab what I can, when I can.»",
    cost_ro: "Prețuri mici, parteneriate proaste, refuzi să delegi, decizi din frică.",
    cost_en: "Low pricing, bad partnerships, refusal to delegate, decisions made from fear.",
    substitute_ro: "Piața e infinită. Eu aleg cu cine lucrez, cum, și pentru cât.",
    substitute_en: "The market is infinite. I choose who I work with, how, and for how much.",
    reframes_ro: [
      "Următorul client perfect e la o conversație distanță.",
      "Un «nu» curat azi face loc pentru un «da» mai bun mâine.",
      "Banii curg către cine îi gestionează cu respect.",
    ],
    reframes_en: [
      "The next perfect client is one conversation away.",
      "A clean «no» today makes room for a better «yes» tomorrow.",
      "Money flows to those who manage it with respect.",
    ],
    actions_ro: [
      "Refuză un client sub-prețuit săptămâna asta.",
      "Crește prețul la următorul ofert cu minim 20%.",
      "Investește 1 oră în construirea unui activ (nu vânzare directă).",
    ],
    actions_en: [
      "Decline an under-priced client this week.",
      "Raise the price on your next offer by at least 20%.",
      "Invest 1 hour in building an asset (not direct sales).",
    ],
    axes: ["cognitiva", "emotionala"],
    relatedQuizSlugs: ["catastrophizing", "comparison"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "control-freak",
    title_ro: "Control Total",
    title_en: "Total Control",
    problem_ro: "«Dacă nu fac eu, e făcut prost. Nu pot avea încredere că alții vor livra la standardul meu.»",
    problem_en: "«If I don't do it, it'll be done badly. I can't trust others to deliver at my standard.»",
    cost_ro: "Bottleneck personal, echipă demotivată, plafonezi venitul la cât poți tu produce singur.",
    cost_en: "You become the personal bottleneck, team gets demotivated, you cap revenue at what you can produce alone.",
    substitute_ro: "Conduc prin sistem, nu prin mâinile mele. Antrenez oameni mai buni decât mine pe felia lor.",
    substitute_en: "I lead through systems, not my own hands. I train people who are better than me at their slice.",
    reframes_ro: [
      "80% făcut de altcineva > 100% făcut de mine la 2 noaptea.",
      "Greșelile echipei sunt costul antrenamentului — nu un dezastru.",
      "Dacă nu pot fi în concediu o săptămână, nu am o companie, am o slujbă.",
    ],
    reframes_en: [
      "80% done by someone else > 100% done by me at 2am.",
      "Team mistakes are the cost of training — not a disaster.",
      "If I can't take a week off, I don't have a company, I have a job.",
    ],
    actions_ro: [
      "Delegă complet un task săptămâna asta și nu te uita 7 zile.",
      "Scrie un SOP pentru cel mai repetitiv lucru pe care îl faci.",
      "Programează o «zi fără tine» în calendarul echipei.",
    ],
    actions_en: [
      "Fully delegate one task this week and don't look for 7 days.",
      "Write an SOP for the most repetitive thing you do.",
      "Schedule a «day without you» in the team's calendar.",
    ],
    axes: ["volitiva", "comportamentala"],
    relatedQuizSlugs: ["control", "perfectionism"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "hustle-burnout",
    title_ro: "Hustle 24/7 / Burnout Glorificat",
    title_en: "24/7 Hustle / Glorified Burnout",
    problem_ro: "«Dacă nu mă rup de oboseală, nu muncesc destul. Somnul e pentru cei slabi.»",
    problem_en: "«If I'm not destroyed by exhaustion, I'm not working enough. Sleep is for the weak.»",
    cost_ro: "Decizii proaste, sănătate prăbușită, relații rupte, creativitatea moare prima.",
    cost_en: "Bad decisions, collapsed health, broken relationships, creativity dies first.",
    substitute_ro: "Recuperarea e parte din strategie. Lucrez în sprinturi, nu în maratoane fără linie de sosire.",
    substitute_en: "Recovery is part of strategy. I work in sprints, not in marathons without a finish line.",
    reframes_ro: [
      "Un CEO obosit pierde mai mult în 1 oră de decizie proastă decât câștigă în 10 ore extra.",
      "Energia mea e ROI-ul cu cea mai mare pârghie din business.",
      "Pauzele plănuite previn pauzele forțate de boală.",
    ],
    reframes_en: [
      "A tired CEO loses more in 1 hour of bad decision than they gain in 10 extra hours.",
      "My energy is the highest-leverage ROI in the business.",
      "Planned breaks prevent forced breaks from illness.",
    ],
    actions_ro: [
      "Setează o oră fixă de oprit din lucru și respect-o 7 zile.",
      "Pune un ritual de recuperare zilnic (somn, sport, natură).",
      "Programează 1 zi întreagă off pe săptămână — fără e-mail.",
    ],
    actions_en: [
      "Set a fixed stop-working time and respect it for 7 days.",
      "Add a daily recovery ritual (sleep, sport, nature).",
      "Schedule 1 full day off per week — no email.",
    ],
    axes: ["comportamentala", "emotionala"],
    relatedQuizSlugs: ["self-sabotage", "victimization"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "people-pleasing",
    title_ro: "People-Pleasing",
    title_en: "People-Pleasing",
    problem_ro: "«Trebuie să spun da. Dacă refuz, voi pierde relația / clientul / oportunitatea.»",
    problem_en: "«I have to say yes. If I refuse, I'll lose the relationship / client / opportunity.»",
    cost_ro: "Calendarul plin cu lucruri ale altora, prioritățile tale rămân ultimele.",
    cost_en: "Your calendar is full of other people's work; your priorities come last.",
    substitute_ro: "Un «nu» onest azi îmi salvează 10 ore care construiesc viziunea mea.",
    substitute_en: "An honest «no» today saves me 10 hours that build my own vision.",
    reframes_ro: [
      "Yes la tot = no la viziunea mea.",
      "Cine pleacă pentru un «nu» nu era partenerul potrivit.",
      "Limitele clare creează relații mai sănătoase, nu mai puține.",
    ],
    reframes_en: [
      "Yes to everything = no to my vision.",
      "Anyone who leaves over a «no» wasn't the right partner.",
      "Clear boundaries create healthier relationships, not fewer.",
    ],
    actions_ro: [
      "Refuză prima cerere care nu se aliniază cu prioritățile săptămânii.",
      "Pregătește 2 fraze-șablon pentru «nu» elegant.",
      "Lasă 24h între cerere și răspuns la întâlniri / colaborări noi.",
    ],
    actions_en: [
      "Decline the first request that doesn't align with this week's priorities.",
      "Prepare 2 template phrases for an elegant «no».",
      "Leave 24h between request and answer for new meetings / collaborations.",
    ],
    axes: ["afectiva", "volitiva"],
    relatedQuizSlugs: ["people-pleasing", "victimization"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "procrastination",
    title_ro: "Procrastinare Strategică",
    title_en: "Strategic Procrastination",
    problem_ro: "«Mai aștept o lună. Nu sunt încă pregătit. Mai am de învățat înainte să încep.»",
    problem_en: "«I'll wait another month. I'm not ready yet. I have more to learn before I start.»",
    cost_ro: "Pierzi avantajul de pionier, învățarea fără execuție = zero rezultate.",
    cost_en: "You lose first-mover advantage; learning without execution = zero results.",
    substitute_ro: "Acțiunea precede claritatea. Învăț făcând, nu citind despre făcut.",
    substitute_en: "Action precedes clarity. I learn by doing, not by reading about doing.",
    reframes_ro: [
      "Nu voi fi niciodată «complet pregătit» — și nici nu trebuie.",
      "10 minute de execuție bat 10 ore de planificare.",
      "Frica de a începe e mai dureroasă decât începutul în sine.",
    ],
    reframes_en: [
      "I'll never be «fully ready» — and I don't need to be.",
      "10 minutes of execution beat 10 hours of planning.",
      "The fear of starting hurts more than starting itself.",
    ],
    actions_ro: [
      "Începe în următoarele 25 de minute (Pomodoro) — orice variantă, oricât de mică.",
      "Spune public unei persoane când livrezi.",
      "Sparge proiectul în primul pas de sub 15 minute.",
    ],
    actions_en: [
      "Start in the next 25 minutes (Pomodoro) — any version, however small.",
      "Tell one person publicly when you'll deliver.",
      "Break the project into the first step of under 15 minutes.",
    ],
    axes: ["volitiva", "cognitiva"],
    relatedQuizSlugs: ["self-sabotage", "perfectionism"],
    fields: STANDARD_FIELDS,
  },
  {
    key: "fear-of-success",
    title_ro: "Frica de Succes",
    title_en: "Fear of Success",
    problem_ro: "«Dacă reușesc prea mare, voi pierde libertatea / prietenii / liniștea. Nu sunt făcut pentru așa ceva.»",
    problem_en: "«If I succeed too big, I'll lose freedom / friends / peace. I'm not made for that.»",
    cost_ro: "Auto-sabotaj exact când lucrurile merg bine, plafonezi inconștient creșterea.",
    cost_en: "Self-sabotage exactly when things go well; you unconsciously cap your growth.",
    substitute_ro: "Sunt construit pentru nivelul următor. Succesul e doar o nouă versiune a mea.",
    substitute_en: "I'm built for the next level. Success is just a new version of me.",
    reframes_ro: [
      "Identitatea mea se actualizează — nu se dizolvă — odată cu succesul.",
      "Pot avea succes ȘI relații sănătoase ȘI libertate — nu sunt mutual exclusive.",
      "Plafonul meu actual a fost cândva plafonul cuiva pe care îl admir.",
    ],
    reframes_en: [
      "My identity upgrades — it doesn't dissolve — with success.",
      "I can have success AND healthy relationships AND freedom — they're not mutually exclusive.",
      "My current ceiling was once someone's ceiling whom I admire.",
    ],
    actions_ro: [
      "Vizualizează 10 minute / zi viața ta la următorul nivel — cu detalii.",
      "Identifică și demontează 1 credință despre «cum sunt oamenii bogați».",
      "Investește săptămâna asta într-un mediu / mentor de la nivelul următor.",
    ],
    actions_en: [
      "Visualize 10 min / day your life at the next level — with details.",
      "Identify and dismantle 1 belief about «what rich people are like».",
      "Invest this week in an environment / mentor from the next level.",
    ],
    axes: ["afectiva", "cognitiva"],
    relatedQuizSlugs: ["self-sabotage", "comparison"],
    fields: STANDARD_FIELDS,
  },
];

export const PSA_FIELD_KEYS = STANDARD_FIELDS.map((f) => f.key);
