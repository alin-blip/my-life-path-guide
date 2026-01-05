import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Box, Plus, Sparkles, Download, Search, Star, Users, 
  Grid3X3, LayoutDashboard, Trash2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomWidgets } from '@/hooks/useCustomWidgets';
import { CustomWidgetRenderer } from '@/components/dashboard/widgets/CustomWidgetRenderer';
import { AIWidgetBuilder } from '@/components/dashboard/widgets/AIWidgetBuilder';
import type { WidgetTemplate } from '@/types/customWidget';
import { WIDGET_CATEGORIES } from '@/types/customWidget';
import { Layout } from '@/components/Layout';

export default function WidgetDashboard() {
  const { language } = useLanguage();
  const {
    widgets,
    templates,
    loading,
    createWidget,
    deleteWidget,
    toggleWidget,
    getWidgetData,
    saveWidgetData,
    applyTemplate,
  } = useCustomWidgets();

  const [activeTab, setActiveTab] = useState('my-widgets');
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [widgetDataMap, setWidgetDataMap] = useState<Record<string, any>>({});

  // Load widget data for all widgets
  useEffect(() => {
    const loadWidgetData = async () => {
      const dataMap: Record<string, any> = {};
      for (const widget of widgets) {
        const data = await getWidgetData(widget.id);
        if (data) {
          dataMap[widget.id] = data;
        }
      }
      setWidgetDataMap(dataMap);
    };
    
    if (widgets.length > 0) {
      loadWidgetData();
    }
  }, [widgets]);

  const handleSaveWidgetData = async (widgetId: string, data: Record<string, unknown>) => {
    await saveWidgetData(widgetId, data);
    setWidgetDataMap(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], data },
    }));
  };

  const handleToggleDashboard = async (widgetId: string, isActive: boolean) => {
    await toggleWidget(widgetId, isActive);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const officialTemplates = filteredTemplates.filter(t => t.is_official);
  const communityTemplates = filteredTemplates.filter(t => !t.is_official);

  const getCategoryLabel = (category?: string) => {
    const cat = WIDGET_CATEGORIES.find(c => c.value === category);
    return language === 'en' ? cat?.labelEn : cat?.label;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Box className="w-6 h-6 text-primary" />
              {language === 'en' ? 'Widget Dashboard' : 'Dashboard Widget-uri'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Create and manage your custom tracking widgets'
                : 'Creează și gestionează widget-urile tale personalizate'}
            </p>
          </div>
          
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Create Widget' : 'Creează Widget'}
          </Button>
        </div>

        {showBuilder && (
          <AIWidgetBuilder
            onCreateWidget={async (name, config, description) => {
              await createWidget(name, config, description);
              setShowBuilder(false);
            }}
            onCancel={() => setShowBuilder(false)}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card">
            <TabsTrigger value="my-widgets" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              {language === 'en' ? 'My Widgets' : 'Widget-urile Mele'}
              <Badge variant="secondary">{widgets.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {language === 'en' ? 'Library' : 'Bibliotecă'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-widgets" className="space-y-4">
            {widgets.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Box className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? 'No Widgets Yet' : 'Niciun Widget Încă'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' 
                      ? 'Create your first custom widget to start tracking'
                      : 'Creează primul tău widget personalizat pentru a începe tracking-ul'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowBuilder(true)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Create with AI' : 'Creează cu AI'}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('library')}>
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Browse Library' : 'Vezi Biblioteca'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget) => (
                  <div key={widget.id} className="space-y-2">
                    <CustomWidgetRenderer
                      widget={widget}
                      data={widgetDataMap[widget.id]}
                      onSaveData={(data) => handleSaveWidgetData(widget.id, data)}
                      onDelete={() => deleteWidget(widget.id)}
                    />
                    {/* Dashboard Toggle */}
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                      <Label htmlFor={`dashboard-${widget.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />
                        {language === 'en' ? 'Show on Dashboard' : 'Afișează pe Dashboard'}
                      </Label>
                      <Switch
                        id={`dashboard-${widget.id}`}
                        checked={widget.is_active}
                        onCheckedChange={(checked) => handleToggleDashboard(widget.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search templates...' : 'Caută template-uri...'}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {language === 'en' ? 'All' : 'Toate'}
              </Button>
              {WIDGET_CATEGORIES.slice(0, 4).map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {language === 'en' ? cat.labelEn : cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Official Templates */}
          {officialTemplates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {language === 'en' ? 'Official Templates' : 'Template-uri Oficiale'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officialTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    language={language}
                    getCategoryLabel={getCategoryLabel}
                    onApply={() => applyTemplate(template)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Community Templates */}
          {communityTemplates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {language === 'en' ? 'Community Templates' : 'Template-uri Comunitate'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    language={language}
                    getCategoryLabel={getCategoryLabel}
                    onApply={() => applyTemplate(template)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? 'No Templates Found' : 'Niciun Template Găsit'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? 'Try adjusting your search or create your own widget'
                    : 'Încearcă să ajustezi căutarea sau creează propriul widget'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  </Layout>
  );
}

interface TemplateCardProps {
  template: WidgetTemplate;
  language: string;
  getCategoryLabel: (category?: string) => string | undefined;
  onApply: () => void;
}

function TemplateCard({ template, language, getCategoryLabel, onApply }: TemplateCardProps) {
  return (
    <Card className="glass-card hover:border-primary/50 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          {template.is_official && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              {language === 'en' ? 'Official' : 'Oficial'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {template.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {template.category && (
            <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
          )}
          <Badge variant="outline">{template.config.type}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {template.usage_count} {language === 'en' ? 'uses' : 'utilizări'}
          </span>
          <Button size="sm" onClick={onApply}>
            <Download className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Use' : 'Folosește'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
