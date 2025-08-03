
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { UserData } from '@/services/fitness/fitnessService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface UserDataFormProps {
  userData: UserData;
  dietType: string;
  onChange: (field: keyof UserData, value: any) => void;
  onDietTypeChange: (value: string) => void;
  onSubmit: () => void;
}

export function UserDataForm({ 
  userData, 
  dietType, 
  onChange, 
  onDietTypeChange, 
  onSubmit 
}: UserDataFormProps) {
  const { t, language } = useLanguage();

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Selection */}
        <div className="space-y-2">
          <Label htmlFor="gender">{t('gender')}</Label>
          <Select 
            value={userData.gender} 
            onValueChange={(value: 'male' | 'female') => onChange('gender', value)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder={t('selectGender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('male')}</SelectItem>
              <SelectItem value="female">{t('female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Input */}
        <div className="space-y-2">
          <Label htmlFor="age">{t('age')}</Label>
          <Input
            id="age"
            type="number"
            value={userData.age}
            onChange={(e) => onChange('age', parseInt(e.target.value))}
            min={18}
            max={100}
            required
          />
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight">{t('weight')} (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={userData.weight}
            onChange={(e) => onChange('weight', parseFloat(e.target.value))}
            min={30}
            max={300}
            step={0.1}
            required
          />
        </div>

        {/* Height Input */}
        <div className="space-y-2">
          <Label htmlFor="height">{t('height')} (cm)</Label>
          <Input
            id="height"
            type="number"
            value={userData.height}
            onChange={(e) => onChange('height', parseInt(e.target.value))}
            min={100}
            max={250}
            required
          />
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activityLevel">{t('activityLevel')}</Label>
          <Select 
            value={userData.activityLevel} 
            onValueChange={(value: UserData['activityLevel']) => onChange('activityLevel', value)}
          >
            <SelectTrigger id="activityLevel">
              <SelectValue placeholder={t('selectActivityLevel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">{t('sedentary')}</SelectItem>
              <SelectItem value="light">{t('light')}</SelectItem>
              <SelectItem value="moderate">{t('moderate')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="very_active">{t('veryActive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <Label htmlFor="goal">{t('goal')}</Label>
          <Select 
            value={userData.goal} 
            onValueChange={(value: UserData['goal']) => onChange('goal', value)}
          >
            <SelectTrigger id="goal">
              <SelectValue placeholder={t('selectGoal')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose_weight">{t('loseWeight')}</SelectItem>
              <SelectItem value="maintain">{t('maintain')}</SelectItem>
              <SelectItem value="gain_muscle">{t('gainMuscle')}</SelectItem>
              <SelectItem value="reduce_cellulite">{t('reduceCellulite')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Diet Type */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="dietType">{t('dietType')}</Label>
          <Select 
            value={dietType} 
            onValueChange={onDietTypeChange}
          >
            <SelectTrigger id="dietType">
              <SelectValue placeholder={t('selectDietType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">{t('balanced')}</SelectItem>
              <SelectItem value="low_carb">{t('lowCarb')}</SelectItem>
              <SelectItem value="high_protein">{t('highProtein')}</SelectItem>
              <SelectItem value="keto">{t('keto')}</SelectItem>
              <SelectItem value="mediterranean">{t('mediterranean')}</SelectItem>
              <SelectItem value="vegan">{t('vegan')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">{t('calculate')}</Button>
    </form>
  );
}
