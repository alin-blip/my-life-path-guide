import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type ReactionType = 'like' | 'love' | 'fire' | 'muscle' | 'clap';

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionCount {
  type: ReactionType;
  count: number;
  hasUserReacted: boolean;
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
  muscle: '💪',
  clap: '👏'
};

export const useCommentReactions = (commentIds: string[]) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, CommentReaction[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reactions for all comments
  const fetchReactions = useCallback(async () => {
    if (!commentIds.length) {
      setReactions({});
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('warriors_comment_reactions')
        .select('*')
        .in('comment_id', commentIds);

      if (error) throw error;

      // Group reactions by comment_id
      const grouped: Record<string, CommentReaction[]> = {};
      (data || []).forEach((reaction) => {
        if (!grouped[reaction.comment_id]) {
          grouped[reaction.comment_id] = [];
        }
        grouped[reaction.comment_id].push(reaction as CommentReaction);
      });

      setReactions(grouped);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [commentIds.join(',')]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Get reaction counts for a specific comment
  const getReactionCounts = useCallback((commentId: string): ReactionCount[] => {
    const commentReactions = reactions[commentId] || [];
    const counts: Record<ReactionType, { count: number; hasUserReacted: boolean }> = {
      like: { count: 0, hasUserReacted: false },
      love: { count: 0, hasUserReacted: false },
      fire: { count: 0, hasUserReacted: false },
      muscle: { count: 0, hasUserReacted: false },
      clap: { count: 0, hasUserReacted: false }
    };

    commentReactions.forEach((reaction) => {
      if (counts[reaction.reaction_type]) {
        counts[reaction.reaction_type].count++;
        if (reaction.user_id === user?.id) {
          counts[reaction.reaction_type].hasUserReacted = true;
        }
      }
    });

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        type: type as ReactionType,
        count: data.count,
        hasUserReacted: data.hasUserReacted
      }));
  }, [reactions, user?.id]);

  // Toggle reaction (add or remove)
  const toggleReaction = useCallback(async (commentId: string, reactionType: ReactionType) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a reacționa');
      return false;
    }

    const commentReactions = reactions[commentId] || [];
    const existingReaction = commentReactions.find(
      r => r.user_id === user.id && r.reaction_type === reactionType
    );

    try {
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('warriors_comment_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;

        // Update local state
        setReactions(prev => ({
          ...prev,
          [commentId]: (prev[commentId] || []).filter(r => r.id !== existingReaction.id)
        }));
      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('warriors_comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setReactions(prev => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), data as CommentReaction]
        }));
      }

      return true;
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Eroare la adăugarea reacției');
      return false;
    }
  }, [user, reactions]);

  return {
    reactions,
    isLoading,
    getReactionCounts,
    toggleReaction,
    refetch: fetchReactions
  };
};
