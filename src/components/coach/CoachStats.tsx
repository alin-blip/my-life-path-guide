import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, DollarSign, TrendingUp, Clock, Percent, AlertCircle, ExternalLink, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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

const content = {
  ro: {
    stripeAlert: 'Conectează contul Stripe pentru a primi plăți pentru comisioanele tale.',
    connectStripe: 'Conectează Stripe',
    
    activeClients: 'Clienți Activi',
    activeClientsDesc: 'executând zilnic',
    
    totalEarnings: 'Total Câștigat',
    totalEarningsDesc: 'de la început',
    
    thisMonth: 'Luna Aceasta',
    thisMonthDesc: 'venituri curente',
    
    pendingPayout: 'De Încasat',
    pendingPayoutDesc: 'balanță disponibilă',
    
    conversionRate: 'Rată Conversie',
    conversionRateDesc: 'referrals → plătitori',
    
    totalReferrals: 'Total Referrals',
    totalReferralsDesc: 'toți utilizatorii aduși',
    
    perClient: '/client/lună pentru tine',
  },
  en: {
    stripeAlert: 'Connect your Stripe account to receive payouts for your commissions.',
    connectStripe: 'Connect Stripe',
    
    activeClients: 'Active Clients',
    activeClientsDesc: 'executing daily',
    
    totalEarnings: 'Total Earnings',
    totalEarningsDesc: 'all time',
    
    thisMonth: 'This Month',
    thisMonthDesc: 'current earnings',
    
    pendingPayout: 'Pending Payout',
    pendingPayoutDesc: 'available balance',
    
    conversionRate: 'Conversion Rate',
    conversionRateDesc: 'referrals → paying',
    
    totalReferrals: 'Total Referrals',
    totalReferralsDesc: 'all referred users',
    
    perClient: '/client/month for you',
  }
};

export const CoachStats: React.FC<CoachStatsProps> = ({
  stats,
  stripeConnected,
  onConnectStripe,
}) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
  // Calculate average per client
  const avgPerClient = stats.activeClients > 0 
    ? (stats.thisMonthEarnings / stats.activeClients).toFixed(0) 
    : '0';

  const statCards = [
    {
      title: t.activeClients,
      value: stats.activeClients.toString(),
      icon: Users,
      description: t.activeClientsDesc,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t.totalEarnings,
      value: `€${stats.totalEarnings.toFixed(0)}`,
      icon: DollarSign,
      description: t.totalEarningsDesc,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      highlight: true,
    },
    {
      title: t.thisMonth,
      value: `€${stats.thisMonthEarnings.toFixed(0)}`,
      icon: TrendingUp,
      description: `~€${avgPerClient} ${t.perClient}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: t.pendingPayout,
      value: `€${stats.pendingPayout.toFixed(2)}`,
      icon: Clock,
      description: t.pendingPayoutDesc,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t.conversionRate,
      value: `${stats.conversionRate}%`,
      icon: Target,
      description: t.conversionRateDesc,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: t.totalReferrals,
      value: stats.totalReferrals.toString(),
      icon: Zap,
      description: t.totalReferralsDesc,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
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
              {t.stripeAlert}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onConnectStripe}
              className="ml-4 shrink-0"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t.connectStripe}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className={`border-border/50 ${stat.highlight ? 'ring-2 ring-green-500/30' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.highlight ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
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
