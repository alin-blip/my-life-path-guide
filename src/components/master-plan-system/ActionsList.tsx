import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { napoleonHillProjectService } from '@/services/napoleonHillProjectService';

interface ActionsListProps {
  actions: Array<{
    principle: number;
    action: string;
    completed: boolean;
  }>;
  projectId: string;
  onUpdate: () => void;
}

export const ActionsList: React.FC<ActionsListProps> = ({
  actions,
  projectId,
  onUpdate
}) => {
  const handleToggle = async (index: number) => {
    const updatedActions = [...actions];
    updatedActions[index].completed = !updatedActions[index].completed;
    
    await napoleonHillProjectService.updateProject(projectId, {
      action_items: updatedActions
    });
    
    onUpdate();
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">
        Acțiuni Extrase ({actions.filter(a => a.completed).length}/{actions.length})
      </h3>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={action.completed}
              onCheckedChange={() => handleToggle(index)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className={`text-foreground ${action.completed ? 'line-through opacity-60' : ''}`}>
                {action.action}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Principiul {action.principle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
