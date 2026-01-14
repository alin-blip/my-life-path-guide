import React, { useState, useEffect } from 'react';
import { Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

interface ObjectiveSummary {
  id: string;
  category: string;
  title: string;
  progress: number;
  items: string[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    hoverBg: 'hover:bg-red-500/20'
  },
  being: {
    icon: Brain,
    label: { en: 'Spirituality', ro: 'Spiritualitate' },
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    hoverBg: 'hover:bg-blue-500/20'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    hoverBg: 'hover:bg-rose-500/20'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/20'
  }
};

interface ObjectivesSummaryCardsProps {
  objectivesType: 'monthly' | 'quarterly' | 'annual';
}

export const ObjectivesSummaryCards: React.FC<ObjectivesSummaryCardsProps> = ({ objectivesType }) => {
  const { language } = useLanguage();
  const [objectives, setObjectives] = useState<Record<string, ObjectiveSummary[]>>({});
  const [loading, setLoading] = useState(true);

  const getPeriodKey = () => {
    const now = new Date();
    if (objectivesType === 'monthly') {
      return format(now, 'yyyy-MM');
    } else if (objectivesType === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter}-${now.getFullYear()}`;
    } else {
      return `${now.getFullYear()}`;
    }
  };

  const getPeriodLabel = () => {
    const now = new Date();
    if (objectivesType === 'monthly') {
      return format(now, 'MMMM yyyy', { locale: language === 'en' ? enUS : ro });
    } else if (objectivesType === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} ${now.getFullYear()}`;
    } else {
      return `${now.getFullYear()}`;
    }
  };

  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const periodKey = getPeriodKey();
        const missionType = objectivesType === 'monthly' ? 'monthly' : objectivesType === 'quarterly' ? 'quarterly' : 'annual';

        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', missionType)
          .eq('period', periodKey);

        if (error) throw error;

        const grouped: Record<string, ObjectiveSummary[]> = {};
        
        (data || []).forEach((m: any) => {
          const category = m.category;
          if (!grouped[category]) {
            grouped[category] = [];
          }
          
          const keyActions = m.goal_data?.keyActions || [];
          const milestones = m.goal_data?.milestones || [];
          
          grouped[category].push({
            id: m.id,
            category: m.category,
            title: m.title || '',
            progress: m.goal_data?.progress || 0,
            items: objectivesType === 'annual' ? milestones : keyActions
          });
        });

        setObjectives(grouped);
      } catch (error) {
        console.error('Error fetching objectives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectives();
  }, [objectivesType]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const getTypeLabel = () => {
    if (objectivesType === 'monthly') {
      return language === 'en' ? 'Monthly Objectives' : 'Obiective Lunare';
    } else if (objectivesType === 'quarterly') {
      return language === 'en' ? '90-Day Objectives' : 'Obiective 90 Zile';
    } else {
      return language === 'en' ? 'Annual Vision' : 'Viziune Anuală';
    }
  };

  return (
    <div>
      {/* Period Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground">{getTypeLabel()}</span>
        <span className="text-sm text-muted-foreground">•</span>
        <span className="text-sm font-medium text-foreground capitalize">{getPeriodLabel()}</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryObjectives = objectives[key] || [];
          const Icon = config.icon;
          const hasObjectives = categoryObjectives.length > 0;
          const firstObjective = categoryObjectives[0];
          const avgProgress = hasObjectives 
            ? Math.round(categoryObjectives.reduce((sum, o) => sum + o.progress, 0) / categoryObjectives.length)
            : 0;

          return (
            <div
              key={key}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                config.bgColor,
                config.borderColor,
                config.hoverBg,
                !hasObjectives && "opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <span className={cn("font-semibold", config.color)}>
                    {config.label[language === 'en' ? 'en' : 'ro']}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{avgProgress}%</span>
              </div>

              {/* Content */}
              {hasObjectives ? (
                <div className="space-y-1.5">
                  {categoryObjectives.slice(0, 2).map((obj, idx) => (
                    <div key={obj.id} className="text-sm text-foreground">
                      <span className="text-muted-foreground">{idx + 1}.</span>{' '}
                      <span className="line-clamp-2">{obj.title}</span>
                    </div>
                  ))}
                  {categoryObjectives.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{categoryObjectives.length - 2} {language === 'en' ? 'more' : 'mai multe'}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {language === 'en' ? 'No objectives set' : 'Niciun obiectiv setat'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
