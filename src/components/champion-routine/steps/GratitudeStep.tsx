import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GratitudeStepProps {
  items: string[];
  onChange: (items: string[]) => void;
  onNext: () => void;
}

const ROTATING_PROMPTS = [
  [
    'Un moment din ultima săptămână când te-ai simțit mândru...',
    'O persoană care te-a ajutat fără să-i ceri...',
    'O abilitate pe care o ai și care te face unic...',
  ],
  [
    'Un lucru simplu care ți-a adus bucurie ieri...',
    'O lecție valoroasă pe care ai învățat-o recent...',
    'O oportunitate care ți s-a deschis în ultima vreme...',
  ],
  [
    'Sănătatea ta — un lucru concret pentru care ești recunoscător...',
    'O relație care îți dă energie și te inspiră...',
    'Un obstacol pe care l-ai depășit și te-a făcut mai puternic...',
  ],
  [
    'Un loc care te face să te simți în pace...',
    'O amintire frumoasă care te face să zâmbești...',
    'O resursă sau un privilegiu pe care alții nu-l au...',
  ],
  [
    'Ceva ce ai realizat în ultimele 30 de zile...',
    'O persoană care crede în tine mai mult decât crezi tu...',
    'Un moment de liniște sau frumusețe de care te-ai bucurat recent...',
  ],
  [
    'O decizie bună pe care ai luat-o recent...',
    'Un lucru mic care face zilele tale mai bune...',
    'O calitate a ta care te ajută să depășești greutățile...',
  ],
  [
    'Familia sau prietenii — un moment special cu ei...',
    'O carte, un film sau o idee care ți-a schimbat perspectiva...',
    'Libertatea ta de a alege cum îți trăiești viața...',
  ],
];

export function GratitudeStep({ items, onChange, onNext }: GratitudeStepProps) {
  const { t } = useLanguage();
  const [localItems, setLocalItems] = useState<string[]>(['', '', '']);

  // Get today's prompts based on day of year
  const todayPrompts = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return ROTATING_PROMPTS[dayOfYear % ROTATING_PROMPTS.length];
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const normalized = [items[0] || '', items[1] || '', items[2] || ''];
      setLocalItems(normalized);
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
    onChange(newItems);
  };

  const canProceed = localItems.some(item => item.trim().length > 0);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border-pink-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-500/20 mb-4">
            <Heart className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold">Recunoștință</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Pentru ce ești recunoscător astăzi? Scrie 3 lucruri care îți aduc bucurie.
          </p>
        </div>

        {/* Three gratitude inputs with rotating prompts */}
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative">
              <div className="absolute left-4 top-4 flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-500 font-bold text-sm">
                {index + 1}
              </div>
              <Textarea
                placeholder={todayPrompts[index]}
                value={localItems[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                className="pl-16 min-h-[80px] bg-background/50 border-pink-500/20 focus:border-pink-500/50 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Feel instruction */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
          <span className="text-2xl">❤️</span>
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">
              Nu SCRIE doar — SIMTE recunoștința!
            </p>
            <p className="text-muted-foreground">
              Închide ochii 30 de secunde după ce scrii. Simte recunoștința în piept. 
              Lasă emoția să te inunde complet.
            </p>
          </div>
        </div>

        {/* Next button */}
        <Button 
          onClick={onNext} 
          size="lg" 
          className="w-full gap-2"
          disabled={!canProceed}
        >
          Continuă
          <ArrowRight className="h-5 w-5" />
        </Button>

        {/* Gratitude Anchor — Credința Recunoștinței */}
        <div className="text-center pt-2">
          <a
            href="/minte/credinte-fundamentale/recunostinta-anchor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-500 hover:text-pink-400 underline underline-offset-2"
          >
            Vrei reflecție mai adâncă? Deschide Gratitude Anchor →
          </a>
        </div>
      </Card>
    </div>
  );
}
