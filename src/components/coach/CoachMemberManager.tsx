import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useCoachTribeAdmin } from '@/hooks/useCoachTribeAdmin';
import { useCoachTribe } from '@/hooks/useCoachTribe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  Check,
  X,
  Shield,
  Crown,
  UserX,
  Loader2,
  Users,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  coachProfileId: string;
  userId: string;
  tribeId: string;
  tribeName: string;
}

const content = {
  ro: {
    invites: 'Link-uri de invitare',
    createInvite: 'Generează link',
    noInvites: 'Niciun link de invitare activ',
    code: 'Cod',
    uses: 'utilizări',
    active: 'Activ',
    inactive: 'Inactiv',
    copied: 'Copiat!',
    joinRequests: 'Cereri de aderare',
    noRequests: 'Nicio cerere în așteptare',
    approve: 'Aprobă',
    reject: 'Respinge',
    members: 'Membri',
    role: 'Rol',
    owner: 'Owner',
    admin: 'Admin',
    moderator: 'Moderator',
    member: 'Membru',
    kick: 'Elimină',
    confirmKick: 'Ești sigur că vrei să elimini acest membru?',
    confirmKickDesc: 'Membrul va fi eliminat din grup.',
    cancel: 'Anulează',
    remove: 'Elimină',
    requireApproval: 'Necesită aprobare pentru membri noi',
    unlimited: 'Nelimitat',
  },
  en: {
    invites: 'Invite links',
    createInvite: 'Generate link',
    noInvites: 'No active invite links',
    code: 'Code',
    uses: 'uses',
    active: 'Active',
    inactive: 'Inactive',
    copied: 'Copied!',
    joinRequests: 'Join requests',
    noRequests: 'No pending requests',
    approve: 'Approve',
    reject: 'Reject',
    members: 'Members',
    role: 'Role',
    owner: 'Owner',
    admin: 'Admin',
    moderator: 'Moderator',
    member: 'Member',
    kick: 'Remove',
    confirmKick: 'Are you sure you want to remove this member?',
    confirmKickDesc: 'The member will be removed from the group.',
    cancel: 'Cancel',
    remove: 'Remove',
    requireApproval: 'Require approval for new members',
    unlimited: 'Unlimited',
  },
};

export const CoachMemberManager: React.FC<Props> = ({ coachProfileId, userId, tribeId, tribeName }) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const { toast } = useToast();

  const { members, refreshMembers } = useCoachTribe(coachProfileId, userId);
  const {
    invites,
    joinRequests,
    loading,
    fetchInvites,
    fetchJoinRequests,
    createInvite,
    deactivateInvite,
    approveRequest,
    rejectRequest,
    updateMemberRole,
    kickMember,
    toggleApprovalMode,
  } = useCoachTribeAdmin(tribeId, userId);

  const [requiresApproval, setRequiresApproval] = useState(false);
  const [kickTarget, setKickTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
    fetchJoinRequests();
  }, [fetchInvites, fetchJoinRequests]);

  // Sync requires_approval from DB on mount
  useEffect(() => {
    if (!tribeId) return;
    supabase.from('tribes').select('requires_approval')
      .eq('id', tribeId).maybeSingle()
      .then(({ data }) => {
        if (data) setRequiresApproval(!!data.requires_approval);
      });
  }, [tribeId]);

  const handleCreateInvite = async () => {
    await createInvite();
  };

  const handleCopyCode = (code: string) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: t.copied });
  };

  const handleKick = async () => {
    if (!kickTarget) return;
    await kickMember(kickTarget);
    setKickTarget(null);
    refreshMembers();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await updateMemberRole(memberId, newRole);
    refreshMembers();
  };

  const roleOptions = [
    { value: 'member', label: t.member },
    { value: 'moderator', label: t.moderator },
    { value: 'admin', label: t.admin },
  ];

  return (
    <div className="space-y-6">
      {/* Approval Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="approval-mode" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {t.requireApproval}
            </Label>
            <Switch
              id="approval-mode"
              checked={requiresApproval}
              onCheckedChange={(checked) => {
                setRequiresApproval(checked);
                toggleApprovalMode(checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invite Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t.invites}
          </CardTitle>
          <Button size="sm" onClick={handleCreateInvite}>
            <Plus className="h-4 w-4 mr-1" />
            {t.createInvite}
          </Button>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noInvites}</p>
          ) : (
            <div className="space-y-2">
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">{inv.invite_code}</code>
                    <span className="text-xs text-muted-foreground">
                      {inv.uses_count}/{inv.max_uses || '∞'} {t.uses}
                    </span>
                    <Badge variant={inv.is_active ? 'default' : 'secondary'} className="text-xs">
                      {inv.is_active ? t.active : t.inactive}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleCopyCode(inv.invite_code)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {inv.is_active && (
                      <Button size="icon" variant="ghost" onClick={() => deactivateInvite(inv.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.joinRequests}
              <Badge variant="destructive" className="ml-2">{joinRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {joinRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium text-sm">{req.display_name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => approveRequest(req.id, req.user_id)}>
                      <Check className="h-4 w-4 mr-1" />
                      {t.approve}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rejectRequest(req.id)}>
                      <X className="h-4 w-4 mr-1" />
                      {t.reject}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.members} ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-sm">
                      {member.avatar_emoji || member.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">{member.display_name}</span>
                    {member.role === 'owner' && (
                      <Badge variant="default" className="ml-2 text-[10px]">
                        <Crown className="h-3 w-3 mr-1" />
                        {t.owner}
                      </Badge>
                    )}
                  </div>
                </div>
                {member.role !== 'owner' && member.user_id !== userId && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleRoleChange(member.user_id, v)}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setKickTarget(member.user_id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kick Confirmation */}
      <AlertDialog open={!!kickTarget} onOpenChange={() => setKickTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmKick}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmKickDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleKick} className="bg-destructive text-destructive-foreground">
              {t.remove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
