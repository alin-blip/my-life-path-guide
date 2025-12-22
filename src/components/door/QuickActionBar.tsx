import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Target, Zap, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionBarProps {
  onAddIdea: () => void;
  onAddTemplate: (text: string) => void;
  isMobile?: boolean;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onAddIdea,
  onAddTemplate,
  isMobile = false
}) => {
  const { language } = useLanguage();

  const quickTemplates = [
    {
      icon: Calendar,
      label: language === 'en' ? 'Meeting' : 'Întâlnire',
      template: language === 'en' ? 'Schedule meeting: ' : 'Programează întâlnire: ',
      color: 'text-blue-500 hover:bg-blue-500/10'
    },
    {
      icon: MessageSquare,
      label: language === 'en' ? 'Follow-up' : 'Follow-up',
      template: language === 'en' ? 'Follow up with: ' : 'Follow-up cu: ',
      color: 'text-orange-500 hover:bg-orange-500/10'
    },
    {
      icon: FileText,
      label: language === 'en' ? 'Deadline' : 'Deadline',
      template: language === 'en' ? 'Deadline: ' : 'Deadline: ',
      color: 'text-red-500 hover:bg-red-500/10'
    },
    {
      icon: Target,
      label: language === 'en' ? 'Goal' : 'Obiectiv',
      template: language === 'en' ? 'Goal: ' : 'Obiectiv: ',
      color: 'text-green-500 hover:bg-green-500/10'
    }
  ];

  if (isMobile) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <Button
          size="sm"
          onClick={onAddIdea}
          className="shrink-0 bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          {language === 'en' ? 'Add' : 'Adaugă'}
        </Button>
        
        {quickTemplates.slice(0, 3).map((template, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            onClick={() => onAddTemplate(template.template)}
            className={`shrink-0 ${template.color} border-border`}
          >
            <template.icon className="w-4 h-4 mr-1" />
            {template.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={onAddIdea}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-1" />
          {language === 'en' ? 'New Idea' : 'Idee nouă'}
        </Button>
        
        <div className="h-4 w-px bg-border mx-1" />
        
        {quickTemplates.map((template, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddTemplate(template.template)}
                className={`${template.color}`}
              >
                <template.icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover border-border">
              <span className="text-xs">{template.label}</span>
            </TooltipContent>
          </Tooltip>
        ))}
        
        <div className="ml-2 text-xs text-muted-foreground hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Enter</kbd>
          <span>{language === 'en' ? 'quick add' : 'adaugă rapid'}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};
