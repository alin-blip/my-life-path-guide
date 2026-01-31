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
    <section className="py-8 md:py-16 px-3 md:px-4 bg-gradient-to-b from-background to-secondary/10" id="pricing">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
            {language === 'ro' 
              ? 'Alege Planul Tău' 
              : 'Choose Your Plan'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? '7 zile gratuit • Anulezi oricând'
              : '7 days free • Cancel anytime'}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {/* PRO Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative h-full overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 hover:border-primary/50 transition-all duration-300">
              {/* Popular badge */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4">
                <span className="bg-primary text-primary-foreground px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                  POPULAR
                </span>
              </div>

              <CardHeader className="pb-2 md:pb-4 pt-3 md:pt-6 px-3 md:px-6">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">PRO</CardTitle>
                </div>

                {/* Pricing */}
                <div className="space-y-0.5 md:space-y-1">
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <span className="text-3xl md:text-4xl font-bold">€97</span>
                    <span className="text-sm md:text-base text-muted-foreground">/ {language === 'ro' ? 'lună' : 'month'}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-base md:text-lg line-through text-muted-foreground">€197</span>
                    <span className="bg-green-500/20 text-green-500 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-medium">
                      -51%
                    </span>
                  </div>
                </div>

                {/* Trial badge */}
                <div className="mt-2 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 bg-primary/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium text-primary">7 ZILE GRATUIT</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-4 md:pb-6">
                {/* Features */}
                <ul className="space-y-2 md:space-y-3">
                  {[
                    { icon: Brain, text: language === 'ro' ? 'Mind Coach AI Nelimitat' : 'Unlimited Mind Coach AI' },
                    { icon: Video, text: language === 'ro' ? 'Coaching LIVE Săptămânal' : 'Weekly LIVE Coaching' },
                    { icon: Users, text: language === 'ro' ? 'Comunitate VIP' : 'VIP Community' },
                    { icon: Zap, text: language === 'ro' ? 'Sprint 90 Zile cu KPIs' : '90-Day Sprint with KPIs' },
                    { icon: Sparkles, text: language === 'ro' ? '50% Comision Referral' : '50% Referral Commission', highlight: true },
                  ].map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 md:gap-3 ${feature.highlight ? 'bg-primary/10 -mx-1 md:-mx-2 px-1 md:px-2 py-1 md:py-1.5 rounded-lg' : ''}`}>
                      <feature.icon className={`h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-green-500'}`} />
                      <span className={`text-xs md:text-sm ${feature.highlight ? 'font-semibold text-primary' : ''}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Bonus - hidden on mobile */}
                <div className="hidden md:block bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-500">BONUS</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ro' 
                      ? '7-Day Transformation Challenge'
                      : '7-Day Transformation Challenge'}
                  </p>
                </div>

                {/* Mobile Bonus - compact */}
                <div className="md:hidden flex items-center gap-2 bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                  <Gift className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-amber-500 font-medium">+ 7-Day Challenge BONUS</span>
                </div>

                {/* CTA */}
                <Button
                  size="default"
                  onClick={() => handleSelectPlan('pro')}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30 text-sm md:text-base h-10 md:h-11"
                >
                  <Rocket className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                  {language === 'ro' ? 'ÎNCEPE GRATUIT' : 'START FREE'}
                </Button>

                <p className="text-[10px] md:text-xs text-center text-muted-foreground">
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
            <Card className="relative h-full overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 hover:border-amber-500/50 transition-all duration-300">
              {/* Elite badge */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                  FULL ACCESS
                </span>
              </div>

              <CardHeader className="pb-2 md:pb-4 pt-3 md:pt-6 px-3 md:px-6">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                    <Diamond className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">ELITE</CardTitle>
                </div>

                {/* Pricing */}
                <div className="space-y-0.5 md:space-y-1">
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <span className="text-3xl md:text-4xl font-bold">€297</span>
                    <span className="text-sm md:text-base text-muted-foreground">/ {language === 'ro' ? 'lună' : 'month'}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-base md:text-lg line-through text-muted-foreground">€500</span>
                    <span className="bg-amber-500/20 text-amber-500 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-medium">
                      -41%
                    </span>
                  </div>
                </div>

                {/* Trial badge */}
                <div className="mt-2 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 bg-amber-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
                  <span className="text-xs md:text-sm font-medium text-amber-500">7 ZILE GRATUIT</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-4 md:pb-6">
                {/* Features */}
                <ul className="space-y-2 md:space-y-3">
                  {[
                    { icon: Check, text: language === 'ro' ? 'Tot din PRO inclus' : 'Everything in PRO' },
                    { icon: Video, text: language === 'ro' ? 'Warrior Accelerator (47+ lecții)' : 'Warrior Accelerator (47+ lessons)', highlight: true },
                    { icon: Users, text: language === 'ro' ? 'Coaching 1-on-1 lunar' : 'Monthly 1-on-1 Coaching' },
                    { icon: Crown, text: language === 'ro' ? 'Coach Dashboard' : 'Coach Dashboard', highlight: true },
                    { icon: Zap, text: language === 'ro' ? 'Suport dedicat' : 'Dedicated support' },
                  ].map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 md:gap-3 ${feature.highlight ? 'bg-amber-500/10 -mx-1 md:-mx-2 px-1 md:px-2 py-1 md:py-1.5 rounded-lg' : ''}`}>
                      <feature.icon className={`h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                      <span className={`text-xs md:text-sm ${feature.highlight ? 'font-semibold text-amber-500' : ''}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Value Stack - Compact on mobile */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg md:rounded-xl p-2 md:p-4 border border-amber-500/20">
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {language === 'ro' ? 'VALOARE:' : 'VALUE:'}
                    </p>
                    <div className="flex items-baseline gap-1 md:gap-2">
                      <span className="text-lg md:text-xl font-bold text-amber-500">€1,097+</span>
                      <span className="text-green-500 text-[10px] md:text-xs font-medium">-73%</span>
                    </div>
                  </div>
                </div>

                {/* Bonus - hidden on mobile */}
                <div className="hidden md:block bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-amber-500">BONUS</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ro' 
                      ? '7-Day Transformation Challenge'
                      : '7-Day Transformation Challenge'}
                  </p>
                </div>

                {/* Mobile Bonus - compact */}
                <div className="md:hidden flex items-center gap-2 bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                  <Gift className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-amber-500 font-medium">+ 7-Day Challenge BONUS</span>
                </div>

                {/* CTA */}
                <Button
                  size="default"
                  onClick={() => handleSelectPlan('elite')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white shadow-lg shadow-amber-500/30 text-sm md:text-base h-10 md:h-11"
                >
                  <Diamond className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                  {language === 'ro' ? 'ALEGE ELITE' : 'GO ELITE'}
                </Button>

                <p className="text-[10px] md:text-xs text-center text-muted-foreground">
                  🔒 {language === 'ro' ? 'Garanție 90 zile' : '90-day guarantee'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
