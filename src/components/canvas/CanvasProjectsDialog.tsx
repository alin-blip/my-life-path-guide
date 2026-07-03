import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  Plus, 
  Trash2, 
  FileImage, 
  Clock, 
  Search,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CanvasProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
}

interface CanvasProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
}

export const CanvasProjectsDialog: React.FC<CanvasProjectsDialogProps> = ({
  open,
  onOpenChange,
  onSelectProject,
  onNewProject,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadProjects();
    }
  }, [open, user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('canvas_projects')
        .select('id, title, created_at, updated_at, thumbnail_url')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(projectId);
    
    try {
      const { error } = await supabase
        .from('canvas_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: 'Deleted',
        description: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2 text-xl">
            <Folder className="h-5 w-5 text-primary" />
            My Canvas Projects
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-white/60">
            Select a project to continue editing or create a new one
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4">
          {/* Search and New Project */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => {
                onNewProject();
                onOpenChange(false);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                {searchQuery ? 'No projects found' : 'No projects yet. Create your first one!'}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 cursor-pointer overflow-hidden transition-all"
                      onClick={() => {
                        onSelectProject(project.id);
                        onOpenChange(false);
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-[#0d0d1a] flex items-center justify-center">
                        {project.thumbnail_url ? (
                          <img 
                            src={project.thumbnail_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileImage className="h-10 w-10 text-white/20" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-white truncate">
                          {project.title || 'Untitled'}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(project.updated_at), 'MMM d, yyyy')}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                        onClick={(e) => handleDelete(project.id, e)}
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModal>
  );
};
