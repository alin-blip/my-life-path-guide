import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BookOpen, Loader2 } from 'lucide-react';
import { useStepConfig, ReadingStepConfig } from '@/hooks/useStepConfig';
import { StepConfigDialog } from './StepConfigDialog';

interface ReadingStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReadingStepConfigComponent({ open, onOpenChange }: ReadingStepConfigProps) {
  const { config, updateConfig } = useStepConfig<ReadingStepConfig>('reading');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState<ReadingStepConfig>({
    currentBook: config.currentBook || '',
    pagesPerDay: config.pagesPerDay || 10,
    showRecommendations: config.showRecommendations !== false,
  });

  useEffect(() => {
    setLocalConfig({
      currentBook: config.currentBook || '',
      pagesPerDay: config.pagesPerDay || 10,
      showRecommendations: config.showRecommendations !== false,
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

  // Calculate yearly stats
  const pagesPerYear = (localConfig.pagesPerDay || 10) * 365;
  const booksPerYear = Math.floor(pagesPerYear / 250); // Average book ~250 pages

  return (
    <StepConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurare Citit"
      description="Personalizează pasul de citit din rutină"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium">Citit</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentBook">Cartea curentă</Label>
            <Input
              id="currentBook"
              placeholder="ex: Think and Grow Rich"
              value={localConfig.currentBook}
              onChange={(e) => 
                setLocalConfig(prev => ({ ...prev, currentBook: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Afișată în pasul de citit pentru a te motiva
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Pagini pe zi</Label>
              <span className="text-sm font-medium text-primary">
                {localConfig.pagesPerDay} pagini
              </span>
            </div>
            <Slider
              value={[localConfig.pagesPerDay || 10]}
              onValueChange={([value]) => 
                setLocalConfig(prev => ({ ...prev, pagesPerDay: value }))
              }
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 pagini</span>
              <span>50 pagini</span>
            </div>
          </div>

          {/* Yearly projection */}
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              La {localConfig.pagesPerDay} pagini/zi vei citi:
            </p>
            <p className="text-lg font-semibold text-emerald-500">
              ~{booksPerYear} cărți/an ({pagesPerYear.toLocaleString()} pagini)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arată recomandări</Label>
              <p className="text-xs text-muted-foreground">
                Lista de cărți sugerate în pas
              </p>
            </div>
            <Switch
              checked={localConfig.showRecommendations}
              onCheckedChange={(checked) => 
                setLocalConfig(prev => ({ ...prev, showRecommendations: checked }))
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
