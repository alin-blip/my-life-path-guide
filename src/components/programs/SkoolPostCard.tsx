import React, { useState, useRef } from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Pin, BookOpen, MoreVertical, Send, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [pinLoading, setPinLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
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

  const hasMedia = post.media_urls && post.media_urls.length > 0;

  // Show full content with "See more" after ~4 lines
  const contentLines = post.content.split('\n');
  const isLongContent = contentLines.length > 4 || post.content.length > 300;
  const displayContent = expanded || !isLongContent
    ? post.content
    : contentLines.slice(0, 4).join('\n').substring(0, 300);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: false,
    locale: language === 'ro' ? ro : undefined,
  });

  const categoryLabel = post.category && post.category !== 'general'
    ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
    : null;

  const [showAllComments, setShowAllComments] = useState(false);

  // Show first 2 comments always, rest behind "View more"
  const visibleComments = comments.slice(0, 2);
  const hiddenCommentsCount = Math.max(0, comments.length - 2);
  const displayedComments = showAllComments ? comments : visibleComments;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 pb-2">
        {/* Source badge */}
        {post.source_label && (
          <Badge variant="secondary" className="mb-2 gap-1 text-xs">
            <BookOpen className="h-3 w-3" />
            {post.source_label}
          </Badge>
        )}

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-base">
                {post.author?.avatar_emoji || '⚔️'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="font-semibold text-sm text-foreground">
                {post.author?.display_name || 'Warrior'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{timeAgo}</span>
                <span>·</span>
                <span>{categoryLabel ? `📚 ${categoryLabel}` : '💬 General'}</span>
                {post.is_pinned && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-accent-foreground font-medium">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

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

        {/* Content - Full text, no truncation */}
        <div className="mb-3">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {displayContent}
            {isLongContent && !expanded && '...'}
          </p>
          {isLongContent && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground mt-1"
            >
              {language === 'ro' ? 'Vezi mai mult' : 'See more'}
            </button>
          )}
        </div>

        {/* Media - Full width */}
        {hasMedia && (
          <div className="mb-3 -mx-4">
            {post.media_urls!.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-full object-cover"
              />
            ))}
          </div>
        )}

        {/* Like count text */}
        {post.likes_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pb-2">
            <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
            <span>
              {post.likes_count} {post.likes_count === 1
                ? (language === 'ro' ? 'apreciere' : 'like')
                : (language === 'ro' ? 'aprecieri' : 'likes')}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons - FB style text buttons */}
      <div className="border-t border-border mx-4" />
      <div className="flex items-center px-2 py-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            post.is_liked
              ? 'text-red-500'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
          {language === 'ro' ? 'Apreciază' : 'Like'}
        </button>
        <button
          onClick={() => commentInputRef.current?.focus()}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {language === 'ro' ? 'Comentează' : 'Comment'}
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Comments section - always visible */}
      <div className="border-t border-border bg-muted/20">
        {/* View more comments link */}
        {hiddenCommentsCount > 0 && !showAllComments && (
          <button
            onClick={() => setShowAllComments(true)}
            className="w-full px-4 py-2 text-left text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'ro'
              ? `Vezi încă ${hiddenCommentsCount} comentarii`
              : `View ${hiddenCommentsCount} more comments`}
          </button>
        )}

        {/* Comments list */}
        {commentsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        ) : displayedComments.length > 0 ? (
          <div className="px-4 pb-1">
            {displayedComments.map((comment) => (
              <PostCommentCard
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={deleteComment}
              />
            ))}
          </div>
        ) : null}

        {/* Always-visible comment input */}
        <div className="px-4 py-3 flex items-start gap-2">
          <Avatar className="w-8 h-8 shrink-0 mt-0.5">
            <AvatarFallback className="bg-primary/10 text-sm">
              ⚔️
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {mediaUrls.length > 0 && (
              <MediaPreview urls={mediaUrls} onRemove={removeMedia} removable />
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === 'ro' ? 'Scrie un comentariu...' : 'Write a comment...'}
                  className="min-h-[36px] max-h-[120px] resize-none text-sm rounded-2xl bg-muted/50 border-0 py-2 px-3 focus-visible:ring-1"
                  onEnterSubmit={handleSubmitComment}
                />
                <div className="absolute right-2 bottom-1 flex items-center gap-0.5">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  <MediaUploadButton onMediaUploaded={handleMediaUploaded} />
                </div>
              </div>
              {(newComment.trim() || mediaUrls.length > 0) && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSubmitComment}
                  disabled={(!newComment.trim() && mediaUrls.length === 0) || submitting}
                  className="h-8 w-8 shrink-0 text-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
