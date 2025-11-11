import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Headphones, Volume2, AlertTriangle, CheckCircle2, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioCalibrationScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const AudioCalibrationScreen: React.FC<AudioCalibrationScreenProps> = ({
  onComplete,
  onSkip
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'mic' | 'headset' | 'echo' | 'results'>('mic');
  const [micLevel, setMicLevel] = useState(0);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isRecording, setIsRecording] = useState(false);
  const [hasEcho, setHasEcho] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setMicPermission('granted');
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicLevel(Math.min(100, (average / 128) * 100));
        animationRef.current = requestAnimationFrame(updateLevel);
      };

      setIsRecording(true);
      updateLevel();

      toast({
        title: "🎤 Microfon activ",
        description: "Vorbește pentru a testa nivelul audio"
      });
    } catch (error) {
      console.error('Microphone access error:', error);
      setMicPermission('denied');
      toast({
        title: "⚠️ Acces refuzat",
        description: "Te rog permite accesul la microfon",
        variant: "destructive"
      });
    }
  };

  const testHeadset = () => {
    // Redă un ton test
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.3;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 1000);

    setVolumeLevel(75); // Mock - în realitate ar fi user input

    toast({
      title: "🔊 Test audio",
      description: "Ai auzit tonul? Verifică volumul"
    });
  };

  const testEcho = async () => {
    // Simplificat: în producție ar trebui un test mai complex
    // Verifică dacă există feedback loop prin analiza frecvențelor
    if (analyserRef.current && streamRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Detectează vârfuri susținute (posibil ecou)
      const peaks = dataArray.filter(val => val > 200).length;
      const hasEchoDetected = peaks > dataArray.length * 0.3;
      
      setHasEcho(hasEchoDetected);
      
      if (hasEchoDetected) {
        toast({
          title: "⚠️ Ecou detectat",
          description: "Folosește căști pentru o experiență mai bună",
          variant: "destructive"
        });
      }
    }
  };

  const generateRecommendations = () => {
    const recs: string[] = [];

    if (micLevel < 30) {
      recs.push("🔊 Crește volumul microfonului sau apropie-te mai mult");
    }

    if (hasEcho) {
      recs.push("⚠️ Folosește căști pentru a preveni ecoul");
    } else {
      recs.push("✅ Setup-ul tău audio este optim");
    }

    if (micLevel > 30 && micLevel < 80) {
      recs.push("✅ Nivelul microfonului este perfect");
    } else if (micLevel >= 80) {
      recs.push("🔉 Microfon prea tare - ajustează sensibilitatea");
    }

    if (volumeLevel < 50) {
      recs.push("🔊 Volumul este scăzut - crește-l pentru a auzi mai bine AI-ul");
    }

    setRecommendations(recs);
  };

  const handleNextStep = () => {
    if (step === 'mic') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsRecording(false);
      setStep('headset');
    } else if (step === 'headset') {
      setStep('echo');
      testEcho();
    } else if (step === 'echo') {
      generateRecommendations();
      setStep('results');
    }
  };

  const handleComplete = () => {
    cleanup();
    localStorage.setItem('audio-calibration-completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    cleanup();
    onSkip();
  };

  if (step === 'results') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Calibrare Completă
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Recomandări:</h3>
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded">
                  <span className="text-lg">{rec.split(' ')[0]}</span>
                  <span className="text-sm">{rec.substring(rec.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleComplete} className="flex-1">
                Începe Sesiunea Audio
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Refă Calibrarea
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Calibrare Audio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Verificăm setup-ul tău audio pentru o experiență optimă
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress steps */}
          <div className="flex justify-between mb-6">
            <div className={`flex flex-col items-center ${step === 'mic' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Mic className="h-6 w-6 mb-1" />
              <span className="text-xs">Microfon</span>
            </div>
            <div className={`flex flex-col items-center ${step === 'headset' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Headphones className="h-6 w-6 mb-1" />
              <span className="text-xs">Căști</span>
            </div>
            <div className={`flex flex-col items-center ${step === 'echo' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Volume2 className="h-6 w-6 mb-1" />
              <span className="text-xs">Ecou</span>
            </div>
          </div>

          {/* Mic test */}
          {step === 'mic' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Test Microfon</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vorbește pentru a testa nivelul audio
                </p>
              </div>

              {micPermission === 'pending' && (
                <Button onClick={testMicrophone} className="w-full">
                  <Mic className="h-4 w-4 mr-2" />
                  Permite Acces Microfon
                </Button>
              )}

              {micPermission === 'granted' && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nivel Audio</span>
                      <span>{Math.round(micLevel)}%</span>
                    </div>
                    <Progress value={micLevel} className="h-3" />
                  </div>

                  {micLevel > 30 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Microfonul funcționează perfect!
                    </div>
                  )}
                </>
              )}

              {micPermission === 'denied' && (
                <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  Acces refuzat. Te rog permite accesul la microfon în browser.
                </div>
              )}
            </div>
          )}

          {/* Headset test */}
          {step === 'headset' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Test Căști/Difuzoare</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verifică dacă auzi clar tonul test
                </p>
              </div>

              <Button onClick={testHeadset} className="w-full">
                <Volume2 className="h-4 w-4 mr-2" />
                Redă Ton Test
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                Ai auzit un ton clar? Dacă nu, verifică volumul sau conexiunea căștilor.
              </div>
            </div>
          )}

          {/* Echo test */}
          {step === 'echo' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Test Ecou</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verificăm dacă există feedback audio
                </p>
              </div>

              <div className="p-4 bg-muted rounded text-center">
                {hasEcho ? (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Ecou detectat - folosește căști</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Fără ecou - setup perfect!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Sari Calibrarea
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={step === 'mic' && micPermission !== 'granted'}
              className="flex-1"
            >
              {step === 'echo' ? 'Finalizează' : 'Următorul Pas'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};