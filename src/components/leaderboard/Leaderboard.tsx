import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardCard } from './LeaderboardCard';
import { JoinLeaderboardModal } from './JoinLeaderboardModal';
import { toast } from '@/hooks/use-toast';

export const Leaderboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    leaderboard,
    userProfile,
    userRank,
    isLoading,
    joinLeaderboard,
    updateProfile,
  } = useLeaderboard();

  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleToggleVisibility = async () => {
    if (!userProfile) return;
    
    const result = await updateProfile({ is_visible: !userProfile.is_visible });
    if (result.success) {
      toast({
        title: userProfile.is_visible 
          ? (language === 'en' ? 'Hidden from leaderboard' : 'Ascuns din clasament')
          : (language === 'en' ? 'Visible on leaderboard' : 'Vizibil în clasament'),
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Leaderboard' : 'Clasament'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {language === 'en' ? 'Leaderboard' : 'Clasament'}
          </CardTitle>
          
          {user && (
            <div className="flex items-center gap-2">
              {userProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                >
                  {userProfile.is_visible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      {language === 'en' ? 'Hide' : 'Ascunde'}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      {language === 'en' ? 'Show' : 'Arată'}
                    </>
                  )}
                </Button>
              ) : (
                <Button size="sm" onClick={() => setShowJoinModal(true)}>
                  <Users className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'Join' : 'Înscrie-te'}
                </Button>
              )}
            </div>
          )}
        </div>

        {userRank && userProfile?.is_visible && (
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? `You're ranked #${userRank} out of ${leaderboard.length} participants`
              : `Ești pe locul #${userRank} din ${leaderboard.length} participanți`}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'No participants yet. Be the first to join!'
                : 'Niciun participant încă. Fii primul care se înscrie!'}
            </p>
            {user && !userProfile && (
              <Button onClick={() => setShowJoinModal(true)}>
                {language === 'en' ? 'Join Leaderboard' : 'Intră în Clasament'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <LeaderboardCard
                key={entry.user_id}
                rank={index + 1}
                displayName={entry.display_name}
                avatarEmoji={entry.avatar_emoji}
                pagesRead={entry.pages_read}
                actionsCompleted={entry.actions_completed}
                principlesTouched={entry.principles_touched}
                isCurrentUser={entry.user_id === user?.id}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            📖 {language === 'en' ? 'Pages read' : 'Pagini citite'} • 
            🎯 {language === 'en' ? 'Actions completed' : 'Acțiuni completate'} • 
            🔥 {language === 'en' ? 'Principles touched' : 'Principii atinse'}
          </p>
        </div>
      </CardContent>

      <JoinLeaderboardModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onJoin={joinLeaderboard}
      />
    </Card>
  );
};
