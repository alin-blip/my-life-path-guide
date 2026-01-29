/**
 * Mind Coach Session Continuity & Dynamic Mode Transitions
 * 
 * Logică pentru continuitatea sesiunilor și tranziții dinamice
 * între moduri de coaching conform sesiunii Tony Robbins.
 */

// ============================================================
// SESSION CONTINUITY PROMPTS
// ============================================================

export const SESSION_CONTINUITY_PROMPTS = {
  welcome_back: "Bine ai revenit! 👋 Hai să vedem progresul tău de la ultimul check-in. Cum au mers obiceiurile, rutinele și obiectivele tale?",
  
  responses: {
    great_progress: {
      prompt: "Asta e uimitor! 🎉 Ce a funcționat bine pentru tine? Hai să construim pe acel succes.",
      followUp: "Ce ai învățat despre tine din această perioadă de succes?"
    },
    ups_and_downs: {
      prompt: "E normal să ai fluctuații—face parte din călătorie. 🌊 Ce provocări au apărut și cum le-ai gestionat?",
      followUp: "Ce ai putea face diferit data viitoare când apar aceste provocări?"
    },
    struggling: {
      prompt: "Te aud, și apreciez onestitatea ta. 💙 Care crezi că e cea mai mare barieră acum? Hai să găsim o cale înainte împreună.",
      followUp: "Ce te-a ajutat în trecut când te-ai simțit blocat?"
    }
  },
  
  personalized_suggestions: `Bazat pe cum te simți, ai vrea să...
- 🧠 Intrăm mai adânc în schimbări de mindset? (Mindset coaching)
- ⚡ Ne focusăm pe energie și managementul stresului? (Energy coaching)
- 📊 Revizuim și ajustăm planul tău de accountability? (Accountability mode)
- 🎯 Lucrăm pe focus și claritate? (Focus coaching)`,
  
  milestone: (days: number, habit: string) => 
    `Ești la ${days} zile în călătoria ta cu "${habit}". 📈 Asta e consistență puternică. Care e următorul tău milestone?`,
  
  next_steps: "Hai să setăm următorul tău focus sau intenție. Care e un pas imediat pe care îl vei face înainte de următorul check-in?",
  
  closure: "Ține minte, progresul e o călătorie, nu un sprint. 🛤️ Sunt aici să te ajut să rămâi pe drum la fiecare pas."
};

// ============================================================
// DYNAMIC MODE TRANSITIONS
// ============================================================

export const MODE_TRANSITION_LOGIC = {
  // Detectare nevoie de schimbare mod
  triggers: {
    disengagement: "Simți că ai ieșit din ritm? 🤔 Uneori o perspectivă proaspătă ajută.",
    emotional_shift: "Simt că e o nouă zonă de focus care te-ar putea ajuta acum. 💡",
    completion: "Ai făcut progres excelent aici! 🎉 Vrei să explorezi altceva?"
  },
  
  transition_prompt: (nextMode: string) => 
    `Simt că e o nouă zonă de focus care te-ar putea ajuta acum. Ai vrea să explorezi ${nextMode}? Sau preferi să continuăm aici?`,
  
  mode_intro: {
    mindset: (purpose: string) => `Grozav! Hai să intrăm în modul Mindset. 🧠 Asta te va ajuta să ${purpose}.`,
    energy: () => `Perfect! Hai să ne focusăm pe energia ta. ⚡ E timpul să-ți protejezi bateriile.`,
    accountability: () => `Să vedem cum merge planul tău de accountability. 📊 E momentul pentru un check-in.`,
    focus: () => `Hai să-ți construim capacitatea de focus. 🎯 E un mușchi care se antrenează.`
  },
  
  rejection_handling: "Nicio problemă! 👍 Putem rămâne focalizați aici. Ține minte, oricând vrei să explorezi alte zone, spune-mi.",
  
  summary_after_transition: "Hai să rezumăm progresul recent și acțiunile viitoare pentru a te menține ancorat și motivat. 📝"
};

