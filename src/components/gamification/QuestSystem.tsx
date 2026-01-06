import React from 'react';
import { useQuests, Quest, QuestProgress } from '@/hooks/useQuests';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, CheckCircle2, Clock, Trophy, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuestCard: React.FC<{ questProgress: QuestProgress }> = ({ questProgress }) => {
  const { quest, current_value, completed } = questProgress;
  const progressPercent = Math.min((current_value / quest.target_value) * 100, 100);

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      completed 
        ? "bg-green-500/10 border-green-500/30" 
        : "bg-card border-border hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{quest.icon || '🎯'}</span>
          <div>
            <h4 className={cn(
              "font-medium text-sm",
              completed && "line-through text-muted-foreground"
            )}>
              {quest.title}
            </h4>
            {quest.description && (
              <p className="text-xs text-muted-foreground">{quest.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              +{quest.xp_reward}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current_value} / {quest.target_value}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>
    </div>
  );
};

const QuestTypeSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode;
  quests: QuestProgress[];
  emptyMessage: string;
}> = ({ title, icon, quests, emptyMessage }) => {
  const completedCount = quests.filter(q => q.completed).length;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Badge variant={completedCount === quests.length && quests.length > 0 ? "default" : "outline"}>
          {completedCount}/{quests.length}
        </Badge>
      </div>
      
      {quests.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="grid gap-2">
          {quests.map(quest => (
            <QuestCard key={quest.id} questProgress={quest} />
          ))}
        </div>
      )}
    </div>
  );
};

export const QuestSystem: React.FC = () => {
  const { language } = useLanguage();
  const { progress, isLoading, getQuestsByType, getCompletedCount, getTotalCount } = useQuests();

  const dailyQuests = getQuestsByType('daily');
  const weeklyQuests = getQuestsByType('weekly');
  const monthlyQuests = getQuestsByType('monthly');
  const specialQuests = getQuestsByType('special');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCompleted = getCompletedCount();
  const totalQuests = getTotalCount();
  const totalXPAvailable = progress.reduce((sum, p) => 
    p.completed ? sum : sum + p.quest.xp_reward, 0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {language === 'ro' ? 'Misiuni' : 'Quests'}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
              {totalCompleted}/{totalQuests}
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              <Zap className="w-3 h-3 mr-1" />
              {totalXPAvailable} XP {language === 'ro' ? 'disponibil' : 'available'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="daily" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {language === 'ro' ? 'Zilnic' : 'Daily'}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              <Flame className="w-3 h-3 mr-1" />
              {language === 'ro' ? 'Săptămânal' : 'Weekly'}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              {language === 'ro' ? 'Lunar' : 'Monthly'}
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              Special
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <QuestTypeSection 
              title={language === 'ro' ? 'Misiuni Zilnice' : 'Daily Quests'}
              icon={<Clock className="w-4 h-4 text-blue-500" />}
              quests={dailyQuests}
              emptyMessage={language === 'ro' ? 'Nicio misiune zilnică' : 'No daily quests'}
            />
          </TabsContent>

          <TabsContent value="weekly">
            <QuestTypeSection 
              title={language === 'ro' ? 'Misiuni Săptămânale' : 'Weekly Quests'}
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              quests={weeklyQuests}
              emptyMessage={language === 'ro' ? 'Nicio misiune săptămânală' : 'No weekly quests'}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <QuestTypeSection 
              title={language === 'ro' ? 'Misiuni Lunare' : 'Monthly Quests'}
              icon={<Star className="w-4 h-4 text-purple-500" />}
              quests={monthlyQuests}
              emptyMessage={language === 'ro' ? 'Nicio misiune lunară' : 'No monthly quests'}
            />
          </TabsContent>

          <TabsContent value="special">
            <QuestTypeSection 
              title={language === 'ro' ? 'Misiuni Speciale' : 'Special Quests'}
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              quests={specialQuests}
              emptyMessage={language === 'ro' ? 'Nicio misiune specială' : 'No special quests'}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
