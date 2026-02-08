import React from 'react';
import { Tribe } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Globe, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface GroupHeaderProps {
  tribe: Tribe;
  isMember: boolean;
  isOwner: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  tribe,
  isMember,
  isOwner,
  onJoin,
  onLeave,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="bg-card border-b border-border">
      {/* Cover */}
      <div className="h-32 sm:h-44 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/15 relative">
        {tribe.cover_image_url && (
          <img src={tribe.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm gap-1.5"
          onClick={() => navigate('/programs?tab=groups')}
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'ro' ? 'Înapoi' : 'Back'}
        </Button>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-8 relative pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <Avatar className="w-16 h-16 border-4 border-card shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
              {tribe.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{tribe.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                {tribe.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {tribe.is_public
                  ? language === 'ro' ? 'Public' : 'Public'
                  : language === 'ro' ? 'Privat' : 'Private'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {tribe.member_count} {language === 'ro' ? 'membri' : 'members'}
              </span>
            </div>
            {tribe.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tribe.description}</p>
            )}
          </div>

          <div className="shrink-0">
            {isOwner ? (
              <Button variant="outline" size="sm" disabled>
                {language === 'ro' ? 'Proprietar' : 'Owner'}
              </Button>
            ) : isMember ? (
              <Button variant="outline" size="sm" onClick={onLeave}>
                {language === 'ro' ? 'Părăsește' : 'Leave Group'}
              </Button>
            ) : (
              <Button size="sm" onClick={onJoin}>
                {language === 'ro' ? 'Alătură-te' : 'Join Group'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
