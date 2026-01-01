import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, RefreshCw, Dumbbell, Heart, Users, Briefcase, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Category = 'body' | 'being' | 'balance' | 'business';

interface GeneratedImages {
  body?: string;
  being?: string;
  balance?: string;
  business?: string;
}

interface GenerationStatus {
  body: 'pending' | 'generating' | 'success' | 'error';
  being: 'pending' | 'generating' | 'success' | 'error';
  balance: 'pending' | 'generating' | 'success' | 'error';
  business: 'pending' | 'generating' | 'success' | 'error';
}

const categoryIcons: Record<Category, React.ReactNode> = {
  body: <Dumbbell className="h-5 w-5" />,
  being: <Heart className="h-5 w-5" />,
  balance: <Users className="h-5 w-5" />,
  business: <Briefcase className="h-5 w-5" />
};

const categoryLabels: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Being', ro: 'Suflet' },
  balance: { en: 'Balance', ro: 'Echilibru' },
  business: { en: 'Business', ro: 'Business' }
};

const categoryColors: Record<Category, string> = {
  body: 'bg-blue-500',
  being: 'bg-purple-500',
  balance: 'bg-green-500',
  business: 'bg-amber-500'
};

interface VisionBoardGeneratorProps {
  answers: Record<Category, string>;
  language: 'en' | 'ro';
  onComplete: (images: GeneratedImages) => void;
  onError: (error: string) => void;
}

export const VisionBoardGenerator: React.FC<VisionBoardGeneratorProps> = ({
  answers,
  language,
  onComplete,
  onError
}) => {
  const [images, setImages] = useState<GeneratedImages>({});
  const [status, setStatus] = useState<GenerationStatus>({
    body: 'pending',
    being: 'pending',
    balance: 'pending',
    business: 'pending'
  });
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const categories: Category[] = ['body', 'being', 'balance', 'business'];

  const generateImage = async (category: Category): Promise<string | null> => {
    try {
      setStatus(prev => ({ ...prev, [category]: 'generating' }));
      setCurrentCategory(category);

      const { data, error } = await supabase.functions.invoke('generate-vision-board-images', {
        body: {
          category,
          visionText: answers[category],
          language
        }
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error('No image generated');

      setStatus(prev => ({ ...prev, [category]: 'success' }));
      return data.imageUrl;
    } catch (error) {
      console.error(`Error generating ${category} image:`, error);
      setStatus(prev => ({ ...prev, [category]: 'error' }));
      return null;
    }
  };

  const retryGeneration = async (category: Category) => {
    const imageUrl = await generateImage(category);
    if (imageUrl) {
      setImages(prev => ({ ...prev, [category]: imageUrl }));
    }
  };

  useEffect(() => {
    const generateAllImages = async () => {
      const generatedImages: GeneratedImages = {};
      let hasError = false;

      for (const category of categories) {
        const imageUrl = await generateImage(category);
        if (imageUrl) {
          generatedImages[category] = imageUrl;
          setImages(prev => ({ ...prev, [category]: imageUrl }));
        } else {
          hasError = true;
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCurrentCategory(null);

      if (Object.keys(generatedImages).length === 4) {
        onComplete(generatedImages);
      } else if (hasError && Object.keys(generatedImages).length === 0) {
        onError(language === 'en' 
          ? 'Failed to generate images. Please try again.' 
          : 'Nu s-au putut genera imaginile. Te rugăm să încerci din nou.');
      }
    };

    generateAllImages();
  }, []);

  const completedCount = Object.values(status).filter(s => s === 'success').length;
  const progress = (completedCount / 4) * 100;
  const allComplete = completedCount === 4;
  const hasErrors = Object.values(status).some(s => s === 'error');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === 'en' 
            ? 'Creating Your Vision Board...' 
            : 'Creăm Vision Board-ul tău...'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'en'
            ? 'AI is generating personalized images based on your vision. This may take a minute.'
            : 'AI-ul generează imagini personalizate bazate pe viziunea ta. Poate dura un minut.'}
        </p>
      </div>

      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{completedCount}/4 {language === 'en' ? 'images generated' : 'imagini generate'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card 
            key={category}
            className={cn(
              "p-4 transition-all duration-300",
              status[category] === 'generating' && "ring-2 ring-primary animate-pulse",
              status[category] === 'success' && "ring-2 ring-green-500",
              status[category] === 'error' && "ring-2 ring-destructive"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-full text-white",
                  categoryColors[category]
                )}>
                  {categoryIcons[category]}
                </div>
                <span className="font-medium">{categoryLabels[category][language]}</span>
              </div>
              
              {status[category] === 'pending' && (
                <div className="w-6 h-6 rounded-full border-2 border-muted" />
              )}
              {status[category] === 'generating' && (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              )}
              {status[category] === 'success' && (
                <Check className="h-6 w-6 text-green-500" />
              )}
              {status[category] === 'error' && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => retryGeneration(category)}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            {/* Image preview or placeholder */}
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              {images[category] ? (
                <img 
                  src={images[category]} 
                  alt={categoryLabels[category][language]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {status[category] === 'generating' ? (
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  ) : status[category] === 'error' ? (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Continue button when all complete */}
      {allComplete && (
        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => onComplete(images)}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {language === 'en' ? 'View Your Vision Board' : 'Vezi Vision Board-ul tău'}
          </Button>
        </div>
      )}

      {/* Retry all button if there are errors */}
      {hasErrors && !allComplete && (
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">
            {language === 'en' 
              ? 'Some images failed to generate. Click retry on failed images or continue with available ones.'
              : 'Unele imagini nu s-au generat. Apasă retry pe imaginile eșuate sau continuă cu cele disponibile.'}
          </p>
          {completedCount >= 2 && (
            <Button
              variant="outline"
              onClick={() => onComplete(images)}
            >
              {language === 'en' ? 'Continue with available images' : 'Continuă cu imaginile disponibile'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
