import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCoachDashboard } from '@/hooks/useCoachDashboard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CoachOnboarding } from '@/components/coach/CoachOnboarding';
import { CoachStats } from '@/components/coach/CoachStats';
import { CoachReferralLink } from '@/components/coach/CoachReferralLink';
import { CoachClients } from '@/components/coach/CoachClients';
import { CoachEarnings } from '@/components/coach/CoachEarnings';
import { CoachInbox } from '@/components/coach/CoachInbox';
import { CoachClientProgress } from '@/components/coach/CoachClientProgress';
import { CoachTribeManager } from '@/components/coach/CoachTribeManager';
import { CoachContentManager } from '@/components/coach/CoachContentManager';
import { CoachRoutineTemplates } from '@/components/coach/CoachRoutineTemplates';
import { CoachWorkoutPrograms } from '@/components/coach/CoachWorkoutPrograms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  MessageSquare, 
  Activity, 
  Loader2, 
  Package, 
  Target,
  Crown,
  Brain,
  Zap,
  LayoutList,
  Dumbbell,
} from 'lucide-react';

const content = {
  ro: {
    title: 'Centrul de Comandă Coach',
    subtitle: 'Bine ai revenit',
    activeToday: 'clienți executând azi',
    
    // Tabs
    tabClients: 'Rezultate',
    tabProgress: 'Execuție',
    tabMessages: 'Intervenții',
    tabTribe: 'Brotherhood',
    tabRoutines: 'Rutine',
    tabWorkouts: 'Antrenamente',
    tabContent: 'Resurse',
    tabEarnings: 'Venituri',
    
    // Toast messages
    stripeConnected: 'Stripe Conectat!',
    stripeConnectedDesc: 'Contul tău de plăți este acum activ.',
    stripeIncomplete: 'Onboarding Incomplet',
    stripeIncompleteDesc: 'Finalizează onboarding-ul Stripe pentru a primi plăți.',
    
    // Quick stats
    quickStatsTitle: 'Astăzi în Dashboard-ul Tău',
    executingNow: 'Clienți activi acum',
    pendingAction: 'Au nevoie de atenție',
    monthlyRevenue: 'Venit lunar estimat',
  },
  en: {
    title: 'Coach Command Center',
    subtitle: 'Welcome back',
    activeToday: 'clients executing today',
    
    // Tabs
    tabClients: 'Results',
    tabProgress: 'Execution',
    tabMessages: 'Interventions',
    tabTribe: 'Brotherhood',
    tabRoutines: 'Routines',
    tabWorkouts: 'Workouts',
    tabContent: 'Resources',
    tabEarnings: 'Earnings',
    
    // Toast messages
    stripeConnected: 'Stripe Connected!',
    stripeConnectedDesc: 'Your payout account is now set up.',
    stripeIncomplete: 'Onboarding Incomplete',
    stripeIncompleteDesc: 'Complete Stripe onboarding to receive payouts.',
    
    // Quick stats
    quickStatsTitle: 'Today in Your Dashboard',
    executingNow: 'Clients active now',
    pendingAction: 'Need attention',
    monthlyRevenue: 'Est. monthly revenue',
  }
};

const CoachDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
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
        title: t.stripeConnected,
        description: t.stripeConnectedDesc,
      });
      refreshData();
    } else if (onboardingStatus === 'refresh') {
      toast({
        title: t.stripeIncomplete,
        description: t.stripeIncompleteDesc,
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, refreshData, t]);

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

  // Calculate clients needing attention (inactive 3+ days would need real data)
  const clientsNeedingAttention = Math.max(0, stats.totalReferrals - stats.activeClients);
  const estimatedMonthlyRevenue = stats.activeClients * 25; // Rough estimate at €50/mo * 50%

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.subtitle}, <span className="font-semibold text-foreground">{coachProfile?.display_name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.executingNow}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeClients}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.pendingAction}</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {clientsNeedingAttention}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.monthlyRevenue}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  €{estimatedMonthlyRevenue}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
        <TabsList className="grid w-full max-w-5xl grid-cols-8 h-auto">
          <TabsTrigger value="clients" className="gap-2 py-3">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabClients}</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2 py-3">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabProgress}</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabMessages}</span>
          </TabsTrigger>
          <TabsTrigger value="tribe" className="gap-2 py-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabTribe}</span>
          </TabsTrigger>
          <TabsTrigger value="routines" className="gap-2 py-3">
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabRoutines}</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-2 py-3">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabWorkouts}</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2 py-3">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabContent}</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2 py-3">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabEarnings}</span>
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

        <TabsContent value="routines" className="mt-6">
          {coachProfile && user && (
            <CoachRoutineTemplates coachProfileId={coachProfile.id} userId={user.id} />
          )}
        </TabsContent>

        <TabsContent value="workouts" className="mt-6">
          {coachProfile && user && (
            <CoachWorkoutPrograms coachProfileId={coachProfile.id} userId={user.id} />
          )}
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          {coachProfile && <CoachContentManager coachProfileId={coachProfile.id} />}
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
