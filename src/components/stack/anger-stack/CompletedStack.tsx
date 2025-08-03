
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
    <Card className="border-red-500/30 bg-red-950/10">
      <CardHeader>
        <CardTitle className="text-center text-red-400">
          {language === 'en' ? "Committed Action" : "Acțiune Angajată"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {committedAction ? (
          <div>
            <p className="text-gray-300 mb-2">{committedAction}</p>
            {actionAddedToHotList && (
              <div className="flex items-center text-green-400 text-sm mt-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                {language === 'en' 
                  ? "This action has been added to your Hot List" 
                  : "Această acțiune a fost adăugată la lista ta fierbinte"}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-300">{language === 'en' 
            ? "Your anger stack has been completed and saved." 
            : "Stack-ul tău de furie a fost finalizat și salvat."}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          className="hover:bg-red-800 border-red-500/30"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {language === 'en' ? "Start a new stack" : "Începe un nou stack"}
        </Button>
        {committedAction && !actionAddedToHotList && (
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onAddToHotList}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {language === 'en' ? "Add to Hot list" : "Adaugă la lista fierbinte"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
