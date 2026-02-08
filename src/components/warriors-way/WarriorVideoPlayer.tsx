import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ChevronLeft, ChevronRight, Play, Target, Lightbulb, ArrowUp, Zap, Plus, Loader2, MessageCircle, Check, ArrowLeft } from 'lucide-react';
import { ModuleComments, ModuleCommentsRef } from './ModuleComments';
import { useWarriorsLessonContent } from '@/hooks/useWarriorsLessonContent';
import { useWarriorsActionCompletions } from '@/hooks/useWarriorsActionCompletions';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Action prompt types
interface ActionPromptObject {
  text: string;
  type: 'reflection' | 'task';
  prompt?: string;
  destination?: 'todo' | 'stack';
}

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
  const { content, isLoading } = useWarriorsLessonContent(moduleId);
  const { completedActions, markActionCompleted, isCompleted } = useWarriorsActionCompletions(moduleId);
  const { captureIdea } = useStackTodoIntegration();
  const commentsRef = useRef<ModuleCommentsRef>(null);
  const hasVideo = !!videoUrl;

  const handleMarkComplete = async () => {
    await onComplete();
  };

  const parseActionPrompts = (prompts: unknown): ActionPromptObject[] => {
    if (!prompts || !Array.isArray(prompts)) return [];
    return prompts.map((prompt) => {
      if (typeof prompt === 'string') {
        return { text: prompt, type: 'task' as const, destination: 'todo' as const };
      }
      return prompt as ActionPromptObject;
    });
  };

  const handleActionClick = async (action: ActionPromptObject, index: number) => {
    await markActionCompleted(index);
    if (action.type === 'reflection') {
      if (commentsRef.current && action.prompt) {
        commentsRef.current.appendAndFocus(action.prompt);
      } else if (commentsRef.current) {
        commentsRef.current.scrollIntoView();
      }
      toast.success('💭 Reflectează și împărtășește!', { description: 'Continuă să scrii mai jos' });
    } else {
      captureIdea(action.text, 'hit', 'none');
      toast.success('✅ Adăugat în To Do!', {
        description: action.text.substring(0, 50) + (action.text.length > 50 ? '...' : '')
      });
    }
  };

  const keyConcepts = content?.key_concepts || [];
  const actionPrompts = parseActionPrompts(content?.action_prompts);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Înapoi</span>
            </Button>
            {moduleOrder && (
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm font-medium">
                Modul {moduleOrder}/42
              </span>
            )}
            <h2 className="text-lg font-semibold">{moduleTitle || 'Vizionare Modul'}</h2>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
                <p className="text-sm text-white/50">Acest modul va fi disponibil în curând.</p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <ArrowUp className="h-5 w-5 text-amber-500 animate-bounce" />
            <span className="text-amber-500 font-medium">⬆️ Vizionează video-ul de mai sus!</span>
            <ArrowUp className="h-5 w-5 text-amber-500 animate-bounce" />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          )}

          {/* Content */}
          {content && !isLoading && (
            <>
              {content.summary && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">{content.summary}</p>
                  </CardContent>
                </Card>
              )}

              {content.aha_moment && (
                <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-amber-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-yellow-500/20">
                        <Zap className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-500 mb-2">💡 Aha Moment</h4>
                        <p className="text-foreground italic leading-relaxed">"{content.aha_moment}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {keyConcepts.length > 0 && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <h4 className="font-semibold">Ce vei învăța:</h4>
                    </div>
                    <ul className="space-y-2 pl-7">
                      {keyConcepts.map((concept: string | { title: string; description?: string }, index: number) => {
                        const conceptText = typeof concept === 'string' ? concept : concept.title || '';
                        const conceptDescription = typeof concept === 'object' && concept.description ? concept.description : null;
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-sm text-foreground font-medium">{conceptText}</span>
                              {conceptDescription && (
                                <p className="text-xs text-muted-foreground mt-0.5">{conceptDescription}</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {actionPrompts.length > 0 && (
                <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" />
                      <h4 className="font-semibold text-amber-500">🎯 Acțiuni Recomandate:</h4>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">
                      În comentariu mai jos - reflectează și contribuie în comunitate
                    </p>
                    <div className="space-y-3">
                      {actionPrompts.map((action, index) => {
                        const actionCompleted = isCompleted(index);
                        const isReflection = action.type === 'reflection';
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-all",
                              actionCompleted
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-background/50 border-amber-500/10"
                            )}
                          >
                            <span className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center transition-colors",
                              actionCompleted ? "bg-green-500 text-white" : "bg-amber-500/20 text-amber-500"
                            )}>
                              {actionCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                            </span>
                            <span className={cn(
                              "flex-1 text-sm",
                              actionCompleted ? "text-green-700 dark:text-green-300" : "text-muted-foreground"
                            )}>
                              {action.text}
                            </span>
                            <Button
                              variant={actionCompleted ? "default" : "ghost"}
                              size="sm"
                              className={cn(
                                "shrink-0 transition-all",
                                actionCompleted
                                  ? "bg-green-500 hover:bg-green-600 text-white pointer-events-none"
                                  : "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                              )}
                              onClick={() => handleActionClick(action, index)}
                              disabled={actionCompleted}
                            >
                              {actionCompleted ? (
                                <><Check className="h-4 w-4 mr-1" />Făcut</>
                              ) : isReflection ? (
                                <><MessageCircle className="h-4 w-4 mr-1" />Reflectă</>
                              ) : (
                                <><Plus className="h-4 w-4 mr-1" />Adaugă</>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Comments Section */}
          <ModuleComments ref={commentsRef} moduleId={moduleId} />
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 border-t bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
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
    </div>
  );
};
