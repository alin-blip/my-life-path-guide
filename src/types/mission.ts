
export type MissionCategory = 'body' | 'being' | 'balance' | 'business';

export interface MissionPart {
  title: string;
  content: string;
}

export interface MissionResult {
  measurableResult: string;
  endGoalValue: string;
  immediateActions: string;
}

export interface MissionQuestions {
  impossibleFruits: string[];
  stopDoing: string;
  sustainDoing: string;
  startDoing: string;
  obstacles: string;
  opportunities: string;
  talents: string;
  currentMindsets: string;
  requiredMindsets: string;
  currentSkills: string;
  requiredSkills: string;
  currentResources: string;
  requiredResources: string;
  finalThoughts: string;
  primaryLessons: string;
}

export interface MonthlyMission {
  id: string;
  category: MissionCategory;
  name: string;
  startDate: string;
  endDate: string;
  isImpossibleGame?: boolean;
  questions: MissionQuestions;
  parts: MissionPart[];
  result: MissionResult;
  createdAt: string;
}
