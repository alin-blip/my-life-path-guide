import React from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChallengeRecap } from './ChallengeRecap';
import { ChallengeWalkthrough } from './ChallengeWalkthrough';
import { ChallengeDay7Upgrade } from './ChallengeDay7Upgrade';

export const ChallengeDay7Complete = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/challenge')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Back to Challenge' : 'Înapoi la Challenge'}
        </Button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 mb-2">
            🏆 {language === 'en' ? 'PUTTING IT ALL TOGETHER' : 'PUNEM TOTUL ÎMPREUNĂ'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'en' 
              ? 'Your complete transformation recap + Premium upgrade' 
              : 'Recapitularea transformării tale + Upgrade Premium'}
          </p>
        </div>

        {/* Section 1: Celebration & Recap */}
        <ChallengeRecap />

        {/* Section 2: Walkthrough */}
        <ChallengeWalkthrough />

        {/* Section 3: Upgrade Forced Section - NEW */}
        <ChallengeDay7Upgrade completedDays={7} />
      </div>
    </Layout>
  );
};

export default ChallengeDay7Complete;
