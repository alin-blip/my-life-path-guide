import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Target, Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CategoryGoal {
  id: string;
  category: string;
  title: string;
  progress: number;
  target?: string;
}

interface QuarterlyData {
  quarter: string;
  year: number;
  goals: CategoryGoal[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    progressColor: 'bg-emerald-500'
  },
  being: {
    icon: Brain,
    label: { en: 'Being', ro: 'Ființă' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500'
  },
  balance: {
    icon: Heart,
    label: { en: 'Balance', ro: 'Echilibru' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    progressColor: 'bg-rose-500'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500'
  }
};

export const GoalProgressHeader: React.FC = () => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return { quarter: `Q${quarter}`, year: now.getFullYear() };
  };

  useEffect(() => {
    const fetchQuarterlyGoals = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const { quarter, year } = getCurrentQuarter();

        // Fetch missions for current quarter
        const { data: missions, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'quarterly')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by category and calculate progress
        const goalsByCategory: Record<string, CategoryGoal[]> = {};
        
        (missions || []).forEach((mission: any) => {
          const category = mission.category;
          if (!goalsByCategory[category]) {
            goalsByCategory[category] = [];
          }
          goalsByCategory[category].push({
            id: mission.id,
            category,
            title: mission.title || mission.goal_data?.title || 'Untitled Goal',
            progress: mission.goal_data?.progress || 0,
            target: mission.measurable_result
          });
        });

        // Create summary with all categories (even empty ones)
        const allGoals: CategoryGoal[] = [];
        Object.keys(CATEGORY_CONFIG).forEach(cat => {
          const categoryGoals = goalsByCategory[cat] || [];
          if (categoryGoals.length > 0) {
            allGoals.push(...categoryGoals);
          } else {
            // Add placeholder for empty category
            allGoals.push({
              id: `placeholder-${cat}`,
              category: cat,
              title: language === 'en' ? 'No goal set' : 'Niciun obiectiv setat',
              progress: 0
            });
          }
        });

        setQuarterlyData({
          quarter,
          year,
          goals: allGoals
        });
      } catch (error) {
        console.error('Error fetching quarterly goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuarterlyGoals();
  }, [language]);

  // Calculate average progress per category
  const getCategoryProgress = (category: string) => {
    if (!quarterlyData) return 0;
    const categoryGoals = quarterlyData.goals.filter(g => g.category === category);
    if (categoryGoals.length === 0) return 0;
    const total = categoryGoals.reduce((sum, g) => sum + g.progress, 0);
    return Math.round(total / categoryGoals.length);
  };

  if (loading) {
    return (
      <Card className="mb-6 p-4 bg-card/50 border-border animate-pulse">
        <div className="h-12 bg-muted rounded" />
      </Card>
    );
  }

  const { quarter, year } = getCurrentQuarter();

  return (
    <Card className="mb-6 overflow-hidden border-border bg-gradient-to-r from-card to-card/80">
      {/* Compact Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">
              {language === 'en' ? '90-Day Goals' : 'Obiective 90 Zile'} • {quarter} {year}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Click to expand' : 'Click pentru a extinde'}
            </p>
          </div>
        </div>

        {/* Category Progress Badges */}
        <div className="flex items-center gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const progress = getCategoryProgress(key);
            const Icon = config.icon;
            return (
              <Badge
                key={key}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1",
                  config.bgColor
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", config.color)} />
                <span className="text-xs font-medium">{progress}%</span>
              </Badge>
            );
          })}
          
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground ml-2" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground ml-2" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const categoryGoals = quarterlyData?.goals.filter(g => g.category === key) || [];
              const progress = getCategoryProgress(key);
              const Icon = config.icon;

              return (
                <div key={key} className={cn("p-4 rounded-xl", config.bgColor)}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn("w-5 h-5", config.color)} />
                    <span className="font-medium text-foreground">
                      {config.label[language === 'en' ? 'en' : 'ro']}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Progress' : 'Progres'}
                      </span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {categoryGoals.slice(0, 3).map((goal, idx) => (
                      <div key={goal.id} className="text-sm">
                        <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                        <span className="text-foreground truncate">{goal.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Link to full quarterly view */}
          <div className="mt-4 text-center">
            <a
              href="/door?tab=quarterly"
              className="text-sm text-primary hover:underline"
            >
              {language === 'en' ? 'View all 90-day goals →' : 'Vezi toate obiectivele 90 zile →'}
            </a>
          </div>
        </div>
      )}
    </Card>
  );
};
