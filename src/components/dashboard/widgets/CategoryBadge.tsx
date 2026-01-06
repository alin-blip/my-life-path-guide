import React from 'react';
import { cn } from '@/lib/utils';

export type IdeaCategory = 'work' | 'personal' | 'urgent' | 'project';

interface CategoryBadgeProps {
  category: IdeaCategory;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

const categoryConfig: Record<IdeaCategory, { label: string; labelRo: string; color: string }> = {
  work: { label: 'Work', labelRo: 'Muncă', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  personal: { label: 'Personal', labelRo: 'Personal', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  urgent: { label: 'Urgent', labelRo: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  project: { label: 'Project', labelRo: 'Proiect', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  size = 'sm',
  onClick 
}) => {
  const config = categoryConfig[category] || categoryConfig.personal;
  
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
      )}
    >
      {config.labelRo}
    </span>
  );
};

export const getCategoryOptions = (): { value: IdeaCategory; label: string }[] => [
  { value: 'work', label: 'Muncă' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'project', label: 'Proiect' }
];
