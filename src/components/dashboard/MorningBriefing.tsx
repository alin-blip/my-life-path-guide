import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useDailyScore } from '@/hooks/useDailyScore';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Sun, Coffee, Target, ChevronRight, Quote, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

interface MorningBriefingProps {
  onStartDay?: () => void;
  className?: string;
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({ onStartDay, className }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { data } = useDailyScore();
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  
  const timeOfDay = getTimeOfDay();
  const greeting = timeOfDay === 'morning' 
    ? (language === 'ro' ? 'Bună Dimineața' : 'Good Morning')
    : timeOfDay === 'afternoon'
    ? (language === 'ro' ? 'Bună Ziua' : 'Good Afternoon')
    : (language === 'ro' ? 'Bună Seara' : 'Good Evening');

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
  }, []);

  const userName = user?.email?.split('@')[0] || 'Champion';
  const totalScore = data.totalScore;
  const nextActionText = typeof data.nextAction === 'string' ? data.nextAction : (data.nextAction as any)?.text || '';
  const bigOneText = typeof data.bigOne === 'string' ? data.bigOne : (data.bigOne as any)?.title || '';

  return (
    <Card className={cn("overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-primary/5", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-yellow-500" />
              <div>
                <h2 className="text-2xl font-bold">
                  {greeting}, <span className="text-primary capitalize">{userName}</span>!
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {format(new Date(), 'EEEE, MMMM d')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Quote className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm italic">"{dailyQuote.text}"</p>
                <p className="text-xs text-muted-foreground mt-1">— {dailyQuote.author}</p>
              </div>
            </div>

            {bigOneText && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Target className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-yellow-500 font-medium mb-0.5">
                    {language === 'ro' ? 'Big One de Azi' : "Today's Big One"}
                  </p>
                  <p className="text-sm font-medium truncate">{bigOneText}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="text-center lg:text-right">
              <p className="text-xs text-muted-foreground mb-1">
                {language === 'ro' ? 'Scor curent' : 'Current Score'}
              </p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "text-3xl font-bold",
                  totalScore >= 80 ? "text-green-500" : totalScore >= 50 ? "text-yellow-500" : "text-orange-500"
                )}>
                  {totalScore}
                </div>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>

            {nextActionText && onStartDay && (
              <Button onClick={onStartDay} className="w-full lg:w-auto gap-2" size="lg">
                <Sparkles className="w-4 h-4" />
                {nextActionText}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
