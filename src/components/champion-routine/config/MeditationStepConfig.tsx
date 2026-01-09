import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Timer, Loader2, Headphones } from 'lucide-react';
import { useStepConfig, MeditationStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface MeditationStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BINAURAL_OPTIONS = [
  { value: 'alpha', label: 'Alpha (8-14 Hz) - Relaxare, creativitate' },
  { value: 'theta', label: 'Theta (4-8 Hz) - Meditație profundă' },
  { value: 'delta', label: 'Delta (0.5-4 Hz) - Somn, vindecare' },
  { value: 'beta', label: 'Beta (14-30 Hz) - Focus, concentrare' },
  { value: 'gamma', label: 'Gamma (30-100 Hz) - Insight, claritate' },
];

export function MeditationStepConfigComponent({ open, onOpenChange }: MeditationStepConfigProps) {
  const { config, updateConfig } = useStepConfig<MeditationStepConfig>('meditation');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<MeditationStepConfig>({
    defaultMode: config.defaultMode || 'timer',
    defaultDurationMinutes: config.defaultDurationMinutes || 10,
    binauralEnabled: config.binauralEnabled || false,
    binauralType: config.binauralType || 'theta',
  });

  useEffect(() => {
    setLocalConfig({
      defaultMode: config.defaultMode || 'timer',
      defaultDurationMinutes: config.defaultDurationMinutes || 10,
      binauralEnabled: config.binauralEnabled || false,
      binauralType: config.binauralType || 'theta',
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
      title="Configurare Meditație"
      description="Personalizează pasul de meditație din rutină"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
          <Timer className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium">Meditație</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mod implicit</Label>
            <Select
              value={localConfig.defaultMode}
              onValueChange={(value: 'timer' | 'guided') => 
                setLocalConfig(prev => ({ ...prev, defaultMode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timer">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Timer
                  </div>
                </SelectItem>
                <SelectItem value="guided">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Meditație Ghidată
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Durată implicită</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.defaultDurationMinutes} minute
              </span>
            </div>
            <Slider
              value={[localConfig.defaultDurationMinutes || 10]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, defaultDurationMinutes: value }))
              }
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sunete binaurale</Label>
              <p className="text-xs text-muted-foreground">
                Frecvențe pentru relaxare profundă
              </p>
            </div>
            <Switch
              checked={localConfig.binauralEnabled}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, binauralEnabled: checked }))
              }
            />
          </div>

          {localConfig.binauralEnabled && (
            <div className="space-y-2">
              <Label>Tip frecvență</Label>
              <Select
                value={localConfig.binauralType}
                onValueChange={(value: MeditationStepConfig['binauralType']) => 
                  setLocalConfig(prev => ({ ...prev, binauralType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BINAURAL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
