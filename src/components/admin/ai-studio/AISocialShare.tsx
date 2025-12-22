import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Facebook, Instagram, ExternalLink, Image as ImageIcon, Info, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AISocialShare: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState<'text' | 'image' | null>(null);
  const { toast } = useToast();

  const copyText = async () => {
    if (!postContent) return;
    await navigator.clipboard.writeText(postContent);
    setCopied('text');
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copiat!', description: 'Textul a fost copiat în clipboard' });
  };

  const copyImageUrl = async () => {
    if (!imageUrl) return;
    await navigator.clipboard.writeText(imageUrl);
    setCopied('image');
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copiat!', description: 'URL-ul imaginii a fost copiat' });
  };

  const openFacebookCreator = () => {
    // Facebook Creator Studio / Business Suite
    window.open('https://business.facebook.com/latest/home', '_blank');
  };

  const openInstagram = () => {
    // Instagram doesn't have a direct web composer, so we open the main page
    window.open('https://www.instagram.com/', '_blank');
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          Copiază conținutul și imaginea, apoi deschide platforma pentru a publica manual. 
          În viitor, vei putea conecta conturile pentru publicare automată.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Conținut pentru publicare
            </CardTitle>
            <CardDescription>Adaugă textul și imaginea pentru postare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Text postare</Label>
              <Textarea
                placeholder="Lipește sau scrie textul postării aici..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={6}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyText}
                disabled={!postContent}
                className="w-full"
              >
                {copied === 'text' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied === 'text' ? 'Copiat!' : 'Copiază textul'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>URL imagine (opțional)</Label>
              <Input
                placeholder="https://... sau data:image/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <>
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyImageUrl}
                    className="w-full"
                  >
                    {copied === 'image' ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                    {copied === 'image' ? 'Copiat!' : 'Copiază URL imagine'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platforms Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Platforme
            </CardTitle>
            <CardDescription>Deschide platforma pentru a publica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-4"
              onClick={openFacebookCreator}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Facebook className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Facebook Business Suite</p>
                  <p className="text-xs text-muted-foreground">Publică pe pagina de Facebook</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-4"
              onClick={openInstagram}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Instagram className="w-6 h-6 text-pink-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Instagram</p>
                  <p className="text-xs text-muted-foreground">Publică pe Instagram</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Instrucțiuni rapide:</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 justify-center">1</Badge>
                  Copiază textul postării de mai sus
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 justify-center">2</Badge>
                  Descarcă imaginea din Galerie sau Generator
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 justify-center">3</Badge>
                  Deschide platforma dorită
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 justify-center">4</Badge>
                  Lipește textul și încarcă imaginea
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 justify-center">5</Badge>
                  Publică sau programează!
                </li>
              </ol>
            </div>

            <Alert className="mt-4">
              <Info className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <strong>Meta API în curând:</strong> Conectarea cu Meta Business Suite pentru publicare automată va fi disponibilă în curând. 
                Va necesita un cont Meta Developer și configurare App ID.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
