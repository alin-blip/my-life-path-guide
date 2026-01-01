
import { MacroNutrients } from './fitnessService';
import { DailyMealPlan, WeeklyMealPlan, Food, Meal } from './types/mealTypes';
import { getCompatibleFoods } from './data/foodDatabase';



class MealPlanService {
  private mealGenerator: MealGenerator;

  constructor() {
    this.mealGenerator = new MealGenerator();
  }

  private createDailyPlan(
    targetCalories: number,
    mealsPerDay: number,
    availableFoods: Food[]
  ): DailyMealPlan {
    const meals: Meal[] = [];
    let remainingCalories = targetCalories;
    
    // Create breakfast (25-30% of daily calories)
    const breakfastCalories = targetCalories * (mealsPerDay <= 3 ? 0.3 : 0.25);
    const breakfast = this.mealGenerator.createMeal(breakfastCalories, 'breakfast', availableFoods);
    meals.push(breakfast);
    remainingCalories -= breakfast.totalCalories;
    
    // Create lunch (30-35% of daily calories)
    const lunchCalories = targetCalories * (mealsPerDay <= 3 ? 0.35 : 0.3);
    const lunch = this.mealGenerator.createMeal(lunchCalories, 'lunch', availableFoods);
    meals.push(lunch);
    remainingCalories -= lunch.totalCalories;
    
    // If more than 3 meals, add snacks
    if (mealsPerDay > 3) {
      const snacksCount = mealsPerDay - 3;
      const caloriesPerSnack = (targetCalories * 0.15) / snacksCount;
      
      for (let i = 0; i < snacksCount; i++) {
        const snack = this.mealGenerator.createMeal(caloriesPerSnack, 'snack', availableFoods);
        meals.push(snack);
        remainingCalories -= snack.totalCalories;
      }
    }
    
    // Create dinner with remaining calories
    const dinner = this.mealGenerator.createMeal(remainingCalories, 'dinner', availableFoods);
    meals.push(dinner);
    
    const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const totalMacros = {
      protein: meals.reduce((sum, meal) => sum + meal.totalMacros.protein, 0),
      carbs: meals.reduce((sum, meal) => sum + meal.totalMacros.carbs, 0),
      fat: meals.reduce((sum, meal) => sum + meal.totalMacros.fat, 0)
    };
    
    return {
      meals,
      totalCalories,
      totalMacros
    };
  }

  generateMealPlan(
    targetCalories: number,
    targetMacros: MacroNutrients,
    mealsPerDay: number,
    excludedFoods: string[] = [],
    preferredFoods: string[] = []
  ): WeeklyMealPlan {
    const availableFoods = getCompatibleFoods(excludedFoods, preferredFoods);
    const days: DailyMealPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(this.createDailyPlan(targetCalories, mealsPerDay, availableFoods));
    }
    
    return {
      days,
      targetCalories,
      targetMacros
    };
  }
}

// Create a singleton instance
const mealPlanService = new MealPlanService();

export { mealPlanService };
export default mealPlanService;
