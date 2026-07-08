import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Upload, Crown, BarChart3 } from "lucide-react";
import { masterPlanProjectService, NapoleonHillProject } from '@/services/masterPlanProjectService';
import { MasterPlanProjectsList } from '@/components/master-plan-system/MasterPlanProjectsList';
import { MasterPlanJourney } from '@/components/master-plan-system/MasterPlanJourney';
import { MasterPlanDashboard } from '@/components/master-plan-system/MasterPlanDashboard';
import { MasterPlanKnowledgeBase } from '@/components/stack/master-plan/MasterPlanKnowledgeBase';
import { NotificationSettings } from '@/components/master-plan-system/NotificationSettings';
import { BackupManager } from '@/components/master-plan-system/BackupManager';
import { NewProjectModal } from '@/components/master-plan-system/NewProjectModal';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureLimitBanner } from '@/components/FeatureLimitBanner';
import { toast } from 'sonner';

export default function MasterPlanSystem() {
  const [activeTab, setActiveTab] = useState<string>("projects");
  const [projects, setProjects] = useState<NapoleonHillProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<NapoleonHillProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { status: masterPlanAccess, consume: consumeMasterPlan } = useFeatureAccess('master_plan');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const allProjects = await masterPlanProjectService.getProjects();
    setProjects(allProjects);
    setIsLoading(false);
  };

  const handleProjectSelect = (project: NapoleonHillProject) => {
    setSelectedProject(project);
    setActiveTab("journey");
  };

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleProjectCreated = async (projectData: {
    project_name: string;
    goal_description: string;
    goal_amount?: string;
    goal_deadline?: string;
  }) => {
    const newProject = await masterPlanProjectService.createProject(projectData);
    if (newProject) {
      await loadProjects();
      setSelectedProject(newProject);
      // Don't close modal yet - allow file uploads
      // Don't switch tab yet - will happen when modal closes
      return newProject.id;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Master Plan
              </h1>
            </div>
            <p className="text-muted-foreground">
              Călătoria completă prin cele 14 principii ale succesului - de la introspecție la implementare
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Proiecte
              </TabsTrigger>
              <TabsTrigger value="journey" className="flex items-center gap-2" disabled={!selectedProject}>
                <BookOpen className="w-4 h-4" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Knowledge
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <MasterPlanDashboard />
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-foreground">
                    Toate Proiectele
                  </h2>
                  <Button onClick={handleNewProject}>
                    <Target className="w-4 h-4 mr-2" />
                    Journey Nou
                  </Button>
                </div>
                
                <MasterPlanProjectsList
                  projects={projects}
                  isLoading={isLoading}
                  onProjectSelect={handleProjectSelect}
                  onRefresh={loadProjects}
                />
              </div>
            </TabsContent>

            <TabsContent value="journey" className="mt-6">
              {selectedProject ? (
                <MasterPlanJourney
                  project={selectedProject}
                  onProjectUpdate={loadProjects}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Selectează un proiect pentru a continua journey-ul
                </div>
              )}
            </TabsContent>

            <TabsContent value="knowledge" className="mt-6">
              <div className="space-y-6">
                <BackupManager />
                <NotificationSettings />
                <MasterPlanKnowledgeBase />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => {
            setIsNewProjectModalOpen(false);
            setActiveTab("journey");
          }}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </Layout>
  );
}
