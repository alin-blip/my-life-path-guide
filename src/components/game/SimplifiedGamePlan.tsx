
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type GameCategory = 'body' | 'being' | 'balance' | 'business';

interface GameTimeFrameData {
  current: string;
  monthly: string;
  yearly: string;
}

interface SimplifiedGamePlanProps {
  category: GameCategory;
}

export const SimplifiedGamePlan: React.FC<SimplifiedGamePlanProps> = ({ category }) => {
  const [gameData, setGameData] = useState<Record<GameCategory, GameTimeFrameData>>({
    body: { current: '', monthly: '', yearly: '' },
    being: { current: '', monthly: '', yearly: '' },
    balance: { current: '', monthly: '', yearly: '' },
    business: { current: '', monthly: '', yearly: '' },
  });
  
  const { toast } = useToast();
  const { language } = useLanguage();
  
  useEffect(() => {
    // Load saved game data from local storage
    const savedData = localStorage.getItem('warrior-game-plans-simplified');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGameData(parsedData);
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    }
  }, []);
  
  const saveGameData = (category: GameCategory, timeframe: keyof GameTimeFrameData, value: string) => {
    setGameData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [timeframe]: value
      }
    }));
  };
  
  const finalizeGamePlan = () => {
    // Save to local storage
    localStorage.setItem('warrior-game-plans-simplified', JSON.stringify(gameData));
    
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
  
  const getCategoryColor = (): string => {
    switch(category) {
      case 'body': return 'bg-red-900/10 border-red-500/30';
      case 'being': return 'bg-blue-900/10 border-blue-500/30';
      case 'balance': return 'bg-green-900/10 border-green-500/30';
      case 'business': return 'bg-purple-900/10 border-purple-500/30';
      default: return 'bg-gray-900/10 border-gray-500/30';
    }
  };
  
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
          {translateCategory(category)} {language === 'en' ? 'Journey Map' : 'Harta Călătoriei'}
        </h2>
        
        <div className="space-y-6">
          {/* Current Reality */}
          <div className={`p-4 rounded-lg border ${getCategoryColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              1. {language === 'en' ? 'Current Reality' : 'Realitatea Actuală'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'Where are you today?' : 'Unde te afli astăzi?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Describe your current situation...' : 'Descrie situația ta actuală...'}
              className={`min-h-[100px] ${getCategoryColor()}`}
              value={gameData[category]?.current || ''}
              onChange={(e) => saveGameData(category, 'current', e.target.value)}
            />
          </div>
          
          {/* Monthly Goal */}
          <div className={`p-4 rounded-lg border ${getCategoryColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              2. {language === 'en' ? 'Monthly Goal' : 'Obiectiv Lunar'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'Where do you want to be in one month?' : 'Unde vrei să fii într-o lună?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Describe your one-month goal...' : 'Descrie obiectivul tău pentru următoarea lună...'}
              className={`min-h-[100px] ${getCategoryColor()}`}
              value={gameData[category]?.monthly || ''}
              onChange={(e) => saveGameData(category, 'monthly', e.target.value)}
            />
          </div>
          
          {/* Annual Goal */}
          <div className={`p-4 rounded-lg border ${getCategoryColor()}`}>
            <h3 className="text-md font-semibold mb-2">
              3. {language === 'en' ? 'Annual Goal' : 'Obiectiv Anual'}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {language === 'en' ? 'Where do you want to be in one year?' : 'Unde vrei să fii într-un an?'}
            </p>
            <Textarea
              placeholder={language === 'en' ? 'Describe your one-year goal...' : 'Descrie obiectivul tău pentru următorul an...'}
              className={`min-h-[100px] ${getCategoryColor()}`}
              value={gameData[category]?.yearly || ''}
              onChange={(e) => saveGameData(category, 'yearly', e.target.value)}
            />
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={finalizeGamePlan}
              className={`flex items-center space-x-2 ${getButtonColor()}`}
              variant="outline"
            >
              <Save size={16} />
              <span>{language === 'en' ? 'Save Journey Map' : 'Salvează Harta Călătoriei'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
