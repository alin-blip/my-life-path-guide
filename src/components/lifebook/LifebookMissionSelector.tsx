import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Calendar, ArrowLeft, Save, Sparkles, ChevronDown, ChevronUp, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { LIFEBOOK_STRUCTURE, LifebookEntry, LifebookCategory } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CategoryMissions {
  annual: string;
  monthly: string;
}

interface AllMissions {
  body: CategoryMissions;
  being: CategoryMissions;
  balance: CategoryMissions;
  business: CategoryMissions;
}

interface ExtractedContent {
  category: LifebookCategory;
  categoryName: string;
  categoryNameRo: string;
  icon: string;
  visions: string[];
  strategies: string[];
  purposes: string[];
}

interface GeneratingState {
  category: LifebookCategory | null;
  type: 'annual' | 'monthly' | null;
}

const LifebookMissionSelector: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [entries, setEntries] = useState<LifebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState<GeneratingState>({ category: null, type: null });
  
  const [missions, setMissions] = useState<AllMissions>({
    body: { annual: '', monthly: '' },
    being: { annual: '', monthly: '' },
    balance: { annual: '', monthly: '' },
    business: { annual: '', monthly: '' }
  });

  useEffect(() => {
    fetchEntriesAndMissions();
  }, []);

  const fetchEntriesAndMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch lifebook entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('lifebook_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (entriesError) throw entriesError;
      
      const typedEntries = (entriesData as unknown as LifebookEntry[]) || [];
      setEntries(typedEntries);
      
      // Extract content by category
      extractContentByCategory(typedEntries);

      // Fetch existing missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', user.id)
        .in('mission_type', ['annual', 'monthly']);

      if (missionsError) throw missionsError;

      if (missionsData && missionsData.length > 0) {
        const loadedMissions: AllMissions = {
          body: { annual: '', monthly: '' },
          being: { annual: '', monthly: '' },
          balance: { annual: '', monthly: '' },
          business: { annual: '', monthly: '' }
        };

        missionsData.forEach((mission: any) => {
          const category = mission.category as LifebookCategory;
          const type = mission.mission_type as 'annual' | 'monthly';
          if (loadedMissions[category]) {
            loadedMissions[category][type] = mission.goal_data?.description || mission.title || '';
          }
        });

        setMissions(loadedMissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu s-au putut încărca datele' : 'Could not load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const extractContentByCategory = (entries: LifebookEntry[]) => {
    const extracted: ExtractedContent[] = LIFEBOOK_STRUCTURE.map(category => {
      const categoryEntries = entries.filter(e => e.category === category.key);
      
      return {
        category: category.key,
        categoryName: category.name,
        categoryNameRo: category.nameRo,
        icon: category.icon,
        visions: categoryEntries
          .filter(e => e.section === 'vision' && e.summary)
          .map(e => e.summary!)
          .filter(s => s.length > 0),
        strategies: categoryEntries
          .filter(e => e.section === 'strategy' && e.summary)
          .map(e => e.summary!)
          .filter(s => s.length > 0),
        purposes: categoryEntries
          .filter(e => e.section === 'purpose' && e.summary)
          .map(e => e.summary!)
          .filter(s => s.length > 0)
      };
    });

    setExtractedContent(extracted);
  };

  const handleMissionChange = (category: LifebookCategory, type: 'annual' | 'monthly', value: string) => {
    setMissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const generateAISuggestion = async (category: LifebookCategory, missionType: 'annual' | 'monthly') => {
    const extracted = extractedContent.find(e => e.category === category);
    
    if (!extracted || (extracted.visions.length === 0 && extracted.strategies.length === 0 && extracted.purposes.length === 0)) {
      toast({
        title: language === 'ro' ? 'Conținut insuficient' : 'Insufficient content',
        description: language === 'ro' 
          ? 'Completează mai întâi secțiunile din Life Book pentru această categorie' 
          : 'Complete Life Book sections for this category first',
        variant: 'destructive'
      });
      return;
    }

    setGenerating({ category, type: missionType });

    try {
      const { data, error } = await supabase.functions.invoke('lifebook-mission-suggest', {
        body: {
          category,
          visions: extracted.visions,
          strategies: extracted.strategies,
          purposes: extracted.purposes,
          missionType,
          language
        }
      });

      if (error) throw error;

      if (data?.suggestion) {
        handleMissionChange(category, missionType, data.suggestion);
        toast({
          title: language === 'ro' ? 'Sugestie generată!' : 'Suggestion generated!',
          description: language === 'ro' 
            ? 'Poți edita obiectivul sugerat după preferințe' 
            : 'You can edit the suggested objective as you prefer'
        });
      }
    } catch (error: unknown) {
      console.error('Error generating suggestion:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: message || (language === 'ro' ? 'Nu s-a putut genera sugestia' : 'Could not generate suggestion'),
        variant: 'destructive'
      });
    } finally {
      setGenerating({ category: null, type: null });
    }
  };

  const generateAllSuggestions = async () => {
    const categories: LifebookCategory[] = ['body', 'being', 'balance', 'business'];
    
    for (const category of categories) {
      const extracted = extractedContent.find(e => e.category === category);
      if (extracted && (extracted.visions.length > 0 || extracted.strategies.length > 0 || extracted.purposes.length > 0)) {
        await generateAISuggestion(category, 'annual');
        await generateAISuggestion(category, 'monthly');
      }
    }
  };

  const saveMissions = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const missionRecords: any[] = [];
      const categories: LifebookCategory[] = ['body', 'being', 'balance', 'business'];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });

      for (const category of categories) {
        // Annual mission
        if (missions[category].annual.trim()) {
          missionRecords.push({
            user_id: user.id,
            category,
            mission_type: 'annual',
            title: `${category} - Annual ${currentYear}`,
            goal_data: { description: missions[category].annual },
            period: `${currentYear}`,
            is_impossible_game: false,
            completed: false
          });
        }

        // Monthly mission
        if (missions[category].monthly.trim()) {
          missionRecords.push({
            user_id: user.id,
            category,
            mission_type: 'monthly',
            title: `${category} - ${currentMonth} ${currentYear}`,
            goal_data: { description: missions[category].monthly },
            period: `${currentMonth} ${currentYear}`,
            is_impossible_game: false,
            completed: false
          });
        }
      }

      // Delete existing missions and insert new ones
      await supabase
        .from('missions')
        .delete()
        .eq('user_id', user.id)
        .in('mission_type', ['annual', 'monthly']);

      if (missionRecords.length > 0) {
        const { error } = await supabase
          .from('missions')
          .insert(missionRecords);

        if (error) throw error;
      }

      toast({
        title: language === 'ro' ? 'Salvat!' : 'Saved!',
        description: language === 'ro' 
          ? 'Obiectivele tale au fost salvate cu succes' 
          : 'Your objectives have been saved successfully'
      });

      navigate('/lifebook');
    } catch (error) {
      console.error('Error saving missions:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu s-au putut salva obiectivele' : 'Could not save objectives',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: LifebookCategory): string => {
    const categoryInfo = LIFEBOOK_STRUCTURE.find(c => c.key === category);
    return language === 'ro' ? categoryInfo?.nameRo || '' : categoryInfo?.name || '';
  };

  const getCategoryIcon = (category: LifebookCategory): string => {
    const categoryInfo = LIFEBOOK_STRUCTURE.find(c => c.key === category);
    return categoryInfo?.icon || '📌';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {language === 'ro' ? 'Se încarcă...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const totalProgress = entries.length;
  const isComplete = totalProgress >= 60; // 12 subcategories × 5 sections

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4 gap-2"
            onClick={() => navigate('/lifebook')}
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ro' ? 'Înapoi la Life Book' : 'Back to Life Book'}
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ro' ? 'Definește-ți Obiectivele' : 'Define Your Objectives'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'ro' 
              ? 'Pe baza Life Book-ului tău, alege obiectivele anuale și lunare pentru fiecare arie a vieții' 
              : 'Based on your Life Book, choose annual and monthly objectives for each life area'}
          </p>
        </div>

        {/* AI Generate All Button */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">
                {language === 'ro' 
                  ? 'Lasă AI-ul să analizeze Life Book-ul și să sugereze obiective pentru toate categoriile' 
                  : 'Let AI analyze your Life Book and suggest objectives for all categories'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={generateAllSuggestions}
              disabled={generating.category !== null}
            >
              {generating.category !== null ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {language === 'ro' ? 'Generează Toate' : 'Generate All'}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Warning */}
        {!isComplete && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-4">
              <p className="text-yellow-500 text-sm">
                ⚠️ {language === 'ro' 
                  ? `Ai completat ${totalProgress} din 60 secțiuni. Completează toate secțiunile pentru a avea conținut complet din care să alegi.`
                  : `You've completed ${totalProgress} of 60 sections. Complete all sections to have full content to choose from.`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mission Cards by Category */}
        <div className="space-y-6">
          {(['body', 'being', 'balance', 'business'] as LifebookCategory[]).map(category => {
            const extracted = extractedContent.find(e => e.category === category);
            const hasContent = extracted && (extracted.visions.length > 0 || extracted.strategies.length > 0 || extracted.purposes.length > 0);
            
            return (
              <Card key={category} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span>{getCategoryLabel(category)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Extracted Content Collapsible */}
                  {hasContent && (
                    <Collapsible 
                      open={expandedCategories[category]} 
                      onOpenChange={() => toggleCategory(category)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between gap-2 mb-4">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            {language === 'ro' ? 'Vezi conținutul din Life Book' : 'View Life Book content'}
                          </span>
                          {expandedCategories[category] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4">
                        {extracted?.visions.length > 0 && (
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              👁️ {language === 'ro' ? 'Viziuni' : 'Visions'}
                            </Badge>
                            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                              {extracted.visions.map((v, i) => (
                                <p key={i} className="text-sm text-muted-foreground">{v}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {extracted?.purposes.length > 0 && (
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              🎯 {language === 'ro' ? 'Scopuri' : 'Purposes'}
                            </Badge>
                            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                              {extracted.purposes.map((p, i) => (
                                <p key={i} className="text-sm text-muted-foreground">{p}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {extracted?.strategies.length > 0 && (
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              📋 {language === 'ro' ? 'Strategii' : 'Strategies'}
                            </Badge>
                            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                              {extracted.strategies.map((s, i) => (
                                <p key={i} className="text-sm text-muted-foreground">{s}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Mission Inputs */}
                  <Tabs defaultValue="annual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="annual" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {language === 'ro' ? 'Obiectiv Anual' : 'Annual Objective'}
                      </TabsTrigger>
                      <TabsTrigger value="monthly" className="gap-2">
                        <Target className="w-4 h-4" />
                        {language === 'ro' ? 'Obiectiv Lunar' : 'Monthly Objective'}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="annual" className="mt-4 space-y-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-primary hover:text-primary"
                          onClick={() => generateAISuggestion(category, 'annual')}
                          disabled={generating.category === category && generating.type === 'annual'}
                        >
                          {generating.category === category && generating.type === 'annual' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                          {language === 'ro' ? 'Sugestie AI' : 'AI Suggestion'}
                        </Button>
                      </div>
                      <Textarea
                        placeholder={language === 'ro' 
                          ? `Care este obiectivul tău anual pentru ${getCategoryLabel(category)}?`
                          : `What is your annual objective for ${getCategoryLabel(category)}?`}
                        value={missions[category].annual}
                        onChange={(e) => handleMissionChange(category, 'annual', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </TabsContent>
                    <TabsContent value="monthly" className="mt-4 space-y-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-primary hover:text-primary"
                          onClick={() => generateAISuggestion(category, 'monthly')}
                          disabled={generating.category === category && generating.type === 'monthly'}
                        >
                          {generating.category === category && generating.type === 'monthly' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                          {language === 'ro' ? 'Sugestie AI' : 'AI Suggestion'}
                        </Button>
                      </div>
                      <Textarea
                        placeholder={language === 'ro' 
                          ? `Care este obiectivul tău lunar pentru ${getCategoryLabel(category)}?`
                          : `What is your monthly objective for ${getCategoryLabel(category)}?`}
                        value={missions[category].monthly}
                        onChange={(e) => handleMissionChange(category, 'monthly', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={saveMissions}
            disabled={saving}
          >
            <Save className="w-5 h-5" />
            {saving 
              ? (language === 'ro' ? 'Se salvează...' : 'Saving...')
              : (language === 'ro' ? 'Salvează Obiectivele' : 'Save Objectives')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LifebookMissionSelector;
