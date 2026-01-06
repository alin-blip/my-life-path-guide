import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Flame, BookOpen, Dumbbell, Target, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  xp_reward: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥', category: 'streak', requirement: 7, xp_reward: 100 },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '🔥', category: 'streak', requirement: 30, xp_reward: 500 },
  { id: 'streak_100', name: 'Century Champion', description: '100 day streak', icon: '🔥', category: 'streak', requirement: 100, xp_reward: 2000 },
  { id: 'streak_365', name: 'Year Legend', description: '365 day streak', icon: '🔥', category: 'streak', requirement: 365, xp_reward: 10000 },
  
  // Reading achievements
  { id: 'books_10', name: 'Bookworm', description: 'Read 10 books', icon: '📚', category: 'reading', requirement: 10, xp_reward: 300 },
  { id: 'books_50', name: 'Scholar', description: 'Read 50 books', icon: '📚', category: 'reading', requirement: 50, xp_reward: 1500 },
  { id: 'books_100', name: 'Sage', description: 'Read 100 books', icon: '📚', category: 'reading', requirement: 100, xp_reward: 5000 },
  
  // Workout achievements
  { id: 'workouts_100', name: 'Fitness Enthusiast', description: '100 workouts', icon: '💪', category: 'workout', requirement: 100, xp_reward: 500 },
  { id: 'workouts_500', name: 'Iron Will', description: '500 workouts', icon: '💪', category: 'workout', requirement: 500, xp_reward: 2500 },
  { id: 'workouts_1000', name: 'Titan', description: '1000 workouts', icon: '💪', category: 'workout', requirement: 1000, xp_reward: 10000 },
  
  // Goals achievements
  { id: 'goals_10', name: 'Goal Setter', description: 'Complete 10 goals', icon: '🎯', category: 'goals', requirement: 10, xp_reward: 200 },
  { id: 'goals_50', name: 'Achiever', description: 'Complete 50 goals', icon: '🎯', category: 'goals', requirement: 50, xp_reward: 1000 },
  { id: 'goals_100', name: 'Champion', description: 'Complete 100 goals', icon: '🎯', category: 'goals', requirement: 100, xp_reward: 3000 },
  
  // Perfect days
  { id: 'perfect_1', name: 'First Perfect Day', description: 'Achieve your first 100 score', icon: '⭐', category: 'perfect', requirement: 1, xp_reward: 100 },
  { id: 'perfect_10', name: 'Consistency Star', description: '10 perfect days', icon: '⭐', category: 'perfect', requirement: 10, xp_reward: 500 },
  { id: 'perfect_50', name: 'Excellence Master', description: '50 perfect days', icon: '⭐', category: 'perfect', requirement: 50, xp_reward: 2500 },
  { id: 'perfect_100', name: 'Perfection Legend', description: '100 perfect days', icon: '⭐', category: 'perfect', requirement: 100, xp_reward: 10000 },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  streak: <Flame className="w-4 h-4 text-orange-500" />,
  reading: <BookOpen className="w-4 h-4 text-blue-500" />,
  workout: <Dumbbell className="w-4 h-4 text-green-500" />,
  goals: <Target className="w-4 h-4 text-purple-500" />,
  perfect: <Star className="w-4 h-4 text-yellow-500" />,
};

const AchievementCard: React.FC<{ 
  achievement: Achievement; 
  unlocked: boolean;
  unlockedAt?: string;
}> = ({ achievement, unlocked, unlockedAt }) => {
  return (
    <div className={cn(
      "relative p-4 rounded-xl border transition-all",
      unlocked 
        ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30" 
        : "bg-card/50 border-border/50 opacity-60 grayscale"
    )}>
      {unlocked && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
            <Crown className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      
      <div className="text-center space-y-2">
        <span className="text-3xl">{achievement.icon}</span>
        <h4 className="font-semibold text-sm">{achievement.name}</h4>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
        
        <div className="flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-medium text-yellow-500">+{achievement.xp_reward} XP</span>
        </div>
        
        {unlocked && unlockedAt && (
          <p className="text-[10px] text-muted-foreground">
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export const AchievementGallery: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));
  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  const categories = ['streak', 'reading', 'workout', 'goals', 'perfect'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-500" />
            {language === 'ro' ? 'Realizări' : 'Achievements'}
          </CardTitle>
          <Badge variant="outline">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
          const categoryUnlocked = categoryAchievements.filter(a => unlockedIds.has(a.id)).length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[category]}
                  <h3 className="font-semibold capitalize">{category}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {categoryUnlocked}/{categoryAchievements.length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoryAchievements.map(achievement => {
                  const userAch = userAchievements.find(a => a.achievement_id === achievement.id);
                  return (
                    <AchievementCard 
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={unlockedIds.has(achievement.id)}
                      unlockedAt={userAch?.unlocked_at}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
