import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Activity, Heart, Users, Briefcase, Target, CheckCircle2, ArrowLeft, TrendingUp } from 'lucide-react';

interface CategoryStats {
  category: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  total: number;
  completed: number;
  tasks: { title: string; completed: boolean }[];
}

const Vision2026Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [weekKey, setWeekKey] = useState('');
  const [scores, setScores] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    // Get scores from localStorage
    const savedScores = localStorage.getItem('vision_plan_scores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error('Failed to parse scores:', e);
      }
    }

    // Calculate current week key
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentWeekKey = `door-week-${now.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
    setWeekKey(currentWeekKey);

    fetchStats(currentWeekKey);
  }, [user]);

  const fetchStats = async (currentWeekKey: string) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: tasks, error } = await supabase
        .from('user_tasks')
        .select('id, title, completed, priority, is_key_point')
        .eq('user_id', user.id)
        .eq('week_key', currentWeekKey)
        .in('list_type', ['hit', 'do']);

      if (error) throw error;

      // Categorize tasks based on keywords
      const categoryMap: Record<string, CategoryStats> = {
        body: {
          category: 'Body',
          icon: <Activity className="h-6 w-6" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          total: 0,
          completed: 0,
          tasks: []
        },
        being: {
          category: 'Being',
          icon: <Heart className="h-6 w-6" />,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          total: 0,
          completed: 0,
          tasks: []
        },
        balance: {
          category: 'Balance',
          icon: <Users className="h-6 w-6" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          total: 0,
          completed: 0,
          tasks: []
        },
        business: {
          category: 'Business',
          icon: <Briefcase className="h-6 w-6" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          total: 0,
          completed: 0,
          tasks: []
        }
      };

      // Keywords for categorization
      const keywords: Record<string, string[]> = {
        body: ['mișcare', 'movement', 'somn', 'sleep', 'energie', 'energy', 'sport', 'exercise', 'antrenament', 'training'],
        being: ['meditație', 'meditation', 'respirație', 'breathing', 'recunoștință', 'grateful', 'journaling', 'mindful'],
        balance: ['familie', 'family', 'prieten', 'friend', 'quality time', 'digital detox', 'reconectare', 'relații'],
        business: ['priorități', 'priorities', 'deep work', 'obiective', 'goals', 'review', 'proiect', 'project', 'client']
      };

      for (const task of tasks || []) {
        const titleLower = task.title.toLowerCase();
        let assigned = false;

        for (const [cat, kws] of Object.entries(keywords)) {
          if (kws.some(kw => titleLower.includes(kw.toLowerCase()))) {
            categoryMap[cat].total++;
            if (task.completed) categoryMap[cat].completed++;
            categoryMap[cat].tasks.push({ title: task.title, completed: task.completed || false });
            assigned = true;
            break;
          }
        }

        // Default to business if no category matched
        if (!assigned) {
          categoryMap.business.total++;
          if (task.completed) categoryMap.business.completed++;
          categoryMap.business.tasks.push({ title: task.title, completed: task.completed || false });
        }
      }

      setStats(Object.values(categoryMap));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const overallProgress = stats.reduce((acc, s) => acc + s.completed, 0);
  const overallTotal = stats.reduce((acc, s) => acc + s.total, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallProgress / overallTotal) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Vision 2026 Dashboard</h1>
                <p className="text-muted-foreground">Progresul tău în cele 4 arii de viață</p>
              </div>
            </div>
            <Button onClick={() => navigate('/door')} className="gap-2">
              <Target className="h-4 w-4" />
              Gestionează Task-uri
            </Button>
          </div>

          {/* Overall Progress Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Progres Total Săptămâna Aceasta</h2>
                    <p className="text-sm text-muted-foreground">{weekKey.replace('door-week-', 'Săptămâna ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">{overallPercentage}%</span>
                  <p className="text-sm text-muted-foreground">{overallProgress}/{overallTotal} completate</p>
                </div>
              </div>
              <Progress value={overallPercentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat) => {
              const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
              const score = scores?.[stat.category.toLowerCase()] || 0;
              
              return (
                <Card key={stat.category} className={`${stat.bgColor} border-0`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{stat.category}</CardTitle>
                          {score > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Scor inițial: {score}/10
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${stat.color}`}>{percentage}%</span>
                        <p className="text-xs text-muted-foreground">{stat.completed}/{stat.total}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={percentage} 
                      className="h-2 mb-4" 
                    />
                    
                    {stat.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {stat.tasks.slice(0, 5).map((task, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 
                              className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} 
                            />
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {stat.tasks.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{stat.tasks.length - 5} alte task-uri
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Niciun task în această categorie
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Sfaturi pentru Progres</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Concentrează-te pe ariile cu scor mic - acolo ai cel mai mare potențial de creștere</li>
                <li>• Completează minimum 1 task din fiecare categorie zilnic pentru echilibru</li>
                <li>• Folosește Focus Room pentru sesiuni dedicate de lucru</li>
                <li>• Revizuiește progresul la sfârșitul fiecărei săptămâni</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Vision2026Dashboard;
