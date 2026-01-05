import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Dumbbell, Brain, Heart, Briefcase, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, format, getWeek } from 'date-fns';
import { 
  GoalCategory, 
  GoalWizardStep, 
  GoalWizardMessage, 
  GoalWizardData,
  GoalProject,
  CATEGORY_INFO 
} from '@/types/goalWizard';
import { DayOfWeek } from '@/types/door';
import { GoalWizardProgress } from './GoalWizardProgress';
import { GoalWizardChat } from './GoalWizardChat';
import { GoalWizardVoiceInput } from './GoalWizardVoiceInput';
import { ProjectSelectionDialog, ProjectSaveSelection, KeyItem } from './ProjectSelectionDialog';

interface GoalWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: GoalCategory;
  missionType: 'annual' | 'quarterly';
  period: string;
  onComplete?: () => void;
}

const CATEGORY_ICONS = {
  body: Dumbbell,
  being: Brain,
  balance: Heart,
  business: Briefcase
};

export const GoalWizardModal: React.FC<GoalWizardModalProps> = ({
  isOpen,
  onClose,
  category,
  missionType,
  period,
  onComplete
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [step, setStep] = useState<GoalWizardStep>('project_count');
  const [messages, setMessages] = useState<GoalWizardMessage[]>([]);
  const [goalData, setGoalData] = useState<Partial<GoalWizardData>>({ category, projects: [], currentProjectIndex: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<GoalWizardStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Multi-project state
  const [projects, setProjects] = useState<GoalProject[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  
  // Project selection dialog state
  const [showProjectSelectionDialog, setShowProjectSelectionDialog] = useState(false);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'ro-RO' | 'en-US'>(language === 'en' ? 'en-US' : 'ro-RO');
  const [recognition, setRecognition] = useState<any>(null);
  const transcriptRef = useRef<string>('');
  
  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleSendMessageRef = useRef<(text: string) => void>(() => {});

  const CategoryIcon = CATEGORY_ICONS[category];
  const categoryInfo = CATEGORY_INFO[category];

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = voiceLanguage;
        
        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => {
              const newTranscript = prev ? prev + ' ' + finalTranscript : finalTranscript;
              transcriptRef.current = newTranscript;
              return newTranscript;
            });
          }
        };

        rec.onend = () => {
          setIsListening(false);
          const currentTranscript = transcriptRef.current.trim();
          if (currentTranscript) {
            handleSendMessageRef.current(currentTranscript);
            setTranscript('');
            transcriptRef.current = '';
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [voiceLanguage]);

  // Welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: GoalWizardMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: language === 'en' 
          ? `Welcome! Let's set your **${categoryInfo.label.en}** objectives together.\n\n**How many projects/objectives do you want to set for ${categoryInfo.label.en} in the next ${missionType === 'annual' ? 'year' : '90 days'}?** (1-5)`
          : `Bun venit! Hai să setăm împreună obiectivele tale pentru **${categoryInfo.label.ro}**.\n\n**Câte proiecte/obiective vrei să setezi pentru ${categoryInfo.label.ro} în următoarele ${missionType === 'annual' ? '12 luni' : '90 de zile'}?** (1-5)`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, category, language, missionType, categoryInfo]);

  const playTTS = useCallback(async (text: string) => {
    if (!text || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: voiceLanguage === 'ro-RO' ? 'nova' : 'alloy' }
      });
      
      if (response.error) throw response.error;
      
      const audioContent = response.data?.audioContent;
      if (audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlayingAudio(false);
    }
  }, [voiceLanguage, isPlayingAudio]);

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.lang = voiceLanguage;
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, voiceLanguage]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: GoalWizardMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await supabase.functions.invoke('goal-wizard-ai', {
        body: {
          category,
          step,
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          currentGoalData: { ...goalData, projects, currentProjectIndex },
          language,
          missionType
        }
      });

      if (response.error) throw response.error;

      const { message, nextStep, extractedData, isComplete: complete, shouldAdvanceProject } = response.data;

      // Update goal data and projects based on extracted info
      if (extractedData) {
        if (extractedData.projectCount) {
          setGoalData(prev => ({ ...prev, projectCount: extractedData.projectCount }));
        }
        
        if (extractedData.newProjectName) {
          const newProject: GoalProject = {
            id: uuidv4(),
            name: extractedData.newProjectName,
            milestones: { threeMonths: '', oneMonth: '', weekOne: '' }
          };
          setProjects(prev => [...prev, newProject]);
        }
        
        if (extractedData.projectMilestone && projects[currentProjectIndex]) {
          setProjects(prev => prev.map((p, i) => {
            if (i === currentProjectIndex) {
              return {
                ...p,
                milestones: {
                  ...p.milestones,
                  ...extractedData.projectMilestone
                }
              };
            }
            return p;
          }));
        }
        
        if (extractedData.why) {
          setGoalData(prev => ({ ...prev, why: extractedData.why }));
        }
        if (extractedData.positiveImpact) {
          setGoalData(prev => ({ ...prev, positiveImpact: extractedData.positiveImpact }));
        }
        if (extractedData.negativeConsequence) {
          setGoalData(prev => ({ ...prev, negativeConsequence: extractedData.negativeConsequence }));
        }
      }

      if (shouldAdvanceProject && currentProjectIndex < projects.length - 1) {
        setCurrentProjectIndex(prev => prev + 1);
      } else if (shouldAdvanceProject && currentProjectIndex >= projects.length - 1) {
        setCurrentProjectIndex(0);
      }

      const aiMessage: GoalWizardMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (ttsEnabled && message) {
        playTTS(message);
      }

      if (nextStep && nextStep !== step) {
        setCompletedSteps(prev => [...prev, step]);
        setStep(nextStep);
        if (['milestone_3m', 'milestone_1m', 'week1_action'].includes(nextStep)) {
          setCurrentProjectIndex(0);
        }
      }

      if (complete) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Error in goal wizard:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to process. Try again.' : 'Procesarea a eșuat. Încearcă din nou.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [category, step, messages, goalData, projects, currentProjectIndex, language, missionType, isProcessing, ttsEnabled, playTTS, toast]);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Open project selection dialog
  const handleSaveGoal = () => {
    if (projects.length === 0) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'No projects to save' : 'Nu există proiecte de salvat',
        variant: 'destructive'
      });
      return;
    }
    setShowProjectSelectionDialog(true);
  };

  // Save selected projects from dialog
  const handleSaveSelectedProjects = async (selections: ProjectSaveSelection[]) => {
    if (selections.length === 0) return;

    setIsProcessing(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const userId = session.session.user.id;
      const now = new Date();
      const year = now.getFullYear();
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      const quarterKey = `Q${currentQuarter}-${year}`;
      const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekKey = `door-week-${format(weekStart, 'yyyy')}-${String(getWeek(now, { weekStartsOn: 1 })).padStart(2, '0')}`;
      const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const todayAbbrev = days[now.getDay()];

      for (const selection of selections) {
        const project = projects[selection.projectIndex];
        if (!project) continue;

        const fullGoalData = {
          why: goalData.why || '',
          positiveImpact: goalData.positiveImpact || '',
          negativeConsequence: goalData.negativeConsequence || '',
          milestones: project.milestones,
          projectName: project.name,
          sourceType: selection.saveType === 'massive' ? 'ai_wizard_multi_massive' : 'ai_wizard_multi',
          createdVia: 'goal-wizard'
        };

        if (missionType === 'annual') {
          // Create ANNUAL mission
          const { data: annualMission, error: annualError } = await supabase
            .from('missions')
            .insert([{
              user_id: userId,
              category,
              mission_type: 'annual',
              period: String(year),
              title: project.name,
              measurable_result: project.name,
              goal_data: fullGoalData as any
            }])
            .select('id')
            .single();

          if (annualError) throw annualError;

          // Create QUARTERLY mission
          const { data: quarterlyMission, error: quarterlyError } = await supabase
            .from('missions')
            .insert([{
              user_id: userId,
              category,
              mission_type: 'quarterly',
              period: quarterKey,
              parent_mission_id: annualMission?.id,
              title: project.milestones.threeMonths || `${quarterKey} - ${project.name}`,
              measurable_result: project.milestones.threeMonths || '',
              goal_data: { parentObjective: project.name, derivedFrom: 'annual', sourceType: 'cascade' } as any
            }])
            .select('id')
            .single();

          if (quarterlyError) throw quarterlyError;

          // Create MONTHLY mission
          await supabase.from('missions').insert([{
            user_id: userId,
            category,
            mission_type: 'monthly',
            period: monthKey,
            parent_mission_id: quarterlyMission?.id,
            title: project.milestones.oneMonth || `Luna 1 - ${project.milestones.threeMonths?.substring(0, 50)}`,
            measurable_result: project.milestones.oneMonth || '',
            goal_data: { parentMilestone: project.milestones.threeMonths, derivedFrom: 'quarterly', sourceType: 'cascade' } as any
          }]);
        }

        // Save tasks based on type - use user_tasks table (not hot_list_items)
        if (selection.saveType === 'hit') {
          // Hit List - simple weekly task
          if (project.milestones.weekOne) {
            await supabase.from('user_tasks').insert([{
              user_id: userId,
              task_id: uuidv4(),
              title: project.milestones.weekOne,
              list_type: 'hit',
              task_type: 'hit',
              week_key: weekKey,
              day_of_week: todayAbbrev,
              completed: false,
              priority: 1,
              is_key_point: false
            }]);
          }
        } else if (selection.saveType === 'massive' && selection.keys) {
          // Massive Objective with keys
          const validKeys = selection.keys.filter(k => k.text.trim() !== '');
          
          if (validKeys.length > 0) {
            const keyPoints = validKeys.map((k, index) => ({
              id: index + 1,
              title: k.text,
              objective: project.milestones.weekOne || '',
              why: goalData.why || '',
              positiveImpact: goalData.positiveImpact || '',
              negativeImpact: goalData.negativeConsequence || '',
              projectName: project.name,
              steps: [],
              day: k.day
            }));

            const { data: existingPlan } = await supabase
              .from('weekly_planning')
              .select('id, key_points')
              .eq('user_id', userId)
              .eq('week_key', weekKey)
              .single();

            if (existingPlan) {
              const existingKeyPoints = (existingPlan.key_points as any[]) || [];
              await supabase
                .from('weekly_planning')
                .update({ key_points: [...existingKeyPoints, ...keyPoints] })
                .eq('id', existingPlan.id);
            } else {
              await supabase.from('weekly_planning').insert([{
                user_id: userId,
                week_key: weekKey,
                domino_title: project.milestones.weekOne || project.name,
                week_goal: project.name,
                key_points: keyPoints
              }]);
            }

            // Create key tasks in user_tasks table
            const keyTasks = validKeys.map((k) => ({
              user_id: userId,
              task_id: uuidv4(),
              title: `🔑 ${k.text}`,
              list_type: 'hit',
              task_type: 'hit',
              week_key: weekKey,
              day_of_week: k.day,
              completed: false,
              priority: 2,
              is_key_point: true
            }));

            await supabase.from('user_tasks').insert(keyTasks);
          }
        }
      }

      toast({
        title: language === 'en' ? 'Goals saved!' : 'Obiective salvate!',
        description: language === 'en' 
          ? `Saved ${selections.length} project(s) successfully`
          : `${selections.length} proiect(e) salvate cu succes`
      });

      setShowProjectSelectionDialog(false);
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving projects:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save projects' : 'Nu s-au putut salva proiectele',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopTTS();
    setMessages([]);
    setGoalData({ category, projects: [], currentProjectIndex: 0 });
    setProjects([]);
    setCurrentProjectIndex(0);
    setStep('project_count');
    setCompletedSteps([]);
    setIsComplete(false);
    setTranscript('');
    setShowProjectSelectionDialog(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", categoryInfo.bgColor)}>
                <CategoryIcon className={cn("w-5 h-5", categoryInfo.color)} />
              </div>
              <div>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-goddess-gold" />
                  {language === 'en' ? 'AI Goal Wizard' : 'Wizard Obiective AI'}
                </span>
                <span className="text-sm font-normal text-muted-foreground block">
                  {categoryInfo.label[language === 'en' ? 'en' : 'ro']} • {period}
                  {projects.length > 0 && ` • ${projects.length} ${language === 'en' ? 'project(s)' : 'proiect(e)'}`}
                </span>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={ttsEnabled ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  if (ttsEnabled) stopTTS();
                  setTtsEnabled(!ttsEnabled);
                }}
                title={language === 'en' ? 'Toggle voice responses' : 'Activează răspunsuri vocale'}
              >
                {ttsEnabled ? (
                  <Volume2 className={cn("w-5 h-5", isPlayingAudio && "animate-pulse")} />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Progress */}
        <GoalWizardProgress 
          currentStep={step} 
          completedSteps={completedSteps}
          projects={projects}
          currentProjectIndex={currentProjectIndex}
        />

        {/* Chat Area */}
        <GoalWizardChat 
          messages={messages} 
          isProcessing={isProcessing} 
        />

        {/* Completion State */}
        {isComplete ? (
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="text-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">
                {language === 'en' ? 'Goals Ready to Save!' : 'Obiective Gata de Salvat!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {projects.length} {language === 'en' ? 'project(s)' : 'proiect(e)'}: {projects.map(p => p.name).join(', ')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button className="flex-1" onClick={handleSaveGoal} disabled={isProcessing}>
                {language === 'en' ? 'Choose & Save Projects' : 'Alege & Salvează Proiecte'}
              </Button>
            </div>
          </div>
        ) : (
          <GoalWizardVoiceInput
            onSend={handleSendMessage}
            isListening={isListening}
            onToggleMic={toggleMic}
            transcript={transcript}
            disabled={isProcessing}
            voiceLanguage={voiceLanguage}
            onChangeLanguage={setVoiceLanguage}
          />
        )}
      </DialogContent>

      {/* Project Selection Dialog */}
      <ProjectSelectionDialog
        isOpen={showProjectSelectionDialog}
        onClose={() => setShowProjectSelectionDialog(false)}
        projects={projects}
        category={category}
        onSaveProjects={handleSaveSelectedProjects}
      />
    </Dialog>
  );
};
