import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WarriorPowerLanding } from '@/components/warrior-power/WarriorPowerLanding';
import { WarriorPowerLeadForm, type LeadFormData } from '@/components/warrior-power/WarriorPowerLeadForm';
import { WarriorPowerQuiz } from '@/components/warrior-power/WarriorPowerQuiz';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { saveRealityMapScores } from '@/services/realityMapService';
import { trackLead } from '@/lib/facebook-pixel';

type Step = 'landing' | 'lead-form' | 'quiz';

export default function WarriorPower() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('landing');
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = () => {
    setStep('lead-form');
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      // Save lead to database
      const { error: leadError } = await supabase
        .from('email_leads')
        .upsert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          lead_magnet: 'warrior_power',
          metadata: { gender: data.gender },
          source: 'warrior_power_quiz'
        }, { onConflict: 'email,lead_magnet' });

      if (leadError) {
        console.error('Error saving lead:', leadError);
        // Continue anyway - don't block the quiz
      }

      // Check if user already exists by trying to sign in first
      const { data: existingSession } = await supabase.auth.getSession();
      
      if (!existingSession?.session) {
        // No active session - create account with user's password
        // Sign up with user's chosen password
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              phone: data.phone,
              plan: 'free'
            },
            emailRedirectTo: `${window.location.origin}/fact-maps`
          }
        });

        if (signUpError) {
          // If user already exists, try to sign them in
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
            console.log('User already exists, continuing as guest...');
            toast.info('Contul există deja. Poți continua quiz-ul și te poți loga ulterior pentru a accesa rezultatele.');
          } else {
            console.error('Error creating account:', signUpError);
          }
        } else if (signUpData?.session) {
          // User was created AND auto-confirmed (session exists)
          // Set early_bird_expires_at to 3 days from now
          const earlyBirdExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('subscribers').upsert({
            email: data.email,
            user_id: signUpData.user?.id,
            subscribed: false,
            subscription_tier: 'Free',
            early_bird_expires_at: earlyBirdExpiry,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
          
          toast.success('Contul tău Free Plan a fost creat! Verifică emailul pentru detalii.');
        } else if (signUpData?.user && !signUpData?.session) {
          // User created but needs email confirmation (shouldn't happen with auto-confirm)
          console.log('User created, awaiting confirmation');
          toast.success('Contul tău a fost creat!');
        }
      }

      // Track Facebook Pixel Lead event
      trackLead();

      setLeadData(data);
      setStep('quiz');
    } catch (error) {
      console.error('Error:', error);
      toast.error('A apărut o eroare. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = async (quizScores: WarriorPowerScores) => {
    if (leadData) {
      try {
        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();

        // Save results to database
        const scoresJson = JSON.parse(JSON.stringify(quizScores));
        const { error: resultError } = await supabase
          .from('warrior_power_results')
          .insert({
            email: leadData.email,
            name: leadData.name,
            phone: leadData.phone,
            gender: leadData.gender,
            scores: scoresJson,
            total_score: Object.values(quizScores).reduce((a, b) => a + b, 0),
            user_id: user?.id || null
          });

        if (resultError) {
          console.error('Error saving results:', resultError);
        }

        // Sync scores to Reality Map (fact_maps) for logged in users
        if (user) {
          await saveRealityMapScores(quizScores);
        }

        // Send email with results
        try {
          const { data, error } = await supabase.functions.invoke('send-power-results', {
            body: {
              email: leadData.email,
              name: leadData.name,
              scores: quizScores,
            },
          });

          if (error || (data as any)?.error) {
            const msg = error?.message ?? (data as any)?.error ?? 'Nu am putut trimite emailul cu rezultatele.';
            console.error('Error sending email:', msg, { error, data });
            toast.error(`${msg} Verifică Spam sau încearcă din nou.`);
          } else {
            toast.success('Ți-am trimis pe email rezultatele (verifică și Spam).');
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          toast.error('Nu am putut trimite emailul cu rezultatele. Verifică Spam sau încearcă din nou.');
        }
      } catch (error) {
        console.error('Error saving results:', error);
      }
    }

    // Navigate directly to /fact-maps with source parameter
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
        <title>Warrior Power Assessment - Descoperă-ți Puterea Reală</title>
        <meta 
          name="description" 
          content="Evaluează-te în cele 4 dimensiuni ale vieții: Corp, Ființă, Echilibru și Business. Descoperă unde te afli și primește un plan personalizat de transformare." 
        />
        <meta property="og:title" content="Warrior Power Assessment - Descoperă-ți Puterea Reală" />
        <meta property="og:description" content="Evaluează-te în cele 4 dimensiuni ale vieții și descoperă-ți potențialul real." />
      </Helmet>

      <div className="min-h-screen bg-background">
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

          {step === 'lead-form' && (
            <motion.div
              key="lead-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center py-12 px-4"
            >
              <WarriorPowerLeadForm 
                onSubmit={handleLeadSubmit} 
                isLoading={isLoading}
              />
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
        </AnimatePresence>
      </div>
    </>
  );
}
