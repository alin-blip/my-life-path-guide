
import { MacroNutrients } from '../fitnessService';

export interface Food {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'other';
}

export interface Meal {
  name: string;
  foods: Array<{
    food: Food;
    amount: number;
  }>;
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DailyMealPlan {
  meals: Meal[];
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyMealPlan {
  days: DailyMealPlan[];
  targetCalories: number;
  targetMacros: MacroNutrients;
}
