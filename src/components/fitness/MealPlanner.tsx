
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
    <div className="space-y-3 sm:space-y-6">
      {!mealPlan ? (
        <div className="space-y-3 sm:space-y-6">
          <PreferencesForm 
            preferences={preferences}
            onUpdatePreference={updatePreference}
          />
          
          <Button 
            onClick={generateMealPlan} 
            className="w-full h-9 sm:h-10"
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
        <div className="space-y-3 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
              {t('targetCalories')}: {mealPlan.targetCalories} {t('caloriesPerDay')}
            </h2>
            <Button variant="outline" onClick={() => setMealPlan(null)} className="h-8 sm:h-10 text-xs sm:text-sm">
              {t('recalculate')}
            </Button>
          </div>
          
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="grid grid-cols-7 h-8 sm:h-10 overflow-x-auto">
              {mealPlan.days.map((_, index) => (
                <TabsTrigger 
                  key={`day-${index + 1}`} 
                  value={`day-${index + 1}`}
                  className="data-[state=active]:bg-warrior-accent text-xs sm:text-sm min-w-0"
                >
                  <span className="hidden sm:inline">{t('day')} {index + 1}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {mealPlan.days.map((dailyPlan, index) => (
              <TabsContent key={`day-content-${index + 1}`} value={`day-${index + 1}`} className="mt-4">
                <DailyMealDisplay day={dailyPlan} />
              </TabsContent>
            ))}
          </Tabs>
          
          <Button className="w-full h-9 sm:h-10">
            {t('save')} {t('mealPlanner')}
          </Button>
        </div>
      )}
    </div>
  );
}
