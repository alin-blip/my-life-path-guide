import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Loader2 } from 'lucide-react';
import { useStepConfig, ExerciseStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface ExerciseStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVITY_OPTIONS = [
  { value: 'workout', label: 'Workout (Sală/Acasă)' },
  { value: 'running', label: 'Alergare' },
  { value: 'cycling', label: 'Ciclism' },
  { value: 'walking', label: 'Mers pe jos' },
  { value: 'manual', label: 'Intrare manuală' },
];

export function ExerciseStepConfigComponent({ open, onOpenChange }: ExerciseStepConfigProps) {
  const { config, updateConfig } = useStepConfig<ExerciseStepConfig>('exercise');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<ExerciseStepConfig>({
    defaultActivity: config.defaultActivity || undefined,
    skipActivitySelector: config.skipActivitySelector || false,
    autoStartTimer: config.autoStartTimer || false,
  });

  useEffect(() => {
    setLocalConfig({
      defaultActivity: config.defaultActivity || undefined,
      skipActivitySelector: config.skipActivitySelector || false,
      autoStartTimer: config.autoStartTimer || false,
    });
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localConfig);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurare Exerciții"
      description="Personalizează pasul de activitate fizică din rutină"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
          <Dumbbell className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium">Exerciții</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Activitate implicită</Label>
            <Select
              value={localConfig.defaultActivity || 'none'}
              onValueChange={(value) => 
                setLocalConfig(prev => ({ 
                  ...prev, 
                  defaultActivity: value === 'none' ? undefined : value as ExerciseStepConfig['defaultActivity']
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alege activitatea preferată" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nicio preferință (arată selector)</SelectItem>
                {ACTIVITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Dacă alegi o activitate, vei sări direct la ea în wizard
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sari peste selector</Label>
              <p className="text-xs text-muted-foreground">
                Mergi direct la activitatea implicită
              </p>
            </div>
            <Switch
              checked={localConfig.skipActivitySelector}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, skipActivitySelector: checked }))
              }
              disabled={!localConfig.defaultActivity}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pornire automată timer</Label>
              <p className="text-xs text-muted-foreground">
                Pentru alergare, ciclism, mers pe jos
              </p>
            </div>
            <Switch
              checked={localConfig.autoStartTimer}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, autoStartTimer: checked }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvează'}
          </Button>
        </div>
      </div>
    </StepConfigDialog>
  );
}
