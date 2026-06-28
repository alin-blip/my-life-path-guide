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

// ============================================================================
// DEEP-DIVE: variante de întrebări reformulate prin lentila fiecărei axe.
// Păstrează aceeași structură 5 faze + 14 întrebări, dar focusează exploarea
// pe axa selectată. Doar câmpurile listate sunt suprascrise — restul rămân
// din BLUEPRINT_QUESTIONS standard.
// ============================================================================
export type AxisKey = 'cognitiva' | 'emotionala' | 'afectiva' | 'volitiva' | 'comportamentala' | 'profesionala';
type QOverride = { text?: string; helper?: string; placeholder?: string };

export const AXIS_QUESTION_OVERRIDES: Record<AxisKey, Partial<Record<number, QOverride>>> = {
  cognitiva: {
    1: { text: 'Care sunt faptele verificabile — fără interpretarea pe care mintea ta a lipit-o deja?',
         helper: 'Centrul de comandă tinde să trateze interpretarea ca fapt. Separă-le explicit.',
         placeholder: 'ex: „Clientul nu a răspuns la email de 3 zile." (fapt) vs. „nu mă mai vrea" (interpretare)' },
    3: { text: 'Ce stare cognitivă îți blochează gândirea acum (confuzie, fixație, rumegare)?',
         helper: 'Nu emoția — modul în care MINTEA procesează: blocată, accelerată, învârtită în cerc.',
         placeholder: 'ex: „Rumegare obsesivă pe un singur scenariu negativ."' },
    4: { text: 'Care e gândul-script automat pe care creierul tău l-a rulat instant?',
         helper: 'Citește-l ca pe o linie de cod. Așa cum a apărut, fără retușuri.',
         placeholder: 'ex: „Sigur am stricat ceva, mereu se întâmplă așa."' },
    8: { text: 'Ce alte 2 interpretări la fel de logice există — dacă scoți emoția din ecuație?',
         helper: 'Forțează mintea să producă alternative rezonabile. Minim 2.',
         placeholder: 'ex: „E în deplasare. / Verifică oferta cu echipa. / Are o urgență personală."' },
    13: { text: 'Care e formularea nouă, calibrată pe fapte, pe care mintea ta o poate accepta ca adevărată?',
          helper: 'Nu un slogan motivațional. O propoziție pe care mintea ta nu o respinge.',
          placeholder: 'ex: „Există o pauză de 3 zile. Nu am dovezi că relația s-a rupt. Continui follow-up."' },
  },
  emotionala: {
    1: { text: 'Care sunt faptele — și ce semnal corporal/emoțional a apărut primul?',
         helper: 'În sistemul tău de reacție, emoția vine adesea înaintea gândului. Numește-le pe ambele.',
         placeholder: 'ex: „Email fără răspuns + strângere în piept + furie scurtă."' },
    3: { text: 'Ce emoție te conduce acum și unde o simți în corp?',
         helper: 'Numește emoția specific (nu „rău") și localizează-o fizic.',
         placeholder: 'ex: „Frică de respingere — gol în stomac, gât încordat."' },
    4: { text: 'Ce ți-a spus emoția — gândul declanșat de reacție, nu de fapte?',
         helper: 'Gândul emoțional sună diferit de cel rațional. Surprinde-l așa cum a sunat.',
         placeholder: 'ex: „Nu mă mai vrea nimeni, sigur am stricat tot."' },
    11: { text: 'Pe scala 0-10, cât din reacția ta emoțională ține de TINE (nu de situație)?',
          helper: '0 = totul e provocat din afară, 10 = e doar răspunsul meu intern.',
          placeholder: 'ex: 6' },
    13: { text: 'Care e gândul care îți reglează emoția — nu o anulează, ci o aduce la nivel funcțional?',
          helper: 'Validează emoția + ancorează în realitate. Nu „nu mai fi trist".',
          placeholder: 'ex: „E firesc să mă doară. În același timp, n-am dovezi că totul s-a rupt. Pot acționa calm."' },
  },
  afectiva: {
    1: { text: 'Ce s-a întâmplat în relație — fapte verificabile, fără atribuirea de intenții?',
         helper: 'Siguranța relațională se prăbușește când presupunem intenții. Stai pe comportamente observabile.',
         placeholder: 'ex: „N-a răspuns la 2 mesaje. A văzut că le-am citit." (NU „mă ignoră intenționat")' },
    3: { text: 'Ce frică relațională s-a activat (abandon, respingere, neîncredere, nevăzut)?',
         helper: 'Numește pattern-ul de atașament care s-a aprins, nu doar emoția generică.',
         placeholder: 'ex: „Frica de abandon — că vor pleca dacă nu sunt perfect."' },
    4: { text: 'Ce „poveste" despre tine și relație ai construit instant?',
         helper: 'Mintea umple golurile cu o narațiune. Spune-o cu vocea ei, nefiltrată.',
         placeholder: 'ex: „Nu sunt suficient. Toți pleacă până la urmă."' },
    9: { text: 'E o ruptură reală în relație sau o reactivare a unei răni vechi?',
         helper: 'Separă ce ține de prezent de ce e ecou din trecut.',
         placeholder: 'ex: „E ecou din relația cu tata. În prezent, am 3 prieteni stabili lângă mine."' },
    13: { text: 'Care e gândul care îți restabilește siguranța — bazat pe ceea ce E real în relație azi?',
          helper: 'Ce dovezi de conexiune ai chiar acum, când scoți frica?',
          placeholder: 'ex: „Tăcerea lui e despre el, nu despre mine. Relațiile mele sigure sunt încă acolo."' },
  },
  volitiva: {
    1: { text: 'Care sunt faptele despre ce ai făcut/n-ai făcut — fără justificări și fără auto-pedeapsă?',
         helper: 'Motorul (voința) cere onestitate brută despre execuție. Doar acțiuni măsurabile.',
         placeholder: 'ex: „Nu am început raportul pe care l-am planificat luni. Au trecut 4 zile."' },
    3: { text: 'Ce stare îți blochează acțiunea (amânare, scârbă, blocaj, oboseală mentală)?',
         helper: 'Nu „nu am chef" — numele real al stării care îți paralizează voința.',
         placeholder: 'ex: „Paralizie din perfecționism — vreau să fie perfect din prima."' },
    4: { text: 'Care e scuza/gândul automat pe care mintea ta îl folosește ca să justifice neacțiunea?',
         helper: 'Surprinde scuza în formula ei reală, nu îmblânzită.',
         placeholder: 'ex: „Nu sunt în formă azi, încep mâine — și mâine la fel."' },
    11: { text: 'Cât din blocaj ține de TINE (decizie/disciplină) vs. de context real? 0-10.',
          helper: '0 = totul e context obiectiv, 10 = e pur lipsă de voință.',
          placeholder: 'ex: 7' },
    14: { text: 'Care e cel mai mic pas executabil în următoarele 60 de minute care sparge blocajul?',
          helper: 'NU planul mare. Pasul de 5 minute care nu se poate refuza. Va intra ca task.',
          placeholder: 'ex: „Deschid documentul și scriu primul paragraf, fără editare, 10 min."' },
  },
  comportamentala: {
    1: { text: 'Ce ai făcut concret sub presiune — comportamentul, nu intenția?',
         helper: 'Punctul de descărcare se vede în acțiunea reactivă. Numește-o fără rușine.',
         placeholder: 'ex: „Am răspuns agresiv pe Slack. Am închis laptopul și am dispărut 2 ore."' },
    3: { text: 'Ce emoție a declanșat descărcarea — și cum s-a tradus în corp/comportament?',
         helper: 'Leagă emoția de pattern-ul comportamental specific care s-a aprins.',
         placeholder: 'ex: „Furie → reacție explozivă pe canal."' },
    4: { text: 'Ce gând a justificat reacția în secunda în care a avut loc?',
         helper: 'Mintea a aprobat acțiunea cu un gând rapid. Care a fost?',
         placeholder: 'ex: „Merită — n-au respectat ce am cerut."' },
    9: { text: 'E un comportament izolat sau un pattern repetat sub presiune?',
         helper: 'Cinstit: e prima dată sau e o linie pe care o repeți?',
         placeholder: 'ex: „E al treilea episod în 2 luni — pattern."' },
    14: { text: 'Care e protocolul concret pe care îl aplici DATA VIITOARE când presiunea revine?',
          helper: 'O regulă executabilă, măsurabilă, declanșată de un trigger clar. Intră ca task.',
          placeholder: 'ex: „Când simt valul de furie, las telefonul jos și ies 5 min înainte de orice mesaj."' },
  },
  profesionala: {
    1: { text: 'Care sunt faptele despre rezultate — cifre, livrabile, deadline-uri, nu narațiuni?',
         helper: 'Axa rezultatului cere date măsurabile, nu povești despre cum „a fost greu".',
         placeholder: 'ex: „3 deal-uri pierdute în Q. 1 deadline ratat cu 4 zile. MRR -8%."' },
    3: { text: 'Ce stare profesională îți distorsionează percepția (frică de eșec, sindromul impostorului, epuizare)?',
         helper: 'Numește pattern-ul executiv care e activ acum.',
         placeholder: 'ex: „Sindromul impostorului — simt că o să descopere toți că nu știu."' },
    4: { text: 'Care e gândul automat despre tine ca executor/lider care a apărut?',
         helper: 'Cum te etichetează mintea ta profesional în acest moment?',
         placeholder: 'ex: „Nu sunt suficient de bun ca să conduc echipa asta."' },
    9: { text: 'E un rezultat izolat sau pune sub semnul întrebării competența ta reală?',
         helper: 'Separă un trimestru de identitatea ta profesională. Ce dovezi pe termen lung ai?',
         placeholder: 'ex: „E un trimestru slab. Am 8 ani de track-record solid în spate."' },
    13: { text: 'Care e narațiunea realistă despre performanța ta — care recunoaște problema FĂRĂ să demoleze identitatea?',
          helper: 'Adevărul executiv: ce nu merge + ce ai în mână ca să corectezi.',
          placeholder: 'ex: „Pipeline-ul e slab pentru că am scăzut outreach-ul. Pot rebuild în 30 zile."' },
    14: { text: 'Care e acțiunea-cheie de 80/20 pentru rezultate în 7 zile? Una singură.',
          helper: 'Acțiunea care, dacă o execuți, mută acul cel mai mult. Intră ca task.',
          placeholder: 'ex: „20 outreach mesaje calibrate pe ICP, până vineri 18:00."' },
  },
};

export function getBlueprintQuestion(idx: number, axis?: string | null): BlueprintQuestion {
  const base = BLUEPRINT_QUESTIONS.find((q) => q.idx === idx);
  if (!base) throw new Error(`No blueprint question for idx ${idx}`);
  if (!axis) return base;
  const override = AXIS_QUESTION_OVERRIDES[axis as AxisKey]?.[idx];
  if (!override) return base;
  return {
    ...base,
    text: override.text ?? base.text,
    helper: override.helper ?? base.helper,
    placeholder: override.placeholder ?? base.placeholder,
  };
}
