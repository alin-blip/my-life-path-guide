import React from 'react';
import { cn } from '@/lib/utils';

export type MindCoachEmotion = 
  | 'happy' 
  | 'sad' 
  | 'anxious' 
  | 'angry' 
  | 'calm' 
  | 'stressed'
  | 'enthusiastic' 
  | 'natural' 
  | 'stuck' 
  | 'procrastinating'
  | 'overwhelmed' 
  | 'motivated' 
  | 'distracted' 
  | 'conflicted';

export type CoachingCluster = 
  | 'stuck_procrastination' 
  | 'fear_doubt' 
  | 'overwhelm_burnout' 
  | 'frustration_uncertainty' 
  | 'distraction_focus' 
  | 'positive';

interface EmotionOption {
  id: MindCoachEmotion;
  emoji: string;
  labelRo: string;
  labelEn: string;
  category: 'negative' | 'positive';
  cluster: CoachingCluster;
  transformationGoal: string;
}

export const MIND_COACH_EMOTIONS: EmotionOption[] = [
  // ========== NEGATIVE EMOTIONS - Need Transformation ==========
  
  // Stuck & Procrastination Cluster
  { 
    id: 'stuck', 
    emoji: '🧱', 
    labelRo: 'Blocat', 
    labelEn: 'Stuck', 
    category: 'negative', 
    cluster: 'stuck_procrastination',
    transformationGoal: 'momentum și claritate' 
  },
  { 
    id: 'procrastinating', 
    emoji: '😴', 
    labelRo: 'Amân', 
    labelEn: 'Procrastinating', 
    category: 'negative', 
    cluster: 'stuck_procrastination',
    transformationGoal: 'acțiune imediată' 
  },
  
  // Fear & Doubt Cluster
  { 
    id: 'anxious', 
    emoji: '😰', 
    labelRo: 'Anxios', 
    labelEn: 'Anxious', 
    category: 'negative', 
    cluster: 'fear_doubt',
    transformationGoal: 'curaj și încredere' 
  },
  { 
    id: 'sad', 
    emoji: '😢', 
    labelRo: 'Trist', 
    labelEn: 'Sad', 
    category: 'negative', 
    cluster: 'fear_doubt',
    transformationGoal: 'recunoștință și speranță' 
  },
  
  // Overwhelm & Burnout Cluster
  { 
    id: 'stressed', 
    emoji: '😫', 
    labelRo: 'Stresat', 
    labelEn: 'Stressed', 
    category: 'negative', 
    cluster: 'overwhelm_burnout',
    transformationGoal: 'calm și control' 
  },
  { 
    id: 'overwhelmed', 
    emoji: '🤯', 
    labelRo: 'Copleșit', 
    labelEn: 'Overwhelmed', 
    category: 'negative', 
    cluster: 'overwhelm_burnout',
    transformationGoal: 'claritate și prioritizare' 
  },
  
  // Frustration & Uncertainty Cluster
  { 
    id: 'angry', 
    emoji: '😤', 
    labelRo: 'Supărat', 
    labelEn: 'Angry', 
    category: 'negative', 
    cluster: 'frustration_uncertainty',
    transformationGoal: 'determinare constructivă' 
  },
  { 
    id: 'conflicted', 
    emoji: '😕', 
    labelRo: 'Confuz', 
    labelEn: 'Conflicted', 
    category: 'negative', 
    cluster: 'frustration_uncertainty',
    transformationGoal: 'direcție clară' 
  },
  
  // Distraction & Focus Cluster
  { 
    id: 'distracted', 
    emoji: '🤷', 
    labelRo: 'Distras', 
    labelEn: 'Distracted', 
    category: 'negative', 
    cluster: 'distraction_focus',
    transformationGoal: 'focus și productivitate' 
  },
  
  // ========== POSITIVE EMOTIONS - Amplify ==========
  { 
    id: 'happy', 
    emoji: '😊', 
    labelRo: 'Fericit', 
    labelEn: 'Happy', 
    category: 'positive', 
    cluster: 'positive',
    transformationGoal: 'amplificare și ancorare' 
  },
  { 
    id: 'calm', 
    emoji: '😌', 
    labelRo: 'Calm', 
    labelEn: 'Calm', 
    category: 'positive', 
    cluster: 'positive',
    transformationGoal: 'menținere și aprofundare' 
  },
  { 
    id: 'enthusiastic', 
    emoji: '🤩', 
    labelRo: 'Entuziasmat', 
    labelEn: 'Enthusiastic', 
    category: 'positive', 
    cluster: 'positive',
    transformationGoal: 'canalizare productivă' 
  },
  { 
    id: 'natural', 
    emoji: '😐', 
    labelRo: 'Neutru', 
    labelEn: 'Natural', 
    category: 'positive', 
    cluster: 'positive',
    transformationGoal: 'activare pozitivă' 
  },
  { 
    id: 'motivated', 
    emoji: '💪', 
    labelRo: 'Motivat', 
    labelEn: 'Motivated', 
    category: 'positive', 
    cluster: 'positive',
    transformationGoal: 'transformare în acțiune' 
  },
];

export function getEmotionInfo(emotionId: MindCoachEmotion): EmotionOption | undefined {
  return MIND_COACH_EMOTIONS.find(e => e.id === emotionId);
}

export function getClusterForEmotion(emotionId: MindCoachEmotion): CoachingCluster {
  const emotion = MIND_COACH_EMOTIONS.find(e => e.id === emotionId);
  return emotion?.cluster || 'positive';
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
    <div className="space-y-6">
      {/* Negative emotions section - Need Transformation */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {language === 'ro' ? '🔄 Trebuie să transform...' : '🔄 I need to transform...'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {negativeEmotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => onSelect(emotion.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                "hover:border-primary/50 hover:bg-primary/5 hover:scale-105",
                selectedEmotion === emotion.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-105"
                  : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {language === 'ro' ? emotion.labelRo : emotion.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Positive emotions section - Amplify */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {language === 'ro' ? '✨ Mă simt bine, vreau să amplifice...' : '✨ I feel good, want to amplify...'}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {positiveEmotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => onSelect(emotion.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                "hover:border-green-500/50 hover:bg-green-500/5 hover:scale-105",
                selectedEmotion === emotion.id
                  ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/20 scale-105"
                  : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {language === 'ro' ? emotion.labelRo : emotion.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
