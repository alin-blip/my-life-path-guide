import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Shield, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const NewHeroSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [realMetrics, setRealMetrics] = useState({ users: 0, completionRate: 0 });

  // Fetch real metrics from database
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true });
        
        // Get challenge completion rate (users who completed day 7)
        const { count: completedCount } = await supabase
          .from('challenge_progress')
          .select('*', { count: 'exact', head: true })
          .eq('day_number', 7)
          .eq('completed', true);

        const { count: startedCount } = await supabase
          .from('challenge_progress')
          .select('*', { count: 'exact', head: true })
          .eq('day_number', 1);

        setRealMetrics({
          users: userCount || 0,
          completionRate: startedCount && startedCount > 0 
            ? Math.round((completedCount || 0) / startedCount * 100) 
            : 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  // Hormozi-style content
  const heroContent = {
    badge: language === 'ro' ? 'Pentru Antreprenori Ocupați' : 'For Busy Entrepreneurs',
    headline: {
      result: language === 'ro' ? 'Dublează-ți Claritatea' : 'Double Your Clarity',
      timeframe: language === 'ro' ? 'în 90 de Zile' : 'in 90 Days',
      without: language === 'ro' ? 'FĂRĂ să Sacrifici' : 'WITHOUT Sacrificing',
      pain: language === 'ro' ? 'Familia sau Sănătatea' : 'Family or Health'
    },
    subheadline: language === 'ro'
      ? 'Sistemul AI care te ajută să fii productiv în business, prezent cu familia, și energetic fizic — toate în același timp.'
      : 'The AI system that helps you be productive in business, present with family, and physically energetic — all at the same time.',
    cta: language === 'ro' ? 'Începe Gratuit (3 Zile)' : 'Start Free (3 Days)',
    ctaSecondary: language === 'ro' ? 'Vezi Cum Funcționează' : 'See How It Works',
    guarantees: language === 'ro' 
      ? ['Garanție 90 zile', 'Anulezi oricând', 'Fără card la trial']
      : ['90-day guarantee', 'Cancel anytime', 'No card for trial'],
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:py-24 overflow-hidden n8n-hero-gradient">
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
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="n8n-badge">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {heroContent.badge}
            </div>
          </motion.div>

          {/* Hormozi-Style Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="n8n-gradient-text">{heroContent.headline.result}</span>
              <br />
              <span className="text-foreground">{heroContent.headline.timeframe}</span>
              <br />
              <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl">
                {heroContent.headline.without}
              </span>
              <br />
              <span className="text-foreground">{heroContent.headline.pain}</span>
            </h1>
          </motion.div>

          {/* Subheadline - Avatar Specific */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            {heroContent.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="n8n-glow-button text-primary-foreground text-lg px-10 py-7 rounded-xl font-bold group shadow-2xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              {heroContent.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsVideoPlaying(true)}
              className="text-lg px-8 py-7 rounded-xl border-2 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {heroContent.ctaSecondary}
            </Button>
          </motion.div>

          {/* Trust Badges - No Fake Numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-12"
          >
            {heroContent.guarantees.map((guarantee, idx) => (
              <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{guarantee}</span>
              </div>
            ))}
          </motion.div>

          {/* Video Embed Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="n8n-preview-container shadow-2xl max-w-4xl mx-auto cursor-pointer group"
            onClick={() => setIsVideoPlaying(true)}
          >
            <div className="relative aspect-video">
              {/* Video Thumbnail */}
              <img 
                src="https://img.youtube.com/vi/sfuey_WNODs/maxresdefault.jpg"
                alt="WarriorOS Video Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl group-hover:bg-black/40 transition-colors">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground ml-1" />
                </div>
              </div>
              {/* Video Label */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                🎬 {language === 'ro' ? 'Vezi demo-ul (3 min)' : 'Watch demo (3 min)'}
              </div>
            </div>
          </motion.div>

          {/* Real Metrics - Only Show If We Have Data */}
          {realMetrics.users > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-10"
            >
              <div className="n8n-trust-badge">
                <span className="text-lg">👥</span>
                <div>
                  <div className="font-semibold text-foreground">{realMetrics.users}+</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ro' ? 'Utilizatori Activi' : 'Active Users'}
                  </div>
                </div>
              </div>
              {realMetrics.completionRate > 0 && (
                <div className="n8n-trust-badge">
                  <span className="text-lg">📈</span>
                  <div>
                    <div className="font-semibold text-foreground">{realMetrics.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ro' ? 'Finalizează Challenge' : 'Complete Challenge'}
                    </div>
                  </div>
                </div>
              )}
              <div className="n8n-trust-badge">
                <span className="text-lg">🛡️</span>
                <div>
                  <div className="font-semibold text-foreground">90</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ro' ? 'Zile Garanție' : 'Day Guarantee'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://www.youtube.com/embed/sfuey_WNODs?rel=0&modestbranding=1&autoplay=1"
                title="WarriorOS Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
