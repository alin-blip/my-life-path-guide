import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VisionBoardCard } from './VisionBoardCard';

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

export const VisionBoardWidget: React.FC<VisionBoardWidgetProps> = ({
  visionBoard,
  language
}) => {
  const navigate = useNavigate();

  if (!visionBoard) {
    // Empty state - CTA to create vision board
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

  // Has vision board - show preview
  const categories: Category[] = ['body', 'being', 'balance', 'business'];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Vision Board 2026' : 'Vision Board 2026'}
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
          {categories.map((category) => (
            <VisionBoardCard
              key={category}
              category={category}
              imageUrl={visionBoard[`${category}_image_url` as keyof VisionBoardData] as string}
              vision={visionBoard[`${category}_vision` as keyof VisionBoardData] as string}
              language={language}
              onClick={() => navigate('/vision-board/view')}
              size="sm"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
