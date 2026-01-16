import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

export const AcceleratorBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user, subscriptionTier } = useAuth();
  const { language } = useLanguage();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Don't show if loading
  if (isLoading) return null;

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
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side: Icon + Text */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <Rocket className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg">
                {language === 'ro' 
                  ? 'Deblochează Toate Cele 47+ Lecții' 
                  : 'Unlock All 47+ Lessons'}
              </h3>
              <p className="text-slate-400 text-sm">
                {language === 'ro'
                  ? 'Acces complet la curs + platforma WarriorOS - 970 EUR'
                  : 'Full access to course + WarriorOS platform - €970'}
              </p>
            </div>
          </div>
          
          {/* Right side: CTA Button */}
          <Button 
            onClick={handleClick}
            className="w-full md:w-auto bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-900 font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
          >
            <Rocket className="h-4 w-4 mr-2" />
            {language === 'ro' ? 'Obține Acces Complet' : 'Get Full Access'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
