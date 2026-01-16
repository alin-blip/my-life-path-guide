export type Plan = {
  id: "free" | "pro" | "elite";
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
    id: "pro",
    nameEn: "Pro",
    nameRo: "Pro",
    priceEn: "€49",
    priceRo: "249 LEI",
    priceValue: 4900,
    originalPriceEn: "€98",
    originalPriceRo: "490 LEI",
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Early Bird",
    highlightRo: "Early Bird",
    resultEn: "Full platform access with AI Coaching, Champion Routine, and 90-day Sprint system.",
    resultRo: "Acces complet la platformă cu AI Coaching, Champion Routine și sistem Sprint de 90 zile.",
    benefitsEn: [
      "Everything in Free plan",
      "Hormozi-style AI Coaching for offers & pricing",
      "Complete Champion Routine",
      "Door weekly planning system",
      "Stacks (Anger, Clarity, Focus) for quick reset",
      "Progress journal and weekly reports",
      "90-day Sprint with KPIs",
    ],
    benefitsRo: [
      "Tot ce include planul Gratuit",
      "AI Coaching tip Hormozi pentru ofertă și preț",
      "Champion Routine completă",
      "Sistem de planificare săptămânală Door",
      "Stacks (Furie, Claritate, Focus) pentru reset rapid",
      "Jurnal de progres și rapoarte săptămânale",
      "Sprint de 90 de zile cu KPIs",
    ],
    ctaEn: "Choose Pro",
    ctaRo: "Alege Pro",
    featured: true,
  },
  {
    id: "elite",
    nameEn: "Elite",
    nameRo: "Elite",
    priceEn: "€497",
    priceRo: "2497 LEI",
    priceValue: 49700,
    periodEn: "/ month",
    periodRo: "/ lună",
    highlightEn: "Complete Warrior",
    highlightRo: "Războinic Complet",
    resultEn: "Everything in Pro + Warrior Launch Accelerator + Live Group Coaching with Alin Radu.",
    resultRo: "Tot din Pro + Warrior Launch Accelerator + Coaching de Grup LIVE cu Alin Radu.",
    benefitsEn: [
      "Everything in Pro plan",
      "Warrior Launch Accelerator included (€970 value)",
      "Weekly LIVE group coaching with Alin Radu",
      "VIP community with Elite members",
      "Exclusive Q&A sessions",
      "Priority access to new features",
      "VIP dedicated support",
    ],
    benefitsRo: [
      "Tot ce include planul Pro",
      "Warrior Launch Accelerator inclus (valoare €970)",
      "Coaching de grup săptămânal LIVE cu Alin Radu",
      "Comunitate VIP cu membri Elite",
      "Sesiuni Q&A exclusive",
      "Acces prioritar la funcționalități noi",
      "Support VIP dedicat",
    ],
    ctaEn: "Choose Elite",
    ctaRo: "Alege Elite",
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
  originalPrice: language === 'en' ? plan.originalPriceEn : plan.originalPriceRo,
  period: language === 'en' ? plan.periodEn : plan.periodRo,
  highlight: language === 'en' ? plan.highlightEn : plan.highlightRo,
  result: language === 'en' ? plan.resultEn : plan.resultRo,
  benefits: language === 'en' ? plan.benefitsEn : plan.benefitsRo,
  cta: language === 'en' ? plan.ctaEn : plan.ctaRo,
  featured: plan.featured,
  coachingIncluded: plan.coachingIncluded,
});
