import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface CoachTribe {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  is_public: boolean;
  created_at: string;
}

export interface TribeMember {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
  joined_at: string;
  role: string;
}

export function useCoachTribe(coachProfileId?: string, userId?: string) {
  const { toast } = useToast();
  
  const [coachTribe, setCoachTribe] = useState<CoachTribe | null>(null);
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch or create coach tribe
  const fetchCoachTribe = useCallback(async () => {
    if (!coachProfileId || !userId) return;

    try {
      // Check if coach already has a tribe
      const { data: existingTribe, error } = await supabase
        .from('tribes')
        .select('*')
        .eq('coach_id', coachProfileId)
        .eq('is_coach_tribe', true)
        .single();

      if (existingTribe) {
        setCoachTribe(existingTribe as CoachTribe);
        await fetchMembers(existingTribe.id);
      }
    } catch (error) {
      console.error('Error fetching coach tribe:', error);
    } finally {
      setLoading(false);
    }
  }, [coachProfileId, userId]);

  // Fetch tribe members
  const fetchMembers = useCallback(async (tribeId: string) => {
    try {
      const { data: membersData, error } = await supabase
        .from('tribe_members')
        .select('user_id, role, joined_at')
        .eq('tribe_id', tribeId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      if (membersData?.length) {
        const userIds = membersData.map(m => m.user_id);
        
        const { data: profiles } = await supabase
          .from('leaderboard_profiles')
          .select('user_id, display_name, avatar_emoji')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enrichedMembers: TribeMember[] = membersData.map(m => ({
          user_id: m.user_id,
          display_name: profileMap.get(m.user_id)?.display_name || 'Unknown',
          avatar_emoji: profileMap.get(m.user_id)?.avatar_emoji || null,
          joined_at: m.joined_at,
          role: m.role,
        }));

        setMembers(enrichedMembers);
      }
    } catch (error) {
      console.error('Error fetching tribe members:', error);
    }
  }, []);

  // Create coach tribe
  const createCoachTribe = useCallback(async (name: string, description?: string) => {
    if (!coachProfileId || !userId) return null;

    try {
      // Create tribe
      const { data: tribe, error } = await supabase
        .from('tribes')
        .insert({
          name,
          description: description || null,
          is_public: false,
          is_coach_tribe: true,
          coach_id: coachProfileId,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add coach as owner
      await supabase
        .from('tribe_members')
        .insert({
          tribe_id: tribe.id,
          user_id: userId,
          role: 'owner',
        });

      setCoachTribe(tribe as CoachTribe);
      
      toast({
        title: 'Tribe Created!',
        description: 'Your client community has been set up.',
      });

      await fetchMembers(tribe.id);
      return tribe;
    } catch (error) {
      console.error('Error creating coach tribe:', error);
      toast({
        title: 'Error',
        description: 'Could not create tribe. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [coachProfileId, userId, toast, fetchMembers]);

  // Add member to tribe (for when referral converts)
  const addMemberToTribe = useCallback(async (clientUserId: string) => {
    if (!coachTribe?.id) return false;

    try {
      // Check if already a member
      const { data: existing } = await supabase
        .from('tribe_members')
        .select('id')
        .eq('tribe_id', coachTribe.id)
        .eq('user_id', clientUserId)
        .single();

      if (existing) return true;

      const { error } = await supabase
        .from('tribe_members')
        .insert({
          tribe_id: coachTribe.id,
          user_id: clientUserId,
          role: 'member',
        });

      if (error) throw error;

      await fetchMembers(coachTribe.id);
      return true;
    } catch (error) {
      console.error('Error adding member to tribe:', error);
      return false;
    }
  }, [coachTribe?.id, fetchMembers]);

  // Remove member from tribe
  const removeMember = useCallback(async (clientUserId: string) => {
    if (!coachTribe?.id) return false;

    try {
      const { error } = await supabase
        .from('tribe_members')
        .delete()
        .eq('tribe_id', coachTribe.id)
        .eq('user_id', clientUserId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.user_id !== clientUserId));
      
      toast({
        title: 'Member Removed',
        description: 'The member has been removed from your tribe.',
      });
      
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Could not remove member. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [coachTribe?.id, toast]);

  useEffect(() => {
    fetchCoachTribe();
  }, [fetchCoachTribe]);

  return {
    coachTribe,
    members,
    loading,
    createCoachTribe,
    addMemberToTribe,
    removeMember,
    refreshMembers: () => coachTribe?.id && fetchMembers(coachTribe.id),
  };
}
