import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, Brain, Heart, Briefcase, ArrowRight, Target, ListTodo, Star, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getTodayAbbrev, getWeekKey } from '@/utils/weekUtils';
import { Separator } from '@/components/ui/separator';
import { ObjectiveVisionBoard } from './ObjectiveVisionBoard';

interface Mission {
  id: string;
  category: MissionCategory;
  title: string | null;
  measurable_result: string | null;
  end_goal_value: string | null;
  completed: boolean;
  mission_type: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  day_of_week: string | null;
  list_type: string;
}

type MissionPeriod = 'monthly' | 'quarterly' | 'annual';

export const ObjectivesCard: React.FC = () => {
  const { language } = useLanguage();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MissionPeriod>('monthly');
  const [missions, setMissions] = useState<Record<MissionPeriod, Mission[]>>({
    monthly: [],
    quarterly: [],
    annual: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Today's Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bigOne, setBigOne] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const today = new Date();
  const dateLocale = i18n.language === 'ro' ? ro : enUS;
  const weekKey = getWeekKey(today);
  const todayAbbrev = getTodayAbbrev();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', user.id)
        .in('mission_type', ['monthly', 'quarterly', 'annual']);

      if (error) throw error;

      const grouped: Record<MissionPeriod, Mission[]> = {
        monthly: [],
        quarterly: [],
        annual: []
      };

      (data || []).forEach((mission) => {
        const type = mission.mission_type as MissionPeriod;
        if (grouped[type]) {
          grouped[type].push({
            ...mission,
            category: mission.category as MissionCategory,
            completed: mission.completed ?? false
          });
        }
      });

      setMissions(grouped);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load today's tasks
  const loadTodayData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(new Date(), 'yyyy-MM-dd');

      // Load Big One from champion_routine_logs
      const { data: routineLog } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (routineLog) {
        setBigOne(routineLog.big_one_today || '');
      }

      // Load tasks from user_tasks for today
      const { data: tasksData } = await supabase
        .from('user_tasks')
        .select('id, title, completed, day_of_week, task_type')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .in('task_type', ['hit', 'do'])
        .or(`day_of_week.eq.${todayAbbrev},day_of_week.is.null`);

      if (tasksData) {
        setTasks(
          tasksData.map((task) => ({
            id: task.id,
            title: task.title,
            completed: task.completed || false,
            day_of_week: task.day_of_week,
            list_type: task.task_type || 'do',
          }))
        );
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [weekKey, todayAbbrev]);

  useEffect(() => {
    loadTodayData();

    let channel: any = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('today-tasks-realtime-objectives')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tasks',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadTodayData();
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadTodayData]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          week_key: weekKey,
          task_type: 'do',
          list_type: 'do',
          title: newTaskTitle.trim(),
          day_of_week: todayAbbrev,
          completed: false,
          position: tasks.length,
        })
        .select('id, title, completed, day_of_week, task_type')
        .single();

      if (error) throw error;

      if (data) {
        setTasks([
          ...tasks,
          {
            id: data.id,
            title: data.title,
            completed: data.completed || false,
            day_of_week: data.day_of_week,
            list_type: data.task_type || 'do',
          },
        ]);
      }
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('user_tasks').delete().eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSetBigOne = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(new Date(), 'yyyy-MM-dd');

      const { data: existing } = await supabase
        .from('champion_routine_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('champion_routine_logs')
          .update({ big_one_today: task.title })
          .eq('user_id', user.id)
          .eq('date', todayStr);
      } else {
        await supabase
          .from('champion_routine_logs')
          .insert({
            user_id: user.id,
            date: todayStr,
            big_one_today: task.title
          });
      }

      setBigOne(task.title);
    } catch (error) {
      console.error('Error setting big one:', error);
    }
  };

  const getCategoryIcon = (category: MissionCategory) => {
    switch (category) {
      case 'body': return <Dumbbell className="h-4 w-4" />;
      case 'being': return <Brain className="h-4 w-4" />;
      case 'balance': return <Heart className="h-4 w-4" />;
      case 'business': return <Briefcase className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: MissionCategory) => {
    switch (category) {
      case 'body': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'being': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'balance': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'business': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCategoryName = (category: MissionCategory) => {
    const names: Record<string, Record<MissionCategory, string>> = {
      en: { body: 'Body', being: 'Spirituality', balance: 'Relationships', business: 'Business' },
      ro: { body: 'Corp', being: 'Spiritualitate', balance: 'Relații', business: 'Business' }
    };
    return names[language]?.[category] || category;
  };

  const getTabLabel = (period: MissionPeriod) => {
    const labels: Record<string, Record<MissionPeriod, string>> = {
      en: { monthly: 'Monthly', quarterly: '90 Days', annual: 'Annual' },
      ro: { monthly: 'Lunar', quarterly: '90 Zile', annual: 'Anual' }
    };
    return labels[language]?.[period] || period;
  };

  const getPeriodTitle = (period: MissionPeriod) => {
    const now = new Date();
    const locale = language === 'ro' ? ro : enUS;
    
    switch (period) {
      case 'monthly':
        const month = format(now, 'MMMM yyyy', { locale });
        return language === 'en' 
          ? `Monthly Objectives • ${month}` 
          : `Obiective Lunare • ${month}`;
      case 'quarterly':
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        return language === 'en' 
          ? `90-Day Objectives • Q${quarter} ${now.getFullYear()}` 
          : `Obiective 90 Zile • T${quarter} ${now.getFullYear()}`;
      case 'annual':
        return language === 'en' 
          ? `Annual Objectives • ${now.getFullYear()}` 
          : `Obiective Anuale • ${now.getFullYear()}`;
    }
  };

  const getNavigationTab = (period: MissionPeriod) => {
    switch (period) {
      case 'monthly': return 'monthly';
      case 'quarterly': return 'quarterly';
      case 'annual': return 'annual';
    }
  };

  const getCategoryProgress = (category: MissionCategory, period: MissionPeriod) => {
    const categoryMissions = missions[period].filter(m => m.category === category);
    if (categoryMissions.length === 0) return 0;
    const completed = categoryMissions.filter(m => m.completed).length;
    return Math.round((completed / categoryMissions.length) * 100);
  };

  const categories: MissionCategory[] = ['body', 'being', 'balance', 'business'];
  const currentMissions = missions[activeTab];

  const renderCategorySection = (category: MissionCategory) => {
    const categoryMissions = currentMissions.filter(m => m.category === category);
    const progress = getCategoryProgress(category, activeTab);
    const colorClass = getCategoryColor(category);

    return (
      <div key={category} className={`p-3 rounded-lg border ${colorClass}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <span className="font-medium">{getCategoryName(category)}</span>
          </div>
          <span className="text-sm opacity-70">{progress}%</span>
        </div>
        <div className="space-y-1">
          {categoryMissions.length > 0 ? (
            categoryMissions.slice(0, 2).map((mission, idx) => (
              <div 
                key={mission.id} 
                className={`text-xs flex items-start gap-2 ${mission.completed ? 'line-through opacity-50' : ''}`}
              >
                <span className="opacity-60">{idx + 1}.</span>
                <span>{mission.title || mission.measurable_result || '-'}</span>
              </div>
            ))
          ) : (
            <div className="text-xs opacity-50 italic">
              {language === 'en' ? 'No objectives set' : 'Fără obiective setate'}
            </div>
          )}
          {categoryMissions.length > 2 && (
            <div className="text-xs opacity-50">
              +{categoryMissions.length - 2} {language === 'en' ? 'more' : 'mai multe'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-4">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card mb-6 animate-fade-in">
      <CardContent className="p-4">
        {/* Vision Board - always show first */}
        <ObjectiveVisionBoard 
          language={language}
          annualMissions={missions.annual}
          onRefresh={loadMissions}
        />

        {/* Tabs for objectives */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MissionPeriod)}>
          <TabsList className="grid grid-cols-3 mb-4 glass-card p-1 rounded-xl w-full">
            <TabsTrigger 
              value="monthly" 
              className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground text-sm"
            >
              {getTabLabel('monthly')}
            </TabsTrigger>
            <TabsTrigger 
              value="quarterly" 
              className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground text-sm"
            >
              {getTabLabel('quarterly')}
            </TabsTrigger>
            <TabsTrigger 
              value="annual" 
              className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground text-sm"
            >
              {getTabLabel('annual')}
            </TabsTrigger>
          </TabsList>

          {(['monthly', 'quarterly', 'annual'] as MissionPeriod[]).map((period) => (
            <TabsContent key={period} value={period} className="mt-0">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {getPeriodTitle(period)}
                </h3>
                
                {/* Category sections */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(renderCategorySection)}
                </div>
                
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/door?tab=${getNavigationTab(period)}`)}
                    className="text-primary hover:text-primary/80"
                  >
                    {language === 'en' 
                      ? `View all ${getTabLabel(period).toLowerCase()} objectives` 
                      : `Vezi toate obiectivele ${getTabLabel(period).toLowerCase()}`}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Separator */}
        <Separator className="my-4" />

        {/* Today's Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">
                {i18n.language === 'ro' ? 'Taskuri Azi' : 'Today\'s Tasks'}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {format(today, 'EEEE, d MMM', { locale: dateLocale })}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{tasks.length}
            </span>
          </div>
          
          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Big One Today */}
          {bigOne && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                <Star className="h-4 w-4 fill-primary" />
                {i18n.language === 'ro' ? 'Cel Mai Important' : 'Big One Today'}
              </div>
              <p className="text-foreground font-medium">{bigOne}</p>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {isLoadingTasks ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {i18n.language === 'ro' ? 'Nu ai taskuri pentru azi' : 'No tasks for today'}
              </p>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    {!bigOne && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSetBigOne(task.id)}
                        title={i18n.language === 'ro' ? 'Setează ca Big One' : 'Set as Big One'}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Task */}
          {isAddingTask ? (
            <div className="flex gap-2 mt-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={i18n.language === 'ro' ? 'Ce ai de făcut azi?' : 'What do you need to do today?'}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                autoFocus
              />
              <Button size="sm" onClick={handleAddTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'ro' ? 'Adaugă task' : 'Add task'}
            </Button>
          )}

          {/* Completion message */}
          {tasks.length > 0 && completedCount === tasks.length && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
              <CheckCircle2 className="h-4 w-4" />
              {i18n.language === 'ro' ? 'Toate taskurile completate!' : 'All tasks completed!'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
