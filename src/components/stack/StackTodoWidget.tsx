
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Target, 
  CheckSquare, 
  Flame, 
  Trash2,
  Plus
} from 'lucide-react';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';

interface StackTodoWidgetProps {
  onAddToHitList?: (action: string) => void;
  isMinimized?: boolean;
}

export const StackTodoWidget: React.FC<StackTodoWidgetProps> = ({ 
  onAddToHitList,
  isMinimized = false 
}) => {
  const {
    capturedIdeas,
    openIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const getCategoryIcon = (category: 'hit' | 'do' | 'hot') => {
    switch (category) {
      case 'hit':
        return <Target className="w-3 h-3" />;
      case 'do':
        return <CheckSquare className="w-3 h-3" />;
      default:
        return <Flame className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: 'hit' | 'do' | 'hot') => {
    switch (category) {
      case 'hit':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'do':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={openIdeaModal}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
          size="lg"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          💡 Salvează ideea
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-purple-500/30 bg-purple-950/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Idei de Execuție
          {capturedIdeas.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {capturedIdeas.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={openIdeaModal}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă idee nouă
        </Button>
        
        {capturedIdeas.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2">Idei capturate recent:</p>
            {capturedIdeas.slice(-3).map((idea) => (
              <div
                key={idea.id}
                className="flex items-start gap-2 p-2 bg-gray-800/30 rounded-md text-xs"
              >
                <div className="flex items-center gap-1">
                  {getCategoryIcon(idea.category)}
                  <Badge className={`text-xs px-1 py-0 ${getCategoryColor(idea.category)}`}>
                    {idea.category.toUpperCase()}
                  </Badge>
                </div>
                <p className="flex-1 text-gray-300 line-clamp-2">
                  {idea.text}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {capturedIdeas.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            Nicio idee capturată încă. Începe să adaugi idei pe măsură ce parcurgi Stack-ul!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
