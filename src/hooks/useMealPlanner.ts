
import { useState } from 'react';
import { WeeklyMealPlan } from '@/services/fitness/types/mealTypes';
import userPreferencesService from '@/services/fitness/userPreferencesService';
import { mealPlanService } from '@/services/fitness/mealPlanService';
import fitnessService from '@/services/fitness/fitnessService';

export const useMealPlanner = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState('day-1');
  const [preferences, setPreferences] = useState(userPreferencesService.getMealPreferences());
  const [userData, setUserData] = useState(userPreferencesService.getUserData());
  const [dietType, setDietType] = useState(userPreferencesService.getDietType());
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);

  const updatePreference = (field: keyof typeof preferences, value: any) => {
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);
    userPreferencesService.updateMealPreferences(updatedPreferences);
  };

  const generateMealPlan = () => {
    setIsGenerating(true);
    
    const calculationResults = fitnessService.calculateAll(userData, dietType);
    
    setTimeout(() => {
      try {
        const plan = mealPlanService.generateMealPlan(
          calculationResults.targetCalories,
          calculationResults.macros,
          preferences.mealsPerDay,
          preferences.excludedFoods,
          preferences.preferredFoods
        );
        
        setMealPlan(plan);
      } catch (error) {
        console.error('Error generating meal plan:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  return {
    isGenerating,
    activeDay,
    setActiveDay,
    preferences,
    updatePreference,
    mealPlan,
    setMealPlan,
    generateMealPlan
  };
};
