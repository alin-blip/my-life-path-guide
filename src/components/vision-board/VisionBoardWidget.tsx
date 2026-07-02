import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Eye, Dumbbell, Heart, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';

type Category = 'body' | 'being' | 'balance' | 'business';

interface VisionBoardData {
  body_image_url?: string;
  being_image_url?: string;
  balance_image_url?: string;
  business_image_url?: string;
  body_vision?: string;
  being_vision?: string;
  balance_vision?: string;
  business_vision?: string;
}

interface VisionBoardWidgetProps {
  visionBoard?: VisionBoardData | null;
  language: 'en' | 'ro';
}

const categoryColors: Record<Category, string> = {
  body: 'from-blue-500 to-cyan-500',
  being: 'from-purple-500 to-pink-500',
  balance: 'from-green-500 to-emerald-500',
  business: 'from-amber-500 to-orange-500'
};

const categoryLabels: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Spirituality', ro: 'Spiritualitate' },
  balance: { en: 'Relationships', ro: 'Relații' },
  business: { en: 'Business', ro: 'Business' }
};

const categoryIcons: Record<Category, React.ReactNode> = {
  body: <Dumbbell className="h-4 w-4" />,
  being: <Heart className="h-4 w-4" />,
  balance: <Users className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />
};

const categoryPlaceholders: Record<Category, string> = {
  body: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&q=80',
  being: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop&q=80',
  balance: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop&q=80',
  business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&q=80'
};

const categoryMessages: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Define your ideal body', ro: 'Definește corpul ideal' },
  being: { en: 'Set your spiritual vision', ro: 'Setează viziunea spirituală' },
  balance: { en: 'Create strong relationships', ro: 'Creează relații puternice' },
  business: { en: 'Visualize business success', ro: 'Vizualizează succesul' }
};

export const VisionBoardWidget: React.FC<VisionBoardWidgetProps> = ({
  visionBoard,
  language
}) => {
  const navigate = useNavigate();

  if (!visionBoard) {
    const categories: Category[] = ['body', 'being', 'balance', 'business'];
    
    return (
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vision Board 2026
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {categories.map((category) => (
              <div 
                key={category} 
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => navigate('/vision-board')}
              >
                {/* Imagine placeholder aspirațională */}
                <ImageWithSkeleton
                  src={categoryPlaceholders[category]}
                  alt={categoryLabels[category][language]}
                  wrapperClassName="absolute inset-0"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Badge categorie + mesaj CTA */}
                <div className="absolute inset-0 p-2 flex flex-col justify-end">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium w-fit bg-gradient-to-r",
                    categoryColors[category]
                  )}>
                    {categoryIcons[category]}
                    <span>{categoryLabels[category][language]}</span>
                  </div>
                  <p className="text-white/90 text-[10px] mt-1 font-medium leading-tight">
                    {categoryMessages[category][language]}
                  </p>
                </div>
                
                {/* Sparkle icon indicând AI */}
                <div className="absolute top-2 right-2">
                  <Sparkles className="h-3 w-3 text-white/70" />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate('/vision-board')}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            {language === 'en' ? 'Generate Your Vision' : 'Generează-ți Viziunea'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const categories: Category[] = ['body', 'being', 'balance', 'business'];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vision Board 2026
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vision-board/view')}
            className="gap-1 text-primary"
          >
            <Eye className="h-4 w-4" />
            {language === 'en' ? 'View' : 'Vezi'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const imageUrl = visionBoard[`${category}_image_url` as keyof VisionBoardData] as string | undefined;
            
            return (
              <div
                key={category}
                className="aspect-square relative overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => navigate('/vision-board/view')}
              >
                {imageUrl ? (
                  <ImageWithSkeleton
                    src={imageUrl}
                    alt={categoryLabels[category][language]}
                    wrapperClassName="absolute inset-0"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center bg-gradient-to-br",
                    categoryColors[category]
                  )}>
                    <div className="text-white/50 scale-150">{categoryIcons[category]}</div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-2 flex flex-col justify-end">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium w-fit bg-gradient-to-r",
                    categoryColors[category]
                  )}>
                    {categoryIcons[category]}
                    <span>{categoryLabels[category][language]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
