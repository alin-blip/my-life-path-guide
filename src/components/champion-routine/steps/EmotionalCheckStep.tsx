import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EmotionPicker, Emotion, getEmotionInfo } from '@/components/emotional/EmotionPicker';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface EmotionalCheckStepProps {
  emotion: Emotion | null;
  intensity: number;
  onEmotionChange: (emotion: Emotion) => void;
  onIntensityChange: (intensity: number) => void;
  onNext: () => void;
  onStartTransform: () => void;
}

const POSITIVE_EMOTIONS: Emotion[] = ['happy', 'calm', 'excited'];
const NEGATIVE_EMOTIONS: Emotion[] = ['angry', 'sad', 'anxious', 'stressed'];

export function EmotionalCheckStep({
  emotion,
  intensity,
  onEmotionChange,
  onIntensityChange,
  onNext,
  onStartTransform
}: EmotionalCheckStepProps) {
  const needsTransformation = emotion && (NEGATIVE_EMOTIONS.includes(emotion) || intensity < 4);
  const emotionInfo = emotion ? getEmotionInfo(emotion) : null;

  const canProceed = emotion !== null;

  const handleContinue = () => {
    if (needsTransformation) {
      onStartTransform();
    } else {
      onNext();
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-2xl">🌅</span>
          Cum te simți în această dimineață?
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Onestitatea cu tine însuți este primul pas spre o zi extraordinară
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotion Picker */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Selectează emoția dominantă
          </label>
          <EmotionPicker
            value={emotion}
            onChange={onEmotionChange}
            language="ro"
          />
        </div>

        {/* Intensity Slider */}
        {emotion && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground">
                Intensitate
              </label>
              <span className="text-lg font-bold text-primary">{intensity}/10</span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={(values) => onIntensityChange(values[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slabă</span>
              <span>Moderată</span>
              <span>Foarte intensă</span>
            </div>
          </div>
        )}

        {/* Feedback based on selection */}
        {emotion && (
          <div className={`p-4 rounded-xl border-2 ${
            needsTransformation 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            {needsTransformation ? (
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    Hai să transformăm această stare în putere!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Te voi ghida printr-un proces scurt de transformare emoțională care îți va da claritate și energie pentru restul zilei.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Minunat! Ești într-o stare excelentă! {emotionInfo?.emoji}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cum vei folosi această energie pentru a crea o zi extraordinară?
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          className="w-full gap-2"
          size="lg"
        >
          {needsTransformation ? (
            <>
              <Zap className="h-4 w-4" />
              Începe Transformarea
            </>
          ) : (
            <>
              Continuă la Recunoștință
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
