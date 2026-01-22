import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Save, Download, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeatureConfig {
  id: string;
  name: string;
  defaultPrompt: string;
}

const features: FeatureConfig[] = [
  {
    id: 'challenge',
    name: '🏆 Have It All Challenge',
    defaultPrompt: 'A golden trophy on a podium with 7 glowing stepping stones leading to it, representing a 7-day transformation challenge. Warm golden lighting, achievement atmosphere, motivational, high quality digital art'
  },
  {
    id: 'aiCoaches',
    name: '🤖 AI Coaches',
    defaultPrompt: 'Four holographic AI coach avatars floating in a futuristic purple-neon interface, each representing different coaching expertise. Sleek technology aesthetic, digital art'
  },
  {
    id: 'visionBoard',
    name: '🎯 Vision Board',
    defaultPrompt: 'A beautiful vision board collage with 4 distinct life areas (body, being, balance, business) arranged harmoniously. Inspiring, dreamy, aspirational mood, digital illustration'
  },
  {
    id: 'warriorRoutine',
    name: '⚔️ Champion Routine',
    defaultPrompt: 'A warrior silhouette at sunrise doing morning routine - meditation pose transitioning to workout stance. Golden hour lighting, discipline and power atmosphere, cinematic digital art'
  },
  {
    id: 'theDoor',
    name: '🚪 The Door',
    defaultPrompt: 'A strategic war room with a large planning board showing priorities and battle maps. Professional, focused, strategic planning atmosphere. Dark room with spotlight, digital art'
  },
  {
    id: 'accelerator',
    name: '🚀 100K Accelerator',
    defaultPrompt: 'A rocket launching from a business growth chart trajectory, with 100K milestone marker. Success, ambition, entrepreneurial spirit. Dynamic composition, digital illustration'
  },
  {
    id: 'stacks',
    name: '🔥 Emotional Stacks',
    defaultPrompt: 'Abstract visualization of emotional energy transformation - dark clouds morphing into bright light streams. Spiritual, transformative, cathartic mood. Artistic digital illustration'
  },
  {
    id: 'brotherhood',
    name: '👥 Brotherhood',
    defaultPrompt: 'A band of warriors standing together in unity, fist bump in the center. Brotherhood, loyalty, community spirit. Epic cinematic lighting, digital art'
  },
  {
    id: 'monthlyMission',
    name: '📅 Monthly Mission',
    defaultPrompt: 'A monthly calendar heatmap glowing with green progress checkmarks, showing consistent daily victories. Gamification, achievement, tracking progress. Clean modern design, digital illustration'
  }
];

export const AIFeatureImageGenerator: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeatures, setSavedFeatures] = useState<string[]>([]);

  const selectedConfig = features.find(f => f.id === selectedFeature);

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
    const config = features.find(f => f.id === featureId);
    if (config) {
      setCustomPrompt(config.defaultPrompt);
    }
    setGeneratedImage(null);
  };

  const generateImage = async () => {
    if (!selectedFeature) {
      toast.error('Selectează o funcționalitate');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-feature-images', {
        body: {
          featureId: selectedFeature,
          customPrompt: customPrompt || undefined
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Imagine generată cu succes!');
      } else {
        throw new Error('Nu s-a putut genera imaginea');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Eroare la generarea imaginii');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToStorage = async () => {
    if (!generatedImage || !selectedFeature) return;

    setIsSaving(true);
    try {
      // Convert base64 to blob
      const base64Data = generatedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Upload to storage
      const fileName = `${selectedFeature}.png`;
      const { error: uploadError } = await supabase.storage
        .from('feature-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setSavedFeatures(prev => [...prev.filter(f => f !== selectedFeature), selectedFeature]);
      toast.success(`Imaginea pentru "${selectedConfig?.name}" a fost salvată!`);
    } catch (error: any) {
      console.error('Error saving image:', error);
      toast.error(error.message || 'Eroare la salvarea imaginii');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage || !selectedFeature) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${selectedFeature}-feature.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Imaginea a fost descărcată');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Generator Imagini Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feature Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selectează Funcționalitatea</label>
            <Select value={selectedFeature} onValueChange={handleFeatureSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Alege o funcționalitate..." />
              </SelectTrigger>
              <SelectContent>
                {features.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    <div className="flex items-center gap-2">
                      {feature.name}
                      {savedFeatures.includes(feature.id) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          {selectedFeature && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt AI (personalizabil)</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Descrie imaginea dorită..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Poți modifica prompt-ul pentru a obține rezultate diferite
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={!selectedFeature || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se generează... (~15 sec)
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generează Imagine
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Image Preview */}
      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Imagine Generată</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={generatedImage}
                alt={`Generated ${selectedConfig?.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveToStorage}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvează în Storage
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4 mr-2" />
                Descarcă
              </Button>
            </div>

            {savedFeatures.includes(selectedFeature) && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Imaginea este salvată și va fi afișată în FeatureShowcase
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progres Imagini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-2 rounded text-xs text-center ${
                  savedFeatures.includes(feature.id)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {savedFeatures.includes(feature.id) ? '✅' : '⏳'} {feature.id}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {savedFeatures.length}/9 imagini generate și salvate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
