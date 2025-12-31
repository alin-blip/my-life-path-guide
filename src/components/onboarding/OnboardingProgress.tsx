import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const OnboardingProgress: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('onboarding_progress')
          .select('current_day, completed_days, is_completed')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setCurrentDay(data.current_day);
          setCompletedDays(data.completed_days || []);
          setIsCompleted(data.is_completed);
        }
      } catch (error) {
        // User might not have started onboarding yet
      }
    };

    fetchProgress();
  }, [user]);

  // Don't show if onboarding is completed or not started
  if (isCompleted || currentDay === null) {
    return null;
  }

  const progress = (completedDays.length / 7) * 100;

  return (
    <Link 
      to="/onboarding"
      className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group"
    >
      <div className="p-1.5 bg-primary/20 rounded-full">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-foreground">
            {language === 'ro' ? `Ziua ${currentDay}` : `Day ${currentDay}`}
          </span>
          <span className="text-muted-foreground">{completedDays.length}/7</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
};
