
import { Food, Meal } from '../types/mealTypes';

export class MealGenerator {
  private getRandomFood(foods: Food[]): Food {
    return foods[Math.floor(Math.random() * foods.length)];
  }

  createMeal(
    targetCalories: number,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    availableFoods: Food[]
  ): Meal {
    const proteins = availableFoods.filter(f => f.category === 'protein');
    const carbs = availableFoods.filter(f => f.category === 'carb');
    const fats = availableFoods.filter(f => f.category === 'fat');
    const vegetables = availableFoods.filter(f => f.category === 'vegetable');
    const fruits = availableFoods.filter(f => f.category === 'fruit');
    
    const mealFoods = [];
    let currentCalories = 0;
    
    // Add protein
    if (proteins.length > 0) {
      const protein = this.getRandomFood(proteins);
      const amount = Math.floor(100 + Math.random() * 50);
      mealFoods.push({ food: protein, amount });
      currentCalories += (protein.calories * amount) / 100;
    }
    
    // Add carbs
    if (carbs.length > 0 && currentCalories < targetCalories * 0.8) {
      const carb = this.getRandomFood(carbs);
      const amount = Math.floor(100 + Math.random() * 100);
      mealFoods.push({ food: carb, amount });
      currentCalories += (carb.calories * amount) / 100;
    }
    
    // Add vegetables
    if (vegetables.length > 0) {
      const vegetable = this.getRandomFood(vegetables);
      const amount = Math.floor(100 + Math.random() * 150);
      mealFoods.push({ food: vegetable, amount });
      currentCalories += (vegetable.calories * amount) / 100;
    }
    
    // Add fruit for breakfast or snack
    if ((mealType === 'breakfast' || mealType === 'snack') && fruits.length > 0) {
      const fruit = this.getRandomFood(fruits);
      const amount = Math.floor(100 + Math.random() * 50);
      mealFoods.push({ food: fruit, amount });
      currentCalories += (fruit.calories * amount) / 100;
    }
    
    // Add healthy fat
    if (fats.length > 0) {
      const fat = this.getRandomFood(fats);
      const amount = Math.floor(10 + Math.random() * 20);
      mealFoods.push({ food: fat, amount });
      currentCalories += (fat.calories * amount) / 100;
    }
    
    const totalCalories = mealFoods.reduce(
      (sum, { food, amount }) => sum + (food.calories * amount) / 100, 
      0
    );
    
    const totalMacros = {
      protein: mealFoods.reduce((sum, { food, amount }) => sum + (food.protein * amount) / 100, 0),
      carbs: mealFoods.reduce((sum, { food, amount }) => sum + (food.carbs * amount) / 100, 0),
      fat: mealFoods.reduce((sum, { food, amount }) => sum + (food.fat * amount) / 100, 0)
    };
    
    return {
      name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      foods: mealFoods,
      totalCalories,
      totalMacros
    };
  }
}
