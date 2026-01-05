import React from 'react';
import { Layout } from '@/components/Layout';
import { WorkoutStep } from '@/components/daily-flow/WorkoutStep';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyWorkoutPlanner } from '@/components/fitness/WeeklyWorkoutPlanner';
import { WorkoutTemplateLibrary } from '@/components/fitness/WorkoutTemplateLibrary';
import { Dumbbell, Calendar, Layers } from 'lucide-react';

const Workout = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'today';

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleTabChange = (value: string) => {
    if (value === 'today') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">💪 Corp</h1>
          <p className="text-muted-foreground mt-1">Antrenamente și program săptămânal</p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Antrenament Azi
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Program Săptămânal
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Template-uri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <WorkoutStep onComplete={handleComplete} />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyWorkoutPlanner />
          </TabsContent>

          <TabsContent value="templates">
            <WorkoutTemplateLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Workout;
