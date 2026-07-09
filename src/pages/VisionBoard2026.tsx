import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VisionBoardQuiz } from '@/components/vision-board/VisionBoardQuiz';
import { VisionBoardGenerator } from '@/components/vision-board/VisionBoardGenerator';
import { VisionBoardPreview } from '@/components/vision-board/VisionBoardPreview';
import { VisionBoardLanding } from '@/components/vision-board/VisionBoardLanding';
import html2canvas from 'html2canvas';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { TierLockOverlay } from '@/components/access/TierLockOverlay';

type Category = 'body' | 'being' | 'balance' | 'business';
type Step = 'landing' | 'quiz' | 'generating' | 'preview';

interface GeneratedImages {
  body?: string;
  being?: string;
  balance?: string;
  business?: string;
}

// Get current year for period
const getCurrentPeriod = () => new Date().getFullYear().toString();

// Incoming state type
interface IncomingState {
  fromWarriorPower?: boolean;
  fromRealityMap?: boolean;
  scores?: WarriorPowerScores;
  skipLanding?: boolean;
}

const VisionBoard2026 = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, session } = useAuth();
  
  // Check if user came from Warrior Power or Reality Map
  const incomingState = location.state as IncomingState | null;
  
  // If user is authenticated and came with skipLanding, go straight to quiz
  const initialStep: Step = (user && incomingState?.skipLanding) ? 'quiz' : 'landing';
  
  const [step, setStep] = useState<Step>(initialStep);
  const [answers, setAnswers] = useState<Record<Category, string>>({} as Record<Category, string>);
  const [images, setImages] = useState<GeneratedImages>({});
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle signup and start for non-authenticated users
  const handleSignupAndStart = async (userEmail: string, password: string, userName: string) => {
    setIsLoading(true);
    setEmail(userEmail);
    setName(userName);
    
    try {
      // 1. Create account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: password,
        options: {
          data: {
            full_name: userName,
            source: 'vision_board_lead_magnet'
          }
        }
      });

      if (signUpError) {
        // If user already exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password
          });
          
          if (signInError) {
            throw new Error(language === 'en' 
              ? 'Account exists. Please check your password.' 
              : 'Contul există. Te rog verifică parola.');
          }
        } else {
          throw signUpError;
        }
      }

      // 2. Save lead to email_leads
      await supabase.from('email_leads').upsert({
        email: userEmail.trim().toLowerCase(),
        name: userName,
        lead_magnet: 'vision_board_ai',
        source: 'vision-board-landing',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      // 3. Create subscriber with 3-day trial
      await supabase.from('subscribers').upsert({
        email: userEmail.trim().toLowerCase(),
        user_id: signUpData?.user?.id || null,
        subscribed: true,
        subscription_tier: 'trial',
        subscription_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

      toast({
        title: language === 'en' ? 'Account Created!' : 'Cont Creat!',
        description: language === 'en' 
          ? 'Welcome! Let\'s create your Vision Board.' 
          : 'Bine ai venit! Hai să creăm Vision Board-ul tău.'
      });

      // Wait a moment for auth to propagate
      await new Promise(r => setTimeout(r, 500));
      
      // Go to quiz
      setStep('quiz');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Eroare',
        description: error.message || (language === 'en' ? 'Could not create account' : 'Nu am putut crea contul')
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authenticated user starting
  const handleStartAuthenticated = () => {
    setEmail(user?.email || '');
    setStep('quiz');
  };

  const handleQuizComplete = (quizAnswers: Record<Category, string>) => {
    setAnswers(quizAnswers);
    setStep('generating');
  };

  const handleImagesGenerated = async (generatedImages: GeneratedImages) => {
    setImages(generatedImages);
    setStep('preview');
    
    // Send email with results
    try {
      const currentEmail = email || user?.email;
      if (currentEmail) {
        const { data, error } = await supabase.functions.invoke('send-vision-results', {
          body: {
            email: currentEmail,
            name: name || user?.user_metadata?.full_name || '',
            visions: answers,
            images: generatedImages,
          },
        });

        if (error || (data as any)?.error) {
          const msg = error?.message ?? (data as any)?.error ?? 'Nu am putut trimite emailul.';
          console.error('Error sending vision email:', msg, { error, data });
        } else {
          toast({
            title: language === 'en' ? 'Email Sent!' : 'Email Trimis!',
            description: language === 'en' 
              ? 'Your Vision Board has been sent to your email (check Spam too).' 
              : 'Vision Board-ul tău a fost trimis pe email (verifică și Spam).'
          });
        }
      }
    } catch (emailError) {
      console.error('Error sending vision email:', emailError);
    }
  };

  const handleDownload = async () => {
    const canvas = document.getElementById('vision-board-canvas');
    if (canvas) {
      try {
        const canvasImg = await html2canvas(canvas);
        const link = document.createElement('a');
        link.download = 'vision-board-2026.png';
        link.href = canvasImg.toDataURL();
        link.click();
        toast({
          title: language === 'en' ? 'Downloaded!' : 'Descărcat!',
          description: language === 'en' ? 'Your Vision Board has been saved.' : 'Vision Board-ul tău a fost salvat.'
        });
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const period = getCurrentPeriod();
      const currentEmail = email || user?.email || '';
      
      // 1. Save to vision_boards (for images only)
      await supabase.from('vision_boards').upsert({
        user_id: currentSession?.user?.id || null,
        email: currentEmail,
        body_image_url: images.body,
        being_image_url: images.being,
        balance_image_url: images.balance,
        business_image_url: images.business,
        body_vision: answers.body,
        being_vision: answers.being,
        balance_vision: answers.balance,
        business_vision: answers.business,
        quiz_answers: answers,
        is_complete: true,
        source: 'lead_magnet'
      });

      // 2. If user is authenticated, sync to missions (Door Annual)
      if (currentSession?.user?.id) {
        const categories: Category[] = ['body', 'being', 'balance', 'business'];
        
        for (const category of categories) {
          if (answers[category]) {
            // Check if mission already exists for this category/period
            const { data: existingMission } = await supabase
              .from('missions')
              .select('id')
              .eq('user_id', currentSession.user.id)
              .eq('category', category)
              .eq('mission_type', 'annual')
              .eq('period', period)
              .maybeSingle();

            if (existingMission) {
              // Update existing mission
              await supabase
                .from('missions')
                .update({
                  title: answers[category],
                  goal_data: { 
                    vision: answers[category], 
                    imageUrl: images[category],
                    source: 'vision_board_2026'
                  },
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingMission.id);
            } else {
              // Create new mission
              await supabase.from('missions').insert({
                user_id: currentSession.user.id,
                category,
                mission_type: 'annual',
                period,
                title: answers[category],
                goal_data: { 
                  vision: answers[category], 
                  imageUrl: images[category],
                  source: 'vision_board_2026'
                },
                position: categories.indexOf(category)
              });
            }
          }
        }

        toast({
          title: language === 'en' ? 'Saved & Synced!' : 'Salvat & Sincronizat!',
          description: language === 'en' 
            ? 'Your Vision Board has been synced to your Annual Objectives!' 
            : 'Vision Board-ul tău a fost sincronizat cu Obiectivele Anuale!'
        });

        // Redirect to Door annual tab
        navigate('/door?tab=annual');
      } else {
        toast({
          title: language === 'en' ? 'Saved!' : 'Salvat!',
          description: language === 'en' 
            ? 'Create an account to sync with your objectives!' 
            : 'Creează un cont pentru a sincroniza cu obiectivele tale!'
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save. Please try again.' : 'Nu s-a putut salva. Încearcă din nou.'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Create Your AI Vision Board 2026 | Free' : 'Creează Vision Board AI 2026 | Gratuit'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Create a powerful AI Vision Board in 5 minutes. Visualize your goals daily. Generate personalized meditation. Free for 3 days.'
            : 'Creează un Vision Board AI puternic în 5 minute. Vizualizează-ți obiectivele zilnic. Generează meditație personalizată. Gratuit 3 zile.'
          }
        />
      </Helmet>
      
      {step === 'landing' && (
        <VisionBoardLanding
          language={language as 'en' | 'ro'}
          isAuthenticated={!!user}
          onStartAuthenticated={handleStartAuthenticated}
          onSignupAndStart={handleSignupAndStart}
          isLoading={isLoading}
        />
      )}

      {step === 'quiz' && (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <VisionBoardQuiz
                language={language}
                onComplete={handleQuizComplete}
                onBack={() => setStep('landing')}
              />
            </Card>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <VisionBoardGenerator
                answers={answers}
                language={language}
                onComplete={handleImagesGenerated}
                onError={(error) => toast({ variant: 'destructive', title: 'Error', description: error })}
              />
            </Card>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <VisionBoardPreview
              images={images}
              visions={answers}
              language={language}
              onSave={handleSave}
              onDownload={handleDownload}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VisionBoard2026;
