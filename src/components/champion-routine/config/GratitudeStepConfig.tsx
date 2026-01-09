import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Loader2, Sparkles } from 'lucide-react';
import { useStepConfig, GratitudeStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface GratitudeStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GratitudeStepConfigComponent({ open, onOpenChange }: GratitudeStepConfigProps) {
  const { config, updateConfig } = useStepConfig<GratitudeStepConfig>('gratitude');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<GratitudeStepConfig>({
    itemCount: config.itemCount || 3,
    showExamples: config.showExamples !== false,
    dailyPrompt: config.dailyPrompt || false,
  });

  useEffect(() => {
    setLocalConfig({
      itemCount: config.itemCount || 3,
      showExamples: config.showExamples !== false,
      dailyPrompt: config.dailyPrompt || false,
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
      title="Configurare Recunoștință"
      description="Personalizează exercițiul de recunoștință"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10">
          <Heart className="h-5 w-5 text-pink-500" />
          <span className="text-sm font-medium">Recunoștință</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Număr de lucruri pentru care ești recunoscător</Label>
            <Select
              value={String(localConfig.itemCount)}
              onValueChange={(value) => 
                setLocalConfig(prev => ({ ...prev, itemCount: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 lucruri (rapid)</SelectItem>
                <SelectItem value="5">5 lucruri (moderat)</SelectItem>
                <SelectItem value="7">7 lucruri (profund)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Exemple inspiraționale
              </Label>
              <p className="text-xs text-muted-foreground">
                Afișează sugestii pentru a te inspira
              </p>
            </div>
            <Switch
              checked={localConfig.showExamples}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, showExamples: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prompt zilnic diferit</Label>
              <p className="text-xs text-muted-foreground">
                Întrebare diferită în fiecare zi
              </p>
            </div>
            <Switch
              checked={localConfig.dailyPrompt}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, dailyPrompt: checked }))
              }
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          💗 <strong>De ce recunoștință?</strong> Studiile arată că practicarea zilnică a recunoștinței îmbunătățește starea de spirit și bunăstarea generală.
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
