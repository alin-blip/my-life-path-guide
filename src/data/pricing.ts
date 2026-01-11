export type Plan = {
  id: "trial" | "basic" | "pro" | "monthly" | "annual" | "premium-coach";
  name: string;
  price: string;
  priceValue?: number;
  period?: string;
  highlight?: string;
  result?: string;
  benefits: string[];
  cta: string;
  featured?: boolean;
  coachingIncluded?: boolean;
};

export const plans: Plan[] = [
  {
    id: "trial",
    name: "Probă 3 Zile",
    price: "0 LEI",
    period: "3 zile",
    highlight: "Testează fără risc",
    result: "Testezi ecosistemul Jump to Freedom: în 3 zile simți claritate, focus și momentum.",
    benefits: [
      "Acces complet în probă – card necesar, fără taxare în primele 3 zile",
      "Plan zilnic clar – ce faci azi ca să avansezi",
      "Acces la Coaching AI pentru focus și claritate",
      "Task-uri prioritizate ca să nu risipești timpul",
      "Poți anula oricând în perioada de probă",
    ],
    cta: "Începe proba",
  },
  {
    id: "basic",
    name: "Basic",
    price: "97 LEI",
    period: "/ lună",
    highlight: "Fundamentul disciplinei zilnice",
    result: "Disciplină zilnică pe pilot automat și execuție fără risipă; vezi progresul săptămânal.",
    benefits: [
      "Plan zilnic de execuție – 15 minute și știi ce ai de făcut",
      "Focus pe profit: 1-3 acțiuni cu ROI maxim în fiecare zi",
      "Jurnal de progres și rapoarte săptămânale",
      "Acces la Stacks (Furie, Claritate, Focus) pentru reset rapid",
      "Setări simple pentru ritm zilnic și săptămânal",
    ],
    cta: "Alege Basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: "197 LEI",
    period: "/ lună",
    highlight: "Creștere accelerată & execuție la sânge",
    result: "Creștere accelerată cu Sprint de 90 de zile și coaching AI avansat pentru ofertă și preț.",
    benefits: [
      "Tot din Basic + Coaching AI tip Hormozi pentru ofertă și preț",
      "Sprint de 90 de zile cu obiective și checkpoint-uri",
      "KPI esențiali setați și urmăriți automat",
      "Template-uri, playbook-uri și checklists de implementare",
      "Prioritizare avansată pentru obiectivul domino",
    ],
    cta: "Alege Pro",
    featured: true,
  },
  {
    id: "monthly",
    name: "Lunar",
    price: "97 LEI",
    priceValue: 9700,
    period: "/ lună",
    highlight: "Flexibilitate maximă",
    result: "Acces complet la platformă cu plată lunară flexibilă.",
    benefits: [
      "Toate modulele platformei",
      "Coaching AI pentru obiective",
      "Goal Wizard cu milestone-uri",
      "Rutina Campionului",
      "Planificare săptămânală în Door",
    ],
    cta: "Alege Lunar",
  },
  {
    id: "annual",
    name: "Anual",
    price: "997 LEI",
    priceValue: 99700,
    period: "/ an",
    highlight: "-15% Discount",
    result: "Economisești 167 LEI pe an cu acces complet la toate funcționalitățile.",
    benefits: [
      "Tot ce include planul lunar",
      "Meditații AI personalizate nelimitate",
      "Export și backup date",
      "Support prioritar",
      "Acces la toate update-urile viitoare",
    ],
    cta: "Alege Anual",
    featured: true,
  },
  {
    id: "premium-coach",
    name: "Premium + Coaching",
    price: "197 LEI",
    priceValue: 19700,
    period: "/ lună",
    highlight: "Cu Alin Radu",
    result: "Coaching de grup săptămânal LIVE pentru accelerare maximă.",
    benefits: [
      "Tot ce include planul anual",
      "Coaching de grup săptămânal LIVE cu Alin Radu",
      "Sesiuni Q&A exclusive",
      "Comunitate VIP cu membri premium",
      "Resurse exclusive de coaching",
      "Acces prioritar la funcționalități noi",
    ],
    cta: "Alege Premium",
    featured: true,
    coachingIncluded: true,
  },
];
