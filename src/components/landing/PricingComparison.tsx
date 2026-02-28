import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, Rocket, Shield, Crown, Star, Users } from "lucide-react";
import { plans, getLocalizedPlan } from "@/data/pricing";

export const PricingComparison = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const basicPlan = getLocalizedPlan(plans.find(p => p.id === 'basic')!, language as 'en' | 'ro');
  const proPlan = getLocalizedPlan(plans.find(p => p.id === 'pro')!, language as 'en' | 'ro');
  const elitePlan = getLocalizedPlan(plans.find(p => p.id === 'elite')!, language as 'en' | 'ro');
  const basicAnnual = getLocalizedPlan(plans.find(p => p.id === 'basic-annual')!, language as 'en' | 'ro');
  const proAnnual = getLocalizedPlan(plans.find(p => p.id === 'pro-annual')!, language as 'en' | 'ro');
  const eliteAnnual = getLocalizedPlan(plans.find(p => p.id === 'elite-annual')!, language as 'en' | 'ro');

  const isRo = language === 'ro';

  const displayPlans = [
    {
      id: isAnnual ? 'basic-annual' : 'basic',
      name: 'Basic',
      description: isRo ? 'Instrumentele esențiale pentru a începe' : 'Essential tools to get started',
      price: isAnnual ? basicAnnual.price : basicPlan.price,
      period: isAnnual ? basicAnnual.period : basicPlan.period,
      features: (isAnnual ? basicAnnual : basicPlan).benefits.slice(0, 6),
      cta: isRo ? 'Începe 5 Zile Trial' : 'Start 5-Day Trial',
      popular: false,
      tier: 'basic' as const,
      valueStack: isRo ? '~2.500 LEI/lună valoare' : '~2,500 LEI/mo value',
    },
    {
      id: isAnnual ? 'pro-annual' : 'pro',
      name: 'Pro',
      description: isRo ? 'Totul pentru transformare maximă' : 'Everything for maximum transformation',
      price: isAnnual ? proAnnual.price : proPlan.price,
      period: isAnnual ? proAnnual.period : proPlan.period,
      features: (isAnnual ? proAnnual : proPlan).benefits.slice(0, 8),
      cta: isRo ? 'Începe 5 Zile Trial' : 'Start 5-Day Trial',
      popular: true,
      tier: 'pro' as const,
      valueStack: isRo ? '~5.000 LEI/lună valoare' : '~5,000 LEI/mo value',
    },
    {
      id: isAnnual ? 'elite-annual' : 'elite',
      name: 'Elite',
      description: isRo ? 'Transformare completă + Devino Coach' : 'Complete transformation + Become a Coach',
      price: isAnnual ? eliteAnnual.price : elitePlan.price,
      period: isAnnual ? eliteAnnual.period : elitePlan.period,
      features: (isAnnual ? eliteAnnual : elitePlan).benefits.slice(0, 8),
      cta: isRo ? 'Începe 5 Zile Trial' : 'Start 5-Day Trial',
      popular: false,
      tier: 'elite' as const,
      valueStack: isRo ? '~15.000 LEI/lună valoare' : '~15,000 LEI/mo value',
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {isRo ? 'PREȚURI' : 'PRICING'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {isRo ? 'Alege-ți upgrade-ul.' : 'Choose your upgrade.'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isRo
              ? 'Garanție 90 zile pentru toate planurile. Anulezi oricând.'
              : '90-day guarantee on all plans. Cancel anytime.'}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-card border border-border rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isRo ? 'Lunar' : 'Monthly'}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isRo ? 'Anual' : 'Annual'}
              <span className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded-full text-xs font-bold">-60%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayPlans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-card border rounded-3xl p-8 ${
                plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  {isRo ? 'Cel mai popular' : 'Most popular'}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                {plan.valueStack && (
                  <div className="text-sm text-muted-foreground mb-1">
                    <span className="line-through">{plan.valueStack}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.valueStack && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    {isRo ? 'Economisești peste 80%' : 'You save over 80%'}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => {
                  const isHighlighted = feature.startsWith('**');
                  const cleanText = feature.replace(/\*\*/g, '');
                  const isIncluded = feature.startsWith('✓');

                  if (isHighlighted) {
                    return (
                      <div key={fIdx} className="flex items-center gap-3 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
                        <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                        <span className="text-primary font-bold text-sm">{cleanText}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => navigate('/auth')}
                className={`w-full py-6 text-base ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Rocket className="w-5 h-5 mr-2" />
                {plan.cta}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                {isRo ? 'Garanție 90 zile' : '90-day guarantee'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
