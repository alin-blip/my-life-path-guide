import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VisionBoardQuiz } from '@/components/vision-board/VisionBoardQuiz';
import { VisionBoardGenerator } from '@/components/vision-board/VisionBoardGenerator';
import { VisionBoardPreview } from '@/components/vision-board/VisionBoardPreview';
import { EmailCollection } from '@/components/vision-board/EmailCollection';
import { Sparkles, ArrowRight } from 'lucide-react';
import html2canvas from 'html2canvas';

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

const VisionBoard2026 = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleImagesGenerated = (generatedImages: GeneratedImages) => {
    setImages(generatedImages);
    setStep('preview');
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
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-foreground">
                {language === 'en' ? 'Vision Board 2026' : 'Vision Board 2026'}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                {language === 'en'
                  ? 'Create a powerful visual representation of your goals across Body, Being, Balance & Business using AI.'
                  : 'Creează o reprezentare vizuală puternică a obiectivelor tale în Corp, Suflet, Echilibru & Business folosind AI.'}
              </p>
              
              <Button
                size="lg"
                onClick={() => setStep('quiz')}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {language === 'en' ? 'Start Creating' : 'Începe Crearea'}
                <ArrowRight className="h-5 w-5" />
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
