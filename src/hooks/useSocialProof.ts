import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Buyer {
  name: string;
  tier: string;
  createdAt: Date;
}

const anonymizeEmail = (email: string): string => {
  const [local] = email.split('@');
  // Remove numbers and take first 8 chars
  const name = local.replace(/[0-9]/g, '').slice(0, 8);
  if (!name) return 'User A.';
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return `${capitalized} ${capitalized.charAt(0)}.`;
};

const formatTier = (tier: string | null): string => {
  if (!tier) return 'Pro';
  const tierMap: Record<string, string> = {
    'elite': 'Elite',
    'pro': 'Pro',
    'basic': 'Basic',
    'free': 'Free'
  };
  return tierMap[tier.toLowerCase()] || 'Pro';
};

export const useSocialProof = () => {
  const [visitorCount, setVisitorCount] = useState(17);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch real buyers from Supabase
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('email, subscription_tier, created_at')
          .in('subscription_status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching buyers:', error);
          return;
        }

        if (data?.length) {
          setBuyers(data.map(b => ({
            name: anonymizeEmail(b.email),
            tier: formatTier(b.subscription_tier),
            createdAt: new Date(b.created_at)
          })));
        }
      } catch (err) {
        console.error('Error in fetchBuyers:', err);
      }
    };

    fetchBuyers();
  }, []);

  // Visitor count simulation - realistic with time-based variation
  useEffect(() => {
    // Initial count based on time of day
    const getInitialCount = () => {
      const hour = new Date().getHours();
      // More visitors during peak hours (18-22h)
      const isPeakHour = hour >= 18 && hour <= 22;
      const baseCount = isPeakHour ? 25 : 17;
      return baseCount + Math.floor(Math.random() * 10);
    };

    setVisitorCount(getInitialCount());

    const interval = setInterval(() => {
      setVisitorCount(prev => {
        // Small random change: -2 to +3
        const change = Math.floor(Math.random() * 6) - 2;
        // Keep between 13 and 45
        return Math.max(13, Math.min(45, prev + change));
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Rotate through buyers every 8 seconds
  useEffect(() => {
    if (buyers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % buyers.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [buyers.length]);

  const currentBuyer = buyers.length > 0 ? buyers[currentIndex] : null;
  
  // Check if purchase was within the last hour
  const isRecentPurchase = currentBuyer && 
    (Date.now() - currentBuyer.createdAt.getTime()) < 3600000;

  return { 
    visitorCount, 
    currentBuyer, 
    isRecentPurchase,
    hasBuyers: buyers.length > 0
  };
};
