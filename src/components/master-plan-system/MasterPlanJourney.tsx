import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NapoleonHillProject, masterPlanProjectService } from '@/services/masterPlanProjectService';
import { PrincipleTimeline } from './PrincipleTimeline';
import { PrincipleChat } from './PrincipleChat';
import { ActionsList } from './ActionsList';
import { DoorIntegrationButton } from './DoorIntegrationButton';
import { EditPrincipleDialog } from './EditPrincipleDialog';
import { CheckCircle, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NapoleonHillJourneyProps {
  project: NapoleonHillProject;
  onProjectUpdate: () => void;
}

const PRINCIPLES = [
  "📚 Document Review & Foundation",
  "Dorința", "Credința", "Autosuggestia", "Cunoaștere Specializată",
  "Imaginația", "Planificare Organizată", "Decizia", "Perseverența",
  "Master Mind", "Transmutarea Energiei", "Subconștientul",
  "Creierul", "Al Șaselea Simț", "Acțiunea Imediată"
];

export const MasterPlanJourney: React.FC<NapoleonHillJourneyProps> = ({
  project,
  onProjectUpdate
}) => {
  const { toast } = useToast();
  const [selectedPrinciple, setSelectedPrinciple] = useState(project.current_principle);
  const [editingPrinciple, setEditingPrinciple] = useState<number | null>(null);
  const isCompleted = project.status === 'completed';

  const handlePrincipleComplete = async (principle: number, answer: any, summary: string, actions: any[]) => {
    const success = await masterPlanProjectService.savePrincipleProgress(
      project.id,
      principle,
      answer,
      summary,
      actions
    );

    if (success) {
      const principleLabel = principle === 0 ? 'Document Review completat!' : `Principiul ${principle} salvat!`;
      toast({ title: principleLabel });
      onProjectUpdate();
      
      // Move to next principle if not at end
      if (principle < 14) {
        setSelectedPrinciple(principle + 1);
      } else {
        // Complete the project
        await masterPlanProjectService.completeProject(project.id);
        toast({ 
          title: "🎉 Journey Completat!",
          description: "Ai parcurs toate cele 14 principii Master Plan"
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
      {!isCompleted && !project.principle_answers[selectedPrinciple] && (
        <PrincipleChat
          project={project}
          principle={selectedPrinciple}
          principleName={PRINCIPLES[selectedPrinciple]}
          onPrincipleComplete={handlePrincipleComplete}
        />
      )}
      
      {/* Completed Principle Display with Edit Button */}
      {project.principle_answers[selectedPrinciple] && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">
              {selectedPrinciple === 0 ? '📚 Document Review & Foundation' : `Principiul ${selectedPrinciple}: ${PRINCIPLES[selectedPrinciple]}`}
            </h3>
            <Button
              onClick={() => setEditingPrinciple(selectedPrinciple)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Editează
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Conversația ta:</p>
              <p className="text-foreground whitespace-pre-wrap text-sm">
                {project.principle_answers[selectedPrinciple]}
              </p>
            </div>
            
            {project.principle_summaries[selectedPrinciple] && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-2">Sumar:</p>
                <p className="text-foreground">
                  {project.principle_summaries[selectedPrinciple]}
                </p>
              </div>
            )}
          </div>
        </Card>
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
      
      {/* Edit Principle Dialog */}
      {editingPrinciple !== null && (
        <EditPrincipleDialog
          isOpen={true}
          onClose={() => setEditingPrinciple(null)}
          project={project}
          principle={editingPrinciple}
          principleName={PRINCIPLES[editingPrinciple]}
          existingAnswer={project.principle_answers[editingPrinciple] || ''}
          onSave={handlePrincipleComplete}
        />
      )}
    </div>
  );
};
