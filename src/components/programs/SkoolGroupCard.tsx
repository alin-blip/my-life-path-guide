import React from 'react';
import { Tribe } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Lock, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SkoolGroupCardProps {
  tribe: Tribe;
  isMember: boolean;
  isOwner: boolean;
  onJoin: (tribeId: string) => void;
  onLeave: (tribeId: string) => void;
}

export const SkoolGroupCard: React.FC<SkoolGroupCardProps> = ({
  tribe,
  isMember,
  isOwner,
  onJoin,
  onLeave,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMember) {
      if (!isOwner) onLeave(tribe.id);
    } else {
      onJoin(tribe.id);
    }
  };

  return (
    <div
      onClick={() => isMember && navigate(`/groups/${tribe.id}`)}
      className={`bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-md ${
        isMember ? 'cursor-pointer' : ''
      }`}
    >
      {/* Cover */}
      <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 relative">
        {tribe.cover_image_url && (
          <img
            src={tribe.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2">
          {tribe.is_public ? (
            <Globe className="h-3.5 w-3.5 text-foreground/50" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-foreground/50" />
          )}
        </div>
      </div>

      <div className="p-4 -mt-5">
        {/* Avatar */}
        <Avatar className="w-10 h-10 border-2 border-card">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {tribe.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-bold text-sm text-foreground mt-2 truncate">{tribe.name}</h3>
        {tribe.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {tribe.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Users className="h-3 w-3" />
          <span>
            {tribe.member_count} {language === 'ro' ? 'membri' : 'members'}
          </span>
        </div>

        <Button
          variant={isMember ? 'outline' : 'default'}
          size="sm"
          className="w-full mt-3"
          onClick={handleAction}
          disabled={isOwner}
        >
          {isOwner
            ? language === 'ro' ? 'Proprietar' : 'Owner'
            : isMember
              ? language === 'ro' ? 'Părăsește' : 'Leave'
              : language === 'ro' ? 'Alătură-te' : 'Join'}
        </Button>
      </div>
    </div>
  );
};
