import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PomodoroTimer } from './PomodoroTimer';
import { FocusStats } from './FocusStats';
import { TodaysTasks } from './TodaysTasks';
import { WelcomeVisionModal } from './WelcomeVisionModal';
import { Target, Zap } from 'lucide-react';

export const FocusRoom: React.FC = () => {
  const { language } = useLanguage();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if user came from vision onboarding
    const isVisionOnboardingComplete = localStorage.getItem('vision_onboarding_complete');
    const hasVisionScores = localStorage.getItem('vision_plan_scores');
    
    if (!isVisionOnboardingComplete && hasVisionScores) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handlePomodoroComplete = () => {
    setCompletedPomodoros(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'en' ? 'Focus Mode' : 'Mod Focus'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Focus Room' : 'Camera de Focus'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {language === 'en' 
              ? 'Deep work sessions to accomplish your most important tasks' 
              : 'Sesiuni de lucru profund pentru sarcinile tale cele mai importante'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Pomodoro Timer - Main Focus */}
          <div className="lg:col-span-2">
            <PomodoroTimer 
              activeTaskId={activeTaskId}
              onComplete={handlePomodoroComplete}
            />
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <FocusStats completedToday={completedPomodoros} />
            
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm">
                  {language === 'en' ? 'Today\'s Progress' : 'Progresul de Azi'}
                </span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {completedPomodoros * 25}
                <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' 
                  ? `${completedPomodoros} pomodoro${completedPomodoros !== 1 ? 's' : ''} completed`
                  : `${completedPomodoros} pomodoro finalizat${completedPomodoros !== 1 ? 'e' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="mt-8 max-w-4xl mx-auto">
          <TodaysTasks 
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTaskId}
          />
        </div>
      </div>

      {/* Welcome Vision Modal */}
      <WelcomeVisionModal 
        open={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
    </div>
  );
};
