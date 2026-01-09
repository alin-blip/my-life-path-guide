import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Brain, Timer, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutosuggestionData {
  default_autosuggestion: string | null;
  meditation_default_mode: string | null;
  meditation_default_duration: number | null;
  binaural_enabled: boolean;
  binaural_default_type: string | null;
}

interface AutosuggestionStepProps {
  data: AutosuggestionData;
  onChange: (data: Partial<AutosuggestionData>) => void;
}

const DEFAULT_AFFIRMATION = `Sunt sănătos, puternic și plin de energie.
Îmi ating toate obiectivele cu ușurință și determinare.
Atrag abundență și succes în viața mea.
Sunt recunoscător pentru tot ce am și tot ce urmează să primesc.
Astăzi este o zi minunată, plină de oportunități.`;

const MEDITATION_MODES = [
  { value: 'timer', label: 'Timer Simplu', description: 'Meditație în liniște cu timer' },
  { value: 'guided', label: 'Ghidată', description: 'Meditație cu instrucțiuni audio' },
];

const BINAURAL_TYPES = [
  { value: 'delta', label: 'Delta (0.5-4 Hz)', description: 'Somn profund, regenerare' },
  { value: 'theta', label: 'Theta (4-8 Hz)', description: 'Meditație, creativitate' },
  { value: 'alpha', label: 'Alpha (8-13 Hz)', description: 'Relaxare, focus' },
  { value: 'beta', label: 'Beta (13-30 Hz)', description: 'Alertă, concentrare' },
];

export function AutosuggestionStep({ data, onChange }: AutosuggestionStepProps) {
  const [localData, setLocalData] = useState<AutosuggestionData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = <K extends keyof AutosuggestionData>(field: K, value: AutosuggestionData[K]) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange({ [field]: value });
  };

  const useDefault = () => {
    handleChange('default_autosuggestion', DEFAULT_AFFIRMATION);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Mindset & Meditație</h2>
          <p className="text-muted-foreground text-sm">Configurează autosugestia și preferințele de meditație</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Autosugestie Zilnică
          </CardTitle>
          <CardDescription>
            Afirmații pozitive pe care le vei citi în fiecare dimineață
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Scrie aici afirmațiile tale pozitive..."
            value={localData.default_autosuggestion || ''}
            onChange={(e) => handleChange('default_autosuggestion', e.target.value)}
            className="min-h-[150px]"
          />
          <button
            onClick={useDefault}
            className="text-sm text-primary hover:underline"
          >
            Folosește exemplul prestabilit
          </button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Mod Meditație
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={localData.meditation_default_mode || 'timer'}
              onValueChange={(value) => handleChange('meditation_default_mode', value)}
              className="space-y-3"
            >
              {MEDITATION_MODES.map((mode) => (
                <Label
                  key={mode.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    localData.meditation_default_mode === mode.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={mode.value} className="mt-0.5" />
                  <div>
                    <span className="font-medium">{mode.label}</span>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            <div className="mt-6 space-y-3">
              <Label>Durată implicită: {localData.meditation_default_duration || 15} minute</Label>
              <Slider
                value={[localData.meditation_default_duration || 15]}
                onValueChange={([val]) => handleChange('meditation_default_duration', val)}
                min={5}
                max={60}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="w-4 h-4" />
              Sunete Binaurale
            </CardTitle>
            <CardDescription>
              Frecvențe audio pentru stări mentale specifice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="binaural-enabled">Activează sunete binaurale</Label>
              <Switch
                id="binaural-enabled"
                checked={localData.binaural_enabled || false}
                onCheckedChange={(checked) => handleChange('binaural_enabled', checked)}
              />
            </div>

            {localData.binaural_enabled && (
              <RadioGroup
                value={localData.binaural_default_type || 'theta'}
                onValueChange={(value) => handleChange('binaural_default_type', value)}
                className="space-y-2"
              >
                {BINAURAL_TYPES.map((type) => (
                  <Label
                    key={type.value}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                      localData.binaural_default_type === type.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={type.value} className="mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">{type.label}</span>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
