import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, BookOpen, Pen, Check } from 'lucide-react';

interface MorningRoutineStepProps {
  onComplete: () => void;
}

export const MorningRoutineStep = ({ onComplete }: MorningRoutineStepProps) => {
  const [checklist, setChecklist] = useState({
    meditation: false,
    reading: false,
    journaling: false
  });

  const allCompleted = Object.values(checklist).every(Boolean);

  const toggleItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <Brain className="h-5 w-5" />
          Rutina de Dimineață
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => toggleItem('meditation')}
        >
          <Checkbox checked={checklist.meditation} />
          <Brain className="h-5 w-5 text-purple-500" />
          <div className="flex-1">
            <p className="font-medium">Meditație</p>
            <p className="text-sm text-muted-foreground">10-20 minute de liniște și prezență</p>
          </div>
        </div>

        <div 
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => toggleItem('reading')}
        >
          <Checkbox checked={checklist.reading} />
          <BookOpen className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium">Citit</p>
            <p className="text-sm text-muted-foreground">Cel puțin 10 pagini din cartea curentă</p>
          </div>
        </div>

        <div 
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => toggleItem('journaling')}
        >
          <Checkbox checked={checklist.journaling} />
          <Pen className="h-5 w-5 text-green-500" />
          <div className="flex-1">
            <p className="font-medium">Journaling / Stack</p>
            <p className="text-sm text-muted-foreground">Scrie gândurile și intențiile pentru azi</p>
          </div>
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={onComplete}
          disabled={!allCompleted}
        >
          <Check className="h-4 w-4" />
          {allCompleted ? 'Completează Pasul' : 'Bifează toate pentru a continua'}
        </Button>
      </CardContent>
    </Card>
  );
};