// ============================================================
// PROGRESS TRACKING HELPERS
// ============================================================

export const PROGRESS_TRACKING = {
  streak_messages: {
    3: "3 zile consecutive! 🔥 Începi să construiești momentum.",
    7: "O săptămână completă! 🌟 Obiceiul începe să devină automatism.",
    14: "Două săptămâni! 💪 Ești în zona de consolidare.",
    21: "21 de zile! 🏆 Creierul tău a început să formeze noi căi neuronale.",
    30: "O lună! 🎉 Ai transformat un comportament în parte din identitate.",
    60: "60 de zile! 🚀 Ești un exemplu de consistență.",
    90: "90 de zile! 👑 Ai atins nivelul de master în acest obicei."
  },
  
  comeback_messages: {
    1: "Bine ai revenit! 👋 O zi ratată nu e un eșec—e doar o pauză.",
    3: "Ai avut câteva zile libere. 🌱 Hai să resetăm și să reluăm de unde am rămas.",
    7: "A trecut o săptămână. 💙 Nu e niciodată prea târziu să reîncepi. Azi e ziua 1."
  },
  
  celebration_prompts: [
    "Cum vrei să celebrezi această realizare? 🎊",
    "Ce recompensă mică îți poți oferi pentru consistență? 🎁",
    "Cine ar trebui să știe despre progresul tău? 📣"
  ]
};

// ============================================================
// CONTEXT AWARENESS HELPERS
// ============================================================

export const CONTEXT_AWARENESS = {
  time_based: {
    morning: (name?: string) => `Bună dimineața${name ? `, ${name}` : ''}! ☀️ Cum vrei să începi această zi?`,
    afternoon: () => `Bună ziua! 🌤️ Cum merge ziua până acum?`,
    evening: () => `Bună seara! 🌙 Cum a fost ziua ta?`,
    night: () => `E târziu! 🌃 Tot treaz? Cum te simți?`
  },
  
  day_based: {
    monday: "Început de săptămână! 🚀 E momentul să setezi intențiile pentru următoarele 7 zile.",
    friday: "Vineri! 🎉 Cum a fost săptămâna? Să facem un scurt review.",
    sunday: "Duminică—ziua reflecției. 🧘 Cum te pregătești pentru săptămâna care vine?"
  },
  
  emotion_history: {
    recurring_negative: (emotion: string, count: number) => 
      `Am observat că te-ai simțit "${emotion}" de ${count} ori recent. 🤔 Vrei să explorăm ce se întâmplă în spatele acestui pattern?`,
    improvement: (emotion: string) => 
      `Văd progres! 📈 Te simți "${emotion}" mai rar decât înainte. Ce crezi că a contribuit la această schimbare?`
  }
};

// ============================================================
// COACHING QUALITY METRICS
// ============================================================

export const QUALITY_INDICATORS = {
  session_depth: {
    shallow: "Pare că am rămas la suprafață. 🌊 Vrei să mergem mai adânc?",
    deep: "Conversație profundă! 💎 Ai accesat insight-uri valoroase.",
    transformational: "Wow, asta a fost o transformare reală! 🦋 Cum te simți?"
  },
  
  action_commitment: {
    no_action: "Nu am identificat încă o acțiune concretă. 🎯 Ce pas mic poți face azi?",
    vague_action: "Acțiunea pare un pic vagă. 📝 Poți să o faci mai specifică?",
    clear_action: "Acțiune clară și specifică! ✅ Asta e exact ce ai nevoie pentru momentum."
  },
  
  emotional_shift: {
    no_shift: "Pare că emoția e încă prezentă. 💭 Vrei să continuăm să o procesăm?",
    partial_shift: "Simt o ușoară schimbare. 🌤️ Suntem pe drumul cel bun.",
    full_shift: "Ce transformare! 🌈 Ai trecut de la ${before} la ${after}."
  }
};
