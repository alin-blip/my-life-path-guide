import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Video, FileText } from 'lucide-react';

export const Library: React.FC = () => {
  const { language } = useLanguage();
  
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
    </div>
  );
};