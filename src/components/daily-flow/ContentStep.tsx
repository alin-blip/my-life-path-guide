import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, FileText, Video, Image, Mic, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ContentStepProps {
  onComplete: () => void;
}

const CONTENT_TYPES = [
  { value: 'article', label: 'Articol / Blog Post', icon: FileText },
  { value: 'video', label: 'Video YouTube', icon: Video },
  { value: 'reel', label: 'Reel / Short', icon: Video },
  { value: 'post', label: 'Post Social Media', icon: Image },
  { value: 'podcast', label: 'Podcast', icon: Mic },
];

export const ContentStep = ({ onComplete }: ContentStepProps) => {
  const [contentType, setContentType] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [steps, setSteps] = useState({
    scripting: false,
    recording: false,
    editing: false,
    publishing: false
  });
  const [completed, setCompleted] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('content_creation')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setContentType(data.content_type || '');
        setContentDescription(data.content_description || '');
        setVideoDescription(data.video_description || '');
        setSteps((data.steps_completed as typeof steps) || steps);
        setCompleted(data.completed || false);
      }
    } catch (error) {
      console.error('Error loading content data:', error);
    }
  };

  const saveData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('content_creation')
        .upsert({
          user_id: user.id,
          date: today,
          content_type: contentType,
          content_description: contentDescription,
          video_description: videoDescription,
          steps_completed: steps,
          completed: completed
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
      toast.success('Content salvat! 📝');
    } catch (error) {
      console.error('Error saving content data:', error);
      toast.error('Nu am putut salva');
    }
  };

  const toggleStep = (key: keyof typeof steps) => {
    setSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasContent = contentType || contentDescription || videoDescription;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-500">
          <Briefcase className="h-5 w-5" />
          Business / Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ce conținut creezi azi?</label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează tipul de conținut" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descriere conținut</label>
          <Textarea
            placeholder="Despre ce este conținutul de azi?"
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Video Description */}
        {(contentType === 'video' || contentType === 'reel') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Detalii video</label>
            <Textarea
              placeholder="Ce video faci? Titlu, idei, hook..."
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Progress Steps */}
        {hasContent && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Progres</label>
            
            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleStep('scripting')}
            >
              <Checkbox checked={steps.scripting} />
              <span>Scripting / Planificare</span>
            </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleStep('recording')}
            >
              <Checkbox checked={steps.recording} />
              <span>Înregistrare / Scriere</span>
            </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleStep('editing')}
            >
              <Checkbox checked={steps.editing} />
              <span>Editare</span>
            </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleStep('publishing')}
            >
              <Checkbox checked={steps.publishing} />
              <span>Publicare</span>
            </div>
          </div>
        )}

        {/* Completed Checkbox */}
        <div 
          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setCompleted(!completed)}
        >
          <Checkbox checked={completed} />
          <span className="font-medium">Am terminat conținutul pentru azi</span>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveData} className="flex-1">
            Salvează
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={onComplete}
            disabled={!completed}
          >
            <Check className="h-4 w-4" />
            Completează
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
