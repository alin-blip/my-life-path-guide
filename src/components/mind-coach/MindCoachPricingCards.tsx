import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Diamond, 
  Check, 
  Sparkles, 
  Users, 
  Video, 
  Brain,
  Rocket,
  Gift,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MindCoachPricingCardsProps {
  language?: 'ro' | 'en';
  source?: string;
}

export function MindCoachPricingCards({ language = 'ro', source = 'mind-coach-transform' }: MindCoachPricingCardsProps) {
  const navigate = useNavigate();

  const handleSelectPlan = (plan: 'pro' | 'elite') => {
    // Navigate to auth with checkout redirect
    navigate(`/auth?redirect=/pricing&plan=${plan}&source=${source}`);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10" id="pricing">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ro' 
              ? 'Alege Planul Tău de Transformare' 
              : 'Choose Your Transformation Plan'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? '7 zile gratuit pentru a experimenta puterea completă. Anulezi oricând.'
              : '7 days free to experience the full power. Cancel anytime.'}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* PRO Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative h-full overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  MOST POPULAR
                </span>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">PRO</CardTitle>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">€97</span>
                    <span className="text-muted-foreground">/ {language === 'ro' ? 'lună' : 'month'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg line-through text-muted-foreground">€197</span>
                    <span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-xs font-medium">
                      Early Bird -51%
                    </span>
                  </div>
                </div>

                {/* Trial badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">7 ZILE TRIAL GRATUIT</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-3">
                  {[
                    { icon: Brain, text: language === 'ro' ? 'Mind Coach AI Nelimitat' : 'Unlimited Mind Coach AI' },
                    { icon: Video, text: language === 'ro' ? 'Coaching LIVE Săptămânal cu Alin Radu' : 'Weekly LIVE Coaching with Alin Radu' },
                    { icon: Users, text: language === 'ro' ? 'Comunitate VIP Pro Members' : 'VIP Pro Members Community' },
                    { icon: Zap, text: language === 'ro' ? 'Sprint 90 Zile cu KPIs' : '90-Day Sprint with KPIs' },
                    { icon: Sparkles, text: language === 'ro' ? '50% Comision Referral RECURENT' : '50% Recurring Referral Commission', highlight: true },
                  ].map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 ${feature.highlight ? 'bg-primary/10 -mx-2 px-2 py-1.5 rounded-lg' : ''}`}>
                      <feature.icon className={`h-5 w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-green-500'}`} />
                      <span className={`text-sm ${feature.highlight ? 'font-semibold text-primary' : ''}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Bonus */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-500">BONUS</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ro' 
                      ? '7-Day Transformation Challenge - Transformare completă în 7 zile'
                      : '7-Day Transformation Challenge - Complete transformation in 7 days'}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  onClick={() => handleSelectPlan('pro')}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  {language === 'ro' ? 'ÎNCEPE 7 ZILE GRATUIT' : 'START 7-DAY FREE TRIAL'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  ✓ {language === 'ro' ? 'Anulezi oricând' : 'Cancel anytime'} • 
                  ✓ {language === 'ro' ? 'Fără obligații' : 'No obligations'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ELITE Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative h-full overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20">
              {/* Elite badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  FULL ACCESS
                </span>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                    <Diamond className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-2xl">ELITE</CardTitle>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">€297</span>
                    <span className="text-muted-foreground">/ {language === 'ro' ? 'lună' : 'month'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg line-through text-muted-foreground">€500</span>
                    <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-xs font-medium">
                      Early Bird -41%
                    </span>
                  </div>
                </div>

                {/* Trial badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">7 ZILE TRIAL GRATUIT</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-3">
                  {[
                    { icon: Check, text: language === 'ro' ? 'Tot din PRO inclus' : 'Everything in PRO included' },
                    { icon: Video, text: language === 'ro' ? 'Warrior Launch Accelerator (47+ lecții)' : 'Warrior Launch Accelerator (47+ lessons)', highlight: true, value: '€497' },
                    { icon: Users, text: language === 'ro' ? '1-on-1 Coaching lunar cu Alin' : 'Monthly 1-on-1 Coaching with Alin', value: '€200' },
                    { icon: Crown, text: language === 'ro' ? 'Coach Dashboard - Gestionează clienți' : 'Coach Dashboard - Manage clients', highlight: true },
                    { icon: Zap, text: language === 'ro' ? 'Framework 90 Zile cu suport dedicat' : '90-Day Framework with dedicated support' },
                  ].map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 ${feature.highlight ? 'bg-amber-500/10 -mx-2 px-2 py-1.5 rounded-lg' : ''}`}>
                      <feature.icon className={`h-5 w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                      <div className="flex-1">
                        <span className={`text-sm ${feature.highlight ? 'font-semibold text-amber-500' : ''}`}>{feature.text}</span>
                        {feature.value && (
                          <span className="ml-2 text-xs text-muted-foreground">({feature.value} value)</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Value Stack */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'ro' ? 'VALOARE TOTALĂ:' : 'TOTAL VALUE:'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-amber-500">€1,097+</span>
                    <span className="text-sm text-muted-foreground">/ {language === 'ro' ? 'lună' : 'month'}</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">
                    {language === 'ro' ? 'Plătești doar €297 (73% economie)' : 'You pay only €297 (73% savings)'}
                  </p>
                </div>

                {/* Bonus */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-500">BONUS</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ro' 
                      ? '7-Day Transformation Challenge - Transformare completă în 7 zile'
                      : '7-Day Transformation Challenge - Complete transformation in 7 days'}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  onClick={() => handleSelectPlan('elite')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white shadow-lg shadow-amber-500/30"
                >
                  <Diamond className="h-5 w-5 mr-2" />
                  {language === 'ro' ? 'ALEGE ELITE - TRANSFORMARE COMPLETĂ' : 'GO ELITE - COMPLETE TRANSFORMATION'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 {language === 'ro' ? 'Garanție 90 zile satisfacție' : '90-day satisfaction guarantee'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
