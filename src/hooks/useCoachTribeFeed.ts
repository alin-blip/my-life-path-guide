import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface TribePost {
  id: string;
  tribe_id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  display_name?: string;
  avatar_emoji?: string | null;
  liked_by_me?: boolean;
}

export interface TribePostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name?: string;
  avatar_emoji?: string | null;
}

export function useCoachTribeFeed(tribeId?: string, userId?: string) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<TribePost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!tribeId || !userId) return;
    setLoading(true);
    try {
      const { data: postsData } = await supabase
        .from('tribe_posts')
        .select('*')
        .eq('tribe_id', tribeId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (!postsData?.length) { setPosts([]); return; }

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Check which posts I liked
      const postIds = postsData.map(p => p.id);
      const { data: myLikes } = await supabase
        .from('tribe_post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);
      const likedSet = new Set(myLikes?.map(l => l.post_id) || []);

      setPosts(postsData.map(p => ({
        ...p,
        display_name: profileMap.get(p.user_id)?.display_name || 'Unknown',
        avatar_emoji: profileMap.get(p.user_id)?.avatar_emoji || null,
        liked_by_me: likedSet.has(p.id),
      })));
    } finally {
      setLoading(false);
    }
  }, [tribeId, userId]);

  const createPost = useCallback(async (content: string) => {
    if (!tribeId || !userId) return;
    const { error } = await supabase.from('tribe_posts').insert({
      tribe_id: tribeId,
      user_id: userId,
      content,
    });
    if (error) {
      toast({ title: 'Error', description: 'Could not create post.', variant: 'destructive' });
      return;
    }
    await fetchPosts();
  }, [tribeId, userId, fetchPosts, toast]);

  const deletePost = useCallback(async (postId: string) => {
    await supabase.from('tribe_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const togglePin = useCallback(async (postId: string, pinned: boolean) => {
    await supabase.from('tribe_posts').update({ is_pinned: !pinned }).eq('id', postId);
    await fetchPosts();
  }, [fetchPosts]);

  const toggleLike = useCallback(async (postId: string, liked: boolean) => {
    if (!userId) return;
    if (liked) {
      await supabase.from('tribe_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('tribe_post_likes').insert({ post_id: postId, user_id: userId });
    }
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      liked_by_me: !liked,
      likes_count: liked ? p.likes_count - 1 : p.likes_count + 1,
    } : p));
  }, [userId]);

  const fetchComments = useCallback(async (postId: string): Promise<TribePostComment[]> => {
    const { data } = await supabase
      .from('tribe_post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!data?.length) return [];

    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('leaderboard_profiles')
      .select('user_id, display_name, avatar_emoji')
      .in('user_id', userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    return data.map(c => ({
      ...c,
      display_name: profileMap.get(c.user_id)?.display_name || 'Unknown',
      avatar_emoji: profileMap.get(c.user_id)?.avatar_emoji || null,
    }));
  }, []);

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!userId) return;
    await supabase.from('tribe_post_comments').insert({
      post_id: postId,
      user_id: userId,
      content,
    });
    // Update count optimistically
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      comments_count: p.comments_count + 1,
    } : p));
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!tribeId) return;
    const channel = supabase
      .channel(`tribe-posts-${tribeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tribe_posts',
        filter: `tribe_id=eq.${tribeId}`,
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tribeId, fetchPosts]);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    deletePost,
    togglePin,
    toggleLike,
    fetchComments,
    addComment,
  };
}
