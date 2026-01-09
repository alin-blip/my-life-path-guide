import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PenTool, Loader2, FileText } from 'lucide-react';
import { useStepConfig, JournalingStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface JournalingStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROMPT_OPTIONS = [
  { value: 'morning', label: 'Dimineață', description: 'Intenții și planuri pentru ziua' },
  { value: 'reflection', label: 'Reflecție', description: 'Gânduri și lecții învățate' },
  { value: 'goals', label: 'Obiective', description: 'Progres spre țeluri' },
  { value: 'gratitude', label: 'Recunoștință', description: 'Momente de mulțumire' },
  { value: 'custom', label: 'Personalizat', description: 'Întrebări proprii' },
];

export function JournalingStepConfigComponent({ open, onOpenChange }: JournalingStepConfigProps) {
  const { config, updateConfig } = useStepConfig<JournalingStepConfig>('journaling');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<JournalingStepConfig>({
    promptType: 'morning',
    wordCountGoal: 200,
    showTemplates: true,
  });

  useEffect(() => {
    if (open) {
      setLocalConfig({
        promptType: config.promptType || 'morning',
        wordCountGoal: config.wordCountGoal || 200,
        showTemplates: config.showTemplates !== false,
      });
    }
  }, [open, config.promptType, config.wordCountGoal, config.showTemplates]);

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
      title="Configurare Journaling"
      description="Personalizează practicile de scriere"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
          <PenTool className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium">Journaling</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tip de întrebări</Label>
            <Select
              value={localConfig.promptType}
              onValueChange={(value: JournalingStepConfig['promptType']) => 
                setLocalConfig(prev => ({ ...prev, promptType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_OPTIONS.map(option => (
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
              <Label>Țintă de cuvinte</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.wordCountGoal} cuvinte
              </span>
            </div>
            <Slider
              value={[localConfig.wordCountGoal || 200]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, wordCountGoal: value }))
              }
              min={100}
              max={500}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100 cuvinte</span>
              <span>500 cuvinte</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Template-uri sugerate
              </Label>
              <p className="text-xs text-muted-foreground">
                Afișează structuri și idei de scriere
              </p>
            </div>
            <Switch
              checked={localConfig.showTemplates}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, showTemplates: checked }))
              }
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          ✍️ <strong>Sfat:</strong> Scrie fără să te oprești. Nu conta greșelile, lasă gândurile să curgă natural.
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
