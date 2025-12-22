import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, Trash2, Search, Filter, Image as ImageIcon, Calendar, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface GalleryImage {
  id: string;
  prompt: string;
  image_url: string;
  has_logo: boolean;
  tags: string[];
  category: string;
  created_at: string;
}

const categories = [
  { value: 'all', label: 'Toate' },
  { value: 'general', label: 'General' },
  { value: 'social', label: 'Social Media' },
  { value: 'motivation', label: 'Motivațional' },
  { value: 'product', label: 'Produs' },
  { value: 'brand', label: 'Brand' },
];

export const AIImageGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages((data as GalleryImage[]) || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({ title: 'Eroare', description: 'Nu am putut încărca galeria', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setImages(prev => prev.filter(img => img.id !== id));
      setSelectedImage(null);
      toast({ title: 'Șters!', description: 'Imaginea a fost ștearsă' });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ title: 'Eroare', description: 'Nu am putut șterge imaginea', variant: 'destructive' });
    }
  };

  const downloadImage = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `rowarrior-${image.id.slice(0, 8)}.png`;
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Descărcat!', description: 'Imaginea a fost salvată' });
    } catch {
      // Fallback for base64 images
      const link = document.createElement('a');
      link.download = `rowarrior-${image.id.slice(0, 8)}.png`;
      link.href = image.image_url;
      link.click();
    }
  };

  const copyImageUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({ title: 'Copiat!', description: 'URL-ul imaginii a fost copiat' });
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Caută după prompt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mx-auto opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Galerie goală</h3>
              <p className="text-sm">Imaginile generate vor apărea aici după ce le salvezi</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Dialog key={image.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden group">
                  <div className="aspect-square relative">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">Vezi detalii</Button>
                    </div>
                    {image.has_logo && (
                      <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                        Logo
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground truncate">{image.prompt}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {format(new Date(image.created_at), 'dd MMM yyyy', { locale: ro })}
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalii imagine</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Prompt:</p>
                    <p className="text-sm text-muted-foreground">{image.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{image.category}</Badge>
                    {image.has_logo && <Badge variant="secondary">Cu logo</Badge>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(image.created_at), 'dd MMMM yyyy, HH:mm', { locale: ro })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadImage(image)}>
                      <Download className="w-4 h-4 mr-1" />
                      Descarcă
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyImageUrl(image.image_url)}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiază URL
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Șterge
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredImages.length} imagini</span>
        <span>Total: {images.length}</span>
      </div>
    </div>
  );
};
