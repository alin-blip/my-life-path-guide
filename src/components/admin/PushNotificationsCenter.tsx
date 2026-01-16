import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Send, 
  Users, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  tribe_id: string | null;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
}

interface Tribe {
  id: string;
  name: string;
  member_count: number;
}

export const PushNotificationsCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'user' | 'tribe'>('all');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [notificationType, setNotificationType] = useState('general');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [notifResult, usersResult, tribesResult] = await Promise.all([
      supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .order('display_name'),
      supabase
        .from('tribes')
        .select('id, name, member_count')
        .order('name')
    ]);

    setNotifications(notifResult.data || []);
    setUsers(usersResult.data || []);
    setTribes(tribesResult.data || []);
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim() || !user) return;
    
    setSending(true);

    try {
      if (recipientType === 'all') {
        // Send to all users
        const notifications = users.map(u => ({
          sender_id: user.id,
          recipient_id: u.user_id,
          title: title.trim(),
          message: message.trim(),
          notification_type: notificationType
        }));

        const { error } = await supabase
          .from('push_notifications')
          .insert(notifications);

        if (error) throw error;
        
        toast({
          title: 'Notifications sent!',
          description: `Sent to ${users.length} users.`
        });
      } else if (recipientType === 'user' && selectedRecipient) {
        const { error } = await supabase
          .from('push_notifications')
          .insert({
            sender_id: user.id,
            recipient_id: selectedRecipient,
            title: title.trim(),
            message: message.trim(),
            notification_type: notificationType
          });

        if (error) throw error;
        
        toast({
          title: 'Notification sent!',
          description: 'User has been notified.'
        });
      } else if (recipientType === 'tribe' && selectedRecipient) {
        // Get tribe members and send to each
        const { data: members } = await supabase
          .from('tribe_members')
          .select('user_id')
          .eq('tribe_id', selectedRecipient);

        if (members && members.length > 0) {
          const notifications = members.map(m => ({
            sender_id: user.id,
            recipient_id: m.user_id,
            tribe_id: selectedRecipient,
            title: title.trim(),
            message: message.trim(),
            notification_type: notificationType
          }));

          const { error } = await supabase
            .from('push_notifications')
            .insert(notifications);

          if (error) throw error;
          
          toast({
            title: 'Notifications sent!',
            description: `Sent to ${members.length} tribe members.`
          });
        }
      }

      // Reset form
      setTitle('');
      setMessage('');
      setSelectedRecipient('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error sending notification',
        description: error.message,
        variant: 'destructive'
      });
    }

    setSending(false);
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Broadcast';
    const u = users.find(user => user.user_id === userId);
    return u?.display_name || userId.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Push Notifications Center</h2>
          <p className="text-sm text-muted-foreground">
            Send notifications to users and tribes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <Select 
                value={recipientType} 
                onValueChange={(v) => {
                  setRecipientType(v as 'all' | 'user' | 'tribe');
                  setSelectedRecipient('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> All Users
                    </span>
                  </SelectItem>
                  <SelectItem value="user">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Specific User
                    </span>
                  </SelectItem>
                  <SelectItem value="tribe">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Tribe
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === 'user' && (
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.avatar_emoji} {u.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recipientType === 'tribe' && (
              <div className="space-y-2">
                <Label>Select Tribe</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tribe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tribes.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.member_count} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={sendNotification} 
              disabled={!title.trim() || !message.trim() || sending}
              className="w-full gap-2"
            >
              <Bell className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Notifications
              </span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications sent yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className="p-3 rounded-lg border border-border/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notif.title}</h4>
                        {notif.is_read ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          To: {getUserName(notif.recipient_id)}
                        </Badge>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
