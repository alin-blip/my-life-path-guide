import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useModuleComments } from '@/hooks/useModuleComments';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ModuleCommentsProps {
  moduleId: string;
}

export interface ModuleCommentsRef {
  prefillAndFocus: (message: string) => void;
  scrollIntoView: () => void;
}

export const ModuleComments = forwardRef<ModuleCommentsRef, ModuleCommentsProps>(
  ({ moduleId }, ref) => {
    const { user } = useAuth();
    const { comments, isLoading, addComment, deleteComment, commentCount, canComment } = useModuleComments(moduleId);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prefillMessage, setPrefillMessage] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      prefillAndFocus: (message: string) => {
        setPrefillMessage(message);
        setNewComment(message);
        // Scroll and focus after state update
        setTimeout(() => {
          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          textareaRef.current?.focus();
          // Place cursor at end of text
          if (textareaRef.current) {
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
          }
        }, 100);
      },
      scrollIntoView: () => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }));

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNewComment(value);
      // Clear prefill when user starts typing something different
      if (prefillMessage && value !== prefillMessage) {
        setPrefillMessage(null);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || isSubmitting) return;

      setIsSubmitting(true);
      const success = await addComment(newComment);
      if (success) {
        setNewComment('');
        setPrefillMessage(null);
      }
      setIsSubmitting(false);
    };

    const getInitials = (userId: string, email?: string) => {
      if (email) {
        return email.substring(0, 2).toUpperCase();
      }
      return userId.substring(0, 2).toUpperCase();
    };

    const getDisplayName = (userId: string) => {
      return `Warrior ${userId.substring(0, 6)}`;
    };

    const formatDate = (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ro });
      } catch {
        return 'recent';
      }
    };

    return (
      <Card ref={cardRef} className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Reflexie - Contribuie în comunitate</span>
            <span className="text-sm font-normal text-muted-foreground">({commentCount})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Input */}
          {canComment ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Împărtășește-ți revelația sau experiența cu ceilalți Războinici..."
                  className={cn(
                    "min-h-[100px] resize-none bg-background/50 border-amber-500/20 focus:border-amber-500/50",
                    prefillMessage && "text-foreground"
                  )}
                />
                {prefillMessage && newComment === prefillMessage && (
                  <div className="absolute bottom-2 right-2 text-xs text-amber-500/70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Continuă să scrii...
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || isSubmitting}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Postează Reflexia
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground text-sm">
                Autentifică-te pentru a contribui cu reflexia ta
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Fii primul care contribuie!</p>
                <p className="text-sm">Împărtășește-ți revelațiile cu comunitatea.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    comment.user_id === user?.id
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-muted/30 border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                        {getInitials(comment.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {getDisplayName(comment.user_id)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        {comment.user_id === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ModuleComments.displayName = 'ModuleComments';
