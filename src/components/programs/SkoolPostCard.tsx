import React, { useState, useRef } from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Pin, BookOpen, MoreVertical, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWallPostComments } from '@/hooks/useWallPostComments';
import { PostCommentCard } from './PostCommentCard';
import { EmojiPicker } from './EmojiPicker';
import { MediaUploadButton, MediaPreview } from './MediaUploadButton';
import { VideoRecorder } from './VideoRecorder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SkoolPostCardProps {
  post: WallPost & { source_label?: string | null; category?: string | null };
  onLike: (postId: string) => void;
  onRefresh?: () => void;
}

export const SkoolPostCard: React.FC<SkoolPostCardProps> = ({ post, onLike, onRefresh }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [pinLoading, setPinLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { comments, loading: commentsLoading, addComment, deleteComment } = useWallPostComments(post.id);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinLoading) return;
    setPinLoading(true);

    try {
      if (!post.is_pinned) {
        const { count } = await supabase
          .from('wall_posts')
          .select('*', { count: 'exact', head: true })
          .eq('is_pinned', true);

        if ((count || 0) >= 3) {
          toast({
            title: language === 'ro' ? 'Limită atinsă' : 'Limit reached',
            description: language === 'ro' 
              ? 'Poți avea maximum 3 postări fixate.' 
              : 'You can have a maximum of 3 pinned posts.',
            variant: 'destructive',
          });
          setPinLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('wall_posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: post.is_pinned
          ? (language === 'ro' ? 'Postare defixată' : 'Post unpinned')
          : (language === 'ro' ? 'Postare fixată' : 'Post pinned'),
      });

      onRefresh?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPinLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  const handleMediaUploaded = (url: string) => {
    setMediaUrls(prev => [...prev, url]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

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

  // Content display
  const lines = post.content.split('\n').filter(l => l.trim());
  const title = lines[0]?.substring(0, 80) || '';
  const preview = lines.slice(1).join(' ').substring(0, 160);
  const hasMedia = post.media_urls && post.media_urls.length > 0;

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: false,
    locale: language === 'ro' ? ro : undefined,
  });

  const categoryLabel = post.category && post.category !== 'general'
    ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4">
        {/* Source badge */}
        {post.source_label && (
          <Badge variant="secondary" className="mb-2 gap-1 text-xs">
            <BookOpen className="h-3 w-3" />
            {post.source_label}
          </Badge>
        )}

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-base">
                  {post.author?.avatar_emoji || '⚔️'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 bg-muted text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-card text-muted-foreground">
                3
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground truncate">
                  {post.author?.display_name || 'Warrior'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{timeAgo}</span>
                <span>·</span>
                <span className="text-primary/70">
                  {categoryLabel ? `📚 ${categoryLabel}` : '💬 General'}
                </span>
              </div>
            </div>
          </div>

          {post.is_pinned && (
            <div className="flex items-center gap-1 text-xs text-accent-foreground font-medium shrink-0 bg-accent px-2 py-1 rounded-full">
              <Pin className="h-3 w-3" />
              Pinned
            </div>
          )}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePin} disabled={pinLoading}>
                  <Pin className="h-4 w-4 mr-2" />
                  {post.is_pinned
                    ? (language === 'ro' ? 'Defixează' : 'Unpin')
                    : (language === 'ro' ? 'Fixează' : 'Pin')}
                </DropdownMenuItem>
                {post.category === 'breakthrough' ? (
                  <DropdownMenuItem onClick={async (e) => {
                    e.stopPropagation();
                    await supabase.from('wall_posts').update({ category: 'general' }).eq('id', post.id);
                    toast({ title: language === 'ro' ? 'Mutat la General' : 'Moved to General' });
                    onRefresh?.();
                  }}>
                    💬 {language === 'ro' ? 'Mută la General' : 'Move to General'}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={async (e) => {
                    e.stopPropagation();
                    await supabase.from('wall_posts').update({ category: 'breakthrough' }).eq('id', post.id);
                    toast({ title: language === 'ro' ? 'Mutat la Breakthrough' : 'Moved to Breakthrough' });
                    onRefresh?.();
                  }}>
                    💡 {language === 'ro' ? 'Mută la Breakthrough' : 'Move to Breakthrough'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content Area */}
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground leading-snug mb-1 line-clamp-2">
              {title}
            </h3>
            {preview && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {preview}
              </p>
            )}
          </div>
          {hasMedia && (
            <img
              src={post.media_urls![0]}
              alt=""
              className="w-20 h-20 rounded-lg object-cover shrink-0"
            />
          )}
        </div>

        {/* Footer - Like & Comment buttons */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.is_liked
                ? 'text-red-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likes_count}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComments();
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{post.comments_count}</span>
          </button>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="border-t border-border">
          {/* Comments list */}
          <div className="px-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">
                {language === 'ro' ? 'Niciun comentariu încă. Fii primul!' : 'No comments yet. Be the first!'}
              </p>
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

          {/* Comment input */}
          <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
            {mediaUrls.length > 0 && (
              <MediaPreview urls={mediaUrls} onRemove={removeMedia} removable />
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === 'ro' ? 'Scrie un comentariu...' : 'Write a comment...'}
                  className="min-h-[50px] resize-none text-sm"
                  onEnterSubmit={handleSubmitComment}
                />
                <div className="flex items-center gap-1 mt-1">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  <MediaUploadButton onMediaUploaded={handleMediaUploaded} />
                  <VideoRecorder onVideoRecorded={handleMediaUploaded} />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={(!newComment.trim() && mediaUrls.length === 0) || submitting}
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
