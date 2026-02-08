import React from 'react';
import { WallPost } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

interface SkoolPostCardProps {
  post: WallPost;
  onLike: (postId: string) => void;
}

export const SkoolPostCard: React.FC<SkoolPostCardProps> = ({ post, onLike }) => {
  const { language } = useLanguage();

  // Split content into title (first line) and preview (rest)
  const lines = post.content.split('\n').filter(l => l.trim());
  const title = lines[0]?.substring(0, 80) || '';
  const preview = lines.slice(1).join(' ').substring(0, 160);
  const hasMedia = post.media_urls && post.media_urls.length > 0;

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: false,
    locale: language === 'ro' ? ro : undefined,
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-base">
                {post.author?.avatar_emoji || '⚔️'}
              </AvatarFallback>
            </Avatar>
            {/* Level badge */}
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
              <span className="text-primary/70">💬 General</span>
            </div>
          </div>
        </div>

        {post.is_pinned && (
          <div className="flex items-center gap-1 text-xs text-accent-foreground font-medium shrink-0 bg-accent px-2 py-1 rounded-full">
            <Pin className="h-3 w-3" />
            Pinned
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-sm text-foreground leading-snug mb-1 line-clamp-2">
            {title}
          </h3>
          {/* Preview */}
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {preview}
            </p>
          )}
        </div>
        {/* Thumbnail */}
        {hasMedia && (
          <img
            src={post.media_urls![0]}
            alt=""
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        )}
      </div>

      {/* Footer */}
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
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">{post.comments_count}</span>
        </button>
      </div>
    </div>
  );
};
