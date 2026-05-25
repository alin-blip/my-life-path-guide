import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Save, Loader2 } from 'lucide-react';
import { mindShiftService } from '@/services/mindShiftService';
import { toast } from 'sonner';
import type { DashboardWidget } from '@/types/dashboardWidget';

interface Props {
  size?: DashboardWidget['size'];
  onRemove?: () => void;
  onResize?: (size: DashboardWidget['size']) => void;
  dragHandleProps?: any;
}

export const MindShiftQuickCaptureWidget: React.FC<Props> = ({ dragHandleProps }) => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [draftCount, setDraftCount] = useState<number | null>(null);

  React.useEffect(() => {
    mindShiftService.countDrafts().then(setDraftCount).catch(() => {});
  }, []);

  const save = async (processNow: boolean) => {
    if (!text.trim()) {
      toast.error('Scrie un gând întâi');
      return;
    }
    setSaving(true);
    try {
      const draft = await mindShiftService.createDraft(text.trim(), 'dashboard');
      toast.success('Gând salvat ✓');
      setText('');
      const count = await mindShiftService.countDrafts();
      setDraftCount(count);
      if (processNow && draft.id) {
        navigate(`/mind-shifting?session=${draft.id}`);
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 h-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between" {...dragHandleProps}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Notează un gând</h3>
              <p className="text-[11px] text-muted-foreground">Procesează-l acum sau salvează pentru mai târziu</p>
            </div>
          </div>
          {draftCount !== null && draftCount > 0 && (
            <button
              type="button"
              onClick={() => navigate('/mind-shifting?tab=inbox')}
              className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
            >
              {draftCount} în inbox
            </button>
          )}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='ex: „Nimic nu o să mai meargă fără el."'
          className="min-h-[70px] text-sm resize-none"
          disabled={saving}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => save(false)}
            disabled={!text.trim() || saving}
            className="flex-1"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Salvează
          </Button>
          <Button
            size="sm"
            onClick={() => save(true)}
            disabled={!text.trim() || saving}
            className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Prelucrează acum
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
