import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Target, Crown, Flame, Clock, Brain, Dumbbell, Heart, BarChart3, ListChecks, Calendar, Lock } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '@/config/dashboardWidgets';

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Dumbbell: <Dumbbell className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  ListChecks: <ListChecks className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
};

// Fixed widgets that are always shown
const FIXED_WIDGETS = [
  { id: 'vision-declaration', name: { en: 'Vision Declaration', ro: 'Declarație Viziune' }, icon: 'Target' },
  { id: 'objectives', name: { en: 'Objectives', ro: 'Obiective' }, icon: 'Target' },
  { id: 'champion-routine-overview', name: { en: 'Champion Routine', ro: 'Rutina Campionului' }, icon: 'Crown' },
];

export const DashboardPreview: React.FC = () => {
  const { language } = useLanguage();
  const { widgets } = useDashboardWidgets();

  // Get enabled editable widgets
  const enabledEditableWidgets = AVAILABLE_WIDGETS.filter(widget => {
    const userWidget = widgets.find(w => w.id === widget.id);
    return userWidget?.enabled;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-primary" />
          {language === 'ro' ? 'Previzualizare Dashboard' : 'Dashboard Preview'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 border border-dashed border-border">
          {/* Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* Fixed Widgets */}
            {FIXED_WIDGETS.map((widget) => (
              <div
                key={widget.id}
                className="bg-card border border-border rounded-md p-2 flex items-center gap-2"
              >
                <div className="p-1.5 bg-primary/10 rounded">
                  {iconMap[widget.icon] || <Target className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{widget.name[language]}</p>
                </div>
                <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
            ))}

            {/* Editable Widgets */}
            {enabledEditableWidgets.map((widget) => (
              <div
                key={widget.id}
                className="bg-card border border-primary/30 rounded-md p-2 flex items-center gap-2"
              >
                <div className="p-1.5 bg-primary/10 rounded">
                  {iconMap[widget.icon] || <Target className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{widget.name[language]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {FIXED_WIDGETS.length} {language === 'ro' ? 'fixe' : 'fixed'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {enabledEditableWidgets.length} {language === 'ro' ? 'editabile' : 'editable'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {FIXED_WIDGETS.length + enabledEditableWidgets.length} {language === 'ro' ? 'widget-uri total' : 'total widgets'}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {language === 'ro' 
            ? 'Modificările se aplică automat. Vizitează dashboard-ul pentru a vedea rezultatul final.'
            : 'Changes apply automatically. Visit the dashboard to see the final result.'}
        </p>
      </CardContent>
    </Card>
  );
};
