import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Image, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Category = 'body' | 'being' | 'balance' | 'business';

interface Mission {
  id: string;
  category: string;
  title: string | null;
  measurable_result: string | null;
  mission_type: string;
}

interface VisionImages {
  body: string | null;
  being: string | null;
  balance: string | null;
  business: string | null;
}

interface ObjectiveVisionBoardProps {
  language: string;
  annualMissions: Mission[];
  onRefresh?: () => void;
}

const categoryGradients: Record<Category, string> = {
  body: 'from-red-500/20 to-orange-500/20',
  being: 'from-purple-500/20 to-pink-500/20',
  balance: 'from-green-500/20 to-emerald-500/20',
  business: 'from-amber-500/20 to-yellow-500/20'
};

const categoryLabels: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Spirituality', ro: 'Spiritualitate' },
  balance: { en: 'Relationships', ro: 'Relații' },
  business: { en: 'Business', ro: 'Business' }
};

export const ObjectiveVisionBoard: React.FC<ObjectiveVisionBoardProps> = ({ 
  language, 
  annualMissions,
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [visionImages, setVisionImages] = useState<VisionImages>({
    body: null, being: null, balance: null, business: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadVisionBoardImages();
  }, []);

  const loadVisionBoardImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vision_boards')
        .select('body_image_url, being_image_url, balance_image_url, business_image_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVisionImages({
          body: data.body_image_url,
          being: data.being_image_url,
          balance: data.balance_image_url,
          business: data.business_image_url
        });
      }
    } catch (error) {
      console.error('Error loading vision images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMissionsForCategory = (category: Category) => {
    return annualMissions.filter(m => m.category?.toLowerCase() === category);
  };

  const generateVisionForCategory = async (category: Category) => {
    const categoryMissions = getMissionsForCategory(category);
    if (categoryMissions.length === 0) {
      toast.error(language === 'ro' 
        ? 'Trebuie să ai obiective anuale pentru această categorie' 
        : 'You need annual objectives for this category');
      return;
    }

    setGeneratingCategory(category);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build vision text from objectives
      const visionText = categoryMissions
        .map(m => m.title || m.measurable_result)
        .filter(Boolean)
        .join('. ');

      const { data, error } = await supabase.functions.invoke('generate-vision-board-images', {
        body: { category, visionText, language }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Update vision board in database
        const updateField = `${category}_image_url`;
        
        // Check if vision board exists
        const { data: existing } = await supabase
          .from('vision_boards')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('vision_boards')
            .update({ [updateField]: data.imageUrl, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('vision_boards')
            .insert({ 
              user_id: user.id, 
              [updateField]: data.imageUrl,
              [`${category}_vision`]: visionText
            });
        }

        setVisionImages(prev => ({ ...prev, [category]: data.imageUrl }));
        toast.success(language === 'ro' 
          ? `Imagine ${categoryLabels[category].ro} generată!` 
          : `${categoryLabels[category].en} image generated!`);
      }
    } catch (error: any) {
      console.error('Error generating vision:', error);
      toast.error(language === 'ro' 
        ? 'Eroare la generarea imaginii' 
        : 'Error generating image');
    } finally {
      setGeneratingCategory(null);
    }
  };

  const generateAllVisions = async () => {
    setIsGenerating(true);
    const categories: Category[] = ['body', 'being', 'balance', 'business'];
    
    for (const category of categories) {
      const categoryMissions = getMissionsForCategory(category);
      if (categoryMissions.length > 0) {
        await generateVisionForCategory(category);
      }
    }
    
    setIsGenerating(false);
    toast.success(language === 'ro' 
      ? 'Vision Board generat din obiective!' 
      : 'Vision Board generated from objectives!');
  };

  const hasAnyAnnualObjectives = annualMissions.length > 0;
  const categories: Category[] = ['body', 'being', 'balance', 'business'];

  const renderCategoryVision = (category: Category) => {
    const categoryMissions = getMissionsForCategory(category);
    const hasObjectives = categoryMissions.length > 0;
    const imageUrl = visionImages[category];
    const isGeneratingThis = generatingCategory === category;

    return (
      <div 
        key={category}
        className={`relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-gradient-to-br ${categoryGradients[category]}`}
      >
        {/* Background Image or Gradient */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={categoryLabels[category][language === 'ro' ? 'ro' : 'en']}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        
        {/* Overlay */}
        <div className={`absolute inset-0 ${imageUrl ? 'bg-black/40' : ''} flex flex-col items-center justify-center p-3`}>
          {isGeneratingThis ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="text-xs text-white/80">
                {language === 'ro' ? 'Se generează...' : 'Generating...'}
              </span>
            </div>
          ) : hasObjectives ? (
            <>
              <span className="text-white font-semibold text-sm mb-1 drop-shadow-lg">
                {categoryLabels[category][language === 'ro' ? 'ro' : 'en']}
              </span>
              {!imageUrl && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7 px-2 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => generateVisionForCategory(category)}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === 'ro' ? 'Generează' : 'Generate'}
                </Button>
              )}
            </>
          ) : (
            <>
              <span className="text-white/80 font-medium text-sm mb-2 drop-shadow-lg">
                {categoryLabels[category][language === 'ro' ? 'ro' : 'en']}
              </span>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-7 px-2 bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => navigate('/door?tab=annual')}
              >
                <Target className="h-3 w-3 mr-1" />
                {language === 'ro' ? 'Setează Obiective' : 'Set Objectives'}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {categories.map(cat => (
          <div key={cat} className="aspect-video bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const hasAnyImages = Object.values(visionImages).some(Boolean);
  const categoriesWithObjectives = categories.filter(cat => getMissionsForCategory(cat).length > 0);
  const categoriesWithoutImages = categoriesWithObjectives.filter(cat => !visionImages[cat]);

  return (
    <div className="mb-4">
      {/* Vision Board Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {categories.map(renderCategoryVision)}
      </div>

      {/* Generate All Button - only show if there are objectives without images */}
      {categoriesWithoutImages.length > 0 && hasAnyAnnualObjectives && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={generateAllVisions}
            disabled={isGenerating}
            className="text-sm gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'ro' ? 'Se generează...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {language === 'ro' ? 'Generează Vision Board din Obiective' : 'Generate Vision Board from Objectives'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
