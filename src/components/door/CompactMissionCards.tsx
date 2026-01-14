import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { Dumbbell, Brain, Heart, Briefcase, ChevronRight, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDoor } from '@/context/DoorContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface MonthlyMission {
  id: string;
  category: string;
  title: string;
  measurableResult?: string;
  progress: number;
  keyActions?: string[];
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/50'
  },
  being: {
    icon: Brain,
    label: { en: 'Spirituality', ro: 'Spiritualitate' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/50'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50'
  }
};

export const CompactMissionCards: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [missions, setMissions] = useState<MonthlyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [recentlyDragged, setRecentlyDragged] = useState<string | null>(null);

  const currentDate = new Date();
  const monthKey = format(currentDate, 'yyyy-MM');
  const monthName = format(currentDate, 'MMMM yyyy', { locale: language === 'en' ? enUS : ro });

  // Get door context for drag & drop
  let doorContext: ReturnType<typeof useDoor> | null = null;
  try {
    doorContext = useDoor();
  } catch {
    // Outside provider
  }

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('mission_type', 'monthly')
          .eq('period', monthKey);

        if (error) throw error;

        const mapped: MonthlyMission[] = (data || []).map((m: any) => ({
          id: m.id,
          category: m.category,
          title: m.title || '',
          measurableResult: m.measurable_result || '',
          progress: m.goal_data?.progress || 0,
          keyActions: m.goal_data?.keyActions || []
        }));

        setMissions(mapped);
      } catch (error) {
        console.error('Error fetching monthly missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [monthKey]);

  const getCategoryMission = (category: string) => {
    return missions.find(m => m.category === category);
  };

  const handleDragStart = (e: React.DragEvent, mission: MonthlyMission) => {
    setDraggingId(mission.id);
    
    const dominoData = {
      type: 'monthly-mission',
      id: mission.id,
      text: mission.title,
      measurableResult: mission.measurableResult,
      keyActions: mission.keyActions,
      category: mission.category
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dominoData));
    e.dataTransfer.setData('text/plain', mission.title);
    e.dataTransfer.effectAllowed = 'copyMove';
    console.debug('[DnD] Lunar dragStart', { id: mission.id, effectAllowed: 'copyMove' });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Show brief success indicator if dropped successfully
    if (e.dataTransfer.dropEffect !== 'none' && draggingId) {
      setRecentlyDragged(draggingId);
      setTimeout(() => setRecentlyDragged(null), 1500);
    }
    setDraggingId(null);
  };

  const handleViewAll = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'monthly');
      return next;
    }, { replace: true });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{language === 'en' ? 'Monthly Objectives' : 'Obiective Lunare'}</span>
          <span>•</span>
          <span className="capitalize">{monthName}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span>{language === 'en' ? 'Monthly Objectives' : 'Obiective Lunare'}</span>
        <span>•</span>
        <span className="capitalize">{monthName}</span>
      </div>

      {/* Compact Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const mission = getCategoryMission(key);
          const Icon = config.icon;

          return (
            <div
              key={key}
              className={cn(
                "relative rounded-xl border-2 p-3 transition-all duration-200",
                config.borderColor,
                config.bgColor,
                mission && "cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02]",
                draggingId === mission?.id && "opacity-50 ring-2 ring-primary scale-95",
                recentlyDragged === mission?.id && "ring-2 ring-green-500 bg-green-500/10"
              )}
              draggable={!!mission}
              onDragStart={(e) => mission && handleDragStart(e, mission)}
              onDragEnd={handleDragEnd}
            >
              {/* Dragging Badge */}
              {draggingId === mission?.id && (
                <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full animate-fade-in shadow-lg">
                  {language === 'en' ? 'Dragging...' : 'Se mută...'}
                </div>
              )}
              
              {/* Success Badge */}
              {recentlyDragged === mission?.id && (
                <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-success-pop shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'en' ? 'Added!' : 'Adăugat!'}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", config.color)} />
                  <span className={cn("text-sm font-semibold", config.color)}>
                    {config.label[language === 'en' ? 'en' : 'ro']}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs px-1.5 py-0", config.color, "bg-transparent")}
                >
                  {mission?.progress || 0}%
                </Badge>
              </div>

              {/* Content */}
              {mission ? (
                <div className="space-y-1.5">
                  {/* Mission items - numbered list style */}
                  <div className="text-sm text-foreground font-medium line-clamp-1">
                    1. {mission.title}
                  </div>
                  
                  {mission.measurableResult && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {mission.measurableResult}
                    </div>
                  )}

                  {/* Show key actions count */}
                  {mission.keyActions && mission.keyActions.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      +{mission.keyActions.length - 1} {language === 'en' ? 'more' : 'mai multe'}
                    </div>
                  )}

                  {/* Drag hint */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/50 pt-1">
                    <GripVertical className="w-3 h-3" />
                    <span>{language === 'en' ? 'Drag to Focus' : 'Trage în Focus'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground/50 italic">
                  {language === 'en' ? 'No mission set' : 'Nicio misiune setată'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="link" 
          onClick={handleViewAll}
          className="text-sm text-primary hover:text-primary/80 gap-1"
        >
          {language === 'en' ? 'View all monthly objectives' : 'Vezi toate obiectivele lunare'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
