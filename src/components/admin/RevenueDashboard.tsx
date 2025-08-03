
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for revenue data
interface RevenueData {
  id: string;
  course: string;
  author: string;
  sales: number;
  totalRevenue: number;
  platformShare: number;
  authorShare: number;
  period: string;
}

// Mock data for revenue
const mockRevenueData: RevenueData[] = [
  {
    id: '1',
    course: 'Mindfulness pentru antreprenori ocupați',
    author: 'Maria Popescu',
    sales: 24,
    totalRevenue: 3576,
    platformShare: 1788,
    authorShare: 1788,
    period: 'Octombrie 2023'
  },
  {
    id: '2',
    course: 'Fitness pentru birou: 10 minute zilnic',
    author: 'Alexandru Ionescu',
    sales: 43,
    totalRevenue: 4257,
    platformShare: 2128.5,
    authorShare: 2128.5,
    period: 'Octombrie 2023'
  },
  {
    id: '3',
    course: 'Comunicare eficientă cu echipa',
    author: 'Elena Mihai',
    sales: 12,
    totalRevenue: 2388,
    platformShare: 1194,
    authorShare: 1194,
    period: 'Octombrie 2023'
  },
  {
    id: '4',
    course: 'Mindfulness pentru antreprenori ocupați',
    author: 'Maria Popescu',
    sales: 18,
    totalRevenue: 2682,
    platformShare: 1341,
    authorShare: 1341,
    period: 'Septembrie 2023'
  },
  {
    id: '5',
    course: 'Fitness pentru birou: 10 minute zilnic',
    author: 'Alexandru Ionescu',
    sales: 32,
    totalRevenue: 3168,
    platformShare: 1584,
    authorShare: 1584,
    period: 'Septembrie 2023'
  }
];

// Chart data for monthly revenue
const monthlyRevenueData = [
  { name: 'Ian', total: 1800, platform: 900, authors: 900 },
  { name: 'Feb', total: 2200, platform: 1100, authors: 1100 },
  { name: 'Mar', total: 2800, platform: 1400, authors: 1400 },
  { name: 'Apr', total: 3500, platform: 1750, authors: 1750 },
  { name: 'Mai', total: 4200, platform: 2100, authors: 2100 },
  { name: 'Iun', total: 4800, platform: 2400, authors: 2400 },
  { name: 'Iul', total: 5500, platform: 2750, authors: 2750 },
  { name: 'Aug', total: 6700, platform: 3350, authors: 3350 },
  { name: 'Sep', total: 7900, platform: 3950, authors: 3950 },
  { name: 'Oct', total: 10221, platform: 5110.5, authors: 5110.5 },
  { name: 'Nov', total: 0, platform: 0, authors: 0 },
  { name: 'Dec', total: 0, platform: 0, authors: 0 }
];

export const RevenueDashboard: React.FC = () => {
  const [period, setPeriod] = useState('current');
  
  // Filter revenue data based on selected period
  const filteredRevenueData = mockRevenueData.filter(item => 
    period === 'current' ? item.period === 'Octombrie 2023' : true
  );
  
  // Calculate totals
  const totalSales = filteredRevenueData.reduce((acc, item) => acc + item.sales, 0);
  const totalRevenue = filteredRevenueData.reduce((acc, item) => acc + item.totalRevenue, 0);
  const totalPlatformShare = filteredRevenueData.reduce((acc, item) => acc + item.platformShare, 0);
  const totalAuthorShare = filteredRevenueData.reduce((acc, item) => acc + item.authorShare, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Revenue Dashboard</h3>
        <Tabs defaultValue="current" onValueChange={setPeriod} className="bg-gray-800 rounded-lg p-1">
          <TabsList className="bg-gray-700">
            <TabsTrigger value="current" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Luna curentă
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Toate datele
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Vânzări totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSales}</div>
            <p className="text-xs text-gray-500">cursuri vândute</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Venituri totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalRevenue} LEI</div>
            <p className="text-xs text-gray-500">din toate cursurile</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Partea platformei</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPlatformShare} LEI</div>
            <p className="text-xs text-gray-500">50% din veniturile totale</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Partea autorilor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAuthorShare} LEI</div>
            <p className="text-xs text-gray-500">50% din veniturile totale</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Revenue Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Venituri lunare</CardTitle>
          <CardDescription className="text-gray-400">Evoluția veniturilor totale pe parcursul anului</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value: number) => [`${value} LEI`, '']}
                  labelFormatter={(label) => `Luna: ${label}`}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="total" name="Venituri totale" fill="#8884d8" />
                <Bar dataKey="platform" name="Partea platformei" fill="#82ca9d" />
                <Bar dataKey="authors" name="Partea autorilor" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Revenue Details Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detalii venituri pe cursuri</CardTitle>
          <CardDescription className="text-gray-400">
            Venituri detaliate pentru fiecare curs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow>
                <TableHead className="text-gray-300">Curs</TableHead>
                <TableHead className="text-gray-300">Autor</TableHead>
                <TableHead className="text-gray-300 text-right">Vânzări</TableHead>
                <TableHead className="text-gray-300 text-right">Venituri totale</TableHead>
                <TableHead className="text-gray-300 text-right">Partea platformei</TableHead>
                <TableHead className="text-gray-300 text-right">Partea autorului</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevenueData.map((item) => (
                <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700">
                  <TableCell className="font-medium text-white">{item.course}</TableCell>
                  <TableCell className="text-gray-300">{item.author}</TableCell>
                  <TableCell className="text-gray-300 text-right">{item.sales}</TableCell>
                  <TableCell className="text-gray-300 text-right">{item.totalRevenue} LEI</TableCell>
                  <TableCell className="text-gray-300 text-right">{item.platformShare} LEI</TableCell>
                  <TableCell className="text-gray-300 text-right">{item.authorShare} LEI</TableCell>
                </TableRow>
              ))}
              
              {filteredRevenueData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Nu există date pentru perioada selectată
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
