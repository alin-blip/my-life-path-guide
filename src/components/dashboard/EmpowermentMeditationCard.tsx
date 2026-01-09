import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, Brain, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmpowermentMeditation } from '@/hooks/useEmpowermentMeditation';
import { useLanguage } from '@/context/LanguageContext';

export const EmpowermentMeditationCard: React.FC = () => {
  const { meditation, isLoading, hasMeditation } = useEmpowermentMeditation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleStartMeditation = () => {
    navigate('/daily-flow', { state: { initialStep: 'meditation' } });
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-violet-500/20 rounded w-3/4 mb-2" />
              <div className="h-3 bg-violet-500/20 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasMeditation) {
    return (
      <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-500/40 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                {language === 'ro' ? 'Meditație Empowerment' : 'Empowerment Meditation'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ro' 
                  ? 'Generează meditația personalizată din Vision Board' 
                  : 'Generate your personalized meditation from Vision Board'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/core')}
              className="border-violet-500/30 hover:bg-violet-500/10"
            >
              {language === 'ro' ? 'Generează' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate duration display
  const durationMinutes = meditation?.duration_seconds 
    ? Math.round(meditation.duration_seconds / 60) 
    : 10;

  return (
    <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-500/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              {language === 'ro' ? 'Meditație Empowerment' : 'Empowerment Meditation'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'ro' 
                ? `Meditație personalizată • ${durationMinutes} min` 
                : `Personalized meditation • ${durationMinutes} min`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleStartMeditation}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
          >
            <Play className="w-4 h-4 mr-1" />
            {language === 'ro' ? 'Ascultă' : 'Listen'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
