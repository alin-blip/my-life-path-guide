import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sun, Loader2, Timer, Bell } from 'lucide-react';
import { useStepConfig, LightExposureStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface LightExposureStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LightExposureStepConfigComponent({ open, onOpenChange }: LightExposureStepConfigProps) {
  const { config, updateConfig } = useStepConfig<LightExposureStepConfig>('lightExposure');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<LightExposureStepConfig>({
    durationMinutes: config.durationMinutes || 10,
    showTimer: config.showTimer !== false,
    reminderType: config.reminderType || 'none',
  });

  useEffect(() => {
    setLocalConfig({
      durationMinutes: config.durationMinutes || 10,
      showTimer: config.showTimer !== false,
      reminderType: config.reminderType || 'none',
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
      title="Configurare Lumină Naturală"
      description="Personalizează expunerea la lumină din rutină"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium">Lumină Naturală</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Durată recomandată</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.durationMinutes} minute
              </span>
            </div>
            <Slider
              value={[localConfig.durationMinutes || 10]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, durationMinutes: value }))
              }
              min={5}
              max={30}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Timer countdown
              </Label>
              <p className="text-xs text-muted-foreground">
                Arată cronometru în timpul expunerii
              </p>
            </div>
            <Switch
              checked={localConfig.showTimer}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, showTimer: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminder la finalizare
            </Label>
            <Select
              value={localConfig.reminderType}
              onValueChange={(value: LightExposureStepConfig['reminderType']) => 
                setLocalConfig(prev => ({ ...prev, reminderType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Fără reminder</SelectItem>
                <SelectItem value="notification">Notificare</SelectItem>
                <SelectItem value="sound">Sunet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          💡 <strong>Sfat:</strong> Expunerea la lumină naturală dimineața ajută la reglarea ritmului circadian și îmbunătățește starea de spirit.
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
