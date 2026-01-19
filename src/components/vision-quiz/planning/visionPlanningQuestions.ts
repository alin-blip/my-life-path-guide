// Questions for the Vision Planning flow after quiz results

export interface PlanningQuestion {
  key: string;
  labelEn: string;
  labelRo: string;
  placeholderEn?: string;
  placeholderRo?: string;
}

export const annualVisionQuestions: PlanningQuestion[] = [
  {
    key: 'main_goal',
    labelEn: 'What is the ONE result that would transform your life in 2026?',
    labelRo: 'Care este UNICUL rezultat care ți-ar transforma viața în 2026?',
    placeholderEn: 'e.g., Launch my business and reach €10k/month',
    placeholderRo: 'ex: Să îmi lansez afacerea și să ajung la €10k/lună',
  },
  {
    key: 'why_matters',
    labelEn: 'Why does this matter to you? What would it mean to achieve this?',
    labelRo: 'De ce contează asta pentru tine? Ce ar însemna să realizezi asta?',
    placeholderEn: 'Connect with your deeper motivation...',
    placeholderRo: 'Conectează-te cu motivația ta profundă...',
  },
  {
    key: 'success_feeling',
    labelEn: 'How will you feel when you achieve this on December 31, 2026?',
    labelRo: 'Cum te vei simți când vei realiza asta pe 31 Decembrie 2026?',
    placeholderEn: 'Describe the emotion, the pride, the joy...',
    placeholderRo: 'Descrie emoția, mândria, bucuria...',
  },
];

export const quarterlySprintQuestions: PlanningQuestion[] = [
  {
    key: 'quarterly_milestone',
    labelEn: 'What specific result can you achieve in the next 90 days towards your annual goal?',
    labelRo: 'Ce rezultat specific poți obține în următoarele 90 de zile spre obiectivul anual?',
    placeholderEn: 'e.g., Complete my course and get first 10 clients',
    placeholderRo: 'ex: Să îmi finalizez cursul și să obțin primii 10 clienți',
  },
  {
    key: 'three_milestones',
    labelEn: 'What are the 3 monthly milestones to hit this quarter?',
    labelRo: 'Care sunt cele 3 milestone-uri lunare pentru acest trimestru?',
    placeholderEn: 'Month 1: ... Month 2: ... Month 3: ...',
    placeholderRo: 'Luna 1: ... Luna 2: ... Luna 3: ...',
  },
];

export const monthlyMissionQuestions: PlanningQuestion[] = [
  {
    key: 'monthly_focus',
    labelEn: 'What must happen this month to be on track for your 90-day goal?',
    labelRo: 'Ce trebuie să se întâmple luna asta pentru a fi pe drumul cel bun spre obiectivul de 90 de zile?',
    placeholderEn: 'The ONE thing that would make this month a success...',
    placeholderRo: 'UNICUL lucru care ar face această lună un succes...',
  },
  {
    key: 'weekly_commitment',
    labelEn: 'What is the FIRST action you will take this week?',
    labelRo: 'Care este PRIMA acțiune pe care o vei face săptămâna asta?',
    placeholderEn: 'Be specific - what exactly will you do?',
    placeholderRo: 'Fii specific - ce anume vei face?',
  },
];

export const getQuestionLabel = (question: PlanningQuestion, language: 'en' | 'ro') => 
  language === 'en' ? question.labelEn : question.labelRo;

export const getQuestionPlaceholder = (question: PlanningQuestion, language: 'en' | 'ro') => 
  language === 'en' ? question.placeholderEn : question.placeholderRo;
