
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, PlusCircle, CheckCircle } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

interface CompletedStackProps {
  committedAction: string;
  stackCompleted: boolean;
  onReset: () => void;
  onAddToHotList: () => void;
  actionAddedToHotList?: boolean;
}

export const CompletedStack: React.FC<CompletedStackProps> = ({
  committedAction,
  stackCompleted,
  onReset,
  onAddToHotList,
  actionAddedToHotList = false
}) => {
  const { language } = useLanguage();

  return (
    <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-red-400 mb-2">
          {language === 'en' ? "Committed Action" : "Acțiune Angajată"}
        </h1>
        
        {committedAction ? (
          <div className="p-3 bg-background/50 rounded border-l-4 border-red-500 mb-4">
            <p className="text-sm sm:text-base text-foreground">{committedAction}</p>
            {actionAddedToHotList && (
              <div className="flex items-center text-green-400 text-xs sm:text-sm mt-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {language === 'en' 
                  ? "This action has been added to your Hot List" 
                  : "Această acțiune a fost adăugată la lista ta fierbinte"}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-background/50 rounded border-l-4 border-red-500 mb-4">
            <p className="text-sm sm:text-base text-foreground">{language === 'en' 
              ? "Your anger stack has been completed and saved." 
              : "Stack-ul tău de furie a fost finalizat și salvat."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={onReset}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {language === 'en' ? "Start a new stack" : "Începe un nou stack"}
        </Button>
        {committedAction && !actionAddedToHotList && (
          <Button 
            onClick={onAddToHotList}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {language === 'en' ? "Add to Hot list" : "Adaugă la lista fierbinte"}
          </Button>
        )}
      </div>
    </div>
  );
};
