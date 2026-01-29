import React from 'react';
import { cn } from '@/lib/utils';

export type MindCoachEmotion = 
  | 'angry' 
  | 'sad' 
  | 'anxious' 
  | 'stressed' 
  | 'overwhelmed' 
  | 'procrastinating' 
  | 'not_good_enough'
  | 'happy' 
  | 'calm' 
  | 'excited'
  | 'frustrated'
  | 'confused';

interface EmotionOption {
  id: MindCoachEmotion;
  emoji: string;
  labelRo: string;
  labelEn: string;
  category: 'negative' | 'positive';
  transformationGoal: string;
}

export const MIND_COACH_EMOTIONS: EmotionOption[] = [
  // Negative emotions (need transformation)
  { id: 'angry', emoji: '😤', labelRo: 'Supărat', labelEn: 'Angry', category: 'negative', transformationGoal: 'determinare' },
  { id: 'sad', emoji: '😢', labelRo: 'Trist', labelEn: 'Sad', category: 'negative', transformationGoal: 'recunoștință' },
  { id: 'anxious', emoji: '😰', labelRo: 'Anxios', labelEn: 'Anxious', category: 'negative', transformationGoal: 'entuziasm' },
  { id: 'stressed', emoji: '😫', labelRo: 'Stresat', labelEn: 'Stressed', category: 'negative', transformationGoal: 'calm focalizat' },
  { id: 'overwhelmed', emoji: '🤯', labelRo: 'Copleșit', labelEn: 'Overwhelmed', category: 'negative', transformationGoal: 'claritate' },
  { id: 'procrastinating', emoji: '😴', labelRo: 'Amân', labelEn: 'Procrastinating', category: 'negative', transformationGoal: 'momentum' },
  { id: 'not_good_enough', emoji: '😔', labelRo: 'Nu sunt destul', labelEn: 'Not Good Enough', category: 'negative', transformationGoal: 'încredere' },
  { id: 'frustrated', emoji: '😤', labelRo: 'Frustrat', labelEn: 'Frustrated', category: 'negative', transformationGoal: 'răbdare' },
  { id: 'confused', emoji: '😕', labelRo: 'Confuz', labelEn: 'Confused', category: 'negative', transformationGoal: 'direcție' },
  // Positive emotions (amplify/channel)
  { id: 'happy', emoji: '😊', labelRo: 'Fericit', labelEn: 'Happy', category: 'positive', transformationGoal: 'amplificare' },
  { id: 'calm', emoji: '😌', labelRo: 'Calm', labelEn: 'Calm', category: 'positive', transformationGoal: 'menținere' },
  { id: 'excited', emoji: '🤩', labelRo: 'Entuziasmat', labelEn: 'Excited', category: 'positive', transformationGoal: 'canalizare' },
];

export function getEmotionInfo(emotionId: MindCoachEmotion): EmotionOption | undefined {
  return MIND_COACH_EMOTIONS.find(e => e.id === emotionId);
}

interface ExtendedEmotionPickerProps {
  selectedEmotion: MindCoachEmotion | null;
  onSelect: (emotion: MindCoachEmotion) => void;
  language?: 'ro' | 'en';
}

export function ExtendedEmotionPicker({ 
  selectedEmotion, 
  onSelect,
  language = 'ro'
}: ExtendedEmotionPickerProps) {
  const negativeEmotions = MIND_COACH_EMOTIONS.filter(e => e.category === 'negative');
  const positiveEmotions = MIND_COACH_EMOTIONS.filter(e => e.category === 'positive');

  return (
    <div className="space-y-4">
      {/* Negative emotions section */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          {language === 'ro' ? 'Trebuie să transform...' : 'I need to transform...'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {negativeEmotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => onSelect(emotion.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                selectedEmotion === emotion.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-xs font-medium">
                {language === 'ro' ? emotion.labelRo : emotion.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Positive emotions section */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          {language === 'ro' ? 'Mă simt bine, vreau să amplifice...' : 'I feel good, want to amplify...'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {positiveEmotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => onSelect(emotion.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                "hover:border-green-500/50 hover:bg-green-500/5",
                selectedEmotion === emotion.id
                  ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/20"
                  : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-xs font-medium">
                {language === 'ro' ? emotion.labelRo : emotion.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
