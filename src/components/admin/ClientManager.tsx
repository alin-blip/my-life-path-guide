import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Plus, Pencil, Trash2, UserCheck, LockIcon, UnlockIcon, UserPlus, Shield, ShieldCheck, Activity, Brain, BarChart3, Briefcase, Wrench } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";

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

interface Client {
  id: string;
  name: string;
  email: string;
  unlockedCourses: string[];
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    unlockedCourses: ['2', '4']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    unlockedCourses: ['1', '2', '3', '4', '5']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    unlockedCourses: []
  }
];

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
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [courses] = useState<Course[]>(mockCourses);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
  
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setEditMode(false);
    setClientName(client.name);
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
          ? { ...client, name: clientName, email: clientEmail }
          : client
      );
      
      setClients(updatedClients);
      setSelectedClient({
        ...selectedClient,
        name: clientName,
        email: clientEmail
      });
      
      toast({
        title: "Client updated",
        description: `${clientName} has been updated successfully.`,
      });
    } else {
      const newClient: Client = {
        id: (clients.length + 1).toString(),
        name: clientName,
        email: clientEmail,
        unlockedCourses: []
      };
      
      setClients([...clients, newClient]);
      setSelectedClient(newClient);
      
      toast({
        title: "Client added",
        description: `${clientName} has been added successfully.`,
      });
    }
    
    setEditMode(false);
    setShowAddClient(false);
  };
  
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    
    const updatedClients = clients.filter(client => client.id !== selectedClient.id);
    setClients(updatedClients);
    setSelectedClient(null);
    
    toast({
      title: "Client deleted",
      description: `${selectedClient.name} has been removed.`,
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
      setClientName(selectedClient.name);
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
    if (!selectedClient) return;
    
    const hasAccess = selectedClient.unlockedCourses.includes(courseId);
    let updatedUnlockedCourses: string[];
    
    if (hasAccess) {
      updatedUnlockedCourses = selectedClient.unlockedCourses.filter(id => id !== courseId);
    } else {
      updatedUnlockedCourses = [...selectedClient.unlockedCourses, courseId];
    }
    
    const updatedClient = {
      ...selectedClient,
      unlockedCourses: updatedUnlockedCourses
    };
    
    const updatedClients = clients.map(client => 
      client.id === selectedClient.id ? updatedClient : client
    );
    
    setClients(updatedClients);
    setSelectedClient(updatedClient);
    
    const course = courses.find(c => c.id === courseId);
    
    toast({
      title: hasAccess ? "Access removed" : "Access granted",
      description: `${selectedClient.name} can ${hasAccess ? 'no longer access' : 'now access'} "${course?.title}".`,
    });
  };
  
  const handleToggleAllCourses = (unlockAll: boolean) => {
    if (!selectedClient) return;
    
    const allCourseIds = courses.map(course => course.id);
    
    const updatedClient = {
      ...selectedClient,
      unlockedCourses: unlockAll ? allCourseIds : []
    };
    
    const updatedClients = clients.map(client => 
      client.id === selectedClient.id ? updatedClient : client
    );
    
    setClients(updatedClients);
    setSelectedClient(updatedClient);
    
    toast({
      title: unlockAll ? "All courses unlocked" : "All courses locked",
      description: `${selectedClient.name} now ${unlockAll ? 'has access to all' : 'cannot access any'} courses.`,
    });
  };
  
  const handleToggleCategoryAccess = (category: string, unlock: boolean) => {
    if (!selectedClient) return;
    
    const categoryCourseIds = courses
      .filter(course => course.category === category)
      .map(course => course.id);
    
    let updatedUnlockedCourses = [...selectedClient.unlockedCourses];
    
    if (unlock) {
      categoryCourseIds.forEach(id => {
        if (!updatedUnlockedCourses.includes(id)) {
          updatedUnlockedCourses.push(id);
        }
      });
    } else {
      updatedUnlockedCourses = updatedUnlockedCourses.filter(
        id => !categoryCourseIds.includes(id)
      );
    }
    
    const updatedClient = {
      ...selectedClient,
      unlockedCourses: updatedUnlockedCourses
    };
    
    const updatedClients = clients.map(client => 
      client.id === selectedClient.id ? updatedClient : client
    );
    
    setClients(updatedClients);
    setSelectedClient(updatedClient);
    
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    
    toast({
      title: unlock ? `${categoryName} courses unlocked` : `${categoryName} courses locked`,
      description: `${selectedClient.name} now ${unlock ? 'has access to' : 'no longer has access to'} all ${category} courses.`,
    });
  };
  
  const handleToggleToolsAccess = () => {
    setShowToolsAccess(!showToolsAccess);
  };
  
  const handleToggleTool = (tool: string) => {
    if (!selectedClient) return;
    
    const updatedToolsAccess = { ...toolsAccess };
    updatedToolsAccess[tool as keyof typeof toolsAccess] = !updatedToolsAccess[tool as keyof typeof toolsAccess];
    setToolsAccess(updatedToolsAccess);
    
    toast({
      title: updatedToolsAccess[tool as keyof typeof toolsAccess] ? "Tool access granted" : "Tool access revoked",
      description: `${selectedClient.name} ${updatedToolsAccess[tool as keyof typeof toolsAccess] ? 'can now use' : 'can no longer use'} the ${tool} tool.`,
    });
  };
  
  const handleToggleAllTools = (grantAccess: boolean) => {
    if (!selectedClient) return;
    
    const updatedToolsAccess = {
      analytics: grantAccess,
      scheduler: grantAccess,
      reporting: grantAccess,
      notifications: grantAccess,
      templates: grantAccess
    };
    
    setToolsAccess(updatedToolsAccess);
    
    toast({
      title: grantAccess ? "All tools access granted" : "All tools access revoked",
      description: `${selectedClient.name} ${grantAccess ? 'can now use all' : 'cannot use any'} tools.`,
    });
  };
  
  const handleToggleSectionAccess = () => {
    setShowSectionAccess(!showSectionAccess);
  };
  
  const handleToggleSection = (section: string) => {
    if (!selectedClient) return;
    
    const updatedSectionAccess = { ...sectionAccess };
    updatedSectionAccess[section as keyof typeof sectionAccess] = !updatedSectionAccess[section as keyof typeof sectionAccess];
    setSectionAccess(updatedSectionAccess);
    
    toast({
      title: updatedSectionAccess[section as keyof typeof sectionAccess] ? "Section access granted" : "Section access blocked",
      description: `${selectedClient.name} ${updatedSectionAccess[section as keyof typeof sectionAccess] ? 'can now access' : 'cannot access'} the ${section} section.`,
    });
  };
  
  const handleToggleAllSections = (grantAccess: boolean) => {
    if (!selectedClient) return;
    
    const updatedSectionAccess = {
      stack: grantAccess,
      chat: grantAccess,
      core: grantAccess,
      door: grantAccess,
      game: grantAccess,
      notes: grantAccess,
      library: grantAccess
    };
    
    setSectionAccess(updatedSectionAccess);
    
    toast({
      title: grantAccess ? "All sections unlocked" : "All sections blocked",
      description: `${selectedClient.name} ${grantAccess ? 'can now access all' : 'cannot access any'} sections.`,
    });
  };
  
  const isCategoryFullyUnlocked = (category: string): boolean => {
    if (!selectedClient) return false;
    
    const categoryCourseIds = courses
      .filter(course => course.category === category)
      .map(course => course.id);
    
    return categoryCourseIds.every(id => 
      selectedClient.unlockedCourses.includes(id)
    );
  };
  
  const getCategoryIcon = (category: string) => {
    const isUnlocked = isCategoryFullyUnlocked(category);
    const iconColor = isUnlocked ? "text-green-500" : "text-red-500";
    
    switch (category) {
      case 'body':
        return <Activity className={`h-4 w-4 ${iconColor}`} />;
      case 'being':
        return <Brain className={`h-4 w-4 ${iconColor}`} />;
      case 'balance':
        return <BarChart3 className={`h-4 w-4 ${iconColor}`} />;
      case 'business':
        return <Briefcase className={`h-4 w-4 ${iconColor}`} />;
      default:
        return <Activity className={`h-4 w-4 ${iconColor}`} />;
    }
  };
  
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
              Manage your client profiles and course access.
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
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Badge>
                      {client.unlockedCourses.length} courses
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No clients found
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editMode ? 'Edit Client' : 'Client Details'}</CardTitle>
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveClient}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleEditClient}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={handleDeleteClient}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {editMode 
                    ? 'Update client information' 
                    : 'View and manage client details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editMode ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Client Name</Label>
                        <Input 
                          id="edit-name" 
                          placeholder="Enter client name" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email Address</Label>
                        <Input 
                          id="edit-email" 
                          type="email"
                          placeholder="Enter client email" 
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Client Name</p>
                          <p>{selectedClient.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                          <p>{selectedClient.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Unlocked Courses</p>
                          <p>{selectedClient.unlockedCourses.length}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <div className="flex flex-col space-y-2">
                          <Label>Bulk Access Control</Label>
                          <ToggleGroup type="single" className="justify-start">
                            <ToggleGroupItem value="unlock-all" onClick={() => handleToggleAllCourses(true)}>
                              <div className="flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span>Unlock All</span>
                              </div>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="lock-all" onClick={() => handleToggleAllCourses(false)}>
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4 text-amber-500" />
                                <span>Lock All</span>
                              </div>
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                        
                        <div className="flex flex-col space-y-2 mt-4">
                          <Label>Category Access Control</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['body', 'being', 'balance', 'business'].map(category => {
                              const isUnlocked = isCategoryFullyUnlocked(category);
                              const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                              
                              return (
                                <Button 
                                  key={category}
                                  variant={isUnlocked ? "default" : "outline"}
                                  size="sm"
                                  className="justify-start gap-2"
                                  onClick={() => handleToggleCategoryAccess(category, !isUnlocked)}
                                >
                                  {getCategoryIcon(category)}
                                  <span>{categoryName}</span>
                                  {isUnlocked ? (
                                    <LockIcon className="h-3.5 w-3.5 ml-auto" />
                                  ) : (
                                    <UnlockIcon className="h-3.5 w-3.5 ml-auto" />
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap space-x-2 gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleToggleCourseAccess}
                            className="flex items-center gap-1"
                          >
                            {showCourseAccess ? (
                              <>
                                <X className="h-4 w-4" />
                                Hide Course Access
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4" />
                                Manage Course Access
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleToggleToolsAccess}
                            className="flex items-center gap-1"
                          >
                            {showToolsAccess ? (
                              <>
                                <X className="h-4 w-4" />
                                Hide Tools Access
                              </>
                            ) : (
                              <>
                                <Wrench className="h-4 w-4" />
                                Manage Tools Access
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleToggleSectionAccess}
                            className="flex items-center gap-1"
                          >
                            {showSectionAccess ? (
                              <>
                                <X className="h-4 w-4" />
                                Hide Section Access
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4" />
                                Manage Section Access
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {showCourseAccess && !editMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Access Management</CardTitle>
                  <CardDescription>
                    Manage which courses {selectedClient.name} can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllCourses(true)}
                      className="flex items-center gap-1"
                    >
                      <UnlockIcon className="h-4 w-4" />
                      Unlock All Courses
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllCourses(false)}
                      className="flex items-center gap-1"
                    >
                      <LockIcon className="h-4 w-4" />
                      Lock All Courses
                    </Button>
                    
                    {['body', 'being', 'balance', 'business'].map(category => {
                      const isUnlocked = isCategoryFullyUnlocked(category);
                      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                      
                      return (
                        <Button 
                          key={category}
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleToggleCategoryAccess(category, !isUnlocked)}
                        >
                          {getCategoryIcon(category)}
                          {isUnlocked ? `Lock ${categoryName}` : `Unlock ${categoryName}`}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-4">
                    {courses.map(course => {
                      const hasAccess = selectedClient.unlockedCourses.includes(course.id);
                      
                      return (
                        <div 
                          key={course.id}
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{course.title}</p>
                              {course.isLocked && (
                                <Badge variant="outline" className={hasAccess ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}>
                                  {hasAccess ? "Unlocked" : "Locked"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {course.category.charAt(0).toUpperCase() + course.category.slice(1)} • {course.duration}
                            </p>
                          </div>
                          <Button
                            variant={hasAccess ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleCourseUnlock(course.id)}
                            className="flex items-center gap-1"
                          >
                            {hasAccess ? (
                              <>
                                <LockIcon className="h-4 w-4" />
                                Lock
                              </>
                            ) : (
                              <>
                                <UnlockIcon className="h-4 w-4" />
                                Unlock
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleToggleCourseAccess}
                  >
                    Done
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {showToolsAccess && !editMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Tools Access Management</CardTitle>
                  <CardDescription>
                    Manage which tools {selectedClient.name} can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllTools(true)}
                      className="flex items-center gap-1"
                    >
                      <UnlockIcon className="h-4 w-4" />
                      Grant All Tools Access
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllTools(false)}
                      className="flex items-center gap-1"
                    >
                      <LockIcon className="h-4 w-4" />
                      Revoke All Tools Access
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(toolsAccess).map(([tool, hasAccess]) => (
                      <div 
                        key={tool}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`tool-${tool}`}
                            checked={hasAccess}
                            onCheckedChange={() => handleToggleTool(tool)}
                          />
                          <label 
                            htmlFor={`tool-${tool}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {tool}
                          </label>
                        </div>
                        
                        <Badge 
                          variant={hasAccess ? "default" : "outline"}
                          className={hasAccess ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {hasAccess ? "Granted" : "No Access"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleToggleToolsAccess}
                  >
                    Done
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {showSectionAccess && !editMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Section Access Management</CardTitle>
                  <CardDescription>
                    Manage which sections {selectedClient.name} can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllSections(true)}
                      className="flex items-center gap-1"
                    >
                      <UnlockIcon className="h-4 w-4" />
                      Unlock All Sections
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleAllSections(false)}
                      className="flex items-center gap-1"
                    >
                      <LockIcon className="h-4 w-4" />
                      Block All Sections
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(sectionAccess).map(([section, hasAccess]) => (
                      <div 
                        key={section}
                        className={`flex items-center justify-between p-3 border rounded-md ${
                          hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`section-${section}`}
                            checked={hasAccess}
                            onCheckedChange={() => handleToggleSection(section)}
                          />
                          <label 
                            htmlFor={`section-${section}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize text-gray-900"
                          >
                            {section}
                          </label>
                        </div>
                        
                        <Badge 
                          variant={hasAccess ? "default" : "outline"}
                          className={hasAccess ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                        >
                          {hasAccess ? "Access Granted" : "Blocked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleToggleSectionAccess}
                  >
                    Done
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">Client Management</h3>
              <p className="text-muted-foreground mb-4">Select a client to view details or add a new client.</p>
              <Button onClick={handleAddNewClient}>Add New Client</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
