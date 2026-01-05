import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Save, Download, Calendar, Dumbbell, 
  MoreVertical, Trash2, Share2, Edit2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import { useWorkoutProgram } from '@/hooks/useWorkoutProgram';
import { WorkoutDayCard } from './WorkoutDayCard';
import { WorkoutTemplateLibrary } from './WorkoutTemplateLibrary';
import { DAYS_OF_WEEK, WORKOUT_CATEGORIES, DIFFICULTY_LEVELS } from '@/types/workout';
import { Textarea } from '@/components/ui/textarea';

export function WeeklyWorkoutPlanner() {
  const { language } = useLanguage();
  const {
    programs,
    activeProgram,
    templates,
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
    updateDay,
    addExercise,
    updateExercise,
    deleteExercise,
    saveAsTemplate,
    applyTemplate,
    fetchProgramDetails,
  } = useWorkoutProgram();

  const [activeTab, setActiveTab] = useState('weekly');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  
  // Template save dialog
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateDifficulty, setTemplateDifficulty] = useState('');

  const handleCreateProgram = async () => {
    if (!newProgramName.trim()) return;
    await createProgram(newProgramName, newProgramDesc);
    setNewProgramName('');
    setNewProgramDesc('');
    setShowCreateDialog(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!activeProgram || !templateName.trim()) return;
    await saveAsTemplate(
      activeProgram.id,
      templateName,
      templateDesc,
      templateCategory,
      templateDifficulty
    );
    setShowSaveTemplateDialog(false);
    setTemplateName('');
    setTemplateDesc('');
    setTemplateCategory('');
    setTemplateDifficulty('');
  };

  const handleSelectProgram = async (programId: string) => {
    await fetchProgramDetails(programId);
    // Set as active
    await updateProgram(programId, { is_active: true });
    // Deactivate others
    for (const p of programs.filter(pr => pr.id !== programId)) {
      await updateProgram(p.id, { is_active: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {language === 'en' ? 'Weekly Plan' : 'Plan Săptămânal'}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {language === 'en' ? 'Templates' : 'Template-uri'}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeProgram && (
              <>
                <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Save as Template' : 'Salvează Template'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {language === 'en' ? 'Save as Template' : 'Salvează ca Template'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{language === 'en' ? 'Template Name' : 'Nume Template'}</Label>
                        <Input
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder={language === 'en' ? 'My Workout Template' : 'Templateul Meu'}
                        />
                      </div>
                      <div>
                        <Label>{language === 'en' ? 'Description' : 'Descriere'}</Label>
                        <Textarea
                          value={templateDesc}
                          onChange={(e) => setTemplateDesc(e.target.value)}
                          placeholder={language === 'en' ? 'Describe your workout...' : 'Descrie antrenamentul...'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{language === 'en' ? 'Category' : 'Categorie'}</Label>
                          <Select value={templateCategory} onValueChange={setTemplateCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'en' ? 'Select...' : 'Selectează...'} />
                            </SelectTrigger>
                            <SelectContent>
                              {WORKOUT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {language === 'en' ? cat.labelEn : cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{language === 'en' ? 'Difficulty' : 'Dificultate'}</Label>
                          <Select value={templateDifficulty} onValueChange={setTemplateDifficulty}>
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'en' ? 'Select...' : 'Selectează...'} />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTY_LEVELS.map((diff) => (
                                <SelectItem key={diff.value} value={diff.value}>
                                  {language === 'en' ? diff.labelEn : diff.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
                        {language === 'en' ? 'Cancel' : 'Anulează'}
                      </Button>
                      <Button onClick={handleSaveAsTemplate}>
                        <Save className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Save Template' : 'Salvează'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'New Program' : 'Program Nou'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Create Workout Program' : 'Creează Program'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'en' ? 'Program Name' : 'Nume Program'}</Label>
                    <Input
                      value={newProgramName}
                      onChange={(e) => setNewProgramName(e.target.value)}
                      placeholder={language === 'en' ? 'My PPL Program' : 'Programul Meu PPL'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Description (optional)' : 'Descriere (opțional)'}</Label>
                    <Textarea
                      value={newProgramDesc}
                      onChange={(e) => setNewProgramDesc(e.target.value)}
                      placeholder={language === 'en' ? 'Describe your program...' : 'Descrie programul...'}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    {language === 'en' ? 'Cancel' : 'Anulează'}
                  </Button>
                  <Button onClick={handleCreateProgram}>
                    {language === 'en' ? 'Create' : 'Creează'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="weekly" className="space-y-4">
          {/* Program Selector */}
          {programs.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <Select
                      value={activeProgram?.id || ''}
                      onValueChange={handleSelectProgram}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder={language === 'en' ? 'Select program...' : 'Selectează program...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeProgram && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setNewProgramName(activeProgram.name);
                          setNewProgramDesc(activeProgram.description || '');
                          setShowCreateDialog(true);
                        }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Edit' : 'Editează'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteProgram(activeProgram.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Delete' : 'Șterge'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {activeProgram?.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeProgram.description}
                  </p>
                )}
              </CardHeader>
            </Card>
          )}

          {/* Weekly Grid */}
          {activeProgram?.days ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeProgram.days
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map((day) => (
                  <WorkoutDayCard
                    key={day.id}
                    day={day}
                    onUpdateDay={updateDay}
                    onAddExercise={addExercise}
                    onUpdateExercise={updateExercise}
                    onDeleteExercise={deleteExercise}
                  />
                ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? 'No Program Yet' : 'Niciun Program Încă'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'en' 
                    ? 'Create a new program or import from templates'
                    : 'Creează un program nou sau importă din template-uri'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Create Program' : 'Creează Program'}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('templates')}>
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Browse Templates' : 'Vezi Template-uri'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <WorkoutTemplateLibrary
            templates={templates}
            onApplyTemplate={applyTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
