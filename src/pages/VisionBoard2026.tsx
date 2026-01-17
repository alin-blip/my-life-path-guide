import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VisionBoardQuiz } from '@/components/vision-board/VisionBoardQuiz';
import { VisionBoardGenerator } from '@/components/vision-board/VisionBoardGenerator';
import { VisionBoardPreview } from '@/components/vision-board/VisionBoardPreview';
import { EmailCollection } from '@/components/vision-board/EmailCollection';
import { Sparkles, ArrowRight, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';

type Category = 'body' | 'being' | 'balance' | 'business';
type Step = 'intro' | 'quiz' | 'email' | 'generating' | 'preview';

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
}

const VisionBoard2026 = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user came from Warrior Power or Reality Map
  const incomingState = location.state as IncomingState | null;
  
  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Record<Category, string>>({} as Record<Category, string>);
  const [images, setImages] = useState<GeneratedImages>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleQuizComplete = (quizAnswers: Record<Category, string>) => {
    setAnswers(quizAnswers);
    setStep('email');
  };

  const handleEmailComplete = (userEmail: string, userName: string) => {
    setEmail(userEmail);
    setName(userName);
    setStep('generating');
  };

  const handleImagesGenerated = async (generatedImages: GeneratedImages) => {
    setImages(generatedImages);
    setStep('preview');
    
    // Send email with results
    try {
      const { data, error } = await supabase.functions.invoke('send-vision-results', {
        body: {
          email: email,
          name: name,
          visions: answers,
          images: generatedImages,
        },
      });

      if (error || (data as any)?.error) {
        const msg = error?.message ?? (data as any)?.error ?? 'Nu am putut trimite emailul.';
        console.error('Error sending vision email:', msg, { error, data });
        toast({
          variant: 'destructive',
          title: 'Email',
          description: `${msg} Verifică Spam sau încearcă din nou.`
        });
      } else {
        toast({
          title: language === 'en' ? 'Email Sent!' : 'Email Trimis!',
          description: language === 'en' 
            ? 'Your Vision Board has been sent to your email (check Spam too).' 
            : 'Vision Board-ul tău a fost trimis pe email (verifică și Spam).'
        });
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
      const { data: { session } } = await supabase.auth.getSession();
      const period = getCurrentPeriod();
      
      // 1. Save to vision_boards (for images only)
      await supabase.from('vision_boards').upsert({
        user_id: session?.user?.id || null,
        email: email,
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
      if (session?.user?.id) {
        const categories: Category[] = ['body', 'being', 'balance', 'business'];
        
        for (const category of categories) {
          if (answers[category]) {
            // Check if mission already exists for this category/period
            const { data: existingMission } = await supabase
              .from('missions')
              .select('id')
              .eq('user_id', session.user.id)
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
                user_id: session.user.id,
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
        <title>{language === 'en' ? 'Create Your Vision Board 2026' : 'Creează Vision Board 2026'}</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {language === 'en' 
                  ? <>2026: <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Transformation or Repetition?</span></>
                  : <>2026: <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Transformare sau Repetiție?</span></>
                }
              </h1>
              
              {/* Personalized message based on origin */}
              {incomingState?.fromWarriorPower && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 max-w-lg mx-auto">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-2">
                    <Target className="h-5 w-5" />
                    Bazat pe Evaluarea Ta Warrior Power
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Your scores reveal where to focus. Now create a powerful vision for transformation.'
                      : 'Scorurile tale arată unde să te concentrezi. Acum creează o viziune puternică pentru transformare.'}
                  </p>
                </div>
              )}
              
              {incomingState?.fromRealityMap && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 max-w-lg mx-auto">
                  <div className="flex items-center justify-center gap-2 text-accent font-semibold mb-2">
                    <Target className="h-5 w-5" />
                    Ai Harta — Acum Creează Destinația
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'You know where you are. Now visualize where you want to be by the end of 2026.'
                      : 'Știi unde te afli. Acum vizualizează unde vrei să ajungi până la finalul lui 2026.'}
                  </p>
                </div>
              )}
              
              {!incomingState?.fromWarriorPower && !incomingState?.fromRealityMap && (
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                  {language === 'en'
                    ? 'Before you reach your destination, you need to know where you start. 92% fail because they skip this step.'
                    : 'Înainte să ajungi unde vrei, trebuie să știi de unde pleci. 92% eșuează pentru că sar peste acest pas.'}
                </p>
              )}
              
              <Button
                size="lg"
                onClick={() => setStep('quiz')}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto max-w-xs mx-auto"
              >
                {language === 'en' ? 'Discover Your Starting Point' : 'Află Unde Ești Acum'}
                <ArrowRight className="h-5 w-5 flex-shrink-0" />
              </Button>
            </div>
          )}

          {step === 'quiz' && (
            <Card className="p-6">
              <VisionBoardQuiz
                language={language}
                onComplete={handleQuizComplete}
                onBack={() => setStep('intro')}
              />
            </Card>
          )}

          {step === 'email' && (
            <EmailCollection
              language={language}
              onComplete={handleEmailComplete}
              onBack={() => setStep('quiz')}
            />
          )}

          {step === 'generating' && (
            <Card className="p-6">
              <VisionBoardGenerator
                answers={answers}
                language={language}
                onComplete={handleImagesGenerated}
                onError={(error) => toast({ variant: 'destructive', title: 'Error', description: error })}
              />
            </Card>
          )}

          {step === 'preview' && (
            <VisionBoardPreview
              images={images}
              visions={answers}
              language={language}
              onSave={handleSave}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default VisionBoard2026;
