import React, { useState, useRef } from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { useWallPostComments } from '@/hooks/useWallPostComments';
import { PostCommentCard } from './PostCommentCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { EmojiPicker } from './EmojiPicker';
import { MediaUploadButton, MediaPreview } from './MediaUploadButton';

interface LessonPostCardInlineProps {
  post: WallPost & { source_label?: string | null; category?: string | null };
  onLike: (postId: string) => void;
}

export const LessonPostCardInline: React.FC<LessonPostCardInlineProps> = ({ post, onLike }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { comments, loading: commentsLoading, addComment, deleteComment } = useWallPostComments(post.id);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: false,
    locale: language === 'ro' ? ro : undefined,
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim() && mediaUrls.length === 0) return;
    setSubmitting(true);
    const success = await addComment(newComment.trim(), undefined, mediaUrls.length > 0 ? mediaUrls : undefined);
    if (success) {
      setNewComment('');
      setMediaUrls([]);
    }
    setSubmitting(false);
  };

  const handleReply = async (content: string, parentId: string) => {
    return addComment(content, parentId);
  };

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
  };

  const handleMediaUploaded = (url: string) => {
    setMediaUrls((prev) => [...prev, url]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`bg-card border rounded-xl overflow-hidden ${post.is_pinned ? 'border-amber-500/30' : 'border-border'}`}>
      {/* Post Content */}
      <div className="p-4">
        {/* Pinned badge */}
        {post.is_pinned && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
            <Pin className="h-3 w-3" />
            <span>{language === 'ro' ? 'Fixat' : 'Pinned'}</span>
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/10 text-sm">
              {post.author?.avatar_emoji || '⚔️'}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-sm text-foreground">
              {post.author?.display_name || 'Warrior'}
            </span>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-3">
            <img
              src={post.media_urls[0]}
              alt=""
              className="rounded-lg max-h-64 object-cover w-full"
            />
          </div>
        )}

        {/* Like / Comment counts */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/50">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likes_count}</span>
          </button>
          <button
            onClick={focusCommentInput}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{comments.length || post.comments_count}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {(comments.length > 0 || commentsLoading) && (
        <div className="border-t border-border/50 px-4">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="divide-y divide-border/30">
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
      )}

      {/* Comment Input */}
      <div className="border-t border-border/50 p-3">
        {mediaUrls.length > 0 && (
          <MediaPreview urls={mediaUrls} onRemove={removeMedia} removable />
        )}
        <div className="flex items-start gap-2">
          <Avatar className="w-8 h-8 shrink-0 mt-0.5">
            <AvatarFallback className="bg-primary/10 text-xs">⚔️</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={language === 'ro' ? 'Scrie un comentariu...' : 'Write a comment...'}
              className="min-h-[40px] resize-none text-sm"
              onEnterSubmit={handleSubmitComment}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <MediaUploadButton onMediaUploaded={handleMediaUploaded} />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSubmitComment}
                disabled={(!newComment.trim() && mediaUrls.length === 0) || submitting}
                className="h-7 px-2"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
