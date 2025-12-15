import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';
import { LIFEBOOK_STRUCTURE, SECTIONS, LifebookSubcategory, LifebookEntry } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

const LifebookDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [entries, setEntries] = useState<LifebookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lifebook_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEntries((data as unknown as LifebookEntry[]) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoryProgress = (subcategory: LifebookSubcategory): number => {
    const completedSections = entries.filter(
      e => e.subcategory === subcategory && e.status === 'completed'
    ).length;
    return (completedSections / SECTIONS.length) * 100;
  };

  const getCategoryProgress = (subcategories: { key: LifebookSubcategory }[]): number => {
    const totalSections = subcategories.length * SECTIONS.length;
    const completedSections = subcategories.reduce((acc, sub) => {
      return acc + entries.filter(
        e => e.subcategory === sub.key && e.status === 'completed'
      ).length;
    }, 0);
    return totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  };

  const handleSubcategoryClick = (subcategory: LifebookSubcategory) => {
    navigate(`/lifebook/${subcategory}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ro' ? 'Have It All - My Life Book' : 'Have It All - My Life Book'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'ro' 
              ? 'Construiește-ți viziunea completă a vieții în cele 12 categorii fundamentale' 
              : 'Build your complete life vision across 12 fundamental categories'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LIFEBOOK_STRUCTURE.map((category) => (
            <Card key={category.key} className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span>{language === 'ro' ? category.nameRo : category.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(getCategoryProgress(category.subcategories))}%
                  </span>
                </CardTitle>
                <Progress 
                  value={getCategoryProgress(category.subcategories)} 
                  className="h-2"
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {category.subcategories.map((sub) => {
                  const progress = getSubcategoryProgress(sub.key);
                  return (
                    <Button
                      key={sub.key}
                      variant="ghost"
                      className="w-full justify-between h-auto py-3 px-4 hover:bg-accent/50"
                      onClick={() => handleSubcategoryClick(sub.key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{sub.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">
                            {language === 'ro' ? sub.nameRo : sub.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(progress)}% {language === 'ro' ? 'complet' : 'complete'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-20 h-2" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => navigate('/lifebook/export')}
          >
            <BookOpen className="w-5 h-5" />
            {language === 'ro' ? 'Exportă Life Book (PDF)' : 'Export Life Book (PDF)'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LifebookDashboard;
