import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, CheckCircle2, Flame, Star, ExternalLink } from 'lucide-react';
import { COMMUNITY_URL } from '@/config/socialLinks';

interface Day1CommitmentProps {
  isCommitted: boolean;
  onCommitmentChange: (committed: boolean) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export const Day1Commitment: React.FC<Day1CommitmentProps> = ({
  isCommitted,
  onCommitmentChange,
  onComplete,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  
  const canComplete = isCommitted;
  
  return (
    <div className="space-y-6">
      {/* Commitment Card */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isRo ? 'PASUL FINAL: ANGAJAMENTUL TĂU' : 'FINAL STEP: YOUR COMMITMENT'}
          </h2>
          <p className="text-muted-foreground">
            {isRo 
              ? 'Fă o promisiune către tine însuți pentru următoarele 7 zile' 
              : 'Make a promise to yourself for the next 7 days'}
          </p>
        </div>
        
        {/* Commitment Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-foreground">
              {isRo ? '7 zile să spargi ciclul burnout-ului' : '7 days to break the burnout cycle'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-foreground">
              {isRo ? 'Fundație solidă' : 'Solid foundation'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm text-foreground">
              {isRo ? 'Rezultate reale' : 'Real results'}
            </span>
          </div>
        </div>
        
        {/* Commitment Checkbox */}
        <div 
          className={`p-4 rounded-lg border-2 mb-6 transition-all cursor-pointer ${
            isCommitted 
              ? 'bg-green-500/10 border-green-500' 
              : 'bg-background border-border hover:border-primary/50'
          }`}
          onClick={() => onCommitmentChange(!isCommitted)}
        >
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={isCommitted}
              onCheckedChange={(checked) => onCommitmentChange(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label className="text-foreground font-medium cursor-pointer">
                {isRo 
                  ? 'Mă angajez să completez acest challenge de 7 zile' 
                  : 'I commit to completing this 7-day challenge'}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {isRo 
                  ? 'Voi dedica timp în fiecare zi pentru a-mi îmbunătăți toate cele 4 arii: Corp, Spirit, Relații și Business. Înțeleg că consistența este cheia construirii unui momentum durabil.' 
                  : 'I will dedicate time each day to improve all 4 areas: Body, Spirit, Relationships and Business. I understand that consistency is the key to building lasting momentum.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <Button
          onClick={onComplete}
          disabled={!canComplete || isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {isRo ? 'Se salvează...' : 'Saving...'}
            </>
          ) : !isCommitted ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {isRo ? 'Bifează angajamentul mai sus' : 'Check the commitment above'}
            </>
          ) : (
            <>
              <Trophy className="h-5 w-5 mr-2" />
              {isRo ? 'Continuă →' : 'Continue →'}
            </>
          )}
        </Button>
      </Card>

      {/* Facebook Group CTA */}
      <Card className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            S
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">
              {isRo ? 'Alătură-te Comunității Skool' : 'Join Our Skool Community'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRo ? 'Conectează-te cu alți Warriors pentru suport și accountability' : 'Connect with fellow Warriors for support & accountability'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(COMMUNITY_URL, '_blank')}
            className="shrink-0 border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isRo ? 'Intră în Comunitate' : 'Join Community'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
