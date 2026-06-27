// Reconstrucția Mentală — Blueprint Mental în 5 Faze (14 întrebări)
// Metodologie validată psiho-terapeutic, adaptată pentru CEO Mind OS.

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export interface BlueprintQuestion {
  idx: number;
  phase: PhaseId;
  text: string;
  helper: string;
  placeholder: string;
  type?: 'text' | 'number';
}

export interface BlueprintPhase {
  id: PhaseId;
  title: string;
  subtitle: string;
  color: string;
}

export const BLUEPRINT_PHASES: BlueprintPhase[] = [
  { id: 1, title: 'Conștientizare', subtitle: 'Oprește gândirea impulsivă, ancorează în prezent', color: 'sky' },
  { id: 2, title: 'Expunere',       subtitle: 'Identifică gândul automat și distorsiunea',     color: 'amber' },
  { id: 3, title: 'Dialog Socratic', subtitle: 'Provoacă convingerile cu dovezi',               color: 'violet' },
  { id: 4, title: 'Scala Asumării', subtitle: 'Echilibrează vina și controlul',                color: 'emerald' },
  { id: 5, title: 'Reîncadrare & Acțiune', subtitle: 'Gând nou realist + acțiune concretă',    color: 'rose' },
];

export const BLUEPRINT_QUESTIONS: BlueprintQuestion[] = [
  { idx: 1,  phase: 1, text: 'Care sunt faptele verificabile, fără interpretare?',
    helper: 'Scrie doar ce ai putea filma cu o cameră — fără adjective sau interpretări.',
    placeholder: 'ex: „Clientul nu a răspuns la email de 3 zile."' },
  { idx: 2,  phase: 1, text: 'Ce e nou aici și ce reactivează ceva din trecut?',
    helper: 'Separă ce ține de prezent de ce e o proiecție din trecut.',
    placeholder: 'ex: „Mi-amintește de fostul partener care mă ignora."' },
  { idx: 3,  phase: 1, text: 'Ce emoție îți distorsionează acum percepția?',
    helper: 'Numește emoția dominantă (frică, furie, rușine, tristețe, dezamăgire).',
    placeholder: 'ex: „Frica de respingere."' },

  { idx: 4,  phase: 2, text: 'Care este gândul automat care a apărut imediat?',
    helper: 'Gândul rapid, nefiltrat — așa cum a sunat în cap.',
    placeholder: 'ex: „Nu mă mai vrea, sigur am stricat tot."' },
  { idx: 5,  phase: 2, text: 'Ce tip de distorsiune pare să fie?',
    helper: 'Catastrofizare · alb-negru · generalizare · citirea minții · personalizare · etichetare · filtrare · raționament emoțional · «ar trebui».',
    placeholder: 'ex: „Citirea minții + catastrofizare."' },

  { idx: 6,  phase: 3, text: 'Care sunt dovezile reale CARE SUSȚIN gândul?',
    helper: 'Doar fapte concrete, măsurabile. Nu interpretări.',
    placeholder: 'ex: „A întârziat 3 zile la răspuns."' },
  { idx: 7,  phase: 3, text: 'Care sunt dovezile reale CARE CONTRAZIC gândul?',
    helper: 'Adu echilibrul — date care nu se potrivesc cu povestea.',
    placeholder: 'ex: „La call-ul anterior a fost entuziasmat. A mai întârziat și înainte din motive obiective."' },
  { idx: 8,  phase: 3, text: 'Ce altă interpretare, la fel de plauzibilă, există?',
    helper: 'Spargem rigiditatea — minim 2 interpretări alternative.',
    placeholder: 'ex: „E în deplasare. Are o urgență personală. Verifică oferta cu echipa."' },
  { idx: 9,  phase: 3, text: 'Este o greșeală izolată sau ține de identitatea ta? De ce?',
    helper: 'Separă comportamentul ocazional de cine ești în esență.',
    placeholder: 'ex: „E o situație, nu un pattern. Am 12 clienți activi care comunică bine cu mine."' },
  { idx: 10, phase: 3, text: 'Care e verdictul proporțional cu faptele (nu cu emoția)?',
    helper: 'Sinteză rece — ce arată faptele când scoți emoția din ecuație?',
    placeholder: 'ex: „Există o pauză de 3 zile, atât. Nu am dovezi că relația s-a rupt."' },

  { idx: 11, phase: 4, text: 'Pe o scală de la 0 la 10, cât din situație îți aparține TIE?',
    helper: '0 = nimic nu ține de mine, 10 = totul e responsabilitatea mea.',
    placeholder: 'ex: 4', type: 'number' },
  { idx: 12, phase: 4, text: 'Ce ai controlat efectiv și ce a ținut de alții/context?',
    helper: 'Granițe clare: partea mea de acțiune vs. ce nu depinde de mine.',
    placeholder: 'ex: „Eu am livrat propunerea la timp. Răspunsul lui depinde de el și echipa lui."' },

  { idx: 13, phase: 5, text: 'Care e gândul alternativ, realist, ancorat în fapte și echilibrat?',
    helper: 'NU motivațional fals — REAL. Recunoaște dificultatea + resursele tale.',
    placeholder: 'ex: „Există o pauză în comunicare. Mi-e inconfortabil, dar am gestionat situații similare. Continui follow-up profesionist."' },
  { idx: 14, phase: 5, text: 'Care este planul concret de acțiune pentru partea TA de responsabilitate?',
    helper: 'O singură acțiune executabilă în 24-48h. Va intra ca task în Domino Door.',
    placeholder: 'ex: „Trimit mâine la 10:00 un follow-up scurt cu 1 întrebare clară."' },
];

export const AXIS_LABELS_RO: Record<string, { name: string; reframe: string }> = {
  cognitiva: { name: 'Centrul de Comandă', reframe: 'cum interpretezi realitatea' },
  emotionala: { name: 'Sistemul de Reacție', reframe: 'cum reacționezi emoțional' },
  afectiva: { name: 'Siguranța Relațională', reframe: 'cum te conectezi cu ceilalți' },
  volitiva: { name: 'Motorul', reframe: 'voința, disciplina, execuția' },
  comportamentala: { name: 'Punctul de Descărcare', reframe: 'cum acționezi sub presiune' },
  profesionala: { name: 'Rezultatul', reframe: 'cum produci rezultate sustenabile' },
};
