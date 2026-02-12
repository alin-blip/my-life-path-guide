import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Send, BookOpen, MessageCircle } from 'lucide-react';
import { LessonPostCardInline } from './LessonPostCardInline';
import { WallPost } from '@/hooks/useBrotherhood';

interface LessonCommunityPostProps {
  dayNumber: number;
  dayTitle: string;
  courseName?: string;
  sourcePrefix?: string;
  postCategory?: string;
}

type PostWithSource = WallPost & { source_label?: string | null; category?: string | null };

export const LessonCommunityPost: React.FC<LessonCommunityPostProps> = ({
  dayNumber,
  dayTitle,
  courseName = 'Challenge',
  sourcePrefix,
  postCategory,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const prefix = sourcePrefix || 'challenge';
  const sourceContext = `${prefix}-day-${dayNumber}`;
  const sourceLabel = `${courseName} - Day ${dayNumber}: ${dayTitle}`;

  const fetchPosts = useCallback(async () => {
    const query = supabase
      .from('wall_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    const { data, error } = await (query as any).eq('source_context', sourceContext);

    if (error) {
      console.error('Error fetching lesson posts:', error);
      setLoading(false);
      return;
    }

    const rows = data as any[] | null;
    if (rows && rows.length > 0) {
      const userIds: string[] = [...new Set(rows.map((p: any) => p.user_id as string))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      let likedPostIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('wall_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', rows.map((p: any) => p.id as string));
        likedPostIds = likes?.map(l => l.post_id) || [];
      }

      const postsWithAuthors: PostWithSource[] = rows.map((post: any) => ({
        ...post,
        author: profiles?.find(p => p.user_id === post.user_id) || { display_name: 'Warrior', avatar_emoji: '⚔️' },
        is_liked: likedPostIds.includes(post.id),
      }));

      setPosts(postsWithAuthors);
    } else {
      setPosts([]);
    }
    setLoading(false);
  }, [sourceContext, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel(`lesson_posts_${sourceContext}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wall_posts',
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sourceContext, fetchPosts]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);

    const { error } = await supabase
      .from('wall_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        category: postCategory || 'challenge',
        source_context: sourceContext,
        source_label: sourceLabel,
      } as any);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: language === 'ro' ? 'Postat!' : 'Posted!',
        description: language === 'ro' ? 'Postarea ta apare și în Community.' : 'Your post also appears in Community.',
      });
      setContent('');
      setOpen(false);
      await fetchPosts();
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase.from('wall_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('wall_post_likes').insert({ post_id: postId, user_id: user.id });
    }

    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/30">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          {language === 'ro' ? 'Discuții lecție' : 'Lesson Discussion'}
        </h3>
        <Badge variant="secondary" className="gap-1 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
          <BookOpen className="h-3 w-3" />
          {posts.length} {language === 'ro' ? 'postări' : 'posts'}
        </Badge>
      </div>

      {/* Write trigger */}
      <div
        onClick={() => setOpen(true)}
        className="bg-card border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:shadow-amber-500/10 transition-shadow"
      >
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-primary/10">⚔️</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-muted/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
          {language === 'ro' ? 'Scrie ceva despre această lecție...' : 'Write something about this lesson...'}
        </div>
      </div>

      {/* Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'ro' ? 'Postează în lecție' : 'Post in lesson'}
            </DialogTitle>
            <DialogDescription>
              <Badge variant="secondary" className="gap-1 mt-1">
                <BookOpen className="h-3 w-3" />
                {sourceLabel}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                language === 'ro'
                  ? 'Împărtășește progresul, insight-urile sau întrebările tale...'
                  : 'Share your progress, insights or questions...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] resize-none"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {language === 'ro'
                ? '💡 Postarea va apărea și în feed-ul Community cu badge-ul lecției.'
                : '💡 Your post will also appear in the Community feed with the lesson badge.'}
            </p>
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={!content.trim() || posting} className="gap-2">
                <Send className="h-4 w-4" />
                {language === 'ro' ? 'Postează' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts feed - all rendered as inline cards (pinned first) */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {language === 'ro'
              ? 'Nicio postare încă. Fii primul care împărtășește!'
              : 'No posts yet. Be the first to share!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <LessonPostCardInline key={post.id} post={post} onLike={toggleLike} />
          ))}
        </div>
      )}
    </div>
  );
};
