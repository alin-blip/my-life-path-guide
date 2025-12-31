import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Play, 
  Plus, 
  Target,
  Heart,
  Brain,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
  Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { EveningReviewModal } from '@/components/daily/EveningReviewModal';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  list_type: string;
  area?: string;
}

interface AreaProgress {
  body: number;
  being: number;
  balance: number;
  business: number;
}

export const TodayDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [topTasks, setTopTasks] = useState<Task[]>([]);
  const [areaProgress, setAreaProgress] = useState<AreaProgress>({ body: 0, being: 0, balance: 0, business: 0 });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEveningReview, setShowEveningReview] = useState(false);

  const locale = language === 'ro' ? ro : enUS;
  const today = new Date();
  const formattedDate = format(today, "EEEE, d MMMM", { locale });

  const getWeekKey = () => {
    const now = new Date();
    const jan4 = new Date(now.getFullYear(), 0, 4);
    const startOfWeek = new Date(jan4);
    startOfWeek.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const diff = now.getTime() - startOfWeek.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    let weekNumber = Math.floor(diff / oneWeek) + 1;
    let year = now.getFullYear();
    if (weekNumber < 1) { year--; weekNumber = 52; }
    else if (weekNumber > 52 && now.getMonth() === 0) { weekNumber = 1; }
    return `door-week-${year}-${String(weekNumber).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const weekKey = getWeekKey();
        const dayOfWeek = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'][today.getDay()];

        // Fetch top priority tasks (hit list)
        const { data: tasksData } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_key', weekKey)
          .eq('list_type', 'hit')
          .order('priority', { ascending: true })
          .limit(3);

        if (tasksData) {
          setTopTasks(tasksData);
        }

        // Fetch all tasks to calculate area progress
        const { data: allTasks } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_key', weekKey);

        if (allTasks) {
          const areas: Record<string, { total: number; completed: number }> = {
            body: { total: 0, completed: 0 },
            being: { total: 0, completed: 0 },
            balance: { total: 0, completed: 0 },
            business: { total: 0, completed: 0 }
          };

          allTasks.forEach(task => {
            const area = task.area || categorizeTask(task.title);
            if (area && areas[area]) {
              areas[area].total++;
              if (task.completed) areas[area].completed++;
            }
          });

          setAreaProgress({
            body: areas.body.total ? Math.round((areas.body.completed / areas.body.total) * 100) : 0,
            being: areas.being.total ? Math.round((areas.being.completed / areas.being.total) * 100) : 0,
            balance: areas.balance.total ? Math.round((areas.balance.completed / areas.balance.total) * 100) : 0,
            business: areas.business.total ? Math.round((areas.business.completed / areas.business.total) * 100) : 0,
          });
        }

        // Fetch streak
        const { data: statsData } = await supabase
          .from('user_statistics')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        if (statsData) {
          setStreak(statsData.current_streak || 0);
        }
      } catch (error) {
        console.error('Error fetching today data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const categorizeTask = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('sport') || lowerTitle.includes('fitness') || lowerTitle.includes('somn') || lowerTitle.includes('sănăt')) return 'body';
    if (lowerTitle.includes('medit') || lowerTitle.includes('jurnal') || lowerTitle.includes('gratitud') || lowerTitle.includes('rugăciune')) return 'being';
    if (lowerTitle.includes('familie') || lowerTitle.includes('prieten') || lowerTitle.includes('relații') || lowerTitle.includes('timp')) return 'balance';
    if (lowerTitle.includes('muncă') || lowerTitle.includes('business') || lowerTitle.includes('venituri') || lowerTitle.includes('proiect')) return 'business';
    return 'business';
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('user_tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    if (!error) {
      setTopTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    }
  };

  const areaConfig = [
    { key: 'body', label: language === 'ro' ? 'Corp' : 'Body', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-500' },
    { key: 'being', label: language === 'ro' ? 'Suflet' : 'Being', icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500' },
    { key: 'balance', label: language === 'ro' ? 'Relații' : 'Balance', icon: Users, color: 'text-green-500', bgColor: 'bg-green-500' },
    { key: 'business', label: language === 'ro' ? 'Business' : 'Business', icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  ];

  const overallProgress = Math.round((areaProgress.body + areaProgress.being + areaProgress.balance + areaProgress.business) / 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground capitalize">{formattedDate}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ro' ? 'Să facem progres azi!' : "Let's make progress today!"}
        </p>
      </div>

      {/* Streak & Quick Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2 rounded-full border border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-foreground">{streak}</span>
          <span className="text-sm text-muted-foreground">{language === 'ro' ? 'zile streak' : 'day streak'}</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">{overallProgress}%</span>
          <span className="text-sm text-muted-foreground">{language === 'ro' ? 'progres' : 'progress'}</span>
        </div>
      </div>

      {/* Top 3 Priorities */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {language === 'ro' ? 'Priorități Azi' : 'Top Priorities'}
            </h2>
            <Link to="/door">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {language === 'ro' ? 'Vezi toate' : 'View all'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {topTasks.length > 0 ? (
            <div className="space-y-3">
              {topTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    task.completed 
                      ? 'bg-muted/50 text-muted-foreground' 
                      : 'bg-background hover:bg-muted/50'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-left ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-3">
                {language === 'ro' ? 'Nu ai priorități setate pentru azi' : 'No priorities set for today'}
              </p>
              <Link to="/door">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ro' ? 'Adaugă task-uri' : 'Add tasks'}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Core 4 Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {language === 'ro' ? 'Progres pe Cele 4 Arii' : 'Core 4 Progress'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {areaConfig.map((area) => {
              const progress = areaProgress[area.key as keyof AreaProgress];
              return (
                <div key={area.key} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-full ${area.bgColor}/10`}>
                      <area.icon className={`w-4 h-4 ${area.color}`} />
                    </div>
                    <span className="text-sm font-medium">{area.label}</span>
                    <span className="ml-auto text-sm font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/stack?type=daily-master">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary">
            <Play className="w-5 h-5 text-primary" />
            <span className="text-sm">{language === 'ro' ? 'Stack Zilnic' : 'Daily Stack'}</span>
          </Button>
        </Link>
        <Link to="/focus">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent/10 hover:border-accent">
            <Target className="w-5 h-5 text-accent" />
            <span className="text-sm">{language === 'ro' ? 'Focus' : 'Focus'}</span>
          </Button>
        </Link>
        <Link to="/door">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-500/10 hover:border-green-500">
            <Plus className="w-5 h-5 text-green-500" />
            <span className="text-sm">{language === 'ro' ? 'Adaugă Task' : 'Add Task'}</span>
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-indigo-500/10 hover:border-indigo-500"
          onClick={() => setShowEveningReview(true)}
        >
          <Moon className="w-5 h-5 text-indigo-500" />
          <span className="text-sm">{language === 'ro' ? 'Review Seară' : 'Evening Review'}</span>
        </Button>
      </div>

      {/* Evening Review Modal */}
      <EveningReviewModal 
        open={showEveningReview} 
        onOpenChange={setShowEveningReview} 
      />
    </div>
  );
};
