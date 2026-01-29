import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContinueMindsetDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onClose: () => void;
  language?: 'ro' | 'en';
}

export function ContinueMindsetDialog({
  isOpen,
  onContinue,
  onClose,
  language = 'ro',
}: ContinueMindsetDialogProps) {
  // Trigger confetti when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#14b8a6'],
      });
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md bg-gradient-to-br from-background to-primary/5 border-primary/20">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-2xl">
            {language === 'ro' ? '🎉 Felicitări!' : '🎉 Congratulations!'}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center text-base">
            {language === 'ro' 
              ? 'Ai adăugat acțiunea în HIT List! Acum ai un pas concret spre transformare.'
              : 'You\'ve added the action to your HIT List! Now you have a concrete step towards transformation.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-primary/5 rounded-xl p-4 my-4 border border-primary/10">
          <p className="text-sm text-center text-muted-foreground">
            {language === 'ro'
              ? 'Vrei să continui să lucrezi la mindset acum?'
              : 'Would you like to continue working on your mindset?'}
          </p>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {language === 'ro' ? 'Nu acum' : 'Not now'}
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={onContinue}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Brain className="h-4 w-4 mr-2" />
            {language === 'ro' ? 'Da, continuă!' : 'Yes, continue!'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
