import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PersonalPowerDay } from '@/data/personalPowerContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ClipboardList, Plus } from 'lucide-react';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getActiveWeekKey } from '@/utils/weekUtils';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface PersonalPowerExerciseProps {
  dayData: PersonalPowerDay;
  exerciseResponses: Record<string, string>;
  onSave: (responses: Record<string, string>) => void;
  onComplete: () => void;
  completed: boolean;
}

export const PersonalPowerExercise: React.FC<PersonalPowerExerciseProps> = ({
  dayData,
  exerciseResponses,
  onSave,
  onComplete,
  completed,
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, string>>(exerciseResponses || {});
  const [addingTasks, setAddingTasks] = useState(false);

  useEffect(() => {
    if (exerciseResponses) {
      setResponses(exerciseResponses);
    }
  }, [exerciseResponses]);

  const handleChange = (stepKey: string, value: string) => {
    const updated = { ...responses, [stepKey]: value };
    setResponses(updated);
    onSave(updated);
  };

  const handleAddToDoList = async () => {
    setAddingTasks(true);
    try {
      const weekKey = getActiveWeekKey();
      
      // Collect user's actual responses from exercise fields instead of prompt texts
      const userResponses: string[] = [];
      for (const step of dayData.assignmentSteps) {
        if (step.type === 'list' && step.listCount) {
          for (let i = 0; i < step.listCount; i++) {
            const val = responses[`step-${step.step}-${i}`]?.trim();
            if (val) userResponses.push(val);
          }
        } else {
          const val = responses[`step-${step.step}`]?.trim();
          if (val) userResponses.push(val);
        }
      }

      if (userResponses.length === 0) {
        toast({
          title: language === 'ro' ? 'Completează exercițiile' : 'Complete the exercises',
          description: language === 'ro'
            ? 'Scrie răspunsurile tale mai întâi, apoi adaugă-le în Do List'
            : 'Write your responses first, then add them to Do List',
          variant: 'destructive',
        });
        setAddingTasks(false);
        return;
      }

      for (const taskText of userResponses) {
        await doorUserTasksService.addIdeaToWeek(weekKey, {
          id: uuidv4(),
          text: taskText,
          category: 'do',
          priority: 'none',
        });
      }
      toast({
        title: language === 'ro' ? 'Sarcini adăugate!' : 'Tasks added!',
        description: language === 'ro'
          ? `${userResponses.length} sarcini adăugate în Do List`
          : `${userResponses.length} tasks added to Do List`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAddingTasks(false);
    }
  };

  const allFilled = dayData.assignmentSteps.every(step => {
    if (step.type === 'list' && step.listCount) {
      return Array.from({ length: step.listCount }, (_, i) =>
        responses[`step-${step.step}-${i}`]?.trim().length > 0
      ).every(Boolean);
    }
    const key = `step-${step.step}`;
    return responses[key]?.trim().length > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">
          {language === 'ro' ? 'Planul de Execuție' : 'Execution Plan'}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        {language === 'ro'
          ? 'Nu părăsi niciodată locul în care ai stabilit un obiectiv sau ai luat o decizie fără a lua vreo acțiune în direcția atingerii lui!'
          : 'Never leave the site of setting a goal or making a decision without taking some action toward its attainment!'}
      </p>

      {dayData.assignmentSteps.map((step) => {
        const key = `step-${step.step}`;
        return (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              <Badge variant="outline" className="mr-2">{step.step}</Badge>
              {language === 'ro' ? step.prompt : step.promptEn}
            </label>
            {step.type === 'list' && step.listCount ? (
              <div className="space-y-2">
                {Array.from({ length: step.listCount }, (_, i) => (
                  <Textarea
                    key={`${key}-${i}`}
                    placeholder={`${i + 1}.`}
                    value={responses[`${key}-${i}`] || ''}
                    onChange={(e) => handleChange(`${key}-${i}`, e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                ))}
              </div>
            ) : (
              <Textarea
                placeholder={language === 'ro' ? 'Scrie aici...' : 'Write here...'}
                value={responses[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="min-h-[100px] resize-none"
              />
            )}
          </div>
        );
      })}

      {/* Add to Do List */}
      <div className="bg-accent/30 border border-accent rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-3">
          {language === 'ro' ? '📋 Adaugă răspunsurile tale în Do List:' : '📋 Add your responses to Do List:'}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {language === 'ro' 
            ? 'Răspunsurile pe care le-ai scris mai sus vor fi adăugate ca sarcini în Do List.'
            : 'Your responses from above will be added as tasks to the Do List.'}
        </p>
        <Button
          onClick={handleAddToDoList}
          disabled={addingTasks}
          variant="outline"
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {addingTasks
            ? (language === 'ro' ? 'Se adaugă...' : 'Adding...')
            : (language === 'ro' ? 'Adaugă în Do List' : 'Add to Do List')}
        </Button>
      </div>

      {/* Complete */}
      {!completed && (
        <Button
          onClick={onComplete}
          disabled={!allFilled}
          className="w-full gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {language === 'ro' ? 'Am completat exercițiile' : 'I\'ve completed the exercises'}
        </Button>
      )}

      {completed && (
        <div className="text-center py-3 text-sm text-muted-foreground">
          ✅ {language === 'ro' ? 'Exerciții completate' : 'Exercises completed'}
        </div>
      )}
    </div>
  );
};
