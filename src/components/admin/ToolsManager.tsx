
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Calculator, 
  Calendar, 
  FileSpreadsheet, 
  MessageSquare, 
  Mail, 
  Camera, 
  FileText, 
  Database,
  BarChart3,
  Clock
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  status: 'active' | 'inactive';
}

export const ToolsManager: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: 'Course Calculator',
      description: 'Calculate completion times and estimates for courses',
      icon: Calculator,
      category: 'analytics',
      status: 'active'
    },
    {
      id: '2',
      name: 'Scheduler',
      description: 'Schedule client sessions and appointments',
      icon: Calendar,
      category: 'planning',
      status: 'active'
    },
    {
      id: '3',
      name: 'Data Explorer',
      description: 'Analyze client data and visualize progress',
      icon: FileSpreadsheet,
      category: 'analytics',
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Client Messenger',
      description: 'Send direct messages to clients',
      icon: MessageSquare,
      category: 'communication',
      status: 'active'
    },
    {
      id: '5',
      name: 'Email Campaign',
      description: 'Create and send email campaigns to clients',
      icon: Mail,
      category: 'communication',
      status: 'inactive'
    },
    {
      id: '6',
      name: 'Screenshot Tool',
      description: 'Capture and annotate screenshots for training materials',
      icon: Camera,
      category: 'content',
      status: 'active'
    },
    {
      id: '7',
      name: 'Document Generator',
      description: 'Create custom PDFs and documents for clients',
      icon: FileText,
      category: 'content',
      status: 'active'
    },
    {
      id: '8',
      name: 'Data Import/Export',
      description: 'Import or export client data and course information',
      icon: Database,
      category: 'utilities',
      status: 'inactive'
    },
    {
      id: '9',
      name: 'Progress Charts',
      description: 'Visualize client progress through interactive charts',
      icon: BarChart3,
      category: 'analytics',
      status: 'active'
    },
    {
      id: '10',
      name: 'Time Tracker',
      description: 'Track time spent on client projects and courses',
      icon: Clock,
      category: 'utilities',
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleToggleTool = (id: string) => {
    setTools(tools.map(tool => 
      tool.id === id 
        ? { ...tool, status: tool.status === 'active' ? 'inactive' : 'active' } 
        : tool
    ));

    const tool = tools.find(t => t.id === id);
    if (tool) {
      toast({
        title: `${tool.name} ${tool.status === 'active' ? t('deactivate') : t('activate')}`,
        description: `${t('toolsManagement')} ${tool.status === 'active' ? t('deactivate') : t('activate')} ${t('completed').toLowerCase()}.`,
      });
    }
  };

  const handleLaunchTool = (tool: Tool) => {
    toast({
      title: `${t('launching')} ${tool.name}`,
      description: "Tool interface would open here in a real application.",
    });
  };

  const filteredTools = tools
    .filter(tool => tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(tool => selectedCategory === 'all' || tool.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(tools.map(tool => tool.category)))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('toolsManagement')}</h2>
        <Button variant="outline">
          {t('addNewTool')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Input
            placeholder={t('searchTools')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
          <TabsList className="flex w-full h-auto flex-wrap">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.length > 0 ? (
          filteredTools.map(tool => (
            <Card key={tool.id} className={`overflow-hidden ${tool.status === 'inactive' ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${getToolCategoryColor(tool.category)}`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${tool.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {tool.status === 'active' ? t('active') : t('inactive')}
                  </div>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-3 flex justify-between border-t">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleTool(tool.id)}
                >
                  {tool.status === 'active' ? t('deactivate') : t('activate')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleLaunchTool(tool)}
                  disabled={tool.status === 'inactive'}
                >
                  {t('launchTool')}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noToolsFound')}</h3>
            <p className="text-muted-foreground mb-4">{t('tryAdjusting')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get background color based on category
function getToolCategoryColor(category: string): string {
  switch (category) {
    case 'analytics':
      return 'bg-blue-500';
    case 'planning':
      return 'bg-purple-500';
    case 'communication':
      return 'bg-green-500';
    case 'content':
      return 'bg-orange-500';
    case 'utilities':
      return 'bg-slate-500';
    default:
      return 'bg-gray-500';
  }
}
