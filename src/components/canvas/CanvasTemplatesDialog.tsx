import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Brain, 
  Target, 
  ImageIcon, 
  Lightbulb,
  GitBranch,
  Layout,
  FileText
} from 'lucide-react';

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  data: object;
}

const templates: CanvasTemplate[] = [
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Organize ideas around a central concept',
    icon: Brain,
    color: '#8B5CF6',
    data: {
      version: '6.0.0',
      objects: [
        {
          type: 'circle',
          left: 400,
          top: 250,
          radius: 60,
          fill: '#8B5CF6',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 365,
          top: 235,
          text: 'Central\nIdea',
          fill: '#ffffff',
          fontSize: 18,
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
        },
        // Branches
        {
          type: 'line',
          x1: 460, y1: 250, x2: 560, y2: 180,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'circle',
          left: 560,
          top: 140,
          radius: 40,
          fill: '#3B82F6',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 545,
          top: 165,
          text: 'Idea 1',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'line',
          x1: 460, y1: 250, x2: 560, y2: 320,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'circle',
          left: 560,
          top: 280,
          radius: 40,
          fill: '#10B981',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 545,
          top: 305,
          text: 'Idea 2',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'line',
          x1: 340, y1: 250, x2: 240, y2: 180,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'circle',
          left: 160,
          top: 140,
          radius: 40,
          fill: '#F59E0B',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 145,
          top: 165,
          text: 'Idea 3',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'line',
          x1: 340, y1: 250, x2: 240, y2: 320,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'circle',
          left: 160,
          top: 280,
          radius: 40,
          fill: '#EF4444',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 145,
          top: 305,
          text: 'Idea 4',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
      ],
      background: '#1a1a2e',
    }
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Capture and organize creative ideas',
    icon: Lightbulb,
    color: '#F59E0B',
    data: {
      version: '6.0.0',
      objects: [
        // Title
        {
          type: 'i-text',
          left: 50,
          top: 30,
          text: '💡 Brainstorming Session',
          fill: '#F59E0B',
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        // Sticky notes
        {
          type: 'rect',
          left: 50,
          top: 100,
          width: 150,
          height: 150,
          fill: '#fff740',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 65,
          top: 120,
          text: 'Idea #1\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 220,
          top: 100,
          width: 150,
          height: 150,
          fill: '#ff7eb9',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 235,
          top: 120,
          text: 'Idea #2\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 390,
          top: 100,
          width: 150,
          height: 150,
          fill: '#7afcff',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 405,
          top: 120,
          text: 'Idea #3\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 560,
          top: 100,
          width: 150,
          height: 150,
          fill: '#98fb98',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 575,
          top: 120,
          text: 'Idea #4\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // Second row
        {
          type: 'rect',
          left: 135,
          top: 280,
          width: 150,
          height: 150,
          fill: '#ffa07a',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 150,
          top: 300,
          text: 'Idea #5\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 305,
          top: 280,
          width: 150,
          height: 150,
          fill: '#dda0dd',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 320,
          top: 300,
          text: 'Idea #6\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 475,
          top: 280,
          width: 150,
          height: 150,
          fill: '#87ceeb',
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 490,
          top: 300,
          text: 'Idea #7\n\nWrite here...',
          fill: '#1a1a1a',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
      ],
      background: '#1a1a2e',
    }
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    description: 'Plan and track your goals visually',
    icon: Target,
    color: '#10B981',
    data: {
      version: '6.0.0',
      objects: [
        // Header
        {
          type: 'i-text',
          left: 50,
          top: 30,
          text: '🎯 My Goals',
          fill: '#10B981',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        // Goal boxes
        {
          type: 'rect',
          left: 50,
          top: 100,
          width: 220,
          height: 180,
          fill: 'transparent',
          stroke: '#10B981',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        {
          type: 'i-text',
          left: 70,
          top: 120,
          text: '🏃 Health Goal',
          fill: '#10B981',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'i-text',
          left: 70,
          top: 155,
          text: 'What I want:\n\nSteps to achieve:\n\nDeadline:',
          fill: '#ffffff',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 290,
          top: 100,
          width: 220,
          height: 180,
          fill: 'transparent',
          stroke: '#3B82F6',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        {
          type: 'i-text',
          left: 310,
          top: 120,
          text: '💼 Career Goal',
          fill: '#3B82F6',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'i-text',
          left: 310,
          top: 155,
          text: 'What I want:\n\nSteps to achieve:\n\nDeadline:',
          fill: '#ffffff',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 530,
          top: 100,
          width: 220,
          height: 180,
          fill: 'transparent',
          stroke: '#F59E0B',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        {
          type: 'i-text',
          left: 550,
          top: 120,
          text: '💰 Financial Goal',
          fill: '#F59E0B',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'i-text',
          left: 550,
          top: 155,
          text: 'What I want:\n\nSteps to achieve:\n\nDeadline:',
          fill: '#ffffff',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
        },
        // Second row
        {
          type: 'rect',
          left: 170,
          top: 310,
          width: 220,
          height: 180,
          fill: 'transparent',
          stroke: '#EF4444',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        {
          type: 'i-text',
          left: 190,
          top: 330,
          text: '❤️ Relationship Goal',
          fill: '#EF4444',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'i-text',
          left: 190,
          top: 365,
          text: 'What I want:\n\nSteps to achieve:\n\nDeadline:',
          fill: '#ffffff',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 410,
          top: 310,
          width: 220,
          height: 180,
          fill: 'transparent',
          stroke: '#8B5CF6',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        {
          type: 'i-text',
          left: 430,
          top: 330,
          text: '🧠 Personal Growth',
          fill: '#8B5CF6',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'i-text',
          left: 430,
          top: 365,
          text: 'What I want:\n\nSteps to achieve:\n\nDeadline:',
          fill: '#ffffff',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
        },
      ],
      background: '#1a1a2e',
    }
  },
  {
    id: 'vision-board',
    name: 'Vision Board',
    description: 'Visualize your dreams and aspirations',
    icon: ImageIcon,
    color: '#EC4899',
    data: {
      version: '6.0.0',
      objects: [
        // Title
        {
          type: 'i-text',
          left: 280,
          top: 30,
          text: '✨ My Vision Board ✨',
          fill: '#EC4899',
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
        },
        // Vision boxes
        {
          type: 'rect',
          left: 50,
          top: 100,
          width: 180,
          height: 140,
          fill: 'rgba(236, 72, 153, 0.2)',
          stroke: '#EC4899',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 95,
          top: 155,
          text: '🏠 Dream Home',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 250,
          top: 100,
          width: 180,
          height: 140,
          fill: 'rgba(59, 130, 246, 0.2)',
          stroke: '#3B82F6',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 290,
          top: 155,
          text: '✈️ Travel Dreams',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 450,
          top: 100,
          width: 180,
          height: 140,
          fill: 'rgba(16, 185, 129, 0.2)',
          stroke: '#10B981',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 485,
          top: 155,
          text: '💪 Health & Fitness',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 650,
          top: 100,
          width: 180,
          height: 140,
          fill: 'rgba(139, 92, 246, 0.2)',
          stroke: '#8B5CF6',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 695,
          top: 155,
          text: '🎓 Learning',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // Second row
        {
          type: 'rect',
          left: 150,
          top: 270,
          width: 180,
          height: 140,
          fill: 'rgba(245, 158, 11, 0.2)',
          stroke: '#F59E0B',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 190,
          top: 325,
          text: '💼 Career Success',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 350,
          top: 270,
          width: 180,
          height: 140,
          fill: 'rgba(239, 68, 68, 0.2)',
          stroke: '#EF4444',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 395,
          top: 325,
          text: '❤️ Relationships',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 550,
          top: 270,
          width: 180,
          height: 140,
          fill: 'rgba(20, 184, 166, 0.2)',
          stroke: '#14B8A6',
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        {
          type: 'i-text',
          left: 590,
          top: 325,
          text: '💰 Financial Freedom',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // Affirmation
        {
          type: 'i-text',
          left: 250,
          top: 450,
          text: '"Everything I desire is coming to me"',
          fill: '#ffffff',
          fontSize: 20,
          fontStyle: 'italic',
          fontFamily: 'Georgia, serif',
        },
      ],
      background: '#1a1a2e',
    }
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Map processes and decision flows',
    icon: GitBranch,
    color: '#6366F1',
    data: {
      version: '6.0.0',
      objects: [
        // Start
        {
          type: 'rect',
          left: 350,
          top: 50,
          width: 100,
          height: 40,
          fill: '#10B981',
          stroke: '#ffffff',
          strokeWidth: 2,
          rx: 20,
          ry: 20,
        },
        {
          type: 'i-text',
          left: 378,
          top: 58,
          text: 'Start',
          fill: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
        // Arrow down
        {
          type: 'line',
          x1: 400, y1: 90, x2: 400, y2: 130,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        // Process
        {
          type: 'rect',
          left: 325,
          top: 130,
          width: 150,
          height: 60,
          fill: '#3B82F6',
          stroke: '#ffffff',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 355,
          top: 150,
          text: 'Process 1',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // Arrow
        {
          type: 'line',
          x1: 400, y1: 190, x2: 400, y2: 230,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        // Decision diamond (using rotated rect simulation)
        {
          type: 'polygon',
          points: [
            { x: 400, y: 230 },
            { x: 460, y: 290 },
            { x: 400, y: 350 },
            { x: 340, y: 290 },
          ],
          fill: '#F59E0B',
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 365,
          top: 275,
          text: 'Decision?',
          fill: '#1a1a1a',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
        // Yes branch
        {
          type: 'line',
          x1: 460, y1: 290, x2: 520, y2: 290,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 478,
          top: 270,
          text: 'Yes',
          fill: '#10B981',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 520,
          top: 260,
          width: 120,
          height: 60,
          fill: '#3B82F6',
          stroke: '#ffffff',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 550,
          top: 280,
          text: 'Action A',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // No branch
        {
          type: 'line',
          x1: 340, y1: 290, x2: 280, y2: 290,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 295,
          top: 270,
          text: 'No',
          fill: '#EF4444',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
        {
          type: 'rect',
          left: 160,
          top: 260,
          width: 120,
          height: 60,
          fill: '#3B82F6',
          stroke: '#ffffff',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 190,
          top: 280,
          text: 'Action B',
          fill: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
        },
        // End
        {
          type: 'line',
          x1: 400, y1: 350, x2: 400, y2: 400,
          stroke: '#ffffff',
          strokeWidth: 2,
        },
        {
          type: 'rect',
          left: 350,
          top: 400,
          width: 100,
          height: 40,
          fill: '#EF4444',
          stroke: '#ffffff',
          strokeWidth: 2,
          rx: 20,
          ry: 20,
        },
        {
          type: 'i-text',
          left: 385,
          top: 408,
          text: 'End',
          fill: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        },
      ],
      background: '#1a1a2e',
    }
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with a clean slate',
    icon: Layout,
    color: '#6B7280',
    data: {
      version: '6.0.0',
      objects: [],
      background: '#1a1a2e',
    }
  },
];

interface CanvasTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: CanvasTemplate) => void;
}

export const CanvasTemplatesDialog: React.FC<CanvasTemplatesDialogProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
}) => {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} className="bg-[#1a1a2e] border-white/10 text-white max-w-3xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose a Template
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-white/60">
            Start with a template or create from scratch
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {templates.map((template, index) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group text-left p-4 rounded-xl border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 transition-all"
              onClick={() => {
                onSelectTemplate(template);
                onOpenChange(false);
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${template.color}20` }}
              >
                <template.icon 
                  className="h-6 w-6" 
                  style={{ color: template.color }}
                />
              </div>
              <h3 className="font-semibold text-white mb-1">{template.name}</h3>
              <p className="text-sm text-white/50">{template.description}</p>
            </motion.button>
          ))}
        </div>
      </ResponsiveModal>
  );
};

export { templates };
