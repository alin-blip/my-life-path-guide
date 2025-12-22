import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar, Lightbulb, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DoorEmptyStateProps {
  onAddItem: () => void;
  onAddTemplate: (text: string) => void;
}

export const DoorEmptyState: React.FC<DoorEmptyStateProps> = ({ 
  onAddItem,
  onAddTemplate
}) => {
  const { language } = useLanguage();

  const templates = [
    {
      icon: Calendar,
      text: language === 'en' ? 'Schedule important meeting' : 'Programează întâlnire importantă',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      icon: Target,
      text: language === 'en' ? 'Complete project milestone' : 'Finalizează etapă proiect',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20'
    },
    {
      icon: Zap,
      text: language === 'en' ? 'Follow up with client' : 'Follow-up cu clientul',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 animate-fade-in">
      {/* Simple Icon */}
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Lightbulb className="w-7 h-7 text-primary" />
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-1 text-center">
        {language === 'en' ? 'Start your week' : 'Începe săptămâna'}
      </h3>
      
      <p className="text-xs text-muted-foreground mb-4 text-center px-2">
        {language === 'en' 
          ? 'Add ideas and set your focus'
          : 'Adaugă idei și setează focusul'}
      </p>
      
      {/* Main CTA */}
      <Button
        onClick={onAddItem}
        className="mb-4 bg-primary hover:bg-primary/90 text-primary-foreground"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" />
        {language === 'en' ? 'Add idea' : 'Adaugă idee'}
      </Button>
      
      {/* Quick Templates - Compact */}
      <div className="w-full space-y-1.5">
        <p className="text-[10px] text-muted-foreground text-center mb-2">
          {language === 'en' ? 'Quick add:' : 'Adaugă rapid:'}
        </p>
        
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onAddTemplate(template.text)}
            className={`w-full flex items-center gap-2 p-2.5 rounded-lg ${template.bgColor} transition-all text-left`}
          >
            <template.icon className={`w-4 h-4 shrink-0 ${template.color}`} />
            <span className="text-xs text-foreground truncate">{template.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
