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
  parent_id: string | null;
  video_url: string | null;
  user_email?: string;
  display_name?: string;
  replies?: ModuleComment[];
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

      // Process comments to build tree structure
      const commentsWithUsers = (data || []).map(comment => ({
        ...comment,
        display_name: (comment as any).author_name || comment.user_id.substring(0, 8) + '...',
        replies: [] as ModuleComment[]
      }));

      // Separate parent comments and replies
      const parentComments: ModuleComment[] = [];
      const repliesMap: Record<string, ModuleComment[]> = {};

      commentsWithUsers.forEach(comment => {
        if (comment.parent_id) {
          if (!repliesMap[comment.parent_id]) {
            repliesMap[comment.parent_id] = [];
          }
          repliesMap[comment.parent_id].push(comment);
        } else {
          parentComments.push(comment);
        }
      });

      // Attach replies to parent comments
      parentComments.forEach(comment => {
        comment.replies = (repliesMap[comment.id] || []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setComments(parentComments);
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
  const addComment = useCallback(async (content: string, parentId?: string, videoUrl?: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a lăsa un comentariu');
      return false;
    }

    if (!content.trim() && !videoUrl) {
      toast.error('Comentariul nu poate fi gol');
      return false;
    }

    // Extract author name from user metadata or email
    const authorName = (user as any).user_metadata?.full_name 
      || (user as any).user_metadata?.name
      || user.email?.split('@')[0] 
      || 'Utilizator';

    try {
      const { data, error } = await supabase
        .from('warriors_way_comments')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          content: content.trim(),
          parent_id: parentId || null,
          video_url: videoUrl || null,
          author_name: authorName
        })
        .select()
        .single();

      if (error) throw error;

      const newComment: ModuleComment = {
        ...data,
        display_name: authorName,
        replies: []
      };

      if (parentId) {
        // Add as reply
        setComments(prev => prev.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        }));
        toast.success('Răspuns postat! 💬');
      } else {
        // Add as parent comment
        setComments(prev => [newComment, ...prev]);
        toast.success('Comentariu postat! 💬');
      }
      
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

      // Remove from local state (handles both parent and replies)
      setComments(prev => {
        return prev
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: (c.replies || []).filter(r => r.id !== commentId)
          }));
      });
      
      toast.success('Comentariu șters');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Eroare la ștergerea comentariului');
      return false;
    }
  }, [user]);

  // Get all comment IDs (for reactions)
  const getAllCommentIds = useCallback(() => {
    const ids: string[] = [];
    comments.forEach(c => {
      ids.push(c.id);
      (c.replies || []).forEach(r => ids.push(r.id));
    });
    return ids;
  }, [comments]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    refetch: fetchComments,
    commentCount: comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0),
    canComment: !!user,
    getAllCommentIds
  };
};
