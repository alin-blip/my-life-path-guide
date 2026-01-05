import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, Loader2, Wand2, 
  Book, Heart, Target, Clock, Check, Star, Trophy, Flame,
  Dumbbell, Brain, Coffee, Sun, Moon, Droplet, Apple, Smile
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WidgetConfig, WidgetType, WidgetColor } from '@/types/customWidget';
import { CustomWidgetRenderer } from './CustomWidgetRenderer';

interface AIWidgetBuilderProps {
  onCreateWidget: (name: string, config: WidgetConfig, description?: string) => Promise<any>;
  onCancel: () => void;
}

const ICON_OPTIONS = [
  { value: 'Book', icon: Book },
  { value: 'Heart', icon: Heart },
  { value: 'Target', icon: Target },
  { value: 'Clock', icon: Clock },
  { value: 'Check', icon: Check },
  { value: 'Star', icon: Star },
  { value: 'Trophy', icon: Trophy },
  { value: 'Flame', icon: Flame },
  { value: 'Dumbbell', icon: Dumbbell },
  { value: 'Brain', icon: Brain },
  { value: 'Coffee', icon: Coffee },
  { value: 'Sun', icon: Sun },
  { value: 'Moon', icon: Moon },
  { value: 'Droplet', icon: Droplet },
  { value: 'Apple', icon: Apple },
  { value: 'Smile', icon: Smile },
];

const COLOR_OPTIONS: WidgetColor[] = ['blue', 'green', 'orange', 'purple', 'red', 'yellow', 'pink', 'cyan'];

const TYPE_OPTIONS: { value: WidgetType; labelEn: string; labelRo: string }[] = [
  { value: 'counter', labelEn: 'Counter', labelRo: 'Numărător' },
  { value: 'tracker', labelEn: 'Tracker', labelRo: 'Tracker' },
  { value: 'goal', labelEn: 'Goal Progress', labelRo: 'Progres Obiectiv' },
  { value: 'checklist', labelEn: 'Checklist', labelRo: 'Lista de verificare' },
  { value: 'notes', labelEn: 'Notes', labelRo: 'Notițe' },
];

export function AIWidgetBuilder({ onCreateWidget, onCancel }: AIWidgetBuilderProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'describe' | 'preview' | 'customize'>('describe');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<WidgetConfig | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [widgetDescription, setWidgetDescription] = useState('');

  // Manual customization
  const [selectedType, setSelectedType] = useState<WidgetType>('counter');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState<WidgetColor>('blue');
  const [goal, setGoal] = useState<number | undefined>();
  const [unit, setUnit] = useState('');

  const generateWidgetWithAI = async () => {
    if (!description.trim()) {
      toast.error(language === 'en' ? 'Please describe your widget' : 'Te rog descrie widget-ul');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-widget-config', {
        body: { description, language },
      });

      if (error) throw error;

      if (data?.config) {
        setGeneratedConfig(data.config);
        setWidgetName(data.name || (language === 'en' ? 'My Widget' : 'Widget-ul Meu'));
        setWidgetDescription(data.description || '');
        setStep('preview');
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error generating widget:', error);
      toast.error(language === 'en' ? 'Failed to generate widget. Try manual creation.' : 'Eroare la generare. Încearcă crearea manuală.');
      // Fallback to manual
      setStep('customize');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildManualConfig = (): WidgetConfig => ({
    type: selectedType,
    layout: 'vertical',
    visualization: selectedType === 'counter' ? 'number' : 'progress_bar',
    color: selectedColor,
    icon: selectedIcon,
    fields: [
      {
        name: selectedType === 'tracker' ? 'completed' : 'value',
        type: selectedType === 'tracker' ? 'boolean' : 'number',
        label: widgetName || 'Value',
      }
    ],
    goal,
    unit,
  });

  const handleCreate = async () => {
    const config = generatedConfig || buildManualConfig();
    const name = widgetName || (language === 'en' ? 'My Widget' : 'Widget-ul Meu');
    
    await onCreateWidget(name, config, widgetDescription);
  };

  const previewWidget = {
    id: 'preview',
    user_id: '',
    name: widgetName || (language === 'en' ? 'My Widget' : 'Widget-ul Meu'),
    description: widgetDescription,
    config: generatedConfig || buildManualConfig(),
    is_template: false,
    is_public: false,
    is_active: true,
    order_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {language === 'en' ? 'Create Widget with AI' : 'Creează Widget cu AI'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'describe' && (
          <>
            <div>
              <Label>{language === 'en' ? 'Describe what you want to track' : 'Descrie ce vrei să urmărești'}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'en' 
                  ? 'Example: I want to track how many pages I read daily with a goal of 30 pages'
                  : 'Exemplu: Vreau să urmăresc câte pagini citesc zilnic cu un obiectiv de 30 pagini'}
                className="mt-2 h-32"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={generateWidgetWithAI} disabled={isGenerating} className="flex-1">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Generating...' : 'Se generează...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Generate with AI' : 'Generează cu AI'}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setStep('customize')}>
                {language === 'en' ? 'Create Manually' : 'Creează Manual'}
              </Button>
            </div>
          </>
        )}

        {step === 'preview' && generatedConfig && (
          <>
            <div>
              <Label>{language === 'en' ? 'Widget Name' : 'Nume Widget'}</Label>
              <Input
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{language === 'en' ? 'Preview' : 'Previzualizare'}</Label>
              <div className="mt-2">
                <CustomWidgetRenderer
                  widget={previewWidget}
                  data={null}
                  onSaveData={() => {}}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">
                {language === 'en' ? 'Create Widget' : 'Creează Widget'}
              </Button>
              <Button variant="outline" onClick={() => setStep('customize')}>
                {language === 'en' ? 'Customize' : 'Personalizează'}
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
            </div>
          </>
        )}

        {step === 'customize' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Widget Name' : 'Nume Widget'}</Label>
                <Input
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder={language === 'en' ? 'My Widget' : 'Widget-ul Meu'}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Type' : 'Tip'}</Label>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as WidgetType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {language === 'en' ? type.labelEn : type.labelRo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{language === 'en' ? 'Description (optional)' : 'Descriere (opțional)'}</Label>
              <Input
                value={widgetDescription}
                onChange={(e) => setWidgetDescription(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Icon' : 'Iconiță'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ICON_OPTIONS.map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={selectedIcon === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedIcon(value)}
                      className="p-2"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{language === 'en' ? 'Color' : 'Culoare'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLOR_OPTIONS.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 p-0 bg-${color}-500/30`}
                      style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {(selectedType === 'counter' || selectedType === 'goal') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Goal (optional)' : 'Obiectiv (opțional)'}</Label>
                  <Input
                    type="number"
                    value={goal || ''}
                    onChange={(e) => setGoal(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Unit (optional)' : 'Unitate (opțional)'}</Label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder={language === 'en' ? 'pages, km, etc.' : 'pagini, km, etc.'}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>{language === 'en' ? 'Preview' : 'Previzualizare'}</Label>
              <div className="mt-2">
                <CustomWidgetRenderer
                  widget={previewWidget}
                  data={null}
                  onSaveData={() => {}}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">
                {language === 'en' ? 'Create Widget' : 'Creează Widget'}
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
