import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCoachTribeFeed, TribePost, TribePostComment } from '@/hooks/useCoachTribeFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Heart,
  MessageCircle,
  Pin,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

interface Props {
  tribeId: string;
  userId: string;
  isOwner: boolean;
}

const content = {
  ro: {
    title: 'Feed',
    writePost: 'Scrie o postare...',
    post: 'Postează',
    noPostsYet: 'Nicio postare încă. Fii primul care postează!',
    pinned: 'Fixat',
    comment: 'Comentează...',
    send: 'Trimite',
  },
  en: {
    title: 'Feed',
    writePost: 'Write a post...',
    post: 'Post',
    noPostsYet: 'No posts yet. Be the first to post!',
    pinned: 'Pinned',
    comment: 'Comment...',
    send: 'Send',
  },
};

export const CoachTribeFeed: React.FC<Props> = ({ tribeId, userId, isOwner }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const dateLocale = language === 'ro' ? ro : enUS;

  const {
    posts,
    loading,
    fetchPosts,
    createPost,
    deletePost,
    togglePin,
    toggleLike,
    fetchComments,
    addComment,
  } = useCoachTribeFeed(tribeId, userId);

  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<TribePostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await createPost(newPost.trim());
    setNewPost('');
    setPosting(false);
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
      setComments([]);
      return;
    }
    setExpandedComments(postId);
    setLoadingComments(true);
    const c = await fetchComments(postId);
    setComments(c);
    setLoadingComments(false);
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    await addComment(postId, newComment.trim());
    setNewComment('');
    const c = await fetchComments(postId);
    setComments(c);
  };

  return (
    <div className="space-y-4">
      {/* New post */}
      <Card>
        <CardContent className="pt-4">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t.writePost}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handlePost} disabled={!newPost.trim() || posting} size="sm">
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              {t.post}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t.noPostsYet}</p>
      ) : (
        posts.map(post => (
          <Card key={post.id} className={post.is_pinned ? 'border-primary/50' : ''}>
            <CardContent className="pt-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-sm">
                      {post.avatar_emoji || post.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">{post.display_name}</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                  {post.is_pinned && (
                    <Badge variant="outline" className="text-[10px] ml-2">
                      <Pin className="h-3 w-3 mr-1" />
                      {t.pinned}
                    </Badge>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin(post.id, post.is_pinned)}>
                      <Pin className={`h-3.5 w-3.5 ${post.is_pinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deletePost(post.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 ${post.liked_by_me ? 'text-red-500' : ''}`}
                  onClick={() => toggleLike(post.id, !!post.liked_by_me)}
                >
                  <Heart className={`h-4 w-4 ${post.liked_by_me ? 'fill-current' : ''}`} />
                  {post.likes_count > 0 && post.likes_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleToggleComments(post.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count > 0 && post.comments_count}
                </Button>
              </div>

              {/* Comments Section */}
              {expandedComments === post.id && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  {loadingComments ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-muted text-xs">
                            {c.avatar_emoji || c.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1">
                          <span className="text-xs font-medium">{c.display_name}</span>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t.comment}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleAddComment(post.id)} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
