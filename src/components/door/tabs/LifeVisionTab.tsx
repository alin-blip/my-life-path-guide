import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Dumbbell, Brain, Heart, Briefcase, BookOpen, ExternalLink, Sparkles, ChevronRight, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoalWizardModal } from '@/components/goal-wizard/GoalWizardModal';
import { GoalCategory } from '@/types/goalWizard';

interface LifebookEntry {
  category: string;
  subcategory: string;
  section: string;
  summary: string | null;
  content: any;
}

interface CategorySummary {
  category: string;
  vision: string | null;
  purpose: string | null;
  strategy: string | null;
  hasContent: boolean;
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-600 to-emerald-400'
  },
  being: {
    icon: Brain,
    label: { en: 'Mind & Spirit', ro: 'Minte & Spirit' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-600 to-purple-400'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-600 to-rose-400'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business & Career', ro: 'Business & Carieră' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-600 to-blue-400'
  }
};

export const LifeVisionTab: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Goal Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<GoalCategory>('body');

  useEffect(() => {
    const fetchLifebookSummaries = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('lifebook_entries')
          .select('category, subcategory, section, summary, content')
          .eq('user_id', session.session.user.id);

        if (error) throw error;

        // Group by category and extract vision/purpose/strategy
        const categoryMap = new Map<string, CategorySummary>();
        
        (data || []).forEach((entry: LifebookEntry) => {
          const cat = entry.category;
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              category: cat,
              vision: null,
              purpose: null,
              strategy: null,
              hasContent: false
            });
          }
          
          const summary = categoryMap.get(cat)!;
          summary.hasContent = true;
          
          if (entry.section === 'vision' && entry.summary) {
            summary.vision = entry.summary;
          } else if (entry.section === 'purpose' && entry.summary) {
            summary.purpose = entry.summary;
          } else if (entry.section === 'strategy' && entry.summary) {
            summary.strategy = entry.summary;
          }
        });

        setSummaries(Array.from(categoryMap.values()));
      } catch (error) {
        console.error('Error fetching lifebook summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifebookSummaries();
  }, []);

  const getCategorySummary = (category: string): CategorySummary | undefined => {
    return summaries.find(s => s.category === category);
  };

  const handleCreateObjective = (category: GoalCategory) => {
    setWizardCategory(category);
    setWizardOpen(true);
  };

  const handleGoToAnnual = () => {
    setSearchParams({ tab: 'annual' }, { replace: true });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyContent = summaries.length > 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Compass className="w-6 h-6 text-goddess-gold" />
              {language === 'en' ? 'Life Vision' : 'Viziune de Viață'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Your 5-10 year vision across all life areas' 
                : 'Viziunea ta pe 5-10 ani în toate ariile vieții'}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/lifebook')} className="gap-2">
            <BookOpen className="w-4 h-4" />
            {language === 'en' ? 'Edit in LifeBook' : 'Editează în LifeBook'}
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Flow Indicator */}
      <Card className="mb-8 bg-gradient-to-r from-goddess-gold/10 to-primary/10 border-goddess-gold/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <Badge variant="default" className="bg-goddess-gold text-black">
              <Compass className="w-3 h-3 mr-1" />
              {language === 'en' ? 'Life Vision' : 'Viziune Viață'}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={handleGoToAnnual}>
              {language === 'en' ? 'Annual Goals' : 'Obiective Anuale'}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">90 {language === 'en' ? 'Days' : 'Zile'}</Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">{language === 'en' ? 'Monthly' : 'Lunar'}</Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">{language === 'en' ? 'Weekly' : 'Săpt.'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      {!hasAnyContent ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <Compass className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'en' ? 'Start Your Life Vision' : 'Începe-ți Viziunea Vieții'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'en' 
                ? 'Define your long-term vision across all areas of life to guide your annual goals' 
                : 'Definește-ți viziunea pe termen lung în toate ariile vieții pentru a-ți ghida obiectivele anuale'}
            </p>
            <Button onClick={() => navigate('/lifebook')} className="gap-2">
              <BookOpen className="w-4 h-4" />
              {language === 'en' ? 'Open LifeBook' : 'Deschide LifeBook'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const summary = getCategorySummary(key);
            const Icon = config.icon;
            const hasData = summary?.hasContent;

            return (
              <Card 
                key={key} 
                className={cn(
                  "overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
                  config.borderColor,
                  !hasData && 'border-dashed opacity-60'
                )}
              >
                <div className={cn("h-2 bg-gradient-to-r", config.gradient)} />
                
                <CardHeader className={cn(config.bgColor, "pb-3")}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <CardTitle className="text-lg">
                      {config.label[language === 'en' ? 'en' : 'ro']}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {hasData ? (
                    <>
                      {summary?.vision && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                            {language === 'en' ? 'Vision' : 'Viziune'}
                          </p>
                          <p className="text-sm text-foreground line-clamp-2">{summary.vision}</p>
                        </div>
                      )}
                      
                      {summary?.purpose && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            {language === 'en' ? 'Purpose: ' : 'Scop: '}
                          </span>
                          <span className="text-foreground line-clamp-1">{summary.purpose}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleCreateObjective(key as GoalCategory)}
                        >
                          <Target className="w-3 h-3" />
                          {language === 'en' ? 'Create Annual Goal' : 'Creează Obiectiv Anual'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'en' ? 'No vision defined yet' : 'Nicio viziune definită încă'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/lifebook')}
                      >
                        {language === 'en' ? 'Define Vision' : 'Definește Viziunea'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Wizard Modal */}
      <GoalWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        category={wizardCategory}
        missionType="annual"
        period={`${new Date().getFullYear()}`}
        onComplete={() => {
          setWizardOpen(false);
          // Dispatch event to refresh annual tab
          window.dispatchEvent(new CustomEvent('annualGoalsUpdated'));
        }}
      />
    </div>
  );
};
