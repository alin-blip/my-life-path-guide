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
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's active meditation
  const fetchMeditation = useCallback(async () => {
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
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Cast to proper type since Supabase types might not be updated yet
      setMeditation(data as unknown as EmpowermentMeditation | null);
    } catch (error) {
      console.error('Error fetching meditation:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeditation();
  }, [fetchMeditation]);

  // Generate new meditation
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

      // Deactivate old meditations
      await supabase
        .from('empowerment_meditations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Save new meditation
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
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setMeditation(newMeditation as unknown as EmpowermentMeditation);
      toast.success('Meditația a fost generată cu succes!');
      return true;

    } catch (error: any) {
      console.error('Error generating meditation:', error);
      toast.error(error.message || 'Eroare la generarea meditației');
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

        setMeditation(prev => prev ? { ...prev, meditation_script: script, title: title || prev.title } : null);
      } else {
        // Create new
        const { data: newMeditation, error } = await supabase
          .from('empowerment_meditations')
          .insert({
            user_id: user.id,
            title: title || 'Meditație Personalizată',
            meditation_script: script,
            binaural_type: 'theta',
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        setMeditation(newMeditation as unknown as EmpowermentMeditation);
      }

      return true;
    } catch (error) {
      console.error('Error saving meditation:', error);
      toast.error('Eroare la salvarea meditației');
      return false;
    }
  }, [meditation]);

  // Delete meditation
  const deleteMeditation = useCallback(async () => {
    if (!meditation) return;

    try {
      const { error } = await supabase
        .from('empowerment_meditations')
        .delete()
        .eq('id', meditation.id);

      if (error) throw error;

      setMeditation(null);
      toast.success('Meditația a fost ștearsă');
    } catch (error) {
      console.error('Error deleting meditation:', error);
      toast.error('Eroare la ștergerea meditației');
    }
  }, [meditation]);

  return {
    meditation,
    isLoading,
    isGenerating,
    generateMeditation,
    saveMeditation,
    deleteMeditation,
    refetch: fetchMeditation,
    hasMeditation: !!meditation
  };
}
