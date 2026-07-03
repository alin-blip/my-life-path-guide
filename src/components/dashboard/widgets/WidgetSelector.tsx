import React from 'react';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings2, PieChart, Dumbbell, Flame, Heart, Zap, CheckSquare, BookOpen, Droplets, Brain, Lightbulb, NotebookPen, Trophy, Palette, CalendarClock } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '@/config/dashboardWidgets';
import { DashboardWidget } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  PieChart: <PieChart className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  CheckSquare: <CheckSquare className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Droplets: <Droplets className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Lightbulb: <Lightbulb className="h-5 w-5" />,
  NotebookPen: <NotebookPen className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  CalendarClock: <CalendarClock className="h-5 w-5" />
};

const categoryColors: Record<string, string> = {
  fitness: 'bg-green-500/10 text-green-500 border-green-500/20',
  productivity: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  mindset: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  tracking: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
};

interface WidgetSelectorProps {
  widgets: DashboardWidget[];
  onToggle: (widgetId: string, enabled: boolean) => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ widgets, onToggle }) => {
  const { language } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const isWidgetEnabled = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    return widget?.enabled ?? false;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; ro: string }> = {
      fitness: { en: 'Fitness', ro: 'Fitness' },
      productivity: { en: 'Productivity', ro: 'Productivitate' },
      mindset: { en: 'Mindset', ro: 'Mentalitate' },
      tracking: { en: 'Tracking', ro: 'Urmărire' }
    };
    return labels[category]?.[language] || category;
  };

  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_WIDGETS>);

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
        {language === 'ro' ? 'Personalizează' : 'Customize'}
      </Button>
      <ResponsiveModal open={open} onOpenChange={setOpen} className="max-w-lg max-h-[80vh] overflow-y-auto">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {language === 'ro' ? 'Personalizează Dashboard' : 'Customize Dashboard'}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="space-y-6 py-4">
          {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  categoryColors[category]
                )}>
                  {getCategoryLabel(category)}
                </span>
              </div>
              <div className="space-y-2">
                {categoryWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        categoryColors[widget.category]
                      )}>
                        {iconMap[widget.icon]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{widget.name[language]}</p>
                        <p className="text-xs text-muted-foreground">{widget.description[language]}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isWidgetEnabled(widget.id)}
                      onCheckedChange={(checked) => onToggle(widget.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ResponsiveModal>
    </>
  );
};
