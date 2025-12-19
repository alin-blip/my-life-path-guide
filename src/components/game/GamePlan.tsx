
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type GameCategory = 'body' | 'being' | 'balance' | 'business';

interface GamePlanData {
  lesson: string;
  story: string;
  revelation: string;
  action: string;
}

interface GamePlanProps {
  category: GameCategory;
}

export const GamePlan: React.FC<GamePlanProps> = ({ category }) => {
  const [gameData, setGameData] = useState<Record<GameCategory, GamePlanData>>({
    body: { lesson: '', story: '', revelation: '', action: '' },
    being: { lesson: '', story: '', revelation: '', action: '' },
    balance: { lesson: '', story: '', revelation: '', action: '' },
    business: { lesson: '', story: '', revelation: '', action: '' },
  });
  const { toast } = useToast();
  const { language } = useLanguage();
  
  useEffect(() => {
    // Load saved game data from local storage
    const savedData = localStorage.getItem('napoleon-hill-game-plans');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGameData(parsedData);
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    }
  }, []);
  
  const saveGameData = (category: GameCategory, field: keyof GamePlanData, value: string) => {
    setGameData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };
  
  const finalizeGamePlan = (category: GameCategory) => {
    // Save to local storage
    localStorage.setItem('napoleon-hill-game-plans', JSON.stringify(gameData));
    
    // Show success toast
    toast({
      title: language === 'en' ? "Game Plan Saved" : "Planul de Joc Salvat",
      description: language === 'en' 
        ? `Your ${category} game plan has been saved successfully.` 
        : `Planul tău de joc pentru ${translateCategory(category)} a fost salvat cu succes.`,
    });
  };
  
  const translateCategory = (cat: GameCategory): string => {
    if (language === 'en') return cat.charAt(0).toUpperCase() + cat.slice(1);
    
    const translations: Record<GameCategory, string> = {
      body: 'Corp',
      being: 'Ființă',
      balance: 'Echilibru',
      business: 'Afacere'
    };
    
    return translations[cat];
  };
  
  // Section background colors based on category
  const getSectionColor = (): string => {
    switch(category) {
      case 'body': return 'bg-red-900/10 border-red-500/30';
      case 'being': return 'bg-blue-900/10 border-blue-500/30';
      case 'balance': return 'bg-green-900/10 border-green-500/30';
      case 'business': return 'bg-purple-900/10 border-purple-500/30';
      default: return 'bg-gray-900/10 border-gray-500/30';
    }
  };
  
  // Button colors based on category
  const getButtonColor = (): string => {
    switch(category) {
      case 'body': return 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30';
      case 'being': return 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30';
      case 'balance': return 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30';
      case 'business': return 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border-gray-500/30';
    }
  };
  
  return (
    <Card className="border-[#273043] overflow-hidden shadow-lg mb-8">
      <div className="p-4 bg-gradient-to-br from-[#1e2943] to-[#131a2c] border-b border-[#273043]">
        <h2 className="text-xl font-bold mb-6">
          {translateCategory(category)} {language === 'en' ? 'Game Plan' : 'Plan de Joc'}
        </h2>
        
        <div className="space-y-6">
          {/* Lesson Section */}
          <div className={`p-4 rounded-lg border ${getSectionColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              1. {language === 'en' ? 'Your Lesson' : 'Lecția Ta'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'What have you learned in this area?' : 'Ce ai învățat în acest domeniu?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Enter your lesson here...' : 'Introdu lecția ta aici...'}
              className={`min-h-[100px] ${getSectionColor()}`}
              value={gameData[category]?.lesson || ''}
              onChange={(e) => saveGameData(category, 'lesson', e.target.value)}
            />
          </div>
          
          {/* Story Section */}
          <div className={`p-4 rounded-lg border ${getSectionColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              2. {language === 'en' ? 'Your Story' : 'Povestea Ta'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'What\'s your current narrative in this area?' : 'Care este narațiunea ta curentă în acest domeniu?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Enter your story here...' : 'Introdu povestea ta aici...'}
              className={`min-h-[100px] ${getSectionColor()}`}
              value={gameData[category]?.story || ''}
              onChange={(e) => saveGameData(category, 'story', e.target.value)}
            />
          </div>
          
          {/* Revelation Section */}
          <div className={`p-4 rounded-lg border ${getSectionColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              3. {language === 'en' ? 'Your Revelation' : 'Revelația Ta'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'What insight or breakthrough have you had?' : 'Ce perspectivă sau descoperire ai avut?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Enter your revelation here...' : 'Introdu revelația ta aici...'}
              className={`min-h-[100px] ${getSectionColor()}`}
              value={gameData[category]?.revelation || ''}
              onChange={(e) => saveGameData(category, 'revelation', e.target.value)}
            />
          </div>
          
          {/* Action Section */}
          <div className={`p-4 rounded-lg border ${getSectionColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              4. {language === 'en' ? 'Your Action' : 'Acțiunea Ta'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'What specific actions will you take?' : 'Ce acțiuni specifice vei întreprinde?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Enter your action plan here...' : 'Introdu planul tău de acțiune aici...'}
              className={`min-h-[100px] ${getSectionColor()}`}
              value={gameData[category]?.action || ''}
              onChange={(e) => saveGameData(category, 'action', e.target.value)}
            />
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => finalizeGamePlan(category)}
              className={`flex items-center space-x-2 ${getButtonColor()}`}
              variant="outline"
            >
              <Save size={16} />
              <span>{language === 'en' ? 'Save Game Plan' : 'Salvează Planul de Joc'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
