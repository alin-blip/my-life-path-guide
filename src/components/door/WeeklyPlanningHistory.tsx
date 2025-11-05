import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar, Target, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { WeeklyPlanningData } from '@/services/weeklyPlanningService';
import { format, parseISO } from 'date-fns';

interface WeeklyPlanningHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  plans: WeeklyPlanningData[];
  onSelectPlan: (plan: WeeklyPlanningData) => void;
}

export const WeeklyPlanningHistory: React.FC<WeeklyPlanningHistoryProps> = ({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Istoric Planificare Săptămânală
          </DrawerTitle>
          <DrawerDescription>
            Vezi toate planurile tale anterioare și revenire la ele
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="px-6 pb-6">
          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nu ai planuri săptămânale salvate încă</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                {plans.map((plan, index) => (
                  <div key={plan.id} className="relative pl-16 pb-8">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Săptămâna {plan.weekKey}
                          </div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            {plan.dominoTitle}
                          </h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSelectPlan(plan);
                            onClose();
                          }}
                        >
                          Reîncarcă Plan
                        </Button>
                      </div>

                      {plan.weekGoal && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {plan.weekGoal}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Cele 4 Chei:
                        </div>
                        {plan.keyPoints.map((kp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm pl-6">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{kp.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
