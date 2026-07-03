import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  CreditCard, Mail, Users, Zap, Coins, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'ok' | 'warn' | 'fail' | 'info';

interface Check {
  id: string;
  title: string;
  status: Status;
  value: string;
  detail: string;
  action?: string;
  icon: React.ReactNode;
}

const statusStyles: Record<Status, string> = {
  ok:   'border-emerald-500/40 bg-emerald-500/5',
  warn: 'border-amber-500/40 bg-amber-500/5',
  fail: 'border-red-500/40 bg-red-500/5',
  info: 'border-sky-500/40 bg-sky-500/5',
};

const statusBadge: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  ok:   { label: 'OK',        className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  warn: { label: 'ATENȚIE',   className: 'bg-amber-500/15 text-amber-500 border-amber-500/30',       icon: <AlertTriangle className="h-3 w-3" /> },
  fail: { label: 'CRITIC',    className: 'bg-red-500/15 text-red-500 border-red-500/30',             icon: <XCircle className="h-3 w-3" /> },
  info: { label: 'INFO',      className: 'bg-sky-500/15 text-sky-500 border-sky-500/30',             icon: <Info className="h-3 w-3" /> },
};

/**
 * Admin Health Panel
 * Live audit surfaced la vârful admin overview.
 * Rulează query-uri read-only și arată ce trebuie reparat.
 */
