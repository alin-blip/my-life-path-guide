import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partner_id: string;
  partner_name: string;
  partner_emoji: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    setUnreadTotal(count || 0);
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get all messages where user is sender or receiver
      const { data: allMessages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!allMessages?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const convMap = new Map<string, { messages: DirectMessage[]; unread: number }>();
      for (const msg of allMessages) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { messages: [], unread: 0 });
        }
        const conv = convMap.get(partnerId)!;
        conv.messages.push(msg);
        if (msg.receiver_id === user.id && !msg.is_read) {
          conv.unread++;
        }
      }

      // Fetch partner profiles
      const partnerIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', partnerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const convList: Conversation[] = partnerIds.map(partnerId => {
        const conv = convMap.get(partnerId)!;
        const lastMsg = conv.messages[0];
        const profile = profileMap.get(partnerId);
        return {
          partner_id: partnerId,
          partner_name: profile?.display_name || 'User',
          partner_emoji: profile?.avatar_emoji || '📚',
          last_message: lastMsg.content,
          last_message_at: lastMsg.created_at,
          unread_count: conv.unread,
        };
      });

      convList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(convList);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      fetchUnreadCount();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchUnreadCount]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return;
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    // Optimistic update: add message to state immediately
    if (data) {
      setMessages(prev => [...prev, data as DirectMessage]);
      fetchConversations();
    }
    return data;
  }, [user, fetchConversations]);

  const sendBulkMessage = useCallback(async (receiverIds: string[], content: string) => {
    if (!user || !content.trim() || receiverIds.length === 0) return [];
    const inserts = receiverIds.map(receiverId => ({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    }));
    const { data, error } = await supabase
      .from('direct_messages')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error sending bulk messages:', error);
      return [];
    }
    // Refresh conversations after bulk send
    fetchConversations();
    return data || [];
  }, [user, fetchConversations]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('direct_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            // Deduplicate: only add if not already in state (from optimistic update)
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            fetchConversations();
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, fetchUnreadCount]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    conversations,
    messages,
    unreadTotal,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    sendBulkMessage,
    fetchUnreadCount,
  };
};
