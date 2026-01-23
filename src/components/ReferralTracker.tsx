import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ReferralTracker: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const checkAndProcessReferral = async () => {
      // Check for coach referral code first (?coach=ABC123), then legacy (?ref=userId)
      const coachCode = searchParams.get('coach');
      const legacyReferralCode = searchParams.get('ref');
      const referralCode = coachCode || legacyReferralCode;
      
      if (!referralCode) return;
      
      // Store the referral code in local storage (with type indicator)
      if (coachCode) {
        localStorage.setItem('warriorCoachCode', coachCode);
      } else if (legacyReferralCode) {
        localStorage.setItem('warriorReferralCode', legacyReferralCode);
      }
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is already logged in, process the referral immediately
        if (coachCode) {
          processCoachReferral(coachCode, session.user.id);
        } else if (legacyReferralCode) {
          processReferral(legacyReferralCode, session.user.id);
        }
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

  const processCoachReferral = async (coachCode: string, userId: string) => {
    try {
      // Find coach by referral code
      const { data: coachProfile, error: coachError } = await supabase
        .from('coach_profiles')
        .select('id')
        .eq('referral_code', coachCode)
        .single();

      if (coachError || !coachProfile) {
        console.error('Coach not found:', coachError);
        return;
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', userId)
        .single();

      if (existingReferral) {
        console.log('Referral already exists for this user');
        localStorage.removeItem('warriorCoachCode');
        return;
      }

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          coach_id: coachProfile.id,
          referred_user_id: userId,
          referral_code: coachCode,
          status: 'pending', // Will become 'active' on first payment
        });

      if (insertError) {
        console.error('Error creating referral:', insertError);
      } else {
        console.log('Coach referral created successfully');
        localStorage.removeItem('warriorCoachCode');

        // Update coach total_referrals count
        await supabase.rpc('increment_coach_referrals', { coach_id: coachProfile.id });
      }
    } catch (error) {
      console.error('Error processing coach referral:', error);
    }
  };
  
  // This component doesn't render anything visible
  return null;
};

