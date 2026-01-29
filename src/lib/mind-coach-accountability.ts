/**
 * Mind Coach Accountability & Reminder Prompts
 * 
 * Sistem de reminder și follow-up pentru accountability conform
 * sesiunii de brainstorming Tony Robbins.
 */

// ============================================================
// HABIT ADDITION PROMPTS
// ============================================================

export const HABIT_ADDITION_PROMPTS = {
  trigger: "Am observat că vrei să începi un nou obicei. Să-l adăugăm! 🎯",
  
  name: "Ce obicei sau task ai vrea să adaugi?",
  
  category: "Cărei arii a vieții tale îi aparține acest obicei?\n- 💪 Body (corp, sănătate, fitness)\n- 🧘 Being (minte, spirit, dezvoltare)\n- ⚖️ Balance (relații, timp liber)\n- 💼 Business (carieră, finanțe)\n- ✨ Custom (altceva)",
  
  reminder: "Când ai vrea să-ți reamintesc să lucrezi la acest obicei? (ex: 'în fiecare dimineață la 7' sau 'de 3 ori pe săptămână')",
  
  confirmation: (category: string, habit: string, reminder?: string) => 
    `Grozav! Ai setat un nou obicei pentru ${category}: "${habit}"${reminder ? ` cu reminder-e ${reminder}` : ''}. Te voi ajuta să rămâi responsabil! ✅`,
    
  categories: {
    body: { label: 'Body', emoji: '💪', description: 'Corp, sănătate, fitness' },
    being: { label: 'Being', emoji: '🧘', description: 'Minte, spirit, dezvoltare' },
    balance: { label: 'Balance', emoji: '⚖️', description: 'Relații, timp liber' },
    business: { label: 'Business', emoji: '💼', description: 'Carieră, finanțe' },
    custom: { label: 'Custom', emoji: '✨', description: 'Altceva' },
  }
};

// ============================================================
// REMINDER & FOLLOW-UP PROMPTS
// ============================================================

export const REMINDER_FOLLOWUP_PROMPTS = {
  scheduled: (habit: string, category: string) => 
    `Salut! 👋 Acesta e un reminder prietenos să lucrezi la obiceiul tău: "${habit}" în aria ${category}. L-ai completat?`,
  
  responses: {
    done: "Grozav! 🎉 Consistența ta creează momentum real. Cum te simți după ce l-ai completat?",
    not_yet: "E în regulă, nu te judec. 💭 Ce te blochează să-l faci chiar acum?",
    partially: "Super că ai făcut progres! 👏 Care e următorul pas pentru a-l termina?"
  },
  
  encouragement: "Ține minte, fiecare pas contează. 💪 La ce angajament îți vei ține pentru a urmări azi?",
  
  streak_celebration: (habit: string, days: number) => 
    `🔥 Ai completat "${habit}" consistant pentru ${days} zile—asta construiește momentum de neoprit! Continuă să-ți asumi progresul!`,
  
  missed_support: "Am observat că ai ratat acest obicei de câteva ori recent. 🤔 Ce ajustări putem face pentru a te ajuta să revii pe drum?",
  
  weekly_check: "E timpul pentru check-in-ul săptămânal! 📊 Cum au mers obiceiurile tale în această săptămână?"
};

// ============================================================
// HIT LIST INTEGRATION PROMPTS
// ============================================================

export const HIT_LIST_PROMPTS = {
  add_suggestion: "Vreau să adaug această acțiune în HIT List-ul tău de azi. E în regulă? 📝",
  
  added_confirmation: (task: string) => 
    `Gata! ✅ Am adăugat "${task}" în HIT List-ul tău. Vei primi reminder să o completezi!`,
  
  priority_question: "Care e prioritatea acestei acțiuni?\n- 🔴 Urgent (trebuie făcută AZI)\n- 🟡 Important (în această săptămână)\n- 🟢 Normal (când ai timp)",
  
  follow_up: (task: string) => 
    `Cum a mers cu "${task}"? Ai reușit să o completezi?`
};

// ============================================================
// ACCOUNTABILITY COACH SYNC
// ============================================================

export const ACCOUNTABILITY_SYNC_PROMPTS = {
  morning_check: "Bună dimineața! ☀️ Hai să vedem ce ai de făcut azi. Ai completat Warrior Routine-ul?",
  
  routine_incomplete: "Am observat că nu ai terminat încă Warrior Routine-ul. 🤔 Ce te blochează și cum te pot ajuta?",
  
  domino_door_check: "Ai creat Domino Door-ul pentru această săptămână? E cel mai important pas pentru claritate.",
  
  breakthrough_celebration: (emotion: string) => 
    `Văd că ai avut un breakthrough azi—ai transformat ${emotion} în putere! 🎉 Cum te simți acum?`,
  
  progress_summary: (completed: number, total: number) => 
    `Ai completat ${completed}/${total} task-uri azi. ${completed === total ? 'Excelent! 🏆' : 'Continuă—ești aproape! 💪'}`
};

// ============================================================
// MODE SUGGESTION PROMPTS
// ============================================================

export const MODE_SUGGESTION_PROMPTS = {
  mindset: {
    trigger: "Simt că te-ar ajuta să lucrezi la mindset. Vrei să explorăm asta?",
    intro: "Hai să intrăm în modul Mindset. Te va ajuta să-ți schimbi perspectiva și să găsești putere.",
    purpose: "schimbi perspectiva și să găsești putere"
  },
  
  energy: {
    trigger: "Energia ta pare să aibă nevoie de atenție. Vrei să ne focusăm pe asta?",
    intro: "Hai să ne focusăm pe energia ta. E timpul să-ți protejezi și reîncarci bateriile.",
    purpose: "să-ți protejezi și reîncarci energia"
  },
  
  accountability: {
    trigger: "Să verificăm cum merge planul tău de accountability.",
    intro: "Hai să revedem angajamentele tale și să vedem unde poți ajusta.",
    purpose: "să-ți reconfirmi angajamentele"
  },
  
  focus: {
    trigger: "Focusul pare să fie o provocare. Vrei să lucrăm la asta?",
    intro: "Hai să-ți construim capacitatea de focus. E un mușchi care se antrenează.",
    purpose: "să-ți îmbunătățești capacitatea de concentrare"
  }
};
