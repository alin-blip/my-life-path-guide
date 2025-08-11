import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Activity, TrendingUp, Calendar, Zap, BarChart3, Clock, Layers, Plus, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { doorProgressService } from '@/services/doorProgressService';
import { useAuth } from '@/context/AuthContext';

interface StackType {
  id: string;
  trigger_label?: string;
  trigger?: string;
  type?: string;
  created_at?: string;
  timestamp?: string;
  color?: string;
}

interface UserStats {
  totalStacks: number;
  completedTasks: number;
  currentStreak: number;
  completionRate: number;
}

export const Library: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [stacks, setStacks] = useState<StackType[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalStacks: 0,
    completedTasks: 0,
    currentStreak: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibraryData();
  }, [user]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStacks(),
        loadUserProgress()
      ]);
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStacks = async () => {
    try {
      // Try loading from Supabase first
      if (user) {
        const { data } = await supabase
          .from('stack_library')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (data && data.length > 0) {
          setStacks(data.map(item => ({
            id: item.id,
            trigger_label: item.title,
            type: item.type,
            created_at: item.created_at
          })));
          return;
        }
      }
      
      // Fallback to localStorage
      const raw = localStorage.getItem('stack_library');
      setStacks(raw ? JSON.parse(raw).slice(0, 6) : []);
    } catch (error) {
      console.error('Error loading stacks:', error);
      setStacks([]);
    }
  };

  const loadUserProgress = async () => {
    try {
      if (!user) return;

      // Get current streak and daily stats
      const currentStreak = await doorProgressService.getCurrentStreak();
      const todayProgress = await doorProgressService.getDailyProgress();
      const weekProgress = await doorProgressService.getCompletionTrend(7);
      
      // Calculate stats
      const completedTasks = todayProgress?.completed_tasks || 0;
      const totalTasks = todayProgress?.total_tasks || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Get total stacks count
      const { count: stacksCount } = await supabase
        .from('stack_library')
        .select('*', { count: 'exact', head: true });

      setUserStats({
        totalStacks: stacksCount || stacks.length,
        completedTasks,
        currentStreak,
        completionRate
      });
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const getStackColor = (type?: string) => {
    switch (type) {
      case 'anger': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'divine': return 'from-purple-500/20 to-purple-600/10 border-purple-500/30';
      case 'hormozi': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      default: return 'from-primary/20 to-primary/10 border-primary/30';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? 'Sacred Library' : 'Biblioteca Sacrată'}
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border/20">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? 'Sacred Library' : 'Biblioteca Sacrată'}
          </h1>
        </div>
        <Button asChild variant="default" size="sm">
          <Link to="/stack">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'New Stack' : 'Stack Nou'}
          </Link>
        </Button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stacks</p>
                <p className="text-xl font-bold text-foreground">{userStats.totalStacks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-xl font-bold text-foreground">{userStats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-xl font-bold text-foreground">{userStats.currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold text-foreground">{userStats.completionRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Stacks Section */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                {language === 'en' ? 'My Stacks' : 'Stackurile Mele'}
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/stack-library">
                  {language === 'en' ? 'View All' : 'Vezi toate'}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stacks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stacks.map((stack) => (
                    <div 
                      key={stack.id} 
                      className={`p-4 rounded-lg bg-gradient-to-br ${getStackColor(stack.type)} border transition-all hover:scale-[1.02] cursor-pointer`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground truncate">
                          {stack.trigger_label || stack.trigger || 'Stack'}
                        </h4>
                        {stack.type && (
                          <Badge variant="secondary" className="text-xs">
                            {stack.type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(stack.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' ? 'No stacks saved yet' : 'Nu ai salvat încă niciun stack'}
                  </p>
                  <Button asChild variant="default" size="sm">
                    <Link to="/stack">
                      {language === 'en' ? 'Create Your First Stack' : 'Creează primul tău Stack'}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          <Card className="bg-card border-border/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                {language === 'en' ? 'Progress Today' : 'Progresul de Astăzi'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Task Completion</span>
                  <span className="text-sm font-medium text-foreground">
                    {userStats.completedTasks} / {userStats.completedTasks + (userStats.completedTasks > 0 ? Math.round(userStats.completedTasks / (userStats.completionRate / 100) - userStats.completedTasks) : 3)}
                  </span>
                </div>
                <Progress value={userStats.completionRate} className="h-2" />
              </div>
              
              <div className="pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <div className="flex items-center text-orange-400">
                    <Zap className="w-4 h-4 mr-1" />
                    <span className="font-bold">{userStats.currentStreak}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                {language === 'en' ? 'Quick Actions' : 'Acțiuni Rapide'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/door">
                  <Target className="w-4 h-4 mr-2" />
                  Command Center
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/game">
                  <Flag className="w-4 h-4 mr-2" />
                  Misiuni de Împlinire
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/stack-library">
                  <Layers className="w-4 h-4 mr-2" />
                  All Stacks
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};