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
    <div className="flex flex-col items-center justify-center py-8 px-4 animate-fade-in">
      {/* Animated Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Lightbulb className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-accent animate-bounce" />
        </div>
      </div>
      
      {/* Main Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {language === 'en' ? 'What do you want to achieve this week?' : 'Ce vrei să realizezi săptămâna asta?'}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
        {language === 'en' 
          ? 'Add your ideas and drag them to Focus to set your weekly goal'
          : 'Adaugă ideile tale și trage-le în Focus pentru a seta obiectivul săptămânal'}
      </p>
      
      {/* Main CTA Button */}
      <Button
        onClick={onAddItem}
        className="mb-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        {language === 'en' ? 'Add your first idea' : 'Adaugă prima ta idee'}
      </Button>
      
      {/* Quick Templates */}
      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground text-center mb-3">
          {language === 'en' ? 'Or start with a template:' : 'Sau începe cu un șablon:'}
        </p>
        
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onAddTemplate(template.text)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${template.bgColor} border border-transparent hover:border-border transition-all duration-200 text-left group`}
          >
            <template.icon className={`w-4 h-4 ${template.color} group-hover:scale-110 transition-transform`} />
            <span className="text-sm text-foreground">{template.text}</span>
          </button>
        ))}
      </div>
      
      {/* Keyboard Shortcut Hint */}
      <p className="mt-6 text-xs text-muted-foreground flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">Enter</kbd>
        <span>{language === 'en' ? 'to add quickly' : 'pentru adăugare rapidă'}</span>
      </p>
    </div>
  );
};
