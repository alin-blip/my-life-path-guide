import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, Flag, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HierarchyBadgeProps {
  type: 'annual' | 'quarterly' | 'monthly' | 'weekly';
  title: string;
  category?: string;
  className?: string;
}

const TYPE_CONFIG = {
  annual: {
    icon: Crown,
    label: { en: 'Annual Goal', ro: 'Obiectiv Anual' },
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  },
  quarterly: {
    icon: Target,
    label: { en: '90-Day Goal', ro: 'Obiectiv 90 Zile' },
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  monthly: {
    icon: Flag,
    label: { en: 'Monthly Mission', ro: 'Misiune Lunară' },
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  weekly: {
    icon: Calendar,
    label: { en: 'Weekly Task', ro: 'Task Săptămânal' },
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30'
  }
};

export const HierarchyBadge: React.FC<HierarchyBadgeProps> = ({ 
  type, 
  title, 
  className 
}) => {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 px-2 py-1 text-xs font-medium cursor-default transition-colors",
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="truncate max-w-[150px]">{title}</span>
    </Badge>
  );
};

interface HierarchyChainProps {
  chain: Array<{
    type: 'annual' | 'quarterly' | 'monthly' | 'weekly';
    title: string;
  }>;
  className?: string;
}

export const HierarchyChain: React.FC<HierarchyChainProps> = ({ chain, className }) => {
  if (!chain || chain.length === 0) return null;

  return (
    <div className={cn("flex items-center flex-wrap gap-1", className)}>
      {chain.map((item, idx) => (
        <React.Fragment key={idx}>
          <HierarchyBadge type={item.type} title={item.title} />
          {idx < chain.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
