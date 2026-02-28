import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LandingEarlyBirdTimer } from "./LandingEarlyBirdTimer";

export const NewHeroSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [realMetrics, setRealMetrics] = useState({ users: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { count: userCount } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true });
        setRealMetrics({ users: userCount || 0 });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, []);

  const isRo = language === 'ro';

  return (
    <section className="relative min-h-screen flex items-center pt-8 pb-12 md:pt-16 md:pb-24 overflow-x-hidden n8n-hero-gradient">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full"
        >
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        </motion.div>
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        >
          <div className="absolute bottom-1/2 right-1/2 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Early Bird Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center mb-6"
          >
            <LandingEarlyBirdTimer />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="n8n-badge">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              THE FIRST FOUNDER OPERATING SYSTEM
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">
                {isRo ? 'Afacerea ta are un sistem de operare.' : 'Your business has an operating system.'}
              </span>
              <br />
              <span className="n8n-gradient-text">
                {isRo ? 'Tu încă rulezi pe haos.' : "You're still running on chaos."}
              </span>
            </h1>
          </motion.div>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6"
          >
            {isRo
              ? 'Nu mai fi cel mai bun angajat din propria firmă. CEO Mind OS este primul sistem de operare care face upgrade FONDATORULUI, nu doar afacerii — pentru rezultate predictibile în Corp, Minte, Relații și Business.'
              : "Stop being the best employee in your own company. CEO Mind OS is the first operating system that upgrades the FOUNDER, not just the business — for predictable results in Body, Mind, Relationships and Business."}
          </motion.p>

          {/* Differentiators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {[
              isRo ? 'Nu e un curs' : "Not a course",
              isRo ? 'Nu e coaching' : "Not coaching",
              isRo ? 'Nu e o aplicație de productivitate' : "Not a productivity app",
            ].map((text, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-medium bg-card border border-border text-muted-foreground"
              >
                {text}
              </span>
            ))}
          </motion.div>

          {/* Video Embed */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="n8n-preview-container max-w-4xl mx-auto rounded-2xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.3),0_0_100px_rgba(34,211,238,0.2)] animate-pulse-glow"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <iframe
                src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=F5ekB1wK9EDeyiELl4ugLceeGp7GHnFN2w1UzsaIMLLpCm0BY&videoRatio=1.777778&type=v&skinColor=%232758EB&autoplay=1&loop=1&muted=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="n8n-glow-button text-primary-foreground text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 md:py-7 rounded-xl font-bold group shadow-2xl w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{isRo ? 'Instalează CEO Mind OS' : 'Install CEO Mind OS'}</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRo ? 'Începe Challenge-ul Gratuit de 7 Zile' : 'Start the Free 7-Day Challenge'}
            </p>
          </motion.div>

          {/* Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8"
          >
            {[
              { icon: Shield, text: isRo ? 'Garanție 90 zile' : '90-day guarantee' },
              { icon: Shield, text: isRo ? 'Anulezi oricând' : 'Cancel anytime' },
              { icon: Shield, text: isRo ? 'Fără card la trial' : 'No card for trial' },
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <g.icon className="w-4 h-4" />
                {g.text}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-10"
          >
            <div className="n8n-trust-badge">
              <Wrench className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold text-foreground">16+</div>
                <div className="text-xs text-muted-foreground">
                  {isRo ? 'Instrumente de Execuție' : 'Execution Tools'}
                </div>
              </div>
            </div>
            {realMetrics.users > 10 && (
              <div className="n8n-trust-badge">
                <span className="text-lg">👥</span>
                <div>
                  <div className="font-semibold text-foreground">{realMetrics.users}+</div>
                  <div className="text-xs text-muted-foreground">
                    {isRo ? 'Utilizatori Activi' : 'Active Users'}
                  </div>
                </div>
              </div>
            )}
            <div className="n8n-trust-badge">
              <span className="text-lg">🛡️</span>
              <div>
                <div className="font-semibold text-foreground">90</div>
                <div className="text-xs text-muted-foreground">
                  {isRo ? 'Zile Garanție' : 'Day Guarantee'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
