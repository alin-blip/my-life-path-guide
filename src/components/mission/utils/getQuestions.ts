
import { monthlyBodyQuestions } from '../questions/monthlyBodyQuestions';
import { monthlyBeingQuestions } from '../questions/monthlyBeingQuestions';
import { monthlyBalanceQuestions } from '../questions/monthlyBalanceQuestions';
import { monthlyBusinessQuestions } from '../questions/monthlyBusinessQuestions';
import { annualBodyQuestions } from '../questions/annualBodyQuestions';
import { annualBeingQuestions } from '../questions/annualBeingQuestions';
import { annualBalanceQuestions } from '../questions/annualBalanceQuestions';
import { annualBusinessQuestions } from '../questions/annualBusinessQuestions';
import { MissionCategory } from '@/types/mission';

export const getQuestionStruct = (category: MissionCategory, isImpossibleGame: boolean = false) => {
  if (isImpossibleGame) {
    switch (category) {
      case 'body': return annualBodyQuestions;
      case 'being': return annualBeingQuestions;
      case 'balance': return annualBalanceQuestions;
      case 'business': return annualBusinessQuestions;
      default: return annualBodyQuestions;
    }
  } else {
    switch (category) {
      case 'body': return monthlyBodyQuestions;
      case 'being': return monthlyBeingQuestions;
      case 'balance': return monthlyBalanceQuestions;
      case 'business': return monthlyBusinessQuestions;
      default: return monthlyBodyQuestions;
    }
  }
};
