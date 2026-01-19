export type Plan = {
  id: "free" | "basic" | "pro";
  nameEn: string;
  nameRo: string;
  priceEn: string;
  priceRo: string;
  priceValue?: number;
  originalPriceEn?: string;
  originalPriceRo?: string;
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
  valueEn?: string;
  valueRo?: string;
  trialDays?: number;
};

export const plans: Plan[] = [
  {
    id: "free",
    nameEn: "Free",
    nameRo: "Gratuit",
    priceEn: "€0",
    priceRo: "0 LEI",
    periodEn: "3 days",
    periodRo: "3 zile",
    highlightEn: "Start Your Journey",
    highlightRo: "Începe Călătoria",
    resultEn: "Test the WarriorOS system: build habits and complete your first challenge.",
    resultRo: "Testează sistemul WarriorOS: construiește obiceiuri și completează primul challenge.",
    benefitsEn: [
      "Habit Tracking for daily discipline",
      "Access to transformation Challenges",
      "Discover WarriorOS potential",
      "Upgrade option anytime",
    ],
    benefitsRo: [
      "Habit Tracking pentru disciplină zilnică",
      "Acces la Challenge-uri de transformare",
      "Descoperă potențialul WarriorOS",
      "Opțiune de upgrade oricând",
    ],
    ctaEn: "Start Free",
    ctaRo: "Începe Gratuit",
  },
  {
    id: "basic",
    nameEn: "Basic",
    nameRo: "Basic",
    priceEn: "€49",
    priceRo: "249 LEI",
    priceValue: 4900,
    originalPriceEn: "€98",
    originalPriceRo: "490 LEI",
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Early Bird",
    highlightRo: "Early Bird",
    valueEn: "€98 value",
    valueRo: "Valoare €98",
    resultEn: "Full platform access with AI Coaching, Champion Routine, and Door planning system.",
    resultRo: "Acces complet la platformă cu AI Coaching, Champion Routine și sistem Door.",
    benefitsEn: [
      "Everything in Free plan",
      "AI Coaching for offers & pricing",
      "Complete Champion Routine",
      "Door weekly planning system",
      "Stacks (Anger, Clarity, Focus) for quick reset",
      "Progress journal and weekly reports",
    ],
    benefitsRo: [
      "Tot ce include planul Gratuit",
      "AI Coaching pentru ofertă și preț",
      "Champion Routine completă",
      "Sistem de planificare săptămânală Door",
      "Stacks (Furie, Claritate, Focus) pentru reset rapid",
      "Jurnal de progres și rapoarte săptămânale",
    ],
    ctaEn: "Choose Basic",
    ctaRo: "Alege Basic",
  },
  {
    id: "pro",
    nameEn: "Pro",
    nameRo: "Pro",
    priceEn: "€97",
    priceRo: "490 LEI",
    priceValue: 9700,
    originalPriceEn: "€197",
    originalPriceRo: "990 LEI",
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "7-Day Free Trial",
    highlightRo: "7 Zile Trial Gratuit",
    valueEn: "€197 value",
    valueRo: "Valoare €197",
    trialDays: 7,
    resultEn: "Everything in Basic + Weekly LIVE Group Coaching with Alin Radu + VIP Pro Community.",
    resultRo: "Tot din Basic + Coaching de Grup LIVE Săptămânal cu Alin Radu + Comunitate VIP Pro.",
    benefitsEn: [
      "Everything in Basic plan",
      "Weekly LIVE group coaching with Alin Radu",
      "VIP community with Pro members",
      "Exclusive Q&A sessions",
      "90-day Sprint with KPIs",
      "Priority access to new features",
      "VIP dedicated support",
    ],
    benefitsRo: [
      "Tot ce include planul Basic",
      "Coaching de grup săptămânal LIVE cu Alin Radu",
      "Comunitate VIP cu membri Pro",
      "Sesiuni Q&A exclusive",
      "Sprint de 90 de zile cu KPIs",
      "Acces prioritar la funcționalități noi",
      "Support VIP dedicat",
    ],
    ctaEn: "Start 7-Day Trial",
    ctaRo: "Începe Trial 7 Zile",
    featured: true,
    coachingIncluded: true,
  },
];

// Warrior Accelerator - standalone upsell product
export const warriorAccelerator = {
  id: "warrior-accelerator",
  nameEn: "Warrior Launch Accelerator",
  nameRo: "Warrior Launch Accelerator",
  priceEn: "€497",
  priceRo: "2490 LEI",
  priceValue: 49700,
  originalPriceEn: "€970",
  originalPriceRo: "4850 LEI",
  isOneTime: true,
  descriptionEn: "47+ premium video lessons + complete 90-day transformation framework",
  descriptionRo: "47+ lecții video premium + framework complet de transformare în 90 de zile",
  benefitsEn: [
    "47+ premium video lessons",
    "8 complete learning modules",
    "90-day implementation framework",
    "Lifetime access to all updates",
    "90-day satisfaction guarantee",
  ],
  benefitsRo: [
    "47+ lecții video premium",
    "8 module complete de învățare",
    "Framework de implementare pe 90 de zile",
    "Acces pe viață la toate update-urile",
    "Garanție 90 de zile satisfacție",
  ],
};

// Helper function to get localized plan data
export const getLocalizedPlan = (plan: Plan, language: 'en' | 'ro') => ({
  id: plan.id,
  name: language === 'en' ? plan.nameEn : plan.nameRo,
  price: language === 'en' ? plan.priceEn : plan.priceRo,
  priceValue: plan.priceValue,
  originalPrice: language === 'en' ? plan.originalPriceEn : plan.originalPriceRo,
  period: language === 'en' ? plan.periodEn : plan.periodRo,
  highlight: language === 'en' ? plan.highlightEn : plan.highlightRo,
  result: language === 'en' ? plan.resultEn : plan.resultRo,
  benefits: language === 'en' ? plan.benefitsEn : plan.benefitsRo,
  cta: language === 'en' ? plan.ctaEn : plan.ctaRo,
  featured: plan.featured,
  coachingIncluded: plan.coachingIncluded,
  value: language === 'en' ? plan.valueEn : plan.valueRo,
  trialDays: plan.trialDays,
});
