import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Target, Rocket, Calendar, Map, ArrowRight, Sparkles } from 'lucide-react';
import { PlanningAnswers } from './VisionPlanningWizard';
import { QuizCategory, categoryLabels } from '../quizData';

interface VisionPlanSummaryProps {
  language: 'en' | 'ro';
  answers: PlanningAnswers;
  lowestCategory: QuizCategory;
  onContinue: () => void;
}

export const VisionPlanSummary: React.FC<VisionPlanSummaryProps> = ({
  language,
  answers,
  lowestCategory,
  onContinue,
}) => {
  const categoryLabel = language === 'en' 
    ? categoryLabels[lowestCategory].en 
    : categoryLabels[lowestCategory].ro;

  const summaryItems = [
    {
      icon: Target,
      title: language === 'en' ? 'Annual Vision 2026' : 'Viziune Anuală 2026',
      content: answers.annual.main_goal,
      color: 'amber',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      icon: Rocket,
      title: language === 'en' ? '90-Day Sprint' : 'Sprint 90 Zile',
      content: answers.quarterly.quarterly_milestone,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      icon: Calendar,
      title: language === 'en' ? '30-Day Mission' : 'Misiune 30 Zile',
      content: answers.monthly.monthly_focus,
      color: 'green',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      icon: Map,
      title: language === 'en' ? 'First Week Action' : 'Acțiunea Primei Săptămâni',
      content: answers.monthly.weekly_commitment,
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mx-auto shadow-lg shadow-orange-500/30">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' 
            ? 'Your 2026 Roadmap is Ready!' 
            : 'Harta Ta pentru 2026 este Gata!'}
        </h2>
        
        <p className="text-white/60 max-w-md mx-auto">
          {language === 'en'
            ? `Focus area: ${categoryLabel}. Here's your strategic plan to transform your life.`
            : `Zona de focus: ${categoryLabel}. Iată planul tău strategic pentru transformare.`}
        </p>
      </div>

      {/* Plan Summary Cards */}
      <div className="space-y-3">
        {summaryItems.map((item, idx) => (
          <div 
            key={idx}
            className={`${item.bgColor} ${item.borderColor} border rounded-xl p-4 flex items-start gap-4`}
          >
            <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-400" />
                <span className={`text-xs font-medium uppercase tracking-wider ${item.iconColor}`}>
                  {item.title}
                </span>
              </div>
              <p className="text-white text-sm line-clamp-2">{item.content || '-'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next Step CTA */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">
          {language === 'en' 
            ? 'Ready to Execute Your Plan?' 
            : 'Gata să Execuți Planul?'}
        </h3>
        <p className="text-white/60 text-sm mb-4">
          {language === 'en'
            ? 'Your roadmap is saved. Now get the tools to make it happen with daily guidance, AI coaching, and progress tracking.'
            : 'Harta ta este salvată. Acum primește uneltele pentru a o realiza cu ghidaj zilnic, AI coaching și tracking de progres.'}
        </p>
        
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl gap-2"
        >
          {language === 'en' ? 'See How to Execute' : 'Vezi Cum să Execuți'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
