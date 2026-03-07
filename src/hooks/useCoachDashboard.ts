import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface CoachProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  referral_code: string;
  stripe_connect_id: string | null;
  stripe_onboarding_complete: boolean | null;
  commission_rate: number;
  total_referrals: number | null;
  total_earnings: number | null;
  pending_payout: number | null;
  is_verified: boolean | null;
  created_at: string;
}

export interface Referral {
  id: string;
  coach_id: string;
  referred_user_id: string;
  referral_code: string;
  status: string | null;
  first_payment_at: string | null;
  lifetime_value: number | null;
  created_at: string;
}

export interface Commission {
  id: string;
  referral_id: string;
  coach_id: string;
  amount: number;
  original_payment: number;
  currency: string;
  stripe_payment_id: string | null;
  status: string;
  stripe_transfer_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface CoachStats {
  activeClients: number;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  thisMonthEarnings: number;
  conversionRate: number;
}

export function useCoachDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CoachStats>({
    activeClients: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    thisMonthEarnings: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);

  const fetchCoachProfile = useCallback(async () => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching coach profile:', error);
      return null;
    }

    return data as CoachProfile | null;
  }, [user?.id]);

  const fetchReferrals = useCallback(async (coachId: string) => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }

    return data as Referral[];
  }, []);

  const fetchCommissions = useCallback(async (coachId: string) => {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }

    return data as Commission[];
  }, []);

  const calculateStats = useCallback((
    profile: CoachProfile | null,
    refs: Referral[],
    comms: Commission[]
  ): CoachStats => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeClients = refs.filter(r => r.status === 'active').length;
    const totalReferrals = refs.length;
    const totalEarnings = profile?.total_earnings || 0;
    const pendingPayout = profile?.pending_payout || 0;

    const thisMonthEarnings = comms
      .filter(c => new Date(c.created_at) >= thisMonthStart)
      .reduce((sum, c) => sum + c.amount, 0);

    const paidReferrals = refs.filter(r => r.first_payment_at).length;
    const conversionRate = totalReferrals > 0 
      ? Math.round((paidReferrals / totalReferrals) * 100) 
      : 0;

    return {
      activeClients,
      totalReferrals,
      totalEarnings,
      pendingPayout,
      thisMonthEarnings,
      conversionRate,
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await fetchCoachProfile();
      setCoachProfile(profile);
      setIsCoach(!!profile);

      if (profile) {
        const [refs, comms] = await Promise.all([
          fetchReferrals(profile.id),
          fetchCommissions(profile.id),
        ]);

        setReferrals(refs);
        setCommissions(comms);
        setStats(calculateStats(profile, refs, comms));
      }
    } catch (error) {
      console.error('Error refreshing coach data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchCoachProfile, fetchReferrals, fetchCommissions, calculateStats]);

  const startStripeOnboarding = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-coach-connect-account');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      toast({
        title: 'Error',
        description: 'Could not start Stripe onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const createCoachProfile = useCallback(async (displayName: string, bio?: string) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('coach_profiles')
      .insert({
        user_id: user.id,
        display_name: displayName,
        bio: bio || null,
        referral_code: '', // Will be auto-generated by trigger
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating coach profile:', error);
      toast({
        title: 'Error',
        description: 'Could not create coach profile. Please try again.',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Success',
      description: 'Coach profile created successfully!',
    });

    await refreshData();
    return data as CoachProfile;
  }, [user?.id, toast, refreshData]);

  const getReferralLink = useCallback(() => {
    if (!coachProfile?.referral_code) return '';
    return `${window.location.origin}/?coach=${coachProfile.referral_code}`;
  }, [coachProfile?.referral_code]);

  const copyReferralLink = useCallback(async () => {
    const link = getReferralLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your clients.',
      });
    } catch (err) {
      console.warn('Could not copy referral link to clipboard:', err);
      toast({
        title: 'Error',
        description: 'Could not copy link. Please try again.',
        variant: 'destructive',
      });
    }
  }, [getReferralLink, toast]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time updates for commissions
  useEffect(() => {
    if (!coachProfile?.id) return;

    const channel = supabase
      .channel('coach-commissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commissions',
          filter: `coach_id=eq.${coachProfile.id}`,
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfile?.id, refreshData]);

  return {
    coachProfile,
    referrals,
    commissions,
    stats,
    loading,
    isCoach,
    refreshData,
    startStripeOnboarding,
    createCoachProfile,
    getReferralLink,
    copyReferralLink,
  };
}
