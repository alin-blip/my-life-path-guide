import React, { useEffect, useState } from 'react';
import { GroupFeed } from '@/components/groups/GroupFeed';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MAIN_TRIBE_ID = '07825fb0-4d6c-4716-b2f3-27a1708cf680';

export const CommunityFeedTab: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRo = language === 'ro';

  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [tribeInfo, setTribeInfo] = useState<{ name: string; description: string | null } | null>(null);

  useEffect(() => {
    const fetchTribeInfo = async () => {
      const { data: tribe } = await supabase
        .from('tribes')
        .select('name, description, member_count')
        .eq('id', MAIN_TRIBE_ID)
        .single();

      if (tribe) {
        setTribeInfo({ name: tribe.name, description: tribe.description });
        setMemberCount(tribe.member_count || 0);
      }

      if (user) {
        const { data: membership } = await supabase
          .from('tribe_members')
          .select('id')
          .eq('tribe_id', MAIN_TRIBE_ID)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsMember(!!membership);
      }
    };

    fetchTribeInfo();
  }, [user]);

  return (
    <div className="flex gap-6">
      {/* Main Feed */}
      <div className="flex-1 min-w-0">
        <GroupFeed tribeId={MAIN_TRIBE_ID} isMember={isMember} />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-4">
        {/* Community Info Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-foreground">{tribeInfo?.name || 'WarriorOS Community'}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tribeInfo?.description ||
              (isRo
                ? 'Comunitatea oficială WarriorOS. Conectează-te cu alți warriors, împărtășește progresul și crește împreună.'
                : 'The official WarriorOS community. Connect with fellow warriors, share progress and grow together.')}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {memberCount} {isRo ? 'membri' : 'members'}
            </span>
          </div>

          <button
            onClick={() => navigate(`/groups/${MAIN_TRIBE_ID}`)}
            className="w-full text-sm text-primary hover:underline text-left flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isRo ? 'Deschide chat-ul grupului' : 'Open group chat'}
          </button>
        </div>

        {/* Community Rules */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">
              {isRo ? 'Reguli comunitate' : 'Community Rules'}
            </h4>
          </div>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
            <li>{isRo ? 'Fii respectuos și constructiv' : 'Be respectful and constructive'}</li>
            <li>{isRo ? 'Împărtășește progresul tău' : 'Share your progress'}</li>
            <li>{isRo ? 'Ajută-i pe ceilalți warriors' : 'Help fellow warriors'}</li>
            <li>{isRo ? 'Fără spam sau auto-promovare' : 'No spam or self-promotion'}</li>
            <li>{isRo ? 'Păstrează conținutul relevant' : 'Keep content relevant'}</li>
          </ol>
        </div>
      </aside>
    </div>
  );
};
