
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalorieCalculator } from './CalorieCalculator';
import { MealPlanner } from './MealPlanner';
import { WorkoutGenerator } from './WorkoutGenerator';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Weight, Utensils, Dumbbell } from 'lucide-react';

export function FitnessHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('calorie-calculator');

  return (
    <Card className="bg-warrior-DEFAULT border-warrior-muted/20">
      <CardContent className="p-3 sm:p-6">
        <Tabs defaultValue="calorie-calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 mb-3 sm:mb-6 bg-warrior-dark gap-1 sm:gap-0">
            <TabsTrigger value="calorie-calculator" className="data-[state=active]:bg-warrior-accent text-xs sm:text-sm">
              <Weight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('calorieCalculator')}</span>
              <span className="sm:hidden">Calories</span>
            </TabsTrigger>
            <TabsTrigger value="meal-planner" className="data-[state=active]:bg-warrior-accent text-xs sm:text-sm">
              <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('mealPlanner')}</span>
              <span className="sm:hidden">Meals</span>
            </TabsTrigger>
            <TabsTrigger value="workout-generator" className="data-[state=active]:bg-warrior-accent text-xs sm:text-sm">
              <Dumbbell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('workoutGenerator')}</span>
              <span className="sm:hidden">Workout</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calorie-calculator" className="mt-0">
            <CalorieCalculator />
          </TabsContent>
          
          <TabsContent value="meal-planner" className="mt-0">
            <MealPlanner />
          </TabsContent>
          
          <TabsContent value="workout-generator" className="mt-0">
            <WorkoutGenerator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
