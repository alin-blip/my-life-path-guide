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
  Grid3X3, LayoutDashboard, Trash2, Crown, Lock, Check
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomWidgets } from '@/hooks/useCustomWidgets';
import { CustomWidgetRenderer } from '@/components/dashboard/widgets/CustomWidgetRenderer';
import { AIWidgetBuilder } from '@/components/dashboard/widgets/AIWidgetBuilder';
import type { WidgetTemplate } from '@/types/customWidget';
import { WIDGET_CATEGORIES } from '@/types/customWidget';
import { Layout } from '@/components/Layout';
import { AVAILABLE_WIDGETS } from '@/config/dashboardWidgets';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function WidgetDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
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

  const { 
    widgets: dashboardWidgets, 
    toggleWidget: toggleDashboardWidget 
  } = useDashboardWidgets();

  const [activeTab, setActiveTab] = useState('my-widgets');
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [widgetDataMap, setWidgetDataMap] = useState<Record<string, any>>({});
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);

  // Check user's premium access
  useEffect(() => {
    const checkPremiumAccess = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_widget_purchases')
        .select('template_id, has_full_access')
        .eq('user_id', user.id);
      
      if (!error && data) {
        const fullAccess = data.some(p => p.has_full_access);
        setHasFullAccess(fullAccess);
        
        const purchased = data
          .filter(p => p.template_id)
          .map(p => p.template_id as string);
        setPurchasedTemplates(purchased);
      }
    };
    
    checkPremiumAccess();
  }, [user]);

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

  const canAccessPremium = (templateId: string) => {
    return hasFullAccess || purchasedTemplates.includes(templateId);
  };

  const handleApplyTemplate = async (template: WidgetTemplate) => {
    if (template.is_premium && !canAccessPremium(template.id)) {
      toast.info(language === 'en' 
        ? `Premium widget - ${template.price} RON` 
        : `Widget premium - ${template.price} RON`);
      return;
    }
    const result = await applyTemplate(template);
    if (result) {
      toast.success(language === 'en' 
        ? 'Widget added to My Widgets!' 
        : 'Widget adăugat la Widget-urile Mele!');
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const freeTemplates = filteredTemplates.filter(t => !t.is_premium);
  const premiumTemplates = filteredTemplates.filter(t => t.is_premium);

  const getCategoryLabel = (category?: string) => {
    const cat = WIDGET_CATEGORIES.find(c => c.value === category);
    return language === 'en' ? cat?.labelEn : cat?.label;
  };

  const isBuiltInWidgetEnabled = (widgetId: string) => {
    return dashboardWidgets.find(w => w.id === widgetId)?.enabled ?? false;
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
                  placeholder={language === 'en' ? 'Search widgets...' : 'Caută widget-uri...'}
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

            {/* Built-in Dashboard Widgets */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                {language === 'en' ? 'Dashboard Widgets' : 'Widget-uri Dashboard'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_WIDGETS.map((widget) => {
                  const IconComponent = (LucideIcons as any)[widget.icon] || Box;
                  const isEnabled = isBuiltInWidgetEnabled(widget.id);
                  return (
                    <Card key={widget.id} className={`glass-card transition-colors ${isEnabled ? 'border-primary/50' : ''}`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <CardTitle className="text-base">
                              {language === 'en' ? widget.name.en : widget.name.ro}
                            </CardTitle>
                          </div>
                          {isEnabled && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              {language === 'en' ? 'Active' : 'Activ'}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {language === 'en' ? widget.description.en : widget.description.ro}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{widget.category}</Badge>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => toggleDashboardWidget(widget.id, checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Free Templates */}
            {freeTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {language === 'en' ? 'Free Templates' : 'Template-uri Gratuite'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freeTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      language={language}
                      getCategoryLabel={getCategoryLabel}
                      onApply={() => handleApplyTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Premium Templates */}
            {premiumTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  {language === 'en' ? 'Premium Templates' : 'Template-uri Premium'}
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">PRO</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {premiumTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      language={language}
                      getCategoryLabel={getCategoryLabel}
                      onApply={() => handleApplyTemplate(template)}
                      isPremium
                      hasAccess={canAccessPremium(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTemplates.length === 0 && AVAILABLE_WIDGETS.length === 0 && (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? 'No Widgets Found' : 'Niciun Widget Găsit'}
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
  isPremium?: boolean;
  hasAccess?: boolean;
}

function TemplateCard({ template, language, getCategoryLabel, onApply, isPremium, hasAccess }: TemplateCardProps) {
  const unlocked = hasAccess || !isPremium;
  
  return (
    <Card className={`glass-card hover:border-primary/50 transition-colors relative overflow-hidden ${isPremium && !hasAccess ? 'border-yellow-500/30' : ''} ${hasAccess ? 'border-green-500/30' : ''}`}>
      {isPremium && !hasAccess && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
          {template.price} RON
        </div>
      )}
      {isPremium && hasAccess && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
          <Check className="w-3 h-3" />
          {language === 'en' ? 'Unlocked' : 'Deblocat'}
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
            {template.name}
          </CardTitle>
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
          <Button 
            size="sm" 
            onClick={onApply}
            variant={unlocked ? 'default' : 'outline'}
            className={!unlocked ? 'border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10' : ''}
          >
            {unlocked ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Add' : 'Adaugă'}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Unlock' : 'Deblochează'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
