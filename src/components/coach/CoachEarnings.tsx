import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, CheckCircle, Clock, AlertCircle, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface Commission {
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

interface CoachEarningsProps {
  commissions: Commission[];
  pendingPayout: number;
  stripeConnected: boolean;
}

export const CoachEarnings: React.FC<CoachEarningsProps> = ({
  commissions,
  pendingPayout,
  stripeConnected,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const paidCommissions = commissions.filter(c => c.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Pending Payout Alert */}
      {pendingPayout > 0 && (
        <Alert className={stripeConnected ? "border-green-500/50 bg-green-500/10" : "border-amber-500/50 bg-amber-500/10"}>
          <Wallet className={`h-4 w-4 ${stripeConnected ? 'text-green-500' : 'text-amber-500'}`} />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-foreground">
              <strong>€{pendingPayout.toFixed(2)}</strong> pending payout
              {stripeConnected 
                ? ' - will be transferred automatically when balance reaches €25'
                : ' - connect Stripe to receive payouts'
              }
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            All your earnings from referred clients (50% of each payment)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No commissions yet
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You'll see your commission history here once your referred clients start making payments.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Original Payment</TableHead>
                  <TableHead>Your Commission (50%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(commission.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      €{commission.original_payment.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium text-green-500">
                      €{commission.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(commission.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {commission.paid_at 
                        ? format(new Date(commission.paid_at), 'MMM d, yyyy')
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              €{pendingCommissions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCommissions.length} commission{pendingCommissions.length !== 1 ? 's' : ''} awaiting payout
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              €{paidCommissions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidCommissions.length} payout{paidCommissions.length !== 1 ? 's' : ''} completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
