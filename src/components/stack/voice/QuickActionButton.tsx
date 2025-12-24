import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success';
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  className
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      size="sm"
      className={cn(
        'flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px]',
        'transition-all duration-200',
        variant === 'primary' && 'border-primary text-primary hover:bg-primary/10',
        variant === 'success' && 'border-green-500 text-green-500 hover:bg-green-500/10',
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-medium">{label}</span>
    </Button>
  );
};