import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Sparkles, Baby, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface RelationshipStepProps {
  onComplete: () => void;
}

export const RelationshipStep = ({ onComplete }: RelationshipStepProps) => {
  const [partnerMessage, setPartnerMessage] = useState('');
  const [partnerAction, setPartnerAction] = useState('');
  const [partnerCompleted, setPartnerCompleted] = useState(false);
  
  const [childTime, setChildTime] = useState('');
  const [childCompleted, setChildCompleted] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('relationship_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (data) {
        const partner = data.find(d => d.person_type === 'partner');
        const child = data.find(d => d.person_type === 'child');

        if (partner) {
          setPartnerMessage(partner.message_sent || '');
          setPartnerAction(partner.action_description || '');
          setPartnerCompleted(partner.completed || false);
        }

        if (child) {
          setChildTime(child.quality_time_description || '');
          setChildCompleted(child.completed || false);
        }
      }
    } catch (error) {
      console.error('Error loading relationship data:', error);
    }
  };

  const savePartnerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('relationship_actions')
        .upsert({
          user_id: user.id,
          date: today,
          person_type: 'partner',
          person_name: 'Soția',
          message_sent: partnerMessage,
          action_description: partnerAction,
          completed: partnerCompleted
        }, {
          onConflict: 'user_id,date,person_type'
        });

      if (error) throw error;
      toast.success('Salvat pentru soție! 💕');
    } catch (error) {
      console.error('Error saving partner data:', error);
      toast.error('Nu am putut salva');
    }
  };

  const saveChildData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('relationship_actions')
        .upsert({
          user_id: user.id,
          date: today,
          person_type: 'child',
          person_name: 'Eva',
          quality_time_description: childTime,
          completed: childCompleted
        }, {
          onConflict: 'user_id,date,person_type'
        });

      if (error) throw error;
      toast.success('Salvat pentru Eva! 👶');
    } catch (error) {
      console.error('Error saving child data:', error);
      toast.error('Nu am putut salva');
    }
  };

  const canComplete = partnerCompleted && childCompleted;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Heart className="h-5 w-5" />
          Relații
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Partner Section */}
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-medium">Soția</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>Ce mesaj îi trimiți azi?</span>
            </div>
            <Textarea
              placeholder="Scrie mesajul aici..."
              value={partnerMessage}
              onChange={(e) => setPartnerMessage(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Ce faci pentru ea azi să o ridici?</span>
            </div>
            <Textarea
              placeholder="Descrie acțiunea ta..."
              value={partnerAction}
              onChange={(e) => setPartnerAction(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setPartnerCompleted(!partnerCompleted)}
            >
              <Checkbox checked={partnerCompleted} />
              <span className="text-sm">Am făcut asta</span>
            </div>
            <Button variant="secondary" size="sm" onClick={savePartnerData}>
              Salvează
            </Button>
          </div>
        </div>

        {/* Child Section */}
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <div className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">Eva</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>Timp de calitate cu Eva - ce faci cu ea azi?</span>
            </div>
            <Textarea
              placeholder="Descrie activitatea..."
              value={childTime}
              onChange={(e) => setChildTime(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setChildCompleted(!childCompleted)}
            >
              <Checkbox checked={childCompleted} />
              <span className="text-sm">Am petrecut timp cu ea</span>
            </div>
            <Button variant="secondary" size="sm" onClick={saveChildData}>
              Salvează
            </Button>
          </div>
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={onComplete}
          disabled={!canComplete}
        >
          <Check className="h-4 w-4" />
          Completează Pasul
        </Button>
      </CardContent>
    </Card>
  );
};
