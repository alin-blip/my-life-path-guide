
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
      <CardContent className="p-6">
        <Tabs defaultValue="calorie-calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-warrior-dark">
            <TabsTrigger value="calorie-calculator" className="data-[state=active]:bg-warrior-accent">
              <Weight className="mr-2 h-4 w-4" />
              <span>{t('calorieCalculator')}</span>
            </TabsTrigger>
            <TabsTrigger value="meal-planner" className="data-[state=active]:bg-warrior-accent">
              <Utensils className="mr-2 h-4 w-4" />
              <span>{t('mealPlanner')}</span>
            </TabsTrigger>
            <TabsTrigger value="workout-generator" className="data-[state=active]:bg-warrior-accent">
              <Dumbbell className="mr-2 h-4 w-4" />
              <span>{t('workoutGenerator')}</span>
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
