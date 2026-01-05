import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Download, Search, Star, Users, Calendar,
  Dumbbell, Trophy, Target, Flame
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { WorkoutTemplate } from '@/types/workout';
import { WORKOUT_CATEGORIES, DIFFICULTY_LEVELS, DAYS_OF_WEEK } from '@/types/workout';

interface WorkoutTemplateLibraryProps {
  templates: WorkoutTemplate[];
  onApplyTemplate: (template: WorkoutTemplate) => void;
}

export function WorkoutTemplateLibrary({
  templates,
  onApplyTemplate,
}: WorkoutTemplateLibraryProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WorkoutTemplate | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const officialTemplates = filteredTemplates.filter(t => t.is_official);
  const communityTemplates = filteredTemplates.filter(t => !t.is_official);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'hypertrophy': return <Trophy className="w-4 h-4" />;
      case 'weight_loss': return <Flame className="w-4 h-4" />;
      case 'endurance': return <Target className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    const cat = WORKOUT_CATEGORIES.find(c => c.value === category);
    return language === 'en' ? cat?.labelEn : cat?.label;
  };

  const getDifficultyLabel = (difficulty?: string) => {
    const diff = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
    return language === 'en' ? diff?.labelEn : diff?.label;
  };

  const renderTemplateCard = (template: WorkoutTemplate) => (
    <Card 
      key={template.id} 
      className="glass-card hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => setPreviewTemplate(template)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(template.category)}
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
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
            <Badge variant="outline">
              {getCategoryLabel(template.category)}
            </Badge>
          )}
          {template.difficulty && (
            <Badge variant="outline">
              {getDifficultyLabel(template.difficulty)}
            </Badge>
          )}
          {template.days_per_week && (
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              {template.days_per_week} {language === 'en' ? 'days/week' : 'zile/săpt'}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {template.usage_count} {language === 'en' ? 'uses' : 'utilizări'}
          </span>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onApplyTemplate(template);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Use' : 'Folosește'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
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
          {WORKOUT_CATEGORIES.slice(0, 4).map((cat) => (
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
            {officialTemplates.map(renderTemplateCard)}
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
            {communityTemplates.map(renderTemplateCard)}
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
                ? 'Try adjusting your search or filters'
                : 'Încearcă să ajustezi căutarea sau filtrele'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getCategoryIcon(previewTemplate?.category)}
              {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.description && (
                <p className="text-muted-foreground">{previewTemplate.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {previewTemplate.category && (
                  <Badge>{getCategoryLabel(previewTemplate.category)}</Badge>
                )}
                {previewTemplate.difficulty && (
                  <Badge variant="outline">{getDifficultyLabel(previewTemplate.difficulty)}</Badge>
                )}
                {previewTemplate.days_per_week && (
                  <Badge variant="outline">
                    {previewTemplate.days_per_week} {language === 'en' ? 'days/week' : 'zile/săpt'}
                  </Badge>
                )}
              </div>

              {/* Preview Schedule */}
              {previewTemplate.program_data && (
                <div className="grid grid-cols-7 gap-2 mt-4">
                  {(previewTemplate.program_data as any).days?.map((day: any, index: number) => {
                    const dayInfo = DAYS_OF_WEEK.find(d => d.value === day.day_of_week);
                    return (
                      <div key={index} className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-xs font-medium mb-1">
                          {language === 'en' ? dayInfo?.shortEn : dayInfo?.short}
                        </div>
                        {day.is_rest_day ? (
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Rest' : 'Odihnă'}
                          </span>
                        ) : (
                          <div className="text-xs">
                            <span className="font-medium">{day.exercises?.length || 0}</span>
                            <span className="text-muted-foreground ml-1">ex.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </Button>
            <Button onClick={() => {
              if (previewTemplate) {
                onApplyTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Apply Template' : 'Aplică Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
