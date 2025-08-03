
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/LanguageContext';

interface YesNoSelectionProps {
  step: number;
  answers: Record<number, string>;
  onYesClick: () => void;
  onNoClick: () => void;
  isSpecialCase?: boolean;
}

export const YesNoSelection: React.FC<YesNoSelectionProps> = ({ 
  step, 
  answers,
  onYesClick, 
  onNoClick,
  isSpecialCase = false
}) => {
  const { language } = useLanguage();

  return (
    <div className="flex justify-center space-x-4 mt-6">
      <Button 
        variant="outline" 
        className="bg-green-700 hover:bg-green-600 border-green-500 text-white px-8 py-4 text-lg"
        onClick={onYesClick}
      >
        {language === 'en' ? "Yes" : "Da"}
      </Button>
      <Button 
        variant="outline" 
        className="bg-red-700 hover:bg-red-600 border-red-500 text-white px-8 py-4 text-lg"
        onClick={onNoClick}
      >
        {language === 'en' ? "No" : "Nu"}
      </Button>
    </div>
  );
};
