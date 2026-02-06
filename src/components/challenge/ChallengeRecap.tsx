import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Calendar, CalendarDays, ListChecks, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stats {
  annualObjectives: number;
  quarterlyObjectives: number;
  monthlyMissions: number;
  weeklyTasks: number;
  routinesCompleted: number;
  meditationsCreated: number;
}

export const ChallengeRecap = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    annualObjectives: 0,
    quarterlyObjectives: 0,
    monthlyMissions: 0,
    weeklyTasks: 0,
    routinesCompleted: 0,
    meditationsCreated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Trigger confetti on mount
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        annualRes,
        quarterlyRes,
        monthlyRes,
        tasksRes,
        routinesRes,
        meditationsRes
      ] = await Promise.all([
        supabase.from('missions').select('id', { count: 'exact' })
          .eq('user_id', user.id).eq('mission_type', 'annual'),
        supabase.from('missions').select('id', { count: 'exact' })
          .eq('user_id', user.id).eq('mission_type', 'quarterly'),
        supabase.from('missions').select('id', { count: 'exact' })
          .eq('user_id', user.id).eq('mission_type', 'monthly'),
        supabase.from('user_tasks').select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase.from('champion_routine_logs').select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase.from('empowerment_meditations').select('id', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      setStats({
        annualObjectives: annualRes.count || 0,
        quarterlyObjectives: quarterlyRes.count || 0,
        monthlyMissions: monthlyRes.count || 0,
        weeklyTasks: tasksRes.count || 0,
        routinesCompleted: routinesRes.count || 0,
        meditationsCreated: meditationsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Target,
      value: stats.annualObjectives,
      labelEn: 'Annual Objectives',
      labelRo: 'Obiective Anuale',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Calendar,
      value: stats.quarterlyObjectives,
      labelEn: '90-Day Goals',
      labelRo: 'Obiective 90 Zile',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CalendarDays,
      value: stats.monthlyMissions,
      labelEn: 'Monthly Missions',
      labelRo: 'Misiuni Lunare',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ListChecks,
      value: stats.weeklyTasks,
      labelEn: 'Weekly Tasks',
      labelRo: 'Task-uri Săptămânale',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Sparkles,
      value: stats.routinesCompleted,
      labelEn: 'Routines Done',
      labelRo: 'Rutine Complete',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Trophy,
      value: stats.meditationsCreated,
      labelEn: 'Meditations',
      labelRo: 'Meditații',
      color: 'from-yellow-500 to-amber-500'
    }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-amber-500/30">
      {/* Celebration Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🎉 {language === 'en' ? 'Congratulations!' : 'Felicitări!'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'You broke the burnout cycle! Here\'s the momentum you\'ve built:' 
            : 'Ai spart ciclul burnout-ului! Iată momentum-ul pe care l-ai construit:'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="flex flex-col items-center p-4 rounded-xl bg-card/50 border border-border/50"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-foreground">
                {loading ? '...' : stat.value}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {language === 'en' ? stat.labelEn : stat.labelRo}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Message */}
      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
        <p className="text-sm text-foreground">
          {language === 'en' 
            ? '✨ You\'ve built a complete anti-burnout system! Now let\'s make the momentum permanent.' 
            : '✨ Ai construit un sistem complet anti-burnout! Acum hai să facem momentum-ul permanent.'}
        </p>
      </div>
    </Card>
  );
};
