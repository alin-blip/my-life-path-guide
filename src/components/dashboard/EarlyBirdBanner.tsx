import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Sparkles, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { redirectExternal } from '@/lib/externalRedirect';

export function EarlyBirdBanner() {
  const { user, subscribed, subscriptionTier } = useAuth();
  const { language } = useLanguage();
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
        body: { plan: 'basic' },
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
      <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10">
        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-amber-500/20"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse" />

        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Gift className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  {content.badge}
                </Badge>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                {content.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2">
                {content.subtitle}
              </p>

              {/* Price comparison */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-muted-foreground line-through text-lg">
                  {content.originalPrice}
                </span>
                <span className="text-2xl md:text-3xl font-black text-amber-500">
                  {content.currentPrice}
                </span>
                <span className="text-muted-foreground">
                  {content.perMonth}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleActivate}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 px-6 py-2 h-auto"
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
