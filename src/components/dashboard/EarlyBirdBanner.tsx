import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Sparkles, Crown, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { redirectExternal } from '@/lib/externalRedirect';

// Countdown hook
function useCountdown(expiresAt: string | null) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

export function EarlyBirdBanner() {
  const { user, subscribed, subscriptionTier, earlyBirdExpiresAt, isEarlyBirdActive } = useAuth();
  const { language } = useLanguage();
  const countdown = useCountdown(earlyBirdExpiresAt);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = localStorage.getItem('earlyBirdDismissed');
    if (!dismissed) return false;
    // Check if dismissed within last 24 hours
    const dismissedTime = parseInt(dismissed, 10);
    const now = Date.now();
    return now - dismissedTime < 24 * 60 * 60 * 1000; // 24 hours
  });

  // Don't show if:
  // - User is not logged in
  // - User has an active subscription
  // - Banner was dismissed recently
  if (!user || subscribed || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('earlyBirdDismissed', Date.now().toString());
    setIsDismissed(true);
  };

  const handleActivate = async () => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error(language === 'ro' ? 'Te rugăm să te autentifici.' : 'Please log in.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'basic', source: 'early-bird' },
      });

      if (error) throw error;

      if (data?.url) {
        redirectExternal(data.url);
        return;
      }

      throw new Error(language === 'ro' ? 'Nu s-a putut crea sesiunea de plată.' : 'Could not create checkout session.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Early bird checkout error:', error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const content = language === 'ro' ? {
    badge: '🎁 EARLY BIRD',
    title: 'Activează Membership-ul Acum',
    subtitle: 'Securizează prețul Early Bird înainte să expire trial-ul',
    originalPrice: '€97',
    currentPrice: '€49',
    perMonth: '/ lună',
    cta: 'Activează pentru €49/lună',
    benefits: [
      'AI Coaching pentru business',
      'Champion Routine completă', 
      'Door - planificare săptămânală',
      'Stacks pentru reset rapid'
    ]
  } : {
    badge: '🎁 EARLY BIRD',
    title: 'Activate Your Membership Now',
    subtitle: 'Lock in the Early Bird price before your trial expires',
    originalPrice: '€97',
    currentPrice: '€49',
    perMonth: '/ month',
    cta: 'Activate for €49/month',
    benefits: [
      'AI Coaching for business',
      'Complete Champion Routine',
      'Door - weekly planning',
      'Stacks for quick reset'
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="relative overflow-hidden border border-primary/25 bg-card shadow-[0_1px_0_0_hsl(var(--primary)/0.15)_inset,0_8px_30px_-12px_hsl(var(--primary)/0.25)]">
        {/* Dismiss */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Gold hairline top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 h-14 w-14 rounded-full grid place-items-center bg-primary/10 border border-primary/30">
              <Gift className="h-6 w-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                  {content.badge}
                </Badge>
              </div>

              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                {content.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-3">
                {content.subtitle}
              </p>

              {/* Price */}
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-muted-foreground line-through text-base">
                  {content.originalPrice}
                </span>
                <span className="font-display text-3xl md:text-4xl font-semibold text-primary">
                  {content.currentPrice}
                </span>
                <span className="text-muted-foreground text-sm">
                  {content.perMonth}
                </span>
              </div>

              {/* Countdown */}
              {countdown.total > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 mt-3">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <div className="flex items-center gap-1 font-mono text-sm">
                    <span className="text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-primary/50">:</span>
                    <span className="text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-primary/50">:</span>
                    <span className="text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleActivate}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6 py-2 h-auto font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'ro' ? 'Se procesează...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    {content.cta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
