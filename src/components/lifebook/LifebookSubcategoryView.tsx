import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, ChevronRight, Play } from 'lucide-react';
import { 
  SECTIONS, 
  LifebookSubcategory, 
  LifebookSection, 
  LifebookEntry,
  getSubcategoryInfo,
  getCategoryForSubcategory 
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

const LifebookSubcategoryView: React.FC = () => {
  const { subcategory } = useParams<{ subcategory: LifebookSubcategory }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [entries, setEntries] = useState<LifebookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const subcategoryInfo = subcategory ? getSubcategoryInfo(subcategory as LifebookSubcategory) : undefined;
  const categoryInfo = subcategory ? getCategoryForSubcategory(subcategory as LifebookSubcategory) : undefined;

  useEffect(() => {
    if (subcategory) {
      fetchEntries();
    }
  }, [subcategory]);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lifebook_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('subcategory', subcategory);

      if (error) throw error;
      setEntries((data as unknown as LifebookEntry[]) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionStatus = (section: LifebookSection): 'completed' | 'in_progress' | 'not_started' => {
    const entry = entries.find(e => e.section === section);
    if (!entry) return 'not_started';
    return entry.status as 'completed' | 'in_progress';
  };

  const getNextSection = (): LifebookSection | null => {
    for (const section of SECTIONS) {
      const status = getSectionStatus(section.key);
      if (status !== 'completed') {
        return section.key;
      }
    }
    return null;
  };

  const handleSectionClick = (section: LifebookSection) => {
    navigate(`/lifebook/${subcategory}/${section}`);
  };

  const handleStartNext = () => {
    const nextSection = getNextSection();
    if (nextSection) {
      navigate(`/lifebook/${subcategory}/${nextSection}`);
    }
  };

  const completedCount = entries.filter(e => e.status === 'completed').length;
  const progress = (completedCount / SECTIONS.length) * 100;

  if (!subcategoryInfo || !categoryInfo) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Subcategory not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate('/lifebook')}
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ro' ? 'Înapoi la Dashboard' : 'Back to Dashboard'}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{subcategoryInfo.icon}</span>
            <div>
              <p className="text-sm text-muted-foreground">
                {categoryInfo.icon} {language === 'ro' ? categoryInfo.nameRo : categoryInfo.name}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {language === 'ro' ? subcategoryInfo.nameRo : subcategoryInfo.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Progress value={progress} className="flex-1 h-3" />
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{SECTIONS.length}
            </span>
          </div>
        </div>

        {/* Start Button */}
        {getNextSection() && (
          <Button 
            size="lg" 
            className="w-full mb-6 gap-2"
            onClick={handleStartNext}
          >
            <Play className="w-5 h-5" />
            {language === 'ro' 
              ? `Continuă cu ${SECTIONS.find(s => s.key === getNextSection())?.nameRo}` 
              : `Continue with ${SECTIONS.find(s => s.key === getNextSection())?.name}`}
          </Button>
        )}

        {/* Sections List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>
              {language === 'ro' ? 'Secțiuni' : 'Sections'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SECTIONS.map((section, index) => {
              const status = getSectionStatus(section.key);
              const entry = entries.find(e => e.section === section.key);
              
              return (
                <Button
                  key={section.key}
                  variant="ghost"
                  className="w-full justify-between h-auto py-4 px-4 hover:bg-accent/50"
                  onClick={() => handleSectionClick(section.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      status === 'completed' 
                        ? 'bg-green-500/20 text-green-500' 
                        : status === 'in_progress'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {status === 'completed' ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>{section.icon}</span>
                        <span>{language === 'ro' ? section.nameRo : section.name}</span>
                      </div>
                      {entry?.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {entry.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifebookSubcategoryView;
