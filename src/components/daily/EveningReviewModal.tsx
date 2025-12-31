import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Moon, CheckCircle2, Lightbulb, ArrowRight, Star, Trophy, Sparkles } from 'lucide-react';
import { getWeek, getYear } from 'date-fns';

interface EveningReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CompletedTask {
  id: string;
  title: string;
}

export const EveningReviewModal: React.FC<EveningReviewModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [wins, setWins] = useState('');
  const [lessons, setLessons] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadCompletedTasks();
    }
  }, [open, user]);

  const loadCompletedTasks = async () => {
    if (!user) return;

    const now = new Date();
    const weekNumber = getWeek(now, { weekStartsOn: 1 });
    const year = getYear(now);
    const weekKey = `door-week-${year}-${String(weekNumber).padStart(2, '0')}`;
    const today = now.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);

    const { data } = await supabase
      .from('user_tasks')
      .select('id, title')
      .eq('user_id', user.id)
      .eq('week_key', weekKey)
      .eq('completed', true)
      .or(`day_of_week.eq.${today},day_of_week.is.null`)
      .limit(10);

    if (data) {
      setCompletedTasks(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const now = new Date();
      const weekNumber = getWeek(now, { weekStartsOn: 1 });
      const year = getYear(now);
      const weekKey = `door-week-${year}-${String(weekNumber).padStart(2, '0')}`;

      // Save to weekly_reviews
      const winsArray = wins.split('\n').filter(w => w.trim());
      const lessonsArray = lessons.split('\n').filter(l => l.trim());

      const { error } = await supabase.from('weekly_reviews').upsert({
        user_id: user.id,
        week_key: weekKey,
        wins: winsArray,
        lessons: lessonsArray,
        next_week_focus: tomorrowFocus || null,
        overall_rating: overallRating,
      }, {
        onConflict: 'user_id,week_key'
      });

      if (error) throw error;

      toast({
        title: language === 'ro' ? 'Review salvat!' : 'Review saved!',
        description: language === 'ro' ? 'Odihnește-te bine! Mâine e o zi nouă.' : 'Rest well! Tomorrow is a new day.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu am putut salva review-ul' : 'Could not save review',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const ratingOptions = [1, 2, 3, 4, 5];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            {language === 'ro' ? 'Review de Seară' : 'Evening Review'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <Trophy className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                <p className="text-muted-foreground">
                  {language === 'ro' ? 'Ce ai realizat azi?' : 'What did you accomplish today?'}
                </p>
              </div>

              {completedTasks.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'ro' ? 'Task-uri completate azi:' : 'Tasks completed today:'}
                  </p>
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-foreground">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                placeholder={language === 'ro' 
                  ? 'Adaugă alte victorii sau realizări...\nEx: Am avut o conversație importantă' 
                  : 'Add other wins or accomplishments...\nEx: Had an important conversation'}
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                className="min-h-[80px]"
              />

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <Lightbulb className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
                <p className="text-muted-foreground">
                  {language === 'ro' ? 'Ce ai învățat azi?' : 'What did you learn today?'}
                </p>
              </div>

              <Textarea
                placeholder={language === 'ro' 
                  ? 'Ex: Am descoperit că lucrez mai bine dimineața\nTrebuie să planific mai bine pauzele' 
                  : 'Ex: I work better in the morning\nNeed to plan breaks better'}
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={() => setStep(3)}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <Sparkles className="w-10 h-10 mx-auto text-primary mb-2" />
                <p className="text-muted-foreground">
                  {language === 'ro' ? 'Pe ce te concentrezi mâine?' : 'What will you focus on tomorrow?'}
                </p>
              </div>

              <Textarea
                placeholder={language === 'ro' 
                  ? 'Ex: Finalizez proiectul X\nFac 30 min exerciții' 
                  : 'Ex: Finish project X\nDo 30 min exercise'}
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                className="min-h-[80px]"
              />

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={() => setStep(4)}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {language === 'ro' ? 'Cum a fost ziua de azi?' : 'How was your day overall?'}
                </p>
                <div className="flex justify-center gap-2">
                  {ratingOptions.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setOverallRating(rating)}
                      className={`p-3 rounded-full transition-all ${
                        overallRating === rating 
                          ? 'bg-primary text-primary-foreground scale-110' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${
                        overallRating && rating <= overallRating 
                          ? 'fill-current' 
                          : ''
                      }`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {overallRating === 1 && (language === 'ro' ? 'Dificilă' : 'Difficult')}
                  {overallRating === 2 && (language === 'ro' ? 'Sub așteptări' : 'Below expectations')}
                  {overallRating === 3 && (language === 'ro' ? 'Ok' : 'Ok')}
                  {overallRating === 4 && (language === 'ro' ? 'Bună' : 'Good')}
                  {overallRating === 5 && (language === 'ro' ? 'Excelentă!' : 'Excellent!')}
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={handleSave} disabled={saving || !overallRating}>
                  {saving 
                    ? (language === 'ro' ? 'Se salvează...' : 'Saving...') 
                    : (language === 'ro' ? 'Încheie Ziua' : 'End Day')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
