import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, Brain, BarChart3, Trophy } from 'lucide-react';
import { DailyBookPage } from '@/components/challenge/DailyBookPage';
import { AnalyticsDashboard } from '@/components/challenge/AnalyticsDashboard';
import { EmptyStateCard } from '@/components/door/EmptyStateCard';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { masterPlanProjectService, NapoleonHillProject } from '@/services/masterPlanProjectService';
import { MasterPlanProjectsList } from '@/components/master-plan-system/MasterPlanProjectsList';
import { MasterPlanJourney } from '@/components/master-plan-system/MasterPlanJourney';
import { MasterPlanDashboard } from '@/components/master-plan-system/MasterPlanDashboard';
import { MasterPlanKnowledgeBase } from '@/components/stack/master-plan/MasterPlanKnowledgeBase';
import { BackupManager } from '@/components/master-plan-system/BackupManager';
import { NotificationSettings } from '@/components/master-plan-system/NotificationSettings';
import { NewProjectModal } from '@/components/master-plan-system/NewProjectModal';
import { Button } from '@/components/ui/button';

const LearnPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabParam = searchParams.get('tab') || 'book';
  const [activeTab, setActiveTab] = useState(tabParam);

  // Master Plan state
  const [projects, setProjects] = useState<NapoleonHillProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<NapoleonHillProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPlanView, setMasterPlanView] = useState<'list' | 'journey' | 'dashboard' | 'knowledge'>('list');

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (activeTab === 'master-plan') {
      loadProjects();
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const loadProjects = async () => {
    setIsLoading(true);
    const allProjects = await masterPlanProjectService.getProjects();
    setProjects(allProjects);
    setIsLoading(false);
  };

  const handleProjectSelect = (project: NapoleonHillProject) => {
    setSelectedProject(project);
    setMasterPlanView('journey');
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
      return newProject.id;
    }
  };

  const isRo = language === 'ro';

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isRo ? 'Cursuri & Principii de Succes' : 'Courses & Success Principles'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRo 
                ? 'Studiază principiile succesului, creează proiecte și urmărește-ți progresul.' 
                : 'Study success principles, create projects and track your progress.'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="book" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{isRo ? 'Carte' : 'Book'}</span>
              </TabsTrigger>
              <TabsTrigger value="master-plan" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Master Plan</span>
              </TabsTrigger>
              <TabsTrigger value="stack" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">{isRo ? 'Coaching AI' : 'AI Coaching'}</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{isRo ? 'Progres' : 'Progress'}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Book Tab - Daily Reading */}
            <TabsContent value="book" className="mt-6">
              <DailyBookPage />
            </TabsContent>

            {/* Master Plan Tab */}
            <TabsContent value="master-plan" className="mt-6">
              <div className="space-y-4">
                {/* Sub-navigation for Master Plan */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={masterPlanView === 'list' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMasterPlanView('list')}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {isRo ? 'Proiecte' : 'Projects'}
                  </Button>
                  <Button 
                    variant={masterPlanView === 'journey' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMasterPlanView('journey')}
                    disabled={!selectedProject}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Journey
                  </Button>
                  <Button 
                    variant={masterPlanView === 'dashboard' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMasterPlanView('dashboard')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant={masterPlanView === 'knowledge' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMasterPlanView('knowledge')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Knowledge
                  </Button>
                </div>

                {masterPlanView === 'list' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-foreground">
                        {isRo ? 'Toate Proiectele' : 'All Projects'}
                      </h2>
                      <Button onClick={handleNewProject}>
                        <Target className="w-4 h-4 mr-2" />
                        {isRo ? 'Journey Nou' : 'New Journey'}
                      </Button>
                    </div>
                    <MasterPlanProjectsList
                      projects={projects}
                      isLoading={isLoading}
                      onProjectSelect={handleProjectSelect}
                      onRefresh={loadProjects}
                    />
                  </div>
                )}

                {masterPlanView === 'journey' && (
                  selectedProject ? (
                    <MasterPlanJourney
                      project={selectedProject}
                      onProjectUpdate={loadProjects}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {isRo ? 'Selectează un proiect pentru a continua journey-ul' : 'Select a project to continue the journey'}
                    </div>
                  )
                )}

                {masterPlanView === 'dashboard' && <MasterPlanDashboard />}

                {masterPlanView === 'knowledge' && (
                  <div className="space-y-6">
                    <BackupManager />
                    <NotificationSettings />
                    <MasterPlanKnowledgeBase />
                  </div>
                )}
              </div>

              <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => {
                  setIsNewProjectModalOpen(false);
                  setMasterPlanView('journey');
                }}
                onProjectCreated={handleProjectCreated}
              />
            </TabsContent>

            {/* AI Coaching Stack Tab */}
            <TabsContent value="stack" className="mt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isRo 
                    ? 'Folosește stack-urile AI pentru coaching personalizat bazat pe principiile succesului.'
                    : 'Use AI stacks for personalized coaching based on success principles.'}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <a href="/stack?type=napoleon-hill" className="block">
                    <div className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Success Principles</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRo 
                          ? 'Călătorie completă prin cele 13 principii ale succesului cu coaching AI'
                          : 'Complete journey through the 13 success principles with AI coaching'}
                      </p>
                    </div>
                  </a>
                  <a href="/stack?type=napoleon-hill-quick" className="block">
                    <div className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Quick Stack</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRo 
                          ? 'Sesiune rapidă pe un principiu specific'
                          : 'Quick session on a specific principle'}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </TabsContent>
            
            {/* Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <div className="space-y-6">
                {user ? (
                  <>
                    <AnalyticsDashboard />
                    <Leaderboard />
                  </>
                ) : (
                  <EmptyStateCard
                    icon={BarChart3}
                    title={isRo ? 'Autentificare Necesară' : 'Login Required'}
                    description={isRo 
                      ? 'Te rugăm să te autentifici pentru a-ți urmări progresul.' 
                      : 'Please login to track your progress.'}
                    actionLabel={isRo ? 'Autentificare' : 'Login'}
                    onAction={() => window.location.href = '/auth'}
                    emoji="🔐"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;
