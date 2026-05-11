import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LandingEarlyBirdTimer } from "./LandingEarlyBirdTimer";
import { SectionLabel } from "@/components/ui/section-label";

export const NewHeroSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [users, setUsers] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true });
        setUsers(count || 0);
      } catch (e) {
        console.error('metrics error', e);
      }
    })();
  }, []);

  const isRo = language === 'ro';

  return (
    <section className="relative min-h-[88vh] flex items-center pt-12 pb-16 md:pt-20 md:pb-24 n8n-hero-gradient">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center mb-6"
          >
            <LandingEarlyBirdTimer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <SectionLabel>
              {isRo ? 'Sistemul de Operare al Fondatorului' : 'The Founder Operating System'}
            </SectionLabel>
          </motion.div>

          {/* Headline — Fraunces, italic gold accent on second line */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="font-display text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground mb-6"
          >
            {isRo ? 'Afacerea ta are un sistem de operare.' : 'Your business has an operating system.'}
            <br />
            <em className="italic text-primary font-semibold">
              {isRo ? 'Tu încă rulezi pe haos.' : "You're still running on chaos."}
            </em>
          </motion.h1>

          {/* Subcopy */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="text-center text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {isRo
              ? 'CEO Mind OS face upgrade FONDATORULUI, nu doar afacerii. Un singur sistem pentru Corp, Minte, Relații și Business.'
              : 'CEO Mind OS upgrades the FOUNDER, not just the business. One system for Body, Mind, Relationships and Business.'}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="flex flex-col items-center gap-3 mb-14"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="px-8 py-6 text-base font-semibold tracking-wide group"
            >
              {isRo ? 'Instalează CEO Mind OS' : 'Install CEO Mind OS'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {isRo ? 'Trial gratuit · 5 zile · fără card' : 'Free trial · 5 days · no card'}
            </p>
          </motion.div>

          {/* Video — hairline frame */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="n8n-preview-container max-w-4xl mx-auto"
          >
            <div className="relative aspect-video">
              <iframe
                src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=F5ekB1wK9EDeyiELl4ugLceeGp7GHnFN2w1UzsaIMLLpCm0BY&videoRatio=1.777778&type=v&skinColor=%23D4A84A&autoplay=1&loop=1&muted=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title="CEO Mind OS"
              />
            </div>
          </motion.div>

          {/* Stat row — hairline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden max-w-3xl mx-auto"
          >
            {[
              { num: '16+', label: isRo ? 'Instrumente' : 'Tools' },
              { num: users > 10 ? `${users}+` : '100+', label: isRo ? 'Fondatori' : 'Founders' },
              { num: '90', label: isRo ? 'Zile garanție' : 'Day guarantee' },
            ].map((s, i) => (
              <div key={i} className="bg-background px-6 py-6 text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-primary">{s.num}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
