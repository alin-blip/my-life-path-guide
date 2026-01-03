import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, Dumbbell, Heart, Briefcase, CheckSquare, Target, 
  Play, Check, ChevronRight, ArrowLeft
} from 'lucide-react';
import { ChampionRoutineStep } from '@/components/champion-routine/ChampionRoutineStep';
import { WorkoutStep } from '@/components/daily-flow/WorkoutStep';
import { RelationshipStep } from '@/components/daily-flow/RelationshipStep';
import { ContentStep } from '@/components/daily-flow/ContentStep';
import { TodoStep } from '@/components/daily-flow/TodoStep';
import { FocusStep } from '@/components/daily-flow/FocusStep';
import { useDailyFlow } from '@/hooks/useDailyFlow';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const FLOW_STEPS = [
  { id: 'morning', label: 'Rutina de Campion', icon: Sun, color: 'text-amber-500' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'text-green-500' },
  { id: 'relationships', label: 'Relații', icon: Heart, color: 'text-pink-500' },
  { id: 'business', label: 'Business / Content', icon: Briefcase, color: 'text-blue-500' },
  { id: 'todo', label: 'To Do', icon: CheckSquare, color: 'text-purple-500' },
  { id: 'focus', label: 'Focus Room', icon: Target, color: 'text-orange-500' },
];

const DailyFlow = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const { 
    session, 
    isLoading, 
    startDay, 
    completeStep, 
    isStepCompleted,
    completedCount,
    totalSteps
  } = useDailyFlow();

  const progress = (completedCount / totalSteps) * 100;
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });

  const handleStartDay = async () => {
    await startDay();
    setActiveStep('morning');
  };

  const handleStepComplete = async (stepId: string) => {
    await completeStep(stepId);
    // Move to next step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (currentIndex < FLOW_STEPS.length - 1) {
      setActiveStep(FLOW_STEPS[currentIndex + 1].id);
    } else {
      setActiveStep(null);
    }
  };

  const renderActiveStep = () => {
    switch (activeStep) {
      case 'morning':
        return <ChampionRoutineStep onComplete={() => handleStepComplete('morning')} />;
      case 'fitness':
        return <WorkoutStep onComplete={() => handleStepComplete('fitness')} />;
      case 'relationships':
        return <RelationshipStep onComplete={() => handleStepComplete('relationships')} />;
      case 'business':
        return <ContentStep onComplete={() => handleStepComplete('business')} />;
      case 'todo':
        return <TodoStep onComplete={() => handleStepComplete('todo')} />;
      case 'focus':
        return <FocusStep onComplete={() => handleStepComplete('focus')} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Flow</h1>
            <p className="text-muted-foreground capitalize">{today}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {session && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progres Zilnic</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{totalSteps} pași</span>
              </div>
              <Progress value={progress} className="h-3" />
              {completedCount === totalSteps && (
                <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Felicitări! Ai completat toate task-urile de azi!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Start Day Button */}
        {!session && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6 text-center">
              <Sun className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Bună dimineața!</h2>
              <p className="text-muted-foreground mb-6">
                Ești gata să începi o zi productivă?
              </p>
              <Button size="lg" onClick={handleStartDay} className="gap-2">
                <Play className="h-5 w-5" />
                Începe Ziua
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Step */}
        {activeStep && (
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveStep(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi la pași
            </Button>
            {renderActiveStep()}
          </div>
        )}

        {/* Steps Grid */}
        {session && !activeStep && (
          <div className="grid gap-4">
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = isStepCompleted(step.id);
              
              return (
                <Card 
                  key={step.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCompleted ? 'bg-muted/50 border-green-500/30' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          isCompleted ? 'bg-green-500/20' : 'bg-muted'
                        }`}>
                          {isCompleted ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Icon className={`h-5 w-5 ${step.color}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{step.label}</p>
                          <p className="text-sm text-muted-foreground">
                            Pasul {index + 1} din {FLOW_STEPS.length}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyFlow;
