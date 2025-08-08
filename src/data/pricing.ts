export type Plan = {
  id: "trial" | "basic" | "pro";
  name: string;
  price: string;
  period?: string;
  highlight?: string;
  benefits: string[];
  cta: string;
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "trial",
    name: "Probă 3 Zile",
    price: "0 LEI",
    period: "3 zile",
    highlight: "Testează fără risc",
    benefits: [
      "Acces complet în probă – card necesar, fără taxare în primele 3 zile",
      "Plan zilnic clar – ce faci azi ca să avansezi",
      "Acces la Coaching AI pentru focus și claritate",
      "Task-uri prioritizate ca să nu risipești timpul",
    ],
    cta: "Începe proba",
  },
  {
    id: "basic",
    name: "Basic",
    price: "97 LEI",
    period: "/ lună",
    highlight: "Fundamentul disciplinei zilnice",
    benefits: [
      "Plan zilnic de execuție – 15 minute și știi ce ai de făcut",
      "Focus pe profit: 1-3 acțiuni cu ROI maxim în fiecare zi",
      "Jurnal de progres și rapoarte săptămânale",
      "Acces la Stacks (Furie, Claritate, Focus) pentru reset rapid",
    ],
    cta: "Alege Basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: "197 LEI",
    period: "/ lună",
    highlight: "Creștere accelerată & execuție la sânge",
    benefits: [
      "Tot din Basic + Coaching AI tip Hormozi pentru ofertă și preț",
      "Sprint de 90 de zile cu obiective și checkpoint-uri",
      "KPI esențiali setați și urmăriți automat",
      "Template-uri, playbook-uri și checklists de implementare",
    ],
    cta: "Alege Pro",
    featured: true,
  },
];
