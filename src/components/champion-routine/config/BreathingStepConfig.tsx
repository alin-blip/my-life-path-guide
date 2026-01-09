import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Wind, Loader2 } from 'lucide-react';
import { useStepConfig, BreathingStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface BreathingStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TECHNIQUE_OPTIONS = [
  { value: 'box', label: 'Box Breathing (4-4-4-4)', description: 'Respirație în pătrat' },
  { value: '478', label: '4-7-8 Relaxare', description: 'Tehnica de relaxare' },
  { value: 'wim_hof', label: 'Wim Hof', description: 'Tehnica Wim Hof' },
  { value: 'custom', label: 'Personalizat', description: 'Setări proprii' },
];

export function BreathingStepConfigComponent({ open, onOpenChange }: BreathingStepConfigProps) {
  const { config, updateConfig } = useStepConfig<BreathingStepConfig>('breathing');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<BreathingStepConfig>({
    technique: 'box',
    cycles: 5,
    phaseDuration: 4,
    showGuide: true,
  });

  useEffect(() => {
    if (open) {
      setLocalConfig({
        technique: config.technique || 'box',
        cycles: config.cycles || 5,
        phaseDuration: config.phaseDuration || 4,
        showGuide: config.showGuide !== false,
      });
    }
  }, [open, config.technique, config.cycles, config.phaseDuration, config.showGuide]);

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
      title="Configurare Respirație"
      description="Personalizează exercițiul de respirație din rutină"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/10">
          <Wind className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-medium">Respirație</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tehnică de respirație</Label>
            <Select
              value={localConfig.technique}
              onValueChange={(value: BreathingStepConfig['technique']) => 
                setLocalConfig(prev => ({ ...prev, technique: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHNIQUE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Număr de cicluri</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.cycles} cicluri
              </span>
            </div>
            <Slider
              value={[localConfig.cycles || 5]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, cycles: value }))
              }
              min={3}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 cicluri</span>
              <span>10 cicluri</span>
            </div>
          </div>

          {localConfig.technique === 'custom' && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Durată fază (secunde)</Label>
                <span className="text-sm font-medium text-primary">
                  {localConfig.phaseDuration}s
                </span>
              </div>
              <Slider
                value={[localConfig.phaseDuration || 4]}
                onValueChange={([value]) => 
                  setLocalConfig(prev => ({ ...prev, phaseDuration: value }))
                }
                min={3}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3s</span>
                <span>8s</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ghid vizual</Label>
              <p className="text-xs text-muted-foreground">
                Arată instrucțiuni și animații
              </p>
            </div>
            <Switch
              checked={localConfig.showGuide}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, showGuide: checked }))
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
