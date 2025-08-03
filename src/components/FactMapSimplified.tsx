import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MissionCategory } from '@/types/mission';
import { ArrowRight, CheckCircle, PlusCircle, Play } from 'lucide-react';
import { Save, Edit } from 'lucide-react';
import { getFactMaps } from '@/services/factMapService';
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface FactMapProps {
  category: MissionCategory;
}

type FactMapStatus = {
  foundation: {
    exists: boolean;
    completed: boolean;
    questions?: string[];
  };
  monthly: {
    exists: boolean;
    completed: boolean;
  };
  impossible: {
    exists: boolean;
    completed: boolean;
  };
};

const bodyFactQuestions = [
  "What are the FACTS about your fat, muscle, body image, height, and weight?",
  "What are the FACTS about your gut, colon, hearing, eyesight, spine, brain function, injuries, and disease?",
  "What are the FACTS about your inner organ function, annual physicals, chiropractor, dentist, and sleep patterns?",
  "What are the FACTS about your current workout routine, strength, mobility, flexibility, and cardio?",
  "What are the FACTS about your food consumption as well as your use of alcohol, caffeine, greens, and daily supplements?",
  "What are the FACTS about your energy, sex drive, physical hobbies, and overall sense that your body is a weapon?"
];

const fourWorking = [
  "As of today, what are the TOP FOUR THINGS that ARE WORKING in this domain and why?"
];
const fourNotWorking = [
  "As of today, what are the TOP FOUR THINGS that are NOT WORKING in this domain and why?"
];
const fourAdjustments = [
  "As of today, what are the top FOUR KEY ADJUSTMENTS you know you need to make heading into the next quarter and why?"
];
const fourMissions = [
  "As of today, what are the Potential FOUR CRITICAL MISSIONS you could select this upcoming quarter and why?"
];

const initialBodyAnswers = () => ({
  ...Object.fromEntries(bodyFactQuestions.map((q, i) => [`fact${i+1}`, ""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`working${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`notworking${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`adjustment${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`mission${i+1}`,""])),
});

const beingFactQuestionsEn = [
  "What are the FACTS about God, Religion, Scripture, and Purpose of life to you?",
  "What are the FACTS about journaling, reading scripture, Stacking, and showing up vulnerable & authentic?",
  "What are the FACTS about prayer, meditation, personal development, and the energy you invest in understanding you?",
  "What are the FACTS about you living your purpose, your spiritual leadership, listening to GOD & demonstrating spiritual leadership?",
];

const beingFactQuestionsRo = [
  "Care sunt FAPTELE despre Dumnezeu, religie, Scriptură și scopul vieții pentru tine?",
  "Care sunt FAPTELE despre jurnalizare, citirea Scripturii, Stacking și deschiderea vulnerabilă & autentică?",
  "Care sunt FAPTELE despre rugăciune, meditație, dezvoltare personală și energia pe care o investești în a te înțelege pe tine?",
  "Care sunt FAPTELE despre cum îți trăiești scopul, conducerea ta spirituală, ascultarea de DUMNEZEU & leadership-ul spiritual demonstrat?",
];

const fourBeingWorking = [
  "As of today, what are the TOP FOUR THINGS that ARE WORKING in this domain and why?",
];
const fourBeingWorkingRo = [
  "Care sunt ASTĂZI CELE 4 LUCRURI CARE MERG în acest domeniu și de ce?",
];

const fourBeingNotWorking = [
  "As of today, what are the TOP FOUR THINGS that are NOT WORKING in this domain and why?",
];
const fourBeingNotWorkingRo = [
  "Care sunt ASTĂZI CELE 4 LUCRURI CARE NU MERG în acest domeniu și de ce?",
];

const fourBeingAdjustments = [
  "As of today, what are the TOP FOUR KEY ADJUSTMENTS you know you need to make heading into the next 12-18 months and why?",
];
const fourBeingAdjustmentsRo = [
  "Care sunt ASTĂZI CELE 4 AJUSTĂRI CHEIE pe care știi că trebuie să le faci în următoarele 12-18 luni și de ce?",
];

const fourBeingMissions = [
  "As of today, what are the Potential FOUR CRITICAL MISSIONS you could select this upcoming quarter and why?",
];
const fourBeingMissionsRo = [
  "Care sunt ASTĂZI POSIBILELE 4 MISIUNI CRITICE pe care le-ai putea alege în acest trimestru și de ce?",
];

const initialBeingAnswers = () => ({
  ...Object.fromEntries(beingFactQuestionsEn.map((_, i) => [`fact${i+1}`, ""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`working${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`notworking${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`adjustment${i+1}`,""])),
  ...Object.fromEntries([...Array(4)].map((_,i) => [`mission${i+1}`,""])),
});

const PERIOD_OPTIONS = [
  { value: "6_months", label: { en: "6 Months", ro: "6 luni" }},
  { value: "12_months", label: { en: "1 Year", ro: "1 an" }},
  { value: "18_months", label: { en: "18 Months", ro: "18 luni" }},
  { value: "24_months", label: { en: "2 Years", ro: "2 ani" }},
];

const getAnnualGoalLocalStorageKeys = (category: string) => ({
  answers: `annualGoal${category[0].toUpperCase() + category.slice(1)}Answers`,
  created: `annualGoal${category[0].toUpperCase() + category.slice(1)}CreatedAt`,
  updated: `annualGoal${category[0].toUpperCase() + category.slice(1)}UpdatedAt`,
  period: `annualGoal${category[0].toUpperCase() + category.slice(1)}Period`,
});

const generateAnnualGoalQuestions = (category: string) => {
  // Replace "BODY" with the relevant category in the questions
  // The questions array structure is the same, just dynamic label substitution
  const label = category.toUpperCase();
  const categoryLabel = {
    body: { en: "BODY", ro: "CORP" },
    being: { en: "BEING", ro: "FIINȚĂ" },
    balance: { en: "BALANCE", ro: "ECHILIBRU" },
    business: { en: "BUSINESS", ro: "AFACERE" },
  }[category] || { en: category.toUpperCase(), ro: category.toUpperCase() };

  return [
    {
      section: 'headline',
      label: {
        en: `If everything went ideally for you in one year, what would you want to have achieved (headline)?`,
        ro: `Dacă totul ar ieși ideal pentru tine într-un an de zile ce îți dorești să fi realizat (head-line)`
      },
      placeholder: ""
    },
    {
      section: "round1",
      label: {
        en: `ROUND #1 QUESTIONS…\nWhat are your measurable Impossible Freedom Targets in ${categoryLabel.en}?`,
        ro: `ROUND #1 ÎNTREBĂRI…\nCare sunt obiectivele tale imposibile și măsurabile pentru libertate în ${categoryLabel.ro}?`
      },
      placeholder: "",
      subquestions: [
        { label: {en: "Impossible Fruit #1:", ro: "Fruct Imposibil #1:"}, key: "impossibleFruit1" },
        { label: {en: "Impossible Fruit #2:", ro: "Fruct Imposibil #2:"}, key: "impossibleFruit2" },
        { label: {en: "Impossible Fruit #3:", ro: "Fruct Imposibil #3:"}, key: "impossibleFruit3" },
        { label: {en: "Impossible Fruit #4:", ro: "Fruct Imposibil #4:"}, key: "impossibleFruit4" },
        { label: {en: "Other", ro: "Altele"}, key: "impossibleFruitOther" }
      ]
    },
    {
      section: "round1",
      label: {
        en: `What do you believe you must STOP DOING in ${categoryLabel.en} moving forward and why?`,
        ro: `Ce crezi că trebuie să OPREȘTI să faci în ${categoryLabel.ro} și de ce?`
      },
      key: "stopDoing",
      placeholder: ""
    },
    {
      section: "round1",
      label: {
        en: `What do you believe you must SUSTAIN DOING in ${categoryLabel.en} moving forward and why?`,
        ro: `Ce crezi că trebuie să CONTINUI să faci în ${categoryLabel.ro} și de ce?`
      },
      key: "sustainDoing",
      placeholder: ""
    },
    {
      section: "round1",
      label: {
        en: `What do you believe you must START DOING in ${categoryLabel.en} moving forward and why?`,
        ro: `Ce crezi că trebuie să ÎNCEPI să faci în ${categoryLabel.ro} și de ce?`
      },
      key: "startDoing",
      placeholder: ""
    },
    {
      section: "round2",
      label: {
        en: `ROUND #2 QUESTIONS…\nNow with the answers to the first round, it is time to go deeper and get even more specific about the GAP and the FRAME that sits between you and the measurable Impossible Freedom you are committed to hunting down In ${categoryLabel.en}.`,
        ro: `ROUND #2 ÎNTREBĂRI…\nAcum, cu răspunsurile la primul set, e timpul să mergem mai profund, să lămurim decalajul și cadrul ce stau între tine și libertatea imposibilă pe care ți-ai propus să o obții în ${categoryLabel.ro}.`
      },
      placeholder: ""
    },
    {
      section: "round2",
      label: {
        en: `What are the OBSTACLES you can see already in the way of obtaining your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Care sunt OBSTACOLELE pe care le vezi deja în calea obținerii libertății imposibile în ${categoryLabel.ro}?`
      },
      key: "obstacles",
      placeholder: ""
    },
    {
      section: "round2",
      label: {
        en: `What OPPORTUNITIES can you see before you that you must capitalize on to obtain your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Ce OPORTUNITĂȚI vezi deja și pe care trebuie să le valorifici pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "opportunities",
      placeholder: ""
    },
    {
      section: "round2",
      label: {
        en: `What TALENTS, ABILITIES, and STRENGTHS can you count on to obtain your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Ce TALENTE, ABILITĂȚI și PUNCTE FORTE poți folosi pentru a obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "talents",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `ROUND #3 QUESTIONS…\nThere are specific strategies to unlocking the power of the GAP and getting clear on who you will have to become to reveal Impossible Freedom.`,
        ro: `ROUND #3 ÎNTREBĂRI…\nExistă strategii specifice pentru a depăși decalajul și a clarifica cine trebuie să devii pentru a-ți atinge libertatea imposibilă.`
      },
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What MINDSETS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Ce MENTALITĂȚI ai deja și la care trebuie să ai acces pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "currentMindsets",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What MINDSETS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel.en}?`,
        ro: `Ce MENTALITĂȚI trebuie să dobândești pentru a putea obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "requiredMindsets",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What SKILLS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Ce ABILITĂȚI ai și trebuie să poți folosi pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "currentSkills",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What SKILLS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel.en}?`,
        ro: `Ce ABILITĂȚI trebuie să dobândești pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "requiredSkills",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What RESOURCES/RELATIONSHIPS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel.en}?`,
        ro: `Ce RESURSE/RELATII ai deja și trebuie să le folosești pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "currentResources",
      placeholder: ""
    },
    {
      section: "round3",
      label: {
        en: `What RESOURCES/RELATIONSHIPS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel.en}?`,
        ro: `Ce RESURSE/RELATII trebuie să dobândești pentru a-ți obține libertatea imposibilă în ${categoryLabel.ro}?`
      },
      key: "requiredResources",
      placeholder: ""
    },
    {
      section: "revelation",
      label: {
        en: "REVELATION\nWhat are your FINAL THOUGHTS, INSIGHTS, or REVELATIONS as you complete this " + categoryLabel.en + " domain ANNUAL GOAL?",
        ro: "REVELAȚIE\nCare sunt GÂNDURILE FINALE, IDEILE sau REVELAȚIILE tale după completarea acestei hărți ANUALE pentru " + categoryLabel.ro + "?"
      },
      key: "finalThoughts",
      placeholder: ""
    },
    {
      section: "lessons",
      label: {
        en: "LESSONS\nWhat are the primary LESSONS on life you uncovered by completing this " + categoryLabel.en + " ANNUAL GOAL?",
        ro: "LECȚII\nCare sunt principalele LECȚII de viață pe care le-ai descoperit după finalizarea obiectivului anual pentru " + categoryLabel.ro + "?"
      },
      key: "primaryLessons",
      placeholder: ""
    },
    {
      section: "missionName",
      label: { en: "MISSION NAME", ro: "NUME MISIUNE" },
      key: "missionName",
      placeholder: ""
    },
    {
      section: "missionParts",
      label: { en: "FINAL MISSION PART #1", ro: "PARTEA FINALĂ A MISIUNII #1" },
      key: "missionPart1",
      placeholder: ""
    },
    { section: "missionParts", label: { en: "FINAL MISSION PART #2", ro: "PARTEA FINALĂ A MISIUNII #2" }, key: "missionPart2", placeholder: "" },
    { section: "missionParts", label: { en: "FINAL MISSION PART #3", ro: "PARTEA FINALĂ A MISIUNII #3" }, key: "missionPart3", placeholder: "" },
    { section: "missionParts", label: { en: "FINAL MISSION PART #4", ro: "PARTEA FINALĂ A MISIUNII #4" }, key: "missionPart4", placeholder: "" },
    {
      section: "mainResult",
      label: {
        en: "What is the one main measurable result that you will be tracking with this Mission?",
        ro: "Care este rezultatul principal măsurabil pe care îl vei urmări cu această Misiune?"
      },
      key: "mainResult",
      placeholder: ""
    },
    {
      section: "endGoalValue",
      label: {
        en: "What is the end goal for value?",
        ro: "Care este obiectivul final ca valoare?"
      },
      key: "endGoalValue",
      placeholder: ""
    }
  ];
};

