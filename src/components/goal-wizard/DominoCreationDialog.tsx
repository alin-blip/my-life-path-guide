import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  Target, 
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getActiveWeekKey } from '@/utils/weekUtils';
import { useNavigate } from 'react-router-dom';

interface DominoCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  annualGoal: string;
  monthlyGoal: string;
  language: 'en' | 'ro';
  onComplete?: () => void;
}

export const DominoCreationDialog: React.FC<DominoCreationDialogProps> = ({
  isOpen,
  onClose,
  annualGoal,
  monthlyGoal,
  language,
  onComplete
}) => {
  const navigate = useNavigate();
  const [dominoTitle, setDominoTitle] = useState(annualGoal);
  const [weekGoal, setWeekGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!dominoTitle.trim()) {
      toast.error(language === 'en' ? 'Enter a domino title' : 'Introdu un titlu pentru domino');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const weekKey = getActiveWeekKey();

      // Create or update weekly_planning for this week
      const { error } = await supabase
        .from('weekly_planning')
        .upsert({
          user_id: user.id,
          week_key: weekKey,
          category: 'business',
          domino_title: dominoTitle.trim(),
          week_goal: weekGoal.trim() || monthlyGoal,
          key_points: [
            { id: 1, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
            { id: 2, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
            { id: 3, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' },
            { id: 4, title: '', objective: '', why: '', positiveImpact: '', negativeImpact: '', steps: [], responsible: 'Eu', deadline: '' }
          ],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,week_key,category'
        });

      if (error) throw error;

      toast.success(
        language === 'en' 
          ? 'Domino created! Redirecting to Door...' 
          : 'Domino creat! Redirecționare către Door...'
      );

      onComplete?.();
      onClose();
      
      // Navigate to door after short delay
      setTimeout(() => {
        navigate('/door');
      }, 500);
    } catch (error) {
      console.error('Error creating domino:', error);
      toast.error(language === 'en' ? 'Failed to create domino' : 'Nu s-a putut crea domino-ul');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {language === 'en' ? 'Set Up This Week\'s Domino' : 'Setează Domino-ul Săptămânii'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context */}
          <div className="bg-blue-500/10 rounded-lg p-3 text-sm border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Briefcase className="h-4 w-4" />
              <span className="font-medium">Business</span>
            </div>
            <p className="text-muted-foreground text-xs">
              {language === 'en' 
                ? 'Your annual goal will become this week\'s domino focus:' 
                : 'Obiectivul tău anual va deveni focusul domino pentru săptămâna aceasta:'}
            </p>
          </div>

          {/* Domino Title */}
          <div className="space-y-2">
            <Label>
              {language === 'en' ? 'Domino Title (Annual Focus)' : 'Titlu Domino (Focus Anual)'}
            </Label>
            <Input
              value={dominoTitle}
              onChange={(e) => setDominoTitle(e.target.value)}
              placeholder={language === 'en' ? 'Your main focus...' : 'Focusul tău principal...'}
            />
          </div>

          {/* Week Goal */}
          <div className="space-y-2">
            <Label>
              {language === 'en' ? 'This Week\'s Goal (Optional)' : 'Obiectivul Săptămânii (Opțional)'}
            </Label>
            <Textarea
              value={weekGoal}
              onChange={(e) => setWeekGoal(e.target.value)}
              placeholder={monthlyGoal || (language === 'en' ? 'What do you want to achieve this week?' : 'Ce vrei să realizezi săptămâna aceasta?')}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'en' 
                ? 'Leave empty to use your monthly goal as default' 
                : 'Lasă gol pentru a folosi obiectivul lunar ca default'}
            </p>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'en' ? 'Your Domino will look like:' : 'Domino-ul tău va arăta așa:'}
            </p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-amber-500" />
              {dominoTitle || (language === 'en' ? '(Enter title)' : '(Introdu titlu)')}
            </div>
            {(weekGoal || monthlyGoal) && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                → {weekGoal || monthlyGoal}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            {language === 'en' ? 'Skip' : 'Sari'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !dominoTitle.trim()}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {language === 'en' ? 'Create & Open Door' : 'Creează & Deschide Door'}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
