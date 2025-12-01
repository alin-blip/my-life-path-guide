import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Upload, Crown, BarChart3 } from "lucide-react";
import { napoleonHillProjectService, NapoleonHillProject } from '@/services/napoleonHillProjectService';
import { NapoleonHillProjectsList } from '@/components/napoleon-hill-system/NapoleonHillProjectsList';
import { NapoleonHillJourney } from '@/components/napoleon-hill-system/NapoleonHillJourney';
import { NapoleonHillDashboard } from '@/components/napoleon-hill-system/NapoleonHillDashboard';
import { NapoleonHillKnowledgeBase } from '@/components/stack/napoleon-hill/NapoleonHillKnowledgeBase';
import { NotificationSettings } from '@/components/napoleon-hill-system/NotificationSettings';
import { NewProjectModal } from '@/components/napoleon-hill-system/NewProjectModal';
import { Button } from '@/components/ui/button';

export default function NapoleonHillSystem() {
  const [activeTab, setActiveTab] = useState<string>("projects");
  const [projects, setProjects] = useState<NapoleonHillProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<NapoleonHillProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const allProjects = await napoleonHillProjectService.getProjects();
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
    const newProject = await napoleonHillProjectService.createProject(projectData);
    if (newProject) {
      await loadProjects();
      setSelectedProject(newProject);
      setActiveTab("journey");
      setIsNewProjectModalOpen(false);
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
                Sistemul Napoleon Hill
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
              <NapoleonHillDashboard />
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
                
                <NapoleonHillProjectsList
                  projects={projects}
                  isLoading={isLoading}
                  onProjectSelect={handleProjectSelect}
                  onRefresh={loadProjects}
                />
              </div>
            </TabsContent>

            <TabsContent value="journey" className="mt-6">
              {selectedProject ? (
                <NapoleonHillJourney
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
                <NotificationSettings />
                <NapoleonHillKnowledgeBase />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </Layout>
  );
}
