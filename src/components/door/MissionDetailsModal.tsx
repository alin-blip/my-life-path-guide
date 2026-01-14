import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Target, 
  CheckCircle, 
  Dumbbell, 
  Brain, 
  Heart, 
  Briefcase,
  ArrowRight,
  Crown
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { HierarchyBadge } from './HierarchyBadge';

interface MonthlyMission {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurableResult?: string;
  progress: number;
  keyActions?: string[];
  parentMissionId?: string | null;
  parentMission?: {
    id: string;
    title: string;
    period: string;
    mission_type: string;
  } | null;
}

const CATEGORY_CONFIG = {
  body: {
    icon: Dumbbell,
    label: { en: 'Body', ro: 'Corp' },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  being: {
    icon: Brain,
    label: { en: 'Spirituality', ro: 'Spiritualitate' },
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  balance: {
    icon: Heart,
    label: { en: 'Relationships', ro: 'Relații' },
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  business: {
    icon: Briefcase,
    label: { en: 'Business', ro: 'Business' },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
};

interface MissionDetailsModalProps {
  mission: MonthlyMission | null;
  isOpen: boolean;
  onClose: () => void;
  onSetAsDomino?: (mission: MonthlyMission) => void;
  onUpdateProgress?: (missionId: string, progress: number) => void;
}

export const MissionDetailsModal: React.FC<MissionDetailsModalProps> = ({
  mission,
  isOpen,
  onClose,
  onSetAsDomino,
  onUpdateProgress
}) => {
  const { language } = useLanguage();
  
  if (!mission) return null;
  
  const config = CATEGORY_CONFIG[mission.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.body;
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
              <Icon className={cn("w-6 h-6", config.color)} />
            </div>
            <div>
              <Badge variant="secondary" className={cn(config.bgColor, config.color, "mb-1")}>
                {config.label[language === 'en' ? 'en' : 'ro']}
              </Badge>
              <DialogTitle className="text-xl">{mission.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Parent Hierarchy */}
          {mission.parentMission && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                {language === 'en' ? 'Part of:' : 'Parte din:'}
              </span>
              <HierarchyBadge 
                type={mission.parentMission.mission_type === 'quarterly' ? 'quarterly' : 'annual'} 
                title={mission.parentMission.title} 
              />
            </div>
          )}

          {/* Measurable Result */}
          {mission.measurableResult && (
            <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                {language === 'en' ? 'Measurable Result' : 'Rezultat Măsurabil'}
              </div>
              <p className="text-foreground font-medium">{mission.measurableResult}</p>
            </div>
          )}

          {/* Description */}
          {mission.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {language === 'en' ? 'Why is this important?' : 'De ce este important?'}
              </p>
              <p className="text-foreground">{mission.description}</p>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">
                {language === 'en' ? 'Progress' : 'Progres'}
              </span>
              <span className={cn("font-bold", config.color)}>{mission.progress}%</span>
            </div>
            {onUpdateProgress ? (
              <Slider
                value={[mission.progress]}
                onValueChange={([val]) => onUpdateProgress(mission.id, val)}
                max={100}
                step={5}
              />
            ) : (
              <Progress value={mission.progress} className="h-2" />
            )}
          </div>

          {/* Key Actions */}
          {mission.keyActions && mission.keyActions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {language === 'en' ? 'Key Actions' : 'Acțiuni Cheie'} ({mission.keyActions.length})
              </p>
              <div className="space-y-2">
                {mission.keyActions.map((action, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      "bg-background",
                      config.color
                    )}>
                      {idx + 1}
                    </div>
                    <span className="text-foreground flex-1">{action}</span>
                    <CheckCircle className={cn("w-4 h-4", config.color, "opacity-50")} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {language === 'en' ? 'Close' : 'Închide'}
          </Button>
          {onSetAsDomino && (
            <Button onClick={() => onSetAsDomino(mission)} className="gap-2">
              <Target className="w-4 h-4" />
              {language === 'en' ? 'Set as Weekly Domino' : 'Setează ca Domino'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
