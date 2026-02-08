import React from 'react';
import { useBrotherhood } from '@/hooks/useBrotherhood';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SkoolGroupCard } from './SkoolGroupCard';
import { CreateGroupDialog } from './CreateGroupDialog';

export const GroupsTab: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { tribes, myTribes, loading, createTribe, joinTribe, leaveTribe } = useBrotherhood();

  const myTribeIds = myTribes.map((t) => t.id);
  const discoverTribes = tribes.filter((t) => !myTribeIds.includes(t.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language === 'ro' ? 'Grupuri' : 'Groups'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'ro'
              ? 'Creează sau alătură-te comunităților de războinici'
              : 'Create or join warrior communities'}
          </p>
        </div>
        <CreateGroupDialog myTribes={myTribes} onCreateTribe={createTribe} />
      </div>

      {/* My Groups */}
      {myTribes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'ro' ? 'Grupurile Mele' : 'My Groups'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTribes.map((tribe) => (
              <SkoolGroupCard
                key={tribe.id}
                tribe={tribe}
                isMember={true}
                isOwner={tribe.created_by === user?.id}
                onJoin={joinTribe}
                onLeave={leaveTribe}
              />
            ))}
          </div>
        </div>
      )}

      {/* Discover Groups */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {language === 'ro' ? 'Descoperă Grupuri' : 'Discover Groups'}
        </h3>
        {discoverTribes.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              {language === 'ro'
                ? 'Nu există alte grupuri disponibile. Fii primul care creează unul!'
                : 'No other groups available. Be the first to create one!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverTribes.map((tribe) => (
              <SkoolGroupCard
                key={tribe.id}
                tribe={tribe}
                isMember={false}
                isOwner={false}
                onJoin={joinTribe}
                onLeave={leaveTribe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
