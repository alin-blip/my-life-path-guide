import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Video, FileText } from 'lucide-react';

export const Library: React.FC = () => {
  const { language } = useLanguage();
  const [stacks, setStacks] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('stack_library');
      setStacks(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setStacks([]);
    }
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {language === 'en' ? 'Sacred Library' : 'Biblioteca Sacrată'}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-feminine-primary/20">
          <CardHeader>
            <CardTitle className="text-feminine-primary flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Sacred Texts' : 'Texte Sacre'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Wisdom for your warrior path' 
                : 'Înțelepciune pentru calea ta de războinic'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-feminine-primary/20">
          <CardHeader>
            <CardTitle className="text-feminine-primary flex items-center">
              <Video className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Divine Videos' : 'Videouri Divine'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Visual teachings and meditations' 
                : 'Învățături vizuale și meditații'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-feminine-primary/20">
          <CardHeader>
            <CardTitle className="text-feminine-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Resources' : 'Resurse'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Tools for your transformation' 
                : 'Unelte pentru transformarea ta'}
            </p>
          </CardContent>
        </Card>
      </div>

      {stacks && stacks.length > 0 && (
        <div className="mt-8">
          <Card className="bg-card border-feminine-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-feminine-primary">Introspecție (Stacks)</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/stack-library">Vezi toate</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stacks.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between border-b border-border/20 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-sm text-foreground/90 truncate pr-4">{s.trigger_label || s.trigger || 'Stack'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at || s.timestamp || Date.now()).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};