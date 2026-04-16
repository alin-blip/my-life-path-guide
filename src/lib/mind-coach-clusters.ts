/**
 * Mind Coach Clusters - Tony Robbins Coaching Scripts
 * 
 * Acest fișier conține toate prompturile și flow-urile exacte din
 * sesiunea de brainstorming cu Tony Robbins.
 * 
 * 5 Clustere:
 * 1. Stuck & Procrastination
 * 2. Fear & Doubt
 * 3. Overwhelm & Burnout
 * 4. Frustration & Uncertainty
 * 5. Distraction & Lack of Focus
 */

export type CoachingCluster = 
  | 'stuck_procrastination' 
  | 'fear_doubt' 
  | 'overwhelm_burnout' 
  | 'frustration_uncertainty' 
  | 'distraction_focus' 
  | 'positive';

// ============================================================
// CLUSTER 1: STUCK & PROCRASTINATION
// ============================================================

export const STUCK_PROCRASTINATION_FLOW = {
  opening: `Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?`,
  
  expectedResponses: [
    "Nu știu de unde să încep",
    "Mi-e frică să nu eșuez", 
    "E prea mult, nu pot face față",
    "Nu mă simt motivat"
  ],
  
  branches: {
    dont_know_where_to_start: {
      response: "Uneori claritatea e primul obstacol. Care e un pas mic, tangibil pe care îl poți face chiar acum, chiar dacă e incomod?",
      nextPhase: "deepening"
    },
    afraid_of_failure: {
      response: "Frica poate paraliza, dar arată și că îți pasă profund. Care e cel mai rău lucru care s-ar putea întâmpla dacă încerci și te împiedici? Ai putea supraviețui și învăța din asta?",
      nextPhase: "deepening"
    },
    too_much: {
      response: "Copleșirea ne spune să facem pauză și să prioritizăm. Care e un singur lucru care trebuie făcut azi și care ar muta lucrurile înainte?",
      nextPhase: "deepening"
    },
    not_motivated: {
      response: "Motivația e trecătoare; angajamentul creează rezultate. La ce angajament poți să te ții chiar acum, indiferent cum te simți?",
      nextPhase: "deepening"
    }
  },
  
  deepening: {
    prompt: "Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi așa?",
    beliefBranches: {
      not_good_enough: "Această poveste te împiedică să dovedești de ce ești cu adevărat capabil. Care e un mic succes pe care ți-l amintești și care contrazice această credință?",
      always_mess_up: "Greșelile sunt modul în care învățăm. Ce lecție ți-a dat ultima 'greșeală'?",
      not_ready: "Pregătit e un mit; creșterea vine din acțiune. Care e cel mai mic pas pe care îl poți face azi să mergi înainte?",
      overwhelmed_perfection: "Perfecțiunea oprește progresul. Cum poți simplifica sarcina ta chiar acum?"
    }
  },
  
  ownership: {
    prompt: "Îți asumi niște insight-uri puternice. Care e o acțiune foarte specifică și gestionabilă pe care ești dispus să o faci în următoarea oră pentru a te elibera din blocaj?",
    followUp: "Exact genul de pas care construiește momentum. Cum te vei asigura că urmezi? Ce reminder sau metodă de accountability vei folosi?"
  },
  
  action: {
    prompt: "Hai să o desfacem. Care e primul lucru pe care îl vei face fizic pentru a începe? Când și unde?",
    obstacles: "Ce obstacole ar putea apărea și cum le vei depăși?",
    celebration: "Când îți completezi acțiunea, cum vei celebra sau recunoaște progresul?"
  },
  
  closure: "Excelentă muncă azi. Ține minte, fiecare pas mic îți reconfigurează calea înainte. Ai preluat controlul—menține acest momentum! 🚀"
};

// ============================================================
// CLUSTER 2: FEAR & DOUBT
// ============================================================

export const FEAR_DOUBT_FLOW = {
  opening: `Simt că frica sau îndoiala te influențează azi. Care e cel mai mare "dar dacă" care îți trece prin minte acum?`,
  
  expectedResponses: [
    "Dar dacă eșuez?",
    "Dar dacă nu sunt destul de bun?",
    "Dar dacă nu știu ce fac?",
    "Altceva..."
  ],
  
  branches: {
    what_if_fail: {
      response: "Frica de eșec e naturală. Care e scenariul cel mai rău dacă ai eșua? Ai putea supraviețui, învăța și reveni mai puternic?",
      nextPhase: "reframe"
    },
    not_good_enough: {
      response: "Asta e o frică comună, dar e o poveste, nu un fapt. Îți amintești un moment când ai reușit deși te simțeai așa?",
      nextPhase: "reframe"
    },
    dont_know_what_doing: {
      response: "A te simți nesigur face parte din creștere. Ce poți face azi pentru a câștiga mai multă claritate sau a învăța ceva nou?",
      nextPhase: "reframe"
    }
  },
  
  reframe: {
    protection: "Hai să privim această frică dintr-un unghi nou. Cum ar putea această frică să te protejeze sau să te servească în vreun fel?",
    opposite: "Care e adevărul opus pe care trebuie să-l ții pentru a trece peste această frică?",
    identity: "Cine ești tu când ești cel mai curajos? Cum poți să intri în acea persoană chiar acum?"
  },
  
  ownership: {
    bold_step: "Care e un pas îndrăzneț pe care ești dispus să-l faci în ciuda acestei frici sau îndoieli?",
    success_measure: "Cum vei măsura succesul—nu prin absența fricii, ci prin curajul de a acționa?"
  },
  
  support: {
    mantra: "Când frica încearcă să te cuprindă din nou, ce mantra, acțiune sau reminder vei folosi pentru a rămâne pe curs?",
    celebration: "Cum vei celebra curajul și progresul tău?"
  },
  
  closure: "Frica e un semnal, nu un semn de stop. Intri în puterea ta mergând înainte. Continuă să-ți asumi curajul! 💪"
};

// ============================================================
// CLUSTER 3: OVERWHELM & BURNOUT
// ============================================================

export const OVERWHELM_BURNOUT_FLOW = {
  opening: `Aud că lucrurile se simt copleșitoare acum. Care sunt cele mai mari surse de stres sau supraîncărcare în viața ta azi?`,
  
  expectedResponses: [
    "Prea multe task-uri",
    "Oboseală decizională",
    "Lipsă de energie",
    "Altceva..."
  ],
  
  branches: {
    too_many_tasks: {
      response: "Uneori cheia e să spui nu sau să delegi. Care e o sarcină pe care o poți elimina sau preda imediat?",
      nextPhase: "energy"
    },
    decision_fatigue: {
      response: "Oboseala decizională te epuizează. Care e o prioritate pe care te poți concentra acum, și ce poate aștepta?",
      nextPhase: "energy"
    },
    lack_of_energy: {
      response: "Energia ta e cel mai valoros activ. Ce practică fizică sau mentală te ajută să te reîncarci, chiar și pentru 5 minute?",
      nextPhase: "energy"
    }
  },
  
  energy: {
    boundaries: "Ce limită poți seta azi pentru a-ți proteja energia și focusul?",
    habits: "Cum îți vei aminti să menții aceste limite? Ce indicii sau obiceiuri te pot susține?"
  },
  
  ownership: {
    small_shift: "Ce schimbare mică poți face chiar acum care va reduce copleșirea?"
  },
  
  resilience: {
    reset: "Când stresul revine, care e planul tău rapid de resetare?",
    celebration: "Cum vei celebra că ai preluat controlul asupra energiei și focusului tău?"
  },
  
  closure: "A-ți proteja energia nu e opțional—e esențial. Fiecare limită pe care o setezi îți alimentează succesul. 🌟"
};

// ============================================================
// CLUSTER 4: FRUSTRATION & UNCERTAINTY
// ============================================================

