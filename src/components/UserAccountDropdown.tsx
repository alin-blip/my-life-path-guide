import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, CreditCard, LogOut, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const UserAccountDropdown: React.FC = () => {
  const { user, subscribed, subscriptionTier, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const userEmail = user.email || '';
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut efectua delogarea.',
        variant: 'destructive',
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!subscribed) {
      navigate('/pricing');
      return;
    }

    setIsLoading(true);
    const preOpened = preOpenWindow();

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        toast({
          title: 'Eroare',
          description: 'Portalul de abonament nu este disponibil momentan.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      if (preOpened) preOpened.close();
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut deschide portalul de abonament.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTierBadge = () => {
    if (!subscribed || !subscriptionTier) return null;
    
    const tierConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
      elite: { 
        icon: <Crown className="h-3 w-3" />, 
        label: 'Elite', 
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
      },
      pro: { 
        icon: <Sparkles className="h-3 w-3" />, 
        label: 'Pro', 
        className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
      },
      basic: { 
        icon: null, 
        label: 'Basic', 
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
      },
    };

    const tier = tierConfig[subscriptionTier.toLowerCase()] || tierConfig.basic;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${tier.className}`}>
        {tier.icon}
        {tier.label}
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-2 py-1.5 h-auto"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
            {userInitials}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
              {userEmail}
            </span>
            {getTierBadge()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userEmail}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {subscribed ? `Abonament ${subscriptionTier}` : 'Fără abonament'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profilul meu</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Setări</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleManageSubscription} 
          className="cursor-pointer"
          disabled={isLoading}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>{subscribed ? 'Gestionează abonamentul' : 'Alege un plan'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
