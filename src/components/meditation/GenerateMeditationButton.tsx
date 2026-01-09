import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Headphones, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEmpowermentMeditation } from '@/hooks/useEmpowermentMeditation';

interface Mission {
  id: string;
  category: string;
  title: string | null;
  measurable_result: string | null;
  mission_type: string;
}

interface GenerateMeditationButtonProps {
  objectives: Mission[];
  language?: string;
}

export function GenerateMeditationButton({ objectives, language = 'ro' }: GenerateMeditationButtonProps) {
  const [open, setOpen] = useState(false);
  const { generateMeditation, isGenerating, hasMeditation } = useEmpowermentMeditation();

  // Group objectives by category
  const getObjectiveText = (category: string) => {
    const mission = objectives.find(m => m.category?.toLowerCase() === category);
    return mission?.title || mission?.measurable_result || null;
  };

  const objectivesData = {
    body: getObjectiveText('body'),
    being: getObjectiveText('being'),
    balance: getObjectiveText('balance'),
    business: getObjectiveText('business'),
  };

  const hasAnyObjectives = Object.values(objectivesData).some(Boolean);

  const handleGenerate = async () => {
    const success = await generateMeditation({
      objectives: objectivesData as Record<string, string>,
      language
    });
    if (success) {
      setOpen(false);
    }
  };

  if (!hasAnyObjectives) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/50"
        >
          <Headphones className="h-4 w-4 text-purple-500" />
          {hasMeditation ? (
            <>
              <RefreshCw className="h-3 w-3" />
              {language === 'ro' ? 'Regenerează Meditație' : 'Regenerate Meditation'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {language === 'ro' ? 'Generează Meditație AI' : 'Generate AI Meditation'}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {language === 'ro' ? 'Meditație de Empowerment' : 'Empowerment Meditation'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ro' 
              ? 'AI-ul va crea o meditație ghidată personalizată bazată pe obiectivele tale anuale din toate cele 4 arii ale vieții.'
              : 'AI will create a personalized guided meditation based on your annual objectives from all 4 life areas.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            {language === 'ro' ? 'Obiectivele tale:' : 'Your objectives:'}
          </p>
          
          <div className="space-y-2">
            {objectivesData.body && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-xs font-bold text-red-500 mt-0.5">CORP</span>
                <span className="text-sm">{objectivesData.body}</span>
              </div>
            )}
            {objectivesData.being && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="text-xs font-bold text-purple-500 mt-0.5">SPIRIT</span>
                <span className="text-sm">{objectivesData.being}</span>
              </div>
            )}
            {objectivesData.balance && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-bold text-green-500 mt-0.5">RELAȚII</span>
                <span className="text-sm">{objectivesData.balance}</span>
              </div>
            )}
            {objectivesData.business && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-500 mt-0.5">BUSINESS</span>
                <span className="text-sm">{objectivesData.business}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
            <Headphones className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {language === 'ro'
                ? 'Meditația va fi disponibilă în Rutina de Campion, la pasul de Meditație. Include vizualizări pentru fiecare arie și afirmații puternice.'
                : 'The meditation will be available in Champion Routine at the Meditation step. Includes visualizations for each area and powerful affirmations.'
              }
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isGenerating}>
            {language === 'ro' ? 'Anulează' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'ro' ? 'Se generează...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {language === 'ro' ? 'Generează Meditație' : 'Generate Meditation'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
