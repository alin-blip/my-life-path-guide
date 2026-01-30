import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export const Day1JoinCommunity: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleJoinCommunity = () => {
    navigate('/brotherhood?tab=tribes');
  };

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Users className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {language === 'ro' 
                ? '👥 Alătură-te Comunității Warrior' 
                : '👥 Join the Warrior Community'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ro'
                ? 'Prezintă-te în tribul Warrior. Spune-ne numele tău și de ce ești aici. Conectează-te cu alți oameni care parcurg același drum.'
                : 'Introduce yourself in the Warrior tribe. Tell us your name and why you\'re here. Connect with others on the same journey.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleJoinCommunity}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Intră în Comunitate' : 'Join Community'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Day1JoinCommunity;
