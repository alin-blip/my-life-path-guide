// PSDQ (Parenting Styles & Dimensions Questionnaire) — Short Form
// Adapted from Robinson, Mandleco, Olsen & Hart (1995, 2001)
// + 6 founder-specific toxic-pattern probes (Assor/Roth 2004, Gottman 1997, Baumrind 1971)
//
// Scale: 1 = Never, 2 = Rarely, 3 = Sometimes, 4 = Often, 5 = Always

export type PSDQCategory =
  | 'authoritative'
  | 'authoritarian'
  | 'permissive'
  | 'neglectful'
  // toxic patterns (all also inflate authoritarian score):
  | 'conditional_love'
  | 'performance_worth'
  | 'yes_but'
  | 'harsh_preparation'
  | 'dismissing'
  | 'comparison';

export interface PSDQItem {
  id: string;
  category: PSDQCategory;
  ro: string;
  en: string;
  reverse?: boolean; // reverse-scored
}

export const PSDQ_ITEMS: PSDQItem[] = [
  // ==================== AUTHORITATIVE (warmth + structure) — 12 items ====================
  { id: 'A1', category: 'authoritative',
    ro: 'Sunt receptiv la sentimentele și nevoile copilului meu.',
    en: 'I am responsive to my child\'s feelings and needs.' },
  { id: 'A2', category: 'authoritative',
    ro: 'Îi explic copilului meu motivele pentru care există reguli.',
    en: 'I explain to my child the reasons behind rules.' },
  { id: 'A3', category: 'authoritative',
    ro: 'Îi arăt afecțiune fizică (îmbrățișări, atingeri calde) frecvent.',
    en: 'I give my child warm physical affection (hugs, warm touch) often.' },
  { id: 'A4', category: 'authoritative',
    ro: 'Îl încurajez să-și exprime liber părerile, chiar când nu sunt de acord cu ale mele.',
    en: 'I encourage my child to freely express opinions, even when they differ from mine.' },
  { id: 'A5', category: 'authoritative',
    ro: 'Îi laud efortul, nu doar rezultatul.',
    en: 'I praise effort, not just outcome.' },
  { id: 'A6', category: 'authoritative',
    ro: 'Când greșesc cu copilul meu, îmi cer scuze sincer.',
    en: 'When I make a mistake with my child, I offer a sincere apology.' },
  { id: 'A7', category: 'authoritative',
    ro: 'Îl ascult activ, fără să întrerup sau să judec.',
    en: 'I actively listen without interrupting or judging.' },
  { id: 'A8', category: 'authoritative',
    ro: 'Îl ajut să numească emoțiile pe care le simte („văd că ești frustrat pentru că…”).',
    en: 'I help my child name the emotions they feel ("I see you\'re frustrated because…").' },
  { id: 'A9', category: 'authoritative',
    ro: 'Am reguli clare, dar sunt dispus să le negociez când argumentul lui e valid.',
    en: 'I have clear rules but I\'m willing to negotiate when their argument is valid.' },
  { id: 'A10', category: 'authoritative',
    ro: 'Petrec timp de calitate 1-la-1 cu copilul meu, fără telefon/laptop.',
    en: 'I spend quality 1-on-1 time with my child, without phone/laptop.' },
  { id: 'A11', category: 'authoritative',
    ro: 'Când există conflict, reparăm relația împreună („rupture & repair”).',
    en: 'When conflict arises, we repair the relationship together ("rupture & repair").' },
  { id: 'A12', category: 'authoritative',
    ro: 'Îl las să facă alegeri adecvate vârstei, chiar dacă vor genera erori.',
    en: 'I let my child make age-appropriate choices, even if they lead to mistakes.' },

  // ==================== AUTHORITARIAN (control without warmth) — 6 items ====================
  { id: 'AR1', category: 'authoritarian',
    ro: 'Îl pedepsesc luându-i privilegii, fără a-i explica de ce.',
    en: 'I punish by taking away privileges without explaining why.' },
  { id: 'AR2', category: 'authoritarian',
    ro: 'Îi cer să facă lucruri „pentru că am zis eu”.',
    en: 'I demand things "because I said so."' },
  { id: 'AR3', category: 'authoritarian',
    ro: 'Îi ridic vocea sau strig la el când mă supără.',
    en: 'I raise my voice or yell when my child upsets me.' },
  { id: 'AR4', category: 'authoritarian',
    ro: 'Consider că respectul înseamnă să nu mă contrazică niciodată.',
    en: 'I believe respect means never contradicting me.' },
  { id: 'AR5', category: 'authoritarian',
    ro: 'Îl amenințez cu consecințe pe care apoi nu le aplic.',
    en: 'I threaten consequences that I later don\'t enforce.' },
  { id: 'AR6', category: 'authoritarian',
    ro: 'Îi impun standarde înalte fără să-l întreb ce simte despre ele.',
    en: 'I impose high standards without asking how they feel about them.' },

  // ==================== PERMISSIVE (warmth without structure) — 4 items ====================
  { id: 'P1', category: 'permissive',
    ro: 'Cedez cerințelor lui pentru a evita o criză.',
    en: 'I give in to my child\'s demands to avoid a tantrum.' },
  { id: 'P2', category: 'permissive',
    ro: 'Am dificultăți să impun limite atunci când protestează.',
    en: 'I struggle to enforce limits when my child protests.' },
  { id: 'P3', category: 'permissive',
    ro: 'Evit conflictul chiar dacă asta înseamnă să nu respect regula.',
    en: 'I avoid conflict even if that means not enforcing the rule.' },
  { id: 'P4', category: 'permissive',
    ro: 'Îi ofer recompense materiale ca să-l calmez.',
    en: 'I offer material rewards to calm my child down.' },

  // ==================== NEGLECTFUL (low warmth, low structure) — 3 items ====================
  { id: 'N1', category: 'neglectful',
    ro: 'Sunt prea ocupat/obosit ca să știu ce s-a întâmplat azi la școală/grădiniță.',
    en: 'I\'m too busy/tired to know what happened at school today.' },
  { id: 'N2', category: 'neglectful',
    ro: 'Îmi dau seama că petrec mai puțin de 30 min/zi prezent complet cu el.',
    en: 'I realize I spend less than 30 min/day fully present with my child.' },
  { id: 'N3', category: 'neglectful',
    ro: 'Nu știu cine sunt cei mai buni 3 prieteni ai copilului meu chiar acum.',
    en: 'I don\'t know who my child\'s 3 closest friends are right now.' },

  // ==================== TOXIC PATTERNS (founder-specific) — 6 items ====================
  { id: 'T1', category: 'conditional_love',
    ro: 'Îmi retrag afecțiunea (tăcere, distanță) când copilul face ceva greșit.',
    en: 'I withdraw affection (silence, distance) when my child does something wrong.' },
  { id: 'T2', category: 'performance_worth',
    ro: 'Îl laud mai cald când aduce note bune / câștigă la sport, decât în alte zile.',
    en: 'I praise more warmly when they bring good grades / win at sports than on other days.' },
  { id: 'T3', category: 'yes_but',
    ro: 'După ce îl laud, adaug „dar puteai și mai bine” sau „dar data viitoare…”.',
    en: 'After I praise, I add "but you could\'ve done better" or "but next time…"' },
  { id: 'T4', category: 'harsh_preparation',
    ro: 'Cred că trebuie să fiu dur cu el ca să fie pregătit pentru „viața reală”.',
    en: 'I believe I must be tough on my child to prepare them for "the real world."' },
  { id: 'T5', category: 'dismissing',
    ro: 'Îi spun „nu e nimic” / „nu plânge” când e supărat, ca să depășească rapid emoția.',
    en: 'I say "it\'s nothing" / "don\'t cry" when they\'re upset, to help them move past it fast.' },
  { id: 'T6', category: 'comparison',
    ro: 'Îl compar cu alți copii, cu frații, sau cu mine la vârsta lui.',
    en: 'I compare my child with other kids, siblings, or with myself at that age.' },
];

