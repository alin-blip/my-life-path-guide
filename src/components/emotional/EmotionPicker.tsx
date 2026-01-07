import { cn } from '@/lib/utils';

export type Emotion = 'happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'stressed' | 'excited' | 'neutral';

interface EmotionOption {
  value: Emotion;
  emoji: string;
  label: string;
  labelRo: string;
  color: string;
}

export const EMOTIONS: EmotionOption[] = [
  { value: 'happy', emoji: '😊', label: 'Happy', labelRo: 'Fericit', color: 'bg-yellow-500/20 border-yellow-500' },
  { value: 'sad', emoji: '😢', label: 'Sad', labelRo: 'Trist', color: 'bg-blue-500/20 border-blue-500' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', labelRo: 'Anxios', color: 'bg-purple-500/20 border-purple-500' },
  { value: 'angry', emoji: '😠', label: 'Angry', labelRo: 'Supărat', color: 'bg-red-500/20 border-red-500' },
  { value: 'calm', emoji: '😌', label: 'Calm', labelRo: 'Calm', color: 'bg-green-500/20 border-green-500' },
  { value: 'stressed', emoji: '😫', label: 'Stressed', labelRo: 'Stresat', color: 'bg-orange-500/20 border-orange-500' },
  { value: 'excited', emoji: '🤩', label: 'Excited', labelRo: 'Entuziasmat', color: 'bg-pink-500/20 border-pink-500' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', labelRo: 'Neutru', color: 'bg-gray-500/20 border-gray-500' },
];

interface EmotionPickerProps {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
  language?: 'en' | 'ro';
}

export function EmotionPicker({ value, onChange, language = 'ro' }: EmotionPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EMOTIONS.map((emotion) => (
        <button
          key={emotion.value}
          type="button"
          onClick={() => onChange(emotion.value)}
          className={cn(
            'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200',
            'hover:scale-105 hover:shadow-md',
            value === emotion.value
              ? `${emotion.color} border-2`
              : 'bg-card border-border hover:border-primary/50'
          )}
        >
          <span className="text-2xl">{emotion.emoji}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {language === 'ro' ? emotion.labelRo : emotion.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function getEmotionInfo(emotion: Emotion): EmotionOption | undefined {
  return EMOTIONS.find(e => e.value === emotion);
}
