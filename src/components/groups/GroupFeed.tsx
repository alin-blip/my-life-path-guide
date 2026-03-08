import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { WallPost } from '@/hooks/useBrotherhood';
import { SkoolPostCard } from '@/components/programs/SkoolPostCard';
import { SkoolWritePost } from '@/components/programs/SkoolWritePost';
import { useToast } from '@/hooks/use-toast';

interface GroupFeedProps {
  tribeId: string;
  isMember: boolean;
  categoryFilter?: string;
}

export const GroupFeed: React.FC<GroupFeedProps> = ({ tribeId, isMember, categoryFilter }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    let query = supabase
      .from('wall_posts')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching group posts:', error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((p) => p.user_id))];
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
          .in('post_id', data.map((p) => p.id));
        likedPostIds = likes?.map((l) => l.post_id) || [];
      }

      setPosts(
        data.map((post) => ({
          ...post,
          author: profiles?.find((p) => p.user_id === post.user_id) || {
            display_name: 'Warrior',
            avatar_emoji: '⚔️',
          },
          is_liked: likedPostIds.includes(post.id),
        }))
      );
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel(`group_posts_${tribeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wall_posts',
        filter: `tribe_id=eq.${tribeId}`,
      }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tribeId, user]);

  // Client-side category filtering for responsiveness
  const filteredPosts = useMemo(() => {
    if (!categoryFilter) return posts;
    return posts.filter(p => p.category === categoryFilter);
  }, [posts, categoryFilter]);

  const handleCreatePost = async (content: string, options?: { mediaUrls?: string[]; category?: string }) => {
    if (!user) return;
    const { error } = await supabase.from('wall_posts').insert({
      user_id: user.id,
      content,
      tribe_id: tribeId,
      media_urls: options?.mediaUrls || null,
      category: options?.category || 'general',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchPosts();
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase.from('wall_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('wall_post_likes').insert({ post_id: postId, user_id: user.id });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isMember && <SkoolWritePost onPost={handleCreatePost} showCategoryPicker />}

      {filteredPosts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            {categoryFilter
              ? (language === 'ro'
                ? 'Nicio postare în această categorie. Fii primul!'
                : 'No posts in this category. Be the first!')
              : (language === 'ro'
                ? 'Nicio postare încă. Fii primul care postează!'
                : 'No posts yet. Be the first to post!')}
          </p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <SkoolPostCard key={post.id} post={post} onLike={handleToggleLike} onRefresh={fetchPosts} />
        ))
      )}
    </div>
  );
};
