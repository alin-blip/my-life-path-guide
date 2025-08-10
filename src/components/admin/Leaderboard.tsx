
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Medal, Search, ArrowUpDown, Calendar, Loader2 } from 'lucide-react';
import { adminClientService, type AdminClient } from '@/services/adminClientService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderboardClient {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  streak: number;
  lastActivity?: string;
}

export const Leaderboard: React.FC = () => {
  const [clients, setClients] = useState<LeaderboardClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });

  // Load clients data
  const loadClientsData = async () => {
    try {
      setLoading(true);
      const adminClients = await adminClientService.fetchAllClients();
      
      const leaderboardClients: LeaderboardClient[] = adminClients.map(client => ({
        id: client.id,
        name: client.display_name || client.email.split('@')[0],
        email: client.email,
        totalScore: Math.round(client.doorData.completionRate * 10 + client.doorData.currentStreak * 5),
        completedTasks: client.doorData.completedTasks,
        totalTasks: client.doorData.totalTasks,
        completionRate: client.doorData.completionRate,
        streak: client.doorData.currentStreak,
        lastActivity: client.doorData.lastActivity,
      }));

      setClients(leaderboardClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    loadClientsData();

    // Subscribe to daily_progress_stats changes
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_progress_stats'
        },
        (payload) => {
          console.log('Progress stats updated:', payload);
          // Reload data when stats change
          loadClientsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort clients based on sort configuration
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Request sort based on key
  const requestSort = (key: keyof LeaderboardClient) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  // Get medal for top 3
  const getMedal = (index) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl">Client Leaderboard</CardTitle>
          <CardDescription>
            View and compare client performance across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={loadClientsData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('totalScore')}
                  >
                    <div className="flex items-center gap-1">
                      Total Score {getSortDirectionIndicator('totalScore')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('completedTasks')}
                  >
                    <div className="flex items-center gap-1">
                      Completed {getSortDirectionIndicator('completedTasks')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('totalTasks')}
                  >
                    <div className="flex items-center gap-1">
                      Total Tasks {getSortDirectionIndicator('totalTasks')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('completionRate')}
                  >
                    <div className="flex items-center gap-1">
                      Rate (%) {getSortDirectionIndicator('completionRate')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('streak')}
                  >
                    <div className="flex items-center gap-1">
                      Streak {getSortDirectionIndicator('streak')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading leaderboard...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedClients.map((client, index) => (
                    <TableRow key={client.id} className={index < 3 ? 'bg-primary/10' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {getMedal(index)}
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{client.totalScore}</TableCell>
                      <TableCell>{client.completedTasks}</TableCell>
                      <TableCell>{client.totalTasks}</TableCell>
                      <TableCell>{client.completionRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          {client.streak} days
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
