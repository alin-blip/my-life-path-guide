
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
      // Try Web Share API first (only works in secure contexts with user gesture)
      if (navigator.share && navigator.canShare?.({ url: referralLink })) {
        await navigator.share({
          title: 'Join Napoleon Hill Academy',
          text: 'Become the best version of yourself in all areas of life: Join the Napoleon Hill Academy community',
          url: referralLink,
        });
        
        toast({
          title: 'Link shared successfully',
          description: 'Thank you for sharing Napoleon Hill Academy!',
        });
      } else {
        throw new Error('Web Share not available');
      }
    } catch (error) {
      // FALLBACK: Copy to clipboard instead of showing error
      // This handles both "Web Share not available" and permission denied errors
      try {
        await navigator.clipboard.writeText(referralLink);
        
        toast({
          title: 'Link copied to clipboard',
          description: 'Share this link with your friends to earn commissions!',
        });
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        
        // Only show error if clipboard also fails
        toast({
          title: 'Something went wrong',
          description: 'Could not copy the link. Please try again.',
          variant: 'destructive',
        });
      }
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
