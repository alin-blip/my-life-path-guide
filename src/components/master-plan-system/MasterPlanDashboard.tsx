import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { masterPlanProjectService, NapoleonHillProject } from '@/services/masterPlanProjectService';
import { CheckCircle, TrendingUp, Target, Clock, Award, Zap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export const MasterPlanDashboard: React.FC = () => {
  const [projects, setProjects] = useState<NapoleonHillProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const allProjects = await masterPlanProjectService.getProjects();
    setProjects(allProjects);
    setIsLoading(false);
  };

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  const totalPrinciples = projects.reduce((acc, p) => 
    acc + Object.keys(p.principle_answers).length, 0
  );
  
  const totalActions = projects.reduce((acc, p) => 
    acc + p.action_items.length, 0
  );
  
  const completedActions = projects.reduce((acc, p) => 
    acc + p.action_items.filter(a => a.completed).length, 0
  );

  const averageProgress = projects.length > 0
    ? projects.reduce((acc, p) => acc + (Object.keys(p.principle_answers).length / 14), 0) / projects.length * 100
    : 0;

  const completionRate = totalActions > 0 
    ? (completedActions / totalActions) * 100 
    : 0;

  // Recent activity
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Principle completion frequency
  const principleCompletions = Array(14).fill(0);
  projects.forEach(project => {
    Object.keys(project.principle_answers).forEach(principleNum => {
      principleCompletions[parseInt(principleNum) - 1]++;
    });
  });

  const mostCompletedPrinciple = principleCompletions.indexOf(Math.max(...principleCompletions)) + 1;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Proiecte Active</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{activeProjects.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedProjects.length} completate total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Principii Complete</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">{totalPrinciples}</div>
          <Progress value={averageProgress} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {averageProgress.toFixed(0)}% progres mediu
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Acțiuni Complete</span>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {completedActions}/{totalActions}
          </div>
          <Progress value={completionRate} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completionRate.toFixed(0)}% rată de completare
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Cel Mai Completat</span>
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-foreground">
            Principiul {mostCompletedPrinciple}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Completat de {Math.max(...principleCompletions)}x
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Activitate Recentă</h3>
        </div>

        <div className="space-y-3">
          {recentProjects.map((project) => {
            const progress = (Object.keys(project.principle_answers).length / 14) * 100;
            const daysAgo = differenceInDays(new Date(), new Date(project.updated_at));

            return (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{project.project_name}</h4>
                    {project.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {daysAgo === 0 ? 'Astăzi' : `${daysAgo} ${daysAgo === 1 ? 'zi' : 'zile'} în urmă`}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {Object.keys(project.principle_answers).length}/14
                    </p>
                    <p className="text-xs text-muted-foreground">principii</p>
                  </div>
                  
                  <div className="w-24">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            );
          })}

          {recentProjects.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nicio activitate încă. Începe primul tău journey!
            </p>
          )}
        </div>
      </Card>

      {/* Principles Heatmap */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Principii Populare</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {principleCompletions.map((count, index) => {
            const maxCount = Math.max(...principleCompletions);
            const intensity = maxCount > 0 ? (count / maxCount) : 0;
            
            return (
              <div
                key={index}
                className="aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: `rgba(41, 98, 255, ${0.1 + intensity * 0.9})`
                }}
              >
                <span className="text-xs font-bold text-foreground">{index + 1}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Frecvența completării pentru fiecare principiu
        </p>
      </Card>
    </div>
  );
};
