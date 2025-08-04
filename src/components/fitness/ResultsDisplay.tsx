
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CalculationResults } from '@/services/fitness/fitnessService';
import { MacronutrientChart } from './MacronutrientChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Flag, Calculator, ArrowUp } from 'lucide-react';

interface ResultsDisplayProps {
  results: CalculationResults;
  onReset: () => void;
}

export function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 sm:space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">{t('yourResults')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
        {/* Target Calories Card */}
        <Card className="bg-gradient-to-br from-warrior-purple-light to-warrior-purple shadow-lg border-0">
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-1 sm:gap-2">
              <Flag className="w-3 h-3 sm:w-5 sm:h-5" />
              {t('targetCalories')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-2xl sm:text-4xl font-bold mb-1">{results.targetCalories}</div>
            <div className="text-xs sm:text-sm opacity-90">{t('caloriesPerDay')}</div>
          </CardContent>
        </Card>

        {/* BMR Card */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-1 sm:gap-2">
              <Activity className="w-3 h-3 sm:w-5 sm:h-5" />
              {t('bmr')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold mb-1">{results.bmr}</div>
            <div className="text-xs sm:text-sm opacity-75">{t('caloriesPerDay')}</div>
          </CardContent>
        </Card>

        {/* TDEE Card */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-1 sm:gap-2">
              <Calculator className="w-3 h-3 sm:w-5 sm:h-5" />
              {t('tdee')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold mb-1">{results.tdee}</div>
            <div className="text-xs sm:text-sm opacity-75">{t('caloriesPerDay')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrients Section */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">{t('macronutrients')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <MacronutrientChart macros={results.macros} />
        </CardContent>
      </Card>

      {/* Body Composition Section */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">{t('bodyComposition')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            {/* BMI Info */}
            <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">{t('bmi')}</h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="text-xl sm:text-3xl font-bold">{results.bmi.toFixed(1)}</div>
                <div className="text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-full bg-gray-700 inline-block w-fit">
                  {t(results.bmiCategory)}
                </div>
              </div>
            </div>
            
            {/* Ideal Weight Range */}
            <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">{t('idealWeight')}</h4>
              <div className="text-lg sm:text-3xl font-bold">
                {results.idealWeightRange.minWeight} - {results.idealWeightRange.maxWeight} kg
              </div>
              <div className="text-xs sm:text-sm opacity-75 mt-1">
                {t('healthyRange')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onReset}
        className="w-full h-9 sm:h-10"
        variant="outline"
      >
        <ArrowUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        {t('recalculate')}
      </Button>
    </div>
  );
}
