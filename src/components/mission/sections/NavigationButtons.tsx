
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  className = '',
}) => {
  const { language } = useLanguage();
  
  const defaultBackLabel = language === 'en' ? 'PREVIOUS' : 'ANTERIOR';
  const defaultNextLabel = language === 'en' ? 'NEXT' : 'URMĂTORUL';
  
  return (
    <div className={`flex justify-between w-full ${className}`}>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="text-white hover:bg-gray-800/50"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {backLabel || defaultBackLabel}
      </Button>
      <Button 
        className="px-8 py-2 rounded-full text-white bg-green-500 hover:bg-green-600 flex items-center" 
        onClick={onNext}
      >
        {nextLabel || defaultNextLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
