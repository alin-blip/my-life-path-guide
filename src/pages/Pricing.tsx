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
import { Crown, Zap, Gift, Check, Rocket, Users } from "lucide-react";

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
      ? "WarriorOS Memberships — Free, Pro & Elite" 
      : "Membership WarriorOS — Gratuit, Pro & Elite",
    metaDescription: language === 'en'
      ? "WarriorOS memberships: Free 3-day trial, Pro (€49 Early Bird) with full platform, Elite (€497) with Warrior Accelerator & Live Coaching."
      : "Membership WarriorOS: Trial gratuit 3 zile, Pro (€49 Early Bird) cu platformă completă, Elite (€497) cu Warrior Accelerator & Coaching LIVE.",
    heroTitle: language === 'en'
      ? "Choose Your Warrior Path"
      : "Alege Drumul Tău de Războinic",
    heroSubtitle: language === 'en'
      ? "3 simple plans. Clear value. Transform your life in all 4 dimensions."
      : "3 planuri simple. Valoare clară. Transformă-ți viața în toate cele 4 dimensiuni.",
    activeSubscription: language === 'en'
      ? "You already have an active subscription. You can manage details or change plans from the Stripe portal."
      : "Ai deja un abonament activ. Poți gestiona detaliile sau schimba planul din portalul Stripe.",
    manageSubscription: language === 'en'
      ? "Manage Subscription"
      : "Gestionează abonamentul",
    needSubscription: language === 'en'
      ? "Start your transformation journey. Choose a plan below."
      : "Începe călătoria ta de transformare. Alege un plan mai jos.",
    yourPlan: language === 'en' ? "Your Plan" : "Planul tău",
    active: language === 'en' ? "Active" : "Activ",
    loading: language === 'en' ? "Loading..." : "Se încarcă…",
    refreshStatus: language === 'en' ? "Refresh Status" : "Actualizează status",
    openPortal: language === 'en' ? "Open Subscription Portal" : "Deschide portalul de abonamente",
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
    valueLabel: language === 'en' ? "Value" : "Valoare",
  };

  const planIcons = {
    free: Gift,
    pro: Zap,
    elite: Crown,
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
    if (t.includes('elite')) return 'elite';
    if (t.includes('pro')) return 'pro';
    if (t.includes('free') || t.includes('trial')) return 'free';
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
            <div className="mb-6 p-4 rounded-md border border-primary/40 bg-primary/10 text-primary">
              {texts.needSubscription}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {localizedPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              const Icon = planIcons[plan.id as keyof typeof planIcons];
              const isElite = plan.id === 'elite';
              const isPro = plan.id === 'pro';
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 ${
                    plan.featured 
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                      : 'hover:border-primary/50'
                  } ${isElite ? 'bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5' : ''}`}
                >
                  {/* Top gradient bar for featured */}
                  {plan.featured && (
                    <div className={`absolute top-0 left-0 w-full h-1 ${
                      isElite 
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500' 
                        : 'bg-gradient-to-r from-primary via-accent to-primary'
                    }`} />
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${
                          isElite 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                            : isPro 
                              ? 'bg-gradient-to-br from-primary to-accent' 
                              : 'bg-muted'
                        }`}>
                          <Icon className={`h-5 w-5 ${isElite || isPro ? 'text-white' : 'text-foreground'}`} />
                        </div>
                        <CardTitle className="text-foreground">{plan.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.highlight && (
                          <Badge 
                            className={`${
                              isElite 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0' 
                                : isPro 
                                  ? 'bg-gradient-to-r from-primary to-accent text-white border-0' 
                                  : ''
                            }`}
                            variant={!plan.featured ? "secondary" : "default"}
                          >
                            {plan.highlight}
                          </Badge>
                        )}
                        {isActive && <Badge variant="outline">{texts.yourPlan}</Badge>}
                      </div>
                    </div>
                    
                    {/* Price with Early Bird */}
                    <div className="mt-4">
                      {plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                          <Badge variant="secondary" className="text-xs">
                            {texts.valueLabel}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold ${isElite ? 'text-amber-500' : 'text-foreground'}`}>
                          {plan.price}
                        </span>
                        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                      </div>
                    </div>
                    
                    {/* Result description */}
                    {plan.result && (
                      <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">
                        {plan.result}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.benefits.map((b) => (
                        <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            isElite ? 'text-amber-500' : 'text-green-500'
                          }`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Elite extras */}
                    {isElite && (
                      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-500 font-medium text-sm">
                          <Users className="h-4 w-4" />
                          <span>Coaching LIVE cu Alin Radu</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full gap-2 ${
                        isElite 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' 
                          : isPro 
                            ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                            : ''
                      }`}
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                      disabled={loadingPlan === plan.id || isActive} 
                      onClick={() => handleCheckout(plan.id)}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {texts.loading}
                        </>
                      ) : isActive ? (
                        texts.active
                      ) : (
                        <>
                          {isElite && <Rocket className="h-4 w-4" />}
                          {plan.cta}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8 space-y-4">
            <Button
              variant="outline"
              onClick={async () => {
                await refreshSubscription();
                toast({ title: texts.statusUpdated, description: texts.checkedSubscription });
              }}
            >
              {texts.refreshStatus}
            </Button>
            {subscribed && (
              <div>
                <Button variant="secondary" onClick={handleManageSubscription}>
                  {texts.openPortal}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Pricing;
