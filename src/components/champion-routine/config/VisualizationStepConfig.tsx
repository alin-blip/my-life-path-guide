import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Eye, Loader2, Music, Target, Heart, Trophy, Sparkles } from 'lucide-react';
import { useStepConfig, VisualizationStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface VisualizationStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FOCUS_OPTIONS = [
  { value: 'day', label: 'Ziua de azi', icon: Sparkles, description: 'Vizualizează o zi perfectă' },
  { value: 'goals', label: 'Obiective', icon: Target, description: 'Concentrare pe țeluri' },
  { value: 'success', label: 'Succes', icon: Trophy, description: 'Moment de succes viitor' },
  { value: 'health', label: 'Sănătate', icon: Heart, description: 'Stare de bine' },
];

export function VisualizationStepConfigComponent({ open, onOpenChange }: VisualizationStepConfigProps) {
  const { config, updateConfig } = useStepConfig<VisualizationStepConfig>('visualization');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<VisualizationStepConfig>({
    durationMinutes: config.durationMinutes || 5,
    ambientMusic: config.ambientMusic || false,
    guidedMode: config.guidedMode !== false,
    focusArea: config.focusArea || 'day',
  });

  useEffect(() => {
    setLocalConfig({
      durationMinutes: config.durationMinutes || 5,
      ambientMusic: config.ambientMusic || false,
      guidedMode: config.guidedMode !== false,
      focusArea: config.focusArea || 'day',
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
      title="Configurare Vizualizare"
      description="Personalizează exercițiul de vizualizare"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10">
          <Eye className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-medium">Vizualizare</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Durată vizualizare</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.durationMinutes} minute
              </span>
            </div>
            <Slider
              value={[localConfig.durationMinutes || 5]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, durationMinutes: value }))
              }
              min={3}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 min</span>
              <span>15 min</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Focus vizualizare</Label>
            <Select
              value={localConfig.focusArea}
              onValueChange={(value: VisualizationStepConfig['focusArea']) => 
                setLocalConfig(prev => ({ ...prev, focusArea: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Muzică ambient
              </Label>
              <p className="text-xs text-muted-foreground">
                Sunete relaxante în fundal
              </p>
            </div>
            <Switch
              checked={localConfig.ambientMusic}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, ambientMusic: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mod ghidat</Label>
              <p className="text-xs text-muted-foreground">
                Indicații pas cu pas
              </p>
            </div>
            <Switch
              checked={localConfig.guidedMode}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, guidedMode: checked }))
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
