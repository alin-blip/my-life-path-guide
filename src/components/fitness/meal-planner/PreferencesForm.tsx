
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { UserPreferences } from '@/services/fitness/userPreferencesService';

interface PreferencesFormProps {
  preferences: UserPreferences['mealPreferences'];
  onUpdatePreference: (field: keyof UserPreferences['mealPreferences'], value: any) => void;
}

export function PreferencesForm({ preferences, onUpdatePreference }: PreferencesFormProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">{t('mealsPerDay')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <Select 
            value={preferences.mealsPerDay.toString()} 
            onValueChange={(value) => onUpdatePreference('mealsPerDay', parseInt(value))}
          >
            <SelectTrigger className="h-8 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">{t('excludedFoods')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="flex space-x-2">
            <Input 
              placeholder={t('excludedFoods')}
              value={preferences.excludedFoods.join(', ')}
              onChange={(e) => {
                const foods = e.target.value.split(',').map(food => food.trim());
                onUpdatePreference('excludedFoods', foods);
              }}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
            Separate with commas (e.g. "peanuts, dairy, eggs")
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">{t('preferredFoods')}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="flex space-x-2">
            <Input 
              placeholder={t('preferredFoods')}
              value={preferences.preferredFoods.join(', ')}
              onChange={(e) => {
                const foods = e.target.value.split(',').map(food => food.trim());
                onUpdatePreference('preferredFoods', foods);
              }}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
            Separate with commas (e.g. "chicken, rice, avocado")
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
