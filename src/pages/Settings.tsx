import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MigrationManagement } from '@/components/settings/MigrationManagement';
import { SoundSettings } from '@/components/settings/SoundSettings';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';
import { SmsPreferencesCard } from '@/components/settings/SmsPreferencesCard';
import { Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Settings: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Settings' : 'Setări'}
        </h1>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            {language === 'en' ? 'General' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="migration">
            {language === 'en' ? 'Cloud Migration' : 'Migrare Cloud'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {language === 'en' ? 'Install App' : 'Instalează Aplicația'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Install CEO Mind OS on your phone or desktop. Opens fullscreen like a native app, with quick access from your home screen.'
                  : 'Instalează CEO Mind OS pe telefon sau desktop. Se deschide fullscreen ca o aplicație nativă, cu acces rapid din ecranul de start.'}
              </p>
              <InstallAppButton />
              <p className="text-xs text-muted-foreground">
                {language === 'en'
                  ? 'Already installed? This button disappears automatically.'
                  : 'Deja instalată? Butonul dispare automat.'}
              </p>
            </CardContent>
          </Card>
          <SoundSettings />
        </TabsContent>

        <TabsContent value="migration">
          <MigrationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};