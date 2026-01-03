import { Food } from '../types/mealTypes';

export type FoodItem = Food;

export const foods: Food[] = [
  // Proteins
  { name: 'Piept de Pui', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein', servingSize: '100g' },
  { name: 'Somon', calories: 206, protein: 22, carbs: 0, fat: 13, category: 'protein', servingSize: '100g' },
  { name: 'Ouă (2 buc)', calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, category: 'protein', servingSize: '2 ouă' },
  { name: 'Ou Fiert', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, category: 'protein', servingSize: '1 ou' },
  { name: 'Iaurt Grecesc', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'dairy', servingSize: '100g' },
  { name: 'Tofu', calories: 144, protein: 17, carbs: 2.8, fat: 8.7, category: 'protein', servingSize: '100g' },
  { name: 'Carne de Vită Slabă', calories: 250, protein: 26, carbs: 0, fat: 17, category: 'protein', servingSize: '100g' },
  { name: 'Piept de Curcan', calories: 135, protein: 30, carbs: 0, fat: 1, category: 'protein', servingSize: '100g' },
  { name: 'Ton în Apă', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'protein', servingSize: '100g' },
  { name: 'Creveți', calories: 99, protein: 24, carbs: 0, fat: 0.3, category: 'protein', servingSize: '100g' },
  { name: 'Brânză Cottage', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, category: 'dairy', servingSize: '100g' },
  { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fat: 1.5, category: 'protein', servingSize: '30g' },
  
  // Carbs
  { name: 'Orez Brun', calories: 216, protein: 4.5, carbs: 45, fat: 1.8, category: 'carb', servingSize: '100g gătit' },
  { name: 'Orez Alb', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'carb', servingSize: '100g gătit' },
  { name: 'Cartof Dulce', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'carb', servingSize: '100g' },
  { name: 'Cartofi Fierți', calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'carb', servingSize: '100g' },
  { name: 'Quinoa', calories: 222, protein: 8.1, carbs: 39, fat: 3.6, category: 'carb', servingSize: '100g gătit' },
  { name: 'Ovăz/Fulgi de Ovăz', calories: 68, protein: 2.5, carbs: 12, fat: 1.4, category: 'carb', servingSize: '100g gătit' },
  { name: 'Pâine Integrală', calories: 81, protein: 4.0, carbs: 13.8, fat: 1.1, category: 'carb', servingSize: '1 felie' },
  { name: 'Paste Integrale', calories: 174, protein: 7.5, carbs: 37, fat: 0.8, category: 'carb', servingSize: '100g gătit' },
  { name: 'Paste Normale', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, category: 'carb', servingSize: '100g gătit' },
  
  // Fats
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, category: 'fat', servingSize: '100g' },
  { name: 'Ulei de Măsline', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'fat', servingSize: '1 lingură' },
  { name: 'Migdale', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'fat', servingSize: '30g' },
  { name: 'Nuci', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, category: 'fat', servingSize: '30g' },
  { name: 'Unt de Arahide', calories: 188, protein: 8, carbs: 6, fat: 16, category: 'fat', servingSize: '2 linguri' },
  { name: 'Semințe de Chia', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, category: 'fat', servingSize: '30g' },
  
  // Vegetables
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, category: 'vegetable', servingSize: '100g' },
  { name: 'Spanac', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetable', servingSize: '100g' },
  { name: 'Kale', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, category: 'vegetable', servingSize: '100g' },
  { name: 'Roșii', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetable', servingSize: '100g' },
  { name: 'Castraveți', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, category: 'vegetable', servingSize: '100g' },
  { name: 'Ardei Gras', calories: 31, protein: 1, carbs: 6, fat: 0.3, category: 'vegetable', servingSize: '100g' },
  { name: 'Morcovi', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, category: 'vegetable', servingSize: '100g' },
  { name: 'Fasole Verde', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, category: 'vegetable', servingSize: '100g' },
  { name: 'Ciuperci', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, category: 'vegetable', servingSize: '100g' },
  
  // Fruits
  { name: 'Banană', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, category: 'fruit', servingSize: '1 medie' },
  { name: 'Măr', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, category: 'fruit', servingSize: '1 mediu' },
  { name: 'Afine', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, category: 'fruit', servingSize: '100g' },
  { name: 'Căpșuni', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, category: 'fruit', servingSize: '100g' },
  { name: 'Portocală', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, category: 'fruit', servingSize: '1 medie' },
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, category: 'fruit', servingSize: '1 mediu' },
  
  // Dairy
  { name: 'Lapte Integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, category: 'dairy', servingSize: '100ml' },
  { name: 'Lapte Degresat', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, category: 'dairy', servingSize: '100ml' },
  { name: 'Brânză Telemea', calories: 264, protein: 14, carbs: 1, fat: 22, category: 'dairy', servingSize: '50g' },
  { name: 'Brânză Cașcaval', calories: 350, protein: 25, carbs: 1.3, fat: 28, category: 'dairy', servingSize: '50g' },
  { name: 'Smântână', calories: 193, protein: 2.1, carbs: 3.4, fat: 19.4, category: 'dairy', servingSize: '50g' },
  
  // Beverages
  { name: 'Cafea Neagră', calories: 2, protein: 0.3, carbs: 0, fat: 0, category: 'beverage', servingSize: '250ml' },
  { name: 'Ceai Verde', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'beverage', servingSize: '250ml' },
  { name: 'Smoothie cu Fructe', calories: 150, protein: 2, carbs: 35, fat: 0.5, category: 'beverage', servingSize: '300ml' },
  { name: 'Protein Shake', calories: 200, protein: 30, carbs: 10, fat: 3, category: 'beverage', servingSize: '300ml' },
  
  // Common Romanian Meals
  { name: 'Ciorbă de Legume', calories: 80, protein: 2, carbs: 12, fat: 2, category: 'meal', servingSize: '300ml' },
  { name: 'Ciorbă de Pui', calories: 120, protein: 10, carbs: 8, fat: 5, category: 'meal', servingSize: '300ml' },
  { name: 'Salată Caesar', calories: 200, protein: 8, carbs: 10, fat: 14, category: 'meal', servingSize: 'porție' },
  { name: 'Omletă cu Legume', calories: 220, protein: 15, carbs: 5, fat: 16, category: 'meal', servingSize: '2 ouă' },
  { name: 'Mușchi de Porc la Grătar', calories: 180, protein: 25, carbs: 0, fat: 8, category: 'meal', servingSize: '150g' },
  { name: 'Piept de Pui la Grătar', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'meal', servingSize: '150g' },
  { name: 'Tocăniță de Pui', calories: 200, protein: 22, carbs: 8, fat: 9, category: 'meal', servingSize: 'porție' },
  { name: 'Paste cu Sos de Roșii', calories: 250, protein: 8, carbs: 45, fat: 5, category: 'meal', servingSize: 'porție' },
  { name: 'Sandviș cu Pui', calories: 350, protein: 25, carbs: 30, fat: 12, category: 'meal', servingSize: '1 sandviș' },
  { name: 'Wrap cu Pui și Legume', calories: 380, protein: 28, carbs: 35, fat: 14, category: 'meal', servingSize: '1 wrap' },
  
  // Snacks
  { name: 'Baton Proteic', calories: 200, protein: 20, carbs: 20, fat: 6, category: 'snack', servingSize: '1 baton' },
  { name: 'Iaurt cu Fructe', calories: 120, protein: 5, carbs: 20, fat: 2, category: 'snack', servingSize: '150g' },
  { name: 'Biscuiți Integrali', calories: 70, protein: 1, carbs: 11, fat: 2.5, category: 'snack', servingSize: '2 buc' },
  { name: 'Hummus cu Legume', calories: 150, protein: 5, carbs: 15, fat: 8, category: 'snack', servingSize: 'porție' },
];

export const foodCategories = [
  { value: 'all', label: 'Toate' },
  { value: 'protein', label: '🥩 Proteine' },
  { value: 'carb', label: '🍚 Carbohidrați' },
  { value: 'fat', label: '🥑 Grăsimi' },
  { value: 'vegetable', label: '🥦 Legume' },
  { value: 'fruit', label: '🍎 Fructe' },
  { value: 'dairy', label: '🥛 Lactate' },
  { value: 'beverage', label: '☕ Băuturi' },
  { value: 'meal', label: '🍽️ Mese Complete' },
  { value: 'snack', label: '🍪 Gustări' },
];

export const searchFoods = (query: string, category?: string): Food[] => {
  let filtered = foods;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(f => f.category === category);
  }
  
  if (query.trim()) {
    const searchLower = query.toLowerCase();
    filtered = filtered.filter(f => 
      f.name.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

export const getCompatibleFoods = (excludedFoods: string[], preferredFoods: string[]): Food[] => {
  return foods.filter(food => 
    !excludedFoods.some(excluded => 
      food.name.toLowerCase().includes(excluded.toLowerCase())
    )
  );
};
