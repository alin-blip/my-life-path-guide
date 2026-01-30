import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Users, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';

export const Day1InviteFriends: React.FC = () => {
  const { language } = useLanguage();
  const { referralLink, shareWithMessage, isLoading } = useAffiliateLink();
  const [copied, setCopied] = useState(false);

  const inviteMessageRo = `Tocmai am început acest challenge și am 3 invitații exclusive.
Vrei să faci acest challenge împreună cu mine?

Ziua 1: Viziune & Claritate
Ziua 2: Corp, Spirit & Relații
Ziua 3: Business & Execuție
Ziua 4: Rutina Zilnică de Execuție
Ziua 5: Accountability & Mindset
Ziua 6: Gândire Strategică & Idei
Ziua 7: Continuitate & Creștere

Alătură-te aici 👇
${referralLink}`;

  const inviteMessageEn = `I just started this challenge and I've got 3 exclusive invites.
Do you want to take this challenge with me?

Day 1: Vision & Clarity
Day 2: Body, Being & Relationships
Day 3: Business & Execution
Day 4: Daily Execution System
Day 5: Accountability & Mindset
Day 6: Strategic Thinking & Ideas
Day 7: Continuity & Growth

Join me here 👇
${referralLink}`;

  const inviteMessage = language === 'ro' ? inviteMessageRo : inviteMessageEn;

  const handleShare = () => {
    shareWithMessage(inviteMessage);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Gift className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {language === 'ro' 
                ? '🎁 Invită 1-3 Prieteni' 
                : '🎁 Invite 1-3 Friends'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ro'
                ? 'Ai 3 invitații exclusive. Trimite-le prietenilor care vor să-și transforme viața alături de tine.'
                : 'You have 3 exclusive invites. Send them to friends who want to transform their life alongside you.'}
            </p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 border border-amber-500/20">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {language === 'ro' ? 'Mesajul care va fi trimis:' : 'Message that will be sent:'}
            </p>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">
              {inviteMessage}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleShare}
              disabled={isLoading || !referralLink}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Trimite Invitația' : 'Send Invite'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!referralLink}
              className="border-amber-500/30"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {language === 'ro' ? 'Copiat!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {language === 'ro' ? 'Copiază' : 'Copy'}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {language === 'ro' 
                ? 'Prietenii tăi primesc acces gratuit la zilele 1-2'
                : 'Your friends get free access to days 1-2'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Day1InviteFriends;
