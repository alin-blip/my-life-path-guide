import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCoachDashboard } from '@/hooks/useCoachDashboard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { CoachOnboarding } from '@/components/coach/CoachOnboarding';
import { CoachStats } from '@/components/coach/CoachStats';
import { CoachReferralLink } from '@/components/coach/CoachReferralLink';
import { CoachClients } from '@/components/coach/CoachClients';
import { CoachEarnings } from '@/components/coach/CoachEarnings';
import { CoachInbox } from '@/components/coach/CoachInbox';
import { CoachClientProgress } from '@/components/coach/CoachClientProgress';
import { CoachTribeManager } from '@/components/coach/CoachTribeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, MessageSquare, Activity, Loader2 } from 'lucide-react';

const CoachDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
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
  } = useCoachDashboard();

  useEffect(() => {
    const onboardingStatus = searchParams.get('onboarding');
    
    if (onboardingStatus === 'complete') {
      toast({
        title: 'Stripe Connected!',
        description: 'Your payout account is now set up.',
      });
      refreshData();
    } else if (onboardingStatus === 'refresh') {
      toast({
        title: 'Onboarding Incomplete',
        description: 'Please complete your Stripe onboarding to receive payouts.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, refreshData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach) {
    return <CoachOnboarding onCreateProfile={createCoachProfile} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Coach Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {coachProfile?.display_name}
        </p>
      </div>

      <CoachStats 
        stats={stats}
        stripeConnected={!!coachProfile?.stripe_onboarding_complete}
        onConnectStripe={startStripeOnboarding}
      />

      <div className="mt-8">
        <CoachReferralLink
          referralLink={getReferralLink()}
          onCopy={copyReferralLink}
          referralCode={coachProfile?.referral_code || ''}
        />
      </div>

      <Tabs defaultValue="clients" className="mt-8">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="clients" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clients</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="tribe" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tribe</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Earnings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-6">
          <CoachClients referrals={referrals} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          {coachProfile && <CoachClientProgress coachProfileId={coachProfile.id} />}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          {coachProfile && <CoachInbox coachProfileId={coachProfile.id} />}
        </TabsContent>

        <TabsContent value="tribe" className="mt-6">
          {coachProfile && user && (
            <CoachTribeManager 
              coachProfileId={coachProfile.id} 
              userId={user.id}
              coachName={coachProfile.display_name}
            />
          )}
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          <CoachEarnings 
            commissions={commissions}
            pendingPayout={stats.pendingPayout}
            stripeConnected={!!coachProfile?.stripe_onboarding_complete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachDashboard;
