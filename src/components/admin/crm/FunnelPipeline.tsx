import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, UserCheck, Crown, Search, RefreshCw, 
  Mail, TrendingUp,
  Zap, Filter, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactCard } from './ContactCard';
import { LeadSourceStats } from './LeadSourceStats';

interface CRMContact {
  id: string;
  email: string;
  name: string | null;
  user_id: string | null;
  funnel_stage: string;
  lead_source: string | null;
  lead_score: number;
  engagement_score: number;
  first_seen_at: string;
  last_activity_at: string | null;
  warrior_power_score: number | null;
  current_streak: number;
  door_completion_rate: number;
  lifetime_value: number;
  total_purchases: number;
  tags: string[] | null;
  subscription_tier: string | null;
  subscription_status: string | null;
}

interface FunnelPipelineProps {
  onSelectContact: (contactId: string) => void;
}

export const FunnelPipeline: React.FC<FunnelPipelineProps> = ({ onSelectContact }) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_contact_profiles')
        .select('*')
        .order('lead_score', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca contactele',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncContacts = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('sync-crm-contacts');
      
      if (error) throw error;
      
      toast({
        title: 'Sincronizare completă',
        description: `${data?.synced || 0} noi, ${data?.updated || 0} actualizate, ${data?.subscribers || 0} subscriberi`
      });
      
      await loadContacts();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Eroare la sincronizare',
        description: 'Încearcă din nou mai târziu',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  // Get unique lead sources for filter dropdown
  const uniqueSources = React.useMemo(() => {
    const sources = new Set<string>();
    contacts.forEach(c => {
      if (c.lead_source) sources.add(c.lead_source);
    });
    return Array.from(sources).sort();
  }, [contacts]);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || c.lead_source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const leads = filteredContacts.filter(c => c.funnel_stage === 'lead');
  const trials = filteredContacts.filter(c => c.subscription_status === 'trialing' || c.funnel_stage === 'trial');
  const engaged = filteredContacts.filter(c => c.funnel_stage === 'engaged' && c.subscription_status !== 'trialing');
  const customers = filteredContacts.filter(c => c.funnel_stage === 'customer' && c.subscription_status !== 'trialing');

  const getConversionRate = (from: number, to: number) => {
    if (from === 0) return 0;
    return ((to / from) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacte</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead → Engaged</p>
                <p className="text-2xl font-bold">{getConversionRate(leads.length + engaged.length + customers.length, engaged.length + customers.length)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engaged → Customer</p>
                <p className="text-2xl font-bold">{getConversionRate(engaged.length + customers.length, customers.length)}%</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV Total</p>
                <p className="text-2xl font-bold">{contacts.reduce((sum, c) => sum + c.lifetime_value, 0)} RON</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Source Stats Toggle */}
      {showStats && (
        <LeadSourceStats contacts={contacts} />
      )}

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după email sau nume..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Toate sursele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate sursele</SelectItem>
            {uniqueSources.map(source => (
              <SelectItem key={source} value={source}>
                {source === 'vision_2026_quiz' ? 'Vision 2026 Quiz' :
                 source === 'vision_board' ? 'Vision Board' :
                 source === 'warrior_power' ? 'Warrior Power' :
                 source === 'direct_signup' ? 'Direct Signup' :
                 source === 'stripe_subscription' ? 'Stripe' :
                 source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Ascunde Stats' : 'Lead Stats'}
        </Button>
        <Button 
          variant="outline" 
          onClick={syncContacts}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizare...' : 'Sync Contacte'}
        </Button>
      </div>

      {/* Filter indicator */}
      {sourceFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Filtrare: {sourceFilter}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSourceFilter('all')}
            className="h-6 px-2"
          >
            Șterge filtru
          </Button>
        </div>
      )}

      {/* Kanban Pipeline - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Leads Column */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-blue-500" />
                Leads
              </CardTitle>
              <Badge variant="secondary">{leads.length}</Badge>
            </div>
            <CardDescription>
              Au completat un quiz sau formular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {leads.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Niciun lead găsit
                  </p>
                ) : (
                  leads.map(contact => (
                    <ContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onClick={() => onSelectContact(contact.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Trial Column */}
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                În Trial
              </CardTitle>
              <Badge variant="secondary">{trials.length}</Badge>
            </div>
            <CardDescription>
              3 zile gratuite, card salvat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {trials.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nimeni în trial
                  </p>
                ) : (
                  trials.map(contact => (
                    <ContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onClick={() => onSelectContact(contact.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Engaged Column */}
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
                Engaged
              </CardTitle>
              <Badge variant="secondary">{engaged.length}</Badge>
            </div>
            <CardDescription>
              Cont activ, folosesc platforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {engaged.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Niciun utilizator engaged
                  </p>
                ) : (
                  engaged.map(contact => (
                    <ContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onClick={() => onSelectContact(contact.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Customers Column */}
        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-yellow-500" />
                Customers
              </CardTitle>
              <Badge variant="secondary">{customers.length}</Badge>
            </div>
            <CardDescription>
              Au făcut cel puțin o achiziție
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {customers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Niciun customer încă
                  </p>
                ) : (
                  customers.map(contact => (
                    <ContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onClick={() => onSelectContact(contact.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
