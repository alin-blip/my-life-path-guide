import React, { useState, useEffect } from 'react';
import { ProgramGrid } from './ProgramGrid';
import { ProgramCardProps } from './ProgramCard';
import { Sparkles, Plus, BookOpen, Target, Brain, BarChart3, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { DailyBookPage } from '@/components/challenge/DailyBookPage';
import { AnalyticsDashboard } from '@/components/challenge/AnalyticsDashboard';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { EmptyStateCard } from '@/components/door/EmptyStateCard';
import { masterPlanProjectService, NapoleonHillProject } from '@/services/masterPlanProjectService';
import { MasterPlanProjectsList } from '@/components/master-plan-system/MasterPlanProjectsList';
import { MasterPlanJourney } from '@/components/master-plan-system/MasterPlanJourney';
import { MasterPlanDashboard } from '@/components/master-plan-system/MasterPlanDashboard';
import { MasterPlanKnowledgeBase } from '@/components/stack/master-plan/MasterPlanKnowledgeBase';
import { BackupManager } from '@/components/master-plan-system/BackupManager';
import { NotificationSettings } from '@/components/master-plan-system/NotificationSettings';
import { NewProjectModal } from '@/components/master-plan-system/NewProjectModal';

interface ClassroomTabProps {
  programs: ProgramCardProps[];
}

export const ClassroomTab: React.FC<ClassroomTabProps> = ({ programs }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const isRo = language === 'ro';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    url: '',
  });

  // Load admin courses from localStorage
  const [adminCourses, setAdminCourses] = useState<ProgramCardProps[]>(() => {
    try {
      const saved = localStorage.getItem('adminCourses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      // JSON parse failed – return safe fallback
      return [];
    }
  });

  // Napoleon Hill / Master Plan state
  const [nhTab, setNhTab] = useState('book');
  const [projects, setProjects] = useState<NapoleonHillProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<NapoleonHillProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPlanView, setMasterPlanView] = useState<'list' | 'journey' | 'dashboard' | 'knowledge'>('list');

  useEffect(() => {
    if (nhTab === 'master-plan') {
      loadProjects();
    }
  }, [nhTab]);

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

  const handleAddCourse = () => {
    if (!newCourse.title.trim()) return;

    const course: ProgramCardProps = {
      id: `admin-${Date.now()}`,
      title: newCourse.title,
      description: newCourse.description || 'New course',
      thumbnail: newCourse.thumbnail || '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: newCourse.url || '#',
    };

    const updated = [...adminCourses, course];
    setAdminCourses(updated);
    localStorage.setItem('adminCourses', JSON.stringify(updated));
    setNewCourse({ title: '', description: '', thumbnail: '', category: '', url: '' });
    setShowAddDialog(false);
    toast.success(isRo ? 'Curs adăugat!' : 'Course added!');
  };

  const allPrograms = [...programs, ...adminCourses];

  return (
    <div className="space-y-8">
      {/* Admin Add Course Button */}
      {isAdmin && (
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="outline"
          className="gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          {isRo ? 'Adaugă curs nou' : 'Add new course'}
        </Button>
      )}

      {/* SECTION 1: Courses & Programs */}
      <ProgramGrid programs={allPrograms} />

      {/* SECTION 2: Success Principles (Napoleon Hill) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            {isRo ? 'Principii de Succes' : 'Success Principles'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {isRo
            ? 'Studiază principiile succesului, creează proiecte și urmărește-ți progresul.'
            : 'Study success principles, create projects and track your progress.'}
        </p>

        <Tabs value={nhTab} onValueChange={setNhTab} className="w-full">
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

          {/* Book Tab */}
          <TabsContent value="book" className="mt-6">
            <DailyBookPage />
          </TabsContent>

          {/* Master Plan Tab */}
          <TabsContent value="master-plan" className="mt-6">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button variant={masterPlanView === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setMasterPlanView('list')}>
                  <Target className="w-4 h-4 mr-2" />
                  {isRo ? 'Proiecte' : 'Projects'}
                </Button>
                <Button variant={masterPlanView === 'journey' ? 'default' : 'outline'} size="sm" onClick={() => setMasterPlanView('journey')} disabled={!selectedProject}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Journey
                </Button>
                <Button variant={masterPlanView === 'dashboard' ? 'default' : 'outline'} size="sm" onClick={() => setMasterPlanView('dashboard')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant={masterPlanView === 'knowledge' ? 'default' : 'outline'} size="sm" onClick={() => setMasterPlanView('knowledge')}>
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
                    <Button onClick={() => setIsNewProjectModalOpen(true)}>
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
                  <MasterPlanJourney project={selectedProject} onProjectUpdate={loadProjects} />
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

          {/* AI Coaching Tab */}
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

      {/* Coming Soon */}
      <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">
          {isRo ? 'Mai multe programe în curând' : 'More programs coming soon'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isRo
            ? 'Suntem în lucru la noi cursuri și programe pentru tine.'
            : "We're working on new courses and programs for you."}
        </p>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRo ? 'Adaugă curs nou' : 'Add new course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Titlu' : 'Title'}
              </label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isRo ? 'Numele cursului' : 'Course name'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Descriere' : 'Description'}
              </label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isRo ? 'Descriere scurtă...' : 'Short description...'}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Categorie' : 'Category'}
              </label>
              <Input
                value={newCourse.category}
                onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Mindset, Business"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL</label>
              <Input
                value={newCourse.url}
                onChange={(e) => setNewCourse(prev => ({ ...prev, url: e.target.value }))}
                placeholder="/warriors-way"
              />
            </div>
            <Button onClick={handleAddCourse} disabled={!newCourse.title.trim()} className="w-full">
              {isRo ? 'Adaugă' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
