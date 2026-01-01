import React from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, Heart, Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'body' | 'being' | 'balance' | 'business';

const categoryIcons: Record<Category, React.ReactNode> = {
  body: <Dumbbell className="h-4 w-4" />,
  being: <Heart className="h-4 w-4" />,
  balance: <Users className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />
};

const categoryLabels: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Being', ro: 'Suflet' },
  balance: { en: 'Balance', ro: 'Echilibru' },
  business: { en: 'Business', ro: 'Business' }
};

const categoryColors: Record<Category, string> = {
  body: 'from-blue-500 to-cyan-500',
  being: 'from-purple-500 to-pink-500',
  balance: 'from-green-500 to-emerald-500',
  business: 'from-amber-500 to-orange-500'
};

interface VisionBoardCardProps {
  category: Category;
  imageUrl?: string;
  vision?: string;
  language: 'en' | 'ro';
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const VisionBoardCard: React.FC<VisionBoardCardProps> = ({
  category,
  imageUrl,
  vision,
  language,
  onClick,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'aspect-square',
    md: 'aspect-[4/3]',
    lg: 'aspect-video'
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer rounded-xl border-0 shadow-lg transition-transform hover:scale-[1.02]",
        sizeClasses[size]
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={categoryLabels[category][language]}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br",
            categoryColors[category]
          )}>
            <div className="text-white/50 scale-150">{categoryIcons[category]}</div>
          </div>
        )}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-white text-xs font-medium w-fit bg-gradient-to-r",
          categoryColors[category]
        )}>
          {categoryIcons[category]}
          <span>{categoryLabels[category][language]}</span>
        </div>
        
        {vision && size !== 'sm' && (
          <p className="text-white/80 text-xs mt-1 line-clamp-1">
            {vision.slice(0, 50)}...
          </p>
        )}
      </div>
    </Card>
  );
};
