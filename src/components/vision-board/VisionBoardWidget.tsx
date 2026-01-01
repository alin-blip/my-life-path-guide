import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Eye, Dumbbell, Heart, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  being: { en: 'Being', ro: 'Suflet' },
  balance: { en: 'Balance', ro: 'Echilibru' },
  business: { en: 'Business', ro: 'Business' }
};

const categoryIcons: Record<Category, React.ReactNode> = {
  body: <Dumbbell className="h-4 w-4" />,
  being: <Heart className="h-4 w-4" />,
  balance: <Users className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />
};

export const VisionBoardWidget: React.FC<VisionBoardWidgetProps> = ({
  visionBoard,
  language
}) => {
  const navigate = useNavigate();

  if (!visionBoard) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2">
            {language === 'en' ? 'Create Your Vision Board 2026' : 'Creează Vision Board 2026'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {language === 'en'
              ? 'Visualize your goals with AI-generated images for Body, Being, Balance & Business.'
              : 'Vizualizează-ți obiectivele cu imagini generate de AI pentru Corp, Suflet, Echilibru & Business.'}
          </p>
          
          <Button
            onClick={() => navigate('/vision-board')}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {language === 'en' ? 'Create Vision Board' : 'Creează Vision Board'}
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
                  <img 
                    src={imageUrl} 
                    alt={categoryLabels[category][language]}
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
