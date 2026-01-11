import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Sparkles, Dumbbell, Brain, 
  LayoutDashboard, BookOpen, Image, ChevronLeft, ChevronRight
} from 'lucide-react';

interface WalkthroughStep {
  icon: React.ElementType;
  titleEn: string;
  titleRo: string;
  descriptionEn: string;
  descriptionRo: string;
  path: string;
  color: string;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    icon: Target,
    titleEn: 'Door (Command Center)',
    titleRo: 'Door (Centrul de Comandă)',
    descriptionEn: 'Your weekly planning hub. Set your Domino task, manage HIT/DO lists, and track your weekly progress. This is where strategy meets execution.',
    descriptionRo: 'Hub-ul tău de planificare săptămânală. Setează task-ul Domino, gestionează listele HIT/DO și urmărește progresul săptămânal. Aici strategia întâlnește execuția.',
    path: '/door',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Sparkles,
    titleEn: 'Goal Wizard',
    titleRo: 'Wizard Obiective',
    descriptionEn: 'AI-powered goal setting. Break down your annual vision into 90-day sprints, monthly missions, and weekly actions with guided AI coaching.',
    descriptionRo: 'Setare obiective cu AI. Împarte viziunea anuală în sprinturi de 90 zile, misiuni lunare și acțiuni săptămânale cu coaching AI ghidat.',
    path: '/goal-wizard',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Dumbbell,
    titleEn: 'Champion Routine',
    titleRo: 'Rutina Campionului',
    descriptionEn: 'Your morning power routine. Meditation, breathing, visualization, gratitude - everything you need to start your day as a champion.',
    descriptionRo: 'Rutina ta de dimineață. Meditație, respirație, vizualizare, gratitudine - tot ce ai nevoie pentru a-ți începe ziua ca un campion.',
    path: '/champion',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Brain,
    titleEn: 'AI Meditations',
    titleRo: 'Meditații AI',
    descriptionEn: 'Personalized empowerment meditations generated from YOUR objectives. The AI creates custom scripts that reinforce your specific goals.',
    descriptionRo: 'Meditații de împuternicire personalizate generate din obiectivele TALE. AI-ul creează scripturi care îți întăresc obiectivele specifice.',
    path: '/empowerment-meditation',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Image,
    titleEn: 'Vision Board',
    titleRo: 'Tabla Viziunii',
    descriptionEn: 'Generate AI images that represent your goals. Visualize your success with custom imagery that keeps you motivated and focused.',
    descriptionRo: 'Generează imagini AI care reprezintă obiectivele tale. Vizualizează succesul cu imagini personalizate care te mențin motivat și concentrat.',
    path: '/vision-board',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: BookOpen,
    titleEn: 'Lifebook',
    titleRo: 'Cartea Vieții',
    descriptionEn: 'Your complete life design blueprint. Document your vision, strategy, and purpose across all 12 life categories through guided conversations.',
    descriptionRo: 'Planul tău complet de design al vieții. Documentează-ți viziunea, strategia și scopul în toate cele 12 categorii ale vieții prin conversații ghidate.',
    path: '/lifebook',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: LayoutDashboard,
    titleEn: 'Dashboard & Analytics',
    titleRo: 'Dashboard și Analize',
    descriptionEn: 'Track your progress, view streaks, and analyze your performance. See how consistent action leads to extraordinary results.',
    descriptionRo: 'Urmărește-ți progresul, vezi streak-urile și analizează performanța. Vezi cum acțiunea constantă duce la rezultate extraordinare.',
    path: '/dashboard',
    color: 'from-teal-500 to-cyan-500'
  }
];

export const ChallengeWalkthrough = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = walkthroughSteps[currentStep];
  const Icon = step.icon;

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(walkthroughSteps.length - 1, prev + 1));
  };

  return (
    <Card className="p-6 bg-card border-border">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          📚 {language === 'en' ? 'Platform Walkthrough' : 'Walkthrough Platformă'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'en' 
            ? 'Learn how to use each module to achieve your goals' 
            : 'Învață cum să folosești fiecare modul pentru a-ți atinge obiectivele'}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {walkthroughSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentStep 
                ? 'bg-primary w-6' 
                : index < currentStep 
                  ? 'bg-primary/50' 
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Current Step Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            {language === 'en' ? step.titleEn : step.titleRo}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-6 max-w-md">
            {language === 'en' ? step.descriptionEn : step.descriptionRo}
          </p>

          {/* Try Now Button */}
          <Button 
            onClick={() => navigate(step.path)}
            className={`bg-gradient-to-r ${step.color} hover:opacity-90`}
          >
            {language === 'en' ? 'Try Now' : 'Încearcă Acum'} →
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {language === 'en' ? 'Previous' : 'Anterior'}
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentStep + 1} / {walkthroughSteps.length}
        </span>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentStep === walkthroughSteps.length - 1}
        >
          {language === 'en' ? 'Next' : 'Următor'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
