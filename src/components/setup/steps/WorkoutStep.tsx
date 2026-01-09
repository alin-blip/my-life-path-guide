import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dumbbell, Home, TreePine, Target, Flame, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutData {
  workout_goal: string | null;
  workout_level: string | null;
  workout_location: string | null;
  workout_days_per_week: number | null;
  workout_target_groups: string[];
}

interface WorkoutStepProps {
  data: WorkoutData;
  onChange: (data: Partial<WorkoutData>) => void;
}

const GOALS = [
  { value: 'muscle', label: 'Masă Musculară', icon: Dumbbell, color: 'text-blue-500' },
  { value: 'fat_loss', label: 'Slăbire', icon: Flame, color: 'text-orange-500' },
  { value: 'strength', label: 'Forță', icon: Zap, color: 'text-purple-500' },
  { value: 'cardio', label: 'Cardio/Rezistență', icon: Heart, color: 'text-red-500' },
];

const LEVELS = [
  { value: 'beginner', label: 'Începător', description: '< 6 luni experiență' },
  { value: 'intermediate', label: 'Intermediar', description: '6 luni - 2 ani' },
  { value: 'advanced', label: 'Avansat', description: '> 2 ani experiență' },
];

const LOCATIONS = [
  { value: 'gym', label: 'Sală', icon: Dumbbell },
  { value: 'home', label: 'Acasă', icon: Home },
  { value: 'outdoor', label: 'Aer liber', icon: TreePine },
];

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Piept' },
  { value: 'back', label: 'Spate' },
  { value: 'shoulders', label: 'Umeri' },
  { value: 'arms', label: 'Brațe' },
  { value: 'legs', label: 'Picioare' },
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Fesieri' },
];

export function WorkoutStep({ data, onChange }: WorkoutStepProps) {
  const [localData, setLocalData] = useState<WorkoutData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = <K extends keyof WorkoutData>(field: K, value: WorkoutData[K]) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange({ [field]: value });
  };

  const toggleMuscleGroup = (group: string) => {
    const current = localData.workout_target_groups || [];
    const updated = current.includes(group)
      ? current.filter(g => g !== group)
      : [...current, group];
    handleChange('workout_target_groups', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Preferințe Antrenament</h2>
          <p className="text-muted-foreground text-sm">Personalizează-ți programul de fitness</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Obiectiv Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localData.workout_goal || ''}
              onValueChange={(value) => handleChange('workout_goal', value)}
              className="grid grid-cols-2 gap-3"
            >
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = localData.workout_goal === goal.value;
                return (
                  <Label
                    key={goal.value}
                    htmlFor={`goal-${goal.value}`}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={goal.value} id={`goal-${goal.value}`} className="sr-only" />
                    <Icon className={cn("w-6 h-6", goal.color)} />
                    <span className="text-sm font-medium text-center">{goal.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nivel Fitness</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localData.workout_level || ''}
              onValueChange={(value) => handleChange('workout_level', value)}
              className="space-y-3"
            >
              {LEVELS.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={`level-${level.value}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    localData.workout_level === level.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={level.value} id={`level-${level.value}`} />
                  <div>
                    <span className="font-medium">{level.label}</span>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Locație Antrenament</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localData.workout_location || ''}
              onValueChange={(value) => handleChange('workout_location', value)}
              className="flex gap-3"
            >
              {LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const isSelected = localData.workout_location === loc.value;
                return (
                  <Label
                    key={loc.value}
                    htmlFor={`loc-${loc.value}`}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={loc.value} id={`loc-${loc.value}`} className="sr-only" />
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{loc.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Zile pe Săptămână</CardTitle>
            <CardDescription>Câte zile poți antrena?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={[localData.workout_days_per_week || 4]}
              onValueChange={([val]) => handleChange('workout_days_per_week', val)}
              min={1}
              max={7}
              step={1}
            />
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{localData.workout_days_per_week || 4}</span>
              <span className="text-muted-foreground ml-2">zile</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Grupe Musculare Prioritare</CardTitle>
          <CardDescription>Selectează grupele pe care vrei să le accentuezi (opțional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((group) => {
              const isSelected = (localData.workout_target_groups || []).includes(group.value);
              return (
                <Label
                  key={group.value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMuscleGroup(group.value)}
                    className="sr-only"
                  />
                  {group.label}
                </Label>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
