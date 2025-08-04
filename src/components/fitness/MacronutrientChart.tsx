
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MacroNutrients } from '@/services/fitness/fitnessService';

interface MacronutrientChartProps {
  macros: MacroNutrients;
}

export function MacronutrientChart({ macros }: MacronutrientChartProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Protein Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>{t('protein')}</span>
          <span>{macros.protein.grams}g ({Math.round(macros.protein.percentage)}%)</span>
        </div>
        <div className="h-2 sm:h-2.5 rounded-full bg-gray-700">
          <div 
            className="h-full rounded-full bg-purple-500"
            style={{ width: `${macros.protein.percentage}%` }}
          />
        </div>
      </div>

      {/* Carbs Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>{t('carbs')}</span>
          <span>{macros.carbs.grams}g ({Math.round(macros.carbs.percentage)}%)</span>
        </div>
        <div className="h-2 sm:h-2.5 rounded-full bg-gray-700">
          <div 
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${macros.carbs.percentage}%` }}
          />
        </div>
      </div>

      {/* Fat Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>{t('fat')}</span>
          <span>{macros.fat.grams}g ({Math.round(macros.fat.percentage)}%)</span>
        </div>
        <div className="h-2 sm:h-2.5 rounded-full bg-gray-700">
          <div 
            className="h-full rounded-full bg-orange-500"
            style={{ width: `${macros.fat.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
