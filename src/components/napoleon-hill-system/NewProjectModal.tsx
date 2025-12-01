import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectData: {
    project_name: string;
    goal_description: string;
    goal_amount?: string;
    goal_deadline?: string;
  }) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim() || !goalDescription.trim()) {
      return;
    }

    onProjectCreated({
      project_name: projectName,
      goal_description: goalDescription,
      goal_amount: goalAmount || undefined,
      goal_deadline: goalDeadline || undefined
    });

    // Reset form
    setProjectName('');
    setGoalDescription('');
    setGoalAmount('');
    setGoalDeadline('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Journey Nou Napoleon Hill</DialogTitle>
        </DialogHeader>

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
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit">
              Pornește Journey
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
