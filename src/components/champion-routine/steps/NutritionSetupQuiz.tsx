import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { UtensilsCrossed, ArrowRight, ArrowLeft, Calculator, Check } from 'lucide-react';

export interface NutritionSettings {
  weight_kg: number;
  height_cm: number;
  age: number;
  activity_level: string;
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fats_target: number;
  protein_percent: number;
  carbs_percent: number;
  fats_percent: number;
}

interface NutritionSetupQuizProps {
  onComplete: (settings: NutritionSettings) => void;
  initialSettings?: Partial<NutritionSettings>;
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentar', description: 'Foarte puțină mișcare', multiplier: 1.2 },
  { value: 'light', label: 'Ușor Activ', description: 'Mișcare ușoară 1-3 zile/săpt', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderat Activ', description: 'Activitate moderată 3-5 zile/săpt', multiplier: 1.55 },
  { value: 'active', label: 'Activ', description: 'Antrenamente intense 6-7 zile/săpt', multiplier: 1.725 },
  { value: 'very_active', label: 'Foarte Activ', description: 'Antrenamente foarte intense zilnic', multiplier: 1.9 },
];

export function NutritionSetupQuiz({ onComplete, initialSettings }: NutritionSetupQuizProps) {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(initialSettings?.weight_kg?.toString() || '');
  const [height, setHeight] = useState(initialSettings?.height_cm?.toString() || '');
  const [age, setAge] = useState(initialSettings?.age?.toString() || '');
  const [activityLevel, setActivityLevel] = useState(initialSettings?.activity_level || 'moderate');
  const [calculatedCalories, setCalculatedCalories] = useState(initialSettings?.calorie_target || 2000);
  const [proteinPercent, setProteinPercent] = useState(initialSettings?.protein_percent || 30);
  const [carbsPercent, setCarbsPercent] = useState(initialSettings?.carbs_percent || 50);
  const [fatsPercent, setFatsPercent] = useState(initialSettings?.fats_percent || 20);

  // Mifflin-St Jeor Formula
  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a) return 2000;
    // BMR for men (simplified, assuming male for now)
    return Math.round((10 * w) + (6.25 * h) - (5 * a) + 5);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityData = ACTIVITY_LEVELS.find(l => l.value === activityLevel);
    return Math.round(bmr * (activityData?.multiplier || 1.55));
  };

  const handleCalculate = () => {
    const tdee = calculateTDEE();
    setCalculatedCalories(tdee);
    setStep(3);
  };

  const calculateMacros = () => {
    const proteinGrams = Math.round((calculatedCalories * proteinPercent / 100) / 4);
    const carbsGrams = Math.round((calculatedCalories * carbsPercent / 100) / 4);
    const fatsGrams = Math.round((calculatedCalories * fatsPercent / 100) / 9);
    return { proteinGrams, carbsGrams, fatsGrams };
  };

  const handleComplete = () => {
    const macros = calculateMacros();
    onComplete({
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      age: parseInt(age),
      activity_level: activityLevel,
      calorie_target: calculatedCalories,
      protein_target: macros.proteinGrams,
      carbs_target: macros.carbsGrams,
      fats_target: macros.fatsGrams,
      protein_percent: proteinPercent,
      carbs_percent: carbsPercent,
      fats_percent: fatsPercent,
    });
  };

  const adjustPercentage = (type: 'protein' | 'carbs' | 'fats', value: number) => {
    const total = proteinPercent + carbsPercent + fatsPercent;
    const diff = value - (type === 'protein' ? proteinPercent : type === 'carbs' ? carbsPercent : fatsPercent);
    
    if (type === 'protein') {
      setProteinPercent(value);
      // Adjust others proportionally
      const remaining = 100 - value;
      const otherTotal = carbsPercent + fatsPercent;
      if (otherTotal > 0) {
        setCarbsPercent(Math.round(carbsPercent / otherTotal * remaining));
        setFatsPercent(Math.round(fatsPercent / otherTotal * remaining));
      }
    } else if (type === 'carbs') {
      setCarbsPercent(value);
      const remaining = 100 - value;
      const otherTotal = proteinPercent + fatsPercent;
      if (otherTotal > 0) {
        setProteinPercent(Math.round(proteinPercent / otherTotal * remaining));
        setFatsPercent(Math.round(fatsPercent / otherTotal * remaining));
      }
    } else {
      setFatsPercent(value);
      const remaining = 100 - value;
      const otherTotal = proteinPercent + carbsPercent;
      if (otherTotal > 0) {
        setProteinPercent(Math.round(proteinPercent / otherTotal * remaining));
        setCarbsPercent(Math.round(carbsPercent / otherTotal * remaining));
      }
    }
  };

  const macros = calculateMacros();
  const canProceedStep1 = weight && height && age;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
            <UtensilsCrossed className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Configurare Nutriție</h1>
          <p className="text-muted-foreground">
            Pas {step} din 3 - {step === 1 ? 'Date Personale' : step === 2 ? 'Nivel Activitate' : 'Calorii și Macronutrienți'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal Data */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Greutate (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Înălțime (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Vârstă (ani)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              size="lg"
              className="w-full gap-2"
            >
              Continuă
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Activity Level */}
        {step === 2 && (
          <div className="space-y-6">
            <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      activityLevel === level.value
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setActivityLevel(level.value)}
                  >
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div className="flex-1">
                      <Label htmlFor={level.value} className="font-medium cursor-pointer">
                        {level.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Înapoi
              </Button>
              <Button onClick={handleCalculate} size="lg" className="flex-1 gap-2">
                <Calculator className="h-4 w-4" />
                Calculează
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Calories & Macros */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Calorie Target */}
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Calorii Zilnice</span>
                <span className="text-sm text-muted-foreground">Recomandat: {calculateTDEE()} kcal</span>
              </div>
              <Input
                type="number"
                value={calculatedCalories}
                onChange={(e) => setCalculatedCalories(parseInt(e.target.value) || 2000)}
                className="text-2xl font-bold text-center h-14"
              />
            </div>

            {/* Macros */}
            <div className="space-y-4">
              <h3 className="font-medium">Macronutrienți</h3>
              
              {/* Protein */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-red-500 font-medium">Proteine</span>
                  <span>{proteinPercent}% • {macros.proteinGrams}g</span>
                </div>
                <Slider
                  value={[proteinPercent]}
                  onValueChange={([v]) => adjustPercentage('protein', v)}
                  min={10}
                  max={50}
                  step={5}
                  className="[&>span:first-child>span]:bg-red-500"
                />
              </div>

              {/* Carbs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-500 font-medium">Carbohidrați</span>
                  <span>{carbsPercent}% • {macros.carbsGrams}g</span>
                </div>
                <Slider
                  value={[carbsPercent]}
                  onValueChange={([v]) => adjustPercentage('carbs', v)}
                  min={10}
                  max={60}
                  step={5}
                  className="[&>span:first-child>span]:bg-blue-500"
                />
              </div>

              {/* Fats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500 font-medium">Grăsimi</span>
                  <span>{fatsPercent}% • {macros.fatsGrams}g</span>
                </div>
                <Slider
                  value={[fatsPercent]}
                  onValueChange={([v]) => adjustPercentage('fats', v)}
                  min={10}
                  max={50}
                  step={5}
                  className="[&>span:first-child>span]:bg-yellow-500"
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-muted/30 border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-500">{macros.proteinGrams}g</div>
                    <div className="text-xs text-muted-foreground">Proteine</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{macros.carbsGrams}g</div>
                    <div className="text-xs text-muted-foreground">Carbohidrați</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">{macros.fatsGrams}g</div>
                    <div className="text-xs text-muted-foreground">Grăsimi</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Înapoi
              </Button>
              <Button onClick={handleComplete} size="lg" className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4" />
                Salvează
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
