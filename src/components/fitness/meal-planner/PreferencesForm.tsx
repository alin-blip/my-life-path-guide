
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('mealsPerDay')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={preferences.mealsPerDay.toString()} 
            onValueChange={(value) => onUpdatePreference('mealsPerDay', parseInt(value))}
          >
            <SelectTrigger>
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
        <CardHeader>
          <CardTitle>{t('excludedFoods')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder={t('excludedFoods')}
              value={preferences.excludedFoods.join(', ')}
              onChange={(e) => {
                const foods = e.target.value.split(',').map(food => food.trim());
                onUpdatePreference('excludedFoods', foods);
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Separate with commas (e.g. "peanuts, dairy, eggs")
          </p>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t('preferredFoods')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder={t('preferredFoods')}
              value={preferences.preferredFoods.join(', ')}
              onChange={(e) => {
                const foods = e.target.value.split(',').map(food => food.trim());
                onUpdatePreference('preferredFoods', foods);
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Separate with commas (e.g. "chicken, rice, avocado")
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
