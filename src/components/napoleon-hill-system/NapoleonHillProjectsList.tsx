import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NapoleonHillProject } from '@/services/napoleonHillProjectService';
import { PlayCircle, CheckCircle, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { napoleonHillProjectService } from '@/services/napoleonHillProjectService';
import { useToast } from '@/hooks/use-toast';

interface NapoleonHillProjectsListProps {
  projects: NapoleonHillProject[];
  isLoading: boolean;
  onProjectSelect: (project: NapoleonHillProject) => void;
  onRefresh: () => void;
}

export const NapoleonHillProjectsList: React.FC<NapoleonHillProjectsListProps> = ({
  projects,
  isLoading,
  onProjectSelect,
  onRefresh
}) => {
  const { toast } = useToast();

  const handleArchive = async (projectId: string) => {
    const success = await napoleonHillProjectService.archiveProject(projectId);
    if (success) {
      toast({ title: "Proiect arhivat" });
      onRefresh();
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Sigur vrei să ștergi acest proiect?")) return;
    
    const success = await napoleonHillProjectService.deleteProject(projectId);
    if (success) {
      toast({ title: "Proiect șters" });
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Nu ai niciun proiect Napoleon Hill încă
        </p>
        <p className="text-sm text-muted-foreground">
          Creează primul tău journey pentru a începe transformarea
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const progress = (project.current_principle / 14) * 100;
        const isCompleted = project.status === 'completed';
        const isArchived = project.status === 'archived';

        return (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-foreground">
                {project.project_name}
              </h3>
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {isArchived && (
                <Archive className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.goal_description}
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progres</span>
                <span className="font-semibold text-foreground">
                  {project.current_principle}/14 principii
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>
                Creat: {format(new Date(project.created_at), 'dd MMM yyyy')}
              </span>
              <span>
                Actualizat: {format(new Date(project.updated_at), 'dd MMM yyyy')}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onProjectSelect(project)}
                className="flex-1"
                variant={isArchived ? "outline" : "default"}
                disabled={isArchived}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isCompleted ? 'Vezi' : 'Continuă'}
              </Button>
              
              {!isCompleted && !isArchived && (
                <Button
                  onClick={() => handleArchive(project.id)}
                  variant="outline"
                  size="icon"
                >
                  <Archive className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                onClick={() => handleDelete(project.id)}
                variant="outline"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
