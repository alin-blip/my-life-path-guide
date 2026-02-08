import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  onSelectMultiple?: (memberIds: string[]) => void;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  onSelectMember,
  onSelectMultiple,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setSearch('');
      return;
    }
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

  const toggleMember = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const removeMember = (userId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== userId));
  };

  const handleSend = () => {
    if (selectedIds.length === 1) {
      onSelectMember(selectedIds[0]);
      onOpenChange(false);
    } else if (selectedIds.length > 1 && onSelectMultiple) {
      onSelectMultiple(selectedIds);
      onOpenChange(false);
    }
  };

  const selectedMembers = members.filter(m => selectedIds.includes(m.user_id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ro' ? 'Mesaj nou' : 'New Message'}
          </DialogTitle>
        </DialogHeader>

        {/* Selected members chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedMembers.map(m => (
              <Badge key={m.user_id} variant="secondary" className="gap-1 pr-1">
                <span>{m.avatar_emoji || '📚'}</span>
                <span className="text-xs">{m.display_name}</span>
                <button
                  onClick={() => removeMember(m.user_id)}
                  className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

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
            members.map((member) => {
              const isSelected = selectedIds.includes(member.user_id);
              return (
                <button
                  key={member.user_id}
                  onClick={() => toggleMember(member.user_id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-left"
                >
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {member.avatar_emoji || '📚'}
                  </div>
                  <span className="text-sm font-medium">{member.display_name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Send button */}
        {selectedIds.length > 0 && (
          <Button onClick={handleSend} className="w-full">
            {language === 'ro'
              ? `Trimite mesaj la ${selectedIds.length} ${selectedIds.length === 1 ? 'persoană' : 'persoane'}`
              : `Message ${selectedIds.length} ${selectedIds.length === 1 ? 'person' : 'people'}`}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
