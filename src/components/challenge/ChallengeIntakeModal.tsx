import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Rocket, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

const MAIN_TRIBE_ID = '07825fb0-4d6c-4716-b2f3-27a1708cf680';

interface ChallengeIntakeModalProps {
  open: boolean;
  onComplete: () => void;
}

const commitmentLabels: Record<string, Record<string, string>> = {
  yes: { ro: 'Da, sunt all-in! 🔥', en: "Yes, I'm all-in! 🔥" },
  will_try: { ro: 'Voi încerca!', en: "I'll try!" },
  exploring: { ro: 'Doar explorez', en: 'Just exploring' },
};

export const ChallengeIntakeModal: React.FC<ChallengeIntakeModalProps> = ({
  open,
  onComplete,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'ro';

  const [biggestBlock, setBiggestBlock] = useState('');
  const [win30Days, setWin30Days] = useState('');
  const [commitment, setCommitment] = useState('will_try');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id || !biggestBlock.trim() || !win30Days.trim()) {
      toast.error(lang === 'ro' ? 'Completează toate câmpurile' : 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save intake
      const { error: intakeError } = await supabase.from('challenge_intake').insert({
        user_id: user.id,
        biggest_block: biggestBlock.trim(),
        win_30_days: win30Days.trim(),
        commitment_level: commitment,
        posted_to_community: true,
      });

      if (intakeError) throw intakeError;

      // 2. Auto-post to community
      const commitmentText = commitmentLabels[commitment]?.[lang] || commitment;
      const postContent = lang === 'ro'
        ? `🔥 Tocmai am început Have It All Challenge!\n\n💡 Cel mai mare blocaj al meu: ${biggestBlock.trim()}\n\n🎯 Victoria mea în 30 de zile: ${win30Days.trim()}\n\n💪 Commitment: ${commitmentText}\n\nCine mă ține de răspundere? 🙌`
        : `🔥 I just started the Have It All Challenge!\n\n💡 My biggest block: ${biggestBlock.trim()}\n\n🎯 My 30-day win: ${win30Days.trim()}\n\n💪 Commitment: ${commitmentText}\n\nWho's holding me accountable? 🙌`;

      await supabase.from('tribe_posts').insert({
        tribe_id: MAIN_TRIBE_ID,
        user_id: user.id,
        content: postContent,
      });

      // 3. Cache locally
      localStorage.setItem('challenge_intake_done', 'true');

      toast.success(
        lang === 'ro'
          ? '🎉 Bine ai venit în Challenge! Postarea ta a fost publicată în comunitate.'
          : '🎉 Welcome to the Challenge! Your intro was posted to the community.'
      );

      onComplete();
    } catch (err) {
      console.error('Intake submit error:', err);
      toast.error(lang === 'ro' ? 'Eroare la salvare. Încearcă din nou.' : 'Save failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background to-muted/30 border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            {lang === 'ro' ? 'Bine ai venit în Challenge! 🚀' : 'Welcome to the Challenge! 🚀'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {lang === 'ro'
              ? 'Răspunde la 3 întrebări rapide ca să te cunoască comunitatea și să-ți setezi direcția.'
              : 'Answer 3 quick questions so the community knows you and you set your direction.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Q1 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ro'
                ? '1. Unde simți cel mai mare blocaj acum?'
                : '1. Where do you feel the biggest block right now?'}
            </Label>
            <Textarea
              value={biggestBlock}
              onChange={(e) => setBiggestBlock(e.target.value)}
              placeholder={
                lang === 'ro'
                  ? 'Ex: Am idei dar nu le execut, procrastinez zilnic...'
                  : 'Ex: I have ideas but never execute, I procrastinate daily...'
              }
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>

          {/* Q2 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ro'
                ? '2. Ce ar însemna o victorie reală pentru tine în următoarele 30 de zile?'
                : '2. What would a real win look like for you in the next 30 days?'}
            </Label>
            <Textarea
              value={win30Days}
              onChange={(e) => setWin30Days(e.target.value)}
              placeholder={
                lang === 'ro'
                  ? 'Ex: Să lansez primul modul al cursului meu online...'
                  : 'Ex: Launch the first module of my online course...'
              }
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>

          {/* Q3 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {lang === 'ro'
                ? '3. Ești dispus/ă să aplici zilnic timp de 7 zile și să postezi progresul în comunitate?'
                : '3. Are you willing to commit daily for 7 days and post your progress in the community?'}
            </Label>
            <RadioGroup value={commitment} onValueChange={setCommitment} className="space-y-2">
              {Object.entries(commitmentLabels).map(([value, labels]) => (
                <div key={value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={value} id={`commitment-${value}`} />
                  <Label htmlFor={`commitment-${value}`} className="cursor-pointer text-sm">
                    {labels[lang]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !biggestBlock.trim() || !win30Days.trim()}
            className="w-full h-12 text-base bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg"
          >
            <Rocket className="h-5 w-5 mr-2" />
            {submitting
              ? (lang === 'ro' ? 'Se salvează...' : 'Saving...')
              : (lang === 'ro' ? 'Începe Transformarea 🔥' : 'Start the Transformation 🔥')}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {lang === 'ro'
              ? '📢 Răspunsurile tale vor fi postate automat în comunitate pentru accountability.'
              : '📢 Your answers will be auto-posted to the community for accountability.'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
