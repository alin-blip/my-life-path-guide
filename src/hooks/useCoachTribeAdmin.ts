import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface TribeInvite {
  id: string;
  tribe_id: string;
  invite_code: string;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface TribeJoinRequest {
  id: string;
  tribe_id: string;
  user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  display_name?: string;
}

export function useCoachTribeAdmin(tribeId?: string, userId?: string) {
  const { toast } = useToast();
  const [invites, setInvites] = useState<TribeInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<TribeJoinRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    if (!tribeId) return;
    const { data } = await supabase
      .from('tribe_invites')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: false });
    setInvites((data as TribeInvite[]) || []);
  }, [tribeId]);

  const fetchJoinRequests = useCallback(async () => {
    if (!tribeId) return;
    const { data } = await supabase
      .from('tribe_join_requests')
      .select('*')
      .eq('tribe_id', tribeId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (data?.length) {
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      setJoinRequests(data.map(r => ({
        ...r,
        display_name: profileMap.get(r.user_id) || r.user_id.slice(0, 8),
      })) as TribeJoinRequest[]);
    } else {
      setJoinRequests([]);
    }
  }, [tribeId]);

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createInvite = useCallback(async (maxUses?: number) => {
    if (!tribeId || !userId) return null;
    const code = generateInviteCode();
    const { data, error } = await supabase
      .from('tribe_invites')
      .insert({
        tribe_id: tribeId,
        invite_code: code,
        created_by: userId,
        max_uses: maxUses || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Could not create invite.', variant: 'destructive' });
      return null;
    }
    await fetchInvites();
    toast({ title: 'Invite Created', description: `Code: ${code}` });
    return data;
  }, [tribeId, userId, fetchInvites, toast]);

  const deactivateInvite = useCallback(async (inviteId: string) => {
    await supabase.from('tribe_invites').update({ is_active: false }).eq('id', inviteId);
    await fetchInvites();
  }, [fetchInvites]);

  const approveRequest = useCallback(async (requestId: string, requestUserId: string) => {
    if (!tribeId || !userId) return;
    setLoading(true);
    try {
      // Add as member
      await supabase.from('tribe_members').insert({
        tribe_id: tribeId,
        user_id: requestUserId,
        role: 'member',
      });
      // Update request
      await supabase.from('tribe_join_requests').update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      }).eq('id', requestId);
      await fetchJoinRequests();
      toast({ title: 'Approved', description: 'Member added to tribe.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not approve request.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tribeId, userId, fetchJoinRequests, toast]);

  const rejectRequest = useCallback(async (requestId: string) => {
    if (!userId) return;
    await supabase.from('tribe_join_requests').update({
      status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId);
    await fetchJoinRequests();
    toast({ title: 'Rejected', description: 'Request has been rejected.' });
  }, [userId, fetchJoinRequests, toast]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    if (!tribeId) return;
    const { error } = await supabase
      .from('tribe_members')
      .update({ role: newRole })
      .eq('tribe_id', tribeId)
      .eq('user_id', memberId);
    if (!error) {
      toast({ title: 'Role Updated' });
    }
  }, [tribeId, toast]);

  const kickMember = useCallback(async (memberId: string) => {
    if (!tribeId) return;
    const { error } = await supabase
      .from('tribe_members')
      .delete()
      .eq('tribe_id', tribeId)
      .eq('user_id', memberId);
    if (!error) {
      toast({ title: 'Member Removed' });
    }
  }, [tribeId, toast]);

  const toggleApprovalMode = useCallback(async (requiresApproval: boolean) => {
    if (!tribeId) return;
    await supabase.from('tribes').update({ requires_approval: requiresApproval }).eq('id', tribeId);
  }, [tribeId]);

  return {
    invites,
    joinRequests,
    loading,
    fetchInvites,
    fetchJoinRequests,
    createInvite,
    deactivateInvite,
    approveRequest,
    rejectRequest,
    updateMemberRole,
    kickMember,
    toggleApprovalMode,
  };
}
