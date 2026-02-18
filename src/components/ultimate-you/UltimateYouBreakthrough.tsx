import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UltimateYouDay } from '@/data/ultimateYouContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UltimateYouBreakthroughProps {
  dayData: UltimateYouDay;
  breakthroughText: string;
  onSave: (text: string) => void;
  completed: boolean;
}

export const UltimateYouBreakthrough: React.FC<UltimateYouBreakthroughProps> = ({
  dayData,
  breakthroughText,
  onSave,
  completed,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState(breakthroughText || '');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);

    try {
      onSave(text.trim());

      const sourceContext = `ultimate-you-day-${dayData.day}`;
      const sourceLabel = `The Ultimate YOU - Day ${dayData.day}: ${dayData.title}`;

      const { error } = await supabase
        .from('wall_posts')
        .insert({
          user_id: user.id,
          content: `💡 **Breakthrough - Ziua ${dayData.day}**\n\n${text.trim()}`,
          category: 'breakthrough',
          source_context: sourceContext,
          source_label: sourceLabel,
        } as any);

      if (error) throw error;

      toast({
        title: language === 'ro' ? 'Breakthrough postat!' : 'Breakthrough posted!',
        description: language === 'ro'
          ? 'Breakthrough-ul tău a fost postat în comunitate.'
          : 'Your breakthrough has been posted to the community.',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-foreground">
          {language === 'ro' ? 'Breakthrough-ul Zilei' : 'Today\'s Breakthrough'}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {language === 'ro' ? 'Se postează în comunitate' : 'Posts to community'}
        </Badge>
      </div>

      <div className="bg-accent/50 border border-accent rounded-xl p-5">
        <p className="text-foreground font-medium leading-relaxed">
          {language === 'ro' ? dayData.breakthroughPrompt : dayData.breakthroughPromptEn}
        </p>
      </div>

      {completed ? (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-foreground whitespace-pre-wrap">{breakthroughText}</p>
          </div>
          <div className="text-center py-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            {language === 'ro' ? 'Breakthrough postat în comunitate' : 'Breakthrough posted to community'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            placeholder={
              language === 'ro'
                ? 'Scrie breakthrough-ul tău aici... Ce ai realizat? Ce s-a schimbat în tine?'
                : 'Write your breakthrough here... What did you realize? What changed in you?'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[140px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            💡 {language === 'ro'
              ? 'Breakthrough-ul tău va fi postat automat în secțiunea "Breakthrough" din Comunitate.'
              : 'Your breakthrough will be automatically posted to the "Breakthrough" section in Community.'}
          </p>
          <Button onClick={handlePost} disabled={!text.trim() || posting} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {posting
              ? (language === 'ro' ? 'Se postează...' : 'Posting...')
              : (language === 'ro' ? 'Postează Breakthrough' : 'Post Breakthrough')}
          </Button>
        </div>
      )}
    </div>
  );
};
