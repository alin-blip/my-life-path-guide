import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Plus, Pencil, Trash2, UserCheck, LockIcon, UnlockIcon, UserPlus, Shield, ShieldCheck, Activity, Brain, BarChart3, Briefcase, Wrench, Users, Clock, Target, Flame } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminClientService, AdminClient } from '@/services/adminClientService';
import { ClientDoorViewer } from './ClientDoorViewer';
import { ClientProgressChart } from './ClientProgressChart';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  duration: string;
  url: string;
  embedUrl: string;
  isLocked?: boolean;
  purchaseUrl?: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Fundamentals of Body Health',
    description: 'Learn the basics of maintaining a healthy body through nutrition and exercise.',
    category: 'body',
    author: 'Dr. Jane Smith',
    duration: '6 weeks',
    url: 'https://example.com/course/body-health',
    embedUrl: 'https://app.pluux.io/body-health-course',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/body-health'
  },
  {
    id: '2',
    title: 'Mindfulness and Being Present',
    description: 'Discover techniques to enhance your sense of being and mindfulness in daily life.',
    category: 'being',
    author: 'Michael Chen',
    duration: '4 weeks',
    url: 'https://example.com/course/mindfulness',
    embedUrl: 'https://app.pluux.io/mindfulness-course',
    isLocked: false
  },
  {
    id: '3',
    title: 'Work-Life Balance Mastery',
    description: 'Strategies to achieve harmony between personal and professional responsibilities.',
    category: 'balance',
    author: 'Sarah Johnson',
    duration: '5 weeks',
    url: 'https://example.com/course/balance',
    embedUrl: 'https://app.pluux.io/balance-mastery',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/balance-mastery'
  },
  {
    id: '4',
    title: 'Business Growth Strategies',
    description: 'Learn effective approaches to scale your business and increase profitability.',
    category: 'business',
    author: 'Robert Williams',
    duration: '8 weeks',
    url: 'https://example.com/course/business-growth',
    embedUrl: 'https://app.pluux.io/business-growth',
    isLocked: false
  },
  {
    id: '5',
    title: 'Physical Training Fundamentals',
    description: 'Build strength and endurance with proven training methodologies.',
    category: 'body',
    author: 'Alex Fitness',
    duration: '10 weeks',
    url: 'https://example.com/course/training',
    embedUrl: 'https://app.pluux.io/physical-training',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/physical-training'
  },
];

