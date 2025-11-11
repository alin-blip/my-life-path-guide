import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Keyboard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StackModeSelectorProps {
  onSelectMode: (mode: 'audio' | 'text') => void;
}

export const StackModeSelector: React.FC<StackModeSelectorProps> = ({ onSelectMode }) => {
  const { language } = useLanguage();

  const isRomanian = language === 'ro';

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
            onClick={() => onSelectMode('audio')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {isRomanian ? '🎤 Mod Audio' : '🎤 Audio Mode'}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {isRomanian 
                  ? 'Conversație vocală completă cu AI. Întrebările sunt citite cu voce, tu răspunzi vocal, totul se transcrie automat.'
                  : 'Complete voice conversation with AI. Questions are read aloud, you respond with your voice, everything is transcribed automatically.'}
              </p>

              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'AI citește întrebările cu voce' : 'AI reads questions aloud'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Răspunzi prin voce' : 'Answer by voice'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Transcriere automată' : 'Automatic transcription'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Experiență hands-free' : 'Hands-free experience'}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMode('audio');
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
                {isRomanian ? '⌨️ Mod Text' : '⌨️ Text Mode'}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {isRomanian 
                  ? 'Răspunde prin tastare sau activează voice-ul manual când vrei. Flexibilitate maximă în comunicare.'
                  : 'Answer by typing or activate voice manually when you want. Maximum flexibility in communication.'}
              </p>

              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Tastezi răspunsurile' : 'Type your answers'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Voice opțional disponibil' : 'Optional voice available'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Control complet' : 'Full control'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-2">✓</span>
                  <span>{isRomanian ? 'Editare ușoară' : 'Easy editing'}</span>
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
