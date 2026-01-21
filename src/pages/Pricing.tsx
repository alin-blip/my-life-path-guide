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
import { Crown, Zap, Gift, Check, Rocket, Users, Timer } from "lucide-react";
import { trackPurchase } from "@/lib/facebook-pixel";
import { preOpenWindow, redirectExternal } from "@/lib/externalRedirect";
import { EarlyBirdCountdown } from "@/components/membership/EarlyBirdCountdown";

// Early Bird Prices vs Normal Prices
const PLAN_PRICES = {
  basic: { earlyBird: '€49', normal: '€97', earlyBirdRo: '249 LEI', normalRo: '490 LEI' },
  pro: { earlyBird: '€97', normal: '€197', earlyBirdRo: '490 LEI', normalRo: '990 LEI' },
  elite: { earlyBird: '€297', normal: '€500', earlyBirdRo: '1490 LEI', normalRo: '2500 LEI' },
};

const Pricing: React.FC = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscribed, refreshSubscription, subscriptionTier, isEarlyBirdActive, earlyBirdExpiresAt } = useAuth();
  const { language } = useLanguage();

  const texts = {
    pageTitle: language === 'en' 
      ? "WarriorOS Memberships — Free, Basic & Pro" 
      : "Membership WarriorOS — Gratuit, Basic & Pro",
    metaDescription: language === 'en'
      ? "WarriorOS memberships: Free 3-day trial, Basic (€49) with full platform, Pro (€97) with 7-day trial & Live Coaching."
      : "Membership WarriorOS: Trial gratuit 3 zile, Basic (€49) cu platformă completă, Pro (€97) cu trial 7 zile & Coaching LIVE.",
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
    earlyBirdBanner: language === 'en' 
      ? "🔥 Early Bird Pricing Active - Save 50%!" 
      : "🔥 Preț Early Bird Activ - Economisești 50%!",
  };

  const planIcons: Record<string, React.ElementType> = {
    free: Gift,
    basic: Zap,
    pro: Crown,
    elite: Rocket,
  };

  // Helper to get dynamic price based on Early Bird status
  const getDynamicPrice = (planId: string) => {
    if (planId === 'free') return { price: language === 'en' ? 'Free' : 'Gratuit', originalPrice: null };
    
    const prices = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
    if (!prices) return { price: null, originalPrice: null };
    
    if (isEarlyBirdActive) {
      return {
        price: language === 'en' ? prices.earlyBird : prices.earlyBirdRo,
        originalPrice: language === 'en' ? prices.normal : prices.normalRo,
      };
    } else {
      return {
        price: language === 'en' ? prices.normal : prices.normalRo,
        originalPrice: null,
      };
    }
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
      
      // Track Facebook Pixel Purchase event based on plan
      const plan = searchParams.get('plan');
      if (plan === 'pro') {
        trackPurchase(97, 'EUR');
      } else if (plan === 'basic') {
        trackPurchase(49, 'EUR');
      }
      
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
    // Pre-open window before async operations
    const preOpened = preOpenWindow();
    
    try {
      if (!user) {
        if (preOpened) preOpened.close();
        navigate('/auth', { state: { from: '/pricing' } });
        return;
      }
      setLoadingPlan(planId);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId },
      });
      if (error) {
        if (preOpened) preOpened.close();
        throw error;
      }
      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
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
    // Pre-open window before async operations
    const preOpened = preOpenWindow();
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) {
        if (preOpened) preOpened.close();
        throw error;
      }
      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
      }
    } catch (err) {
      toast({ title: texts.error, description: texts.portalUnavailable });
    }
  };

  const mapTierToPlanId = (tier?: string | null) => {
    if (!tier) return null;
    const t = tier.toLowerCase();
    if (t.includes('pro')) return 'pro';
    if (t.includes('basic')) return 'basic';
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

          {/* Early Bird Countdown Banner */}
          {isEarlyBirdActive && earlyBirdExpiresAt && (
            <div className="mb-6">
              <div className="p-4 rounded-lg border-2 border-green-500/50 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-lg">
                    <Timer className="h-5 w-5 animate-pulse" />
                    {texts.earlyBirdBanner}
                  </div>
                  <EarlyBirdCountdown expiresAt={earlyBirdExpiresAt} />
                </div>
              </div>
            </div>
          )}

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

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {localizedPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              const Icon = planIcons[plan.id] || Zap;
              const isPro = plan.id === 'pro';
              const isBasic = plan.id === 'basic';
              const isElite = plan.id === 'elite';
              const isFree = plan.id === 'free';
              
              // Get dynamic pricing based on Early Bird status
              const dynamicPricing = getDynamicPrice(plan.id);
              const displayPrice = dynamicPricing.price || plan.price;
              const displayOriginalPrice = dynamicPricing.originalPrice;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 ${
                    plan.featured 
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                      : isElite
                        ? 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20'
                        : 'hover:border-primary/50'
                  }`}
                >
                  {/* Early Bird Badge for paid plans */}
                  {isEarlyBirdActive && !isFree && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 text-sm font-bold shadow-lg border-0 rounded-b-lg rounded-t-none">
                        🔥 Early Bird -50%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Top gradient bar for featured */}
                  {plan.featured && !isEarlyBirdActive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  )}
                  
                  {/* Elite gradient bar */}
                  {isElite && !isEarlyBirdActive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                  )}
                  
                  <CardHeader className={isEarlyBirdActive && !isFree ? 'pt-10' : ''}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${
                          isPro 
                            ? 'bg-gradient-to-br from-primary to-accent' 
                            : isBasic
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                              : isElite
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                : 'bg-muted'
                        }`}>
                          <Icon className={`h-5 w-5 ${isPro || isBasic || isElite ? 'text-white' : 'text-foreground'}`} />
                        </div>
                        <CardTitle className="text-foreground">{plan.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.highlight && !isEarlyBirdActive && (
                          <Badge 
                            className={`${
                              isPro || isBasic
                                ? 'bg-gradient-to-r from-primary to-accent text-white border-0' 
                                : isElite
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
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
                      {displayOriginalPrice && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">{displayOriginalPrice}</span>
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            -50%
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          {displayPrice}
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
                          <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full gap-2 ${
                        isPro
                          ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6' 
                          : isBasic
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                            : isElite
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90'
                              : ''
                      }`}
                      variant={isFree ? 'outline' : 'default'}
                      size={isPro ? 'lg' : 'default'}
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
                          {isEarlyBirdActive && !isFree && <Timer className="h-4 w-4" />}
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
