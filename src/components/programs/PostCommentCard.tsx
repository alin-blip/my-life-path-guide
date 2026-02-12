import React, { useState } from 'react';
import { WallPostCommentWithAuthor } from '@/hooks/useWallPostComments';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Send } from 'lucide-react';
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
    addSuffix: false,
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
    <div className={`${isNested ? 'ml-10' : ''}`}>
      <div className="flex items-start gap-2 py-1.5">
        <Avatar className="w-8 h-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-primary/10 text-sm">
            {comment.author?.avatar_emoji || '⚔️'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* FB-style comment bubble */}
          <div className="bg-muted/60 rounded-2xl px-3 py-2 inline-block max-w-full">
            <span className="font-semibold text-xs text-foreground block">
              {comment.author?.display_name || 'Warrior'}
            </span>
            <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Media attachments */}
          <InlineMediaDisplay urls={comment.media_urls || null} />

          {/* Actions below bubble */}
          <div className="flex items-center gap-3 mt-0.5 ml-3">
            <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
            {!isNested && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'ro' ? 'Răspunde' : 'Reply'}
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2 flex gap-2 ml-1">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={language === 'ro' ? 'Scrie un răspuns...' : 'Write a reply...'}
                className="min-h-[36px] resize-none text-sm rounded-2xl bg-muted/50 border-0 py-2 px-3"
                onEnterSubmit={handleReply}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReply}
                disabled={!replyContent.trim() || submitting}
                className="shrink-0 self-end text-primary"
              >
                <Send className="h-3.5 w-3.5" />
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
