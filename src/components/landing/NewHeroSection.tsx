import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LandingEarlyBirdTimer } from "./LandingEarlyBirdTimer";
import { HeroInlineChat } from "./HeroInlineChat";
interface NewHeroSectionProps {
  onAskQuestion?: (question: string) => void;
  onOpenChat?: () => void;
}
export const NewHeroSection = ({
  onAskQuestion,
  onOpenChat
}: NewHeroSectionProps) => {
  const navigate = useNavigate();
  const {
    language
  } = useLanguage();
  const [realMetrics, setRealMetrics] = useState({
    users: 0,
    completionRate: 0
  });

  // Fetch real metrics from database
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const {
          count: userCount
        } = await supabase.from('subscribers').select('*', {
          count: 'exact',
          head: true
        });
        const {
          count: completedCount
        } = await supabase.from('challenge_progress').select('*', {
          count: 'exact',
          head: true
        }).eq('day_number', 7).eq('completed', true);
        const {
          count: startedCount
        } = await supabase.from('challenge_progress').select('*', {
          count: 'exact',
          head: true
        }).eq('day_number', 1);
        setRealMetrics({
          users: userCount || 0,
          completionRate: startedCount && startedCount > 0 ? Math.round((completedCount || 0) / startedCount * 100) : 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, []);
  const heroContent = {
    badge: 'Pentru High Performance',
    headline: {
      result: language === 'ro' ? 'Obține de 3-10x mai multe rezultate' : 'Get 3-10x more results',
      timeframe: language === 'ro' ? 'în Business, relații, corp și spiritualitate' : 'in Business, relationships, body and spirituality',
      connector: language === 'ro' ? 'simultan lucrând mai puțin, în 40 de zile' : 'simultaneously while working less, in 40 days',
    },
    subheadline: language === 'ro' 
      ? 'Sistemul de operare pentru o viață echilibrată, abundentă și împlinită' 
      : 'The operating system for a balanced, abundant and fulfilling life',
    cta: language === 'ro' ? 'Începe Transformarea Gratuit' : 'Start Your Transformation Free',
    guarantees: language === 'ro' ? ['Garanție 90 zile', 'Anulezi oricând', 'Fără card la trial'] : ['90-day guarantee', 'Cancel anytime', 'No card for trial']
  };
  const handleAskQuestion = (question: string) => {
    onAskQuestion?.(question);
  };
  const handleOpenChat = () => {
    onOpenChat?.();
  };
  return <section className="relative min-h-screen flex items-center pt-8 pb-12 md:pt-16 md:pb-24 overflow-x-hidden n8n-hero-gradient">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{
        rotate: [0, 360]
      }} transition={{
        duration: 120,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        </motion.div>
        <motion.div animate={{
        rotate: [360, 0]
      }} transition={{
        duration: 100,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="absolute bottom-1/2 right-1/2 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Early Bird Timer */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.05
        }} className="flex justify-center mb-6">
            <LandingEarlyBirdTimer />
          </motion.div>

          {/* Badge */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="flex justify-center mb-8">
            <div className="n8n-badge">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {heroContent.badge}
            </div>
          </motion.div>

          {/* Hormozi-Style Headline */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="mb-8">
            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-2xl">
              <span className="n8n-gradient-text">{heroContent.headline.result}</span>
              <br />
              <span className="text-foreground">{heroContent.headline.timeframe}</span>
              <br />
              <span className="text-muted-foreground text-xl sm:text-3xl md:text-4xl">
                {heroContent.headline.connector}
              </span>
              
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {heroContent.subheadline}
          </motion.p>

          {/* Video Embed Section - Voomly Autoplay Loop */}
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.6
        }} className="n8n-preview-container max-w-4xl mx-auto rounded-2xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.3),0_0_100px_rgba(34,211,238,0.2)] animate-pulse-glow">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <iframe src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=F5ekB1wK9EDeyiELl4ugLceeGp7GHnFN2w1UzsaIMLLpCm0BY&videoRatio=1.777778&type=v&skinColor=%232758EB&autoplay=1&loop=1&muted=1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            </div>
          </motion.div>

          {/* CTA Button - Below Video */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5
        }} className="mt-8 flex justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="n8n-glow-button text-primary-foreground text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-7 rounded-xl font-bold group shadow-2xl w-full sm:w-auto">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{heroContent.cta}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Button>
          </motion.div>

          {/* Inline Chat Component */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }} className="mt-8">
            <HeroInlineChat onAskQuestion={handleAskQuestion} onOpenChat={handleOpenChat} />
          </motion.div>


          {/* Real Metrics */}
          {realMetrics.users > 10 && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.8
        }} className="flex flex-wrap items-center justify-center gap-8 mt-10">
              <div className="n8n-trust-badge">
                <span className="text-lg">👥</span>
                <div>
                  <div className="font-semibold text-foreground">{realMetrics.users}+</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ro' ? 'Utilizatori Activi' : 'Active Users'}
                  </div>
                </div>
              </div>
              {realMetrics.completionRate > 0 && <div className="n8n-trust-badge">
                  <span className="text-lg">📈</span>
                  <div>
                    <div className="font-semibold text-foreground">{realMetrics.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ro' ? 'Finalizează Challenge' : 'Complete Challenge'}
                    </div>
                  </div>
                </div>}
              <div className="n8n-trust-badge">
                <span className="text-lg">🛡️</span>
                <div>
                  <div className="font-semibold text-foreground">90</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ro' ? 'Zile Garanție' : 'Day Guarantee'}
                  </div>
                </div>
              </div>
            </motion.div>}
        </div>
      </div>
    </section>;
};