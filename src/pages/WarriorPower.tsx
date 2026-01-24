import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WarriorPowerLanding } from '@/components/warrior-power/WarriorPowerLanding';
import { WarriorPowerLeadFormSimple, type SimpleLeadFormData } from '@/components/warrior-power/WarriorPowerLeadFormSimple';
import { WarriorPowerQuiz } from '@/components/warrior-power/WarriorPowerQuiz';
import { WarriorPowerResultsPage } from '@/components/warrior-power/WarriorPowerResultsPage';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { saveRealityMapScores } from '@/services/realityMapService';
import { assignWarriorPowerVariant, type SplitVariant } from '@/utils/splitTest';

type Step = 'landing' | 'quiz' | 'lead-form' | 'results';

export default function WarriorPower() {
  const navigate = useNavigate();
  // NEW FLOW: landing → quiz → lead-form → results
  const [step, setStep] = useState<Step>('landing');
  const [leadData, setLeadData] = useState<SimpleLeadFormData | null>(null);
  const [quizScores, setQuizScores] = useState<WarriorPowerScores | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = () => {
    // Go directly to quiz (no lead form before)
    setStep('quiz');
  };

  const handleQuizComplete = async (scores: WarriorPowerScores) => {
    // Save quiz scores and go to simplified lead form
    setQuizScores(scores);
    setStep('lead-form');
  };

  const handleLeadSubmit = async (data: SimpleLeadFormData) => {
    if (!quizScores) {
      toast.error('Quiz incomplet. Încearcă din nou.');
      setStep('quiz');
      return;
    }

    setIsLoading(true);
    
    // Assign split test variant BEFORE any database operations
    const variant: SplitVariant = assignWarriorPowerVariant(data.email);
    console.log(`[Split Test] Assigned variant ${variant} to ${data.email}`);
    
    try {
      // Save lead to database with split test source - DELETE+INSERT pattern
      // This ensures split test source is ALWAYS recorded correctly, even for returning users
      const emailLower = data.email.trim().toLowerCase();
      
      await supabase
        .from('email_leads')
        .delete()
        .eq('email', emailLower)
        .eq('lead_magnet', 'warrior_power');

      const { error: leadError } = await supabase
        .from('email_leads')
        .insert({
          email: emailLower,
          name: data.name,
          lead_magnet: 'warrior_power',
          source: `warrior_power_split_${variant.toLowerCase()}`,
          metadata: {
            splitVariant: variant,
            completed_at: new Date().toISOString()
          }
        });

      if (leadError) {
        console.error('Error saving lead:', leadError);
        // Continue anyway
      }

      // Check if user already exists
      const { data: existingSession } = await supabase.auth.getSession();
      
      if (!existingSession?.session) {
        // No active session - create a temporary password for the account
        // User will set their real password at checkout
        const tempPassword = `TempPass${Date.now()}!`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: tempPassword,
          options: {
            data: {
              name: data.name,
              plan: 'free',
              needs_password_reset: true
            },
            emailRedirectTo: `${window.location.origin}/fact-maps`
          }
        });

        if (signUpError) {
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
            console.log('User already exists, continuing without auth...');
            // Don't show error - just continue to results
          } else {
            console.error('Error creating account:', signUpError);
          }
        } else if (signUpData?.session) {
          console.log('New user created with session');
          
          // Set early_bird_expires_at to 72 hours from now (for countdown)
          const earlyBirdExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
          await supabase.from('subscribers').upsert({
            email: data.email,
            user_id: signUpData.user?.id,
            subscribed: false,
            subscription_tier: 'Free',
            early_bird_expires_at: earlyBirdExpiry,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Save quiz results to database
      const { data: { user } } = await supabase.auth.getUser();
      
      const scoresJson = JSON.parse(JSON.stringify(quizScores));
      const { error: resultError } = await supabase
        .from('warrior_power_results')
        .insert({
          email: data.email,
          name: data.name,
          scores: scoresJson,
          total_score: Object.values(quizScores).reduce((a, b) => a + b, 0),
          user_id: user?.id || null
        });

      if (resultError) {
        console.error('Error saving results:', resultError);
      }

      // Sync scores to Reality Map for logged in users
      if (user) {
        await saveRealityMapScores(quizScores);
      }

      // Send email with results
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-power-results', {
          body: {
            email: data.email,
            name: data.name,
            scores: quizScores,
          },
        });

        if (emailError || (emailData as any)?.error) {
          console.error('Error sending email:', emailError);
          toast.warning('Email-ul cu rezultatele a întâmpinat probleme. Verifică spam.');
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      // Route based on split test variant (already assigned above)
      switch (variant) {
        case 'A':
          // Redirect to Warrior Launch Accelerator (€497 offer)
          toast.success('Ți-am trimis rezultatele pe email! Verifică inbox-ul.');
          navigate('/warrior-launch-accelerator?source=warrior-power-split-a');
          break;
        case 'B':
          // Show results page (current flow with challenge upsell)
          toast.success('Ți-am trimis rezultatele pe email!');
          setLeadData(data);
          setStep('results');
          break;
        case 'C':
          // Redirect to homepage to explore platform
          toast.success('Ți-am trimis rezultatele pe email! Explorează platforma.');
          navigate('/?source=warrior-power-split-c');
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('A apărut o eroare. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFree = () => {
    navigate('/fact-maps?source=warrior-power', {
      state: {
        fromWarriorPower: true,
        userName: leadData?.name
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Warrior Power Assessment - Descoperă-ți puterea reală</title>
        <meta 
          name="description" 
          content="Evaluează-te în cele 4 dimensiuni ale vieții: corp, ființă, echilibru și business. Descoperă unde te afli și primește un plan personalizat de transformare." 
        />
        <meta property="og:title" content="Warrior Power Assessment - Descoperă-ți puterea reală" />
        <meta property="og:description" content="Evaluează-te în cele 4 dimensiuni ale vieții și descoperă-ți potențialul real." />
      </Helmet>

      <div className="min-h-screen bg-white font-['Montserrat',sans-serif]">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WarriorPowerLanding onStart={handleStartQuiz} />
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-8"
            >
              <WarriorPowerQuiz onComplete={handleQuizComplete} />
            </motion.div>
          )}

          {step === 'lead-form' && (
            <motion.div
              key="lead-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center py-12 px-4"
            >
              <WarriorPowerLeadFormSimple 
                onSubmit={handleLeadSubmit} 
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {step === 'results' && quizScores && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-8"
            >
              <WarriorPowerResultsPage
                scores={quizScores}
                userName={leadData?.name || 'Warrior'}
                onContinueFree={handleContinueFree}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
