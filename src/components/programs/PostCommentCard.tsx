import React, { useState } from 'react';
import { WallPostCommentWithAuthor } from '@/hooks/useWallPostComments';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { InlineMediaDisplay } from './MediaUploadButton';

interface PostCommentCardProps {
  comment: WallPostCommentWithAuthor;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  isNested?: boolean;
}

export const PostCommentCard: React.FC<PostCommentCardProps> = ({
  comment,
  onReply,
  onDelete,
  isNested = false,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: language === 'ro' ? ro : undefined,
  });

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    const success = await onReply(replyContent.trim(), comment.id);
    if (success) {
      setReplyContent('');
      setShowReply(false);
    }
    setSubmitting(false);
  };

  const isOwn = user?.id === comment.user_id;

  return (
    <div className={`${isNested ? 'ml-8 border-l-2 border-border/50 pl-4' : ''}`}>
      <div className="flex items-start gap-3 py-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-sm">
            {comment.author?.avatar_emoji || '⚔️'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {comment.author?.display_name || 'Warrior'}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>

          {/* Media attachments */}
          <InlineMediaDisplay urls={comment.media_urls || null} />

          <div className="flex items-center gap-3 mt-2">
            {!isNested && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-3 w-3" />
                {language === 'ro' ? 'Răspunde' : 'Reply'}
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                {language === 'ro' ? 'Șterge' : 'Delete'}
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={language === 'ro' ? 'Scrie un răspuns...' : 'Write a reply...'}
                className="min-h-[60px] resize-none text-sm"
                onEnterSubmit={handleReply}
              />
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || submitting}
                className="shrink-0 self-end"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <PostCommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
};
