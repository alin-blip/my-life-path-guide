import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, DollarSign, TrendingUp, Clock, Percent, AlertCircle, ExternalLink } from 'lucide-react';

interface CoachStats {
  activeClients: number;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  thisMonthEarnings: number;
  conversionRate: number;
}

interface CoachStatsProps {
  stats: CoachStats;
  stripeConnected: boolean;
  onConnectStripe: () => void;
}

export const CoachStats: React.FC<CoachStatsProps> = ({
  stats,
  stripeConnected,
  onConnectStripe,
}) => {
  const statCards = [
    {
      title: 'Active Clients',
      value: stats.activeClients.toString(),
      icon: Users,
      description: 'Paying subscribers',
      color: 'text-blue-500',
    },
    {
      title: 'Total Earnings',
      value: `€${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'All time',
      color: 'text-green-500',
    },
    {
      title: 'This Month',
      value: `€${stats.thisMonthEarnings.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Current month earnings',
      color: 'text-purple-500',
    },
    {
      title: 'Pending Payout',
      value: `€${stats.pendingPayout.toFixed(2)}`,
      icon: Clock,
      description: 'Available balance',
      color: 'text-orange-500',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Percent,
      description: 'Referrals → Paid',
      color: 'text-cyan-500',
    },
    {
      title: 'Total Referrals',
      value: stats.totalReferrals.toString(),
      icon: Users,
      description: 'All referred users',
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stripe Connection Alert */}
      {!stripeConnected && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-foreground">
              Connect your Stripe account to receive payouts for your commissions.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onConnectStripe}
              className="ml-4 shrink-0"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Stripe
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
