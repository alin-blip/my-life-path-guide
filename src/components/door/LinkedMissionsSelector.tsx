import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Link2, Unlink, ChevronDown, ChevronUp, Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Mission {
  id: string;
  title: string;
  category: string;
  mission_type: string;
  measurable_result?: string;
  goal_data?: any;
  parent_mission_id?: string;
  period?: string;
}

interface LinkedMissionsSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quarterlyGoalId: string;
  quarterlyGoalTitle: string;
  category: string;
}

const CATEGORY_ICONS = {
  body: Dumbbell,
  being: Brain,
  balance: Heart,
  business: Briefcase
};

const CATEGORY_COLORS = {
  body: 'text-emerald-500',
  being: 'text-purple-500',
  balance: 'text-rose-500',
  business: 'text-blue-500'
};

export const LinkedMissionsSelector: React.FC<LinkedMissionsSelectorProps> = ({
  open,
  onOpenChange,
  quarterlyGoalId,
  quarterlyGoalTitle,
  category
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthlyMissions, setMonthlyMissions] = useState<Mission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      loadMonthlyMissions();
    }
  }, [open, quarterlyGoalId, category]);

  const loadMonthlyMissions = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Load monthly missions for this category
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('mission_type', 'monthly')
        .eq('category', category)
        .order('period', { ascending: false });

      if (error) throw error;

      setMonthlyMissions(data || []);
      
      // Find which ones are already linked
      const linkedIds = new Set(
        (data || [])
          .filter((m: any) => m.parent_mission_id === quarterlyGoalId)
          .map((m: any) => m.id)
      );
      setSelectedIds(linkedIds);
      
      // Auto-expand months with linked missions
      const monthsToExpand = new Set<string>();
      (data || []).forEach((m: any) => {
        if (m.parent_mission_id === quarterlyGoalId && m.period) {
          monthsToExpand.add(m.period);
        }
      });
      setExpandedMonths(monthsToExpand);

    } catch (error) {
      console.error('Error loading monthly missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (missionId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(missionId)) {
        next.delete(missionId);
      } else {
        next.add(missionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update all monthly missions - link selected, unlink deselected
      const updates = monthlyMissions.map(mission => ({
        id: mission.id,
        parent_mission_id: selectedIds.has(mission.id) ? quarterlyGoalId : null
      }));

      for (const update of updates) {
        await supabase
          .from('missions')
          .update({ parent_mission_id: update.parent_mission_id })
          .eq('id', update.id);
      }

      toast({
        title: language === 'en' ? 'Links updated' : 'Legături actualizate',
        description: language === 'en' 
          ? `${selectedIds.size} monthly missions linked`
          : `${selectedIds.size} misiuni lunare legate`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving links:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Group missions by period (month)
  const missionsByMonth = monthlyMissions.reduce((acc, mission) => {
    const period = mission.period || 'Unknown';
    if (!acc[period]) acc[period] = [];
    acc[period].push(mission);
    return acc;
  }, {} as Record<string, Mission[]>);

  const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Link2;
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'text-primary';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Link Monthly Missions' : 'Leagă Misiuni Lunare'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          {/* Parent goal info */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("w-4 h-4", color)} />
              <Badge variant="secondary" className="text-xs">
                {language === 'en' ? '90-Day Goal' : 'Obiectiv 90 Zile'}
              </Badge>
            </div>
            <p className="font-medium text-sm">{quarterlyGoalTitle}</p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Se încarcă...'}
            </div>
          ) : Object.keys(missionsByMonth).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Unlink className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>{language === 'en' ? 'No monthly missions found' : 'Nu există misiuni lunare'}</p>
              <p className="text-xs mt-1">
                {language === 'en' 
                  ? 'Create monthly missions first' 
                  : 'Creează mai întâi misiuni lunare'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Select monthly missions to link to this quarterly goal:'
                  : 'Selectează misiunile lunare de legat la acest obiectiv trimestrial:'}
              </p>
              
              {Object.entries(missionsByMonth).map(([period, missions]) => (
                <Collapsible 
                  key={period}
                  open={expandedMonths.has(period)}
                  onOpenChange={(open) => {
                    setExpandedMonths(prev => {
                      const next = new Set(prev);
                      if (open) next.add(period);
                      else next.delete(period);
                      return next;
                    });
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between py-2 px-3"
                    >
                      <span className="font-medium">{period}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {missions.filter(m => selectedIds.has(m.id)).length}/{missions.length}
                        </Badge>
                        {expandedMonths.has(period) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1 pl-2">
                    {missions.map((mission) => (
                      <label
                        key={mission.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          selectedIds.has(mission.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(mission.id)}
                          onCheckedChange={() => toggleSelection(mission.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{mission.title || 'Untitled'}</p>
                          {mission.measurable_result && (
                            <p className="text-xs text-muted-foreground truncate">
                              {mission.measurable_result}
                            </p>
                          )}
                        </div>
                        {mission.goal_data?.progress !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {mission.goal_data.progress}%
                          </Badge>
                        )}
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {language === 'en' ? 'Cancel' : 'Anulează'}
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving 
              ? (language === 'en' ? 'Saving...' : 'Se salvează...')
              : (language === 'en' ? 'Save Links' : 'Salvează Legăturile')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
