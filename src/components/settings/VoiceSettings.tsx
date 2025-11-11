import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const AVAILABLE_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam - Deep Male' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria - Friendly Female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger - Calm Male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Professional Female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura - Warm Female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie - Energetic Male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George - British Male' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum - Young Male' },
];

export const VoiceSettings: React.FC = () => {
  const { toast } = useToast();
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem('preferred-tts-voice') || 'pNInz6obpgDQGcFmaJgB'
  );

  const { speak, isSpeaking } = useTextToSpeech({
    voiceId: selectedVoice,
    autoPlay: true
  });

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('preferred-tts-voice', voiceId);
    toast({
      title: '✅ Voice updated',
      description: 'Your preferred AI voice has been saved.',
    });
  };

  const handleTestVoice = () => {
    speak('Hello! This is how I sound. I will guide you through your Stack sessions.');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AI Voice Settings
        </CardTitle>
        <CardDescription>
          Choose your preferred AI voice for audio mode in Stack sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice-select">Select Voice</Label>
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Choose a voice" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleTestVoice}
          disabled={isSpeaking}
          className="w-full"
          variant="outline"
        >
          {isSpeaking ? (
            <>
              <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
              Playing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test Voice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
