import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';

const EMOJI_OPTIONS = ['📚', '🎯', '💪', '🔥', '⭐', '🚀', '💎', '🏆', '🦁', '🐺', '🦅', '🌟'];

interface JoinLeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (displayName: string, avatarEmoji: string) => Promise<{ success: boolean; error?: string }>;
}

export const JoinLeaderboardModal: React.FC<JoinLeaderboardModalProps> = ({
  open,
  onOpenChange,
  onJoin,
}) => {
  const { language } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!displayName.trim()) {
      toast({
        title: language === 'en' ? 'Name required' : 'Nume necesar',
        description: language === 'en' ? 'Please enter a display name' : 'Te rugăm să introduci un nume',
        variant: 'destructive',
      });
      return;
    }

    if (displayName.length > 20) {
      toast({
        title: language === 'en' ? 'Name too long' : 'Nume prea lung',
        description: language === 'en' ? 'Max 20 characters' : 'Maxim 20 caractere',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await onJoin(displayName.trim(), selectedEmoji);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: language === 'en' ? 'Welcome to the leaderboard!' : 'Bun venit în clasament!',
        description: language === 'en' ? 'Your progress is now visible to others' : 'Progresul tău este acum vizibil celorlalți',
      });
      onOpenChange(false);
    } else {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Join the Leaderboard' : 'Intră în Clasament'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Choose a display name and avatar to appear on the public leaderboard.'
              : 'Alege un nume și un avatar pentru a apărea în clasamentul public.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              {language === 'en' ? 'Display Name' : 'Nume Afișat'}
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={language === 'en' ? 'Your nickname...' : 'Porecla ta...'}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {language === 'en' ? 'Avatar' : 'Avatar'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    selectedEmoji === emoji 
                      ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? '📊 Your reading progress (pages, actions, principles) will be visible to other users.'
                : '📊 Progresul tău de citire (pagini, acțiuni, principii) va fi vizibil altor utilizatori.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'en' ? 'Cancel' : 'Anulează'}
          </Button>
          <Button onClick={handleJoin} disabled={isLoading}>
            {isLoading 
              ? (language === 'en' ? 'Joining...' : 'Se înscrie...') 
              : (language === 'en' ? 'Join Leaderboard' : 'Intră în Clasament')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
