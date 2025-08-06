import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OnboardingTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  isVisible: boolean;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  step,
  totalSteps,
  title,
  description,
  isVisible,
  onNext,
  onSkip,
  onClose,
  position = 'bottom'
}) => {
  const { language } = useLanguage();

  if (!isVisible) return null;

  const isLastStep = step === totalSteps;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center animate-fade-in">
      <Card className="max-w-sm mx-4 border-primary/20 bg-gradient-to-br from-card to-card/90 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{step}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {step} / {totalSteps}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              {language === 'en' ? 'Skip' : 'Sări peste'}
            </Button>
            
            <Button onClick={onNext} size="sm" className="flex items-center gap-2">
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {language === 'en' ? 'Got it!' : 'Am înțeles!'}
                </>
              ) : (
                <>
                  {language === 'en' ? 'Next' : 'Următorul'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};