const annualGoalQuestions = [
  {
    section: 'headline',
    label: "Daca totul ar iesi ideal pentru tine intr-un an de zile ce iti doresti sa fi realizat ( head-line )",
    placeholder: "Scrie răspunsul aici..."
  },
  {
    section: "round1",
    label: "ROUND #1 QUESTIONS…\nWhat are your measurable Impossible Freedom Targets in BODY?",
    placeholder: "",
    subquestions: [
      { label: "Impossible Fruit #1:", key: "impossibleFruit1" },
      { label: "Impossible Fruit #2:", key: "impossibleFruit2" },
      { label: "Impossible Fruit #3:", key: "impossibleFruit3" },
      { label: "Impossible Fruit #4:", key: "impossibleFruit4" },
      { label: "Other", key: "impossibleFruitOther" }
    ]
  },
  {
    section: "round1",
    label: "What do you believe you must STOP DOING in BODY moving forward and why?",
    key: "stopDoing",
    placeholder: ""
  },
  {
    section: "round1",
    label: "What do you believe you must SUSTAIN DOING in BODY moving forward and why?",
    key: "sustainDoing",
    placeholder: ""
  },
  {
    section: "round1",
    label: "What do you believe you must START DOING in BODY moving forward and why?",
    key: "startDoing",
    placeholder: ""
  },
  {
    section: "round2",
    label: "ROUND #2 QUESTIONS…\nNow with the answers to the first round, it is time to go deeper and get even more specific about the GAP and the FRAME that sits between you and the measurable Impossible Freedom you are committed to hunting down In BODY.",
    placeholder: ""
  },
  {
    section: "round2",
    label: "What are the OBSTACLES you can see already in the way of obtaining your Impossible Freedom in BODY?",
    key: "obstacles",
    placeholder: ""
  },
  {
    section: "round2",
    label: "What OPPORTUNITIES can you see before you that you must capitalize on to obtain your Impossible Freedom in BODY?",
    key: "opportunities",
    placeholder: ""
  },
  {
    section: "round2",
    label: "What TALENTS, ABILITIES, and STRENGTHS can you count on to obtain your Impossible Freedom in BODY?",
    key: "talents",
    placeholder: ""
  },
  {
    section: "round3",
    label: "ROUND #3 QUESTIONS…\nThere are specific strategies to unlocking the power of the GAP and getting clear on who you will have to become to reveal Impossible Freedom.",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What MINDSETS do you currently have that will need to be accessed to obtain your Impossible Freedom in BODY?",
    key: "currentMindsets",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What MINDSETS must you acquire to ensure you can obtain your impossible Freedom In BODY?",
    key: "requiredMindsets",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What SKILLS do you currently have that will need to be accessed to obtain your Impossible Freedom in BODY?",
    key: "currentSkills",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What SKILLS must you acquire to ensure you can obtain your impossible Freedom In BODY?",
    key: "requiredSkills",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What RESOURCES/RELATIONSHIPS do you currently have that will need to be accessed to obtain your Impossible Freedom in BODY?",
    key: "currentResources",
    placeholder: ""
  },
  {
    section: "round3",
    label: "What RESOURCES/RELATIONSHIPS must you acquire to ensure you can obtain your impossible Freedom In BODY?",
    key: "requiredResources",
    placeholder: ""
  },
  {
    section: "revelation",
    label: "REVELATION\nWhat are your FINAL THOUGHTS, INSIGHTS, or REVELATIONS as you complete this BODY domain MONTHLY MISSION MAP?",
    key: "finalThoughts",
    placeholder: ""
  },
  {
    section: "lessons",
    label: "LESSONS\nWhat are the primary LESSONS on life you uncovered by completing this BODY MONTHLY MISSION MAP?",
    key: "primaryLessons",
    placeholder: ""
  },
  {
    section: "missionName",
    label: "MISSION NAME",
    key: "missionName",
    placeholder: ""
  },
  {
    section: "missionParts",
    label: "FINAL MISSION PART #1",
    key: "missionPart1",
    placeholder: ""
  },
  { section: "missionParts", label: "FINAL MISSION PART #2", key: "missionPart2", placeholder: "" },
  { section: "missionParts", label: "FINAL MISSION PART #3", key: "missionPart3", placeholder: "" },
  { section: "missionParts", label: "FINAL MISSION PART #4", key: "missionPart4", placeholder: "" },
  {
    section: "mainResult",
    label: "What is the one main measurable result that you will be tracking with this Mission?",
    key: "mainResult",
    placeholder: ""
  },
  {
    section: "endGoalValue",
    label: "What is the end goal for value?",
    key: "endGoalValue",
    placeholder: ""
  }
];

