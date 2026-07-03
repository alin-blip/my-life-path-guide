import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getYear, startOfWeek } from 'date-fns';
import { marriageService, MarriageSession } from '@/services/marriageService';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  session: MarriageSession;
  onExported?: () => void;
}

export const MarriageTaskExportCard: React.FC<Props> = ({ session, onExported }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(session.task_exported);

  const exportToHitList = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekNum = getISOWeek(weekStart);
      const year = getYear(weekStart);
      const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
      const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const dayOfWeek = days[now.getDay()];

      const { data, error } = await supabase.from('user_tasks').insert({
        user_id: user.id,
        title: session.task_title,
        task_type: 'hit',
        list_type: 'hit',
        day_of_week: dayOfWeek,
        week_key: weekKey,
        priority: 1,
        completed: false,
      }).select().single();

      if (error) throw error;
      await marriageService.markTaskExported(session.id, data.id);
      setDone(true);
      toast.success(t('marriage.taskExport.addedToHitList'));
      onExported?.();
    } catch (e: any) {
      toast.error(t('marriage.taskExport.exportError') + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 bg-card border-l-4 border-l-primary">
      <div className="flex items-start gap-3">
        <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold">{session.task_title}</h3>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{session.task_description}</p>
          <div className="mt-4">
            {done ? (
              <Button variant="outline" disabled className="gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t('marriage.taskExport.addedBtn')}
              </Button>
            ) : (
              <Button onClick={exportToHitList} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                {t('marriage.taskExport.addBtn')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