// ============================================================
// SCORING
// ============================================================

export interface PSDQScores {
  authoritative: number;   // 0-100
  authoritarian: number;   // 0-100
  permissive: number;      // 0-100
  neglectful: number;      // 0-100
  toxic_patterns: {
    conditional_love: number;    // 0-100 (single item)
    performance_worth: number;
    yes_but: number;
    harsh_preparation: number;
    dismissing: number;
    comparison: number;
  };
  dominant_style: 'authoritative' | 'authoritarian' | 'permissive' | 'neglectful' | 'mixed';
}

const CORE_CATEGORIES: PSDQCategory[] = ['authoritative', 'authoritarian', 'permissive', 'neglectful'];
const TOXIC_CATEGORIES: PSDQCategory[] = [
  'conditional_love', 'performance_worth', 'yes_but', 'harsh_preparation', 'dismissing', 'comparison',
];

/** Convert 1..5 raw → 0..100. Reverse-scored items are inverted. */
function normalize(value: number, reverse?: boolean): number {
  const v = reverse ? 6 - value : value;
  return ((v - 1) / 4) * 100;
}

export function scorePSDQ(answers: Record<string, number>): PSDQScores {
  const buckets: Record<string, number[]> = {};
  for (const item of PSDQ_ITEMS) {
    const raw = answers[item.id];
    if (raw == null) continue;
    const norm = normalize(raw, item.reverse);
    if (!buckets[item.category]) buckets[item.category] = [];
    buckets[item.category].push(norm);

    // Toxic items also contribute a partial weight to authoritarian
    if (TOXIC_CATEGORIES.includes(item.category)) {
      if (!buckets.authoritarian) buckets.authoritarian = [];
      buckets.authoritarian.push(norm * 0.5);
    }
  }

  const avg = (arr?: number[]) =>
    arr && arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const scores = {
    authoritative: avg(buckets.authoritative),
    authoritarian: avg(buckets.authoritarian),
    permissive: avg(buckets.permissive),
    neglectful: avg(buckets.neglectful),
    toxic_patterns: {
      conditional_love: avg(buckets.conditional_love),
      performance_worth: avg(buckets.performance_worth),
      yes_but: avg(buckets.yes_but),
      harsh_preparation: avg(buckets.harsh_preparation),
      dismissing: avg(buckets.dismissing),
      comparison: avg(buckets.comparison),
    },
    dominant_style: 'mixed' as PSDQScores['dominant_style'],
  };

  // Dominant style = highest of the 4 core, but requires ≥10-point margin
  const core = CORE_CATEGORIES.map((c) => ({ c, v: scores[c as keyof typeof scores] as number }));
  core.sort((a, b) => b.v - a.v);
  if (core[0].v - core[1].v >= 10) {
    scores.dominant_style = core[0].c as PSDQScores['dominant_style'];
  } else {
    scores.dominant_style = 'mixed';
  }

  return scores;
}

export const TOXIC_PATTERN_LABELS: Record<
  keyof PSDQScores['toxic_patterns'],
  { ro: string; en: string; source: string }
> = {
  conditional_love: {
    ro: 'Iubire condiționată',
    en: 'Conditional Love',
    source: 'Assor, Roth & Deci (2004)',
  },
  performance_worth: {
    ro: 'Valoare = Performanță',
    en: 'Performance = Worth',
    source: 'Assor & Roth (2009)',
  },
  yes_but: {
    ro: 'Tiparul „Da, dar…"',
    en: '"Yes-but" Pattern',
    source: 'Gottman (1997) — Emotion Dismissing',
  },
  harsh_preparation: {
    ro: 'Duritate „ca pregătire"',
    en: 'Harsh "as preparation"',
    source: 'Baumrind (1971); McLeod (2007) meta-analysis',
  },
  dismissing: {
    ro: 'Dismissing emoțional',
    en: 'Emotion Dismissing',
    source: 'Gottman (1997)',
  },
  comparison: {
    ro: 'Comparație cu alții',
    en: 'Comparison with others',
    source: 'Assor, Roth & Deci (2004)',
  },
};
