import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

const DISMISS_KEY = 'acceleratorBannerDismissedAt';
const DISMISS_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export const AcceleratorBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user, subscribed, subscriptionTier } = useAuth();
  const { language } = useLanguage();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage dismissal on mount
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        setIsDismissed(true);
      } else {
        // Clear expired dismissal
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user purchased warrior-accelerator separately
      const { data } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', 'warrior-accelerator')
        .maybeSingle();

      setHasPurchased(!!data);
      setIsLoading(false);
    };

    checkAccess();
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  // Don't show if loading or dismissed
  if (isLoading || isDismissed) return null;

  // Only show to paying members (subscribed = true)
  if (!subscribed) return null;

  // Don't show if user has Elite subscription or has purchased Accelerator
  const tier = subscriptionTier?.toLowerCase() || '';
  if (tier.includes('elite') || hasPurchased) {
    return null;
  }

  const handleClick = () => {
    navigate('/warrior-launch-accelerator');
  };

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6">
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
          aria-label="Închide"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side: Icon + Text */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <Rocket className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg">
                Start Warrior Launch Accelerator
              </h3>
            </div>
          </div>
          
          {/* Right side: CTA Button */}
          <Button 
            onClick={handleClick}
            className="w-full md:w-auto bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-900 font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
          >
            <Rocket className="h-4 w-4 mr-2" />
            {language === 'ro' ? 'Începe Acum' : 'Start Now'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
