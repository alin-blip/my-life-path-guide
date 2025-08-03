
import { Food } from '../types/mealTypes';

export const foods: Food[] = [
  // Proteins
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
  { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, category: 'protein' },
  { name: 'Eggs', calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, category: 'protein' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'dairy' },
  { name: 'Tofu', calories: 144, protein: 17, carbs: 2.8, fat: 8.7, category: 'protein' },
  { name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fat: 17, category: 'protein' },
  
  // Carbs
  { name: 'Brown Rice', calories: 216, protein: 4.5, carbs: 45, fat: 1.8, category: 'carb' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'carb' },
  { name: 'Quinoa', calories: 222, protein: 8.1, carbs: 39, fat: 3.6, category: 'carb' },
  { name: 'Oatmeal', calories: 68, protein: 2.5, carbs: 12, fat: 1.4, category: 'carb' },
  { name: 'Whole Wheat Bread', calories: 81, protein: 4.0, carbs: 13.8, fat: 1.1, category: 'carb' },
  
  // Fats
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, category: 'fat' },
  { name: 'Olive Oil', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'fat' },
  { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'fat' },
  
  // Vegetables
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, category: 'vegetable' },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetable' },
  { name: 'Kale', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, category: 'vegetable' },
  
  // Fruits
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, category: 'fruit' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, category: 'fruit' },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, category: 'fruit' }
];

export const getCompatibleFoods = (excludedFoods: string[], preferredFoods: string[]): Food[] => {
  return foods.filter(food => 
    !excludedFoods.some(excluded => 
      food.name.toLowerCase().includes(excluded.toLowerCase())
    )
  );
};
