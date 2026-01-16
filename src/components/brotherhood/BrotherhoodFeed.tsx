import React, { useState } from 'react';
import { useBrotherhood, WallPost } from '@/hooks/useBrotherhood';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

export const BrotherhoodFeed: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { posts, loading, createPost, toggleLike } = useBrotherhood();
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    await createPost(newPost.trim());
    setNewPost('');
    setIsPosting(false);
  };

  const renderPost = (post: WallPost) => (
    <Card key={post.id} className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-lg">
                {post.author?.avatar_emoji || '⚔️'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author?.display_name || 'Warrior'}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true,
                  locale: language === 'ro' ? ro : undefined
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media_urls.map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt="" 
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${post.is_liked ? 'text-red-500' : ''}`}
            onClick={() => toggleLike(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card className="glass-card">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20">⚔️</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={language === 'ro' ? 'Ce ai pe suflet, războinicule?' : 'What\'s on your mind, warrior?'}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handlePost} 
                  disabled={!newPost.trim() || isPosting}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {language === 'ro' ? 'Postează' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {language === 'ro' ? 'Nicio postare încă. Fii primul care postează!' : 'No posts yet. Be the first to post!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map(renderPost)
      )}
    </div>
  );
};
