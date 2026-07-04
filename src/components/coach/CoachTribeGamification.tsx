import React, { useState } from 'react';
import { useCoachTribeGamification } from '@/hooks/useCoachTribeGamification';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Plus, Trash2, Award, Medal, Crown } from 'lucide-react';

interface Props {
  tribeId: string;
  userId: string;
  isOwner: boolean;
  members: Array<{ user_id: string; profiles?: { display_name?: string } | null }>;
}

const content = {
  ro: {
    title: 'Gamificare & Puncte',
    leaderboard: 'Clasament',
    badges: 'Badge-uri',
    awardPoints: 'Acordă Puncte',
    newBadge: 'Badge Nou',
    points: 'puncte',
    reason: 'Motiv',
    amount: 'Puncte',
    member: 'Membru',
    create: 'Creează',
    award: 'Acordă',
    cancel: 'Anulează',
    badgeName: 'Nume badge',
    badgeDesc: 'Descriere',
    badgeIcon: 'Emoji icon',
    pointsRequired: 'Puncte necesare',
    noBadges: 'Niciun badge definit.',
    noPoints: 'Niciun punct acordat încă.',
    rank: '#',
    total: 'Total',
    badgesCount: 'Badge-uri',
    awardBadge: 'Acordă',
  },
  en: {
    title: 'Gamification & Points',
    leaderboard: 'Leaderboard',
    badges: 'Badges',
    awardPoints: 'Award Points',
    newBadge: 'New Badge',
    points: 'points',
    reason: 'Reason',
    amount: 'Points',
    member: 'Member',
    create: 'Create',
    award: 'Award',
    cancel: 'Cancel',
    badgeName: 'Badge name',
    badgeDesc: 'Description',
    badgeIcon: 'Emoji icon',
    pointsRequired: 'Points required',
    noBadges: 'No badges defined.',
    noPoints: 'No points awarded yet.',
    rank: '#',
    total: 'Total',
    badgesCount: 'Badges',
    awardBadge: 'Award',
  },
};

const rankIcons = [
  <Crown key="1" className="h-5 w-5 text-yellow-500" />,
  <Medal key="2" className="h-5 w-5 text-gray-400" />,
  <Medal key="3" className="h-5 w-5 text-amber-700" />,
];

