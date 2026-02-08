import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Member {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
}

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (memberId: string) => void;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  onSelectMember,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchMembers = async () => {
      setLoading(true);
      let query = supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .neq('user_id', user?.id || '')
        .order('display_name')
        .limit(50);

      if (search.trim()) {
        query = query.ilike('display_name', `%${search.trim()}%`);
      }

      const { data } = await query;
      setMembers(data || []);
      setLoading(false);
    };
    fetchMembers();
  }, [open, search, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ro' ? 'Mesaj nou' : 'New Message'}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ro' ? 'Caută membri...' : 'Search members...'}
            className="pl-9"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto divide-y divide-border/40">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              {language === 'ro' ? 'Niciun membru găsit' : 'No members found'}
            </p>
          ) : (
            members.map((member) => (
              <button
                key={member.user_id}
                onClick={() => {
                  onSelectMember(member.user_id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {member.avatar_emoji || '📚'}
                </div>
                <span className="text-sm font-medium">{member.display_name}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
