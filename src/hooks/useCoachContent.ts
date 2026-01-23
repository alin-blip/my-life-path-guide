import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachContent {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  content_type: string;
  price_cents: number;
  currency: string;
  thumbnail_url: string | null;
  content_url: string | null;
  is_published: boolean;
  total_sales: number;
  total_revenue: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachContentPurchase {
  id: string;
  content_id: string;
  user_id: string;
  coach_id: string;
  amount_paid: number;
  coach_share: number;
  platform_share: number;
  currency: string;
  status: string;
  purchased_at: string;
}

export function useCoachContent(coachProfileId?: string) {
  const [content, setContent] = useState<CoachContent[]>([]);
  const [purchases, setPurchases] = useState<CoachContentPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = useCallback(async () => {
    if (!coachProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('coach_content')
        .select('*')
        .eq('coach_id', coachProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching coach content:', error);
    }
  }, [coachProfileId]);

  const fetchPurchases = useCallback(async () => {
    if (!coachProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('coach_content_purchases')
        .select('*')
        .eq('coach_id', coachProfileId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  }, [coachProfileId]);

  const createContent = async (
    title: string,
    description: string,
    contentType: string,
    priceCents: number,
    contentUrl?: string
  ): Promise<CoachContent | null> => {
    if (!coachProfileId) return null;

    try {
      const { data, error } = await supabase
        .from('coach_content')
        .insert({
          coach_id: coachProfileId,
          title,
          description,
          content_type: contentType,
          price_cents: priceCents,
          content_url: contentUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Content created!',
        description: 'Your resource has been saved as a draft.',
      });

      await fetchContent();
      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to create content.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateContent = async (
    contentId: string,
    updates: Partial<CoachContent>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('coach_content')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: 'Content updated!',
        description: 'Your changes have been saved.',
      });

      await fetchContent();
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to update content.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const publishContent = async (contentId: string): Promise<boolean> => {
    return updateContent(contentId, { is_published: true });
  };

  const unpublishContent = async (contentId: string): Promise<boolean> => {
    return updateContent(contentId, { is_published: false });
  };

  const deleteContent = async (contentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('coach_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: 'Content deleted',
        description: 'The resource has been removed.',
      });

      await fetchContent();
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Calculate stats
  const stats = {
    totalContent: content.length,
    publishedContent: content.filter(c => c.is_published).length,
    totalSales: purchases.filter(p => p.status === 'completed').length,
    totalRevenue: purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.coach_share, 0) / 100, // Convert to EUR
    pendingRevenue: purchases
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.coach_share, 0) / 100,
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContent(), fetchPurchases()]);
      setLoading(false);
    };
    loadData();
  }, [fetchContent, fetchPurchases]);

  return {
    content,
    purchases,
    loading,
    stats,
    createContent,
    updateContent,
    publishContent,
    unpublishContent,
    deleteContent,
    refreshContent: fetchContent,
    refreshPurchases: fetchPurchases,
  };
}

// Hook for users to browse and purchase coach content
export function useCoachMarketplace() {
  const [allContent, setAllContent] = useState<(CoachContent & { coach_name?: string })[]>([]);
  const [myPurchases, setMyPurchases] = useState<CoachContentPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMarketplace = useCallback(async () => {
    try {
      // Fetch all published content with coach info
      const { data: contentData, error: contentError } = await supabase
        .from('coach_content')
        .select('*')
        .eq('is_published', true)
        .gt('price_cents', 0)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Get coach names
      if (contentData && contentData.length > 0) {
        const coachIds = [...new Set(contentData.map(c => c.coach_id))];
        const { data: coaches } = await supabase
          .from('coach_profiles')
          .select('id, display_name')
          .in('id', coachIds);

        const coachMap = new Map(coaches?.map(c => [c.id, c.display_name]) || []);
        
        setAllContent(contentData.map(c => ({
          ...c,
          coach_name: coachMap.get(c.coach_id) || 'Unknown Coach',
        })));
      } else {
        setAllContent([]);
      }
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    }
  }, []);

  const fetchMyPurchases = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coach_content_purchases')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  }, []);

  const purchaseContent = async (contentId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-coach-content-checkout', {
        body: { content_id: contentId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return true;
      }

      throw new Error('No checkout URL returned');
    } catch (error) {
      console.error('Error purchasing content:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const hasPurchased = (contentId: string): boolean => {
    return myPurchases.some(p => p.content_id === contentId && p.status === 'completed');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMarketplace(), fetchMyPurchases()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMarketplace, fetchMyPurchases]);

  return {
    allContent,
    myPurchases,
    loading,
    purchaseContent,
    hasPurchased,
    refreshMarketplace: fetchMarketplace,
  };
}
