import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, X, Sparkles, Rocket, Shield, Crown, Star } from "lucide-react";
import { plans, getLocalizedPlan } from "@/data/pricing";

export const PricingComparison = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  // Get monthly plans from centralized pricing
  const basicPlan = getLocalizedPlan(plans.find(p => p.id === 'basic')!, language as 'en' | 'ro');
  const proPlan = getLocalizedPlan(plans.find(p => p.id === 'pro')!, language as 'en' | 'ro');
  const basicAnnual = getLocalizedPlan(plans.find(p => p.id === 'basic-annual')!, language as 'en' | 'ro');
  const proAnnual = getLocalizedPlan(plans.find(p => p.id === 'pro-annual')!, language as 'en' | 'ro');

  const displayPlans = [
    {
      id: isAnnual ? 'basic-annual' : 'basic',
      name: basicPlan.name,
      description: language === 'ro' 
        ? 'Perfect pentru a începe transformarea' 
        : 'Perfect to start your transformation',
      price: isAnnual ? basicAnnual.price : basicPlan.price,
      period: isAnnual ? basicAnnual.period : basicPlan.period,
      features: basicPlan.benefits.slice(0, 6).map(b => ({ text: b, included: true })).concat([
        { text: language === 'ro' ? 'Coaching LIVE săptămânal' : 'Weekly LIVE coaching', included: false },
        { text: language === 'ro' ? 'Comunitate VIP' : 'VIP community', included: false },
      ]),
      cta: basicPlan.cta,
      popular: false,
    },
    {
      id: isAnnual ? 'pro-annual' : 'pro',
      name: proPlan.name,
      description: language === 'ro' 
        ? 'Totul pentru transformare maximă' 
        : 'Everything for maximum transformation',
      price: isAnnual ? proAnnual.price : proPlan.price,
      period: isAnnual ? proAnnual.period : proPlan.period,
      features: proPlan.benefits.slice(0, 8).map(b => ({ text: b, included: true })),
      cta: proPlan.cta,
      popular: true,
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
            {language === 'ro' ? 'Prețuri Early Bird' : 'Early Bird Pricing'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Investește în transformarea ta' 
              : 'Invest in your transformation'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {language === 'ro'
              ? 'Alege planul potrivit pentru tine. Garanție 90 zile pentru toate planurile.'
              : 'Choose the right plan for you. 90-day guarantee on all plans.'}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-card border border-border rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'ro' ? 'Lunar' : 'Monthly'}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'ro' ? 'Anual' : 'Annual'}
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                -60%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {displayPlans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-card border rounded-3xl p-8 ${
                plan.popular
                  ? 'border-primary shadow-xl shadow-primary/10'
                  : 'border-border'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  {language === 'ro' ? 'Cel mai popular' : 'Most popular'}
                </div>
              )}

              {/* Plan Name & Description */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {!isAnnual && (
                  <p className="text-sm text-green-500 mt-2 font-medium">
                    {language === 'ro' 
                      ? '50% reducere Early Bird' 
                      : '50% Early Bird discount'}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => {
                  const isHighlighted = feature.text.startsWith('**');
                  const cleanText = feature.text.replace(/\*\*/g, '');
                  
                  if (isHighlighted && feature.included) {
                    return (
                      <div 
                        key={fIdx} 
                        className="flex items-center gap-3 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20"
                      >
                        <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                        <span className="text-primary font-bold">{cleanText}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={fIdx} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate('/auth')}
                className={`w-full py-6 text-lg ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Rocket className="w-5 h-5 mr-2" />
                {plan.cta}
              </Button>

              {/* Guarantee */}
              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                {language === 'ro' ? 'Garanție 90 zile' : '90-day guarantee'}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            {language === 'ro' 
              ? 'Ai întrebări? Vorbește cu noi.' 
              : 'Have questions? Talk to us.'}
          </p>
          <Button variant="link" onClick={() => navigate('/support')} className="text-primary">
            {language === 'ro' ? 'Contactează suport' : 'Contact support'} →
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
