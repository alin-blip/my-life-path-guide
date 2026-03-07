import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmpowermentMeditation {
  id: string;
  user_id: string;
  title: string;
  meditation_script: string;
  audio_url: string | null;
  binaural_type: string;
  duration_seconds: number | null;
  objectives_snapshot: Record<string, string> | null;
  is_active: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface GenerateOptions {
  objectives: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
  language?: string;
  templateId?: string;
  templateContext?: string;
  templateTitle?: string;
}

export function useEmpowermentMeditation() {
  const [meditation, setMeditation] = useState<EmpowermentMeditation | null>(null);
  const [allMeditations, setAllMeditations] = useState<EmpowermentMeditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch ALL user meditations (sorted: favorites first, then by date)
  const fetchAllMeditations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('empowerment_meditations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const meditations = (data || []) as unknown as EmpowermentMeditation[];
      setAllMeditations(meditations);
      
      // Set first meditation as current (or null if none)
      setMeditation(meditations[0] || null);
    } catch (error) {
      console.error('Error fetching meditations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMeditations();
  }, [fetchAllMeditations]);

  // Select a specific meditation
  const selectMeditation = useCallback((meditationId: string) => {
    const selected = allMeditations.find(m => m.id === meditationId);
    if (selected) {
      setMeditation(selected);
    }
  }, [allMeditations]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (meditationId: string) => {
    const med = allMeditations.find(m => m.id === meditationId);
    if (!med) return;

    const newFavoriteStatus = !med.is_favorite;

    try {
      const { error } = await supabase
        .from('empowerment_meditations')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', meditationId);

      if (error) throw error;

      // Update local state and re-sort
      setAllMeditations(prev => {
        const updated = prev.map(m => 
          m.id === meditationId ? { ...m, is_favorite: newFavoriteStatus } : m
        );
        // Re-sort: favorites first, then by date
        return updated.sort((a, b) => {
          if (a.is_favorite !== b.is_favorite) {
            return b.is_favorite ? 1 : -1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });

      // Update current meditation if it's the one being toggled
      if (meditation?.id === meditationId) {
        setMeditation(prev => prev ? { ...prev, is_favorite: newFavoriteStatus } : null);
      }

      toast.success(newFavoriteStatus ? 'Adăugat la favorite' : 'Eliminat din favorite');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Eroare la actualizarea favoritului');
    }
  }, [allMeditations, meditation]);

  // Delete a specific meditation
  const deleteMeditationById = useCallback(async (meditationId: string) => {
    try {
      const { error } = await supabase
        .from('empowerment_meditations')
        .delete()
        .eq('id', meditationId);

      if (error) throw error;

      // Update local state
      const remaining = allMeditations.filter(m => m.id !== meditationId);
      setAllMeditations(remaining);

      // If deleted meditation was selected, select the first remaining
      if (meditation?.id === meditationId) {
        setMeditation(remaining[0] || null);
      }

      toast.success('Meditația a fost ștearsă');
    } catch (error) {
      console.error('Error deleting meditation:', error);
      toast.error('Eroare la ștergerea meditației');
    }
  }, [allMeditations, meditation]);

  // Generate new meditation (no longer deactivates old ones)
  const generateMeditation = useCallback(async (options: GenerateOptions): Promise<boolean> => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Trebuie să fii autentificat');
        return false;
      }

      console.log('Generating meditation with options:', { 
        objectives: options.objectives, 
        templateId: options.templateId 
      });

      // Call edge function to generate meditation
      const { data, error } = await supabase.functions.invoke('generate-empowerment-meditation', {
        body: {
          objectives: options.objectives,
          language: options.language || 'ro',
          templateId: options.templateId,
          templateContext: options.templateContext
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.meditationScript) {
        throw new Error('Nu s-a generat scriptul meditației');
      }

      // Save new meditation (WITHOUT deactivating old ones)
      const meditationTitle = options.templateTitle || 'Meditație de Empowerment';
      const { data: newMeditation, error: insertError } = await supabase
        .from('empowerment_meditations')
        .insert({
          user_id: user.id,
          title: meditationTitle,
          meditation_script: data.meditationScript,
          binaural_type: 'theta',
          duration_seconds: data.estimatedDuration || 600,
          objectives_snapshot: options.objectives,
          is_active: true,
          is_favorite: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newMed = newMeditation as unknown as EmpowermentMeditation;
      
      // Add to local state at the beginning
      setAllMeditations(prev => [newMed, ...prev]);
      setMeditation(newMed);
      
      toast.success('Meditația a fost generată cu succes!');
      return true;

    } catch (error: unknown) {
      console.error('Error generating meditation:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || 'Eroare la generarea meditației');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Update/save meditation script
  const saveMeditation = useCallback(async (script: string, title?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Trebuie să fii autentificat');
        return false;
      }

      if (meditation) {
        // Update existing
        const { error } = await supabase
          .from('empowerment_meditations')
          .update({
            meditation_script: script,
            title: title || meditation.title,
            updated_at: new Date().toISOString()
          })
          .eq('id', meditation.id);

        if (error) throw error;

        const updatedMed = { ...meditation, meditation_script: script, title: title || meditation.title };
        setMeditation(updatedMed);
        setAllMeditations(prev => prev.map(m => m.id === meditation.id ? updatedMed : m));
      } else {
        // Create new
        const { data: newMeditation, error } = await supabase
          .from('empowerment_meditations')
          .insert({
            user_id: user.id,
            title: title || 'Meditație Personalizată',
            meditation_script: script,
            binaural_type: 'theta',
            is_active: true,
            is_favorite: false
          })
          .select()
          .single();

        if (error) throw error;
        
        const newMed = newMeditation as unknown as EmpowermentMeditation;
        setMeditation(newMed);
        setAllMeditations(prev => [newMed, ...prev]);
      }

      return true;
    } catch (error) {
      console.error('Error saving meditation:', error);
      toast.error('Eroare la salvarea meditației');
      return false;
    }
  }, [meditation]);

  // Delete current meditation (legacy - use deleteMeditationById instead)
  const deleteMeditation = useCallback(async () => {
    if (!meditation) return;
    await deleteMeditationById(meditation.id);
  }, [meditation, deleteMeditationById]);

  return {
    meditation,
    allMeditations,
    isLoading,
    isGenerating,
    selectMeditation,
    toggleFavorite,
    deleteMeditationById,
    generateMeditation,
    saveMeditation,
    deleteMeditation,
    refetch: fetchAllMeditations,
    hasMeditation: allMeditations.length > 0
  };
}
