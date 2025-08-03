import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Settings: React.FC = () => {
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
          {language === 'en' ? 'Settings' : 'Setări'}
        </h1>
      </div>
      
      <Card className="bg-card border-feminine-primary/20">
        <CardHeader>
          <CardTitle className="text-feminine-primary">
            {language === 'en' ? 'Application Settings' : 'Setări Aplicație'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Settings page is under development.' : 'Pagina de setări este în dezvoltare.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};