import React, { useState } from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import { PostCommentsDialog } from './PostCommentsDialog';

interface LessonPostCardProps {
  post: WallPost & { source_label?: string | null; category?: string | null };
  onLike: (postId: string) => void;
}

export const LessonPostCard: React.FC<LessonPostCardProps> = ({ post, onLike }) => {
  const { language } = useLanguage();
  const [showComments, setShowComments] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: false,
    locale: language === 'ro' ? ro : undefined,
  });

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4">
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

        {/* Actions */}
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
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{post.comments_count}</span>
          </button>
        </div>
      </div>

      <PostCommentsDialog
        post={post}
        open={showComments}
        onOpenChange={setShowComments}
        onLike={onLike}
      />
    </>
  );
};