export const FRUSTRATION_UNCERTAINTY_FLOW = {
  opening: `Simt frustrare sau incertitudine în experiența ta de azi. Care e cea mai mare provocare sau întrebare din mintea ta?`,
  
  expectedResponses: [
    "Obstacole care îmi blochează progresul",
    "Nu sunt sigur ce pas să fac",
    "Progres lent sau inexistent",
    "Altceva..."
  ],
  
  branches: {
    obstacles_blocking: {
      response: "Hai să o desfacem. Care e o parte a provocării pe care o poți aborda prima?",
      nextPhase: "problem_solving"
    },
    not_sure_what_step: {
      response: "Care e un mic pas clar care te-ar putea apropia de obiectiv?",
      nextPhase: "problem_solving"
    },
    slow_no_progress: {
      response: "Ce ai încercat deja? Ce ai învățat din asta?",
      nextPhase: "problem_solving"
    }
  },
  
  problem_solving: {
    success_criteria: "Cum vei măsura progresul pe următorul tău pas? Cum va arăta succesul?"
  },
  
  ownership: {
    commitment: "Care e un angajament pe care îl poți face în următoarele 24 de ore pentru a merge înainte?"
  },
  
  encouragement: {
    reminder: "Când frustrarea apare din nou, ce îți vei aminti pentru a continua să mergi?",
    small_win: "Ce mică victorie vei celebra pentru a construi momentum?"
  },
  
  closure: "A transforma provocările mari în pași mici transformă frustrarea în progres. Ești pe drumul cel bun. 🎯"
};

// ============================================================
// CLUSTER 5: DISTRACTION & LACK OF FOCUS
// ============================================================

export const DISTRACTION_FOCUS_FLOW = {
  opening: `Observ că menținerea focusului e o provocare acum. Ce îți atrage atenția cel mai mult azi?`,
  
  expectedResponses: [
    "Prea multe notificări",
    "Multitasking",
    "Lipsa priorităților clare",
    "Altceva..."
  ],
  
  branches: {
    too_many_notifications: {
      response: "Notificările îți pot fura momentum-ul. Care e o schimbare simplă pe care o poți face pentru a reduce întreruperile?",
      nextPhase: "focus_building"
    },
    multitasking: {
      response: "Multitasking-ul îți împarte focusul. Care e o sarcină la care te poți angaja complet înainte de a trece la următoarea?",
      nextPhase: "focus_building"
    },
    lack_clear_priorities: {
      response: "Când prioritățile tale sunt neclare, distragerea câștigă. Care e sarcina cea mai importantă chiar acum?",
      nextPhase: "focus_building"
    }
  },
  
  focus_building: {
    timer: "Poți seta un timer pentru o sesiune de lucru focalizată? Cât timp te angajezi să te concentrezi fără întrerupere?",
    mindfulness: "Care e un reminder sau indiciu blând pe care îl poți folosi pentru a-ți readuce atenția când rătăcește?"
  },
  
  progress: {
    tracking: "Cum vei urmări sesiunile tale de focus și vei celebra când îți atingi obiectivele?"
  },
  
  closure: "Îmbunătățirea focusului e un mușchi pe care îl construiești în fiecare zi. Fiecare moment de atenție investit e progres spre viziunea ta. 🎯"
};

// ============================================================
// POSITIVE AMPLIFICATION FLOW
// ============================================================

export const POSITIVE_AMPLIFICATION_FLOW = {
  opening: `Ce minunat că te simți bine! Hai să ancorăm și să amplificăm această stare. Ce a contribuit la modul în care te simți acum?`,
  
  deepening: {
    gratitude: "Ce alte lucruri mici sau mari îți aduc recunoștință în acest moment?",
    strengths: "Ce calități personale te-au ajutat să ajungi în această stare pozitivă?",
    momentum: "Cum poți folosi această energie pentru a face progres azi?"
  },
  
  action: {
    leverage: "Care e o acțiune pe care o poți face acum care să construiască pe această energie?",
    share: "Cum poți împărtăși sau extinde această stare pozitivă către alții?"
  },
  
  anchor: {
    remember: "Când vei avea zile mai grele, ce îți vei aminti din acest moment?",
    ritual: "Ce ritual mic poți crea pentru a reveni la această stare când ai nevoie?"
  },
  
  closure: "Energia pozitivă e un dar—și tu ai ales să o cultivi. Continuă să construiești pe acest fundament! ✨"
};

