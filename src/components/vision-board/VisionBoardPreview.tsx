import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Save, Dumbbell, Heart, Users, Briefcase, Upload, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisionBoardUpsell } from './VisionBoardUpsell';

type Category = 'body' | 'being' | 'balance' | 'business';

interface GeneratedImages {
  body?: string;
  being?: string;
  balance?: string;
  business?: string;
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
  body: 'from-blue-500 to-cyan-500',
  being: 'from-purple-500 to-pink-500',
  balance: 'from-green-500 to-emerald-500',
  business: 'from-amber-500 to-orange-500'
};

interface VisionBoardPreviewProps {
  images: GeneratedImages;
  visions: Record<Category, string>;
  language: 'en' | 'ro';
  onSave: () => void;
  onDownload: () => void;
  onUploadImage?: (category: Category, file: File) => void;
  onRegenerateImage?: (category: Category) => void;
  editable?: boolean;
}

export const VisionBoardPreview: React.FC<VisionBoardPreviewProps> = ({
  images,
  visions,
  language,
  onSave,
  onDownload,
  onUploadImage,
  onRegenerateImage,
  editable = false
}) => {
  const navigate = useNavigate();
  const categories: Category[] = ['body', 'being', 'balance', 'business'];

  const handleFileChange = (category: Category, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(category, file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Your Vision Board 2026' : 'Vision Board-ul tău 2026'}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {language === 'en'
            ? 'Your personalized vision board is ready! Save it to keep it in your dashboard.'
            : 'Vision Board-ul tău personalizat este gata! Salvează-l pentru a-l păstra în dashboard.'}
        </p>
      </div>

      {/* Vision Board Grid */}
      <div 
        id="vision-board-canvas"
        className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-background to-muted rounded-2xl"
      >
        {categories.map((category) => (
          <Card 
            key={category}
            className="group relative overflow-hidden rounded-xl border-0 shadow-lg aspect-[4/3]"
          >
            {/* Image */}
            <div className="absolute inset-0">
              {images[category] ? (
                <img 
                  src={images[category]} 
                  alt={categoryLabels[category][language]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                  <div className="text-muted-foreground">{categoryIcons[category]}</div>
                </div>
              )}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium mb-2 w-fit bg-gradient-to-r",
                categoryColors[category]
              )}>
                {categoryIcons[category]}
                <span>{categoryLabels[category][language]}</span>
              </div>
              
              <p className="text-white/90 text-sm line-clamp-2">
                {visions[category]?.slice(0, 100)}...
              </p>
            </div>

            {/* Edit overlay (when editable) */}
            {editable && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(category, e)}
                    className="hidden"
                  />
                  <Button size="sm" variant="secondary" className="gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      {language === 'en' ? 'Upload' : 'Încarcă'}
                    </span>
                  </Button>
                </label>
                {onRegenerateImage && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onRegenerateImage(category)}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {language === 'en' ? 'Regenerate' : 'Regenerează'}
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Upsell Section - FIRST before actions */}
      <div className="mt-6 mb-8">
        <VisionBoardUpsell 
          language={language} 
          onContinueFree={() => {
            onSave();
            navigate('/door?tab=annual');
          }} 
        />
      </div>

      {/* Actions - AFTER upsell */}
      <div className="pt-6 border-t border-border">
        <p className="text-center text-sm text-muted-foreground mb-4">
          {language === 'en' 
            ? 'Or save your Vision Board and continue later:' 
            : 'Sau salvează Vision Board-ul și continuă mai târziu:'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={onDownload}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {language === 'en' ? 'Download' : 'Descarcă'}
          </Button>
          
          <Button
            onClick={onSave}
            variant="outline"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {language === 'en' ? 'Save to Dashboard' : 'Salvează în Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};
