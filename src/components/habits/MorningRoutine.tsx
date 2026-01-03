import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MorningRoutine: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="border transition-all duration-300 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-lg">Rutina de Campion</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Execuție ghidată: Gratitudine → Meditație → Exercițiu → Meal Planning → Content → Task-uri
        </p>
      </CardHeader>

      <CardContent className="pt-2 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate('/champion-routine-history')}
          >
            <Clock className="h-4 w-4" />
            Istoric
          </Button>
          <Button
            className={cn(
              "flex-1 gap-2",
              "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            )}
            onClick={() => navigate('/daily-flow')}
          >
            Începe Rutina
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
