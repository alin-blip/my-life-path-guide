import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface BreathingMusicItem {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export function useBreathingMusic() {
  const { user } = useAuth();
  const [music, setMusic] = useState<BreathingMusicItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMusic = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('breathing_music')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMusic((data as unknown as BreathingMusicItem[]) || []);
    } catch (err: any) {
      console.error('Error fetching breathing music:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, [user?.id]);

  const uploadMusic = async (file: File): Promise<BreathingMusicItem | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    
    // Get audio duration
    const duration = await getAudioDuration(file);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('breathing-music')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error('Eroare la upload: ' + uploadError.message);
      return null;
    }

    // Save to DB
    const title = file.name.replace(/\.[^/.]+$/, '');
    const { data, error } = await supabase
      .from('breathing_music')
      .insert({
        user_id: user.id,
        title,
        file_path: filePath,
        duration_seconds: duration ? Math.round(duration) : null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Eroare la salvare: ' + error.message);
      return null;
    }

    const item = data as unknown as BreathingMusicItem;
    setMusic(prev => [item, ...prev]);
    toast.success('Melodie adăugată!');
    return item;
  };

  const deleteMusic = async (id: string, filePath: string) => {
    await supabase.storage.from('breathing-music').remove([filePath]);
    await supabase.from('breathing_music').delete().eq('id', id);
    setMusic(prev => prev.filter(m => m.id !== id));
    toast.success('Melodie ștearsă');
  };

  const getMusicUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('breathing-music')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('breathing-music')
      .createSignedUrl(filePath, 3600);
    if (error) return null;
    return data.signedUrl;
  };

  return { music, loading, uploadMusic, deleteMusic, getSignedUrl, fetchMusic };
}

function getAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });
    audio.addEventListener('error', () => {
      resolve(null);
      URL.revokeObjectURL(audio.src);
    });
    audio.src = URL.createObjectURL(file);
  });
}
