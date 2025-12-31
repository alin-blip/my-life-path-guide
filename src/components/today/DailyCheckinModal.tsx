import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Smile, Meh, Frown, Zap, Heart, Sun } from 'lucide-react';

interface DailyCheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [topPriority, setTopPriority] = useState('');
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [saving, setSaving] = useState(false);

  const moodOptions = [
    { value: 1, icon: Frown, label: language === 'ro' ? 'Rău' : 'Bad', color: 'text-red-500 hover:bg-red-500/10' },
    { value: 2, icon: Frown, label: language === 'ro' ? 'Slab' : 'Poor', color: 'text-orange-500 hover:bg-orange-500/10' },
    { value: 3, icon: Meh, label: language === 'ro' ? 'Ok' : 'Ok', color: 'text-yellow-500 hover:bg-yellow-500/10' },
    { value: 4, icon: Smile, label: language === 'ro' ? 'Bine' : 'Good', color: 'text-lime-500 hover:bg-lime-500/10' },
    { value: 5, icon: Smile, label: language === 'ro' ? 'Super' : 'Great', color: 'text-green-500 hover:bg-green-500/10' },
  ];

  const energyOptions = [
    { value: 1, label: '⚡', desc: language === 'ro' ? 'Epuizat' : 'Exhausted' },
    { value: 2, label: '⚡⚡', desc: language === 'ro' ? 'Obosit' : 'Tired' },
    { value: 3, label: '⚡⚡⚡', desc: language === 'ro' ? 'Normal' : 'Normal' },
    { value: 4, label: '⚡⚡⚡⚡', desc: language === 'ro' ? 'Energic' : 'Energetic' },
    { value: 5, label: '⚡⚡⚡⚡⚡', desc: language === 'ro' ? 'Plin de energie!' : 'Full energy!' },
  ];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from('daily_checkins').upsert({
        user_id: user.id,
        date: today,
        mood_score: moodScore,
        energy_level: energyLevel,
        top_priority: topPriority || null,
        gratitude_note: gratitudeNote || null,
      }, {
        onConflict: 'user_id,date'
      });

      if (error) throw error;

      toast({
        title: language === 'ro' ? 'Check-in salvat!' : 'Check-in saved!',
        description: language === 'ro' ? 'Hai să facem o zi grozavă!' : "Let's have a great day!",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving checkin:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu am putut salva check-in-ul' : 'Could not save check-in',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            {language === 'ro' ? 'Bună dimineața!' : 'Good morning!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                {language === 'ro' ? 'Cum te simți azi?' : 'How are you feeling today?'}
              </p>
              <div className="flex justify-center gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMoodScore(option.value)}
                    className={`p-3 rounded-full transition-all ${option.color} ${
                      moodScore === option.value ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <option.icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleSkip}>
                  {language === 'ro' ? 'Sari peste' : 'Skip'}
                </Button>
                <Button onClick={() => setStep(2)} disabled={!moodScore}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                {language === 'ro' ? 'Ce nivel de energie ai?' : 'What is your energy level?'}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {energyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEnergyLevel(option.value)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      energyLevel === option.value 
                        ? 'bg-primary/20 ring-2 ring-primary' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="text-lg">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={() => setStep(3)} disabled={!energyLevel}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                {language === 'ro' ? 'Care e prioritatea #1 pentru azi?' : "What's your #1 priority today?"}
              </p>
              <Textarea
                placeholder={language === 'ro' ? 'Ex: Finalizez prezentarea pentru client' : 'Ex: Complete client presentation'}
                value={topPriority}
                onChange={(e) => setTopPriority(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={() => setStep(4)}>
                  {language === 'ro' ? 'Continuă' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                {language === 'ro' ? 'Un lucru pentru care ești recunoscător' : 'One thing you are grateful for'}
              </p>
              <Textarea
                placeholder={language === 'ro' ? 'Ex: Sunt recunoscător pentru sănătatea mea' : 'Ex: I am grateful for my health'}
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  {language === 'ro' ? 'Înapoi' : 'Back'}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving 
                    ? (language === 'ro' ? 'Se salvează...' : 'Saving...') 
                    : (language === 'ro' ? 'Gata! Să începem!' : "Done! Let's go!")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
