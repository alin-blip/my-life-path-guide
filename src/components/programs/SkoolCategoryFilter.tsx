import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', labelRo: 'Toate', icon: null },
  { id: 'general', label: 'General', labelRo: 'General', icon: '💬' },
  { id: 'challenge', label: 'Challenge', labelRo: 'Challenge', icon: '📚' },
  { id: 'wins', label: 'Wins & Victories', labelRo: 'Victorii', icon: '🏆' },
  { id: 'support', label: 'Support', labelRo: 'Ajutor', icon: '🆘' },
];

interface SkoolCategoryFilterProps {
  active: string;
  onChange: (id: string) => void;
}

export const SkoolCategoryFilter: React.FC<SkoolCategoryFilterProps> = ({ active, onChange }) => {
  const { language } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border',
            active === cat.id
              ? 'bg-foreground text-background border-foreground'
              : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
          )}
        >
          {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
          {language === 'ro' ? cat.labelRo : cat.label}
        </button>
      ))}
    </div>
  );
};