export const CoachTribeGamification: React.FC<Props> = ({ tribeId, userId, isOwner, members }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const { leaderboard, badges, earnedBadges, loading, awardPoints, createBadge, deleteBadge, awardBadge } =
    useCoachTribeGamification(tribeId, userId);

  const [pointsDialog, setPointsDialog] = useState(false);
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [pointsForm, setPointsForm] = useState({ user_id: '', points: '10', reason: '' });
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', icon: '🏆', points_required: '0' });
  const [awardBadgeTarget, setAwardBadgeTarget] = useState<{ badgeId: string; userId: string } | null>(null);

  const getMemberName = (uid: string) => {
    const m = members.find(m => m.user_id === uid);
    return (m?.profiles as any)?.display_name || uid.slice(0, 8);
  };

  const handleAwardPoints = async () => {
    if (!pointsForm.user_id || !pointsForm.points || !pointsForm.reason) return;
    await awardPoints(pointsForm.user_id, parseInt(pointsForm.points), pointsForm.reason);
    setPointsForm({ user_id: '', points: '10', reason: '' });
    setPointsDialog(false);
  };

  const handleCreateBadge = async () => {
    if (!badgeForm.name) return;
    await createBadge({
      name: badgeForm.name,
      description: badgeForm.description || undefined,
      icon: badgeForm.icon || '🏆',
      points_required: parseInt(badgeForm.points_required) || 0,
    });
    setBadgeForm({ name: '', description: '', icon: '🏆', points_required: '0' });
    setBadgeDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard" className="gap-1">
            <Star className="h-4 w-4" /> {t.leaderboard}
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1">
            <Award className="h-4 w-4" /> {t.badges}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 space-y-4">
          {isOwner && (
            <>
              <Button className="gap-2" onClick={() => setPointsDialog(true)}><Plus className="h-4 w-4" />{t.awardPoints}</Button>
              <ResponsiveModal open={pointsDialog} onOpenChange={setPointsDialog} className="max-w-sm">
                <ResponsiveModalHeader><ResponsiveModalTitle>{t.awardPoints}</ResponsiveModalTitle></ResponsiveModalHeader>
                <div className="space-y-3">
                  <select
                    className="w-full border rounded-md p-2 bg-background text-foreground"
                    value={pointsForm.user_id}
                    onChange={e => setPointsForm(f => ({ ...f, user_id: e.target.value }))}
                  >
                    <option value="">{t.member}</option>
                    {members.map(m => (
                      <option key={m.user_id} value={m.user_id}>{getMemberName(m.user_id)}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder={t.amount}
                    value={pointsForm.points}
                    onChange={e => setPointsForm(f => ({ ...f, points: e.target.value }))}
                  />
                  <Input
                    placeholder={t.reason}
                    value={pointsForm.reason}
                    onChange={e => setPointsForm(f => ({ ...f, reason: e.target.value }))}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setPointsDialog(false)}>{t.cancel}</Button>
                    <Button onClick={handleAwardPoints}>{t.award}</Button>
                  </div>
                </div>
              </ResponsiveModal>
            </>
          )}


          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noPoints}</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <Card key={entry.user_id}>
                  <CardContent className="py-3 flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {i < 3 ? rankIcons[i] : <span className="text-sm text-muted-foreground font-medium">{i + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{getMemberName(entry.user_id)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.badges_count > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Award className="h-3 w-3" /> {entry.badges_count}
                        </Badge>
                      )}
                      <span className="font-bold text-primary text-lg">{entry.total_points}</span>
                      <span className="text-sm text-muted-foreground">{t.points}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="mt-4 space-y-4">
          {isOwner && (
            <>
              <Button className="gap-2" onClick={() => setBadgeDialog(true)}><Plus className="h-4 w-4" />{t.newBadge}</Button>
              <ResponsiveModal open={badgeDialog} onOpenChange={setBadgeDialog} className="max-w-sm">
                <ResponsiveModalHeader><ResponsiveModalTitle>{t.newBadge}</ResponsiveModalTitle></ResponsiveModalHeader>
                <div className="space-y-3">
                  <Input
                    placeholder={t.badgeName}
                    value={badgeForm.name}
                    onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    placeholder={t.badgeDesc}
                    value={badgeForm.description}
                    onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <Input
                    placeholder={t.badgeIcon}
                    value={badgeForm.icon}
                    onChange={e => setBadgeForm(f => ({ ...f, icon: e.target.value }))}
                    maxLength={4}
                  />
                  <Input
                    type="number"
                    placeholder={t.pointsRequired}
                    value={badgeForm.points_required}
                    onChange={e => setBadgeForm(f => ({ ...f, points_required: e.target.value }))}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setBadgeDialog(false)}>{t.cancel}</Button>
                    <Button onClick={handleCreateBadge}>{t.create}</Button>
                  </div>
                </div>
              </ResponsiveModal>
            </>
          )}


          {badges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noBadges}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map(badge => {
                const earnedBy = earnedBadges[badge.id] || [];
                return (
                  <Card key={badge.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{badge.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{badge.name}</h4>
                          {badge.description && (
                            <p className="text-sm text-muted-foreground">{badge.description}</p>
                          )}
                          {badge.points_required > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {badge.points_required} {t.points}
                            </p>
                          )}
                          {earnedBy.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {earnedBy.map(uid => (
                                <Badge key={uid} variant="secondary" className="text-xs">
                                  {getMemberName(uid)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {isOwner && (
                          <div className="flex flex-col gap-1">
                            <select
                              className="text-xs border rounded p-1 bg-background"
                              value=""
                              onChange={e => {
                                if (e.target.value) {
                                  awardBadge(badge.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">{t.awardBadge}</option>
                              {members
                                .filter(m => !earnedBy.includes(m.user_id))
                                .map(m => (
                                  <option key={m.user_id} value={m.user_id}>{getMemberName(m.user_id)}</option>
                                ))}
                            </select>
                            <Button size="sm" variant="ghost" onClick={() => deleteBadge(badge.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
