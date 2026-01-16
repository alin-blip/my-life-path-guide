import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Headphones, Video, Sparkles, Loader2 } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { StepConfigDialog } from './StepConfigDialog';

interface LearnStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LEARN_TYPES = [
  { id: 'book', icon: BookOpen, label: 'Citește o carte', color: 'text-blue-500' },
  { id: 'podcast', icon: Headphones, label: 'Ascultă podcast', color: 'text-purple-500' },
  { id: 'video', icon: Video, label: 'Urmărește video', color: 'text-red-500' },
  { id: 'custom', icon: Sparkles, label: 'Personalizat', color: 'text-amber-500' },
];

export function LearnStepConfigComponent({ open, onOpenChange }: LearnStepConfigProps) {
  const { settings, saveSettings } = useChampionRoutine();
  const [isSaving, setIsSaving] = useState(false);
  
  const [learnType, setLearnType] = useState((settings as any)?.learn_task_type || 'book');
  const [learnDescription, setLearnDescription] = useState((settings as any)?.learn_task_description || '');

  useEffect(() => {
    setLearnType((settings as any)?.learn_task_type || 'book');
    setLearnDescription((settings as any)?.learn_task_description || '');
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        learn_task_type: learnType,
        learn_task_description: learnDescription.trim()
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getPlaceholder = () => {
    switch (learnType) {
      case 'book': return 'ex: Citește 20 pagini din Think and Grow Rich';
      case 'podcast': return 'ex: Ascultă un episod de Huberman Lab';
      case 'video': return 'ex: Urmărește un tutorial despre React';
      case 'custom': return 'ex: Studiază un capitol din cursul online';
      default: return 'Descrie taskul de învățare';
    }
  };

  return (
    <StepConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurare Învățare"
      description="Setează ce vrei să înveți zilnic"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">Învață Ceva Nou</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Tip de învățare</Label>
            <RadioGroup value={learnType} onValueChange={setLearnType} className="grid grid-cols-2 gap-2">
              {LEARN_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Label
                    key={type.id}
                    htmlFor={type.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      learnType === type.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                    <Icon className={`h-4 w-4 ${type.color}`} />
                    <span className="text-sm">{type.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learnDescription">Descriere task</Label>
            <Input
              id="learnDescription"
              placeholder={getPlaceholder()}
              value={learnDescription}
              onChange={(e) => setLearnDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Acest task va fi afișat în pasul "Învață Ceva Nou" din rutină
            </p>
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
