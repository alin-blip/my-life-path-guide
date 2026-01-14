export type Plan = {
  id: "trial" | "basic" | "pro" | "monthly" | "annual" | "premium-coach";
  nameEn: string;
  nameRo: string;
  priceEn: string;
  priceRo: string;
  priceValue?: number;
  periodEn?: string;
  periodRo?: string;
  highlightEn?: string;
  highlightRo?: string;
  resultEn?: string;
  resultRo?: string;
  benefitsEn: string[];
  benefitsRo: string[];
  ctaEn: string;
  ctaRo: string;
  featured?: boolean;
  coachingIncluded?: boolean;
};

export const plans: Plan[] = [
  {
    id: "trial",
    nameEn: "3-Day Trial",
    nameRo: "Probă 3 Zile",
    priceEn: "€0",
    priceRo: "0 LEI",
    periodEn: "3 days",
    periodRo: "3 zile",
    highlightEn: "Risk-free trial",
    highlightRo: "Testează fără risc",
    resultEn: "Experience the LifeOS ecosystem: in 3 days feel clarity, focus and momentum.",
    resultRo: "Testezi ecosistemul LifeOS: în 3 zile simți claritate, focus și momentum.",
    benefitsEn: [
      "Full access during trial – card required, no charge for 3 days",
      "Clear daily plan – know exactly what to do today",
      "Access to AI Coaching for focus and clarity",
      "Prioritized tasks so you don't waste time",
      "Cancel anytime during trial period",
    ],
    benefitsRo: [
      "Acces complet în probă – card necesar, fără taxare în primele 3 zile",
      "Plan zilnic clar – ce faci azi ca să avansezi",
      "Acces la Coaching AI pentru focus și claritate",
      "Task-uri prioritizate ca să nu risipești timpul",
      "Poți anula oricând în perioada de probă",
    ],
    ctaEn: "Start Trial",
    ctaRo: "Începe proba",
  },
  {
    id: "basic",
    nameEn: "Basic",
    nameRo: "Basic",
    priceEn: "€20",
    priceRo: "97 LEI",
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Foundation of daily discipline",
    highlightRo: "Fundamentul disciplinei zilnice",
    resultEn: "Daily discipline on autopilot and execution without waste; see weekly progress.",
    resultRo: "Disciplină zilnică pe pilot automat și execuție fără risipă; vezi progresul săptămânal.",
    benefitsEn: [
      "Daily execution plan – 15 minutes and you know what to do",
      "Profit focus: 1-3 actions with maximum ROI each day",
      "Progress journal and weekly reports",
      "Access to Stacks (Anger, Clarity, Focus) for quick reset",
      "Simple settings for daily and weekly rhythm",
    ],
    benefitsRo: [
      "Plan zilnic de execuție – 15 minute și știi ce ai de făcut",
      "Focus pe profit: 1-3 acțiuni cu ROI maxim în fiecare zi",
      "Jurnal de progres și rapoarte săptămânale",
      "Acces la Stacks (Furie, Claritate, Focus) pentru reset rapid",
      "Setări simple pentru ritm zilnic și săptămânal",
    ],
    ctaEn: "Choose Basic",
    ctaRo: "Alege Basic",
  },
  {
    id: "pro",
    nameEn: "Pro",
    nameRo: "Pro",
    priceEn: "€39",
    priceRo: "197 LEI",
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Accelerated growth & execution",
    highlightRo: "Creștere accelerată & execuție la sânge",
    resultEn: "Accelerated growth with 90-day Sprints and advanced AI coaching for offers and pricing.",
    resultRo: "Creștere accelerată cu Sprint de 90 de zile și coaching AI avansat pentru ofertă și preț.",
    benefitsEn: [
      "Everything in Basic + Hormozi-style AI Coaching for offers and pricing",
      "90-day Sprint with objectives and checkpoints",
      "Essential KPIs set and tracked automatically",
      "Templates, playbooks and implementation checklists",
      "Advanced prioritization for domino objectives",
    ],
    benefitsRo: [
      "Tot din Basic + Coaching AI tip Hormozi pentru ofertă și preț",
      "Sprint de 90 de zile cu obiective și checkpoint-uri",
      "KPI esențiali setați și urmăriți automat",
      "Template-uri, playbook-uri și checklists de implementare",
      "Prioritizare avansată pentru obiectivul domino",
    ],
    ctaEn: "Choose Pro",
    ctaRo: "Alege Pro",
    featured: true,
  },
  {
    id: "monthly",
    nameEn: "Monthly",
    nameRo: "Lunar",
    priceEn: "€20",
    priceRo: "97 LEI",
    priceValue: 9700,
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Maximum flexibility",
    highlightRo: "Flexibilitate maximă",
    resultEn: "Full platform access with flexible monthly payment.",
    resultRo: "Acces complet la platformă cu plată lunară flexibilă.",
    benefitsEn: [
      "All platform modules",
      "AI Coaching for goals",
      "Goal Wizard with milestones",
      "Champion Routine",
      "Weekly planning in Door",
    ],
    benefitsRo: [
      "Toate modulele platformei",
      "Coaching AI pentru obiective",
      "Goal Wizard cu milestone-uri",
      "Rutina Campionului",
      "Planificare săptămânală în Door",
    ],
    ctaEn: "Choose Monthly",
    ctaRo: "Alege Lunar",
  },
  {
    id: "annual",
    nameEn: "Annual",
    nameRo: "Anual",
    priceEn: "€199",
    priceRo: "997 LEI",
    priceValue: 99700,
    periodEn: "/ year",
    periodRo: "/ an",
    highlightEn: "-15% Discount",
    highlightRo: "-15% Discount",
    resultEn: "Save €41/year with full access to all features.",
    resultRo: "Economisești 167 LEI pe an cu acces complet la toate funcționalitățile.",
    benefitsEn: [
      "Everything in monthly plan",
      "Unlimited personalized AI meditations",
      "Data export and backup",
      "Priority support",
      "Access to all future updates",
    ],
    benefitsRo: [
      "Tot ce include planul lunar",
      "Meditații AI personalizate nelimitate",
      "Export și backup date",
      "Support prioritar",
      "Acces la toate update-urile viitoare",
    ],
    ctaEn: "Choose Annual",
    ctaRo: "Alege Anual",
    featured: true,
  },
  {
    id: "premium-coach",
    nameEn: "Premium + Coaching",
    nameRo: "Premium + Coaching",
    priceEn: "€39",
    priceRo: "197 LEI",
    priceValue: 19700,
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "With Alin Radu",
    highlightRo: "Cu Alin Radu",
    resultEn: "Weekly LIVE group coaching for maximum acceleration.",
    resultRo: "Coaching de grup săptămânal LIVE pentru accelerare maximă.",
    benefitsEn: [
      "Everything in annual plan",
      "Weekly LIVE group coaching with Alin Radu",
      "Exclusive Q&A sessions",
      "VIP community with premium members",
      "Exclusive coaching resources",
      "Priority access to new features",
    ],
    benefitsRo: [
      "Tot ce include planul anual",
      "Coaching de grup săptămânal LIVE cu Alin Radu",
      "Sesiuni Q&A exclusive",
      "Comunitate VIP cu membri premium",
      "Resurse exclusive de coaching",
      "Acces prioritar la funcționalități noi",
    ],
    ctaEn: "Choose Premium",
    ctaRo: "Alege Premium",
    featured: true,
    coachingIncluded: true,
  },
];

// Helper function to get localized plan data
export const getLocalizedPlan = (plan: Plan, language: 'en' | 'ro') => ({
  id: plan.id,
  name: language === 'en' ? plan.nameEn : plan.nameRo,
  price: language === 'en' ? plan.priceEn : plan.priceRo,
  priceValue: plan.priceValue,
  period: language === 'en' ? plan.periodEn : plan.periodRo,
  highlight: language === 'en' ? plan.highlightEn : plan.highlightRo,
  result: language === 'en' ? plan.resultEn : plan.resultRo,
  benefits: language === 'en' ? plan.benefitsEn : plan.benefitsRo,
  cta: language === 'en' ? plan.ctaEn : plan.ctaRo,
  featured: plan.featured,
  coachingIncluded: plan.coachingIncluded,
});
