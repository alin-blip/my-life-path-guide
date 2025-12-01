import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';

export const Notes: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? 'Sacred Notes' : 'Notițe Sacre'}
          </h1>
        </div>
        <Button className="bg-feminine-primary hover:bg-feminine-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'New Note' : 'Notiță Nouă'}
        </Button>
      </div>
      
      <Card className="bg-card border-feminine-primary/20">
        <CardHeader>
          <CardTitle className="text-feminine-primary flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Your Sacred Writings' : 'Scrierile Tale Sacre'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Your divine notes and sacred thoughts will appear here.' 
              : 'Notițele tale divine și gândurile sacre vor apărea aici.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};