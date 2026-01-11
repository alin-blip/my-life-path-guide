import React from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LayoutGrid, FolderTree, Palette } from 'lucide-react';
import { WidgetManager } from '@/components/dashboard/settings/WidgetManager';
import { CategorySelector } from '@/components/dashboard/settings/CategorySelector';
import { LayoutOptions } from '@/components/dashboard/settings/LayoutOptions';

const DashboardSettingsPage = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            {language === 'ro' ? 'Setări Dashboard' : 'Dashboard Settings'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ro' 
              ? 'Personalizează dashboard-ul și widget-urile tale'
              : 'Customize your dashboard and widgets'}
          </p>
        </div>

        <Tabs defaultValue="widgets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widgets" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              {language === 'ro' ? 'Widget-uri' : 'Widgets'}
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              {language === 'ro' ? 'Categorii' : 'Categories'}
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {language === 'ro' ? 'Layout' : 'Layout'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="widgets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  {language === 'ro' ? 'Gestionare Widget-uri' : 'Widget Management'}
                </CardTitle>
                <CardDescription>
                  {language === 'ro'
                    ? 'Activează sau dezactivează widget-urile din dashboard. Unele widget-uri sunt fixe și nu pot fi dezactivate.'
                    : 'Enable or disable widgets on your dashboard. Some widgets are fixed and cannot be disabled.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WidgetManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  {language === 'ro' ? 'Categorii Obiective' : 'Goal Categories'}
                </CardTitle>
                <CardDescription>
                  {language === 'ro'
                    ? 'Alege între 4 categorii principale sau extinde la 12 subcategorii detaliate. Poți adăuga și categorii personalizate.'
                    : 'Choose between 4 main categories or expand to 12 detailed subcategories. You can also add custom categories.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategorySelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {language === 'ro' ? 'Opțiuni Layout' : 'Layout Options'}
                </CardTitle>
                <CardDescription>
                  {language === 'ro'
                    ? 'Personalizează aspectul și densitatea dashboard-ului.'
                    : 'Customize the appearance and density of your dashboard.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LayoutOptions />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardSettingsPage;
