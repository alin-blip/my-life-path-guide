import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Compass, 
  Mountain, 
  Palette, 
  Sparkles, 
  PenTool, 
  Timer, 
  Heart,
  ArrowRight,
  Wand2,
  Headphones
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AIFramework {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
  emoji: string;
}

interface ExistingTool {
  name: string;
  path: string;
  icon: React.ElementType;
  emoji: string;
}

const aiFrameworks: AIFramework[] = [
  {
    id: 'storytelling',
    name: 'Storytelling Framework',
    description: '7 Elemente ale unei Povești Captivante',
    icon: BookOpen,
    color: 'purple',
    path: '/stack?type=storytelling',
    emoji: '📖'
  },
  {
    id: 'hero-journey',
    name: "Hero's Journey",
    description: '7 Etape ale Călătoriei Eroului (Joseph Campbell)',
    icon: Compass,
    color: 'cyan',
    path: '/stack?type=hero-journey',
    emoji: '🗺️'
  },
  {
    id: 'path-to-success',
    name: 'Calea spre Succes',
    description: '7 Pași pentru Transformare Totală (Tony Robbins)',
    icon: Mountain,
    color: 'amber',
    path: '/stack?type=path-to-success',
    emoji: '🏔️'
  }
];

const existingTools: ExistingTool[] = [
  { name: 'Lifebook', path: '/lifebook', icon: BookOpen, emoji: '📚' },
  { name: 'Vibe Canvas', path: '/vibe-canvas', icon: Palette, emoji: '🎨' },
  { name: 'Vision Board', path: '/vision-board', icon: Sparkles, emoji: '✨' },
  { name: 'Journal', path: '/journal', icon: PenTool, emoji: '📝' },
  { name: 'Time Tracker', path: '/time-tracker', icon: Timer, emoji: '⏱️' },
  { name: 'Emotional Tracker', path: '/emotional-tracker', icon: Heart, emoji: '💖' },
  { name: 'Empowerment Meditation', path: '/empowerment-meditation', icon: Headphones, emoji: '🧘' },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    text: 'text-purple-400',
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    text: 'text-cyan-400',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    text: 'text-amber-400',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent'
  }
};

const ToolsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
              <Wand2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">AI Tools & Frameworks</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unelte AI pentru transformare și creație de conținut. Alege un framework și lasă AI-ul să te ghideze.
            </p>
          </div>

          {/* AI Frameworks Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Framework-uri AI pentru Content Creation
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {aiFrameworks.map((framework) => {
                const colors = colorClasses[framework.color];
                const Icon = framework.icon;
                
                return (
                  <Card 
                    key={framework.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-300",
                      "bg-gradient-to-br",
                      colors.gradient,
                      colors.border,
                      "hover:scale-[1.02] hover:shadow-lg"
                    )}
                    onClick={() => navigate(framework.path)}
                  >
                    <div className="p-6 space-y-4">
                      <div className={cn(
                        "inline-flex items-center justify-center w-14 h-14 rounded-xl",
                        colors.bg
                      )}>
                        <span className="text-3xl">{framework.emoji}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{framework.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {framework.description}
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full gap-2"
                        variant="outline"
                      >
                        Deschide
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Other Tools */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Alte Unelte
            </h2>
            
            <Card className="p-6">
              <div className="flex flex-wrap gap-3">
                {existingTools.map((tool) => (
                  <Button
                    key={tool.path}
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate(tool.path)}
                  >
                    <span>{tool.emoji}</span>
                    {tool.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ToolsPage;
