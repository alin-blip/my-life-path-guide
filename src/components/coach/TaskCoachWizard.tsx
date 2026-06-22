import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  Loader2,
  ArrowRight,
  Target,
  Heart,
  CheckCircle2,
  Zap,
  ListPlus,
} from 'lucide-react';
import { getActiveWeekKey, getTodayAbbrev } from '@/utils/weekUtils';

interface TaskCoachWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string | null;
  taskTitle: string;
  onFocusTask?: (microTaskTitle: string) => void;
}

interface CoachResult {
  validation: string;
  reframe: string;
  micro_tasks: string[];
  first_step: string;
  encouragement: string;
}

export const TaskCoachWizard: React.FC<TaskCoachWizardProps> = ({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  onFocusTask,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ro = language === 'ro';

  const [step, setStep] = useState<1 | 2>(1);
  const [blocker, setBlocker] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [savingMicros, setSavingMicros] = useState(false);

  const reset = () => {
    setStep(1);
    setBlocker('');
    setResult(null);
    setLoading(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const callCoach = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('task-coach-breakdown', {
        body: { taskTitle, blocker, language },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as CoachResult);
      setStep(2);
    } catch (err: any) {
      toast.error(ro ? 'Coach-ul nu a răspuns' : 'Coach did not respond', {
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addMicrosToDoor = async () => {
    if (!result) return;
    setSavingMicros(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not signed in');
      const weekKey = getActiveWeekKey();
      const day = getTodayAbbrev();
      const rows = result.micro_tasks.map((title, i) => ({
        user_id: user.id,
        title,
        week_key: weekKey,
        task_type: 'do',
        list_type: 'daily',
        day: new Date().toISOString().slice(0, 10),
        day_of_week: day,
        completed: false,
        position: Date.now() + i,
        parent_task_id: taskId ?? null,
      }));
      const { error } = await supabase.from('user_tasks').insert(rows);
      if (error) throw error;
      toast.success(ro ? 'Micro-taskurile sunt în Domino Door' : 'Micro-tasks added to Domino Door');
      handleClose(false);
      navigate('/door?tab=sarcini');
    } catch (err: any) {
      toast.error(ro ? 'Nu am putut salva' : 'Could not save', { description: err?.message });
    } finally {
      setSavingMicros(false);
    }
  };

  const startFocusNow = () => {
    if (!result) return;
    if (onFocusTask) onFocusTask(result.first_step);
    handleClose(false);
    navigate('/focus');
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-card">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-500" />
            </div>
            {ro ? 'Coach: deblocare task' : 'Coach: unblock task'}
          </SheetTitle>
          <SheetDescription className="text-left">
            <span className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
              {ro ? 'Task' : 'Task'}
            </span>
            <span className="text-foreground font-medium">{taskTitle}</span>
          </SheetDescription>
        </SheetHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/20">
              <p className="text-sm text-foreground">
                {ro
                  ? 'Spune-mi în 1-2 fraze ce te oprește. Frică, oboseală, "nu știu de unde să încep"? Sincer. Te ajut să-l împărțim și să faci primul pas în 2 minute.'
                  : "Tell me in 1-2 sentences what stops you. Fear, fatigue, 'don't know where to start'? Be honest. We'll break it down and get you moving in 2 minutes."}
              </p>
            </div>

            <Textarea
              value={blocker}
              onChange={(e) => setBlocker(e.target.value)}
              placeholder={
                ro
                  ? 'Ex: pare prea mare, nu știu de unde să încep, mi-e frică să sun clientul...'
                  : 'E.g. feels too big, don\'t know where to start, scared to call the client...'
              }
              rows={4}
              className="resize-none"
              disabled={loading}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={loading}
                className="flex-1"
              >
                {ro ? 'Anulează' : 'Cancel'}
              </Button>
              <Button
                onClick={callCoach}
                disabled={loading}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    {ro ? 'Ajută-mă' : 'Help me'}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {ro
                ? 'Poți sări pasul ăsta și apăsa direct "Ajută-mă" — coach-ul va deduce din titlu.'
                : 'You can skip this and tap "Help me" — the coach will infer from the title.'}
            </p>
          </div>
        )}

        {step === 2 && result && (
          <div className="space-y-4">
            {/* Validation */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {ro ? 'Te aud' : 'I hear you'}
                </span>
              </div>
              <p className="text-sm text-foreground">{result.validation}</p>
            </div>

            {/* Reframe */}
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                  {ro ? 'Reframe' : 'Reframe'}
                </span>
              </div>
              <p className="text-sm text-foreground">{result.reframe}</p>
            </div>

            {/* Micro-tasks */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {ro ? 'Breakdown (max 15 min/pas)' : 'Breakdown (max 15 min/step)'}
                </span>
              </div>
              <ol className="space-y-2">
                {result.micro_tasks.map((m, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Badge variant="outline" className="h-5 px-1.5 text-xs flex-shrink-0">
                      {i + 1}
                    </Badge>
                    <span className="text-foreground">{m}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* First step */}
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
                  {ro ? 'Primul pas (< 2 min)' : 'First step (< 2 min)'}
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">{result.first_step}</p>
            </div>

            <p className="text-sm text-center text-muted-foreground italic">
              "{result.encouragement}"
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={startFocusNow}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Zap className="w-4 h-4 mr-1" />
                {ro ? 'Începe acum în Focus Room' : 'Start now in Focus Room'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                onClick={addMicrosToDoor}
                disabled={savingMicros}
                variant="outline"
                className="w-full"
              >
                {savingMicros ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ListPlus className="w-4 h-4 mr-1" />
                    {ro ? 'Adaugă micro-taskurile în Domino Door' : 'Add micro-tasks to Domino Door'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setStep(1);
                  setResult(null);
                }}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                {ro ? 'Refă cu alt blocaj' : 'Redo with different blocker'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
