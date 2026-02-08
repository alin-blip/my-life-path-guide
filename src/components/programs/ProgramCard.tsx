import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Play, Star, Flame, Crown } from 'lucide-react';

export interface ProgramCardProps {
  id: string;
  title: string;
  titleRo?: string;
  description: string;
  descriptionRo?: string;
  thumbnail: string;
  path: string;
  isFree?: boolean;
  isPremium?: boolean;
  badge?: 'FREE' | 'PREMIUM' | 'NEW' | 'LIVE';
  progress?: number; // 0-100
  totalLessons?: number;
  completedLessons?: number;
  isLocked?: boolean;
  price?: string;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  id,
  title,
  titleRo,
  description,
  descriptionRo,
  thumbnail,
  path,
  isFree,
  isPremium,
  badge,
  progress = 0,
  totalLessons,
  completedLessons,
  isLocked,
  price,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRo = language === 'ro';

  const displayTitle = isRo && titleRo ? titleRo : title;
  const displayDescription = isRo && descriptionRo ? descriptionRo : description;

  const handleClick = () => {
    navigate(path);
  };

  const getBadgeStyles = () => {
    switch (badge) {
      case 'FREE':
        return 'bg-emerald-500/90 text-white border-emerald-400';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400';
      case 'NEW':
        return 'bg-primary text-primary-foreground border-primary';
      case 'LIVE':
        return 'bg-red-500 text-white border-red-400 animate-pulse';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getBadgeIcon = () => {
    switch (badge) {
      case 'FREE':
        return <Flame className="h-3 w-3" />;
      case 'PREMIUM':
        return <Crown className="h-3 w-3" />;
      case 'NEW':
        return <Star className="h-3 w-3" />;
      case 'LIVE':
        return <Play className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card
      variant="elevated"
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-border/50"
    >
      {/* Thumbnail with overlay */}
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img
            src={thumbnail}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              {isLocked ? (
                <Lock className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Play className="h-6 w-6 text-primary-foreground ml-1" />
              )}
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3 z-20">
              <Badge className={`${getBadgeStyles()} flex items-center gap-1 px-2.5 py-1 text-xs font-bold`}>
                {getBadgeIcon()}
                {badge}
              </Badge>
            </div>
          )}

          {/* Price tag for premium */}
          {isPremium && price && (
            <div className="absolute top-3 right-3 z-20">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground font-bold px-2.5 py-1">
                {price}
              </Badge>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {displayDescription}
          </p>
        </div>

        {/* Progress bar */}
        {progress > 0 || (completedLessons !== undefined && totalLessons !== undefined) ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {isRo ? 'Progres' : 'Progress'}
              </span>
              <span className="font-medium text-foreground">
                {completedLessons !== undefined && totalLessons !== undefined
                  ? `${completedLessons}/${totalLessons}`
                  : `${Math.round(progress)}%`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName={progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Play className="h-3.5 w-3.5" />
            <span>{isRo ? 'Începe acum' : 'Start now'}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
