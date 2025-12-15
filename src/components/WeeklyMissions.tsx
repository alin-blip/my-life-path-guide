import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KeyRound, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { weeklyPlanningService, WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { getISOWeek, getYear } from 'date-fns';

export const WeeklyMissions: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlanningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentWeekPlan();
  }, []);

  const loadCurrentWeekPlan = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
      const plan = await weeklyPlanningService.getPlanForWeek(currentWeekKey);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading current week plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border border-primary/20 shadow-lg">
        <CardContent className="p-4 flex items-center justify-center min-h-[200px]">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan) {
    return (
      <Card className="bg-card border border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Weekly Missions' : 'Misiuni Săptămânale'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'No weekly plan set yet. Start planning your week!'
                : 'Nu ai setat încă un plan săptămânal. Începe planificarea!'}
            </p>
            <Button 
              onClick={() => navigate('/door')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {language === 'en' ? 'Start Planning' : 'Începe Planificarea'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion stats
  const completedKeys = currentPlan.reviewData?.completedKeys?.length || 0;
  const totalKeys = currentPlan.keyPoints?.length || 4;
  const completionPercentage = (completedKeys / totalKeys) * 100;

  return (
    <Card className="bg-card border border-primary/20 shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Weekly Missions' : 'Misiuni Săptămânale'}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentPlan.weekKey}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Domino Door Title */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border-l-4 border-primary">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {language === 'en' ? 'Domino Door' : 'Domino Door'}
          </p>
          <p className="text-foreground font-medium">{currentPlan.dominoTitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'en' ? 'Progress' : 'Progres'}
            </span>
            <span className="font-medium text-foreground">
              {completedKeys}/{totalKeys} {language === 'en' ? 'completed' : 'completate'}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Key Points List */}
        <div className="space-y-2">
          {currentPlan.keyPoints?.slice(0, 4).map((keyPoint, index) => {
            const isCompleted = currentPlan.reviewData?.completedKeys?.includes(keyPoint.id);
            const isContinued = (keyPoint as any).isContinued;
            
            return (
              <div 
                key={keyPoint.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isCompleted 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-accent/20 border border-border/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`flex-grow text-sm ${
                  isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}>
                  {keyPoint.title}
                </span>
                {isContinued && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Continued' : 'Continuat'}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* View Details Button */}
        <Button 
          variant="outline" 
          className="w-full border-primary/50 hover:bg-primary/10"
          onClick={() => navigate('/door')}
        >
          {language === 'en' ? 'View Details' : 'Vezi Detalii'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
