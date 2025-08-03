
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ReferralTracker: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const checkAndProcessReferral = async () => {
      const referralCode = searchParams.get('ref');
      
      if (!referralCode) return;
      
      // Store the referral code in local storage
      localStorage.setItem('warriorReferralCode', referralCode);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is already logged in, process the referral immediately
        processReferral(referralCode, session.user.id);
      }
      // If not logged in, the referral will be processed when the user signs up or logs in
    };
    
    checkAndProcessReferral();
  }, [searchParams]);
  
  const processReferral = async (referralCode: string, userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-referral', {
        body: {
          referralCode,
          userId
        }
      });
      
      if (error) {
        console.error('Error processing referral:', error);
      } else {
        // Clear the referral code from local storage after successful processing
        localStorage.removeItem('warriorReferralCode');
      }
    } catch (error) {
      console.error('Error invoking function:', error);
    }
  };
  
  // This component doesn't render anything visible
  return null;
};
