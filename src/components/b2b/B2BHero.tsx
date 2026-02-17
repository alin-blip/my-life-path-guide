import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, TrendingUp, Shield } from "lucide-react";

export const B2BHero = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    badge: language === 'ro' ? 'Pentru Coachi & Consultanți' : 'For Coaches & Consultants',
    headline: language === 'ro' 
      ? 'Transformă-ți Practica de Coaching într-un Business Scalabil'
      : 'Turn Your Coaching Practice Into a Scalable Business',
    subheadline: language === 'ro'
      ? 'Platforma all-in-one care face clienții tăi să EXECUTE — nu doar să asculte. Tu câștigi 50% din fiecare abonament, recurent, pentru totdeauna.'
      : 'The all-in-one platform that makes your clients EXECUTE — not just listen. You earn 50% of every subscription, recurring, forever.',
    cta: language === 'ro' ? 'Aplică ca Partner Coach' : 'Apply as Partner Coach',
    stats: [
      { icon: Users, value: '50%', label: language === 'ro' ? 'Comision Recurent' : 'Recurring Commission' },
      { icon: TrendingUp, value: '24/7', label: language === 'ro' ? 'AI Coach pentru Clienți' : 'AI Coach for Clients' },
      { icon: Shield, value: '0€', label: language === 'ro' ? 'Cost de Start' : 'Startup Cost' },
    ]
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden n8n-hero-gradient">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full"
        >
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="n8n-badge">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {content.badge}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
          >
            <span className="n8n-gradient-text">{content.headline}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            {content.subheadline}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-12"
          >
            <Button
              size="xl"
              onClick={() => navigate('/coach')}
              className="n8n-glow-button text-primary-foreground text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-xl font-bold group shadow-2xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              {content.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            {content.stats.map((stat, i) => (
              <div key={i} className="n8n-trust-badge">
                <stat.icon className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold text-foreground text-lg">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
