import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, DollarSign, TrendingUp, Search, CheckCircle2, 
  XCircle, Shield, CreditCard, RefreshCw, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CoachProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  referral_code: string;
  commission_rate: number;
  total_referrals: number | null;
  total_earnings: number | null;
  pending_payout: number | null;
  is_verified: boolean | null;
  stripe_onboarding_complete: boolean | null;
  created_at: string;
}

interface PayoutRecord {
  id: string;
  coach_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_transfer_id: string | null;
  created_at: string;
  coach_name?: string;
}

export const AdminCoaches: React.FC = () => {
  const { toast } = useToast();
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalCoaches: 0,
    verifiedCoaches: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch coaches
      const { data: coachesData, error: coachesError } = await supabase
        .from('coach_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (coachesError) throw coachesError;

      setCoaches(coachesData as CoachProfile[]);

      // Calculate stats
      const totalEarnings = coachesData.reduce((sum, c) => sum + (c.total_earnings || 0), 0);
      const pendingPayouts = coachesData.reduce((sum, c) => sum + (c.pending_payout || 0), 0);
      const verifiedCount = coachesData.filter(c => c.is_verified).length;

      setStats({
        totalCoaches: coachesData.length,
        verifiedCoaches: verifiedCount,
        totalEarnings,
        pendingPayouts,
      });

      // Fetch recent payouts
      const { data: payoutsData } = await supabase
        .from('payout_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (payoutsData) {
        // Enrich with coach names
        const coachMap = new Map(coachesData.map(c => [c.id, c.display_name]));
        const enrichedPayouts = payoutsData.map(p => ({
          ...p,
          coach_name: coachMap.get(p.coach_id) || 'Unknown',
        }));
        setPayouts(enrichedPayouts);
      }
    } catch (error) {
      console.error('Error fetching coach data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coach data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleVerification = async (coach: CoachProfile) => {
    try {
      const { error } = await supabase
        .from('coach_profiles')
        .update({ is_verified: !coach.is_verified })
        .eq('id', coach.id);

      if (error) throw error;

      setCoaches(prev => 
        prev.map(c => c.id === coach.id ? { ...c, is_verified: !c.is_verified } : c)
      );

      toast({
        title: coach.is_verified ? 'Verification Removed' : 'Coach Verified',
        description: `${coach.display_name} has been ${coach.is_verified ? 'unverified' : 'verified'}.`,
      });
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive',
      });
    }
  };

  const triggerPayout = async (coachId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-coach-payouts', {
        body: { coachId, force: true },
      });

      if (error) throw error;

      toast({
        title: 'Payout Triggered',
        description: 'The payout has been processed.',
      });

      fetchData();
    } catch (error) {
      console.error('Error triggering payout:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payout',
        variant: 'destructive',
      });
    }
  };

  const filteredCoaches = coaches.filter(c => 
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCoaches}</p>
                <p className="text-sm text-muted-foreground">Total Coaches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verifiedCoaches}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{stats.pendingPayouts.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="coaches">
        <TabsList>
          <TabsTrigger value="coaches" className="gap-2">
            <Users className="h-4 w-4" />
            Coaches
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payout History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coaches" className="mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Coach Profiles</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coaches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coach</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoaches.map((coach) => (
                      <TableRow key={coach.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-sm">
                                {coach.display_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{coach.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(coach.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {coach.referral_code}
                          </code>
                        </TableCell>
                        <TableCell>{coach.total_referrals || 0}</TableCell>
                        <TableCell>€{(coach.total_earnings || 0).toFixed(2)}</TableCell>
                        <TableCell>€{(coach.pending_payout || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {coach.is_verified ? (
                              <Badge className="bg-green-500/10 text-green-600 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Unverified
                              </Badge>
                            )}
                            {coach.stripe_onboarding_complete && (
                              <Badge variant="outline" className="gap-1">
                                <CreditCard className="h-3 w-3" />
                                Stripe
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVerification(coach)}
                            >
                              {coach.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                            {(coach.pending_payout || 0) > 0 && coach.stripe_onboarding_complete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => triggerPayout(coach.id)}
                                className="gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Payout
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                All coach payouts processed through Stripe Connect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Coach</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transfer ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {format(new Date(payout.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{payout.coach_name}</TableCell>
                        <TableCell className="font-medium">
                          €{payout.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.stripe_transfer_id ? (
                            <code className="text-xs">{payout.stripe_transfer_id}</code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
