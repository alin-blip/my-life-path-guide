import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { plans, getLocalizedPlan } from "@/data/pricing";
import { Helmet } from "react-helmet-async";

const Pricing: React.FC = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscribed, refreshSubscription, subscriptionTier } = useAuth();
  const { language } = useLanguage();

  const texts = {
    pageTitle: language === 'en' 
      ? "LifeOS Subscriptions — Basic and Pro" 
      : "Abonamente LifeOS — Basic și Pro",
    metaDescription: language === 'en'
      ? "LifeOS subscriptions for entrepreneurs: 3-day trial with card, Basic (€20) and Pro (€39) plans for execution, clarity and KPIs."
      : "Abonamente LifeOS pentru antreprenori: trial 3 zile cu card, planurile Basic (97 lei) și Pro (197 lei) pentru execuție, claritate și KPI.",
    heroTitle: language === 'en'
      ? "Subscriptions Built for Entrepreneurs"
      : "Abonamente construite pentru antreprenori",
    heroSubtitle: language === 'en'
      ? "Clear benefits. No wasted time. Focus on profit and execution."
      : "Beneficii clare. Fără pierdere de timp. Focus pe profit și execuție.",
    activeSubscription: language === 'en'
      ? "You already have an active subscription. You can manage details or change plans from the Stripe portal."
      : "Ai deja un abonament activ. Poți gestiona detaliile sau schimba planul din portalul Stripe.",
    manageSubscription: language === 'en'
      ? "Manage Subscription"
      : "Gestionează abonamentul",
    needSubscription: language === 'en'
      ? "You need an active subscription to access features. Choose a plan below."
      : "Ai nevoie de un abonament activ pentru a accesa funcționalitățile. Alege un plan mai jos.",
    yourPlan: language === 'en' ? "Your Plan" : "Planul tău",
    active: language === 'en' ? "Active" : "Activ",
    loading: language === 'en' ? "Loading..." : "Se încarcă…",
    refreshStatus: language === 'en' ? "Refresh Status" : "Actualizează status",
    openPortal: language === 'en' ? "Open Subscription Portal" : "Deschide portalul de abonamente",
    cancelAnytime: language === 'en' 
      ? "Cancel anytime. No risks. Fast support."
      : "Anulezi oricând. Fără riscuri. Suport rapid.",
    paymentSuccess: language === 'en' ? "Payment successful" : "Plată reușită",
    updatingSubscription: language === 'en' ? "Updating subscription..." : "Actualizăm abonamentul...",
    checkoutCanceled: language === 'en' ? "Checkout canceled" : "Checkout anulat",
    tryAgain: language === 'en' ? "You can try again anytime." : "Poți încerca din nou oricând.",
    membershipRequired: language === 'en' ? "Subscription required" : "Necesită abonament",
    choosePlan: language === 'en' ? "Choose a plan to continue." : "Alege un plan pentru a continua.",
    statusUpdated: language === 'en' ? "Status updated" : "Status actualizat",
    checkedSubscription: language === 'en' ? "We verified your subscription." : "Am verificat abonamentul tău.",
    error: language === 'en' ? "Error" : "Eroare",
    portalUnavailable: language === 'en' 
      ? "Subscription portal is not available at the moment."
      : "Portalul de abonamente nu este disponibil momentan.",
    configurationNeeded: language === 'en' ? "Configuration needed" : "Configurare necesară",
    checkoutNotActive: language === 'en'
      ? "Stripe checkout is not yet active. We will complete the setup and get back to you."
      : "Checkout-ul Stripe nu este încă activ. Vom finaliza setarea și revenim.",
  };

  useEffect(() => {
    document.title = texts.pageTitle;
  }, [language]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const reason = searchParams.get('reason');
    const stateReason = (location.state as any)?.reason;

    if (success) {
      toast({ title: texts.paymentSuccess, description: texts.updatingSubscription });
      refreshSubscription().then(() => navigate('/dashboard'));
    }
    if (canceled) {
      toast({ title: texts.checkoutCanceled, description: texts.tryAgain });
    }
    if (reason === 'membership_required' || stateReason === 'membership_required') {
      toast({ title: texts.membershipRequired, description: texts.choosePlan });
      if (stateReason) navigate('/pricing', { replace: true });
    }
  }, [searchParams, location.state, toast, refreshSubscription, navigate, language]);

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
        throw new Error("Checkout function not configured yet");
      }
    } catch (err: any) {
      toast({
        title: texts.configurationNeeded,
        description: texts.checkoutNotActive,
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
      toast({ title: texts.error, description: texts.portalUnavailable });
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

  // Get localized plans
  const localizedPlans = plans.map(plan => getLocalizedPlan(plan, language));

  return (
    <Layout>
      <Helmet>
        <title>{texts.pageTitle}</title>
        <meta name="description" content={texts.metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/pricing`} />
      </Helmet>
      <div className="min-h-screen bg-hero-gradient">
        <main className="max-w-6xl mx-auto px-4 py-12">
          <section className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{texts.heroTitle}</h1>
            <p className="text-muted-foreground mt-2">{texts.heroSubtitle}</p>
          </section>

          {subscribed && (
            <div className="mb-6 p-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              {texts.activeSubscription}
              <div className="mt-3">
                <Button variant="secondary" onClick={handleManageSubscription}>
                  {texts.manageSubscription}
                </Button>
              </div>
            </div>
          )}

          {!subscribed && (
            <div className="mb-6 p-4 rounded-md border border-yellow-500/40 bg-yellow-500/10 text-yellow-300">
              {texts.needSubscription}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {localizedPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              return (
                <Card key={plan.id} className={`relative ${plan.featured ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{plan.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {plan.highlight && (
                          <Badge variant="secondary">{plan.highlight}</Badge>
                        )}
                        {isActive && <Badge>{texts.yourPlan}</Badge>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
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
                    <Button 
                      className="w-full" 
                      disabled={loadingPlan === plan.id || isActive} 
                      onClick={() => handleCheckout(plan.id)}
                    >
                      {loadingPlan === plan.id ? texts.loading : isActive ? texts.active : plan.cta}
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
                toast({ title: texts.statusUpdated, description: texts.checkedSubscription });
              }}
            >
              {texts.refreshStatus}
            </Button>
            {subscribed ? (
              <Button variant="secondary" onClick={handleManageSubscription}>
                {texts.openPortal}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">{texts.cancelAnytime}</p>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Pricing;
