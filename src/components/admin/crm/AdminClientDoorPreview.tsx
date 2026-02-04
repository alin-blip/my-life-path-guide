import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, Target, CheckCircle2, Circle, Flame,
  Calendar, ListTodo, Lightbulb, ChevronLeft, ChevronRight,
  Clock, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ClientObjectivesSection } from './ClientObjectivesSection';

interface AdminClientDoorPreviewProps {
  userId: string;
  userEmail: string;
  userName: string | null;
  onBack: () => void;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  day_of_week: string | null;
  priority: number | null;
  list_type: string;
  created_at: string;
}

interface IdeaItem {
  id: string;
  text: string;
  category: string;
  priority: number;
  status: string;
  created_at: string;
}

interface WeekStats {
  total: number;
  completed: number;
  hitCount: number;
  doCount: number;
}

interface Mission {
  id: string;
  category: string;
  title: string;
  mission_type: string;
  period: string | null;
  created_at: string;
}

interface WeeklyPlanning {
  domino_title: string | null;
  week_goal: string | null;
  key_points: { id: string; title: string; completed: boolean }[] | null;
}

export const AdminClientDoorPreview: React.FC<AdminClientDoorPreviewProps> = ({
  userId,
  userEmail,
  userName,
  onBack
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [weekStats, setWeekStats] = useState<WeekStats>({ total: 0, completed: 0, hitCount: 0, doCount: 0 });
  const [missions, setMissions] = useState<{
    annual: Mission[];
    quarterly: Mission[];
    monthly: Mission[];
  }>({ annual: [], quarterly: [], monthly: [] });
  const [weeklyPlanning, setWeeklyPlanning] = useState<WeeklyPlanning | null>(null);

  const weekKey = `door-week-${format(currentWeek, 'yyyy-MM-dd')}`;

  useEffect(() => {
    loadClientData();
    logPreviewSession();
  }, [userId, weekKey]);

  const logPreviewSession = async () => {
    if (!user) return;
    try {
      await supabase.from('crm_admin_sessions').insert({
        admin_id: user.id,
        admin_email: user.email,
        target_user_id: userId,
        target_email: userEmail,
        session_type: 'door_preview',
        notes: `Viewing Door data for week ${weekKey}`
      });
    } catch (error) {
      console.error('Error logging preview session:', error);
    }
  };

  const loadClientData = async () => {
    try {
      setLoading(true);

      // Fetch tasks using admin service role (via RPC or direct query with service role)
      const { data: tasksData, error: tasksError } = await supabase
        .from('hot_list_items')
        .select('id, title, completed, day_of_week, priority, list_type, created_at')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Fetch ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas_bank')
        .select('id, text, category, priority, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ideasError) throw ideasError;

      setTasks(tasksData || []);
      setIdeas(ideasData || []);

      // Calculate stats
      const hitTasks = tasksData?.filter(t => t.list_type === 'hit') || [];
      const doTasks = tasksData?.filter(t => t.list_type === 'do') || [];
      const allTasks = [...hitTasks, ...doTasks];
      
      setWeekStats({
        total: allTasks.length,
        completed: allTasks.filter(t => t.completed).length,
        hitCount: hitTasks.length,
        doCount: doTasks.length
      });

      // Fetch missions (objectives)
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const currentMonth = new Date().getMonth() + 1;
      const currentMonthStr = currentMonth.toString().padStart(2, '0');
      
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('id, category, title, mission_type, period, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!missionsError && missionsData) {
        // Group by mission type using period field
        // period formats: "2026" (annual), "2026-Q1" (quarterly), "2026-02" (monthly)
        const annualMissions = missionsData.filter(m => 
          m.mission_type === 'annual' && m.period === String(currentYear)
        );
        const quarterlyMissions = missionsData.filter(m => 
          m.mission_type === 'quarterly' && m.period === `${currentYear}-Q${currentQuarter}`
        );
        const monthlyMissions = missionsData.filter(m => 
          m.mission_type === 'monthly' && m.period === `${currentYear}-${currentMonthStr}`
        );

        setMissions({
          annual: annualMissions,
          quarterly: quarterlyMissions,
          monthly: monthlyMissions
        });
      }

      // Fetch weekly planning (Domino Door)
      const { data: planningData, error: planningError } = await supabase
        .from('weekly_planning')
        .select('domino_title, week_goal, key_points')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (!planningError && planningData) {
        setWeeklyPlanning({
          domino_title: planningData.domino_title,
          week_goal: planningData.week_goal,
          key_points: planningData.key_points as { id: string; title: string; completed: boolean }[] | null
        });
      } else {
        setWeeklyPlanning(null);
      }

    } catch (error) {
      console.error('Error loading client data:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca datele clientului',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const getPriorityBadge = (priority: number | null) => {
    switch (priority) {
      case 4: return <Badge className="bg-red-500 text-white text-xs">Urgent-Important</Badge>;
      case 3: return <Badge className="bg-orange-500 text-white text-xs">Important</Badge>;
      case 2: return <Badge className="bg-yellow-500 text-black text-xs">Urgent</Badge>;
      default: return null;
    }
  };

  const getDayLabel = (day: string | null) => {
    const days: Record<string, string> = {
      'M': 'Luni', 'T': 'Marți', 'W': 'Miercuri', 
      'Th': 'Joi', 'F': 'Vineri', 'Sa': 'Sâmbătă', 'Su': 'Duminică'
    };
    return day ? days[day] || day : 'Nealocat';
  };

  const hitTasks = tasks.filter(t => t.list_type === 'hit');
  const doTasks = tasks.filter(t => t.list_type === 'do');
  const hotTasks = tasks.filter(t => t.list_type === 'hot');
  const completionRate = weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Door Preview: {userName || userEmail}
            </h2>
            <p className="text-sm text-muted-foreground">
              Vizualizare read-only a datelor Door pentru acest client
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          🔒 Read-Only Mode
        </Badge>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="font-medium flex items-center gap-2 justify-center">
                <Calendar className="h-4 w-4" />
                Săptămâna: {format(currentWeek, 'dd MMM', { locale: ro })} - {format(addWeeks(currentWeek, 1), 'dd MMM yyyy', { locale: ro })}
              </p>
              <p className="text-xs text-muted-foreground">{weekKey}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Objectives Section */}
      <ClientObjectivesSection
        missions={missions}
        weeklyPlanning={weeklyPlanning}
        currentYear={new Date().getFullYear()}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <ListTodo className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{weekStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{weekStats.completed}</p>
            <p className="text-xs text-muted-foreground">Completate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Rată Completare</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Lightbulb className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{ideas.length}</p>
            <p className="text-xs text-muted-foreground">Idei Totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HIT List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              HIT List ({hitTasks.length})
            </CardTitle>
            <CardDescription>Sarcini prioritare pentru săptămână</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {hitTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Niciun task HIT pentru această săptămână
                </p>
              ) : (
                <div className="space-y-2">
                  {hitTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-start gap-3 p-2 rounded-lg border ${
                        task.completed ? 'bg-green-50 border-green-200' : 'bg-card'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getDayLabel(task.day_of_week)}
                          </Badge>
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* DO List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              DO List ({doTasks.length})
            </CardTitle>
            <CardDescription>Sarcini secundare</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {doTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Niciun task DO pentru această săptămână
                </p>
              ) : (
                <div className="space-y-2">
                  {doTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-start gap-3 p-2 rounded-lg border ${
                        task.completed ? 'bg-green-50 border-green-200' : 'bg-card'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getDayLabel(task.day_of_week)}
                          </Badge>
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Ideas Bank */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Ideas Bank (Ultimele 20)
          </CardTitle>
          <CardDescription>Ideile clientului din banca de idei</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {ideas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nicio idee în bancă
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ideas.map(idea => (
                  <div 
                    key={idea.id} 
                    className={`p-3 rounded-lg border ${
                      idea.status === 'archived' ? 'bg-muted/50' : 'bg-card'
                    }`}
                  >
                    <p className="text-sm font-medium">{idea.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {idea.category}
                      </Badge>
                      <Badge className={`text-xs ${
                        idea.priority === 4 ? 'bg-red-500' :
                        idea.priority === 3 ? 'bg-orange-500' :
                        idea.priority === 2 ? 'bg-yellow-500 text-black' :
                        'bg-gray-400'
                      }`}>
                        Q{5 - idea.priority}
                      </Badge>
                      {idea.status === 'archived' && (
                        <Badge variant="secondary" className="text-xs">Arhivat</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(idea.created_at), 'dd MMM yyyy', { locale: ro })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Hot List Preview */}
      {hotTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              HOT List Legacy ({hotTasks.length})
            </CardTitle>
            <CardDescription>Task-uri din vechiul sistem HOT</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {hotTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