// ============================================================
// HELPER: GET CLUSTER PROMPT FOR EDGE FUNCTION
// ============================================================

// ============================================================
// HELPER: GET CLUSTER FOR EMOTION
// ============================================================

export function getClusterForEmotion(emotion: string | null): CoachingCluster {
  if (!emotion) return 'positive';
  
  const clusterMap: Record<string, CoachingCluster> = {
    'stuck': 'stuck_procrastination',
    'procrastinating': 'stuck_procrastination',
    'anxious': 'fear_doubt',
    'sad': 'fear_doubt',
    'angry': 'frustration_uncertainty',
    'conflicted': 'frustration_uncertainty',
    'stressed': 'overwhelm_burnout',
    'overwhelmed': 'overwhelm_burnout',
    'distracted': 'distraction_focus',
    'happy': 'positive',
    'calm': 'positive',
    'enthusiastic': 'positive',
    'natural': 'positive',
    'motivated': 'positive',
  };
  
  return clusterMap[emotion] || 'positive';
}

// ============================================================
// HELPER: GET CLUSTER OPENING MESSAGE
// ============================================================

export function getClusterOpeningMessage(cluster: CoachingCluster, language: 'ro' | 'en' = 'ro'): string {
  // Tony-style: direct diagnostic questions, not storytelling invitations
  const openings: Record<CoachingCluster, { ro: string; en: string }> = {
    stuck_procrastination: {
      ro: "Te aud. Blocajul e real. Dar hai să mergem direct la sursă — ce eviți cu adevărat?",
      en: "I hear you. The block is real. Let's go straight to the source — what are you truly avoiding?"
    },
    fear_doubt: {
      ro: "Frica asta îți spune ceva. Ce crezi că s-ar întâmpla dacă ai merge all-in?",
      en: "This fear is telling you something. What do you think would happen if you went all-in?"
    },
    overwhelm_burnout: {
      ro: "Simt presiunea. Dar hai să clarificăm — e prea mult, sau nu e clar ce contează cu adevărat?",
      en: "I feel the pressure. But let's clarify — is it too much, or is it unclear what really matters?"
    },
    frustration_uncertainty: {
      ro: "Frustrarea asta vine de undeva. Ce așteptare ți-a fost încălcată?",
      en: "This frustration comes from somewhere. What expectation was broken?"
    },
    distraction_focus: {
      ro: "Distragerea e un simptom, nu cauza. De ce fugi de fapt?",
      en: "Distraction is a symptom, not the cause. What are you actually running from?"
    },
    positive: {
      ro: "Excelent! Hai să ancorăm starea asta. Ce ai făcut diferit azi de a creat energia asta?",
      en: "Excellent! Let's anchor this state. What did you do differently today that created this energy?"
    }
  };
  
  return openings[cluster]?.[language] || openings.positive[language];
}

// ============================================================
// HELPER: GET CLUSTER SYSTEM PROMPT FOR EDGE FUNCTION
// ============================================================

