import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lock, Target, Crown, Flame, Clock, Brain, Dumbbell, Heart, BarChart3, ListChecks, Calendar } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '@/config/dashboardWidgets';

// Fixed widgets that cannot be disabled
const FIXED_WIDGET_IDS = ['vision-declaration', 'objectives', 'champion-routine-overview'];

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  ListChecks: <ListChecks className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
};

export const WidgetManager: React.FC = () => {
  const { language } = useLanguage();
  const { widgets, toggleWidget } = useDashboardWidgets();

  const isWidgetEnabled = (widgetId: string) => {
    return widgets.find(w => w.id === widgetId)?.enabled ?? false;
  };

  const isFixed = (widgetId: string) => FIXED_WIDGET_IDS.includes(widgetId);

  // Group widgets by category
  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_WIDGETS>);

  const categoryLabels: Record<string, { en: string; ro: string }> = {
    fitness: { en: 'Fitness', ro: 'Fitness' },
    productivity: { en: 'Productivity', ro: 'Productivitate' },
    mindset: { en: 'Mindset', ro: 'Mindset' },
    tracking: { en: 'Tracking', ro: 'Tracking' },
    routine: { en: 'Routine', ro: 'Rutină' },
  };

  return (
    <div className="space-y-6">
      {/* Fixed Widgets Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {language === 'ro' ? 'Widget-uri Standard (Fixe)' : 'Standard Widgets (Fixed)'}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{language === 'ro' ? 'Declarație Viziune' : 'Vision Declaration'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ro' ? 'Napoleon Hill - Cele 6 Pași către Bogăție' : 'Napoleon Hill - Six Steps to Riches'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              <Lock className="h-3 w-3 mr-1" />
              {language === 'ro' ? 'Fix' : 'Fixed'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{language === 'ro' ? 'Obiective' : 'Objectives'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ro' ? 'Misiuni Anuale, 90 Zile, Lunare' : 'Annual, 90-Day, Monthly Missions'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              <Lock className="h-3 w-3 mr-1" />
              {language === 'ro' ? 'Fix' : 'Fixed'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{language === 'ro' ? 'Rutina Campionului' : 'Champion Routine'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ro' ? 'Progres rutină și tracking' : 'Routine progress and tracking'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              <Lock className="h-3 w-3 mr-1" />
              {language === 'ro' ? 'Fix' : 'Fixed'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Editable Widgets by Category */}
      {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {categoryLabels[category]?.[language] || category}
          </h3>
          <div className="space-y-3">
            {categoryWidgets.filter(w => !isFixed(w.id)).map((widget) => (
              <div 
                key={widget.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {iconMap[widget.icon] || <Target className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">{widget.name[language]}</p>
                    <p className="text-sm text-muted-foreground">{widget.description[language]}</p>
                  </div>
                </div>
                <Switch
                  checked={isWidgetEnabled(widget.id)}
                  onCheckedChange={(checked) => toggleWidget(widget.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
