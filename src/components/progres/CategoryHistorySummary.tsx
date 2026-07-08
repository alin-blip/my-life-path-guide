import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Brain, Heart, Sparkles, Briefcase, ChevronRight, LineChart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const items = [
  { cat: 'corp', label: { ro: 'Corp', en: 'Body' }, icon: Dumbbell, color: 'text-green-500' },
  { cat: 'minte', label: { ro: 'Minte', en: 'Mind' }, icon: Brain, color: 'text-purple-500' },
  { cat: 'relatii', label: { ro: 'Relații', en: 'Relations' }, icon: Heart, color: 'text-rose-500' },
  { cat: 'spiritualitate', label: { ro: 'Spiritualitate', en: 'Spirit' }, icon: Sparkles, color: 'text-yellow-500' },
  { cat: 'business', label: { ro: 'Business', en: 'Business' }, icon: Briefcase, color: 'text-blue-500' },
];

export const CategoryHistorySummary = () => {
  const { language } = useLanguage();
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <LineChart className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">
            {language === 'ro' ? 'Progres & Istoric pe categorii' : 'Progress & History by category'}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {items.map(({ cat, label, icon: Icon, color }) => (
            <Link
              key={cat}
              to={`/progres?cat=${cat}`}
              className="group flex items-center justify-between rounded-lg border bg-card/60 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <span className="text-sm font-medium truncate">{label[language === 'ro' ? 'ro' : 'en']}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