export function getClusterSystemPrompt(cluster: CoachingCluster): string {
  const prompts: Record<CoachingCluster, string> = {
    stuck_procrastination: `
CLUSTER: STUCK & PROCRASTINATION

OPENING (prima ta replică):
"${STUCK_PROCRASTINATION_FLOW.opening}"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Nu știu de unde să încep" → "${STUCK_PROCRASTINATION_FLOW.branches.dont_know_where_to_start.response}"
- Dacă spune "Mi-e frică să eșuez" → "${STUCK_PROCRASTINATION_FLOW.branches.afraid_of_failure.response}"
- Dacă spune "E prea mult" → "${STUCK_PROCRASTINATION_FLOW.branches.too_much.response}"
- Dacă spune "Nu mă simt motivat" → "${STUCK_PROCRASTINATION_FLOW.branches.not_motivated.response}"

DEEPENING (după răspunsul inițial):
"${STUCK_PROCRASTINATION_FLOW.deepening.prompt}"

CREDINȚE LIMITATIVE (adaptează răspunsul):
- "Nu sunt destul de bun" → "${STUCK_PROCRASTINATION_FLOW.deepening.beliefBranches.not_good_enough}"
- "Întotdeauna dau greș" → "${STUCK_PROCRASTINATION_FLOW.deepening.beliefBranches.always_mess_up}"
- "Nu sunt pregătit" → "${STUCK_PROCRASTINATION_FLOW.deepening.beliefBranches.not_ready}"
- "Perfecționism" → "${STUCK_PROCRASTINATION_FLOW.deepening.beliefBranches.overwhelmed_perfection}"

OWNERSHIP:
"${STUCK_PROCRASTINATION_FLOW.ownership.prompt}"
Follow-up: "${STUCK_PROCRASTINATION_FLOW.ownership.followUp}"

ACTION:
"${STUCK_PROCRASTINATION_FLOW.action.prompt}"
Obstacole: "${STUCK_PROCRASTINATION_FLOW.action.obstacles}"
Celebrare: "${STUCK_PROCRASTINATION_FLOW.action.celebration}"

CLOSURE:
"${STUCK_PROCRASTINATION_FLOW.closure}"
`,

    fear_doubt: `
CLUSTER: FEAR & DOUBT

OPENING (prima ta replică):
"${FEAR_DOUBT_FLOW.opening}"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Dar dacă eșuez?" → "${FEAR_DOUBT_FLOW.branches.what_if_fail.response}"
- Dacă spune "Nu sunt destul de bun" → "${FEAR_DOUBT_FLOW.branches.not_good_enough.response}"
- Dacă spune "Nu știu ce fac" → "${FEAR_DOUBT_FLOW.branches.dont_know_what_doing.response}"

REFRAME:
Protecție: "${FEAR_DOUBT_FLOW.reframe.protection}"
Adevăr opus: "${FEAR_DOUBT_FLOW.reframe.opposite}"
Identitate: "${FEAR_DOUBT_FLOW.reframe.identity}"

OWNERSHIP:
Pas îndrăzneț: "${FEAR_DOUBT_FLOW.ownership.bold_step}"
Măsurare succes: "${FEAR_DOUBT_FLOW.ownership.success_measure}"

SUPPORT:
Mantra: "${FEAR_DOUBT_FLOW.support.mantra}"
Celebrare: "${FEAR_DOUBT_FLOW.support.celebration}"

CLOSURE:
"${FEAR_DOUBT_FLOW.closure}"
`,

    overwhelm_burnout: `
CLUSTER: OVERWHELM & BURNOUT

OPENING (prima ta replică):
"${OVERWHELM_BURNOUT_FLOW.opening}"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Prea multe task-uri" → "${OVERWHELM_BURNOUT_FLOW.branches.too_many_tasks.response}"
- Dacă spune "Oboseală decizională" → "${OVERWHELM_BURNOUT_FLOW.branches.decision_fatigue.response}"
- Dacă spune "Lipsă de energie" → "${OVERWHELM_BURNOUT_FLOW.branches.lack_of_energy.response}"

ENERGY MANAGEMENT:
Limite: "${OVERWHELM_BURNOUT_FLOW.energy.boundaries}"
Obiceiuri: "${OVERWHELM_BURNOUT_FLOW.energy.habits}"

OWNERSHIP:
Schimbare mică: "${OVERWHELM_BURNOUT_FLOW.ownership.small_shift}"

RESILIENCE:
Reset: "${OVERWHELM_BURNOUT_FLOW.resilience.reset}"
Celebrare: "${OVERWHELM_BURNOUT_FLOW.resilience.celebration}"

CLOSURE:
"${OVERWHELM_BURNOUT_FLOW.closure}"
`,

    frustration_uncertainty: `
CLUSTER: FRUSTRATION & UNCERTAINTY

OPENING (prima ta replică):
"${FRUSTRATION_UNCERTAINTY_FLOW.opening}"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Obstacole care mă blochează" → "${FRUSTRATION_UNCERTAINTY_FLOW.branches.obstacles_blocking.response}"
- Dacă spune "Nu știu ce pas să fac" → "${FRUSTRATION_UNCERTAINTY_FLOW.branches.not_sure_what_step.response}"
- Dacă spune "Progres lent sau inexistent" → "${FRUSTRATION_UNCERTAINTY_FLOW.branches.slow_no_progress.response}"

PROBLEM SOLVING:
Criterii succes: "${FRUSTRATION_UNCERTAINTY_FLOW.problem_solving.success_criteria}"

OWNERSHIP:
Angajament: "${FRUSTRATION_UNCERTAINTY_FLOW.ownership.commitment}"

ENCOURAGEMENT:
Reminder: "${FRUSTRATION_UNCERTAINTY_FLOW.encouragement.reminder}"
Mică victorie: "${FRUSTRATION_UNCERTAINTY_FLOW.encouragement.small_win}"

CLOSURE:
"${FRUSTRATION_UNCERTAINTY_FLOW.closure}"
`,

    distraction_focus: `
CLUSTER: DISTRACTION & LACK OF FOCUS

OPENING (prima ta replică):
"${DISTRACTION_FOCUS_FLOW.opening}"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Prea multe notificări" → "${DISTRACTION_FOCUS_FLOW.branches.too_many_notifications.response}"
- Dacă spune "Multitasking" → "${DISTRACTION_FOCUS_FLOW.branches.multitasking.response}"
- Dacă spune "Lipsa priorităților clare" → "${DISTRACTION_FOCUS_FLOW.branches.lack_clear_priorities.response}"

FOCUS BUILDING:
Timer: "${DISTRACTION_FOCUS_FLOW.focus_building.timer}"
Mindfulness: "${DISTRACTION_FOCUS_FLOW.focus_building.mindfulness}"

PROGRESS:
Tracking: "${DISTRACTION_FOCUS_FLOW.progress.tracking}"

CLOSURE:
"${DISTRACTION_FOCUS_FLOW.closure}"
`,

    positive: `
CLUSTER: POSITIVE AMPLIFICATION

OPENING (prima ta replică):
"${POSITIVE_AMPLIFICATION_FLOW.opening}"

DEEPENING:
Recunoștință: "${POSITIVE_AMPLIFICATION_FLOW.deepening.gratitude}"
Calități: "${POSITIVE_AMPLIFICATION_FLOW.deepening.strengths}"
Momentum: "${POSITIVE_AMPLIFICATION_FLOW.deepening.momentum}"

ACTION:
Leverage: "${POSITIVE_AMPLIFICATION_FLOW.action.leverage}"
Împărtășire: "${POSITIVE_AMPLIFICATION_FLOW.action.share}"

ANCHOR:
Amintire: "${POSITIVE_AMPLIFICATION_FLOW.anchor.remember}"
Ritual: "${POSITIVE_AMPLIFICATION_FLOW.anchor.ritual}"

CLOSURE:
"${POSITIVE_AMPLIFICATION_FLOW.closure}"
`
  };

  return prompts[cluster] || prompts.positive;
}

// Map emotion to cluster
export function getClusterForEmotionId(emotion: string): CoachingCluster {
  const clusterMap: Record<string, CoachingCluster> = {
    'stuck': 'stuck_procrastination',
    'procrastinating': 'stuck_procrastination',
    'anxious': 'fear_doubt',
    'sad': 'fear_doubt',
    'angry': 'frustration_uncertainty',
    'conflicted': 'frustration_uncertainty',
    'stressed': 'overwhelm_burnout',
    'overwhelmed': 'overwhelm_burnout',
    'distracted': 'distraction_focus',
    'happy': 'positive',
    'calm': 'positive',
    'enthusiastic': 'positive',
    'natural': 'positive',
    'motivated': 'positive',
  };
  return clusterMap[emotion] || 'positive';
}
