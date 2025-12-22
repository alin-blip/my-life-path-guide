import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Image, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addLogo, setAddLogo] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Eroare', description: 'Te rog descrie imaginea dorită', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const enhancedPrompt = `${prompt}. Style: professional, modern, motivational, clean design suitable for social media marketing. Colors should be vibrant with dark tones. High quality, 4K resolution.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_image',
          prompt: enhancedPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Image generation failed');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        if (addLogo) {
          await addLogoToImage(data.imageUrl);
        } else {
          setGeneratedImage(data.imageUrl);
        }
        toast({ title: 'Succes!', description: 'Imagine generată cu succes' });
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Nu am putut genera imaginea',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLogoToImage = async (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the main image
      ctx.drawImage(img, 0, 0);
      
      // Add logo text watermark in corner
      const logoText = 'RoWarrior';
      const padding = 20;
      
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Gradient text
      const gradient = ctx.createLinearGradient(canvas.width - 200, canvas.height - 50, canvas.width - padding, canvas.height - padding);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#ea580c');
      ctx.fillStyle = gradient;
      
      ctx.fillText(logoText, canvas.width - padding, canvas.height - padding);
      
      // Add small sword/warrior icon emoji
      ctx.font = '28px Arial';
      ctx.fillText('⚔️', canvas.width - padding - ctx.measureText(logoText).width - 10, canvas.height - padding);
      
      setGeneratedImage(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // If image loading fails, just use the original
      setGeneratedImage(imageUrl);
    };

    img.src = imageUrl;
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `rowarrior-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    
    toast({ title: 'Descărcat!', description: 'Imaginea a fost salvată' });
  };

  const promptSuggestions = [
    'Warrior meditating at sunrise, epic mountain backdrop',
    'Abstract representation of discipline and focus',
    'Lion symbolizing courage and strength, modern art style',
    'Path to success with obstacles, motivational concept',
    'Fire and determination, abstract warrior spirit',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Generator de Imagini AI
          </CardTitle>
          <CardDescription>Creează imagini pentru postări și marketing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Descrierea imaginii</Label>
            <Textarea
              placeholder="Descrie imaginea pe care vrei să o generezi..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="add-logo"
                checked={addLogo}
                onCheckedChange={setAddLogo}
              />
              <Label htmlFor="add-logo" className="text-sm">
                Adaugă logo RoWarrior
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sugestii:</p>
            <div className="flex flex-wrap gap-1">
              {promptSuggestions.map((suggestion, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-xs"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion.slice(0, 30)}...
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={generateImage} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se generează...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generează Imagine
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rezultat</CardTitle>
            <CardDescription>Imaginea generată de AI</CardDescription>
          </div>
          {generatedImage && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateImage} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerează
              </Button>
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download className="w-4 h-4 mr-1" />
                Descarcă
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="aspect-square rounded-lg border overflow-hidden bg-muted">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto opacity-50 mb-2" />
                  <p>Imaginea generată va apărea aici</p>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};
