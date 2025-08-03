
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { PreferencesForm } from './meal-planner/PreferencesForm';
import { DailyMealDisplay } from './meal-planner/DailyMealDisplay';
import { useMealPlanner } from '@/hooks/useMealPlanner';
import userPreferencesService from '@/services/fitness/userPreferencesService';

export function MealPlanner() {
  const { t } = useLanguage();
  const {
    isGenerating,
    activeDay,
    setActiveDay,
    preferences,
    updatePreference,
    mealPlan,
    setMealPlan,
    generateMealPlan
  } = useMealPlanner();
  
  useEffect(() => {
    // Load latest userData whenever component mounts
    const latestUserData = userPreferencesService.getUserData();
    const latestDietType = userPreferencesService.getDietType();
  }, []);

  return (
    <div className="space-y-6">
      {!mealPlan ? (
        <div className="space-y-6">
          <PreferencesForm 
            preferences={preferences}
            onUpdatePreference={updatePreference}
          />
          
          <Button 
            onClick={generateMealPlan} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loadingMealPlan')}
              </>
            ) : (
              t('generatePlan')
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {t('targetCalories')}: {mealPlan.targetCalories} {t('caloriesPerDay')}
            </h2>
            <Button variant="outline" onClick={() => setMealPlan(null)}>
              {t('recalculate')}
            </Button>
          </div>
          
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="grid grid-cols-7">
              {mealPlan.days.map((_, index) => (
                <TabsTrigger 
                  key={`day-${index + 1}`} 
                  value={`day-${index + 1}`}
                  className="data-[state=active]:bg-warrior-accent"
                >
                  {t('day')} {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {mealPlan.days.map((dailyPlan, index) => (
              <TabsContent key={`day-content-${index + 1}`} value={`day-${index + 1}`} className="mt-4">
                <DailyMealDisplay day={dailyPlan} />
              </TabsContent>
            ))}
          </Tabs>
          
          <Button className="w-full">
            {t('save')} {t('mealPlanner')}
          </Button>
        </div>
      )}
    </div>
  );
}
