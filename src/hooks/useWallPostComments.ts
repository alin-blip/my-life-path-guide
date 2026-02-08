import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WallPostCommentWithAuthor {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  author: {
    display_name: string;
    avatar_emoji: string | null;
  };
  replies?: WallPostCommentWithAuthor[];
}

export const useWallPostComments = (postId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<WallPostCommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('wall_post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      const commentsWithAuthors: WallPostCommentWithAuthor[] = data.map(c => ({
        ...c,
        author: profiles?.find(p => p.user_id === c.user_id) || { display_name: 'Warrior', avatar_emoji: '⚔️' },
      }));

      // Nest replies under parent comments
      const topLevel = commentsWithAuthors.filter(c => !c.parent_comment_id);
      const replies = commentsWithAuthors.filter(c => c.parent_comment_id);

      topLevel.forEach(comment => {
        comment.replies = replies.filter(r => r.parent_comment_id === comment.id);
      });

      setComments(topLevel);
    } else {
      setComments([]);
    }

    setLoading(false);
  }, [postId]);

  const addComment = async (content: string, parentCommentId?: string): Promise<boolean> => {
    if (!user || !postId) return false;

    const { error } = await supabase
      .from('wall_post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_comment_id: parentCommentId || null,
      });

    if (error) {
      toast({ title: 'Error posting comment', description: error.message, variant: 'destructive' });
      return false;
    }

    await fetchComments();
    return true;
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('wall_post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error deleting comment', description: error.message, variant: 'destructive' });
      return false;
    }

    await fetchComments();
    return true;
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post_comments_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wall_post_comments',
        filter: `post_id=eq.${postId}`,
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchComments]);

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
};
