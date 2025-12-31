import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Rocket, Sparkles, Target, Zap, Brain, Heart, Briefcase, BarChart3, GraduationCap, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface WelcomeVisionModalProps {
  open: boolean;
  onClose: () => void;
}

interface Task {
  id: string;
  title: string;
  is_key_point: boolean;
  day_of_week: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  body: <Zap className="w-4 h-4" />,
  being: <Brain className="w-4 h-4" />,
  balance: <Heart className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
};

const categoryLabels: Record<string, { ro: string; en: string }> = {
  body: { ro: 'Corp & Energie', en: 'Body & Energy' },
  being: { ro: 'Minte & Spirit', en: 'Mind & Spirit' },
  balance: { ro: 'Relații & Echilibru', en: 'Relationships & Balance' },
  business: { ro: 'Carieră & Afaceri', en: 'Career & Business' },
};

export const WelcomeVisionModal: React.FC<WelcomeVisionModalProps> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityArea, setPriorityArea] = useState<string>('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open && user) {
      loadVisionTasks();
      setStep(1);
    }
  }, [open, user]);

  const loadVisionTasks = async () => {
    if (!user) return;

    // Get current week key
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const weekKey = `door-week-${now.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, is_key_point, day_of_week')
      .eq('user_id', user.id)
      .eq('week_key', weekKey)
      .eq('list_type', 'hit')
      .order('priority', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Deduplicate by title for display
      const uniqueTasks = data.reduce((acc: Task[], task) => {
        if (!acc.some(t => t.title === task.title)) {
          acc.push(task);
        }
        return acc;
      }, []);
      setTasks(uniqueTasks);
      
      // Try to detect priority area from localStorage
      const storedScores = localStorage.getItem('vision_plan_scores');
      if (storedScores) {
        try {
          const scores = JSON.parse(storedScores);
          const lowestCategory = Object.entries(scores).reduce((lowest, [cat, score]) => 
            (score as number) < (scores[lowest] as number) ? cat : lowest
          , 'body');
          setPriorityArea(lowestCategory);
        } catch (e) {
          console.error('Failed to parse vision scores', e);
        }
      }
    }
  };

  const handleClose = () => {
    localStorage.setItem('vision_onboarding_complete', 'true');
    localStorage.removeItem('vision_plan_scores');
    onClose();
  };

  const handleStartOnboarding = () => {
    handleClose();
    navigate('/onboarding');
  };

  const handleStartFocus = () => {
    handleClose();
    navigate('/azi');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 1 && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">
                {language === 'en' 
                  ? '🎉 Welcome to LifeOS!' 
                  : '🎉 Bine ai venit în LifeOS!'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {language === 'en'
                  ? 'Your Vision 2026 assessment is complete. Here\'s what happens next.'
                  : 'Evaluarea ta Vision 2026 este completă. Iată ce urmează.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {priorityArea && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      {categoryIcons[priorityArea]}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Your priority focus area:' : 'Aria ta prioritară:'}
                      </p>
                      <p className="font-semibold text-foreground text-lg">
                        {categoryLabels[priorityArea]?.[language === 'en' ? 'en' : 'ro'] || priorityArea}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'en' ? 'Personalized Tasks Created' : 'Task-uri Personalizate Create'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? `${tasks.length} tasks for this week based on your assessment`
                        : `${tasks.length} task-uri pentru această săptămână bazate pe evaluare`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'en' ? '7-Day Guided Onboarding' : 'Ghid de 7 Zile'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Learn to use LifeOS step by step'
                        : 'Învață să folosești LifeOS pas cu pas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'en' ? 'Track Your Progress' : 'Urmărește-ți Progresul'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Dashboard to monitor all 4 life areas'
                        : 'Dashboard pentru a monitoriza toate cele 4 arii'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="lg">
                {language === 'en' ? 'See My Tasks' : 'Vezi Task-urile Mele'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                {language === 'en' 
                  ? '📋 Your First Week Tasks' 
                  : '📋 Task-urile Tale pentru Prima Săptămână'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Tasks List */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-2 p-2.5 rounded-md transition-all ${
                      task.is_key_point 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-background hover:bg-background/80'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                      task.is_key_point ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm text-foreground flex-1">{task.title}</span>
                    {task.is_key_point && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {language === 'en' ? 'Priority' : 'Prioritar'}
                      </span>
                    )}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    {language === 'en' 
                      ? 'Tasks are being created...' 
                      : 'Task-urile se creează...'}
                  </p>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                💡 {language === 'en'
                  ? 'We recommend starting with the 7-day onboarding to learn the platform!'
                  : 'Îți recomandăm să începi cu ghidul de 7 zile pentru a învăța platforma!'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleStartOnboarding} size="lg" className="w-full">
                <GraduationCap className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Start 7-Day Onboarding' : 'Începe Ghidul de 7 Zile'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleStartFocus}
                className="w-full"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Skip to Dashboard' : 'Sari la Dashboard'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  handleClose();
                  navigate('/vision-2026/dashboard');
                }} 
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {language === 'en' ? 'View Vision 2026 Progress' : 'Vezi Progres Vision 2026'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
