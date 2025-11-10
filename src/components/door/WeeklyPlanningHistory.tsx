import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar, Target, TrendingUp, CheckCircle2, Clock, Trash2, Eye, RotateCcw } from 'lucide-react';
import { WeeklyPlanningData, weeklyPlanningService } from '@/services/weeklyPlanningService';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WeeklyPlanningHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  plans: WeeklyPlanningData[];
  onSelectPlan: (plan: WeeklyPlanningData) => void;
  onRefresh: () => void;
}

export const WeeklyPlanningHistory: React.FC<WeeklyPlanningHistoryProps> = ({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<WeeklyPlanningData | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const handleDeleteClick = (plan: WeeklyPlanningData) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete?.id) return;

    const success = await weeklyPlanningService.deletePlan(planToDelete.id);
    
    if (success) {
      toast({
        title: '✅ Plan șters',
        description: `Planul pentru săptămâna ${planToDelete.weekKey} a fost șters cu succes.`,
      });
      onRefresh();
    } else {
      toast({
        title: '❌ Eroare',
        description: 'Nu s-a putut șterge planul. Încearcă din nou.',
        variant: 'destructive',
      });
    }

    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  const toggleExpand = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Istoric Planificare Săptămânală
            </DrawerTitle>
            <DrawerDescription>
              Vezi, restaurează sau șterge planurile tale anterioare
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

                  {plans.map((plan, index) => {
                    const isExpanded = expandedPlan === plan.id;
                    
                    return (
                      <div key={plan.id} className="relative pl-16 pb-8">
                        {/* Timeline dot */}
                        <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                        <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-1">
                                Săptămâna {plan.weekKey}
                              </div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                {plan.dominoTitle}
                              </h3>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(plan.id!)}
                                title="Vezi detalii"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  onSelectPlan(plan);
                                  onClose();
                                }}
                                title="Restaurează plan"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Restaurează
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(plan)}
                                title="Șterge plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {plan.weekGoal && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {plan.weekGoal}
                            </p>
                          )}

                          {isExpanded && (
                            <div className="space-y-3 border-t pt-3 mt-3">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Cele 4 Chei:
                              </div>
                              {plan.keyPoints.map((kp, idx) => (
                                <div key={idx} className="pl-6 space-y-2 border-l-2 border-primary/20">
                                  <div className="flex items-start gap-2 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                    <span>{kp.title}</span>
                                  </div>
                                  {kp.objective && (
                                    <p className="text-sm text-muted-foreground pl-6">
                                      <strong>Obiectiv:</strong> {kp.objective}
                                    </p>
                                  )}
                                  {kp.positiveImpact && (
                                    <p className="text-sm text-green-600 pl-6">
                                      <strong>Impact pozitiv:</strong> {kp.positiveImpact}
                                    </p>
                                  )}
                                  {kp.responsible && (
                                    <p className="text-sm text-muted-foreground pl-6">
                                      <strong>Responsabil:</strong> {kp.responsible}
                                    </p>
                                  )}
                                  {kp.deadline && (
                                    <p className="text-sm text-muted-foreground pl-6">
                                      <strong>Deadline:</strong> {kp.deadline}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {!isExpanded && (
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
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Vrei să ștergi planul pentru <strong>săptămâna {planToDelete?.weekKey}</strong>?
              <br />
              Domino: <strong>{planToDelete?.dominoTitle}</strong>
              <br /><br />
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Șterge Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
