import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Bell } from 'lucide-react';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { useLanguage } from '@/context/LanguageContext';

export const SoundSettings: React.FC = () => {
  const { language } = useLanguage();
  const { muted, volume, toggleMute, setVolume, playSuccessSound } = useSoundSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {language === 'en' ? 'Sound Settings' : 'Setări Sunet'}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Configure sounds for completed activities and achievements.' 
            : 'Configurează sunetele pentru activități și realizări completate.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {muted ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary" />
            )}
            <Label htmlFor="mute-toggle" className="cursor-pointer">
              {language === 'en' ? 'Mute all sounds' : 'Dezactivează toate sunetele'}
            </Label>
          </div>
          <Switch
            id="mute-toggle"
            checked={muted}
            onCheckedChange={toggleMute}
          />
        </div>

        <div className="space-y-3">
          <Label>
            {language === 'en' ? 'Volume' : 'Volum'}: {Math.round(volume * 100)}%
          </Label>
          <Slider
            value={[volume * 100]}
            onValueChange={([val]) => setVolume(val / 100)}
            max={100}
            step={5}
            disabled={muted}
            className="w-full"
          />
        </div>

        <div className="pt-2">
          <Button 
            variant="outline" 
            onClick={playSuccessSound}
            disabled={muted}
            className="w-full"
          >
            {language === 'en' ? 'Test Sound' : 'Test Sunet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
