import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MigrationManagement } from '@/components/settings/MigrationManagement';
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
      
      <Tabs defaultValue="migration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="migration">
            {language === 'en' ? 'Cloud Migration' : 'Migrare Cloud'}
          </TabsTrigger>
          <TabsTrigger value="general">
            {language === 'en' ? 'General' : 'General'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="migration">
          <MigrationManagement />
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'General Settings' : 'Setări Generale'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {language === 'en' ? 'General settings coming soon.' : 'Setări generale în curând.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};