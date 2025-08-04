
import React, { useState, useEffect } from 'react';
import { UserDataForm } from './UserDataForm';
import { ResultsDisplay } from './ResultsDisplay';
import fitnessService, { UserData, CalculationResults } from '@/services/fitness/fitnessService';
import userPreferencesService from '@/services/fitness/userPreferencesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

export function CalorieCalculator() {
  const { t } = useLanguage();
  const [userData, setUserData] = useState<UserData>(userPreferencesService.getUserData());
  const [dietType, setDietType] = useState(userPreferencesService.getDietType());
  const [results, setResults] = useState<CalculationResults | null>(() => {
    // Calculate initial results if we have saved data
    if (userData) {
      return fitnessService.calculateAll(userData, dietType);
    }
    return null;
  });

  // Update preferences whenever userData or dietType changes
  useEffect(() => {
    userPreferencesService.updateUserData(userData);
  }, [userData]);

  useEffect(() => {
    userPreferencesService.updateDietType(dietType);
  }, [dietType]);

  const handleUserDataChange = (field: keyof UserData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDietTypeChange = (value: string) => {
    setDietType(value);
  };

  const calculateResults = () => {
    const calculationResults = fitnessService.calculateAll(userData, dietType);
    setResults(calculationResults);
  };

  const resetCalculator = () => {
    setResults(null);
  };

  return (
    <Card className="w-full max-w-full">
      <CardHeader className="text-center p-3 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">{t('calorieCalculator')}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {!results ? (
          <UserDataForm
            userData={userData}
            dietType={dietType}
            onChange={handleUserDataChange}
            onDietTypeChange={handleDietTypeChange}
            onSubmit={calculateResults}
          />
        ) : (
          <ResultsDisplay
            results={results}
            onReset={resetCalculator}
          />
        )}
      </CardContent>
    </Card>
  );
}
