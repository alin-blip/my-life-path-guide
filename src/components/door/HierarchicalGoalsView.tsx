import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Flag, 
  Dumbbell, 
  Brain, 
  Heart, 
  Briefcase,
  CheckCircle2,
  Circle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LinkedMission {
  id: string;
  title: string;
  period: string;
  progress: number;
  completed: boolean;
}

interface QuarterlyGoalWithMissions {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurableResult?: string;
  progress: number;
  linkedMissions: LinkedMission[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  being: {
    icon: Brain,
    label: { en: 'Being', ro: 'Ființă' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  balance: {
    icon: Heart,
    label: { en: 'Balance', ro: 'Echilibru' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
};

interface HierarchicalGoalsViewProps {
  currentQuarter: number;
  currentYear: number;
}

export const HierarchicalGoalsView: React.FC<HierarchicalGoalsViewProps> = ({
  currentQuarter,
  currentYear
}) => {
  const { language } = useLanguage();
  const [goals, setGoals] = useState<QuarterlyGoalWithMissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchHierarchicalData = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const quarterKey = `Q${currentQuarter}-${currentYear}`;

        // Fetch quarterly goals
        const { data: quarterlyData, error: quarterlyError } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'quarterly')
          .eq('period', quarterKey);

        if (quarterlyError) throw quarterlyError;

        // Fetch all monthly missions that are linked to these quarterly goals
        const quarterlyIds = (quarterlyData || []).map(q => q.id);
        
        let linkedMissionsData: any[] = [];
        if (quarterlyIds.length > 0) {
          const { data: monthlyData, error: monthlyError } = await supabase
            .from('missions')
            .select('*')
            .eq('user_id', session.session.user.id)
            .eq('mission_type', 'monthly')
            .in('parent_mission_id', quarterlyIds);

          if (monthlyError) throw monthlyError;
          linkedMissionsData = monthlyData || [];
        }

        // Map the data
        const mappedGoals: QuarterlyGoalWithMissions[] = (quarterlyData || []).map((q: any) => ({
          id: q.id,
          category: q.category,
          title: q.title || '',
          description: q.goal_data?.description || '',
          measurableResult: q.measurable_result || '',
          progress: q.goal_data?.progress || 0,
          linkedMissions: linkedMissionsData
            .filter(m => m.parent_mission_id === q.id)
            .map(m => ({
              id: m.id,
              title: m.title || '',
              period: m.period || '',
              progress: m.goal_data?.progress || 0,
              completed: m.completed || false
            }))
        }));

        setGoals(mappedGoals);
        
        // Auto-expand goals that have linked missions
        const goalsWithMissions = mappedGoals
          .filter(g => g.linkedMissions.length > 0)
          .map(g => g.id);
        setExpandedGoals(new Set(goalsWithMissions));
      } catch (error) {
        console.error('Error fetching hierarchical goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchicalData();
  }, [currentQuarter, currentYear]);

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const formatMonth = (period: string) => {
    // period is like "2025-01" or "January 2025"
    if (!period) return '';
    const months = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ro: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    // Try to parse YYYY-MM format
    const match = period.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const monthIndex = parseInt(match[2], 10) - 1;
      return months[language === 'en' ? 'en' : 'ro'][monthIndex] || period;
    }
    return period;
  };

  const groupGoalsByCategory = () => {
    const grouped: Record<string, QuarterlyGoalWithMissions[]> = {};
    goals.forEach(goal => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = [];
      }
      grouped[goal.category].push(goal);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">
          {language === 'en' ? 'No quarterly goals set' : 'Nu ai obiective trimestriale setate'}
        </p>
        <p className="text-sm mt-1">
          {language === 'en' 
            ? 'Create quarterly goals first, then link monthly missions to them'
            : 'Creează întâi obiective trimestriale, apoi leagă misiunile lunare de ele'}
        </p>
      </div>
    );
  }

  const groupedGoals = groupGoalsByCategory();

  return (
    <div className="space-y-6">
      {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
        const categoryGoals = groupedGoals[category] || [];
        if (categoryGoals.length === 0) return null;

        const Icon = config.icon;
        const totalLinkedMissions = categoryGoals.reduce((sum, g) => sum + g.linkedMissions.length, 0);

        return (
          <Card 
            key={category} 
            className={cn("overflow-hidden border-2", config.borderColor)}
          >
            <CardHeader className={cn("py-3 px-4", config.bgColor)}>
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", config.color)} />
                <CardTitle className="text-base">
                  {config.label[language === 'en' ? 'en' : 'ro']}
                </CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {categoryGoals.length} {language === 'en' ? 'goals' : 'obiective'}
                  {totalLinkedMissions > 0 && (
                    <span className="ml-1.5 text-muted-foreground">
                      • {totalLinkedMissions} {language === 'en' ? 'missions' : 'misiuni'}
                    </span>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {categoryGoals.map((goal) => {
                const isExpanded = expandedGoals.has(goal.id);
                const hasLinkedMissions = goal.linkedMissions.length > 0;

                return (
                  <Collapsible 
                    key={goal.id} 
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(goal.id)}
                  >
                    <div className={cn(
                      "rounded-lg border transition-all",
                      isExpanded ? "bg-muted/50 border-border" : "bg-background hover:bg-muted/30 border-transparent"
                    )}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full p-3 flex items-start gap-3 text-left">
                          <div className={cn(
                            "mt-0.5 p-1 rounded transition-colors",
                            hasLinkedMissions ? config.bgColor : "bg-muted"
                          )}>
                            {isExpanded ? (
                              <ChevronDown className={cn("w-4 h-4", hasLinkedMissions ? config.color : "text-muted-foreground")} />
                            ) : (
                              <ChevronRight className={cn("w-4 h-4", hasLinkedMissions ? config.color : "text-muted-foreground")} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className={cn("w-4 h-4 shrink-0", config.color)} />
                              <span className="font-medium text-foreground truncate">{goal.title}</span>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {goal.progress}%
                              </Badge>
                            </div>
                            
                            {goal.measurableResult && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">{goal.measurableResult}</span>
                              </p>
                            )}
                            
                            <div className="mt-2">
                              <Progress value={goal.progress} className="h-1.5" />
                            </div>
                          </div>

                          {hasLinkedMissions && (
                            <Badge className={cn("shrink-0", config.bgColor, config.color, "border-0")}>
                              <Flag className="w-3 h-3 mr-1" />
                              {goal.linkedMissions.length}
                            </Badge>
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-3 pb-3">
                          {hasLinkedMissions ? (
                            <div className="ml-7 pl-4 border-l-2 border-dashed border-muted-foreground/30 space-y-2">
                              <p className="text-xs text-muted-foreground font-medium mb-2">
                                {language === 'en' ? 'Linked Monthly Missions:' : 'Misiuni Lunare Legate:'}
                              </p>
                              
                              {goal.linkedMissions.map((mission) => (
                                <div 
                                  key={mission.id}
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-background border"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {mission.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                    )}
                                    <Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className={cn(
                                      "text-sm truncate",
                                      mission.completed && "text-muted-foreground line-through"
                                    )}>
                                      {mission.title}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className="text-xs">
                                      {formatMonth(mission.period)}
                                    </Badge>
                                    <span className="text-xs font-medium w-8 text-right">
                                      {mission.progress}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="ml-7 pl-4 border-l-2 border-dashed border-muted-foreground/30">
                              <p className="text-sm text-muted-foreground py-2 flex items-center gap-2">
                                <Flag className="w-4 h-4 opacity-50" />
                                {language === 'en' 
                                  ? 'No monthly missions linked yet'
                                  : 'Nicio misiune lunară legată încă'}
                              </p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
