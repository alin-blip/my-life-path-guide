import React, { useEffect, useState } from 'react';
import { VibeCanvas } from '@/components/canvas/VibeCanvas';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const VibeCanvasPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [initialData, setInitialData] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(!!projectId);
  const { toast } = useToast();

  // Load existing project if projectId is provided
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !user) return;

      try {
        const { data, error } = await supabase
          .from('canvas_projects')
          .select('canvas_data')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data?.canvas_data) {
          setInitialData(JSON.stringify(data.canvas_data));
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load canvas project',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, user, toast]);

  // Save handler
  const handleSave = async (canvasData: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedData = JSON.parse(canvasData);

      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from('canvas_projects')
          .update({ 
            canvas_data: parsedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('canvas_projects')
          .insert({
            user_id: user.id,
            title: 'Untitled Canvas',
            canvas_data: parsedData,
          })
          .select('id')
          .single();

        if (error) throw error;

        // Update URL with new project ID
        if (data?.id) {
          window.history.replaceState(null, '', `/vibe-canvas?project=${data.id}`);
        }
      }

      toast({
        title: 'Saved!',
        description: 'Your canvas has been saved successfully',
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: 'Error',
        description: 'Failed to save canvas',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0d1a]">
        <div className="text-white/60">Loading canvas...</div>
      </div>
    );
  }

  return (
    <VibeCanvas
      projectId={projectId || undefined}
      initialData={initialData}
      onSave={handleSave}
    />
  );
};

export default VibeCanvasPage;
