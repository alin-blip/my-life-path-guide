import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Headphones, 
  Play, 
  Sparkles, 
  FileEdit, 
  Plus,
  Clock,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useEmpowermentMeditation } from '@/hooks/useEmpowermentMeditation';
import { EmpowermentMeditationPlayer } from '@/components/champion-routine/EmpowermentMeditationPlayer';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MeditationTemplateList } from '@/components/meditation/templates/MeditationTemplateList';

export default function EmpowermentMeditation() {
  const { meditation, isLoading, saveMeditation, deleteMeditation } = useEmpowermentMeditation();
  const [activeTab, setActiveTab] = useState<string>(meditation ? 'listen' : 'create');
  const [isPlaying, setIsPlaying] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const handleStartListening = () => {
    setIsPlaying(true);
  };

  const handleComplete = (duration: number) => {
    setIsPlaying(false);
    toast({
      title: '🧘 Meditație completă!',
      description: `Ai meditat ${Math.floor(duration / 60)} minute.`,
    });
  };

  const handleCancel = () => {
    setIsPlaying(false);
  };

  const handleEdit = () => {
    setEditedScript(meditation?.meditation_script || '');
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (editedScript.trim()) {
      await saveMeditation(editedScript, meditation?.title || 'Meditație Personalizată');
      setEditMode(false);
      toast({
        title: '✅ Meditație salvată',
        description: 'Scriptul a fost actualizat cu succes.',
      });
    }
  };

  const handleDelete = async () => {
    if (confirm('Ești sigur că vrei să ștergi această meditație?')) {
      await deleteMeditation();
      setActiveTab('create');
      toast({
        title: '🗑️ Meditație ștearsă',
        description: 'Poți crea una nouă oricând.',
      });
    }
  };

  const handleCreateNew = () => {
    navigate('/core');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // If playing, show full-screen player
  if (isPlaying && meditation) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">🧘 {meditation.title}</h1>
            <p className="text-muted-foreground">Relaxează-te și lasă-te ghidat...</p>
          </div>
          
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
            <CardContent className="pt-6">
              <EmpowermentMeditationPlayer
                meditationScript={meditation.meditation_script}
                binauralType={meditation.binaural_type as any || 'theta'}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
            <Headphones className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'ro' ? 'Meditație Empowerment' : 'Empowerment Meditation'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ro' 
                ? 'Meditație personalizată bazată pe viziunea ta de viață'
                : 'Personalized meditation based on your life vision'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listen" disabled={!meditation}>
              <Play className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Ascultă' : 'Listen'}
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!meditation}>
              <FileEdit className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Editează' : 'Edit'}
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Creează' : 'Create'}
            </TabsTrigger>
          </TabsList>

          {/* Listen Tab */}
          <TabsContent value="listen" className="space-y-4">
            {meditation ? (
              <Card className="border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {meditation.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        ~{Math.round((meditation.meditation_script.split(' ').length / 100) * 60 / 60)} minute
                      </CardDescription>
                    </div>
                    <Button 
                      size="lg"
                      onClick={handleStartListening}
                      className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      <Play className="h-5 w-5" />
                      Ascultă Acum
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/50 max-h-60 overflow-y-auto">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {meditation.meditation_script.substring(0, 500)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'ro' ? 'Nu ai încă o meditație' : 'No meditation yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ro' 
                      ? 'Creează-ți prima meditație personalizată din Vision Board'
                      : 'Create your first personalized meditation from Vision Board'}
                  </p>
                  <Button onClick={handleCreateNew} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Creează Meditație
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-4">
            {meditation && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ro' ? 'Editează Scriptul' : 'Edit Script'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ro' 
                      ? 'Modifică textul meditației tale personalizate'
                      : 'Modify your personalized meditation script'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editMode ? (
                    <>
                      <Textarea
                        value={editedScript}
                        onChange={(e) => setEditedScript(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                        placeholder="Scriptul meditației..."
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Salvează
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Anulează
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-muted/50 max-h-[300px] overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">
                          {meditation.meditation_script}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleEdit} variant="outline" className="gap-2">
                          <FileEdit className="h-4 w-4" />
                          Editează
                        </Button>
                        <Button onClick={handleDelete} variant="destructive" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Șterge
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card className="border-dashed border-purple-500/30">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 w-20 h-20 mx-auto flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {language === 'ro' ? 'Generează Meditație Nouă' : 'Generate New Meditation'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {language === 'ro' 
                      ? 'AI-ul va crea o meditație personalizată bazată pe obiectivele tale din Vision Board. Vizualizează-ți succesul și programează-ți mintea pentru rezultate extraordinare.'
                      : 'AI will create a personalized meditation based on your Vision Board goals. Visualize your success and program your mind for extraordinary results.'}
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleCreateNew}
                    className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    <Sparkles className="h-5 w-5" />
                    {language === 'ro' ? 'Mergi la Vision Board' : 'Go to Vision Board'}
                  </Button>
                  
                  {meditation && (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ {language === 'ro' 
                        ? 'Generarea unei noi meditații va înlocui cea existentă'
                        : 'Generating a new meditation will replace the existing one'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  📚 {language === 'ro' ? 'Template-uri Personalizate' : 'Personalized Templates'}
                </CardTitle>
                <CardDescription>
                  {language === 'ro' 
                    ? 'Meditații generate automat pe baza obiectivelor și datelor tale' 
                    : 'Meditations automatically generated based on your goals and data'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MeditationTemplateList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
