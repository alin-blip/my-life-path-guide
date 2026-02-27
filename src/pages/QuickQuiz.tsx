import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { QuickResultsQuiz } from '@/components/onboarding/QuickResultsQuiz';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const QuickQuiz = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  // Mark quiz as completed and save scores
  const handleQuizComplete = async (scores: Record<string, number>) => {
    if (!user) return;
    
    try {
      // Save quiz results to localStorage for immediate use
      localStorage.setItem('quick_quiz_completed', 'true');
      localStorage.setItem('quick_quiz_scores', JSON.stringify(scores));
      
      // Update user profile with quiz completion
      await supabase.from('subscribers').upsert({
        email: user.email?.toLowerCase().trim(),
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const t = {
    title: language === 'ro' ? 'Evaluare Rapidă' : 'Quick Assessment',
    subtitle: language === 'ro' 
      ? 'Răspunde la 3 întrebări pentru a primi planul tău personalizat'
      : 'Answer 3 questions to get your personalized plan',
    metaTitle: language === 'ro' ? 'Evaluare Rapidă | CEO Mind OS' : 'Quick Assessment | CEO Mind OS',
    metaDesc: language === 'ro' 
      ? 'Descoperă-ți scorul Warrior și primește un plan personalizat în 60 de secunde.'
      : 'Discover your Warrior score and get a personalized plan in 60 seconds.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              ⚡ {language === 'ro' ? '60 secunde' : '60 seconds'}
            </span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Quiz Component */}
        <QuickResultsQuiz onComplete={handleQuizComplete} />
      </motion.div>
    </div>
  );
};

export default QuickQuiz;
