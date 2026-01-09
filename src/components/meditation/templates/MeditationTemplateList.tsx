import React, { useState } from 'react';
import { MeditationTemplateCard } from './MeditationTemplateCard';
import { 
  MEDITATION_TEMPLATES, 
  MEDITATION_CATEGORIES, 
  MeditationTemplate 
} from './meditationTemplates';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMeditationPersonalization } from '@/hooks/useMeditationPersonalization';
import { useEmpowermentMeditation } from '@/hooks/useEmpowermentMeditation';
import { toast } from 'sonner';

const categories = ['empowerment', 'productivity', 'recovery', 'special'] as const;

export function MeditationTemplateList() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { loadPersonalizationData, buildPromptContext } = useMeditationPersonalization();
  const { generateMeditation, isGenerating } = useEmpowermentMeditation();
  
  const handleGenerate = async (template: MeditationTemplate) => {
    setGeneratingId(template.id);
    
    try {
      // Load personalization data
      const personalizationData = await loadPersonalizationData(template);
      const context = buildPromptContext(template, personalizationData);
      
      // Check if we have enough data for personalized templates
      if (template.dataSources.length > 0 && !template.dataSources.includes('none')) {
        const hasData = context.trim().length > 0;
        if (!hasData) {
          toast.info('Completează-ți obiectivele în Vision Board pentru o meditație mai personalizată');
        }
      }
      
      // Generate meditation with template context
      const success = await generateMeditation({
        objectives: personalizationData.visionBoard,
        language: 'ro',
        // @ts-ignore - will add templateId to the type
        templateId: template.id,
        templateContext: context,
        templateTitle: template.title
      });
      
      if (success) {
        toast.success(`Meditația "${template.title}" a fost generată!`);
      }
    } catch (error) {
      console.error('Error generating from template:', error);
      toast.error('Eroare la generarea meditației');
    } finally {
      setGeneratingId(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="empowerment" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="text-xs sm:text-sm"
            >
              {MEDITATION_CATEGORIES[cat].label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="grid gap-3">
              {MEDITATION_TEMPLATES
                .filter(t => t.category === cat)
                .map(template => (
                  <MeditationTemplateCard
                    key={template.id}
                    template={template}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating || !!generatingId}
                    generatingId={generatingId || undefined}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
