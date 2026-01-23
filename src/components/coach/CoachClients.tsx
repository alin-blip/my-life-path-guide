import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Referral {
  id: string;
  coach_id: string;
  referred_user_id: string;
  referral_code: string;
  status: string | null;
  first_payment_at: string | null;
  lifetime_value: number | null;
  created_at: string;
}

interface CoachClientsProps {
  referrals: Referral[];
}

export const CoachClients: React.FC<CoachClientsProps> = ({ referrals }) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No clients yet
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Share your referral link to start bringing clients to the platform and earning commissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Clients</CardTitle>
        <CardDescription>
          Track the status and value of each referred client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>First Payment</TableHead>
              <TableHead>Lifetime Value</TableHead>
              <TableHead>Your Earnings (50%)</TableHead>
              <TableHead>Referred On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell className="font-mono text-sm">
                  {referral.referred_user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {getStatusBadge(referral.status)}
                </TableCell>
                <TableCell>
                  {referral.first_payment_at 
                    ? format(new Date(referral.first_payment_at), 'MMM d, yyyy')
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  €{(referral.lifetime_value || 0).toFixed(2)}
                </TableCell>
                <TableCell className="font-medium text-green-500">
                  €{((referral.lifetime_value || 0) * 0.5).toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(referral.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
