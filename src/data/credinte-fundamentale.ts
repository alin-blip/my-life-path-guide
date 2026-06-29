// Cele 5 Credințe ale Liderului — întrebări Fish Bowl & Executive Audit
// Conținut moștenit din materialele Alin Radu (PRP). Limbaj propriu CEO Mind OS.

export type ChapterSlug = "bunatate" | "iubire-de-oameni" | "recunostinta" | "iertare" | "smerenia";

export const CHAPTER_ORDER: ChapterSlug[] = [
  "bunatate",
  "iubire-de-oameni",
  "recunostinta",
  "iertare",
  "smerenia",
];

export const CHAPTER_META: Record<
  ChapterSlug,
  { title: string; subtitle: string; color: string; icon: string; description: string }
> = {
  bunatate: {
    title: "Bunătate",
    subtitle: "Credința #1",
    color: "#10B981",
    icon: "Heart",
    description: "Bunătatea ca filtru de decizie — fundamentul leadership-ului uman.",
  },
  "iubire-de-oameni": {
    title: "Iubire de Oameni",
    subtitle: "Credința #2",
    color: "#EF4444",
    icon: "Users",
    description: "Liderul vede oamenii înainte de rezultate. Iubirea ca strategie pe termen lung.",
  },
  recunostinta: {
    title: "Recunoștință",
    subtitle: "Credința #3",
    color: "#F59E0B",
    icon: "Sparkles",
    description: "Recunoștința ca antidot la autosabotaj și ancoră de claritate executivă.",
  },
  iertare: {
    title: "Iertare",
    subtitle: "Credința #4",
    color: "#8B5CF6",
    icon: "Sun",
    description: "Iertarea ca eliberare de greutatea trecutului — condiție pentru putere.",
  },
  smerenia: {
    title: "Smerenia",
    subtitle: "Credința #5",
    color: "#3B82F6",
    icon: "Mountain",
    description: "Smerenia ca opus al aroganței — uşa către învățare continuă.",
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Fish Bowl — întrebări introspective deschise (5 pe capitol)
// ────────────────────────────────────────────────────────────────────────────
export const FISHBOWL_QUESTIONS: Record<ChapterSlug, string[]> = {
  bunatate: [
    "Când ai ales ultima dată duritatea în locul bunătății în business? Ce te-a costat acea alegere?",
    "Cu cine din echipa ta ești cel mai dur și de ce crezi că ai construit acea relație așa?",
    "Care e diferența ta personală între bunătate și slăbiciune? Unde se confundă?",
    "Ce ar însemna concret să fii „bun cu tine însuți” săptămâna asta?",
    "Ce decizie de business ai amânat pentru că ești dur cu tine pentru o greșeală trecută?",
  ],
  "iubire-de-oameni": [
    "Pe cine din viața ta tratezi ca pe un mijloc, nu ca pe un om? (echipă, clienți, familie)",
    "Care e ultimul moment în care ai oprit totul ca să asculți pe cineva fără să-l corectezi?",
    "Ce ai pierdut economic alegând să iubești pe cineva? Și ce ai câștigat?",
    "Cum se schimbă echipa ta când simte că o iubești vs. când o folosești?",
    "Ce frică te oprește să arăți afecțiune oamenilor cu care lucrezi?",
  ],
  recunostinta: [
    "Pentru ce ești recunoscător azi, exact azi, fără să recurgi la clișee?",
    "Ce oameni au contribuit la unde ești și pe care nu i-ai mulțumit cu adevărat?",
    "Ce „problemă” a ta de fapt e un privilegiu pe care alții nu îl au?",
    "Când spui „nu e suficient”, ce comparație ascunsă faci?",
    "Cum ar arăta business-ul tău dacă ai conduce dintr-o stare de „este destul” în loc de „nu ajunge”?",
  ],
  iertare: [
    "Pe cine porți cu tine pentru că nu l-ai iertat — și cât te costă energetic acea povară?",
    "Pentru ce nu te-ai iertat încă? Ce decizie sau eșec?",
    "Ce comportament repetitiv toxic apare în tine din cauza unei răni neînchise?",
    "Cum ar fi să-ți scrii o scrisoare de iertare către tine de acum 10 ani?",
    "Cine merită cel mai puțin iertarea ta? Și ce te-ar face liber dacă i-ai oferi-o oricum?",
  ],
  smerenia: [
    "Unde, în ultima săptămână, ai vorbit ca să demonstrezi în loc să asculți?",
    "Care e ultima ta greșeală pe care nu ai recunoscut-o public în echipă?",
    "Pe ce credință despre tine însuți („sunt cel mai…”) îți construiești ego-ul?",
    "Cine ar trebui în consiliul tău de administrație ca să-ți spună adevărul?",
    "Ce ai învăța dacă ai accepta că nu știi răspunsul la întrebarea cea mai importantă din viața ta acum?",
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Executive Audit — 25 întrebări Likert (5 per credință) la 90 zile
// ────────────────────────────────────────────────────────────────────────────
export type AuditQuestion = { id: string; chapter: ChapterSlug; text: string };

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  // Bunătate
  { id: "b1", chapter: "bunatate", text: "În ultimele 30 de zile am ales bunătatea chiar și când era costisitoare." },
  { id: "b2", chapter: "bunatate", text: "Sunt blând cu mine însumi când greșesc, fără să mă autoflagelez." },
  { id: "b3", chapter: "bunatate", text: "Echipa mea simte bunătate când lucrăm sub presiune, nu doar când totul e ok." },
  { id: "b4", chapter: "bunatate", text: "Bunătatea mea NU se confundă cu lipsa de standarde sau acordarea de favoruri." },
  { id: "b5", chapter: "bunatate", text: "Iau decizii dificile cu bunătate — închid relații, refuz clienți, fac concedieri cu demnitate." },
  // Iubire de oameni
  { id: "l1", chapter: "iubire-de-oameni", text: "Pun oamenii înaintea cifrelor când cele două intră în conflict." },
  { id: "l2", chapter: "iubire-de-oameni", text: "Cunosc visele și fricile celor mai apropiați din echipa mea." },
  { id: "l3", chapter: "iubire-de-oameni", text: "Investesc timp în relații care nu îmi aduc beneficiu imediat." },
  { id: "l4", chapter: "iubire-de-oameni", text: "Familia mea simte că o iubesc mai mult decât business-ul." },
  { id: "l5", chapter: "iubire-de-oameni", text: "Ascult oameni fără să-i corectez sau să le ofer soluții nesolicitate." },
  // Recunoștință
  { id: "r1", chapter: "recunostinta", text: "Pot enumera 10 lucruri concrete pentru care sunt recunoscător azi." },
  { id: "r2", chapter: "recunostinta", text: "Recunoștința mea NU este performativă — o simt zilnic, nu doar o postez." },
  { id: "r3", chapter: "recunostinta", text: "Mulțumesc nominal oamenilor care contribuie la succesul meu, în mod regulat." },
  { id: "r4", chapter: "recunostinta", text: "Conduc business-ul dintr-o stare de „este destul” mai des decât „nu ajunge”." },
  { id: "r5", chapter: "recunostinta", text: "Sărbătoresc victoriile mici, nu doar pe cele mari." },
  // Iertare
  { id: "i1", chapter: "iertare", text: "Nu port resentimente față de persoane care mi-au făcut rău în trecut." },
  { id: "i2", chapter: "iertare", text: "M-am iertat pentru greșelile mari pe care le-am făcut ca lider." },
  { id: "i3", chapter: "iertare", text: "Iertarea mea este reală, nu suprimare — pot vorbi despre rană fără emoție toxică." },
  { id: "i4", chapter: "iertare", text: "Nu transmit copiilor / echipei mele rănile mele neînchise." },
  { id: "i5", chapter: "iertare", text: "Când cineva îmi cere iertare cu sinceritate, o ofer fără negocieri." },
  // Smerenia
  { id: "s1", chapter: "smerenia", text: "Recunosc deschis când greșesc, în fața echipei mele." },
  { id: "s2", chapter: "smerenia", text: "Caut activ feedback critic și îl primesc fără să mă apăr." },
  { id: "s3", chapter: "smerenia", text: "Am 2-3 oameni în jur care îmi spun adevărul, nu doar ce vreau să aud." },
  { id: "s4", chapter: "smerenia", text: "Nu mă compar superior cu alți antreprenori — îmi văd propriile slăbiciuni." },
  { id: "s5", chapter: "smerenia", text: "Sunt deschis să învăț de la oameni „mai mici” decât mine (juniori, copii, clienți)." },
];

export const LIKERT_LABELS = [
  "Niciodată",
  "Rar",
  "Uneori",
  "Des",
  "Mereu",
];

export function classifyScore(score: number): { label: string; color: string; description: string } {
  if (score >= 80) return { label: "Autentică", color: "#10B981", description: "Credință integrată și trăită zilnic." };
  if (score >= 50) return { label: "Formală", color: "#3B82F6", description: "Credință înțeleasă conceptual, aplicată inconsistent." };
  if (score >= 30) return { label: "Mecanică", color: "#F59E0B", description: "Credință declarată, dar fără rădăcină. Risc de fațadă." };
  return { label: "Falsă", color: "#EF4444", description: "Credință absentă sau opusă comportamentului real." };
}
