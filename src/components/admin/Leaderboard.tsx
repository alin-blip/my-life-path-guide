
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Medal, Search, ArrowUpDown, Calendar } from 'lucide-react';

// Mock data for the leaderboard
const initialClients = [
  { id: 1, name: "John Doe", score: 89, coreScore: 45, dailyFourScore: 35, weeklyTwoScore: 9, streak: 7 },
  { id: 2, name: "Sarah Smith", score: 124, coreScore: 67, dailyFourScore: 48, weeklyTwoScore: 9, streak: 14 },
  { id: 3, name: "Mike Johnson", score: 73, coreScore: 29, dailyFourScore: 36, weeklyTwoScore: 8, streak: 4 },
  { id: 4, name: "Emma Williams", score: 112, coreScore: 56, dailyFourScore: 42, weeklyTwoScore: 14, streak: 10 },
  { id: 5, name: "Alex Brown", score: 95, coreScore: 38, dailyFourScore: 47, weeklyTwoScore: 10, streak: 8 },
];

export const Leaderboard: React.FC = () => {
  const [clients, setClients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  
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
  const requestSort = (key) => {
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>This Week</span>
              </Button>
              <Button variant="outline" size="sm">
                Export
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
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('score')}
                  >
                    <div className="flex items-center gap-1">
                      Total Score {getSortDirectionIndicator('score')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('coreScore')}
                  >
                    <div className="flex items-center gap-1">
                      Core {getSortDirectionIndicator('coreScore')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('dailyFourScore')}
                  >
                    <div className="flex items-center gap-1">
                      Daily Four {getSortDirectionIndicator('dailyFourScore')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('weeklyTwoScore')}
                  >
                    <div className="flex items-center gap-1">
                      Weekly Two {getSortDirectionIndicator('weeklyTwoScore')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
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
                {sortedClients.map((client, index) => (
                  <TableRow key={client.id} className={index < 3 ? 'bg-blue-900/50 text-white' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {getMedal(index)}
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell className="font-semibold">{client.score}</TableCell>
                    <TableCell>{client.coreScore}</TableCell>
                    <TableCell>{client.dailyFourScore}</TableCell>
                    <TableCell>{client.weeklyTwoScore}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        {client.streak} days
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
