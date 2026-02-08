import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Tribe {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  created_by: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
}

export interface TribeMember {
  id: string;
  tribe_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  profile?: {
    display_name: string;
    avatar_emoji: string | null;
  };
}

export interface WallPost {
  id: string;
  user_id: string;
  tribe_id: string | null;
  content: string;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  category?: string | null;
  source_context?: string | null;
  source_label?: string | null;
  author?: {
    display_name: string;
    avatar_emoji: string | null;
  };
  is_liked?: boolean;
}

export interface WallPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  author?: {
    display_name: string;
    avatar_emoji: string | null;
  };
}

export interface BrotherhoodMessage {
  id: string;
  tribe_id: string | null;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  media_url: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_emoji: string | null;
  };
}

export const useBrotherhood = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [myTribes, setMyTribes] = useState<Tribe[]>([]);
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [messages, setMessages] = useState<BrotherhoodMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all public tribes
  const fetchTribes = async () => {
    const { data, error } = await supabase
      .from('tribes')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Error fetching tribes:', error);
      return;
    }
    setTribes(data || []);
  };

  // Fetch tribes user is a member of
  const fetchMyTribes = async () => {
    if (!user) return;
    
    const { data: memberData } = await supabase
      .from('tribe_members')
      .select('tribe_id')
      .eq('user_id', user.id);

    if (memberData && memberData.length > 0) {
      const tribeIds = memberData.map(m => m.tribe_id);
      const { data: tribesData } = await supabase
        .from('tribes')
        .select('*')
        .in('id', tribeIds);
      
      setMyTribes(tribesData || []);
    }
  };

  // Fetch wall posts
  const fetchPosts = async (tribeId?: string, categoryFilter?: string) => {
    let query = supabase
      .from('wall_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (tribeId) {
      query = query.eq('tribe_id', tribeId);
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      query = (query as any).eq('category', categoryFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    // Get author info for posts
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      // Check which posts user has liked
      let likedPostIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('wall_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(p => p.id));
        likedPostIds = likes?.map(l => l.post_id) || [];
      }

      const postsWithAuthors = data.map(post => ({
        ...post,
        author: profiles?.find(p => p.user_id === post.user_id) || { display_name: 'Warrior', avatar_emoji: '⚔️' },
        is_liked: likedPostIds.includes(post.id)
      }));

      setPosts(postsWithAuthors);
    } else {
      setPosts([]);
    }
  };

  // Fetch messages for a tribe
  const fetchMessages = async (tribeId: string) => {
    const { data, error } = await supabase
      .from('brotherhood_messages')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      const messagesWithSenders = data.map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
        sender: profiles?.find(p => p.user_id === msg.sender_id) || { display_name: 'Warrior', avatar_emoji: '⚔️' }
      }));

      setMessages(messagesWithSenders);
    } else {
      setMessages([]);
    }
  };

  // Create a new tribe
  const createTribe = async (name: string, description: string, isPublic: boolean = true) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('tribes')
      .insert({
        name,
        description,
        is_public: isPublic,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating tribe', description: error.message, variant: 'destructive' });
      return null;
    }

    // Add creator as owner
    await supabase.from('tribe_members').insert({
      tribe_id: data.id,
      user_id: user.id,
      role: 'owner'
    });

    toast({ title: 'Tribe created!', description: `${name} is now live.` });
    fetchTribes();
    fetchMyTribes();
    return data;
  };

  // Join a tribe
  const joinTribe = async (tribeId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('tribe_members')
      .insert({
        tribe_id: tribeId,
        user_id: user.id,
        role: 'member'
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already a member', description: 'You are already in this tribe.' });
      } else {
        toast({ title: 'Error joining tribe', description: error.message, variant: 'destructive' });
      }
      return false;
    }

    toast({ title: 'Joined tribe!', description: 'Welcome to the brotherhood.' });
    fetchMyTribes();
    return true;
  };

  // Leave a tribe
  const leaveTribe = async (tribeId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('tribe_members')
      .delete()
      .eq('tribe_id', tribeId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error leaving tribe', description: error.message, variant: 'destructive' });
      return false;
    }

    toast({ title: 'Left tribe', description: 'You have left the tribe.' });
    fetchMyTribes();
    return true;
  };

  // Create a wall post
  const createPost = async (
    content: string,
    tribeId?: string,
    mediaUrls?: string[],
    options?: {
      category?: string;
      source_context?: string;
      source_label?: string;
      notifyAll?: boolean;
      sendEmail?: boolean;
    }
  ) => {
    if (!user) return null;

    const insertData: any = {
      user_id: user.id,
      content,
      tribe_id: tribeId || null,
      media_urls: mediaUrls || null,
    };

    if (options?.category) insertData.category = options.category;
    if (options?.source_context) insertData.source_context = options.source_context;
    if (options?.source_label) insertData.source_label = options.source_label;

    const { data, error } = await supabase
      .from('wall_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating post', description: error.message, variant: 'destructive' });
      return null;
    }

    // Notify all members via in-app notifications
    if (options?.notifyAll) {
      try {
        // Get all community members except author
        const { data: allMembers } = await supabase
          .from('leaderboard_profiles')
          .select('user_id')
          .neq('user_id', user.id)
          .limit(1000);

        if (allMembers && allMembers.length > 0) {
          const preview = content.length > 80 ? content.substring(0, 80) + '...' : content;
          const notifications = allMembers.map(m => ({
            sender_id: user.id,
            recipient_id: m.user_id,
            title: '📢 Postare nouă în comunitate',
            message: preview,
            notification_type: 'community_post',
            tribe_id: tribeId || null,
          }));

          // Insert in batches of 100
          for (let i = 0; i < notifications.length; i += 100) {
            const batch = notifications.slice(i, i + 100);
            await supabase.from('push_notifications').insert(batch);
          }
        }
      } catch (err) {
        console.error('Error sending notifications:', err);
      }
    }

    // Send email notification via edge function
    if (options?.sendEmail) {
      try {
        await supabase.functions.invoke('notify-community-post', {
          body: { postId: data.id, content, authorId: user.id },
        });
      } catch (err) {
        console.error('Error sending email notifications:', err);
      }
    }

    toast({ title: 'Posted!', description: 'Your message is live.' });
    fetchPosts(tribeId);
    return data;
  };

  // Like/unlike a post
  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase
        .from('wall_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('wall_post_likes')
        .insert({ post_id: postId, user_id: user.id });
    }

    // Update local state
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));
  };

  // Send a message
  const sendMessage = async (content: string, tribeId: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('brotherhood_messages')
      .insert({
        sender_id: user.id,
        tribe_id: tribeId,
        content,
        message_type: 'text'
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
      return null;
    }

    return data;
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const postsChannel = supabase
      .channel('wall_posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('brotherhood_messages_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'brotherhood_messages' }, (payload) => {
        const newMessage = payload.new as BrotherhoodMessage;
        setMessages(prev => [...prev, { ...newMessage, message_type: newMessage.message_type as 'text' | 'image' | 'file' | 'system' }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTribes(), fetchMyTribes(), fetchPosts()]);
      setLoading(false);
    };
    load();
  }, [user]);

  return {
    tribes,
    myTribes,
    posts,
    messages,
    loading,
    fetchTribes,
    fetchMyTribes,
    fetchPosts,
    fetchMessages,
    createTribe,
    joinTribe,
    leaveTribe,
    createPost,
    toggleLike,
    sendMessage
  };
};