export const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [courses] = useState<Course[]>(mockCourses);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showCourseAccess, setShowCourseAccess] = useState(false);
  const [showToolsAccess, setShowToolsAccess] = useState(false);
  const [showSectionAccess, setShowSectionAccess] = useState(false);
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  const [toolsAccess, setToolsAccess] = useState({
    analytics: false,
    scheduler: false,
    reporting: false,
    notifications: false,
    templates: false
  });
  
  const [sectionAccess, setSectionAccess] = useState({
    stack: true,
    chat: true,
    core: true,
    door: true,
    game: true,
    notes: true,
    library: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await adminClientService.fetchAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca datele clienților",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectClient = (client: AdminClient) => {
    setSelectedClient(client);
    setEditMode(false);
    setClientName(client.display_name || '');
    setClientEmail(client.email);
  };
  
  const handleEditClient = () => {
    setEditMode(true);
  };
  
  const handleSaveClient = () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedClient) {
      const updatedClients = clients.map(client => 
        client.id === selectedClient.id 
          ? { ...client, display_name: clientName, email: clientEmail }
          : client
      );
      
      setClients(updatedClients);
      setSelectedClient({
        ...selectedClient,
        display_name: clientName,
        email: clientEmail
      });
      
      toast({
        title: "Client actualizat",
        description: `${clientName} a fost actualizat cu succes.`,
      });
    } else {
      // Note: Real client creation would need to be implemented via Supabase auth
      toast({
        title: "Funcționalitate indisponibilă",
        description: "Crearea de clienți noi se face prin înregistrare.",
        variant: "destructive",
      });
    }
    
    setEditMode(false);
    setShowAddClient(false);
  };
  
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    
    // Note: Real client deletion would need admin controls and is usually not allowed
    toast({
      title: "Funcționalitate restricționată",
      description: "Ștergerea clienților nu este permisă din motive de securitate.",
      variant: "destructive",
    });
  };
  
  const handleAddNewClient = () => {
    setSelectedClient(null);
    setClientName('');
    setClientEmail('');
    setShowAddClient(true);
    setEditMode(true);
  };
  
  const handleCancelEdit = () => {
    if (selectedClient) {
      setClientName(selectedClient.display_name || '');
      setClientEmail(selectedClient.email);
    } else {
      setClientName('');
      setClientEmail('');
    }
    
    setEditMode(false);
    setShowAddClient(false);
  };
  
  const handleToggleCourseAccess = () => {
    setShowCourseAccess(!showCourseAccess);
  };
  
  const handleToggleCourseUnlock = (courseId: string) => {
    // Note: Course access would be managed through a separate system
    toast({
      title: "Funcționalitate în dezvoltare",
      description: "Managementul accesului la cursuri va fi implementat în curând.",
    });
  };
  
  // Note: Legacy functions removed - replaced with Door data integration
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Clients</CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleAddNewClient}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
            <CardDescription>
              Explorează clienții și activitatea lor Door în timp real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clients.length > 0 ? (
                clients.map(client => (
                  <div 
                    key={client.id}
                    className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${
                      selectedClient?.id === client.id 
                        ? 'bg-muted/60 border border-primary/20' 
                        : 'hover:bg-muted/40'
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.display_name || client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Streak: {client.doorData.currentStreak} zile • 
                        Rate: {client.doorData.completionRate.toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={client.doorData.currentStreak > 0 ? "default" : "secondary"}>
                        <Flame className="h-3 w-3 mr-1" />
                        {client.doorData.currentStreak}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {client.doorData.totalTasks} tasks
                      </Badge>
                    </div>
                  </div>
                ))
              ) : loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  Se încarcă clienții...
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Nu s-au găsit clienți
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        {showAddClient ? (
          <Card>
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
              <CardDescription>
                Create a new client profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input 
                    id="client-name" 
                    placeholder="Enter client name" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client-email">Email Address</Label>
                  <Input 
                    id="client-email" 
                    type="email"
                    placeholder="Enter client email" 
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveClient}>Add Client</Button>
            </CardFooter>
          </Card>
        ) : selectedClient ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
              <TabsTrigger value="door">Door Lists</TabsTrigger>
              <TabsTrigger value="progress">Progres & Statistici</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedClient.display_name || selectedClient.email}
                  </CardTitle>
                  <CardDescription>
                    Client înregistrat pe {new Date(selectedClient.created_at).toLocaleDateString('ro-RO')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{selectedClient.doorData.totalTasks}</p>
                      <p className="text-sm text-muted-foreground">Total task-uri</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Activity className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{selectedClient.doorData.completedTasks}</p>
                      <p className="text-sm text-muted-foreground">Completate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{selectedClient.doorData.currentStreak}</p>
                      <p className="text-sm text-muted-foreground">Zile consecutive</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">{selectedClient.doorData.completionRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Rata de completare</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Informații client</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{selectedClient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ultima activitate:</span>
                          <span>{selectedClient.doorData.lastActivity || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ultima logare:</span>
                          <span>
                            {selectedClient.last_sign_in_at 
                              ? new Date(selectedClient.last_sign_in_at).toLocaleDateString('ro-RO')
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Status activitate</h4>
                      <div className="space-y-2">
                        <Badge 
                          variant={selectedClient.doorData.currentStreak > 0 ? "default" : "secondary"}
                          className="w-full justify-center py-2"
                        >
                          {selectedClient.doorData.currentStreak > 0 ? 'Activ' : 'Inactiv'}
                        </Badge>
                        <Badge 
                          variant={selectedClient.doorData.completionRate > 50 ? "default" : "outline"}
                          className="w-full justify-center py-2"
                        >
                          Performanță: {selectedClient.doorData.completionRate > 75 ? 'Excelentă' : 
                                      selectedClient.doorData.completionRate > 50 ? 'Bună' : 'Scăzută'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="door">
              <ClientDoorViewer 
                userId={selectedClient.id} 
                clientName={selectedClient.display_name || selectedClient.email} 
              />
            </TabsContent>
            
            <TabsContent value="progress">
              <ClientProgressChart 
                userId={selectedClient.id} 
                clientName={selectedClient.display_name || selectedClient.email} 
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">Client Explorer cu Door Data</h3>
              <p className="text-muted-foreground mb-4">Selectați un client pentru a vedea activitatea Door și statisticile de progres.</p>
              <div className="flex justify-center">
                <Button onClick={loadClients} variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Reîmprospătează clienții
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
