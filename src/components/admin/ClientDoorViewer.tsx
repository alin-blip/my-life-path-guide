import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminClientService } from '@/services/adminClientService';
import { CheckCircle, Circle, AlertCircle, Clock, Target, Users, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClientDoorViewerProps {
  userId: string;
  clientName: string;
}

export const ClientDoorViewer: React.FC<ClientDoorViewerProps> = ({ userId, clientName }) => {
  const [doorLists, setDoorLists] = useState<any>({ hotList: [], hitList: [], doList: [] });
  const [loading, setLoading] = useState(true);
  const [currentWeekKey, setCurrentWeekKey] = useState(adminClientService.getCurrentWeekKey());

  useEffect(() => {
    loadDoorData();
  }, [userId, currentWeekKey]);

  const loadDoorData = async () => {
    try {
      setLoading(true);
      const data = await adminClientService.fetchClientDoorLists(userId, currentWeekKey);
      setDoorLists(data);
    } catch (error) {
      console.error('Failed to load Door data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: number | null) => {
    switch (priority) {
      case 4: return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 3: return <Clock className="h-4 w-4 text-orange-500" />;
      case 2: return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 4: return 'Urgent & Important';
      case 3: return 'Urgent';
      case 2: return 'Important';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Door Lists pentru {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Door Lists - {clientName}
        </h3>
        <Badge variant="outline">Săptămâna {currentWeekKey}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hot List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              Hot List ({doorLists.hotList.length})
            </CardTitle>
            <CardDescription className="text-xs">Obiective principale</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {doorLists.hotList.length > 0 ? (
                  doorLists.hotList.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm">
                      {getPriorityIcon(item.priority)}
                      <div className="flex-1">
                        <p className="leading-tight">{item.title}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {getPriorityLabel(item.priority)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Niciun obiectiv în Hot List</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Hit List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Hit List ({doorLists.hitList.length})
            </CardTitle>
            <CardDescription className="text-xs">Task-uri programate</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {doorLists.hitList.length > 0 ? (
                  doorLists.hitList.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p className={`leading-tight ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {item.day_of_week && (
                            <Badge variant="outline" className="text-xs">{item.day_of_week}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getPriorityLabel(item.priority)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Niciun task în Hit List</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Do List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Do List ({doorLists.doList.length})
            </CardTitle>
            <CardDescription className="text-xs">Task-uri de executat</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {doorLists.doList.length > 0 ? (
                  doorLists.doList.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p className={`leading-tight ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {item.day_of_week && (
                            <Badge variant="outline" className="text-xs">{item.day_of_week}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getPriorityLabel(item.priority)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Niciun task în Do List</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};