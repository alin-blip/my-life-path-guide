import React from 'react';
import { TaskCategory, TASK_CATEGORIES } from '@/utils/taskCategoryUtils';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  activeCategory: TaskCategory;
  onCategoryChange: (category: TaskCategory) => void;
  isMobile?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onCategoryChange,
  isMobile = false
}) => {
  const { language } = useLanguage();

  const allOption = {
    id: 'all' as TaskCategory,
    label: 'All',
    labelRo: 'Toate',
    icon: '🎯',
    color: 'text-foreground',
    bgColor: 'bg-muted'
  };

  const categories = [allOption, ...TASK_CATEGORIES];

  return (
    <div className={cn(
      "flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-hide",
      isMobile ? "px-1" : ""
    )}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            activeCategory === category.id
              ? `${category.bgColor} ${category.color} ring-1 ring-current/20`
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <span>{category.icon}</span>
          <span>{language === 'en' ? category.label : category.labelRo}</span>
        </button>
      ))}
    </div>
  );
};
