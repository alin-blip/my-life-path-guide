import React, { useState } from 'react';
import { HelpCircle, KeyRound, Sparkles, Flame, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const DoorHelpButton: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const components = [
    {
      icon: Flame,
      title: language === 'en' ? 'Ideas (Potential)' : 'Idei (Potențial)',
      description: language === 'en' 
        ? 'Your idea list with all action options. Add everything that comes to mind.'
        : 'Lista de idei cu toate opțiunile de acțiune. Adaugă tot ce îți vine în minte.',
      color: 'from-orange-400 to-red-500',
      textColor: 'text-orange-400'
    },
    {
      icon: KeyRound,
      title: language === 'en' ? 'Weekly Focus (Planning)' : 'Focus Săptămânal (Planificare)',
      description: language === 'en' 
        ? 'Select ONE priority item as your Domino - the action with greatest impact.'
        : 'Selectează UN element prioritar ca Domino - acțiunea cu cel mai mare impact.',
      color: 'from-blue-400 to-purple-600',
      textColor: 'text-blue-400'
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Daily Tasks (Production)' : 'Sarcini Zilnice (Producție)',
      description: language === 'en' 
        ? 'Your Hit List and Do List - essential actions for daily focus.'
        : 'Lista de Lovituri și Lista de Sarcini - acțiunile esențiale pentru focus zilnic.',
      color: 'from-purple-400 to-pink-600',
      textColor: 'text-purple-400'
    },
    {
      icon: Trophy,
      title: language === 'en' ? 'Results (Profit)' : 'Rezultate (Profit)',
      description: language === 'en' 
        ? 'Track completed tasks and achievements. Celebrate your wins!'
        : 'Urmărește sarcinile și realizările completate. Sărbătorește victoriile!',
      color: 'from-green-400 to-emerald-600',
      textColor: 'text-green-400'
    }
  ];

  const tips = [
    language === 'en' 
      ? '💡 Drag ideas to Focus to set your weekly goal' 
      : '💡 Trage ideile în Focus pentru a seta obiectivul săptămânal',
    language === 'en' 
      ? '🎯 Focus on ONE domino per week for maximum impact' 
      : '🎯 Concentrează-te pe UN singur domino pe săptămână pentru impact maxim',
    language === 'en' 
      ? '⌨️ Use Ctrl+Z / Ctrl+Y for undo/redo' 
      : '⌨️ Folosește Ctrl+Z / Ctrl+Y pentru undo/redo',
    language === 'en' 
      ? '📱 Swipe left/right on mobile to navigate sections' 
      : '📱 Swipe stânga/dreapta pe mobil pentru a naviga între secțiuni'
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <KeyRound className="w-5 h-5 text-primary" />
            {language === 'en' ? 'How To Do Works' : 'Cum Funcționează Taskuri'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {language === 'en' 
              ? 'Your daily productivity hub. Focus on what matters.'
              : 'Hub-ul tău de productivitate zilnică. Concentrează-te pe ce contează.'}
          </SheetDescription>
        </SheetHeader>

        {/* Components */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'en' ? 'The Four Components' : 'Cele Patru Componente'}
          </h4>
          
          {components.map((component, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${component.color} flex items-center justify-center`}>
                <component.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className={`font-medium ${component.textColor} text-sm`}>
                  {component.title}
                </h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {component.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'en' ? 'Quick Tips' : 'Sfaturi Rapide'}
          </h4>
          
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="text-sm text-foreground/80 p-2 rounded bg-muted/20">
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <Button 
          variant="outline" 
          className="w-full mt-6"
          onClick={() => setIsOpen(false)}
        >
          {language === 'en' ? 'Got it!' : 'Am înțeles!'}
        </Button>
      </SheetContent>
    </Sheet>
  );
};
