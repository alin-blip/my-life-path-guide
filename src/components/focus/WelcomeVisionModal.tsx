import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Rocket, Sparkles, Target, Zap, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface WelcomeVisionModalProps {
  open: boolean;
  onClose: () => void;
}

interface Task {
  id: string;
  title: string;
  is_key_point: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  body: <Zap className="w-4 h-4" />,
  being: <Brain className="w-4 h-4" />,
  balance: <Heart className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
};

export const WelcomeVisionModal: React.FC<WelcomeVisionModalProps> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityArea, setPriorityArea] = useState<string>('');

  useEffect(() => {
    if (open && user) {
      loadVisionTasks();
    }
  }, [open, user]);

  const loadVisionTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, is_key_point')
      .eq('user_id', user.id)
      .eq('task_type', 'vision-2026')
      .order('priority', { ascending: false })
      .limit(7);

    if (!error && data) {
      setTasks(data);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {language === 'en' 
              ? '🎉 Your First Week is Ready!' 
              : '🎉 Prima Ta Săptămână Este Pregătită!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground text-sm">
            {language === 'en'
              ? 'Based on your Vision 2026 assessment, we\'ve created personalized tasks to help you start strong.'
              : 'Pe baza evaluării Vision 2026, am creat task-uri personalizate pentru a te ajuta să începi puternic.'}
          </p>

          {priorityArea && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">
                {language === 'en' ? 'Focus area:' : 'Arie de focus:'}
              </span>
              <span className="font-semibold text-foreground capitalize flex items-center gap-1">
                {categoryIcons[priorityArea]}
                {priorityArea}
              </span>
            </div>
          )}

          {/* Tasks List */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  task.is_key_point ? 'bg-primary/10 border border-primary/20' : 'bg-background'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                  task.is_key_point ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className="text-sm text-foreground">{task.title}</span>
                {task.is_key_point && (
                  <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {language === 'en' ? 'Priority' : 'Prioritar'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {language === 'en'
              ? 'Complete these tasks to build momentum. You\'ve got 7 days of free access!'
              : 'Completează aceste task-uri pentru a construi momentum. Ai 7 zile de acces gratuit!'}
          </p>
        </div>

        <Button onClick={handleClose} className="w-full">
          <Rocket className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Start My First Focus Session' : 'Începe Prima Sesiune de Focus'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
