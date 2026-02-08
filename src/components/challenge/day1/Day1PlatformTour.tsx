import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { 
  LayoutDashboard, BookOpen, Crown, Palette, Brain, Dumbbell, 
  ArrowRight, Sparkles, GraduationCap 
} from 'lucide-react';

interface Day1PlatformTourProps {
  onComplete: () => void;
}

const PLATFORM_MODULES = [
  {
    id: 'programs',
    titleRo: 'Programe',
    titleEn: 'Programs',
    descriptionRo: 'Challenge-ul de 7 zile și Acceleratorul - cursuri structurate pas cu pas.',
    descriptionEn: '7-day Challenge and Accelerator - step-by-step structured courses.',
    icon: GraduationCap,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'dashboard',
    titleRo: 'Tabloul de Bord',
    titleEn: 'Dashboard',
    descriptionRo: 'Vezi progresul tău zilnic, scorurile, streak-urile și obiectivele în toate cele 4 arii.',
    descriptionEn: 'View your daily progress, scores, streaks and objectives across all 4 areas.',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'lifebook',
    titleRo: 'Life Design Blueprint',
    titleEn: 'Life Design Blueprint',
    descriptionRo: 'Definește-ți viziunea de viață în 12 categorii. Fundația transformării tale.',
    descriptionEn: 'Define your life vision across 12 categories. The foundation of your transformation.',
    icon: BookOpen,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'daily-routine',
    titleRo: 'Rutina Zilnică',
    titleEn: 'Daily Routine',
    descriptionRo: 'Rutina ta matinală personalizată: meditație, jurnaling, exerciții și mai mult.',
    descriptionEn: 'Your personalized morning routine: meditation, journaling, exercise and more.',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    id: 'vision-board',
    titleRo: 'Vision Board AI',
    titleEn: 'AI Vision Board',
    descriptionRo: 'Generează imagini AI pentru obiectivele tale și creează un vision board puternic.',
    descriptionEn: 'Generate AI images for your goals and create a powerful vision board.',
    icon: Palette,
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'stacks',
    titleRo: 'Stacks AI Coaching',
    titleEn: 'AI Coaching Stacks',
    descriptionRo: 'Sesiuni ghidate de coaching cu AI: gestionare furie, claritate, empowerment.',
    descriptionEn: 'AI-guided coaching sessions: anger management, clarity, empowerment.',
    icon: Brain,
    gradient: 'from-indigo-500 to-violet-500'
  },
  {
    id: 'fitness',
    titleRo: 'Fitness Hub',
    titleEn: 'Fitness Hub',
    descriptionRo: 'Workout-uri personalizate, tracking nutriție, și progres fizic complet.',
    descriptionEn: 'Personalized workouts, nutrition tracking, and complete physical progress.',
    icon: Dumbbell,
    gradient: 'from-green-500 to-emerald-500'
  }
];

export const Day1PlatformTour: React.FC<Day1PlatformTourProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  
  return (
    <Card className="p-6 bg-card border-primary/20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRo ? 'PASUL 3: TOUR PLATFORMĂ' : 'STEP 3: PLATFORM TOUR'}
        </h2>
        <p className="text-muted-foreground">
          {isRo 
            ? 'Descoperă instrumentele care te vor ajuta să îți atingi obiectivele' 
            : 'Discover the tools that will help you achieve your goals'}
        </p>
      </div>
      
      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {PLATFORM_MODULES.map((module) => {
          const Icon = module.icon;
          
          return (
            <div 
              key={module.id}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-muted/30 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {isRo ? module.titleRo : module.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isRo ? module.descriptionRo : module.descriptionEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Info Note */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6 border border-border">
        <p className="text-sm text-muted-foreground text-center">
          {isRo 
            ? '💡 Vei explora fiecare modul în detaliu pe parcursul celor 7 zile de challenge.' 
            : '💡 You will explore each module in detail throughout the 7-day challenge.'}
        </p>
      </div>
      
      {/* Continue Button */}
      <Button
        onClick={onComplete}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
      >
        {isRo ? 'Am înțeles, continuă' : 'Got it, continue'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </Card>
  );
};
