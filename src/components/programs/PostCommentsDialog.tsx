import React, { useState } from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { useWallPostComments } from '@/hooks/useWallPostComments';
import { PostCommentCard } from './PostCommentCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Heart, Send, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

interface PostCommentsDialogProps {
  post: WallPost & { source_label?: string | null; category?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: (postId: string) => void;
}

export const PostCommentsDialog: React.FC<PostCommentsDialogProps> = ({
  post,
  open,
  onOpenChange,
  onLike,
}) => {
  const { language } = useLanguage();
  const { comments, loading, addComment, deleteComment } = useWallPostComments(open ? post.id : null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: language === 'ro' ? ro : undefined,
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const success = await addComment(newComment.trim());
    if (success) setNewComment('');
    setSubmitting(false);
  };

  const handleReply = async (content: string, parentId: string) => {
    return addComment(content, parentId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
          <SheetTitle className="text-left">
            {language === 'ro' ? 'Comentarii' : 'Comments'}
          </SheetTitle>
        </SheetHeader>

        {/* Original Post */}
        <div className="px-4 py-4 border-b border-border shrink-0">
          {/* Source badge */}
          {post.source_label && (
            <Badge variant="secondary" className="mb-2 gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              {post.source_label}
            </Badge>
          )}

          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-sm">
                {post.author?.avatar_emoji || '⚔️'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-sm">{post.author?.display_name || 'Warrior'}</span>
              <span className="text-xs text-muted-foreground ml-2">{timeAgo}</span>
            </div>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                post.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes_count}</span>
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {language === 'ro' ? 'Niciun comentariu încă. Fii primul!' : 'No comments yet. Be the first!'}
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {comments.map((comment) => (
                <PostCommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={language === 'ro' ? 'Scrie un comentariu...' : 'Write a comment...'}
              className="min-h-[60px] resize-none text-sm"
              onEnterSubmit={handleSubmit}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="shrink-0 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
