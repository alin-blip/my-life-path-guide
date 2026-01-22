import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, X, Sparkles, Rocket, Shield, Zap } from "lucide-react";

export const PricingComparison = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: 'basic',
      name: language === 'ro' ? 'Warrior Basic' : 'Warrior Basic',
      description: language === 'ro' 
        ? 'Perfect pentru a începe transformarea' 
        : 'Perfect to start your transformation',
      priceMonthly: 47,
      priceAnnual: 37,
      features: [
        { text: language === 'ro' ? 'Acces la toate 4 pilonii' : 'Access to all 4 pillars', included: true },
        { text: language === 'ro' ? 'Rutine zilnice personalizate' : 'Personalized daily routines', included: true },
        { text: language === 'ro' ? 'War Planning (90 zile)' : 'War Planning (90 days)', included: true },
        { text: language === 'ro' ? 'Tracking progres' : 'Progress tracking', included: true },
        { text: language === 'ro' ? 'AI Coach Basic' : 'AI Coach Basic', included: true },
        { text: language === 'ro' ? 'AI Coaches specializați' : 'Specialized AI Coaches', included: false },
        { text: language === 'ro' ? 'Stack-uri emoționale' : 'Emotional stacks', included: false },
        { text: language === 'ro' ? 'Comunitate privată' : 'Private community', included: false },
      ],
      cta: language === 'ro' ? 'Începe Acum' : 'Start Now',
      popular: false,
    },
    {
      id: 'pro',
      name: language === 'ro' ? 'Warrior Pro' : 'Warrior Pro',
      description: language === 'ro' 
        ? 'Totul pentru transformare maximă' 
        : 'Everything for maximum transformation',
      priceMonthly: 97,
      priceAnnual: 77,
      features: [
        { text: language === 'ro' ? 'Acces la toate 4 pilonii' : 'Access to all 4 pillars', included: true },
        { text: language === 'ro' ? 'Rutine zilnice personalizate' : 'Personalized daily routines', included: true },
        { text: language === 'ro' ? 'War Planning (90 zile)' : 'War Planning (90 days)', included: true },
        { text: language === 'ro' ? 'Tracking progres' : 'Progress tracking', included: true },
        { text: language === 'ro' ? 'AI Coach Basic' : 'AI Coach Basic', included: true },
        { text: language === 'ro' ? 'AI Coaches specializați (4x)' : 'Specialized AI Coaches (4x)', included: true },
        { text: language === 'ro' ? 'Stack-uri emoționale' : 'Emotional stacks', included: true },
        { text: language === 'ro' ? 'Comunitate privată' : 'Private community', included: true },
      ],
      cta: language === 'ro' ? 'Începe Trial Gratuit' : 'Start Free Trial',
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
            {language === 'ro' ? 'Prețuri' : 'Pricing'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Investește în transformarea ta' 
              : 'Invest in your transformation'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {language === 'ro'
              ? 'Alege planul potrivit pentru tine. Garanție 7 zile pentru toate planurile.'
              : 'Choose the right plan for you. 7-day guarantee on all plans.'}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-card border border-border rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'ro' ? 'Lunar' : 'Monthly'}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'ro' ? 'Anual' : 'Annual'}
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-full">
                  {language === 'ro' ? '⭐ Cel mai popular' : '⭐ Most popular'}
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
                    €{isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-muted-foreground">/{language === 'ro' ? 'lună' : 'month'}</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'ro' 
                      ? `Facturat anual (€${plan.priceAnnual * 12}/an)` 
                      : `Billed annually (€${plan.priceAnnual * 12}/year)`}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => (
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
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate('/auth')}
                className={`w-full py-6 text-lg ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg'
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
                {language === 'ro' ? 'Garanție 7 zile' : '7-day guarantee'}
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
