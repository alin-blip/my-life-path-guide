import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getPrincipleDescription } from '@/services/napoleonHillBookService';
import { BookOpen, CheckCircle2, Flame, Trophy, Target, Lightbulb } from 'lucide-react';

export const ReadingProgressDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { principleStats, getOverallStats, isLoading } = useReadingProgress();
  
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-primary/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  const stats = getOverallStats();
  
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Reading Progress' : 'Progres Lectură'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label={language === 'en' ? 'Pages Read' : 'Pagini Citite'}
            value={`${stats.totalPagesRead}/365`}
            color="text-blue-500"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label={language === 'en' ? 'Actions Done' : 'Acțiuni Făcute'}
            value={stats.totalActionsCompleted.toString()}
            color="text-green-500"
          />
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label={language === 'en' ? 'Day Streak' : 'Zile Consecutive'}
            value={stats.currentStreak.toString()}
            color="text-orange-500"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label={language === 'en' ? 'Principles Mastered' : 'Principii Stăpânite'}
            value={`${stats.principlesMastered}/13`}
            color="text-amber-500"
          />
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'en' ? 'Overall Progress' : 'Progres Total'}
            </span>
            <span className="font-medium">{stats.overallPercentage}%</span>
          </div>
          <Progress value={stats.overallPercentage} className="h-3" />
        </div>
      </Card>

      {/* Principle Progress */}
      <Card className="p-6 bg-card border-primary/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Progress by Principle' : 'Progres per Principiu'}
        </h3>
        
        <div className="space-y-4">
          {principleStats.map((stat, index) => (
            <PrincipleProgressItem
              key={stat.principle}
              principle={stat.principle}
              pagesRead={stat.pagesRead}
              percentage={stat.percentage}
              actionsCompleted={stat.actionsCompleted}
              index={index + 1}
              language={language}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-background/50 rounded-lg p-3 text-center border border-border/50">
    <div className={`${color} flex justify-center mb-2`}>{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

interface PrincipleProgressItemProps {
  principle: string;
  pagesRead: number;
  percentage: number;
  actionsCompleted: number;
  index: number;
  language: 'en' | 'ro';
}

const PrincipleProgressItem: React.FC<PrincipleProgressItemProps> = ({
  principle,
  pagesRead,
  percentage,
  actionsCompleted,
  index,
  language
}) => {
  const description = getPrincipleDescription(principle);
  
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            {index}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{principle}</span>
              {percentage >= 80 && (
                <Trophy className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-medium">{percentage}%</div>
          <div className="text-xs text-muted-foreground">
            {actionsCompleted} {language === 'en' ? 'actions' : 'acțiuni'}
          </div>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ReadingProgressDashboard;
