import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Emotion } from '@/components/emotional/EmotionPicker';
import { 
  Sparkles, 
  ArrowRight, 
  SkipForward, 
  Clock, 
  Star,
  Brain,
  Heart,
  Flame,
  Zap,
  BookOpen,
  Target,
  Lightbulb,
  Smile,
  PenTool,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

// Stack definitions with metadata
const STACKS = {
  'anger': {
    id: 'anger',
    name: 'Emotion Coach',
    description: 'Procesează emoțiile dificile și transformă-le în energie pozitivă',
    duration: '15-20 min',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  'ai-live': {
    id: 'ai-live',
    name: 'Life Coach',
    description: 'Sesiuni interactive de coaching pentru orice provocare',
    duration: '10-30 min',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  'divine-prayer': {
    id: 'divine-prayer',
    name: 'Mindset Coach',
    description: 'Recalibrare mentală și conectare cu scopul tău',
    duration: '10-15 min',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  'divine-gratitude': {
    id: 'divine-gratitude',
    name: 'Divine Gratitude',
    description: 'Recunoștință profundă pentru abundența din viața ta',
    duration: '10-15 min',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  },
  'introspection': {
    id: 'introspection',
    name: 'Introspection',
    description: 'Auto-reflecție și descoperire interioară',
    duration: '15-20 min',
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  'daily-master': {
    id: 'daily-master',
    name: 'Daily Planner',
    description: 'Planifică-ți ziua pentru productivitate maximă',
    duration: '10-15 min',
    icon: List,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  'hormozi-coaching': {
    id: 'hormozi-coaching',
    name: 'Business Coach',
    description: 'Strategii de business de la Alex Hormozi',
    duration: '15-25 min',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  'napoleon-hill': {
    id: 'napoleon-hill',
    name: 'Success Principles',
    description: 'Principiile succesului de la Napoleon Hill',
    duration: '20-30 min',
    icon: BookOpen,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  'gratitude': {
    id: 'gratitude',
    name: 'Gratitude Journal',
    description: '12 lucruri pentru care ești recunoscător',
    duration: '10-15 min',
    icon: Smile,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  'gods-school': {
    id: 'gods-school',
    name: "God's School",
    description: 'Înțelepciune spirituală și ghidare divină',
    duration: '15-20 min',
    icon: Sparkles,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  'divine': {
    id: 'divine',
    name: 'Divine Coaching',
    description: 'Conversații ghidate pentru claritate spirituală',
    duration: '15-20 min',
    icon: PenTool,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30'
  }
};

// Emotion to recommended stacks mapping
const EMOTION_STACK_RECOMMENDATIONS: Record<string, string[]> = {
  // Negative emotions
  'angry': ['anger', 'ai-live'],
  'frustrated': ['anger', 'introspection'],
  'sad': ['divine-prayer', 'divine-gratitude'],
  'anxious': ['divine-prayer', 'introspection'],
  'stressed': ['ai-live', 'introspection'],
  'overwhelmed': ['divine-prayer', 'daily-master'],
  'fearful': ['divine-prayer', 'ai-live'],
  'disappointed': ['introspection', 'divine-gratitude'],
  'lonely': ['divine-gratitude', 'gods-school'],
  'guilty': ['introspection', 'divine'],
  
  // Positive emotions - focus on productivity
  'happy': ['daily-master', 'hormozi-coaching'],
  'excited': ['hormozi-coaching', 'napoleon-hill'],
  'calm': ['gratitude', 'gods-school'],
  'grateful': ['divine-gratitude', 'napoleon-hill'],
  'confident': ['hormozi-coaching', 'daily-master'],
  'inspired': ['napoleon-hill', 'hormozi-coaching'],
  'peaceful': ['gods-school', 'gratitude'],
  'energetic': ['daily-master', 'hormozi-coaching'],
  'hopeful': ['napoleon-hill', 'divine-prayer'],
  'loved': ['divine-gratitude', 'gratitude'],
  
  // Neutral/default
  'neutral': ['daily-master', 'divine-prayer'],
};

interface StackSelectionStepProps {
  emotion: Emotion | null;
  intensity: number;
  onSelectStack: (stackId: string) => void;
  onSkip: () => void;
}

export const StackSelectionStep: React.FC<StackSelectionStepProps> = ({
  emotion,
  intensity,
  onSelectStack,
  onSkip
}) => {
  const { theme } = useTheme();
  const [showAllStacks, setShowAllStacks] = useState(false);

  // Get recommended stacks based on emotion
  const recommendedStackIds = useMemo(() => {
    const emotionKey = emotion || 'neutral';
    return EMOTION_STACK_RECOMMENDATIONS[emotionKey] || EMOTION_STACK_RECOMMENDATIONS['neutral'];
  }, [emotion]);

  const recommendedStacks = useMemo(() => {
    return recommendedStackIds
      .map(id => STACKS[id as keyof typeof STACKS])
      .filter(Boolean);
  }, [recommendedStackIds]);

  const allStacks = Object.values(STACKS);

  const getEmotionEmoji = (emotion: Emotion | null): string => {
    const emojiMap: Record<string, string> = {
      'angry': '😤', 'frustrated': '😣', 'sad': '😢', 'anxious': '😰',
      'stressed': '😫', 'overwhelmed': '🤯', 'fearful': '😨', 'disappointed': '😞',
      'lonely': '😔', 'guilty': '😓', 'happy': '😊', 'excited': '🤩',
      'calm': '😌', 'grateful': '🙏', 'confident': '😎', 'inspired': '✨',
      'peaceful': '😇', 'energetic': '⚡', 'hopeful': '🌟', 'loved': '🥰',
      'neutral': '😐'
    };
    return emojiMap[emotion || 'neutral'] || '🧘';
  };

  const renderStackCard = (stack: typeof STACKS[keyof typeof STACKS], isRecommended: boolean) => {
    const Icon = stack.icon;
    
    return (
      <motion.div
        key={stack.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={cn(
            "p-4 cursor-pointer transition-all duration-200 border-2",
            "hover:shadow-lg",
            stack.borderColor,
            theme === 'dark' ? 'bg-black/30' : 'bg-white/80'
          )}
          onClick={() => onSelectStack(stack.id)}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              stack.bgColor
            )}>
              <Icon className={cn("w-6 h-6", stack.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-foreground'
                )}>
                  {stack.name}
                </h3>
                {isRecommended && (
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Recomandat
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "text-sm mb-2 line-clamp-2",
                theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'
              )}>
                {stack.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  theme === 'dark' ? 'text-white/50' : 'text-muted-foreground'
                )}>
                  <Clock className="w-3 h-3" />
                  {stack.duration}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-7 px-2 text-xs",
                    stack.color
                  )}
                >
                  Începe
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className={cn(
        "p-6 border-2",
        theme === 'dark' 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/90 border-border'
      )}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className={cn(
              "w-6 h-6",
              theme === 'dark' ? 'text-primary' : 'text-primary'
            )} />
            <h2 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-foreground'
            )}>
              Alege un Stack pentru dimineața ta
            </h2>
          </div>
          
          <p className={cn(
            "text-sm",
            theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'
          )}>
            {emotion ? (
              <>
                Bazat pe starea ta de {getEmotionEmoji(emotion)} <strong className="capitalize">{emotion}</strong>
                {intensity >= 7 && ' (intensitate ridicată)'}
              </>
            ) : (
              'Alege un stack care te ajută să începi ziua cu energie'
            )}
          </p>
        </div>

        {/* Recommended Stacks */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className={cn(
              "w-4 h-4",
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
            )} />
            <span className={cn(
              "text-sm font-medium",
              theme === 'dark' ? 'text-white/80' : 'text-foreground'
            )}>
              Recomandate pentru tine
            </span>
          </div>
          
          {recommendedStacks.map(stack => renderStackCard(stack, true))}
        </div>

        {/* Show all stacks toggle */}
        <AnimatePresence>
          {showAllStacks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-4"
            >
              <div className="flex items-center gap-2 mb-2 pt-4 border-t border-border/50">
                <List className={cn(
                  "w-4 h-4",
                  theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  theme === 'dark' ? 'text-white/80' : 'text-foreground'
                )}>
                  Toate Stack-urile
                </span>
              </div>
              
              {allStacks
                .filter(s => !recommendedStackIds.includes(s.id))
                .map(stack => renderStackCard(stack, false))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllStacks(!showAllStacks)}
            className={cn(
              theme === 'dark' ? 'text-white/60 hover:text-white' : ''
            )}
          >
            {showAllStacks ? 'Ascunde toate' : 'Vezi toate stack-urile'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className={cn(
              "gap-1",
              theme === 'dark' 
                ? 'border-white/20 text-white/70 hover:text-white hover:bg-white/10' 
                : ''
            )}
          >
            <SkipForward className="w-4 h-4" />
            Sari pasul
          </Button>
        </div>
      </Card>
    </div>
  );
};
