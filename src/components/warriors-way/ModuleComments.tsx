import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, User, Loader2 } from 'lucide-react';
import { useModuleComments } from '@/hooks/useModuleComments';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ModuleCommentsProps {
  moduleId: string;
}

export const ModuleComments: React.FC<ModuleCommentsProps> = ({ moduleId }) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment, commentCount, canComment } = useModuleComments(moduleId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const getInitials = (userId: string, email?: string) => {
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return userId.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (userId: string) => {
    // Show first 8 chars of user ID as anonymous identifier
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
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-amber-500" />
          Comentarii ({commentCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        {canComment ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Lasă un comentariu... Împărtășește experiența ta cu ceilalți Războinici!"
              className="min-h-[80px] resize-none bg-background/50 border-amber-500/20 focus:border-amber-500/50"
            />
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
                Postează Comentariu
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-muted-foreground text-sm">
              Autentifică-te pentru a lăsa un comentariu
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
              <p>Fii primul care lasă un comentariu!</p>
              <p className="text-sm">Împărtășește experiența ta cu comunitatea.</p>
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
};
