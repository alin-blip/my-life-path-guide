import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, Loader2 } from 'lucide-react';
import { MeditationTemplate, MEDITATION_CATEGORIES } from './meditationTemplates';
import { cn } from '@/lib/utils';

interface MeditationTemplateCardProps {
  template: MeditationTemplate;
  onGenerate: (template: MeditationTemplate) => void;
  isGenerating?: boolean;
  generatingId?: string;
}

export function MeditationTemplateCard({ 
  template, 
  onGenerate, 
  isGenerating,
  generatingId 
}: MeditationTemplateCardProps) {
  const category = MEDITATION_CATEGORIES[template.category];
  const isThisGenerating = isGenerating && generatingId === template.id;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon with gradient background */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
            "bg-gradient-to-br",
            category.color,
            "shadow-lg"
          )}>
            {template.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {template.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{template.duration} min</span>
              </div>
              
              <Button
                size="sm"
                onClick={() => onGenerate(template)}
                disabled={isGenerating}
                className={cn(
                  "h-8 gap-1.5",
                  "bg-gradient-to-r",
                  category.color,
                  "hover:opacity-90 text-white border-0"
                )}
              >
                {isThisGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generez...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generează</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
