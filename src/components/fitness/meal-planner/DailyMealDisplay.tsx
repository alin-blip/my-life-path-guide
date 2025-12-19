
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyMealPlan } from '@/services/fitness/types/mealTypes';
import { useLanguage } from '@/context/LanguageContext';

interface DailyMealDisplayProps {
  day: DailyMealPlan;
}

export function DailyMealDisplay({ day }: DailyMealDisplayProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full pb-2 border-b border-border/20">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('totalCalories')}: {Math.round(day.totalCalories)}</h3>
            <div className="flex space-x-4">
              <p>{Math.round(day.totalMacros.protein)}g {t('protein')}</p>
              <p>{Math.round(day.totalMacros.carbs)}g {t('carbs')}</p>
              <p>{Math.round(day.totalMacros.fat)}g {t('fat')}</p>
            </div>
          </div>
        </div>
        
        {day.meals.map((meal, index) => (
          <Card key={`meal-${index}`} className="bg-card border-border/10">
            <CardHeader className="pb-2">
              <CardTitle>{t(meal.name.toLowerCase())}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {Math.round(meal.totalCalories)} {t('caloriesPerDay')}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {meal.foods.map((foodItem, foodIndex) => (
                  <li key={`food-${foodIndex}`} className="flex justify-between items-center">
                    <span>{foodItem.food.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {foodItem.amount}g
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-2 border-t border-border/10 text-xs flex justify-between">
                <span>P: {Math.round(meal.totalMacros.protein)}g</span>
                <span>C: {Math.round(meal.totalMacros.carbs)}g</span>
                <span>F: {Math.round(meal.totalMacros.fat)}g</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