export const AdminHealthPanel: React.FC = () => {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const run = async () => {
    setRefreshing(true);
    try {
      const [
        { data: recentCheckout },
        { count: subscribersActive },
        { count: subscribersTrialing },
        { data: sendLog },
        { data: sequenceStats },
        { count: leadsTotal },
        { count: orphanLeads },
        { data: coaches },
      ] = await Promise.all([
        supabase.from('checkout_events').select('created_at').order('created_at', { ascending: false }).limit(1),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true).eq('subscription_status', 'active'),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true).eq('subscription_status', 'trialing'),
        supabase.from('email_send_log').select('message_id, status, created_at').not('message_id', 'is', null).order('created_at', { ascending: false }).limit(500),
        supabase.from('email_sequence_log').select('sequence_type, opened_at, clicked_at').order('sent_at', { ascending: false }).limit(500),
        supabase.from('email_leads').select('*', { count: 'exact', head: true }),
        supabase.from('email_leads').select('*', { count: 'exact', head: true }).lt('created_at', new Date(Date.now() - 7 * 86400_000).toISOString()),
        supabase.from('coach_profiles').select('id, stripe_onboarding_complete'),
      ]);

      // 1. Stripe webhook health — de când n-a mai primit event
      const lastCheckoutIso = recentCheckout?.[0]?.created_at as string | undefined;
      const daysSinceCheckout = lastCheckoutIso
        ? Math.round((Date.now() - new Date(lastCheckoutIso).getTime()) / 86400_000)
        : null;
      const stripeStatus: Status = daysSinceCheckout === null ? 'fail' : daysSinceCheckout > 7 ? 'fail' : daysSinceCheckout > 2 ? 'warn' : 'ok';

      // 2. Email deliverability — bounce rate (dedupe pe message_id)
      const latestByMsg = new Map<string, { status: string; created_at: string }>();
      (sendLog ?? []).forEach((r: any) => {
        const prev = latestByMsg.get(r.message_id);
        if (!prev || r.created_at > prev.created_at) latestByMsg.set(r.message_id, r);
      });
      const total = latestByMsg.size;
      const bounced = Array.from(latestByMsg.values()).filter(r => r.status === 'bounced').length;
      const bouncePct = total > 0 ? (bounced * 100) / total : 0;
      const bounceStatus: Status = bouncePct > 5 ? 'fail' : bouncePct > 2 ? 'warn' : 'ok';

      // 3. Sequence open/click tracking
      const sentTotal = sequenceStats?.length ?? 0;
      const opens = (sequenceStats ?? []).filter((s: any) => s.opened_at).length;
      const clicks = (sequenceStats ?? []).filter((s: any) => s.clicked_at).length;
      const tracksOpens = opens > 0 || clicks > 0;
      const openStatus: Status = sentTotal === 0 ? 'info' : tracksOpens ? 'ok' : 'fail';

      // 4. Revenue tables populate
      const revenueOk = (subscribersActive ?? 0) + (subscribersTrialing ?? 0) > 0;
      const revenueStatus: Status = revenueOk ? 'ok' : 'warn';

      // 5. Orphan leads (>7d fără follow-up nu putem calcula fără join, folosim un proxy — leaduri vechi)
      const orphanPct = leadsTotal ? Math.round(((orphanLeads ?? 0) * 100) / leadsTotal) : 0;

      // 6. Coach onboarding
      const totalCoaches = coaches?.length ?? 0;
      const readyCoaches = coaches?.filter(c => c.stripe_onboarding_complete).length ?? 0;
      const coachStatus: Status = totalCoaches === 0 ? 'info' : readyCoaches === 0 ? 'warn' : 'ok';

      const nextChecks: Check[] = [
        {
          id: 'stripe',
          title: 'Stripe Webhook',
          status: stripeStatus,
          value: daysSinceCheckout === null
            ? 'Fără evenimente'
            : `Ultim: acum ${daysSinceCheckout} z.`,
          detail: stripeStatus === 'fail'
            ? 'Endpoint-ul stripe-webhook nu primește evenimente. Verifică în Stripe Dashboard → Webhooks dacă URL-ul funcției e înregistrat și activ.'
            : 'Stripe trimite evenimente către endpoint.',
          action: stripeStatus !== 'ok' ? 'https://dashboard.stripe.com/webhooks' : undefined,
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          id: 'revenue',
          title: 'Subscribers Activi',
          status: revenueStatus,
          value: `${subscribersActive ?? 0} active · ${subscribersTrialing ?? 0} trial`,
          detail: revenueOk
            ? 'check-subscription menține subscribers-i sincronizați cu Stripe.'
            : 'Zero subscribers activi. Rulează check-subscription sau verifică fluxul de checkout.',
          icon: <Coins className="h-4 w-4" />,
        },
        {
          id: 'bounce',
          title: 'Bounce Rate Email',
          status: bounceStatus,
          value: `${bouncePct.toFixed(1)}% (${bounced}/${total})`,
          detail: bounceStatus === 'fail'
            ? `Peste pragul Resend (3%). Suspende templatele cu bounces recurente și verifică calitatea listei.`
            : 'Deliverability în parametri normali.',
          icon: <Mail className="h-4 w-4" />,
        },
        {
          id: 'opens',
          title: 'Tracking Opens/Clicks',
          status: openStatus,
          value: `${opens} opens · ${clicks} clicks / ${sentTotal} sent`,
          detail: openStatus === 'fail'
            ? 'Trimiți emailuri dar nu tracking-uiești deschideri/click-uri. Configurează webhook Resend → email_sequence_log (email.opened, email.clicked).'
            : 'Tracking activ.',
          action: openStatus === 'fail' ? 'https://resend.com/webhooks' : undefined,
          icon: <Zap className="h-4 w-4" />,
        },
        {
          id: 'leads',
          title: 'Leaduri >7 zile',
          status: orphanPct > 50 ? 'warn' : 'ok',
          value: `${orphanLeads ?? 0} / ${leadsTotal ?? 0} (${orphanPct}%)`,
          detail: 'Verifică rata de follow-up pe secvențe: leaduri vechi ar trebui să fi primit deja un drip complet.',
          icon: <Users className="h-4 w-4" />,
        },
        {
          id: 'coaches',
          title: 'Coach Onboarding',
          status: coachStatus,
          value: `${readyCoaches}/${totalCoaches} Stripe-ready`,
          detail: totalCoaches === 0
            ? 'Niciun coach profile creat.'
            : readyCoaches === 0
              ? 'Niciun coach n-a completat Stripe Connect onboarding — payout imposibil.'
              : 'Coach-i pot primi payout-uri.',
          icon: <Users className="h-4 w-4" />,
        },
      ];

      setChecks(nextChecks);
      setLastRun(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { run(); }, []);

  const failCount = checks?.filter(c => c.status === 'fail').length ?? 0;
  const warnCount = checks?.filter(c => c.status === 'warn').length ?? 0;

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>🩺 Health & Setup Panel</span>
            {failCount > 0 && (
              <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-500">
                {failCount} critice
              </Badge>
            )}
            {warnCount > 0 && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500">
                {warnCount} atenție
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Audit live pe revenue, email, leaduri, coach onboarding.
            {lastRun && ` Ultima rulare: ${lastRun.toLocaleTimeString('ro-RO')}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={run} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {!checks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {checks.map(c => {
              const badge = statusBadge[c.status];
              return (
                <div key={c.id} className={`rounded-lg border p-3 ${statusStyles[c.status]}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {c.icon}
                      {c.title}
                    </div>
                    <Badge variant="outline" className={`text-[10px] gap-1 ${badge.className}`}>
                      {badge.icon}
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold mb-1">{c.value}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
                  {c.action && (
                    <a
                      href={c.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-primary hover:underline"
                    >
                      Deschide setările →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
