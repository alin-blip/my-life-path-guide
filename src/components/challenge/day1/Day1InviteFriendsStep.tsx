import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Trophy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ChallengeInviteFriends } from '../ChallengeInviteFriends';
import { motion } from 'framer-motion';

interface Day1InviteFriendsStepProps {
  onComplete: () => void;
}

export const Day1InviteFriendsStep: React.FC<Day1InviteFriendsStepProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🎁 {isRo ? 'Invită 1-3 Prieteni' : 'Invite 1-3 Friends'}
          </h2>
          <p className="text-muted-foreground">
            {isRo 
              ? 'Ai o invitație exclusivă gratuită pentru prietenii care vor să-și transforme viața alături de tine!'
              : 'You have an exclusive free invite for friends who want to transform their life alongside you!'}
          </p>
        </div>

        {/* Embed ChallengeInviteFriends component */}
        <ChallengeInviteFriends dayNumber={1} />
      </Card>

      <Button
        onClick={onComplete}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        size="lg"
      >
        <Trophy className="h-5 w-5 mr-2" />
        {isRo ? 'Finalizează Ziua 1' : 'Complete Day 1'}
      </Button>
    </motion.div>
  );
};
