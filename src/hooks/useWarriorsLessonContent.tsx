import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LessonContent {
  id: string;
  module_id: string;
  title: string;
  summary: string | null;
  full_script: string | null;
  key_concepts: string[] | null;
  action_prompts: string[] | null;
  aha_moment: string | null;
  video_url: string | null;
  tags: string[] | null;
}

export const useWarriorsLessonContent = (moduleId: string) => {
  const [content, setContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!moduleId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('warriors_way_lesson_content')
        .select('id, module_id, title, summary, full_script, key_concepts, action_prompts, aha_moment, video_url, tags')
        .eq('module_id', moduleId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No content found for this module
          setContent(null);
        } else {
          throw fetchError;
        }
      } else {
        setContent(data as LessonContent);
      }
    } catch (err) {
      console.error('Error fetching lesson content:', err);
      setError('Nu am putut încărca conținutul lecției');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    isLoading,
    error,
    refetch: fetchContent
  };
};
