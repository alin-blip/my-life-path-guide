import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Compass, 
  Target, 
  Clock, 
  BarChart3, 
  RefreshCw, 
  Rocket,
  Lock
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OnboardingFlowProps {
  currentDay: number;
  completedDays: number[];
  onDayComplete: (day: number) => void;
}

interface DayContent {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ElementType;
  task: string;
  taskEn: string;
  actionLink: string;
  actionLabel: string;
  actionLabelEn: string;
}

const daysContent: DayContent[] = [
  {
    title: 'Descoperă-ți Baza',
    titleEn: 'Discover Your Foundation',
    description: 'Înțelege scorurile tale din Vision 2026 și primele task-uri personalizate.',
    descriptionEn: 'Understand your Vision 2026 scores and your first personalized tasks.',
    icon: Compass,
    task: 'Vizualizează Dashboard-ul Vision 2026',
    taskEn: 'View your Vision 2026 Dashboard',
    actionLink: '/vision-2026/dashboard',
    actionLabel: 'Deschide Dashboard',
    actionLabelEn: 'Open Dashboard',
  },
  {
    title: 'Prima Ta Rutină',
    titleEn: 'Your First Routine',
    description: 'Învață sistemul Core 4 și completează primul tău Stack zilnic.',
    descriptionEn: 'Learn the Core 4 system and complete your first daily Stack.',
    icon: Target,
    task: 'Completează Stack-ul Zilnic',
    taskEn: 'Complete the Daily Stack',
    actionLink: '/stack?type=daily-master',
    actionLabel: 'Start Stack',
    actionLabelEn: 'Start Stack',
  },
  {
    title: 'Focus Power',
    titleEn: 'Focus Power',
    description: 'Prima ta sesiune de focus profund cu timer Pomodoro.',
    descriptionEn: 'Your first deep focus session with Pomodoro timer.',
    icon: Clock,
    task: 'Completează o sesiune de 25 minute',
    taskEn: 'Complete a 25-minute session',
    actionLink: '/focus',
    actionLabel: 'Start Focus',
    actionLabelEn: 'Start Focus',
  },
  {
    title: 'Planifică Săptămâna',
    titleEn: 'Plan Your Week',
    description: 'Învață Command Center-ul și setează obiectivul săptămânii.',
    descriptionEn: 'Learn the Command Center and set your weekly goal.',
    icon: Target,
    task: 'Setează obiectivul săptămânii',
    taskEn: 'Set your weekly goal',
    actionLink: '/door',
    actionLabel: 'Deschide Planificare',
    actionLabelEn: 'Open Planning',
  },
  {
    title: 'Măsoară Progresul',
    titleEn: 'Measure Progress',
    description: 'Înțelege cum funcționează dashboard-ul celor 4 arii.',
    descriptionEn: 'Understand how the 4 areas dashboard works.',
    icon: BarChart3,
    task: 'Explorează Dashboard-ul Principal',
    taskEn: 'Explore the Main Dashboard',
    actionLink: '/dashboard',
    actionLabel: 'Vezi Dashboard',
    actionLabelEn: 'View Dashboard',
  },
  {
    title: 'Review și Ajustare',
    titleEn: 'Review & Adjust',
    description: 'Prima ta analiză săptămânală - ce a funcționat și ce ajustezi.',
    descriptionEn: 'Your first weekly review - what worked and what to adjust.',
    icon: RefreshCw,
    task: 'Completează Review-ul Săptămânal',
    taskEn: 'Complete Weekly Review',
    actionLink: '/door',
    actionLabel: 'Review Săptămânal',
    actionLabelEn: 'Weekly Review',
  },
  {
    title: 'Autonomie Completă',
    titleEn: 'Complete Autonomy',
    description: 'Ai toate instrumentele! Acum e momentul să construiești obiceiuri.',
    descriptionEn: 'You have all the tools! Now it is time to build habits.',
    icon: Rocket,
    task: 'Explorează toate funcționalitățile',
    taskEn: 'Explore all features',
    actionLink: '/azi',
    actionLabel: 'Hai la Treabă!',
    actionLabelEn: "Let's Go!",
  },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  currentDay,
  completedDays,
  onDayComplete,
}) => {
  const { language } = useLanguage();
  const progress = (completedDays.length / 7) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'ro' ? 'Călătoria Ta de 7 Zile' : 'Your 7-Day Journey'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ro' 
            ? 'Învață pas cu pas cum să folosești LifeOS pentru rezultate maxime' 
            : 'Learn step by step how to use LifeOS for maximum results'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {language === 'ro' ? 'Progres' : 'Progress'}
          </span>
          <span className="text-sm font-medium">{completedDays.length}/7 {language === 'ro' ? 'zile' : 'days'}</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {daysContent.map((day, index) => {
          const dayNumber = index + 1;
          const isCompleted = completedDays.includes(dayNumber);
          const isCurrent = dayNumber === currentDay;
          const isLocked = dayNumber > currentDay && !isCompleted;

          return (
            <Card 
              key={dayNumber}
              className={`transition-all ${
                isCurrent ? 'ring-2 ring-primary shadow-lg' : ''
              } ${isLocked ? 'opacity-60' : ''} ${isCompleted ? 'bg-muted/30' : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isCompleted ? 'bg-green-500/10' : isCurrent ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <day.icon className={`w-5 h-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {language === 'ro' ? 'Ziua' : 'Day'} {dayNumber}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {language === 'ro' ? 'Acum' : 'Now'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {language === 'ro' ? day.title : day.titleEn}
                    </h3>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {language === 'ro' ? day.description : day.descriptionEn}
                </p>
                
                {(isCurrent || isCompleted) && !isLocked && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={isCompleted ? 'text-green-600 line-through' : ''}>
                        {language === 'ro' ? day.task : day.taskEn}
                      </span>
                    </div>
                    
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Link to={day.actionLink}>
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4 mr-1" />
                            {language === 'ro' ? day.actionLabel : day.actionLabelEn}
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          onClick={() => onDayComplete(dayNumber)}
                        >
                          {language === 'ro' ? 'Marchează completat' : 'Mark complete'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
