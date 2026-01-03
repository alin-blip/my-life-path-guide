import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChampionRoutineFlow } from '@/components/champion-routine/ChampionRoutineFlow';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const DailyFlow = () => {
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rutina de Campion</h1>
            <p className="text-muted-foreground capitalize">{today}</p>
          </div>
        </div>

        {/* Champion Routine Flow - Execution Room */}
        <ChampionRoutineFlow onComplete={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default DailyFlow;
