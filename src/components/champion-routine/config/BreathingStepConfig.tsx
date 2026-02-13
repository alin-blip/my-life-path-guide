import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Wind, Loader2, Upload, Trash2, Music } from 'lucide-react';
import { useStepConfig, BreathingStepConfig } from '@/hooks/useStepConfig';
import { useBreathingMusic } from '@/hooks/useBreathingMusic';
import { StepConfigDialog } from './StepConfigDialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BreathingStepConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TECHNIQUE_OPTIONS = [
  { value: 'box', label: 'Box Breathing (4-4-4-4)', inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
  { value: '478', label: '4-7-8 Relaxare', inhale: 4, hold: 7, exhale: 8, holdAfter: 0 },
  { value: 'wim_hof', label: 'Wim Hof', inhale: 2, hold: 0, exhale: 2, holdAfter: 0 },
  { value: 'custom', label: 'Personalizat', inhale: 4, hold: 4, exhale: 4, holdAfter: 0 },
];

export function BreathingStepConfigComponent({ open, onOpenChange }: BreathingStepConfigProps) {
  const { config, updateConfig } = useStepConfig<BreathingStepConfig>('breathing');
  const { music, loading: musicLoading, uploadMusic, deleteMusic } = useBreathingMusic();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localConfig, setLocalConfig] = useState<BreathingStepConfig>({
    technique: 'box',
    cycles: 5,
    inhaleDuration: 4,
    holdDuration: 4,
    exhaleDuration: 4,
    holdAfterExhale: 4,
    durationMode: 'cycles',
    selectedMusicId: '',
    showGuide: true,
  });

  useEffect(() => {
    if (open) {
      setLocalConfig({
        technique: config.technique || 'box',
        cycles: config.cycles || 5,
        inhaleDuration: config.inhaleDuration ?? 4,
        holdDuration: config.holdDuration ?? 4,
        exhaleDuration: config.exhaleDuration ?? 4,
        holdAfterExhale: config.holdAfterExhale ?? 0,
        durationMode: config.durationMode || 'cycles',
        selectedMusicId: config.selectedMusicId || '',
        showGuide: config.showGuide !== false,
      });
    }
  }, [open, config]);

  // When technique changes, update phase durations from preset
  const handleTechniqueChange = (value: BreathingStepConfig['technique']) => {
    const preset = TECHNIQUE_OPTIONS.find(o => o.value === value);
    if (preset && value !== 'custom') {
      setLocalConfig(prev => ({
        ...prev,
        technique: value,
        inhaleDuration: preset.inhale,
        holdDuration: preset.hold,
        exhaleDuration: preset.exhale,
        holdAfterExhale: preset.holdAfter,
      }));
    } else {
      setLocalConfig(prev => ({ ...prev, technique: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadMusic(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localConfig);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMusic = music.find(m => m.id === localConfig.selectedMusicId);

  return (
    <StepConfigDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurare Respirație"
      description="Personalizează exercițiul de respirație din rutină"
    >
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/10">
          <Wind className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-medium">Respirație</span>
        </div>

        {/* Technique selector */}
        <div className="space-y-2">
          <Label>Tehnică de respirație</Label>
          <Select
            value={localConfig.technique}
            onValueChange={(v) => handleTechniqueChange(v as BreathingStepConfig['technique'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TECHNIQUE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom phase durations */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30">
          <Label className="text-sm font-semibold">Ritm respirație (secunde)</Label>
          {[
            { key: 'inhaleDuration' as const, label: 'Inspiră' },
            { key: 'holdDuration' as const, label: 'Ține (0 = fără)' },
            { key: 'exhaleDuration' as const, label: 'Expiră' },
            { key: 'holdAfterExhale' as const, label: 'Pauză după expirare (0 = fără)' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-medium text-primary">{localConfig[key] ?? 0}s</span>
              </div>
              <Slider
                value={[localConfig[key] ?? 0]}
                onValueChange={([v]) => {
                  setLocalConfig(prev => ({ ...prev, [key]: v, technique: 'custom' }));
                }}
                min={0}
                max={10}
                step={1}
                className="w-full"
                disabled={localConfig.technique !== 'custom'}
              />
            </div>
          ))}
          {localConfig.technique !== 'custom' && (
            <p className="text-xs text-muted-foreground">Selectează „Personalizat" pentru a modifica fazele manual.</p>
          )}
        </div>

        {/* Duration mode */}
        <div className="space-y-3">
          <Label>Durata exercițiului</Label>
          <RadioGroup
            value={localConfig.durationMode || 'cycles'}
            onValueChange={(v) => setLocalConfig(prev => ({ ...prev, durationMode: v as 'cycles' | 'music' }))}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cycles" id="mode-cycles" />
              <Label htmlFor="mode-cycles" className="text-sm cursor-pointer">Număr de cicluri</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="music" id="mode-music" />
              <Label htmlFor="mode-music" className="text-sm cursor-pointer">Cât durează melodia</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Cycles slider */}
        {localConfig.durationMode !== 'music' && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Număr de cicluri</Label>
              <span className="text-sm font-medium text-primary">{localConfig.cycles} cicluri</span>
            </div>
            <Slider
              value={[localConfig.cycles || 5]}
              onValueChange={([value]) => setLocalConfig(prev => ({ ...prev, cycles: value }))}
              min={3}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3</span>
              <span>30</span>
            </div>
          </div>
        )}

        {/* Music section */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Melodie de fundal</Label>
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-m4a"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? 'Se încarcă...' : 'Adaugă melodie (max 20MB)'}
          </Button>

          {/* Music list */}
          {musicLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : music.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Nicio melodie adăugată</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {music.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-all ${
                    localConfig.selectedMusicId === item.id
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => setLocalConfig(prev => ({ ...prev, selectedMusicId: item.id }))}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-xs">{item.title}</p>
                    {item.duration_seconds && (
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(item.duration_seconds / 60)}:{String(item.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMusic(item.id, item.file_path);
                      if (localConfig.selectedMusicId === item.id) {
                        setLocalConfig(prev => ({ ...prev, selectedMusicId: '' }));
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {localConfig.durationMode === 'music' && !localConfig.selectedMusicId && (
            <p className="text-xs text-yellow-500">⚠ Selectează o melodie pentru modul „durată melodie"</p>
          )}
          {localConfig.durationMode === 'music' && selectedMusic?.duration_seconds && (
            <p className="text-xs text-muted-foreground">
              Exercițiul va dura ~{Math.floor(selectedMusic.duration_seconds / 60)} min {selectedMusic.duration_seconds % 60}s
            </p>
          )}
        </div>

        {/* Visual guide toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Ghid vizual</Label>
            <p className="text-xs text-muted-foreground">Arată instrucțiuni și animații</p>
          </div>
          <Switch
            checked={localConfig.showGuide}
            onCheckedChange={(checked) => setLocalConfig(prev => ({ ...prev, showGuide: checked }))}
          />
        </div>

        {/* Save buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvează'}
          </Button>
        </div>
      </div>
    </StepConfigDialog>
  );
}
