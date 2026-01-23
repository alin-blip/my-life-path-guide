import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface CoachMessage {
  id: string;
  coach_id: string;
  client_id: string;
  content: string;
  sender_type: 'coach' | 'client';
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useCoachMessages(coachProfileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all conversations for coach
  const fetchConversations = useCallback(async () => {
    if (!coachProfileId) return;

    try {
      // Get all unique clients the coach has messages with
      const { data: messagesData, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('coach_id', coachProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by client_id
      const clientMap = new Map<string, { messages: CoachMessage[]; unread: number }>();
      
      for (const msg of messagesData || []) {
        const existing = clientMap.get(msg.client_id) || { messages: [], unread: 0 };
        existing.messages.push(msg as CoachMessage);
        if (!msg.is_read && msg.sender_type === 'client') {
          existing.unread++;
        }
        clientMap.set(msg.client_id, existing);
      }

      // Fetch client profiles
      const clientIds = Array.from(clientMap.keys());
      if (clientIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', clientIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const convs: Conversation[] = clientIds.map(clientId => {
        const data = clientMap.get(clientId)!;
        const profile = profileMap.get(clientId);
        const lastMsg = data.messages[0];

        return {
          client_id: clientId,
          client_name: profile?.display_name || 'Client',
          client_avatar: profile?.avatar_emoji || null,
          last_message: lastMsg?.content || '',
          last_message_at: lastMsg?.created_at || '',
          unread_count: data.unread,
        };
      });

      // Sort by last message date
      convs.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      setConversations(convs);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [coachProfileId]);

  // Fetch messages for a specific client
  const fetchMessages = useCallback(async (clientId: string) => {
    if (!coachProfileId) return;

    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('coach_id', coachProfileId)
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as CoachMessage[]);

      // Mark messages as read
      await supabase
        .from('coach_messages')
        .update({ is_read: true })
        .eq('coach_id', coachProfileId)
        .eq('client_id', clientId)
        .eq('sender_type', 'client')
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [coachProfileId]);

  // Send a message
  const sendMessage = useCallback(async (content: string, clientId: string) => {
    if (!coachProfileId || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .insert({
          coach_id: coachProfileId,
          client_id: clientId,
          content: content.trim(),
          sender_type: 'coach',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data as CoachMessage]);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [coachProfileId, toast, fetchConversations]);

  // Select a client conversation
  const selectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    fetchMessages(clientId);
  }, [fetchMessages]);

  // Initial load
  useEffect(() => {
    if (coachProfileId) {
      fetchConversations().finally(() => setLoading(false));
    }
  }, [coachProfileId, fetchConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!coachProfileId) return;

    const channel = supabase
      .channel('coach-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages',
          filter: `coach_id=eq.${coachProfileId}`,
        },
        (payload) => {
          const newMessage = payload.new as CoachMessage;
          
          // Add to messages if viewing this conversation
          if (selectedClientId === newMessage.client_id) {
            setMessages(prev => [...prev, newMessage]);
            
            // Mark as read
            supabase
              .from('coach_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
          
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfileId, selectedClientId, fetchConversations]);

  return {
    messages,
    conversations,
    selectedClientId,
    loading,
    sendMessage,
    selectClient,
    fetchConversations,
  };
}

// Hook for clients to message their coach
export function useClientCoachMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [coachProfile, setCoachProfile] = useState<{ id: string; display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the coach who referred this client
  const fetchCoachAndMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Find referral for this user
      const { data: referral } = await supabase
        .from('referrals')
        .select('coach_id')
        .eq('referred_user_id', user.id)
        .single();

      if (!referral) {
        setLoading(false);
        return;
      }

      // Get coach profile
      const { data: coach } = await supabase
        .from('coach_profiles')
        .select('id, display_name')
        .eq('id', referral.coach_id)
        .single();

      if (coach) {
        setCoachProfile(coach);

        // Fetch messages
        const { data: msgs } = await supabase
          .from('coach_messages')
          .select('*')
          .eq('coach_id', coach.id)
          .eq('client_id', user.id)
          .order('created_at', { ascending: true });

        setMessages(msgs as CoachMessage[] || []);

        // Mark as read
        await supabase
          .from('coach_messages')
          .update({ is_read: true })
          .eq('coach_id', coach.id)
          .eq('client_id', user.id)
          .eq('sender_type', 'coach')
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error fetching coach messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !coachProfile?.id || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .insert({
          coach_id: coachProfile.id,
          client_id: user.id,
          content: content.trim(),
          sender_type: 'client',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data as CoachMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id, coachProfile?.id, toast]);

  useEffect(() => {
    fetchCoachAndMessages();
  }, [fetchCoachAndMessages]);

  // Real-time subscription for client
  useEffect(() => {
    if (!user?.id || !coachProfile?.id) return;

    const channel = supabase
      .channel('client-coach-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages',
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as CoachMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, coachProfile?.id]);

  return {
    messages,
    coachProfile,
    loading,
    sendMessage,
    hasCoach: !!coachProfile,
  };
}
