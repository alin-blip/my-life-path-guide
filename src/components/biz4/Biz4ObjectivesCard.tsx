import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { biz4MetricsService, Biz4WeeklyObjectives, WeeklyReport } from '@/services/biz4MetricsService';
import { 
  Target, PenLine, Clock, Users, MessageSquare, 
  Handshake, Settings, Check, X 
} from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Biz4ObjectivesCardProps {
  report: WeeklyReport | null;
}

export const Biz4ObjectivesCard: React.FC<Biz4ObjectivesCardProps> = ({ report }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [objectives, setObjectives] = useState<Biz4WeeklyObjectives | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Biz4WeeklyObjectives | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    const loadObjectives = async () => {
      setIsLoading(true);
      try {
        const data = await biz4MetricsService.getWeeklyObjectives(weekKey);
        setObjectives(data);
        setEditForm(data);
      } catch (error) {
        console.error('Error loading objectives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadObjectives();
  }, [weekKey]);

  const handleSave = async () => {
    if (!editForm) return;

    try {
      await biz4MetricsService.saveWeeklyObjectives(editForm);
      setObjectives(editForm);
      setIsEditOpen(false);
      toast({
        title: language === 'en' ? 'Objectives saved!' : 'Obiective salvate!',
        description: language === 'en' ? 'Your weekly targets have been updated.' : 'Țintele săptămânale au fost actualizate.',
      });
    } catch (error) {
      console.error('Error saving objectives:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save objectives.' : 'Salvare eșuată.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !objectives) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const objectivesList = [
    {
      id: 'content',
      label: { en: 'Content pieces', ro: 'Piese conținut' },
      icon: <PenLine className="h-4 w-4" />,
      current: report?.totalContent || 0,
      target: objectives.content_target,
      field: 'content_target' as const,
    },
    {
      id: 'engage',
      label: { en: 'Engage minutes', ro: 'Minute engage' },
      icon: <Clock className="h-4 w-4" />,
      current: report?.totalEngageMinutes || 0,
      target: objectives.engage_minutes_target,
      field: 'engage_minutes_target' as const,
    },
    {
      id: 'prospects',
      label: { en: 'Prospects contacted', ro: 'Prospecți contactați' },
      icon: <Users className="h-4 w-4" />,
      current: report?.totalProspects || 0,
      target: objectives.prospects_target,
      field: 'prospects_target' as const,
    },
    {
      id: 'conversations',
      label: { en: 'Sales conversations', ro: 'Conversații vânzări' },
      icon: <MessageSquare className="h-4 w-4" />,
      current: report?.totalConversations || 0,
      target: objectives.conversations_target,
      field: 'conversations_target' as const,
    },
    {
      id: 'deals',
      label: { en: 'Deals closed', ro: 'Tranzacții închise' },
      icon: <Handshake className="h-4 w-4" />,
      current: report?.totalDealsWon || 0,
      target: objectives.deals_target,
      field: 'deals_target' as const,
    },
  ];

  return (
    <>
      <Card className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border-indigo-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-300">
              <Target className="h-5 w-5" />
              {language === 'en' ? 'Weekly Objectives' : 'Obiective Săptămânale'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditForm(objectives);
                setIsEditOpen(true);
              }}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {objectivesList.map((obj) => {
            const progress = obj.target > 0 ? Math.min(100, Math.round((obj.current / obj.target) * 100)) : 0;
            const isComplete = obj.current >= obj.target;

            return (
              <div key={obj.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {obj.icon}
                    <span>{obj.label[language]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isComplete ? 'text-green-400' : ''}`}>
                      {obj.current}/{obj.target}
                    </span>
                    {isComplete && <Check className="h-4 w-4 text-green-400" />}
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className={`h-2 ${isComplete ? '[&>div]:bg-green-500' : ''}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Set Weekly Objectives' : 'Setează Obiective Săptămânale'}
            </DialogTitle>
          </DialogHeader>

          {editForm && (
            <div className="space-y-4 py-4">
              {objectivesList.map((obj) => (
                <div key={obj.id} className="space-y-2">
                  <Label htmlFor={obj.id} className="flex items-center gap-2">
                    {obj.icon}
                    {obj.label[language]}
                  </Label>
                  <Input
                    id={obj.id}
                    type="number"
                    min="0"
                    value={editForm[obj.field]}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      [obj.field]: parseInt(e.target.value) || 0,
                    })}
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </Button>
            <Button onClick={handleSave}>
              {language === 'en' ? 'Save' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
