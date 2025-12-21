import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KnowledgeBaseUploader } from '@/components/stack/KnowledgeBaseUploader';
import { FileText } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectData: {
    project_name: string;
    goal_description: string;
    goal_amount?: string;
    goal_deadline?: string;
  }) => Promise<string | undefined>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [projectName, setProjectName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim() || !goalDescription.trim()) {
      return;
    }

    const projectId = await onProjectCreated({
      project_name: projectName,
      goal_description: goalDescription,
      goal_amount: goalAmount || undefined,
      goal_deadline: goalDeadline || undefined
    });

    // Show uploader after project creation
    if (projectId) {
      setCreatedProjectId(projectId);
      setShowUploader(true);
    }
  };

  const handleClose = () => {
    // Reset form
    setProjectName('');
    setGoalDescription('');
    setGoalAmount('');
    setGoalDeadline('');
    setShowUploader(false);
    setCreatedProjectId(null);
    onClose();
  };

  const handleUploadComplete = () => {
    // Keep the modal open to allow more uploads
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journey Nou Master Plan</DialogTitle>
        </DialogHeader>

        {!showUploader ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project-name">Nume Proiect</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Primul Milion, Afacerea Restaurant"
                required
              />
            </div>

            <div>
              <Label htmlFor="goal-description">Descrierea Obiectivului</Label>
              <Textarea
                id="goal-description"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="Descrie în detaliu ce vrei să realizezi..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-amount">Sumă Țintă (opțional)</Label>
                <Input
                  id="goal-amount"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="Ex: 100,000 EUR"
                />
              </div>

              <div>
                <Label htmlFor="goal-deadline">Deadline (opțional)</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Anulează
              </Button>
              <Button type="submit">
                Pornește Journey
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">Încarcă Documente de Referință</h3>
                <p className="text-xs text-muted-foreground">
                  Adaugă planuri strategice, note de consultanță, obiective detaliate sau orice alt material care te poate ajuta în journey-ul Master Plan.
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceste documente vor fi folosite de AI pentru a-ți oferi ghidaj personalizat bazat pe contextul tău specific.
                </p>
              </div>
            </div>

            <KnowledgeBaseUploader 
              onUploadComplete={handleUploadComplete}
              projectId={createdProjectId || undefined}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={handleClose}>
                Continuă cu Journey-ul
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
