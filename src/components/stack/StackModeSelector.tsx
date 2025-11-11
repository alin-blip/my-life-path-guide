import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Keyboard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AudioCalibrationScreen } from './AudioCalibrationScreen';

interface StackModeSelectorProps {
  onSelectMode: (mode: 'audio' | 'text') => void;
}

export const StackModeSelector: React.FC<StackModeSelectorProps> = ({ onSelectMode }) => {
  const { language } = useLanguage();
  const [showCalibration, setShowCalibration] = useState(false);

  const isRomanian = language === 'ro';
  
  const handleAudioSelect = () => {
    const skipCalibration = localStorage.getItem('audio-calibration-completed') === 'true';
    if (skipCalibration) {
      onSelectMode('audio');
    } else {
      setShowCalibration(true);
    }
  };

  if (showCalibration) {
    return (
      <AudioCalibrationScreen
        onComplete={() => onSelectMode('audio')}
        onSkip={() => {
          localStorage.setItem('skip-audio-calibration', 'true');
          onSelectMode('audio');
        }}
      />
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isRomanian ? 'Cum vrei să completezi Stack-ul?' : 'How would you like to complete the Stack?'}
          </h2>
          <p className="text-muted-foreground">
            {isRomanian 
              ? 'Alege modul preferat pentru o experiență personalizată' 
              : 'Choose your preferred mode for a personalized experience'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Audio Mode */}
          <Card 
            className="border-2 hover:border-primary transition-all cursor-pointer group hover:shadow-lg"
            onClick={handleAudioSelect}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
              </div>
              
          <h3 className="text-2xl font-bold text-foreground mb-3">
            {isRomanian ? '🎙️ Sesiune Audio' : '🎙️ Audio Session'}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {isRomanian 
              ? 'Conversație complet vocală. AI vorbește, tu răspunzi vocal. Transcriptul apare automat pe ecran.'
              : 'Complete voice conversation. AI speaks, you answer vocally. Transcript appears automatically on screen.'}
          </p>

          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'AI vorbește, tu asculți' : 'AI speaks, you listen'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Răspunzi vocal, fără tastatură' : 'Answer by voice, no keyboard'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Transcriere automată a întregii conversații' : 'Automatic transcription of entire conversation'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Experiență hands-free completă' : 'Complete hands-free experience'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Salvare automată în bibliotecă' : 'Automatic save to library'}</span>
            </div>
          </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAudioSelect();
                }}
              >
                {isRomanian ? 'Alege Audio' : 'Choose Audio'}
              </Button>
            </CardContent>
          </Card>

          {/* Text Mode */}
          <Card 
            className="border-2 hover:border-primary transition-all cursor-pointer group hover:shadow-lg"
            onClick={() => onSelectMode('text')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Keyboard className="w-10 h-10 text-primary" />
                </div>
              </div>
              
          <h3 className="text-2xl font-bold text-foreground mb-3">
            {isRomanian ? '✍️ Sesiune Clasică' : '✍️ Classic Session'}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {isRomanian 
              ? 'Scrii cu tastatura și/sau vorbești cu microfonul. Controlezi când să folosești fiecare.'
              : 'Type with keyboard and/or speak with microphone. You control when to use each.'}
          </p>

          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Scrii răspunsurile' : 'Write your answers'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Microfon disponibil opțional' : 'Optional microphone available'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'AI poate citi răspunsurile (opțional)' : 'AI can read answers (optional)'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">✓</span>
              <span>{isRomanian ? 'Control complet asupra inputului' : 'Full control over input'}</span>
            </div>
          </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMode('text');
                }}
              >
                {isRomanian ? 'Alege Text' : 'Choose Text'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isRomanian 
            ? 'Preferința ta va fi salvată pentru următoarele sesiuni' 
            : 'Your preference will be saved for future sessions'}
        </p>
      </div>
    </div>
  );
};
