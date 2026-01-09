import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';

interface ProfileData {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: string | null;
}

interface ProfileStepProps {
  data: ProfileData;
  onChange: (data: Partial<ProfileData>) => void;
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentar', description: 'Puțină sau deloc mișcare' },
  { value: 'light', label: 'Activitate ușoară', description: '1-3 zile/săptămână' },
  { value: 'moderate', label: 'Activitate moderată', description: '3-5 zile/săptămână' },
  { value: 'active', label: 'Activ', description: '6-7 zile/săptămână' },
  { value: 'very_active', label: 'Foarte activ', description: 'Antrenament intens zilnic' },
];

export function ProfileStep({ data, onChange }: ProfileStepProps) {
  const [localData, setLocalData] = useState<ProfileData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: keyof ProfileData, value: string | number | null) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Profilul Tău</h2>
          <p className="text-muted-foreground text-sm">Date fizice pentru calcule personalizate</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Date Fizice</CardTitle>
            <CardDescription>Pentru calcule calorii și antrenamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Greutate (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="75"
                value={localData.weight_kg || ''}
                onChange={(e) => handleChange('weight_kg', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Înălțime (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={localData.height_cm || ''}
                onChange={(e) => handleChange('height_cm', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Vârstă</Label>
              <Input
                id="age"
                type="number"
                placeholder="30"
                value={localData.age || ''}
                onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nivel Activitate</CardTitle>
            <CardDescription>Cât de activ ești în mod normal?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={localData.activity_level || ''}
              onValueChange={(value) => handleChange('activity_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează nivelul" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <span className="font-medium">{level.label}</span>
                      <span className="text-muted-foreground ml-2">- {level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">De ce avem nevoie de aceste date?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Calculul caloriilor zilnice necesare</li>
                <li>• Personalizarea antrenamentelor</li>
                <li>• Recomandări nutriționale precise</li>
                <li>• Progresul în timp</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
