import React from 'react';
import { Button } from '@/components/ui/button';
import { NapoleonHillProject } from '@/services/napoleonHillProjectService';
import { ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { napoleonHillPdfService } from '@/services/napoleonHillPdfService';
import { v4 as uuidv4 } from 'uuid';

interface DoorIntegrationButtonProps {
  project: NapoleonHillProject;
}

export const DoorIntegrationButton: React.FC<DoorIntegrationButtonProps> = ({ project }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleIntegrate = async () => {
    try {
      // Get current week key
      const now = new Date();
      const weekKey = `door-week-${now.getFullYear()}-${String(Math.ceil((now.getDate()) / 7)).padStart(2, '0')}`;

      // Create Domino from project goal
      const dominoId = uuidv4();
      
      // Create key points from principles summaries (take first 4)
      const summaries = Object.entries(project.principle_summaries).slice(0, 4);
      const keyPoints = summaries.map(([principle, summary]) => ({
        id: uuidv4(),
        text: summary as string,
        completed: false
      }));

      // Create tasks from action items
      const incompletedActions = project.action_items.filter(a => !a.completed);
      const tasks = incompletedActions.map(action => ({
        id: uuidv4(),
        text: action.action,
        day: null,
        completed: false,
        priority: 4 // urgent-important
      }));

      // Save to Door
      await doorUserTasksService.addIdeaToWeek(weekKey, {
        id: dominoId,
        text: project.project_name,
        category: 'hot',
        priority: 'urgent-important',
      });

      // Add tasks to HIT list
      for (const task of tasks.slice(0, 10)) { // Limit to 10 tasks
        await doorUserTasksService.addIdeaToWeek(weekKey, {
          id: task.id,
          text: task.text,
          category: 'hit',
          priority: 'urgent-important',
        });
      }

      toast({
        title: "Plan Integrat!",
        description: `${project.project_name} a fost adăugat în Domino Door cu ${tasks.length} acțiuni`
      });

      // Navigate to Door
      navigate('/door');
    } catch (error) {
      console.error('Error integrating with Door:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut integra planul în Domino Door",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await napoleonHillPdfService.generatePDF(project);
      toast({
        title: "PDF Generat!",
        description: "Planul tău Napoleon Hill a fost exportat cu succes"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera PDF-ul",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
      
      <Button onClick={handleIntegrate}>
        <ArrowRight className="w-4 h-4 mr-2" />
        Integrează în Domino Door
      </Button>
    </div>
  );
};
