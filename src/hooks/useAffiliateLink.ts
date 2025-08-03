
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useAffiliateLink() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referralLink, setReferralLink] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Generate the referral link
        const baseUrl = window.location.origin;
        setReferralLink(`${baseUrl}/?ref=${session.user.id}`);
      }
    };

    getUser();
  }, []);

  const shareReferralLink = async () => {
    if (!referralLink) return;

    setIsLoading(true);

    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: 'Join Warrior Romania',
          text: 'Become the best version of yourself in all areas of life: Join the Warrior Romania community',
          url: referralLink,
        });
        
        toast({
          title: 'Link shared successfully',
          description: 'Thank you for sharing Warrior Romania!',
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(referralLink);
        
        toast({
          title: 'Link copied to clipboard',
          description: 'Share this link with your friends to earn commissions!',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      toast({
        title: 'Something went wrong',
        description: 'Could not share the link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userId,
    referralLink,
    isLoading,
    shareReferralLink
  };
}
