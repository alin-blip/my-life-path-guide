
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    id: "trial",
    name: "Probă 3 Zile",
    price: "0 LEI",
    period: "3 zile",
    highlight: "Testează fără risc",
    benefits: [
      "Experimentezi platforma complet, fără card",
      "Plan zilnic clar – ce faci azi ca să avansezi",
      "Acces la Coaching AI pentru focus și claritate",
      "Task-uri prioritizate ca să nu risipești timpul",
    ],
    cta: "Începe proba",
  },
  {
    id: "basic",
    name: "Basic",
    price: "97 LEI",
    period: "/ lună",
    highlight: "Fundamentul disciplinei zilnice",
    benefits: [
      "Plan zilnic de execuție – 15 minute și știi ce ai de făcut",
      "Focus pe profit: 1-3 acțiuni cu ROI maxim în fiecare zi",
      "Jurnal de progres și rapoarte săptămânale",
      "Acces la Stacks (Furie, Claritate, Focus) pentru reset rapid",
    ],
    cta: "Alege Basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: "197 LEI",
    period: "/ lună",
    highlight: "Creștere accelerată & execuție la sânge",
    benefits: [
      "Tot din Basic + Coaching AI tip Hormozi pentru ofertă și preț",
      "Sprint de 90 de zile cu obiective și checkpoint-uri",
      "KPI esențiali setați și urmăriți automat",
      "Template-uri, playbook-uri și checklists de implementare",
    ],
    cta: "Alege Pro",
    featured: true,
  },
];

const Pricing: React.FC = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, subscribed, refreshSubscription } = useAuth();

  useEffect(() => {
    document.title = "Operator – Abonamente & Beneficii";
  }, []);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const reason = searchParams.get('reason');

    if (success) {
      toast({ title: 'Plată reușită', description: 'Actualizăm abonamentul...' });
      refreshSubscription().then(() => navigate('/dashboard'));
    }
    if (canceled) {
      toast({ title: 'Checkout anulat', description: 'Poți încerca din nou oricând.' });
    }
    if (reason === 'membership_required') {
      toast({ title: 'Necesită abonament', description: 'Alege un plan pentru a continua.' });
    }
  }, [searchParams, toast, refreshSubscription, navigate]);

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

return (
  <Layout>
    <main className="max-w-6xl mx-auto">
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
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.featured ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{plan.name}</CardTitle>
                {plan.highlight && (
                  <Badge variant="secondary">{plan.highlight}</Badge>
                )}
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
              <Button className="w-full" disabled={loadingPlan === plan.id} onClick={() => handleCheckout(plan.id)}>
                {loadingPlan === plan.id ? 'Se încarcă…' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6">
        {subscribed ? (
          <Button variant="secondary" onClick={handleManageSubscription}>Deschide portalul de abonamente</Button>
        ) : (
          <p className="text-xs text-muted-foreground">Anulezi oricând. Fără riscuri. Suport rapid.</p>
        )}
      </div>
    </main>
  </Layout>
);
};

export default Pricing;
