import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, RefreshCw, Target, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { GenerateMeditationButton } from '@/components/meditation/GenerateMeditationButton';

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

// Default placeholder images for new users
const categoryPlaceholders: Record<Category, string> = {
  body: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&q=80',
  being: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80',
  balance: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&q=80',
  business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80'
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

      // Get ALL vision board entries for this user to consolidate images
      const { data, error } = await supabase
        .from('vision_boards')
        .select('id, body_image_url, being_image_url, balance_image_url, business_image_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Consolidate images from all records (most recent wins)
        const consolidated: VisionImages = { body: null, being: null, balance: null, business: null };
        
        // Go through all records from oldest to newest to get the latest image for each category
        for (const record of [...data].reverse()) {
          if (record.body_image_url && !consolidated.body) consolidated.body = record.body_image_url;
          if (record.being_image_url && !consolidated.being) consolidated.being = record.being_image_url;
          if (record.balance_image_url && !consolidated.balance) consolidated.balance = record.balance_image_url;
          if (record.business_image_url && !consolidated.business) consolidated.business = record.business_image_url;
        }
        
        // Override with most recent values
        for (const record of data) {
          if (record.body_image_url) consolidated.body = record.body_image_url;
          if (record.being_image_url) consolidated.being = record.being_image_url;
          if (record.balance_image_url) consolidated.balance = record.balance_image_url;
          if (record.business_image_url) consolidated.business = record.business_image_url;
        }

        setVisionImages(consolidated);

        // If there are multiple records, consolidate them into one
        if (data.length > 1) {
          const primaryId = data[0].id;
          
          // Update the primary record with all consolidated images
          await supabase
            .from('vision_boards')
            .update({
              body_image_url: consolidated.body,
              being_image_url: consolidated.being,
              balance_image_url: consolidated.balance,
              business_image_url: consolidated.business,
              updated_at: new Date().toISOString()
            })
            .eq('id', primaryId);

          // Delete the duplicate records
          const idsToDelete = data.slice(1).map(r => r.id);
          await supabase
            .from('vision_boards')
            .delete()
            .in('id', idsToDelete);
          
          console.log('Consolidated vision board records');
        }
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
        
        // Check if vision board exists - get the most recent one
        const { data: existing } = await supabase
          .from('vision_boards')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          // Update existing record by ID
          await supabase
            .from('vision_boards')
            .update({ [updateField]: data.imageUrl, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          // Create new record
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
        className={`relative rounded-xl overflow-hidden border border-border/50 aspect-[16/9] bg-gradient-to-br ${categoryGradients[category]}`}
      >
        {/* Background Image - personalized or placeholder */}
        <ImageWithSkeleton
          src={imageUrl || categoryPlaceholders[category]}
          alt={categoryLabels[category][language === 'ro' ? 'ro' : 'en']}
          wrapperClassName="absolute inset-0"
          className={`absolute inset-0 w-full h-full object-cover ${!imageUrl ? 'opacity-70' : ''}`}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 ${imageUrl ? 'bg-black/30' : ''} flex flex-col items-center justify-center p-3`}>
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
              {imageUrl ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-6 px-2 bg-white/20 hover:bg-white/30 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateVisionForCategory(category);
                  }}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {language === 'ro' ? 'Regenerează' : 'Regenerate'}
                </Button>
              ) : (
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
                onClick={() => navigate('/game-objectives?tab=annual')}
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
      {/* Vision Board Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Vision Board</h2>
        </div>
        <GenerateMeditationButton objectives={annualMissions} language={language} />
      </div>

      {/* Vision Board Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {categories.map(cat => (
          <div key={cat} className="group">
            {renderCategoryVision(cat)}
          </div>
        ))}
      </div>

      {/* Buttons row */}
      <div className="flex justify-center gap-2 flex-wrap">
        {/* Generate All Button - show if there are objectives without images */}
        {categoriesWithoutImages.length > 0 && hasAnyAnnualObjectives && (
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
                {language === 'ro' ? 'Generează Vision Board' : 'Generate Vision Board'}
              </>
            )}
          </Button>
        )}
        
        {/* Regenerate All Button - show if all categories have images */}
        {hasAnyImages && categoriesWithoutImages.length === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateAllVisions}
            disabled={isGenerating}
            className="text-sm gap-2 text-muted-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'ro' ? 'Se regenerează...' : 'Regenerating...'}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {language === 'ro' ? 'Regenerează Toate' : 'Regenerate All'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
