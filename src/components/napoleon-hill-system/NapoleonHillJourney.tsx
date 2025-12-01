import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { NapoleonHillProject, napoleonHillProjectService } from '@/services/napoleonHillProjectService';
import { PrincipleTimeline } from './PrincipleTimeline';
import { PrincipleChat } from './PrincipleChat';
import { ActionsList } from './ActionsList';
import { DoorIntegrationButton } from './DoorIntegrationButton';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NapoleonHillJourneyProps {
  project: NapoleonHillProject;
  onProjectUpdate: () => void;
}

const PRINCIPLES = [
  "Dorința", "Credința", "Autosuggestia", "Cunoaștere Specializată",
  "Imaginația", "Planificare Organizată", "Decizia", "Perseverența",
  "Master Mind", "Transmutarea Energiei", "Subconștientul",
  "Creierul", "Al Șaselea Simț", "Acțiunea Imediată"
];

export const NapoleonHillJourney: React.FC<NapoleonHillJourneyProps> = ({
  project,
  onProjectUpdate
}) => {
  const { toast } = useToast();
  const [selectedPrinciple, setSelectedPrinciple] = useState(project.current_principle);
  const isCompleted = project.status === 'completed';

  const handlePrincipleComplete = async (principle: number, answer: any, summary: string, actions: any[]) => {
    const success = await napoleonHillProjectService.savePrincipleProgress(
      project.id,
      principle,
      answer,
      summary,
      actions
    );

    if (success) {
      toast({ title: `Principiul ${principle} salvat!` });
      onProjectUpdate();
      
      // Move to next principle if not at end
      if (principle < 14) {
        setSelectedPrinciple(principle + 1);
      } else {
        // Complete the project
        await napoleonHillProjectService.completeProject(project.id);
        toast({ 
          title: "🎉 Journey Completat!",
          description: "Ai parcurs toate cele 14 principii Napoleon Hill"
        });
        onProjectUpdate();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {project.project_name}
            </h2>
            <p className="text-muted-foreground">
              {project.goal_description}
            </p>
            {project.goal_amount && (
              <p className="text-sm text-primary font-semibold mt-2">
                Țintă: {project.goal_amount}
                {project.goal_deadline && ` până la ${new Date(project.goal_deadline).toLocaleDateString('ro-RO')}`}
              </p>
            )}
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Completat</span>
            </div>
          )}
        </div>

        <PrincipleTimeline
          currentPrinciple={project.current_principle}
          selectedPrinciple={selectedPrinciple}
          onPrincipleSelect={setSelectedPrinciple}
          completedPrinciples={Object.keys(project.principle_answers).map(Number)}
          principles={PRINCIPLES}
        />
      </Card>

      {/* Current Principle Chat */}
      {!isCompleted && (
        <PrincipleChat
          project={project}
          principle={selectedPrinciple}
          principleName={PRINCIPLES[selectedPrinciple - 1]}
          onPrincipleComplete={handlePrincipleComplete}
        />
      )}

      {/* Actions List */}
      {project.action_items.length > 0 && (
        <ActionsList
          actions={project.action_items}
          projectId={project.id}
          onUpdate={onProjectUpdate}
        />
      )}

      {/* Export & Integration */}
      {isCompleted && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Planul Tău de Acțiune
          </h3>
          
          <DoorIntegrationButton project={project} />
        </Card>
      )}
    </div>
  );
};
