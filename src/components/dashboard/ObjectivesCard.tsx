import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, Brain, Heart, Briefcase, ArrowRight, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
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
      en: { body: 'Body', being: 'Spirituality', balance: 'Relationships', business: 'Business', minte: 'Mind' },
      ro: { body: 'Corp', being: 'Spiritualitate', balance: 'Relații', business: 'Business', minte: 'Minte' }
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

  const categories: MissionCategory[] = ['body', 'being', 'balance', 'business', 'minte'];
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
                    onClick={() => navigate(`/game-objectives?tab=${getNavigationTab(period)}`)}
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

      </CardContent>
    </Card>
  );
};
