
export interface UserData {
  gender: 'male' | 'female';
  weight: number;
  height: number;
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'reduce_cellulite';
}

export interface MacroNutrient {
  percentage: number;
  calories: number;
  grams: number;
}

export interface MacroNutrients {
  protein: MacroNutrient;
  carbs: MacroNutrient;
  fat: MacroNutrient;
}

export interface IdealWeightRange {
  minWeight: number;
  maxWeight: number;
}

export interface CalculationResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroNutrients;
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  idealWeightRange: IdealWeightRange;
}

const fitnessService = {
  calculateBMR(userData: UserData): number {
    const { gender, weight, height, age } = userData;
    // Formula Mifflin-St Jeor
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  },

  calculateTDEE(bmr: number, activityLevel: UserData['activityLevel']): number {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return Math.round(bmr * activityMultipliers[activityLevel]);
  },

  calculateTargetCalories(tdee: number, goal: UserData['goal']): number {
    const goalMultipliers = {
      lose_weight: 0.8,
      maintain: 1,
      gain_muscle: 1.1,
      reduce_cellulite: 0.85
    };
    return Math.round(tdee * goalMultipliers[goal]);
  },

  calculateMacros(calories: number, dietType: string): MacroNutrients {
    const macroRatios: Record<string, { protein: number, carbs: number, fat: number }> = {
      balanced: { protein: 0.3, carbs: 0.4, fat: 0.3 },
      low_carb: { protein: 0.4, carbs: 0.2, fat: 0.4 },
      high_protein: { protein: 0.4, carbs: 0.3, fat: 0.3 },
      keto: { protein: 0.35, carbs: 0.05, fat: 0.6 },
      mediterranean: { protein: 0.25, carbs: 0.45, fat: 0.3 },
      vegan: { protein: 0.25, carbs: 0.5, fat: 0.25 }
    };

    const ratio = macroRatios[dietType] || macroRatios.balanced;
    
    return {
      protein: {
        percentage: ratio.protein * 100,
        calories: calories * ratio.protein,
        grams: Math.round((calories * ratio.protein) / 4)
      },
      carbs: {
        percentage: ratio.carbs * 100,
        calories: calories * ratio.carbs,
        grams: Math.round((calories * ratio.carbs) / 4)
      },
      fat: {
        percentage: ratio.fat * 100,
        calories: calories * ratio.fat,
        grams: Math.round((calories * ratio.fat) / 9)
      }
    };
  },

  calculateBMI(weight: number, height: number): number {
    // Height in cm to m
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  },

  getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  },

  calculateIdealWeightRange(height: number): IdealWeightRange {
    // Height in cm
    const minBMI = 18.5;
    const maxBMI = 24.9;
    const heightInMeters = height / 100;
    return {
      minWeight: Math.round(minBMI * heightInMeters * heightInMeters),
      maxWeight: Math.round(maxBMI * heightInMeters * heightInMeters)
    };
  },

  calculateAll(userData: UserData, dietType: string): CalculationResults {
    const bmr = this.calculateBMR(userData);
    const tdee = this.calculateTDEE(bmr, userData.activityLevel);
    const targetCalories = this.calculateTargetCalories(tdee, userData.goal);
    const macros = this.calculateMacros(targetCalories, dietType);
    const bmi = this.calculateBMI(userData.weight, userData.height);
    const bmiCategory = this.getBMICategory(bmi);
    const idealWeightRange = this.calculateIdealWeightRange(userData.height);

    return {
      bmr,
      tdee,
      targetCalories,
      macros,
      bmi,
      bmiCategory,
      idealWeightRange
    };
  }
};

export default fitnessService;
