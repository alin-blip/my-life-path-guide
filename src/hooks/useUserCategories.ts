import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserGoalCategory {
  id: string;
  user_id: string;
  category_key: string;
  parent_category: string | null;
  display_name: string;
  display_name_ro: string | null;
  icon: string;
  color: string;
  is_default: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_CATEGORIES = [
  { key: 'body', labelEn: 'Body', labelRo: 'Corp', icon: '💪', color: 'bg-green-500/20 text-green-400' },
  { key: 'being', labelEn: 'Being', labelRo: 'Spirit', icon: '✨', color: 'bg-purple-500/20 text-purple-400' },
  { key: 'balance', labelEn: 'Balance', labelRo: 'Relații', icon: '💕', color: 'bg-pink-500/20 text-pink-400' },
  { key: 'business', labelEn: 'Business', labelRo: 'Business', icon: '💰', color: 'bg-blue-500/20 text-blue-400' },
];

export const LIFEBOOK_SUBCATEGORIES = [
  // Body
  { key: 'health_fitness', parent: 'body', labelEn: 'Health & Fitness', labelRo: 'Sănătate & Fitness', icon: '🏋️' },
  { key: 'intellectual', parent: 'body', labelEn: 'Intellectual Life', labelRo: 'Viața Intelectuală', icon: '📚' },
  // Being
  { key: 'emotional', parent: 'being', labelEn: 'Emotional Life', labelRo: 'Viața Emoțională', icon: '❤️' },
  { key: 'character', parent: 'being', labelEn: 'Character', labelRo: 'Caracter', icon: '⭐' },
  { key: 'spiritual', parent: 'being', labelEn: 'Spiritual Life', labelRo: 'Viața Spirituală', icon: '🙏' },
  // Balance
  { key: 'love_relationship', parent: 'balance', labelEn: 'Love Relationship', labelRo: 'Relația de Iubire', icon: '💑' },
  { key: 'parenting', parent: 'balance', labelEn: 'Parenting', labelRo: 'Parenting', icon: '👨‍👩‍👧' },
  { key: 'social', parent: 'balance', labelEn: 'Social Life', labelRo: 'Viața Socială', icon: '🤝' },
  // Business
  { key: 'financial', parent: 'business', labelEn: 'Financial Life', labelRo: 'Viața Financiară', icon: '💵' },
  { key: 'career', parent: 'business', labelEn: 'Career', labelRo: 'Carieră', icon: '💼' },
  { key: 'quality_of_life', parent: 'business', labelEn: 'Quality of Life', labelRo: 'Calitatea Vieții', icon: '🌟' },
  { key: 'life_vision', parent: 'business', labelEn: 'Life Vision', labelRo: 'Viziunea Vieții', icon: '🎯' },
];

type CategoryMode = 'simple' | 'detailed' | 'custom';

const MODE_STORAGE_KEY = 'user-categories-mode';

export const useUserCategories = () => {
  const [categories, setCategories] = useState<UserGoalCategory[]>([]);
  const [mode, setModeState] = useState<CategoryMode>('simple');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as CategoryMode;
    if (savedMode) {
      setModeState(savedMode);
    }
  }, []);

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_goal_categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('order_index');

      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Set mode and save to localStorage
  const setMode = (newMode: CategoryMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
  };

  // Toggle category active state
  const toggleCategory = async (categoryKey: string, isActive: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Check if category exists
      const existing = categories.find(c => c.category_key === categoryKey);
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_goal_categories')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        
        if (error) throw error;
        
        setCategories(prev => 
          prev.map(c => c.id === existing.id ? { ...c, is_active: isActive } : c)
        );
      } else {
        // Create new
        const categoryInfo = DEFAULT_CATEGORIES.find(c => c.key === categoryKey) || 
          LIFEBOOK_SUBCATEGORIES.find(c => c.key === categoryKey);
        
        if (!categoryInfo) return;

        const parentCategory = 'parent' in categoryInfo ? categoryInfo.parent : null;
        
        const { data, error } = await supabase
          .from('user_goal_categories')
          .insert({
            user_id: session.user.id,
            category_key: categoryKey,
            parent_category: parentCategory,
            display_name: categoryInfo.labelEn,
            display_name_ro: categoryInfo.labelRo,
            icon: categoryInfo.icon,
            is_active: isActive,
            is_default: true,
            order_index: categories.length,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setCategories(prev => [...prev, data]);
        }
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      toast({
        title: 'Error',
        description: 'Could not update category',
        variant: 'destructive',
      });
    }
  };

  // Add custom category
  const addCustomCategory = async (name: string, parentCategory: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const categoryKey = `custom_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('user_goal_categories')
        .insert({
          user_id: session.user.id,
          category_key: categoryKey,
          parent_category: parentCategory,
          display_name: name,
          display_name_ro: name,
          icon: '📌',
          color: 'blue',
          is_active: true,
          is_default: false,
          order_index: categories.length,
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setCategories(prev => [...prev, data]);
        toast({
          title: 'Categorie adăugată',
          description: `"${name}" a fost adăugată cu succes.`,
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Could not add category',
        variant: 'destructive',
      });
    }
  };

  // Remove custom category
  const removeCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('user_goal_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({
        title: 'Categorie ștearsă',
        description: 'Categoria a fost ștearsă cu succes.',
      });
    } catch (error) {
      console.error('Error removing category:', error);
      toast({
        title: 'Error',
        description: 'Could not remove category',
        variant: 'destructive',
      });
    }
  };

  // Get active categories based on mode
  const getActiveCategories = () => {
    if (mode === 'simple') {
      return DEFAULT_CATEGORIES;
    }
    
    if (mode === 'detailed') {
      return [...DEFAULT_CATEGORIES, ...LIFEBOOK_SUBCATEGORIES];
    }
    
    // Custom mode - filter by user preferences
    const activeKeys = categories.filter(c => c.is_active).map(c => c.category_key);
    const allCats = [...DEFAULT_CATEGORIES, ...LIFEBOOK_SUBCATEGORIES];
    
    return allCats.filter(cat => {
      // Always include main categories if not explicitly disabled
      if (DEFAULT_CATEGORIES.find(c => c.key === cat.key)) {
        const userCat = categories.find(c => c.category_key === cat.key);
        return userCat ? userCat.is_active : true;
      }
      // For subcategories, only include if explicitly enabled
      return activeKeys.includes(cat.key);
    });
  };

  return {
    categories,
    mode,
    setMode,
    loading,
    toggleCategory,
    addCustomCategory,
    removeCategory,
    getActiveCategories,
    DEFAULT_CATEGORIES,
    LIFEBOOK_SUBCATEGORIES,
  };
};
