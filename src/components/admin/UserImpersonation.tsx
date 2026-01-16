import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserCog, 
  Search, 
  Eye,
  LogIn,
  LogOut,
  Shield,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
}

interface ImpersonationLog {
  id: string;
  admin_id: string;
  target_user_id: string;
  action: 'start' | 'end';
  reason: string | null;
  created_at: string;
}

const IMPERSONATION_KEY = 'admin_impersonation';

export const UserImpersonation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ImpersonationLog[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchData();
    checkImpersonationStatus();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [usersResult, logsResult] = await Promise.all([
      supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .order('display_name'),
      supabase
        .from('admin_impersonation_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
    ]);

    setUsers(usersResult.data || []);
    setLogs((logsResult.data || []).map(log => ({
      ...log,
      action: log.action as 'start' | 'end'
    })));
    setLoading(false);
  };

  const checkImpersonationStatus = () => {
    const stored = localStorage.getItem(IMPERSONATION_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsImpersonating(true);
        setImpersonatedUser(data.targetUser);
      } catch (e) {
        localStorage.removeItem(IMPERSONATION_KEY);
      }
    }
  };

  const startImpersonation = async () => {
    if (!selectedUser || !user) return;

    const targetUser = users.find(u => u.user_id === selectedUser);
    if (!targetUser) return;

    // Log the impersonation start
    await supabase.from('admin_impersonation_log').insert({
      admin_id: user.id,
      target_user_id: selectedUser,
      action: 'start',
      reason: 'Admin support session'
    });

    // Store impersonation state
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify({
      adminId: user.id,
      targetUser: targetUser,
      startedAt: new Date().toISOString()
    }));

    setIsImpersonating(true);
    setImpersonatedUser(targetUser);

    toast({
      title: 'Impersonation Started',
      description: `You are now viewing as ${targetUser.display_name}. Open the app in a new tab to see their view.`
    });

    fetchData();
  };

  const endImpersonation = async () => {
    if (!user || !impersonatedUser) return;

    // Log the impersonation end
    await supabase.from('admin_impersonation_log').insert({
      admin_id: user.id,
      target_user_id: impersonatedUser.user_id,
      action: 'end'
    });

    localStorage.removeItem(IMPERSONATION_KEY);
    setIsImpersonating(false);
    setImpersonatedUser(null);

    toast({
      title: 'Impersonation Ended',
      description: 'You have returned to your admin account.'
    });

    fetchData();
  };

  const getUserName = (userId: string) => {
    const u = users.find(user => user.user_id === userId);
    return u?.display_name || userId.slice(0, 8);
  };

  const filteredUsers = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Impersonation
          </h2>
          <p className="text-sm text-muted-foreground">
            Login as any user to debug their experience
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Warning */}
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-500">
          <strong>Security Notice:</strong> All impersonation sessions are logged for audit purposes. 
          Only use this feature for legitimate support and debugging.
        </AlertDescription>
      </Alert>

      {/* Current Impersonation Status */}
      {isImpersonating && impersonatedUser && (
        <Card className="glass-card border-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  {impersonatedUser.avatar_emoji || '👤'}
                </div>
                <div>
                  <p className="font-semibold">Currently Impersonating</p>
                  <p className="text-sm text-muted-foreground">{impersonatedUser.display_name}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={endImpersonation} className="gap-2">
                <LogOut className="h-4 w-4" />
                Exit Impersonation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Impersonation */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Start Impersonation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to impersonate..." />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    <span className="flex items-center gap-2">
                      <span>{u.avatar_emoji || '👤'}</span>
                      <span>{u.display_name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={startImpersonation}
              disabled={!selectedUser || isImpersonating}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {isImpersonating ? 'Already Impersonating' : 'Start Impersonation'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Note: This creates a view-only session. No actions will be taken on behalf of the user.
            </p>
          </CardContent>
        </Card>

        {/* Impersonation Logs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Audit Log
              </span>
              <Badge variant="secondary">{logs.length} sessions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No impersonation sessions logged</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {logs.map(log => (
                    <div 
                      key={log.id}
                      className="p-3 rounded-lg border border-border/30 flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-lg ${
                        log.action === 'start' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {log.action === 'start' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {log.action === 'start' ? 'Started' : 'Ended'} impersonation
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {getUserName(log.target_user_id)}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
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
