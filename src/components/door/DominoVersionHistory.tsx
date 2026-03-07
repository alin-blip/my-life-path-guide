import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Trash2, Eye, Clock, Target, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { weeklyPlanningHistoryService, WeeklyPlanningHistoryItem } from '@/services/weeklyPlanningHistoryService';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, DominoKeyPoint, PlanningResult } from '@/types/door';
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

interface DominoVersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  weekKey: string;
  currentDomino: HotListItem | null;
  currentKeyPoints: DominoKeyPoint[];
  onRestore: (domino: HotListItem, keyPoints: DominoKeyPoint[]) => void;
}

export const DominoVersionHistory: React.FC<DominoVersionHistoryProps> = ({
  isOpen,
  onClose,
  weekKey,
  currentDomino,
  currentKeyPoints,
  onRestore,
}) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<WeeklyPlanningHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<WeeklyPlanningHistoryItem | null>(null);
  const [savingBackup, setSavingBackup] = useState(false);

  useEffect(() => {
    if (isOpen && weekKey) {
      loadHistory();
    }
  }, [isOpen, weekKey]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await weeklyPlanningHistoryService.getHistoryForWeek(weekKey);
    setHistory(data);
    setLoading(false);
  };

  const handleCreateBackup = async () => {
    if (!currentDomino) {
      toast({
        title: '⚠️ Nu ai Domino selectat',
        description: 'Selectează un Domino înainte de a crea un backup.',
        variant: 'destructive',
      });
      return;
    }

    setSavingBackup(true);
    
    const keyPoints: PlanningResult['keyPoints'] = currentKeyPoints.map((kp, idx) => ({
      id: idx + 1,
      title: kp.text,
      objective: kp.metadata?.objective || '',
      why: kp.metadata?.why || '',
      positiveImpact: kp.metadata?.positiveImpact || '',
      negativeImpact: kp.metadata?.negativeImpact || '',
      steps: kp.metadata?.steps || [],
      responsible: kp.metadata?.responsible || '',
      deadline: kp.metadata?.deadline || '',
    }));

    const success = await weeklyPlanningHistoryService.createSnapshot(
      weekKey,
      currentDomino.text,
      '',
      keyPoints,
      'manual_backup'
    );

    setSavingBackup(false);

    if (success) {
      toast({
        title: '✅ Backup creat!',
        description: 'Versiunea curentă a fost salvată în istoric.',
      });
      loadHistory();
    } else {
      toast({
        title: '❌ Eroare',
        description: 'Nu s-a putut crea backup-ul.',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = (version: WeeklyPlanningHistoryItem) => {
    const domino: HotListItem = {
      id: `domino-restored-${Date.now()}`,
      text: version.dominoTitle,
      selected: true,
      priority: 'urgent-important',
    };

    const keyPoints: DominoKeyPoint[] = version.keyPoints.map((kp) => ({
      id: `key${kp.id}`,
      text: kp.title,
      completed: false,
      metadata: {
        objective: kp.objective,
        why: kp.why,
        positiveImpact: kp.positiveImpact,
        negativeImpact: kp.negativeImpact,
        steps: kp.steps,
        responsible: kp.responsible,
        deadline: kp.deadline,
      },
    }));

    onRestore(domino, keyPoints);
    onClose();

    toast({
      title: '🔄 Versiune restaurată!',
      description: `Domino "${version.dominoTitle}" a fost restaurat din versiunea ${version.versionNumber}.`,
    });
  };

  const handleDeleteClick = (version: WeeklyPlanningHistoryItem) => {
    setVersionToDelete(version);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;

    const success = await weeklyPlanningHistoryService.deleteVersion(versionToDelete.id);
    
    if (success) {
      toast({
        title: '✅ Versiune ștearsă',
        description: `Versiunea ${versionToDelete.versionNumber} a fost ștearsă.`,
      });
      loadHistory();
    } else {
      toast({
        title: '❌ Eroare',
        description: 'Nu s-a putut șterge versiunea.',
        variant: 'destructive',
      });
    }

    setDeleteDialogOpen(false);
    setVersionToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d MMM yyyy, HH:mm", { locale: ro });
    } catch {
      // Invalid date format – return original string
      return dateStr;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'auto_save':
        return 'Auto-save';
      case 'manual_backup':
        return 'Backup manual';
      default:
        return reason;
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Istoric Versiuni Domino Door
            </DrawerTitle>
            <DrawerDescription>
              Restaurează versiuni anterioare ale Domino-ului și cheilor tale
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-4">
            <Button 
              onClick={handleCreateBackup}
              disabled={savingBackup || !currentDomino}
              className="w-full gap-2"
              variant="outline"
            >
              {savingBackup ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvează versiunea curentă ca backup
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="px-6 pb-6 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nu există versiuni anterioare pentru această săptămână</p>
                <p className="text-sm mt-2">Istoricul se salvează automat când modifici Domino-ul</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((version) => {
                  const isExpanded = expandedId === version.id;
                  
                  return (
                    <div 
                      key={version.id} 
                      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(version.createdAt)}</span>
                            <Badge variant="secondary" className="text-xs">
                              v{version.versionNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getReasonLabel(version.snapshotReason)}
                            </Badge>
                          </div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            {version.dominoTitle || '(Fără titlu)'}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : version.id)}
                            title="Vezi detalii"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(version)}
                            title="Restaurează"
                            className="gap-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Restaurează</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(version)}
                            title="Șterge"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && version.keyPoints.length > 0 && (
                        <div className="border-t pt-3 mt-3 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Cele 4 Chei:
                          </p>
                          {version.keyPoints.map((kp, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm pl-4">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                              <div>
                                <span className="font-medium">{kp.title}</span>
                                {kp.objective && (
                                  <p className="text-muted-foreground text-xs mt-0.5">
                                    Obiectiv: {kp.objective}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge versiunea?</AlertDialogTitle>
            <AlertDialogDescription>
              Vrei să ștergi versiunea {versionToDelete?.versionNumber}?
              <br />
              <strong>{versionToDelete?.dominoTitle}</strong>
              <br /><br />
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
