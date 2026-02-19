import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, User, Clock, MousePointer, FileText, Activity, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_title: string | null;
  activity_data: any;
  page_path: string | null;
  device_type: string | null;
  session_id: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
}

export const UserActivityViewer: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [activityType, setActivityType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchActivities();
  }, [selectedUser, activityType]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('leaderboard_profiles')
      .select('user_id, display_name, avatar_emoji')
      .order('display_name');
    setUsers(data || []);
  };

  const fetchActivities = async () => {
    setLoading(true);
    
    let query = supabase
      .from('crm_activity_timeline')
      .select('id, user_id, activity_type, activity_title, activity_data, page_path, device_type, session_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (selectedUser !== 'all') {
      query = query.eq('user_id', selectedUser);
    }

    if (activityType !== 'all') {
      query = query.eq('activity_type', activityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <MousePointer className="h-4 w-4" />;
      case 'stack_session': return <Activity className="h-4 w-4" />;
      case 'login': return <User className="h-4 w-4" />;
      case 'purchase': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'page_view': return 'bg-blue-500/20 text-blue-500';
      case 'stack_session': return 'bg-purple-500/20 text-purple-500';
      case 'login': return 'bg-yellow-500/20 text-yellow-500';
      case 'purchase': return 'bg-green-500/20 text-green-500';
      case 'challenge_day_complete': return 'bg-orange-500/20 text-orange-500';
      case 'checkout_initiated': return 'bg-pink-500/20 text-pink-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Anonymous';
    const user = users.find(u => u.user_id === userId);
    return user?.display_name || userId.slice(0, 8);
  };

  const activityTypes = [...new Set(activities.map(a => a.activity_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Date reale din crm_activity_timeline ({activities.length} activități)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchActivities} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți userii</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.avatar_emoji} {user.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate tipurile</SelectItem>
                  {activityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută activități..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Timeline</span>
            <Badge variant="secondary">{activities.length} activități</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nicio activitate găsită</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {activities
                  .filter(a => 
                    search === '' || 
                    a.activity_type.includes(search.toLowerCase()) ||
                    a.page_path?.includes(search.toLowerCase()) ||
                    a.activity_title?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(activity => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/30"
                    >
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {getUserName(activity.user_id)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {activity.activity_type}
                          </Badge>
                          {activity.device_type && (
                            <Badge variant="outline" className="text-xs opacity-60">
                              {activity.device_type}
                            </Badge>
                          )}
                        </div>
                        
                        {activity.activity_title && (
                          <p className="text-sm font-medium mt-1">{activity.activity_title}</p>
                        )}
                        
                        {activity.page_path && (
                          <p className="text-sm text-muted-foreground truncate">
                            {activity.page_path}
                          </p>
                        )}
                        
                        {activity.activity_data && (
                          <pre className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(activity.activity_data, null, 2).slice(0, 200)}
                          </pre>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