const ANNUAL_GOAL_KEY_BODY = "annualGoalBodyAnswers";
const ANNUAL_GOAL_BODY_CREATED = "annualGoalBodyCreatedAt";
const ANNUAL_GOAL_BODY_UPDATED = "annualGoalBodyUpdatedAt";

export const FactMapSimplified: React.FC<FactMapProps> = ({ category }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [mapStatus, setMapStatus] = useState<FactMapStatus>({
    foundation: { exists: false, completed: false, questions: [] },
    monthly: { exists: false, completed: false },
    impossible: { exists: false, completed: false }
  });

  const [foundationQuestions, setFoundationQuestions] = useState<string[]>([]);

  const bodyRealityQuestions = [
    'Cum ți-ai descrie nivelul actual de fitness?',
    'Care sunt provocările tale fizice actuale?',
    'Ce activități fizice practici în prezent?',
    'Cum ți-ai descrie obiceiurile alimentare actuale?',
    'Cum este calitatea și rutina somnului tău?',
    'Care este nivelul tău de energie pe parcursul zilei?',
    'Ce a funcționat bine pentru sănătatea ta fizică?',
    'Ce nu a funcționat pentru sănătatea ta fizică?',
    'Ce ajustări ai putea face pentru a-ți îmbunătăți sănătatea fizică?',
    'Ce misiuni sau obiective ai dori să realizezi?'
  ];

  const [bodyRealityAnswer, setBodyRealityAnswer] = useState<string>("");
  const [bodyRealityEditing, setBodyRealityEditing] = useState(false);
  const [bodyRealitySavedAt, setBodyRealitySavedAt] = useState<string | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [bodyAnswers, setBodyAnswers] = useState<Record<string, string>>(initialBodyAnswers());
  const [bodyEditing, setBodyEditing] = useState(false);
  const [bodyCreatedAt, setBodyCreatedAt] = useState<string | null>(null);
  const [bodyUpdatedAt, setBodyUpdatedAt] = useState<string | null>(null);
  const [foundationId, setFoundationId] = useState<string | null>(null);

  const bodyFactQuestionsEn = [
    "What are the FACTS about your fat, muscle, body image, height, and weight?",
    "What are the FACTS about your gut, colon, hearing, eyesight, spine, brain function, injuries, and disease?",
    "What are the FACTS about your inner organ function, annual physicals, chiropractor, dentist, and sleep patterns?",
    "What are the FACTS about your current workout routine, strength, mobility, flexibility, and cardio?",
    "What are the FACTS about your food consumption as well as your use of alcohol, caffeine, greens, and daily supplements?",
    "What are the FACTS about your energy, sex drive, physical hobbies, and overall sense that your body is a weapon?"
  ];
  const bodyFactQuestionsRo = [
    "Care sunt FAPTELE despre grăsime, mușchi, imaginea corpului, ��nălțime și greutate?",
    "Care sunt FAPTELE despre sistemul digestiv, colon, auz, vedere, coloană, funcția creierului, leziuni și boli?",
    "Care sunt FAPTELE despre funcția organelor interne, analizele anuale, chiropractician, dentist și obiceiurile de somn?",
    "Care sunt FAPTELE despre rutina ta actuală de antrenament, forță, mobilitate, flexibilitate și cardio?",
    "Care sunt FAPTELE despre consumul de alimente și utilizarea de alcool, cofeină, verdețuri și suplimente zilnice?",
    "Care sunt FAPTELE despre energie, libidou, hobby-uri fizice și sentimentul general că trupul tău este o armă?"
  ];
  const localizedBodyFactQuestions = language === "ro" ? bodyFactQuestionsRo : bodyFactQuestionsEn;

  const [beingAnswers, setBeingAnswers] = useState<Record<string, string>>(initialBeingAnswers());
  const [beingEditing, setBeingEditing] = useState(false);
  const [beingCreatedAt, setBeingCreatedAt] = useState<string | null>(null);
  const [beingUpdatedAt, setBeingUpdatedAt] = useState<string | null>(null);

  // --------- ANNUAL GOAL LOGIC (shared for all categories) ----------
  const annualGoalKeys = getAnnualGoalLocalStorageKeys(category);
  const [annualGoalData, setAnnualGoalData] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(annualGoalKeys.answers) || '{}');
    } catch {
      return {};
    }
  });
  const [annualGoalCreatedAt, setAnnualGoalCreatedAt] = useState<string | null>(() =>
    localStorage.getItem(annualGoalKeys.created)
  );
  const [annualGoalUpdatedAt, setAnnualGoalUpdatedAt] = useState<string | null>(() =>
    localStorage.getItem(annualGoalKeys.updated)
  );
  const [annualGoalPeriod, setAnnualGoalPeriod] = useState<string>(
    () => localStorage.getItem(annualGoalKeys.period) || "12_months"
  );

  const [showAnnualGoalDialog, setShowAnnualGoalDialog] = useState(false);

  const annualGoalQuestionsForCategory = generateAnnualGoalQuestions(category);

  const saveAnnualGoalData = (data: any, selectedPeriod?: string) => {
    const now = new Date().toLocaleString();
    let createdAt = annualGoalCreatedAt;
    let updatedAt = now;
    if (!createdAt) {
      createdAt = now;
      setAnnualGoalCreatedAt(createdAt);
      localStorage.setItem(annualGoalKeys.created, createdAt);
    }
    setAnnualGoalData(data);
    setAnnualGoalUpdatedAt(updatedAt);
    localStorage.setItem(annualGoalKeys.answers, JSON.stringify(data));
    localStorage.setItem(annualGoalKeys.updated, updatedAt);
    if (selectedPeriod) {
      setAnnualGoalPeriod(selectedPeriod);
      localStorage.setItem(annualGoalKeys.period, selectedPeriod);
    }
  };

  const [showAnnualGoalBodyDialog, setShowAnnualGoalBodyDialog] = useState(false);
  const [annualGoalBody, setAnnualGoalBody] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ANNUAL_GOAL_KEY_BODY) || '{}');
    } catch {
      return {};
    }
  });
  const [annualGoalBodyCreatedAt, setAnnualGoalBodyCreatedAt] = useState<string | null>(() => {
    return localStorage.getItem(ANNUAL_GOAL_BODY_CREATED);
  });
  const [annualGoalBodyUpdatedAt, setAnnualGoalBodyUpdatedAt] = useState<string | null>(() => {
    return localStorage.getItem(ANNUAL_GOAL_BODY_UPDATED);
  });

  const saveAnnualGoalBody = (data) => {
    const now = new Date().toLocaleString();
    let createdAt = annualGoalBodyCreatedAt;
    let updatedAt = now;
    if (!createdAt) {
      createdAt = now;
      setAnnualGoalBodyCreatedAt(createdAt);
      localStorage.setItem(ANNUAL_GOAL_BODY_CREATED, createdAt);
    }
    setAnnualGoalBody(data);
    setAnnualGoalBodyUpdatedAt(updatedAt);
    localStorage.setItem(ANNUAL_GOAL_KEY_BODY, JSON.stringify(data));
    localStorage.setItem(ANNUAL_GOAL_BODY_UPDATED, updatedAt);
  };

  useEffect(() => {
    const loadMaps = async () => {
      try {
        const factMaps = await getFactMaps();
        const monthlyMissionsString = localStorage.getItem('monthlyMissions') || '[]';
        let monthlyMissions = [];
        try {
          monthlyMissions = JSON.parse(monthlyMissionsString);
          if (!Array.isArray(monthlyMissions)) {
            monthlyMissions = [];
          }
        } catch (e) {
          console.error('Error parsing monthlyMissions from localStorage:', e);
          monthlyMissions = [];
        }
        
        let questions: string[] = [];

        const foundationMap = factMaps.find((map: any) => 
          map.category === 'foundation' && 
          map.items.some((item: any) => item.name.toLowerCase() === category)
        );

        if (foundationMap) {
          const foundationItem = foundationMap.items.find(
            (item: any) => item.name.toLowerCase() === category
          );

          if (category === 'body' && foundationItem?.answers) {
            questions = Object.keys(foundationItem.answers);
          }

          setMapStatus(prev => ({
            ...prev,
            foundation: {
              exists: true,
              completed: foundationItem?.status === 'completed',
              questions
            }
          }));
          if (questions.length > 0) setFoundationQuestions(questions);
        } else {
          setMapStatus(prev => ({
            ...prev,
            foundation: { exists: false, completed: false, questions: [] }
          }));
          setFoundationQuestions([]);
        }

        const monthlyMission = monthlyMissions.find(
          (mission: any) => mission.category === category && !mission.isImpossibleGame
        );
        
        if (monthlyMission) {
          setMapStatus(prev => ({
            ...prev,
            monthly: {
              exists: true,
              completed: true
            }
          }));
        }
        
        const impossibleMission = monthlyMissions.find(
          (mission: any) => mission.category === category && mission.isImpossibleGame === true
        );
        
        if (impossibleMission) {
          setMapStatus(prev => ({
            ...prev,
            impossible: {
              exists: true,
              completed: true
            }
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadMaps();
  }, [category]);

  useEffect(() => {
    const loadFoundationMap = async () => {
      if (category !== "body") return;

      // TODO: Implement proper database loading with authentication
      // For now, using local storage until authentication is implemented
      const savedMaps = localStorage.getItem('factMaps');
      const data = savedMaps ? JSON.parse(savedMaps).filter((m: any) => m.category === 'foundation') : [];
      
      if (!data || data.length === 0) return;

      const foundation = data.find((m: any) => {
        if (!m.items) return false;
        
        let itemsArray;
        if (typeof m.items === 'string') {
          try {
            itemsArray = JSON.parse(m.items);
          } catch (e) {
            console.error('Error parsing items as JSON:', e);
            return false;
          }
        } else if (Array.isArray(m.items)) {
          itemsArray = m.items;
        } else {
          console.warn('Items is not an array:', typeof m.items);
          return false;
        }
        
        return Array.isArray(itemsArray) && 
               itemsArray.some((item: any) => item.name?.toLowerCase() === "body");
      });
      
      if (foundation) {
        setFoundationId(foundation.id);
        
        let items = foundation.items;
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error('Failed to parse items string:', e);
            return;
          }
        }
        
        if (!Array.isArray(items)) {
          console.error('Items is not an array:', items);
          return;
        }
        
        const bodyItem = items.find(
          (item: any) => item.name?.toLowerCase() === "body"
        );
        
        if (bodyItem && typeof bodyItem === 'object' && bodyItem !== null) {
          if ('answers' in bodyItem && bodyItem.answers) {
            setBodyAnswers(bodyItem.answers as Record<string, string>);
          }
          
          if (foundation.created_at) setBodyCreatedAt(new Date(foundation.created_at).toLocaleString());
          if (foundation.updated_at) setBodyUpdatedAt(new Date(foundation.updated_at).toLocaleString());
        }
      }
    };
    loadFoundationMap();
  }, [category]);

  useEffect(() => {
    if (category === "body") {
      const saved = localStorage.getItem("bodyFactAnswers");
      const created = localStorage.getItem("bodyFactCreatedAt");
      const updated = localStorage.getItem("bodyFactUpdatedAt");
      if (saved) setBodyAnswers(JSON.parse(saved));
      if (created) setBodyCreatedAt(created);
      if (updated) setBodyUpdatedAt(updated);
    }
  }, [category]);

  useEffect(() => {
    if (category === "being") {
      const saved = localStorage.getItem("beingFactAnswers");
      const created = localStorage.getItem("beingFactCreatedAt");
      const updated = localStorage.getItem("beingFactUpdatedAt");
      if (saved) setBeingAnswers(JSON.parse(saved));
      if (created) setBeingCreatedAt(created);
      if (updated) setBeingUpdatedAt(updated);
    }
  }, [category]);

  const handleBodyAnswerChange = (key: string, value: string) => {
    setBodyAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveBodyFacts = async () => {
    const now = new Date().toISOString();
    let createdId = foundationId;

    let resultItems = [{
      name: "body",
      answers: bodyAnswers,
    }];

    if (!foundationId) {
      // TODO: Implement proper database insertion with authentication
      // For now, using local storage until authentication is implemented
      const newFoundation = {
        id: crypto.randomUUID(),
        category: 'foundation',
        title: language === 'en' ? 'Body Foundation' : 'Baza Corpului',
        items: resultItems,
        user_id: 'temp-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const existingMaps = JSON.parse(localStorage.getItem('factMaps') || '[]');
      localStorage.setItem('factMaps', JSON.stringify([...existingMaps, newFoundation]));
      
      setFoundationId(newFoundation.id);
      setBodyCreatedAt(new Date(newFoundation.created_at).toLocaleString());
      setBodyUpdatedAt(new Date(newFoundation.updated_at).toLocaleString());
    } else {
      // TODO: Implement proper database updating with authentication
      // For now, using local storage until authentication is implemented
      const existingMaps = JSON.parse(localStorage.getItem('factMaps') || '[]');
      const updatedMaps = existingMaps.map((map: any) => 
        map.id === foundationId ? { ...map, items: resultItems, updated_at: now } : map
      );
      localStorage.setItem('factMaps', JSON.stringify(updatedMaps));
      setBodyUpdatedAt(new Date(now).toLocaleString());
    }
    setBodyEditing(false);

    const userId = null;
    // TODO: Implement proper database operations with authentication
    // For now, using local storage until authentication is implemented
    const existingMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
    const missionData = existingMissions.filter((mission: any) => 
      mission.category === 'body' && !mission.is_impossible_game
    );

    if (!missionData || missionData.length === 0) {
      const newMission = {
        id: crypto.randomUUID(),
        category: 'body',
        name: language === 'en' ? 'Monthly Mission (Body)' : 'Misiunea Lunii (Corp)',
        user_id: 'temp-user',
        start_date: now.slice(0,10),
        end_date: new Date(Date.now() + 2629800000).toISOString().slice(0,10),
        is_impossible_game: false,
        questions: resultItems[0].answers,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('monthlyMissions', JSON.stringify([...existingMissions, newMission]));
    }
  };

  const handleBeingAnswerChange = (key: string, value: string) => {
    setBeingAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveBeingFacts = async () => {
    const now = new Date().toLocaleString();
    localStorage.setItem("beingFactAnswers", JSON.stringify(beingAnswers));
    localStorage.setItem("beingFactCreatedAt", beingCreatedAt || now);
    localStorage.setItem("beingFactUpdatedAt", now);
    setBeingCreatedAt(beingCreatedAt || now);
    setBeingUpdatedAt(now);
    setBeingEditing(false);
  };

  useEffect(() => {
    if (category === "body") {
      const saved = localStorage.getItem("bodyRealityAnswer");
      const savedAt = localStorage.getItem("bodyRealitySavedAt");
      if (saved) setBodyRealityAnswer(saved);
      if (savedAt) setBodyRealitySavedAt(savedAt);
    }
  }, [category]);

  const handleSaveBodyReality = () => {
    setSaving(true);
    const now = new Date().toLocaleString();
    localStorage.setItem("bodyRealityAnswer", bodyRealityAnswer);
    localStorage.setItem("bodyRealitySavedAt", now);
    setBodyRealitySavedAt(now);
    setBodyRealityEditing(false);
    setSaving(false);
  };

  const handleNavigate = (mapType: 'foundation' | 'monthly' | 'impossible', action: 'view' | 'create') => {
    if (action === 'view') {
      navigate(`/fact-maps?fromMission=true&category=${mapType}`);
    } else if (action === 'create') {
      if (mapType === 'monthly') {
        navigate(`/fact-maps/monthly-mission?category=${category}`);
      } else {
        navigate(`/fact-maps?fromMission=true&category=${mapType}`);
      }
    }
  };

  const getCategoryColor = (type: 'bg' | 'text' | 'border') => {
    switch (category) {
      case 'body':
        return type === 'bg' ? 'bg-red-900/20' : type === 'text' ? 'text-red-400' : 'border-red-700';
      case 'being':
        return type === 'bg' ? 'bg-blue-900/20' : type === 'text' ? 'text-blue-400' : 'border-blue-700';
      case 'balance':
        return type === 'bg' ? 'bg-green-900/20' : type === 'text' ? 'text-green-400' : 'border-green-700';
      case 'business':
        return type === 'bg' ? 'bg-purple-900/20' : type === 'text' ? 'text-purple-400' : 'border-purple-700';
    }
  };

  const getCategoryName = () => {
    switch (category) {
      case 'body':
        return language === 'en' ? 'Body' : 'Corp';
      case 'being':
        return language === 'en' ? 'Being' : 'Ființă';
      case 'balance':
        return language === 'en' ? 'Balance' : 'Echilibru';
      case 'business':
        return language === 'en' ? 'Business' : 'Afacere';
    }
  };

  return (
    <div className={`p-6 ${getCategoryColor('bg')} rounded-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${getCategoryColor('text')}`}>
        {getCategoryName()}
      </h2>

      <div className="grid grid-cols-1 gap-8 mb-12">
        <Card className="p-6 bg-gray-800/50 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === "en"
                  ? "1. Current Reality"
                  : "1. Realitatea Actuală"}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === "en"
                  ? "Define your starting point"
                  : "Definește punctul tău de plecare"}
              </p>
            </div>
            <div className={`rounded-full p-1 ${Object.values(bodyAnswers || {}).some(Boolean) ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              {Object.values(bodyAnswers || {}).some(Boolean) ? (
                <CheckCircle size={28} className="text-green-500" />
              ) : (
                <PlusCircle size={28} className="text-gray-400" />
              )}
            </div>
          </div>

          {category === "body" && (
            <div>
              {bodyEditing || !Object.values(bodyAnswers || {}).some(Boolean) ? (
                <>
                  <div className="mb-2 text-gray-300 text-sm">
                    {language === "en"
                      ? "Answer each foundational question one by one for your full reality map."
                      : "Răspunde la fiecare întrebare de bază pentru harta ta de realitate."}
                  </div>
                  <div className="space-y-4">
                    {localizedBodyFactQuestions.map((q, idx) => (
                      <div key={q} className="flex flex-col gap-1">
                        <label className="text-gray-200 text-sm font-semibold mb-1">{q}</label>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[48px]"
                          placeholder={language === 'en' ? "Type your answer..." : "Scrie răspunsul..."}
                          value={bodyAnswers[`fact${idx+1}`]}
                          onChange={(e) => handleBodyAnswerChange(`fact${idx+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="font-semibold text-gray-200 pt-4">{language==="en" ? fourWorking[0] : "Care sunt CELE 4 LUCRURI CARE MERG în acest domeniu și de ce?"}</div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"working" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en" ? `Working #${i+1}` : `Ce merge #${i+1}`}
                          value={bodyAnswers[`working${i+1}`]}
                          onChange={(e) => handleBodyAnswerChange(`working${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="font-semibold text-gray-200 pt-4">{language==="en" ? fourNotWorking[0] : "Care sunt CELE 4 LUCRURI CARE NU MERG în acest domeniu și de ce?"}</div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"notworking" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en" ? `Not Working #${i+1}` : `Ce nu merge #${i+1}`}
                          value={bodyAnswers[`notworking${i+1}`]}
                          onChange={(e) => handleBodyAnswerChange(`notworking${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="font-semibold text-gray-200 pt-4">{language==="en" ? fourAdjustments[0] : "Care sunt CELE 4 AJUSTĂRI CHEIE pe care trebuie să le faci în acest trimestru și de ce?"}</div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"adjustment" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en" ? `Adjustment #${i+1}` : `Ajustare #${i+1}`}
                          value={bodyAnswers[`adjustment${i+1}`]}
                          onChange={(e) => handleBodyAnswerChange(`adjustment${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="font-semibold text-gray-200 pt-4">{language==="en" ? fourMissions[0] : "Care sunt CELE 4 MISIUNI CRITICE pe care le-ai putea alege în acest trimestru și de ce?"}</div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"mission" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en" ? `Mission #${i+1}` : `Misiune #${i+1}`}
                          value={bodyAnswers[`mission${i+1}`]}
                          onChange={(e) => handleBodyAnswerChange(`mission${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 mt-5 flex gap-2 items-center"
                    onClick={handleSaveBodyFacts}
                    disabled={
                      Object.values(bodyAnswers).every(ans => !ans.trim())
                    }
                  >
                    <Save className="h-5 w-5" />
                    {language === "en" ? "Save All Answers" : "Salvează Răspunsurile"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4 text-gray-100 text-base px-2 py-2 bg-gray-900/50 rounded min-h-[50px] border border-gray-700 space-y-3">
                    {localizedBodyFactQuestions.map((q,idx) =>
                      bodyAnswers[`fact${idx+1}`] && (
                        <div key={q}>
                          <span className="font-semibold">{q}</span>
                          <div className="text-gray-300 whitespace-pre-line">{bodyAnswers[`fact${idx+1}`]}</div>
                        </div>
                      )
                    )}
                    {[language==="en" ? fourWorking[0] : "Care sunt CELE 4 LUCRURI CARE MERG în acest domeniu și de ce?"].map((label) => (
                      <div key="working-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      bodyAnswers[`working${i+1}`] && (
                        <div className="pl-3" key={"showworking"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{bodyAnswers[`working${i+1}`]}</span>
                        </div>
                      )
                    )}
                    {[language==="en" ? fourNotWorking[0] : "Care sunt CELE 4 LUCRURI CARE NU MERG în acest domeniu și de ce?"].map((label) => (
                      <div key="notworking-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      bodyAnswers[`notworking${i+1}`] && (
                        <div className="pl-3" key={"shownotworking"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{bodyAnswers[`notworking${i+1}`]}</span>
                        </div>
                      )
                    )}
                    {[language==="en" ? fourAdjustments[0] : "Care sunt CELE 4 AJUSTĂRI CHEIE pe care trebuie să le faci în acest trimestru și de ce?"].map((label) => (
                      <div key="adj-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      bodyAnswers[`adjustment${i+1}`] && (
                        <div className="pl-3" key={"showadj"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{bodyAnswers[`adjustment${i+1}`]}</span>
                        </div>
                      )
                    )}
                    {[language==="en" ? fourMissions[0] : "Care sunt CELE 4 MISIUNI CRITICE pe care le-ai putea alege în acest trimestru și de ce?"].map((label) => (
                      <div key="mission-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      bodyAnswers[`mission${i+1}`] && (
                        <div className="pl-3" key={"showmission"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{bodyAnswers[`mission${i+1}`]}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-row gap-6 items-center mb-2">
                    {bodyCreatedAt &&
                      <div className="text-xs text-gray-400">
                        {language === "en" ? "Created:" : "Creat:"}
                        <span className="font-mono ml-1">{bodyCreatedAt}</span>
                      </div>
                    }
                    {bodyUpdatedAt &&
                      <div className="text-xs text-gray-400">
                        {language === "en" ? "Last updated:" : "Ultima actualizare:"}
                        <span className="font-mono ml-1">{bodyUpdatedAt}</span>
                      </div>
                    }
                  </div>
                  <Button
                    onClick={() => setBodyEditing(true)}
                    className="bg-gray-700 hover:bg-gray-600 flex gap-2 items-center mt-1"
                  >
                    <Edit className="h-5 w-5" />
                    {language === "en" ? "Edit" : "Modifică"}
                  </Button>
                </>
              )}
            </div>
          )}

          {category === "being" && (
            <div>
              {beingEditing || !Object.values(beingAnswers || {}).some(Boolean) ? (
                <>
                  <div className="mb-2 text-gray-300 text-sm">
                    {language === "en"
                      ? "Answer these foundational questions for your full reality map in the spiritual/being domain."
                      : "Răspunde la aceste întrebări pentru harta completă a realității tale în domeniul spiritual/ființă."}
                  </div>
                  <div className="space-y-4">
                    {(language === "ro" ? beingFactQuestionsRo : beingFactQuestionsEn).map((q, idx) => (
                      <div key={q} className="flex flex-col gap-1">
                        <label className="text-gray-200 text-sm font-semibold mb-1">{q}</label>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[48px]"
                          placeholder={language === 'en' ? "Type your answer..." : "Scrie răspunsul..."}
                          value={beingAnswers[`fact${idx+1}`]}
                          onChange={(e) => handleBeingAnswerChange(`fact${idx+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    {/* WORKING */}
                    <div className="font-semibold text-gray-200 pt-4">
                      {(language === "ro" ? fourBeingWorkingRo : fourBeingWorking)[0]}
                    </div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"beingworking" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en"
                            ? `Working #${i+1}`
                            : `Ce merge #${i+1}`
                          }
                          value={beingAnswers[`working${i+1}`]}
                          onChange={(e) => handleBeingAnswerChange(`working${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    {/* NOT WORKING */}
                    <div className="font-semibold text-gray-200 pt-4">
                      {(language === "ro" ? fourBeingNotWorkingRo : fourBeingNotWorking)[0]}
                    </div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"beingnotworking" + (i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en"
                            ? `Not Working #${i+1}`
                            : `Ce nu merge #${i+1}`
                          }
                          value={beingAnswers[`notworking${i+1}`]}
                          onChange={(e) => handleBeingAnswerChange(`notworking${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    {/* ADJUSTMENTS */}
                    <div className="font-semibold text-gray-200 pt-4">
                      {(language === "ro" ? fourBeingAdjustmentsRo : fourBeingAdjustments)[0]}
                    </div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"beingadjustment"+(i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en"
                            ? `Adjustment #${i+1}`
                            : `Ajustare #${i+1}`
                          }
                          value={beingAnswers[`adjustment${i+1}`]}
                          onChange={(e) => handleBeingAnswerChange(`adjustment${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                    {/* MISSIONS */}
                    <div className="font-semibold text-gray-200 pt-4">
                      {(language === "ro" ? fourBeingMissionsRo : fourBeingMissions)[0]}
                    </div>
                    {[...Array(4)].map((_,i) => (
                      <div key={"beingmission"+(i+1)}>
                        <Textarea
                          className="bg-[#1E2638] border-gray-700 text-white min-h-[36px]"
                          placeholder={language==="en"
                            ? `Mission #${i+1}`
                            : `Misiune #${i+1}`}
                          value={beingAnswers[`mission${i+1}`]}
                          onChange={(e) => handleBeingAnswerChange(`mission${i+1}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 mt-5 flex gap-2 items-center"
                    onClick={handleSaveBeingFacts}
                    disabled={Object.values(beingAnswers).every(ans => !ans.trim())}
                  >
                    <Save className="h-5 w-5" />
                    {language === "en" ? "Save All Answers" : "Salvează Răspunsurile"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4 text-gray-100 text-base px-2 py-2 bg-gray-900/50 rounded min-h-[50px] border border-gray-700 space-y-3">
                    {(language === "ro" ? beingFactQuestionsRo : beingFactQuestionsEn).map((q,idx) =>
                      beingAnswers[`fact${idx+1}`] && (
                        <div key={q}>
                          <span className="font-semibold">{q}</span>
                          <div className="text-gray-300 whitespace-pre-line">{beingAnswers[`fact${idx+1}`]}</div>
                        </div>
                      )
                    )}

                    {/* WORKING */}
                    {[(language === "ro" ? fourBeingWorkingRo : fourBeingWorking)[0]].map((label) => (
                      <div key="work-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      beingAnswers[`working${i+1}`] && (
                        <div className="pl-3" key={"showbeingworking"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{beingAnswers[`working${i+1}`]}</span>
                        </div>
                      )
                    )}

                    {/* NOT WORKING */}
                    {[(language === "ro" ? fourBeingNotWorkingRo : fourBeingNotWorking)[0]].map((label) => (
                      <div key="notwork-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      beingAnswers[`notworking${i+1}`] && (
                        <div className="pl-3" key={"showbeingnotworking"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{beingAnswers[`notworking${i+1}`]}</span>
                        </div>
                      )
                    )}

                    {/* ADJUSTMENTS */}
                    {[(language === "ro" ? fourBeingAdjustmentsRo : fourBeingAdjustments)[0]].map((label) => (
                      <div key="adj-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      beingAnswers[`adjustment${i+1}`] && (
                        <div className="pl-3" key={"showbeingadj"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{beingAnswers[`adjustment${i+1}`]}</span>
                        </div>
                      )
                    )}
                    {/* MISSIONS */}
                    {[(language === "ro" ? fourBeingMissionsRo : fourBeingMissions)[0]].map((label) => (
                      <div key="mission-label" className="pt-4 font-semibold">{label}</div>
                    ))}
                    {[...Array(4)].map((_,i) =>
                      beingAnswers[`mission${i+1}`] && (
                        <div className="pl-3" key={"showbeingmission"+(i+1)}>
                          <span className="font-mono">#{i+1}: </span>
                          <span className="text-gray-400">{beingAnswers[`mission${i+1}`]}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-row gap-6 items-center mb-2">
                    {beingCreatedAt &&
                      <div className="text-xs text-gray-400">
                        {language === "en" ? "Created:" : "Creat:"}
                        <span className="font-mono ml-1">{beingCreatedAt}</span>
                      </div>
                    }
                    {beingUpdatedAt &&
                      <div className="text-xs text-gray-400">
                        {language === "en" ? "Last updated:" : "Ultima actualizare:"}
                        <span className="font-mono ml-1">{beingUpdatedAt}</span>
                      </div>
                    }
                  </div>
                  <Button
                    onClick={() => setBeingEditing(true)}
                    className="bg-gray-700 hover:bg-gray-600 flex gap-2 items-center mt-1"
                  >
                    <Edit className="h-5 w-5" />
                    {language === "en" ? "Edit" : "Modifică"}
                  </Button>
                </>
              )}
            </div>
          )}

          {category !== "body" && category !== "being" && (
            <Button
              className={`w-full mt-2 flex items-center gap-2 ${
                !mapStatus.foundation.exists
                  ? "bg-blue-600 hover:bg-blue-700"
                  : mapStatus.foundation.completed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() =>
                handleNavigate(
                  "foundation",
                  mapStatus.foundation.exists ? "view" : "create"
                )
              }
            >
              {!mapStatus.foundation.exists ? (
                <>
                  <Play size={20} className="text-white" />
                  {language === "en" ? "Start" : "Începe"}
                </>
              ) : mapStatus.foundation.completed ? (
                <>
                  <CheckCircle size={20} className="text-white" />
                  {language === "en"
                    ? "Current, View Reality"
                    : "Este acum, Vezi realitatea"}
                </>
              ) : (
                <>
                  <Edit size={20} className="text-yellow-500" />
                  {language === "en" ? "Continue" : "Continua"}
                </>
              )}
            </Button>
          )}
        </Card>

        <Card className="p-6 bg-gray-800/50 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === "en"
                  ? "2. Monthly Mission"
                  : "2. Misiunea Lunară"}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === "en"
                  ? "Your next milestone to achieve"
                  : "Următorul tău obiectiv de atins"}
              </p>
            </div>
            <div className={`rounded-full p-1 ${mapStatus.monthly.completed ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              {mapStatus.monthly.completed ? (
                <CheckCircle size={28} className="text-green-500" />
              ) : mapStatus.monthly.exists ? (
                <Edit size={28} className="text-yellow-500" />
              ) : (
                <PlusCircle size={28} className="text-gray-400" />
              )}
            </div>
          </div>
          
          <Button 
            className={`w-full mt-2 ${mapStatus.monthly.exists ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={() => handleNavigate('monthly', mapStatus.monthly.exists ? 'view' : 'create')}
          >
            {mapStatus.monthly.exists ? (
              language === "en" ? "View Mission" : "Vezi Misiunea"
            ) : (
              language === "en" ? "Create Mission" : "Creează Misiune"
            )}
          </Button>
        </Card>

        {/* UNIVERSAL ANNUAL GOAL FOR ALL CATEGORIES */}
        <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === "en" ? "3. Annual Goal" : "3. Obiectivul Anual"}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === "en"
                  ? "Your impossible game period"
                  : "Perioada jocului tău imposibil"}
              </p>
            </div>
            <div className={`rounded-full p-1 ${
              annualGoalData && Object.values(annualGoalData).filter(v => typeof v === "string" ? v.trim() : true).length > 2 ? "bg-green-500/20" : "bg-gray-500/20"
            }`}>
              {annualGoalData && Object.values(annualGoalData).filter(v => typeof v === "string" ? v.trim() : true).length > 2
                ? <CheckCircle size={28} className="text-green-500" />
                : <Edit size={28} className="text-yellow-500" />}
            </div>
          </div>
          <div className="space-y-4">
            {annualGoalData && Object.values(annualGoalData).filter(v => typeof v === "string" ? v.trim() : true).length > 2 ? (
              <>
                <div className="mb-4 text-gray-100 text-base px-2 py-2 bg-gray-900/50 rounded min-h-[50px] border border-gray-700 space-y-3 max-h-[340px] overflow-y-auto">
                  <div className="text-xs font-semibold text-yellow-300 pb-1">
                    {language === "en" ? "Time Period:" : "Perioadă:"} {PERIOD_OPTIONS.find(opt => opt.value === annualGoalPeriod)?.label[language] || ""}
                  </div>
                  {annualGoalQuestionsForCategory.map((q,i) => {
                    if(q.subquestions) {
                      return q.subquestions.map((sub,idx) =>
                        !!annualGoalData[sub.key] &&
                        <div key={sub.key}>
                          <span className="font-semibold">{sub.label[language]}</span>
                          <div className="text-gray-300 whitespace-pre-line">{annualGoalData[sub.key]}</div>
                        </div>
                      );
                    } else if(q.key && annualGoalData[q.key]) {
                      return (
                        <div key={q.key}>
                          <span className="font-semibold">{typeof q.label === "string" ? q.label : q.label[language]}</span>
                          <div className="text-gray-300 whitespace-pre-line">{annualGoalData[q.key]}</div>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                </div>
                <div className="flex flex-row gap-6 items-center mb-2">
                  {annualGoalCreatedAt &&
                    <div className="text-xs text-gray-400">
                      {language === "en" ? "Created:" : "Creat:"}
                      <span className="font-mono ml-1">{annualGoalCreatedAt}</span>
                    </div>
                  }
                  {annualGoalUpdatedAt &&
                    <div className="text-xs text-gray-400">
                      {language === "en" ? "Last updated:" : "Ultima actualizare:"}
                      <span className="font-mono ml-1">{annualGoalUpdatedAt}</span>
                    </div>
                  }
                </div>
                <Button
                  className="bg-gray-700 hover:bg-gray-600 flex gap-2 items-center mt-1"
                  onClick={() => setShowAnnualGoalDialog(true)}
                >
                  <Edit className="h-5 w-5" />
                  {language === "en" ? "Edit Annual Goal" : "Editează Obiectivul Anual"}
                </Button>
              </>
            ) : (
              <Button
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowAnnualGoalDialog(true)}
              >
                {language === "en" ? "Define Annual Goal" : "Definește Obiectivul Anual"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center w-full mb-8">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${mapStatus.foundation.exists ? 'bg-gray-600' : 'bg-gray-800'} flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">1</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === "en" ? "Reality" : "Realitate"}
            </span>
          </div>
          <div className="h-1 w-16 bg-gray-700 relative flex items-center">
            <ArrowRight className="text-gray-600 absolute right-0" />
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${mapStatus.monthly.exists ? 'bg-blue-700' : 'bg-gray-800'} flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">2</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === "en" ? "Monthly" : "Lunar"}
            </span>
          </div>
          <div className="h-1 w-16 bg-gray-700 relative flex items-center">
            <ArrowRight className="text-gray-600 absolute right-0" />
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${mapStatus.impossible.exists ? 'bg-yellow-700' : 'bg-gray-800'} flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">3</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === "en" ? "Annual" : "Anual"}
            </span>
          </div>
        </div>
      </div>

      {showAnnualGoalDialog && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center overflow-auto">
          <div className="bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative flex flex-col gap-3 max-h-[95vh] overflow-y-auto border border-yellow-700">
            <Button variant="ghost" className="absolute top-2 right-2 text-white" onClick={() => setShowAnnualGoalDialog(false)}>
              ✕
            </Button>
            <h2 className="text-xl font-bold text-yellow-400 mb-2">{language === "en" ? "Annual Goal" : "Obiectivul Anual"} {getCategoryName()}</h2>
            <form
              className="flex flex-col gap-2"
              onSubmit={e => {
                e.preventDefault();
                setShowAnnualGoalDialog(false);
              }}
            >
              <div className="flex flex-col mb-3">
                <label className="font-semibold block text-yellow-100 mb-1">{language === "en" ? "Select Period" : "Selectează perioada"}</label>
                <select
                  className="bg-gray-800 border border-yellow-600 text-white py-2 px-2 rounded"
                  value={annualGoalPeriod}
                  onChange={e => {
                    setAnnualGoalPeriod(e.target.value);
                    localStorage.setItem(annualGoalKeys.period, e.target.value);
                  }}
                >
                  {PERIOD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label[language]}
                    </option>
                  ))}
                </select>
              </div>
              {annualGoalQuestionsForCategory.map((q,i) => {
                if(q.section === "headline") {
                  return (
                    <div key={i} className="mb-2">
                      <label className="font-semibold block text-yellow-100 mb-1">{typeof q.label === "string" ? q.label : q.label[language]}</label>
                      <Textarea
                        placeholder={q.placeholder || "Scrie răspunsul aici..."}
                        className="bg-gray-800 border border-yellow-600 text-white"
                        value={annualGoalData.headline || ""}
                        onChange={e => {
                          const data = { ...annualGoalData, headline: e.target.value };
                          saveAnnualGoalData(data, annualGoalPeriod);
                        }}
                      />
                    </div>
                  );
                }
                if(q.subquestions) {
                  return (
                    <div key={i} className="mb-2 border border-gray-700 rounded p-2">
                      <span className="block font-semibold text-yellow-200 mb-2">{typeof q.label === "string" ? q.label : q.label[language]}</span>
                      {q.subquestions.map((sub, idx) => (
                        <div key={sub.key} className="mb-1">
                          <label className="block text-xs text-gray-300 mb-1">{sub.label[language]}</label>
                          <Textarea
                            className="bg-gray-800 border border-yellow-600 text-white"
                            value={annualGoalData[sub.key] || ""}
                            onChange={e => {
                              const data = { ...annualGoalData, [sub.key]: e.target.value };
                              saveAnnualGoalData(data, annualGoalPeriod);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                if(q.key) {
                  return (
                    <div key={i} className="mb-2">
                      <label className="font-semibold block text-yellow-100 mb-1">{typeof q.label === "string" ? q.label : q.label[language]}</label>
                      <Textarea
                        placeholder={q.placeholder || "Scrie răspunsul aici..."}
                        className="bg-gray-800 border border-yellow-600 text-white"
                        value={annualGoalData[q.key] || ""}
                        onChange={e => {
                          const data = { ...annualGoalData, [q.key]: e.target.value };
                          saveAnnualGoalData(data, annualGoalPeriod);
                        }}
                      />
                    </div>
                  );
                }
                return null;
              })}
              <div className="flex flex-row gap-6 items-center mb-2">
                {annualGoalCreatedAt &&
                  <div className="text-xs text-gray-400">
                    {language === "en" ? "Created:" : "Creat:"}
                    <span className="font-mono ml-1">{annualGoalCreatedAt}</span>
                  </div>
                }
                {annualGoalUpdatedAt &&
                  <div className="text-xs text-gray-400">
                    {language === "en" ? "Last updated:" : "Ultima actualizare:"}
                    <span className="font-mono ml-1">{annualGoalUpdatedAt}</span>
                  </div>
                }
              </div>
              <Button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold mt-3"
                onClick={() => setShowAnnualGoalDialog(false)}
              >
                {language === "en" ? "Save Annual Goal" : "Salvează Obiectivul Anual"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {showAnnualGoalBodyDialog && category === "body" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center overflow-auto">
          <div className="bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative flex flex-col gap-3 max-h-[95vh] overflow-y-auto border border-yellow-700">
            <Button variant="ghost" className="absolute top-2 right-2 text-white" onClick={() => setShowAnnualGoalBodyDialog(false)}>
              ✕
            </Button>
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Obiectivul Anual BODY</h2>
            <form
              className="flex flex-col gap-2"
              onSubmit={e => {
                e.preventDefault();
                setShowAnnualGoalBodyDialog(false);
              }}
            >
              {annualGoalQuestions.map((q,i) => {
                if(q.section === "headline") {
                  return (
                    <div key={i} className="mb-2">
                      <label className="font-semibold block text-yellow-100 mb-1">{q.label}</label>
                      <Textarea
                        placeholder={q.placeholder || "Scrie răspunsul aici..."}
                        className="bg-gray-800 border border-yellow-600 text-white"
                        value={annualGoalBody.headline || ""}
                        onChange={e => {
                          const data = { ...annualGoalBody, headline: e.target.value };
                          saveAnnualGoalBody(data);
                        }}
                      />
                    </div>
                  );
                }
                if(q.subquestions) {
                  return (
                    <div key={i} className="mb-2 border border-gray-700 rounded p-2">
                      <span className="block font-semibold text-yellow-200 mb-2">{q.label}</span>
                      {q.subquestions.map((sub, idx) => (
                        <div key={sub.key} className="mb-1">
                          <label className="block text-xs text-gray-300 mb-1">{sub.label}</label>
                          <Textarea
                            className="bg-gray-800 border border-yellow-600 text-white"
                            value={annualGoalBody[sub.key] || ""}
                            onChange={e => {
                              const data = { ...annualGoalBody, [sub.key]: e.target.value };
                              saveAnnualGoalBody(data);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                if(q.key) {
                  return (
                    <div key={i} className="mb-2">
                      <label className="font-semibold block text-yellow-100 mb-1">{q.label}</label>
                      <Textarea
                        placeholder={q.placeholder || "Scrie răspunsul aici..."}
                        className="bg-gray-800 border border-yellow-600 text-white"
                        value={annualGoalBody[q.key] || ""}
                        onChange={e => {
                          const data = { ...annualGoalBody, [q.key]: e.target.value };
                          saveAnnualGoalBody(data);
                        }}
                      />
                    </div>
                  );
                }
                return null;
              })}
              <div className="flex flex-row gap-6 items-center mb-2">
                {annualGoalBodyCreatedAt &&
                  <div className="text-xs text-gray-400">
                    {language === "en" ? "Created:" : "Creat:"}
                    <span className="font-mono ml-1">{annualGoalBodyCreatedAt}</span>
                  </div>
                }
                {annualGoalBodyUpdatedAt &&
                  <div className="text-xs text-gray-400">
                    {language === "en" ? "Last updated:" : "Ultima actualizare:"}
                    <span className="font-mono ml-1">{annualGoalBodyUpdatedAt}</span>
                  </div>
                }
              </div>
              <Button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold mt-3"
                onClick={() => setShowAnnualGoalBodyDialog(false)}
              >
                {language === "en" ? "Save Annual Goal" : "Salvează Obiectivul Anual"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
