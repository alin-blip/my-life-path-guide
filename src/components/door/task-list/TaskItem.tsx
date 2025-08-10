
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Star, Flag, AlertCircle, KeyRound } from 'lucide-react';
import { TaskPriority } from '@/types/door';
import { useLanguage } from '@/context/LanguageContext';

interface TaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  priority?: TaskPriority;
  isKeyPoint?: boolean;
  onToggleCompletion: (id: string) => void;
  onMoveBack?: (id: string) => void;
  isMobile?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  text,
  completed,
  priority,
  isKeyPoint,
  onToggleCompletion,
  onMoveBack,
  isMobile = false
}) => {
  const { t } = useLanguage();

  const getPriorityClasses = (priority?: TaskPriority, completed: boolean = false) => {
    if (completed) return 'bg-green-500/10';

    switch (priority) {
      case 'important':
        return 'bg-green-500/10';
      case 'urgent':
        return 'bg-orange-500/10';
      case 'urgent-important':
        return 'bg-red-500/10';
      default:
        return 'bg-muted';
    }
  };

  const getPriorityIcon = (priority?: TaskPriority) => {
    const iconSize = isMobile ? 'w-3 h-3' : 'w-4 h-4';
    switch (priority) {
      case 'important':
        return <Star className={`${iconSize} text-green-500 mr-2`} />;
      case 'urgent':
        return <Flag className={`${iconSize} text-orange-500 mr-2`} />;
      case 'urgent-important':
        return <AlertCircle className={`${iconSize} text-red-500 mr-2`} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex items-center rounded-md ${getPriorityClasses(priority, completed)} ${
        isMobile ? 'p-2' : 'p-2'
      }`}
    >
      <Button
        variant="ghost"
        size="sm"
          className={`${isMobile ? 'w-5 h-5 p-0' : 'w-6 h-6 p-0'} rounded-full mr-3 flex items-center justify-center ${
          completed ? 'bg-green-500 text-white' : 'bg-transparent border border-border text-muted-foreground'
        }`}
        onClick={() => onToggleCompletion(id)}
      >
        {completed && <Check className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />}
      </Button>
      <span className={`flex-grow ${completed ? 'text-muted-foreground line-through' : 'text-foreground'} ${
        isMobile ? 'text-sm' : ''
      } flex items-center`}>
        {!completed && getPriorityIcon(priority)}
        {text}
      </span>
      {isKeyPoint && (
        <span className={`bg-primary/20 text-primary px-2 py-0.5 rounded mr-2 flex items-center ${
          isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'
        }`}>

          <KeyRound className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
          {t('keyPointLabel')}
        </span>
      )}
      {onMoveBack && (
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground hover:text-primary transition-colors ${isMobile ? 'p-1' : 'p-1'}`}
          onClick={() => onMoveBack(id)}
          title={t('moveBackToIdeaList')}
        >
          <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
        </Button>
      )}
    </div>
  );
};
