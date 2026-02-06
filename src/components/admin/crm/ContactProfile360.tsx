import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Clock,
  Flame, Target, Zap, Crown, TrendingUp, Eye,
  MessageSquare, FileText, Activity, Save, Tag,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ContactTimeline } from './ContactTimeline';
import { AdminClientDoorPreview } from './AdminClientDoorPreview';
import { ChallengeProgressTab } from './ChallengeProgressTab';
import { ChallengeConversationsTab } from './ChallengeConversationsTab';
import { formatDistanceToNow, format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ContactProfile360Props {
  contactId: string;
  onBack: () => void;
}

interface ContactData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  avatar_emoji: string | null;
  user_id: string | null;
  funnel_stage: string;
  lead_source: string | null;
  lead_score: number;
  engagement_score: number;
  first_seen_at: string;
  lead_captured_at: string | null;
  account_created_at: string | null;
  first_purchase_at: string | null;
  last_activity_at: string | null;
  total_sessions: number;
  total_page_views: number;
  total_stack_sessions: number;
  total_door_tasks: number;
  door_completion_rate: number;
  current_streak: number;
  email_opens: number;
  email_clicks: number;
  lifetime_value: number;
  total_purchases: number;
  warrior_power_score: number | null;
  warrior_power_data: unknown;
  tags: string[] | null;
  admin_notes: string | null;
  challenge_started_at: string | null;
  challenge_current_day: number | null;
  challenge_days_completed: number | null;
  challenge_completed_at: string | null;
}

export const ContactProfile360: React.FC<ContactProfile360Props> = ({ contactId, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [showDoorPreview, setShowDoorPreview] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadContact();
    logProfileView();
  }, [contactId]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_contact_profiles')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) throw error;
      setContact(data);
      setNotes(data.admin_notes || '');
    } catch (error) {
      console.error('Error loading contact:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca profilul contactului',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const logProfileView = async () => {
    if (!user) return;
    try {
      await supabase.from('crm_admin_sessions').insert({
        admin_id: user.id,
        admin_email: user.email,
        target_contact_id: contactId,
        session_type: 'profile_view'
      });
    } catch (error) {
      console.error('Error logging profile view:', error);
    }
  };

  const saveNotes = async () => {
    try {
      setSavingNotes(true);
      const { error } = await supabase
        .from('crm_contact_profiles')
        .update({ admin_notes: notes })
        .eq('id', contactId);

      if (error) throw error;

      // Log the note action
      if (user) {
        await supabase.from('crm_admin_sessions').insert({
          admin_id: user.id,
          admin_email: user.email,
          target_contact_id: contactId,
          session_type: 'notes',
          notes: 'Updated admin notes'
        });
      }

      toast({
        title: 'Salvat',
        description: 'Notițele au fost actualizate'
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut salva notițele',
        variant: 'destructive'
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const openDoorPreview = () => {
    if (!contact?.user_id) {
      toast({
        title: 'Imposibil',
        description: 'Acest contact nu are un cont activ',
        variant: 'destructive'
      });
      return;
    }
    setShowDoorPreview(true);
  };

  // Show Door Preview if active
  if (showDoorPreview && contact?.user_id) {
    return (
      <AdminClientDoorPreview
        userId={contact.user_id}
        userEmail={contact.email}
        userName={contact.name}
        onBack={() => setShowDoorPreview(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contactul nu a fost găsit</p>
        <Button onClick={onBack} className="mt-4">Înapoi</Button>
      </div>
    );
  }

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'lead':
        return <Badge className="bg-blue-500">Lead</Badge>;
      case 'engaged':
        return <Badge className="bg-green-500">Engaged</Badge>;
      case 'customer':
        return <Badge className="bg-yellow-500 text-black">Customer</Badge>;
      default:
        return <Badge variant="secondary">{stage}</Badge>;
    }
  };

  const getJourneySteps = () => {
    const steps = [
      { label: 'Lead capturat', done: true, date: contact.lead_captured_at },
      { label: 'Cont creat', done: !!contact.account_created_at, date: contact.account_created_at },
      { label: 'Activ în platformă', done: contact.total_sessions > 5, date: null },
      { label: 'Prima achiziție', done: !!contact.first_purchase_at, date: contact.first_purchase_at }
    ];
    return steps;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {contact.avatar_emoji || <User className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {contact.name || contact.email.split('@')[0]}
                {getStageBadge(contact.funnel_stage)}
              </h2>
              <p className="text-muted-foreground">{contact.email}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{contact.lead_score}</div>
          <p className="text-sm text-muted-foreground">Lead Score</p>
        </div>
        {contact.user_id && (
          <Button onClick={openDoorPreview} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Door Data
          </Button>
        )}
      </div>

      {/* Journey Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {getJourneySteps().map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.done ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </div>
                  <p className={`text-sm mt-2 ${step.done ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(step.date), 'dd MMM yyyy', { locale: ro })}
                    </p>
                  )}
                </div>
                {i < getJourneySteps().length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    getJourneySteps()[i + 1].done ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="challenge">Challenge</TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="warrior">Warrior Power</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statistici Activitate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                    <p className="text-2xl font-bold">{contact.current_streak}</p>
                    <p className="text-xs text-muted-foreground">Streak Zile</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
                    <p className="text-2xl font-bold">{contact.door_completion_rate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Door Rate</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <MessageSquare className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                    <p className="text-2xl font-bold">{contact.total_stack_sessions}</p>
                    <p className="text-xs text-muted-foreground">Stack Sessions</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <FileText className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                    <p className="text-2xl font-bold">{contact.total_door_tasks}</p>
                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informații Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>First seen: {format(new Date(contact.first_seen_at), 'dd MMM yyyy', { locale: ro })}</span>
                </div>
                {contact.last_activity_at && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last activity: {formatDistanceToNow(new Date(contact.last_activity_at), { addSuffix: true, locale: ro })}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Source: {contact.lead_source || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Email Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{contact.email_opens}</p>
                    <p className="text-xs text-muted-foreground">Emails Deschise</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{contact.email_clicks}</p>
                    <p className="text-xs text-muted-foreground">Link-uri Accesate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Date Financiare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{contact.lifetime_value} RON</p>
                    <p className="text-xs text-muted-foreground">Lifetime Value</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{contact.total_purchases}</p>
                    <p className="text-xs text-muted-foreground">Total Achiziții</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenge">
          <ChallengeProgressTab
            contactId={contactId}
            userId={contact.user_id}
            challengeStartedAt={contact.challenge_started_at}
            challengeCurrentDay={contact.challenge_current_day ?? 0}
            challengeDaysCompleted={contact.challenge_days_completed ?? 0}
            challengeCompletedAt={contact.challenge_completed_at}
          />
        </TabsContent>

        <TabsContent value="ai-chat">
          <ChallengeConversationsTab userId={contact.user_id} />
        </TabsContent>

        <TabsContent value="timeline">
          <ContactTimeline contactId={contactId} />
        </TabsContent>

        <TabsContent value="warrior">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Warrior Power Results
              </CardTitle>
              <CardDescription>
                Scor total: {contact.warrior_power_score || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contact.warrior_power_data ? (
                <div className="space-y-4">
                  {Object.entries(contact.warrior_power_data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nu a completat Warrior Power Quiz
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Notes
              </CardTitle>
              <CardDescription>
                Notițe interne despre acest contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Scrie notițe despre acest contact..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <Button onClick={saveNotes} disabled={savingNotes}>
                <Save className="h-4 w-4 mr-2" />
                {savingNotes ? 'Salvare...' : 'Salvează'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
