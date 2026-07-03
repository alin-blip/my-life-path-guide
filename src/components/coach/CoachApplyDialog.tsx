import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription, ResponsiveModalFooter } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Users, User } from 'lucide-react';

interface TribeMember {
  user_id: string;
  display_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tribes: { id: string; name: string; member_count?: number }[];
  /** Pre-selected tribe id (from template/program association) */
  defaultTribeId?: string | null;
  onApplyToTribe: (tribeId: string) => Promise<void>;
  onApplyToMember: (userId: string) => Promise<void>;
}

const content = {
  ro: {
    title: 'Aplică',
    desc: 'Alege dacă vrei să aplici la tot grupul sau la un membru specific.',
    wholeGroup: 'Tot grupul',
    specificMember: 'Un membru specific',
    selectGroup: 'Selectează grupul',
    selectMember: 'Selectează membrul',
    apply: 'Aplică',
    cancel: 'Anulează',
    noMembers: 'Niciun membru găsit',
  },
  en: {
    title: 'Apply',
    desc: 'Choose whether to apply to the whole group or a specific member.',
    wholeGroup: 'Whole group',
    specificMember: 'A specific member',
    selectGroup: 'Select group',
    selectMember: 'Select member',
    apply: 'Apply',
    cancel: 'Cancel',
    noMembers: 'No members found',
  },
};

export const CoachApplyDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  tribes,
  defaultTribeId,
  onApplyToTribe,
  onApplyToMember,
}) => {
  const { language } = useLanguage();
  const t = content[language] || content.ro;

  const [mode, setMode] = useState<'group' | 'member'>('group');
  const [selectedTribeId, setSelectedTribeId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [applying, setApplying] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setMode('group');
      setSelectedTribeId(defaultTribeId || tribes[0]?.id || '');
      setSelectedUserId('');
      setMembers([]);
    }
  }, [open, defaultTribeId, tribes]);

  // Fetch members when tribe changes
  useEffect(() => {
    if (!selectedTribeId) {
      setMembers([]);
      return;
    }
    const fetchMembers = async () => {
      setLoadingMembers(true);
      const { data } = await supabase
        .from('tribe_members')
        .select('user_id')
        .eq('tribe_id', selectedTribeId);

      if (!data?.length) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }

      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)
        .order('display_name');

      const memberList: TribeMember[] = (profiles || []).map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name || p.user_id.slice(0, 8),
      }));

      // Add any members without profiles
      for (const d of data) {
        if (!memberList.find(m => m.user_id === d.user_id)) {
          memberList.push({ user_id: d.user_id, display_name: d.user_id.slice(0, 8) });
        }
      }

      setMembers(memberList);
      setLoadingMembers(false);
    };
    fetchMembers();
  }, [selectedTribeId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      if (mode === 'group' && selectedTribeId) {
        await onApplyToTribe(selectedTribeId);
      } else if (mode === 'member' && selectedUserId) {
        await onApplyToMember(selectedUserId);
      }
    } finally {
      setApplying(false);
      onOpenChange(false);
    }
  };

  const canApply =
    (mode === 'group' && !!selectedTribeId) ||
    (mode === 'member' && !!selectedUserId);

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} className="max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{t.title}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{t.desc}</ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4 py-2">
          {/* Tribe selector */}
          {tribes.length > 1 && (
            <div>
              <Label>{t.selectGroup}</Label>
              <Select value={selectedTribeId} onValueChange={(v) => { setSelectedTribeId(v); setSelectedUserId(''); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tribes.map(tribe => (
                    <SelectItem key={tribe.id} value={tribe.id}>
                      {tribe.name}{tribe.member_count != null ? ` (${tribe.member_count})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mode selection */}
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'group' | 'member')}>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer" onClick={() => setMode('group')}>
              <RadioGroupItem value="group" id="mode-group" />
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="mode-group" className="cursor-pointer flex-1">{t.wholeGroup}</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer" onClick={() => setMode('member')}>
              <RadioGroupItem value="member" id="mode-member" />
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="mode-member" className="cursor-pointer flex-1">{t.specificMember}</Label>
            </div>
          </RadioGroup>

          {/* Member selector */}
          {mode === 'member' && (
            <div>
              <Label>{t.selectMember}</Label>
              {loadingMembers ? (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{t.noMembers}</p>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectMember} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <ResponsiveModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button onClick={handleApply} disabled={!canApply || applying}>
            {applying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t.apply}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModal>
  );
};
