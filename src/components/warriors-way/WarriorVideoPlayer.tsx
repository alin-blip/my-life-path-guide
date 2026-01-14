import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, CheckCircle2, ChevronLeft, ChevronRight, Play, Target, Lightbulb, ArrowUp } from 'lucide-react';
import { getModuleData } from '@/data/warriorsWayModuleData';
import { ModuleComments } from './ModuleComments';
import { cn } from '@/lib/utils';

interface WarriorVideoPlayerProps {
  moduleId: string;
  moduleTitle?: string;
  moduleOrder?: number;
  onClose: () => void;
  onComplete: () => void;
  videoUrl?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const WarriorVideoPlayer: React.FC<WarriorVideoPlayerProps> = ({
  moduleId,
  moduleTitle,
  moduleOrder,
  onClose,
  onComplete,
  videoUrl,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const moduleData = getModuleData(moduleId);
  const hasVideo = !!videoUrl;

  const handleMarkComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {moduleOrder && (
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm font-medium">
                  Modul {moduleOrder}/42
                </span>
              )}
              <DialogTitle className="text-lg">
                {moduleTitle || 'Vizionare Modul'}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Video Section */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {hasVideo ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center text-white/70 p-8">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Video în curs de adăugare</p>
                  <p className="text-sm text-white/50">
                    Acest modul va fi disponibil în curând.
                  </p>
                </div>
              )}
            </div>

            {/* Call to Action - Watch Video */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <ArrowUp className="h-5 w-5 text-amber-500 animate-bounce" />
              <span className="text-amber-500 font-medium">
                ⬆️ Vizionează video-ul de mai sus!
              </span>
              <ArrowUp className="h-5 w-5 text-amber-500 animate-bounce" />
            </div>

            {/* Module Description */}
            {moduleData && (
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      {moduleData.description}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <h4 className="font-semibold">Ce vei învăța:</h4>
                    </div>
                    <ul className="space-y-2 pl-7">
                      {moduleData.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Prompt */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-500 mb-1">🎯 Acțiune recomandată:</h4>
                        <p className="text-sm text-muted-foreground">
                          {moduleData.actionPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <ModuleComments moduleId={moduleId} />
          </div>
        </ScrollArea>

        {/* Footer with navigation */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!hasPrevious}
              onClick={onPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!hasNext}
              onClick={onNext}
            >
              Următor
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Button 
            onClick={handleMarkComplete} 
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Marchează ca finalizat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
