import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Apple, Calculator } from 'lucide-react';

interface NutritionData {
  calorie_target: number | null;
  protein_target: number | null;
  protein_percent: number | null;
  carbs_target: number | null;
  carbs_percent: number | null;
  fats_target: number | null;
  fats_percent: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: string | null;
}

interface NutritionStepProps {
  data: NutritionData;
  onChange: (data: Partial<NutritionData>) => void;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function NutritionStep({ data, onChange }: NutritionStepProps) {
  const [localData, setLocalData] = useState<NutritionData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Calculate BMR using Mifflin-St Jeor
  const calculateCalories = () => {
    const { weight_kg, height_cm, age, activity_level } = localData;
    if (!weight_kg || !height_cm || !age) return null;

    // Assume male for simplicity - could add gender field
    const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    const multiplier = ACTIVITY_MULTIPLIERS[activity_level || 'moderate'] || 1.55;
    return Math.round(bmr * multiplier);
  };

  const suggestedCalories = calculateCalories();

  const handleChange = (field: keyof NutritionData, value: number | null) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange({ [field]: value });
  };

  const handleMacroPercentChange = (macro: 'protein' | 'carbs' | 'fats', percent: number) => {
    const calories = localData.calorie_target || suggestedCalories || 2000;
    let grams = 0;
    
    if (macro === 'protein' || macro === 'carbs') {
      grams = Math.round((calories * (percent / 100)) / 4);
    } else {
      grams = Math.round((calories * (percent / 100)) / 9);
    }

    const updates: Partial<NutritionData> = {
      [`${macro}_percent`]: percent,
      [`${macro}_target`]: grams,
    };
    
    setLocalData(prev => ({ ...prev, ...updates }));
    onChange(updates);
  };

  const applyAutoCalories = () => {
    if (suggestedCalories) {
      handleChange('calorie_target', suggestedCalories);
      
      // Set default macro split: 30% protein, 40% carbs, 30% fats
      const proteinGrams = Math.round((suggestedCalories * 0.30) / 4);
      const carbsGrams = Math.round((suggestedCalories * 0.40) / 4);
      const fatsGrams = Math.round((suggestedCalories * 0.30) / 9);

      const updates: Partial<NutritionData> = {
        calorie_target: suggestedCalories,
        protein_percent: 30,
        protein_target: proteinGrams,
        carbs_percent: 40,
        carbs_target: carbsGrams,
        fats_percent: 30,
        fats_target: fatsGrams,
      };
      
      setLocalData(prev => ({ ...prev, ...updates }));
      onChange(updates);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
          <Apple className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Obiective Nutriționale</h2>
          <p className="text-muted-foreground text-sm">Setează-ți țintele pentru calorii și macronutrienți</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calorii Zilnice
            </CardTitle>
            <CardDescription>
              {suggestedCalories 
                ? `Recomandat: ${suggestedCalories} kcal bazat pe datele tale`
                : 'Completează profilul pentru calcul automat'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Țintă calorii (kcal)</Label>
              <div className="flex gap-2">
                <Input
                  id="calories"
                  type="number"
                  placeholder="2000"
                  value={localData.calorie_target || ''}
                  onChange={(e) => handleChange('calorie_target', e.target.value ? Number(e.target.value) : null)}
                />
                {suggestedCalories && (
                  <button
                    onClick={applyAutoCalories}
                    className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
                  >
                    Auto-calculează
                  </button>
                )}
              </div>
            </div>

            {localData.calorie_target && (
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <span className="text-2xl font-bold text-green-600">{localData.calorie_target}</span>
                <span className="text-muted-foreground ml-1">kcal/zi</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Macronutrienți</CardTitle>
            <CardDescription>Distribuția procentuală</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-blue-600">Proteine</span>
                <span>{localData.protein_percent || 30}% ({localData.protein_target || 0}g)</span>
              </div>
              <Slider
                value={[localData.protein_percent || 30]}
                onValueChange={([val]) => handleMacroPercentChange('protein', val)}
                min={10}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-blue-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-amber-600">Carbohidrați</span>
                <span>{localData.carbs_percent || 40}% ({localData.carbs_target || 0}g)</span>
              </div>
              <Slider
                value={[localData.carbs_percent || 40]}
                onValueChange={([val]) => handleMacroPercentChange('carbs', val)}
                min={10}
                max={60}
                step={5}
                className="[&_[role=slider]]:bg-amber-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-rose-600">Grăsimi</span>
                <span>{localData.fats_percent || 30}% ({localData.fats_target || 0}g)</span>
              </div>
              <Slider
                value={[localData.fats_percent || 30]}
                onValueChange={([val]) => handleMacroPercentChange('fats', val)}
                min={15}
                max={45}
                step={5}
                className="[&_[role=slider]]:bg-rose-500"
              />
            </div>

            <div className="text-xs text-muted-foreground text-center mt-2">
              Total: {(localData.protein_percent || 30) + (localData.carbs_percent || 40) + (localData.fats_percent || 30)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
