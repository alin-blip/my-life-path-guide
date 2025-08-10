
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { plans } from "@/data/pricing";
import { Helmet } from "react-helmet-async";

const Pricing: React.FC = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscribed, refreshSubscription, subscriptionTier } = useAuth();

  useEffect(() => {
    document.title = "RoWarrior – Abonamente & Beneficii";
  }, []);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const reason = searchParams.get('reason');
    const stateReason = (location.state as any)?.reason;

    if (success) {
      toast({ title: 'Plată reușită', description: 'Actualizăm abonamentul...' });
      refreshSubscription().then(() => navigate('/dashboard'));
    }
    if (canceled) {
      toast({ title: 'Checkout anulat', description: 'Poți încerca din nou oricând.' });
    }
    if (reason === 'membership_required' || stateReason === 'membership_required') {
      toast({ title: 'Necesită abonament', description: 'Alege un plan pentru a continua.' });
      if (stateReason) navigate('/pricing', { replace: true });
    }
  }, [searchParams, location.state, toast, refreshSubscription, navigate]);

const handleCheckout = async (planId: string) => {
  try {
    if (!user) {
      navigate('/auth', { state: { from: '/pricing' } });
      return;
    }
    setLoadingPlan(planId);
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plan: planId },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    } else {
      throw new Error("Funcția de checkout nu este configurată încă");
    }
  } catch (err: any) {
    toast({
      title: "Configurare necesară",
      description: "Checkout-ul Stripe nu este încă activ. Vom finaliza setarea și revenim.",
    });
  } finally {
    setLoadingPlan(null);
  }
};

const handleManageSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  } catch (err) {
    toast({ title: 'Eroare', description: 'Portalul de abonamente nu este disponibil momentan.' });
  }
};

const mapTierToPlanId = (tier?: string | null) => {
  if (!tier) return null;
  const t = tier.toLowerCase();
  if (t.includes('trial')) return 'trial';
  if (t.includes('basic')) return 'basic';
  if (t.includes('pro') || t.includes('premium')) return 'pro';
  return null;
};
const activePlanId = mapTierToPlanId(subscriptionTier);


return (
  <Layout>
    <Helmet>
      <title>Abonamente RoWarrior — Basic și Pro</title>
      <meta name="description" content="Abonamente RoWarrior pentru antreprenori: trial 3 zile cu card, planurile Basic (97 lei) și Pro (197 lei) pentru execuție, claritate și KPI." />
      <link rel="canonical" href={`${window.location.origin}/pricing`} />
    </Helmet>
    <div className="min-h-screen bg-hero-gradient">
      <main className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Abonamente construite pentru antreprenori</h1>
        <p className="text-muted-foreground mt-2">Beneficii clare. Fără pierdere de timp. Focus pe profit și execuție.</p>
      </section>

      {subscribed && (
        <div className="mb-6 p-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          Ai deja un abonament activ. Poți gestiona detaliile sau schimba planul din portalul Stripe.
          <div className="mt-3">
            <Button variant="secondary" onClick={handleManageSubscription}>Gestionează abonamentul</Button>
          </div>
        </div>
      )}

      {!subscribed && (
        <div className="mb-6 p-4 rounded-md border border-yellow-500/40 bg-yellow-500/10 text-yellow-300">
          Ai nevoie de un abonament activ pentru a accesa funcționalitățile. Alege un plan mai jos.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activePlanId === plan.id;
          return (
            <Card key={plan.id} className={`relative ${plan.featured ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {plan.highlight && (
                      <Badge variant="secondary">{plan.highlight}</Badge>
                    )}
                    {isActive && <Badge>Planul tău</Badge>}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.benefits.map((b) => (
                    <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1">✅</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={loadingPlan === plan.id || isActive} onClick={() => handleCheckout(plan.id)}>
                  {loadingPlan === plan.id ? 'Se încarcă…' : isActive ? 'Activ' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-6 space-x-3">
        <Button
          variant="outline"
          onClick={async () => {
            await refreshSubscription();
            toast({ title: 'Status actualizat', description: 'Am verificat abonamentul tău.' });
          }}
        >
          Actualizează status
        </Button>
        {subscribed ? (
          <Button variant="secondary" onClick={handleManageSubscription}>Deschide portalul de abonamente</Button>
        ) : (
          <p className="text-xs text-muted-foreground">Anulezi oricând. Fără riscuri. Suport rapid.</p>
        )}
      </div>
    </main>
  </div>
  </Layout>
);
};

export default Pricing;
