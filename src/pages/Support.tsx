import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export const Support: React.FC = () => {
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
          {language === 'en' ? 'Support' : 'Suport'}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-feminine-primary/20">
          <CardHeader>
            <CardTitle className="text-feminine-primary flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Contact Support' : 'Contactează Suportul'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Need help with your goddess journey? Send us a message.' 
                : 'Ai nevoie de ajutor cu călătoria ta de zeiță? Trimite-ne un mesaj.'}
            </p>
            <Button className="bg-feminine-primary hover:bg-feminine-primary/90">
              <Mail className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Send Email' : 'Trimite Email'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-feminine-primary/20">
          <CardHeader>
            <CardTitle className="text-feminine-primary flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Community Support' : 'Suport Comunitate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Connect with other goddesses in our sacred sisterhood.' 
                : 'Conectează-te cu alte zeițe în sororitatea noastră sacrată.'}
            </p>
            <Button variant="outline" className="border-feminine-primary text-feminine-primary hover:bg-feminine-primary/10">
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Join Chat' : 'Alătură-te Chat-ului'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};