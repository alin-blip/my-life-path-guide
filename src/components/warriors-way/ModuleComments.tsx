import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, Loader2, Sparkles, Reply, Video } from 'lucide-react';
import { useModuleComments, ModuleComment } from '@/hooks/useModuleComments';
import { useCommentReactions, ReactionType } from '@/hooks/useCommentReactions';
import { CommentReactions } from './CommentReactions';
import { CommentReplyForm } from './CommentReplyForm';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ModuleCommentsProps {
  moduleId: string;
}

export interface ModuleCommentsRef {
  appendAndFocus: (message: string) => void;
  scrollIntoView: () => void;
}

export const ModuleComments = forwardRef<ModuleCommentsRef, ModuleCommentsProps>(
  ({ moduleId }, ref) => {
    const { user } = useAuth();
    const { 
      comments, 
      isLoading, 
      addComment, 
      deleteComment, 
      commentCount, 
      canComment,
      getAllCommentIds 
    } = useModuleComments(moduleId);
    
    const { getReactionCounts, toggleReaction } = useCommentReactions(getAllCommentIds());
    
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      appendAndFocus: (message: string) => {
        setNewComment(prev => {
          if (prev.trim()) {
            return prev + '\n\n' + message;
          }
          return message;
        });
        
        setTimeout(() => {
          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          textareaRef.current?.focus();
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
      setNewComment(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || isSubmitting) return;

      setIsSubmitting(true);
      const success = await addComment(newComment);
      if (success) {
        setNewComment('');
      }
      setIsSubmitting(false);
    };

    const handleReply = async (parentId: string, content: string) => {
      setIsReplySubmitting(true);
      const success = await addComment(content, parentId);
      if (success) {
        setReplyingTo(null);
      }
      setIsReplySubmitting(false);
      return success;
    };

    const handleToggleReaction = (commentId: string, type: ReactionType) => {
      toggleReaction(commentId, type);
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

    const renderComment = (comment: ModuleComment, isReply = false) => (
      <div
        key={comment.id}
        className={cn(
          "p-3 rounded-lg border transition-colors",
          isReply && "ml-8 mt-2",
          comment.user_id === user?.id
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-muted/30 border-transparent"
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className={cn("flex-shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
              {getInitials(comment.user_id)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", isReply ? "text-xs" : "text-sm")}>
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
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Video if present */}
            {comment.video_url && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <video 
                  src={comment.video_url} 
                  controls 
                  className="max-w-full max-h-[300px] rounded-lg"
                />
              </div>
            )}
            
            {/* Comment content */}
            <p className={cn("mt-1 whitespace-pre-wrap break-words", isReply ? "text-xs" : "text-sm")}>
              {comment.content}
            </p>

            {/* Reactions and Reply button */}
            <div className="flex items-center gap-3 mt-2">
              <CommentReactions
                commentId={comment.id}
                reactionCounts={getReactionCounts(comment.id)}
                onToggleReaction={handleToggleReaction}
                canReact={canComment}
              />
              
              {!isReply && canComment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-amber-500"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Răspunde
                </Button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <CommentReplyForm
                onSubmit={(content) => handleReply(comment.id, content)}
                onCancel={() => setReplyingTo(null)}
                isSubmitting={isReplySubmitting}
              />
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );

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
                  className="min-h-[120px] resize-none bg-background/50 border-amber-500/20 focus:border-amber-500/50"
                />
                {newComment.trim() && (
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
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ModuleComments.displayName = 'ModuleComments';
