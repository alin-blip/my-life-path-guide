import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface ModuleComment {
  id: string;
  user_id: string;
  module_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  display_name?: string;
}

export const useModuleComments = (moduleId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ModuleComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments for the module
  const fetchComments = useCallback(async () => {
    if (!moduleId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('warriors_way_comments')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs to fetch their profiles/emails
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      
      // Fetch user emails from auth (we'll use email as display name for now)
      const commentsWithUsers = (data || []).map(comment => ({
        ...comment,
        display_name: comment.user_id.substring(0, 8) + '...' // Fallback display
      }));

      setComments(commentsWithUsers);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a new comment
  const addComment = useCallback(async (content: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a lăsa un comentariu');
      return false;
    }

    if (!content.trim()) {
      toast.error('Comentariul nu poate fi gol');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('warriors_way_comments')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newComment: ModuleComment = {
        ...data,
        display_name: user.email?.split('@')[0] || 'Utilizator'
      };

      setComments(prev => [newComment, ...prev]);
      toast.success('Comentariu postat! 💬');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Eroare la postarea comentariului');
      return false;
    }
  }, [user, moduleId]);

  // Delete a comment (only own comments)
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('warriors_way_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comentariu șters');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Eroare la ștergerea comentariului');
      return false;
    }
  }, [user]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    refetch: fetchComments,
    commentCount: comments.length,
    canComment: !!user
  };
};
