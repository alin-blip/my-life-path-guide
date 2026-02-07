import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface LiveChatMessage {
  id: string;
  user_id: string;
  module_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  parent_id: string | null;
}

export const useChallengeLiveChat = (dayNumber?: number) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Use a single chat room for all days or filter by day
  const moduleId = dayNumber ? `challenge-live-chat-day-${dayNumber}` : undefined;

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('warriors_way_comments')
        .select('id, user_id, module_id, content, created_at, author_name, parent_id')
        .order('created_at', { ascending: true });

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      } else {
        // For admin view - fetch all live chat messages
        query = query.like('module_id', 'challenge-live-chat-%');
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchMessages();

    // Set up realtime subscription
    const filter = moduleId
      ? `module_id=eq.${moduleId}`
      : `module_id=like.challenge-live-chat-%`;

    const channel = supabase
      .channel(`live-chat-${moduleId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'warriors_way_comments',
          filter,
        },
        (payload) => {
          const newMsg = payload.new as LiveChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'warriors_way_comments',
          filter,
        },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchMessages, moduleId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !moduleId) {
        toast.error('Trebuie să fii autentificat');
        return false;
      }

      if (!content.trim()) return false;

      const authorName =
        (user as any).user_metadata?.full_name ||
        (user as any).user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Utilizator';

      try {
        const { error } = await supabase.from('warriors_way_comments').insert({
          user_id: user.id,
          module_id: moduleId,
          content: content.trim(),
          author_name: authorName,
          parent_id: null,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Eroare la trimiterea mesajului');
        return false;
      }
    },
    [user, moduleId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const { error } = await supabase
          .from('warriors_way_comments')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
        toast.success('Mesaj șters');
        return true;
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Eroare la ștergerea mesajului');
        return false;
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
};
