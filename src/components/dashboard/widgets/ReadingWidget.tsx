import React from 'react';
import { BookOpen } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

interface ReadingWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const ReadingWidget: React.FC<ReadingWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();

  // Default values - would come from user's reading progress
  const reading = {
    currentBook: 'Think and Grow Rich',
    currentPage: 145,
    totalPages: 320,
    dailyGoal: 20,
    pagesReadToday: 12
  };

  const bookProgress = (reading.currentPage / reading.totalPages) * 100;
  const dailyProgress = (reading.pagesReadToday / reading.dailyGoal) * 100;

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Lectură' : 'Reading'}
      icon={<BookOpen className="h-4 w-4 text-emerald-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium line-clamp-1">{reading.currentBook}</p>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'Pagina' : 'Page'} {reading.currentPage}/{reading.totalPages}
          </p>
          <Progress value={bookProgress} className="h-1.5 mt-1" />
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{language === 'ro' ? 'Obiectiv zilnic' : 'Daily goal'}</span>
            <span>{reading.pagesReadToday}/{reading.dailyGoal} {language === 'ro' ? 'pagini' : 'pages'}</span>
          </div>
          <Progress value={dailyProgress} className="h-1.5" />
        </div>
      </div>
    </WidgetContainer>
  );
};
