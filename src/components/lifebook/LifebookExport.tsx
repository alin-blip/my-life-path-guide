import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Upload,
  Image,
  Printer,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { LifebookEntry, LIFEBOOK_STRUCTURE, SECTIONS } from './types';
import { exportLifebookToPdf, getLifebookStats } from '@/services/lifebookPdfService';

const LifebookExport: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [entries, setEntries] = useState<LifebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [printOptimized, setPrintOptimized] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.email?.split('@')[0] || '');

      const { data, error } = await supabase
        .from('lifebook_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEntries((data as unknown as LifebookEntry[]) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'ro' ? 'Tip de fișier invalid' : 'Invalid file type',
        description: language === 'ro' 
          ? 'Te rog încarcă o imagine (JPG, PNG, etc.)'
          : 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === 'ro' ? 'Fișier prea mare' : 'File too large',
        description: language === 'ro' 
          ? 'Imaginea trebuie să fie mai mică de 5MB'
          : 'Image must be smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCoverImage(result);
      toast({
        title: language === 'ro' ? 'Imagine încărcată' : 'Image uploaded',
        description: language === 'ro' 
          ? 'Imaginea de copertă a fost adăugată'
          : 'Cover image has been added',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLifebookToPdf({
        entries,
        userName,
        generatedAt: new Date(),
        coverImage: coverImage || undefined,
        printOptimized
      }, language as 'en' | 'ro');

      toast({
        title: language === 'ro' ? 'PDF generat cu succes!' : 'PDF generated successfully!',
        description: language === 'ro' 
          ? 'Life Book-ul tău a fost descărcat.'
          : 'Your Life Book has been downloaded.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' 
          ? 'Nu am putut genera PDF-ul. Încearcă din nou.'
          : 'Could not generate PDF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const stats = getLifebookStats(entries);
  const overallProgress = (stats.completedSections / stats.totalSections) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/lifebook')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ro' ? 'Înapoi' : 'Back'}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Download className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ro' ? 'Exportă Life Book' : 'Export Life Book'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'ro'
              ? 'Generează un PDF frumos formatat cu tot Life Book-ul tău'
              : 'Generate a beautifully formatted PDF with your entire Life Book'}
          </p>
        </div>

        {/* PDF Options Card */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              {language === 'ro' ? 'Opțiuni PDF' : 'PDF Options'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'ro' ? 'Imagine de Copertă / Logo' : 'Cover Image / Logo'}
              </Label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {coverImage ? (
                <div className="relative inline-block">
                  <img 
                    src={coverImage} 
                    alt="Cover" 
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {language === 'ro' ? 'Încarcă Imagine' : 'Upload Image'}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground">
                {language === 'ro' 
                  ? 'Opțional: Adaugă o imagine personală sau logo pe coperta PDF-ului (max 5MB)'
                  : 'Optional: Add a personal image or logo to the PDF cover (max 5MB)'}
              </p>
            </div>

            {/* Print Optimized Toggle */}
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-primary" />
                  <Label htmlFor="print-optimized" className="font-medium">
                    {language === 'ro' ? 'Versiune pentru Tipărire' : 'Print-Optimized Version'}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ro'
                    ? 'Margini mai mari, pagini de secțiune, optimizat pentru legare'
                    : 'Larger margins, section dividers, optimized for binding'}
                </p>
              </div>
              <Switch
                id="print-optimized"
                checked={printOptimized}
                onCheckedChange={setPrintOptimized}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {language === 'ro' ? 'Progres Total' : 'Overall Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.completedSections} / {stats.totalSections} {language === 'ro' ? 'secțiuni completate' : 'sections completed'}
                  </span>
                  <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {LIFEBOOK_STRUCTURE.map((category) => {
                  const catProgress = stats.categoryProgress[category.key];
                  const percentage = catProgress ? (catProgress.completed / catProgress.total) * 100 : 0;
                  
                  return (
                    <div key={category.key} className="text-center p-3 bg-accent/20 rounded-lg">
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">
                        {language === 'ro' ? category.nameRo : category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle>
              {language === 'ro' ? 'Detalii per Categorie' : 'Category Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LIFEBOOK_STRUCTURE.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{language === 'ro' ? category.nameRo : category.name}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                    {category.subcategories.map((sub) => {
                      const subEntries = entries.filter(e => e.subcategory === sub.key);
                      const completedCount = subEntries.filter(e => e.status === 'completed').length;
                      const isComplete = completedCount === SECTIONS.length;
                      const hasContent = completedCount > 0;

                      return (
                        <div
                          key={sub.key}
                          className={`flex items-center gap-2 p-2 rounded text-sm ${
                            isComplete 
                              ? 'bg-green-500/10 text-green-600' 
                              : hasContent 
                                ? 'bg-yellow-500/10 text-yellow-600'
                                : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : hasContent ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-current" />
                          )}
                          <span>{sub.icon}</span>
                          <span className="truncate">{language === 'ro' ? sub.nameRo : sub.name}</span>
                          <span className="ml-auto text-xs">
                            {completedCount}/{SECTIONS.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {stats.completedSections === 0 ? (
                <>
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
                  <p className="text-muted-foreground">
                    {language === 'ro'
                      ? 'Nu ai completat încă nicio secțiune. Începe să-ți construiești Life Book-ul pentru a putea genera PDF-ul.'
                      : 'You haven\'t completed any sections yet. Start building your Life Book to generate the PDF.'}
                  </p>
                  <Button onClick={() => navigate('/lifebook')}>
                    {language === 'ro' ? 'Începe Life Book' : 'Start Life Book'}
                  </Button>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 text-primary mx-auto" />
                  <p className="text-muted-foreground">
                    {language === 'ro'
                      ? `Life Book-ul tău este ${Math.round(overallProgress)}% complet. Poți genera PDF-ul oricând.`
                      : `Your Life Book is ${Math.round(overallProgress)}% complete. You can generate the PDF anytime.`}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      size="lg" 
                      onClick={handleExport}
                      disabled={exporting}
                      className="gap-2"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {language === 'ro' ? 'Se generează...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          {language === 'ro' ? 'Descarcă PDF' : 'Download PDF'}
                          {printOptimized && (
                            <span className="ml-1 text-xs opacity-75">
                              ({language === 'ro' ? 'print' : 'print'})
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {coverImage && (
                    <p className="text-xs text-muted-foreground">
                      ✓ {language === 'ro' ? 'Imagine de copertă inclusă' : 'Cover image included'}
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifebookExport;