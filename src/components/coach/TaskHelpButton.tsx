import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskCoachWizard } from './TaskCoachWizard';
import { useLanguage } from '@/context/LanguageContext';

interface TaskHelpButtonProps {
  taskId?: string | null;
  taskTitle: string;
  size?: 'sm' | 'md';
  className?: string;
  onFocusTask?: (microTaskTitle: string) => void;
}

export const TaskHelpButton: React.FC<TaskHelpButtonProps> = ({
  taskId,
  taskTitle,
  size = 'sm',
  className,
  onFocusTask,
}) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={language === 'ro' ? 'Cere ajutor coach-ului' : 'Ask the coach for help'}
        className={cn(
          dim,
          'rounded-full text-violet-500 hover:text-violet-600 hover:bg-violet-500/10',
          className
        )}
      >
        <Brain className={icon} />
      </Button>
      <TaskCoachWizard
        open={open}
        onOpenChange={setOpen}
        taskId={taskId ?? null}
        taskTitle={taskTitle}
        onFocusTask={onFocusTask}
      />
    </>
  );
};
