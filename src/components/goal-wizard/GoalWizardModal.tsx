import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Dumbbell, Brain, Heart, Briefcase, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { 
  GoalCategory, 
  GoalWizardStep, 
  GoalWizardMessage, 
  GoalWizardData,
  WIZARD_STEPS,
  CATEGORY_INFO 
} from '@/types/goalWizard';
import { DayOfWeek } from '@/types/door';
import { GoalWizardProgress } from './GoalWizardProgress';
import { GoalWizardChat } from './GoalWizardChat';
import { GoalWizardVoiceInput } from './GoalWizardVoiceInput';
import { WeekTaskTypeDialog } from './WeekTaskTypeDialog';
import { MassiveObjectiveDialog } from './MassiveObjectiveDialog';

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
  
  const [step, setStep] = useState<GoalWizardStep>('objective');
  const [messages, setMessages] = useState<GoalWizardMessage[]>([]);
  const [goalData, setGoalData] = useState<Partial<GoalWizardData>>({ category });
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<GoalWizardStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Week task type dialog state
  const [showWeekTaskTypeDialog, setShowWeekTaskTypeDialog] = useState(false);
  const [showMassiveObjectiveDialog, setShowMassiveObjectiveDialog] = useState(false);
  const [pendingGoalData, setPendingGoalData] = useState<Partial<GoalWizardData> | null>(null);
  
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
          ? `Welcome! Let's set your **${categoryInfo.label.en}** objective together.\n\nI'll guide you through a series of questions to deeply understand your goal and create actionable milestones.\n\n**What is the most important thing you want to achieve in ${categoryInfo.label.en} in the next ${missionType === 'annual' ? 'year' : '90 days'}?**`
          : `Bun venit! Hai să setăm împreună obiectivul tău pentru **${categoryInfo.label.ro}**.\n\nTe voi ghida printr-o serie de întrebări pentru a înțelege profund obiectivul tău și a crea milestone-uri acționabile.\n\n**Care este lucrul cel mai important pe care vrei să-l realizezi în ${categoryInfo.label.ro} în următoarele ${missionType === 'annual' ? '12 luni' : '90 de zile'}?**`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, category, missionType, language]);

  // TTS function
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
          currentGoalData: goalData,
          language,
          missionType
        }
      });

      if (response.error) throw response.error;

      const { message, nextStep, extractedData, isComplete: complete } = response.data;

      // Update goal data with extracted info
      if (extractedData) {
        setGoalData(prev => ({ ...prev, ...extractedData }));
      }

      // Add AI response
      const aiMessage: GoalWizardMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Play TTS if enabled
      if (ttsEnabled && message) {
        playTTS(message);
      }

      // Update step progress
      if (nextStep && nextStep !== step) {
        setCompletedSteps(prev => [...prev, step]);
        setStep(nextStep);
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
  }, [category, step, messages, goalData, language, missionType, isProcessing, ttsEnabled, playTTS, toast]);

  // Keep handleSendMessage ref in sync for speech recognition callback
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // This is called when user clicks "Save Goal" - now shows the choice dialog
  const handleSaveGoal = async () => {
    const milestones = goalData.milestones || { threeMonths: '', oneMonth: '', weekOne: '' };
    
    // If there's a weekOne task, show the dialog to choose between Hit List or Massive Objective
    if (milestones.weekOne) {
      setPendingGoalData(goalData);
      setShowWeekTaskTypeDialog(true);
    } else {
      // No weekOne task, save directly
      await saveGoalWithHitList();
    }
  };

  // Save goal with weekOne task added to Hit List (simple task)
  const saveGoalWithHitList = async () => {
    try {
      setIsProcessing(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const userId = session.session.user.id;
      const dataToSave = pendingGoalData || goalData;
      const milestones = dataToSave.milestones || { threeMonths: '', oneMonth: '', weekOne: '' };
      const now = new Date();
      const year = now.getFullYear();
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      const quarterKey = `Q${currentQuarter}-${year}`;
      const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate NEXT week key (not current week)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 8); // Next Monday
      const weekNumber = Math.ceil((weekStart.getDate() + 6 - weekStart.getDay()) / 7);
      const weekKey = `${weekStart.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

      const fullGoalData = {
        why: dataToSave.why || '',
        positiveImpact: dataToSave.positiveImpact || '',
        negativeConsequence: dataToSave.negativeConsequence || '',
        milestones,
        impactOnOtherAreas: dataToSave.impactOnOtherAreas || [],
        sourceType: 'ai_wizard',
        conversationLog: messages.map(m => ({ role: m.role, content: m.content })),
        createdVia: 'goal-wizard'
      };

      let annualMissionId: string | null = null;
      let quarterlyMissionId: string | null = null;
      let monthlyMissionId: string | null = null;

      // === CASCADE SAVING ===
      
      if (missionType === 'annual') {
        // 1. Create ANNUAL mission
        const { data: annualMission, error: annualError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'annual',
            period: String(year),
            title: dataToSave.objective || '',
            measurable_result: (milestones as any).annual || dataToSave.objective || '',
            goal_data: fullGoalData as any
          }])
          .select('id')
          .single();

        if (annualError) throw annualError;
        annualMissionId = annualMission?.id || null;

        // 2. Create QUARTERLY mission (Q1 - 90 days) linked to annual
        const { data: quarterlyMission, error: quarterlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'quarterly',
            period: quarterKey,
            parent_mission_id: annualMissionId,
            title: milestones.threeMonths || `${quarterKey} - ${dataToSave.objective}`,
            measurable_result: milestones.threeMonths || '',
            goal_data: {
              parentObjective: dataToSave.objective,
              derivedFrom: 'annual',
              sourceType: 'cascade'
            } as any
          }])
          .select('id')
          .single();

        if (quarterlyError) throw quarterlyError;
        quarterlyMissionId = quarterlyMission?.id || null;

        // 3. Create MONTHLY mission linked to quarterly
        const { data: monthlyMission, error: monthlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'monthly',
            period: monthKey,
            parent_mission_id: quarterlyMissionId,
            title: milestones.oneMonth || `Luna 1 - ${milestones.threeMonths?.substring(0, 50)}`,
            measurable_result: milestones.oneMonth || '',
            goal_data: {
              parentMilestone: milestones.threeMonths,
              derivedFrom: 'quarterly',
              sourceType: 'cascade'
            } as any
          }])
          .select('id')
          .single();

        if (monthlyError) throw monthlyError;
        monthlyMissionId = monthlyMission?.id || null;

      } else {
        // For quarterly missions, create quarterly + monthly + weekly
        const { data: quarterlyMission, error: quarterlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'quarterly',
            period: period || quarterKey,
            title: dataToSave.objective || '',
            measurable_result: milestones.threeMonths || '',
            goal_data: fullGoalData as any
          }])
          .select('id')
          .single();

        if (quarterlyError) throw quarterlyError;
        quarterlyMissionId = quarterlyMission?.id || null;

        // Create monthly linked to quarterly
        const { data: monthlyMission, error: monthlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'monthly',
            period: monthKey,
            parent_mission_id: quarterlyMissionId,
            title: milestones.oneMonth || `Luna 1 - ${dataToSave.objective?.substring(0, 50)}`,
            measurable_result: milestones.oneMonth || '',
            goal_data: {
              parentMilestone: milestones.threeMonths,
              derivedFrom: 'quarterly',
              sourceType: 'cascade'
            } as any
          }])
          .select('id')
          .single();

        if (monthlyError) throw monthlyError;
        monthlyMissionId = monthlyMission?.id || null;
      }

      // 4. Create WEEKLY task in Hit List (simple task)
      if (milestones.weekOne) {
        await supabase.from('user_tasks').insert([{
          user_id: userId,
          title: milestones.weekOne,
          list_type: 'hit',
          task_type: 'hit',
          week_key: weekKey,
          area: category,
          completed: false,
          priority: 1,
          day_of_week: 'M' // Default to Monday
        }]);
      }

      const createdLevels = missionType === 'annual' 
        ? (language === 'en' ? 'Annual → Quarterly → Monthly → Hit List' : 'Anual → 90 Zile → Lunar → Hit List')
        : (language === 'en' ? 'Quarterly → Monthly → Hit List' : '90 Zile → Lunar → Hit List');

      toast({
        title: language === 'en' ? 'Goal saved!' : 'Obiectiv salvat!',
        description: language === 'en' 
          ? `Created: ${createdLevels}`
          : `Create: ${createdLevels}`
      });

      setShowWeekTaskTypeDialog(false);
      setPendingGoalData(null);
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save goal' : 'Nu s-a putut salva obiectivul',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Save goal with Massive Objective (Domino + 4 Keys)
  const saveGoalWithMassiveObjective = async (keys: { id: number; text: string; day: DayOfWeek | null }[]) => {
    try {
      setIsProcessing(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const userId = session.session.user.id;
      const dataToSave = pendingGoalData || goalData;
      const milestones = dataToSave.milestones || { threeMonths: '', oneMonth: '', weekOne: '' };
      const now = new Date();
      const year = now.getFullYear();
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      const quarterKey = `Q${currentQuarter}-${year}`;
      const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate NEXT week key
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 8); // Next Monday
      const weekNumber = Math.ceil((weekStart.getDate() + 6 - weekStart.getDay()) / 7);
      const weekKey = `${weekStart.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

      const fullGoalData = {
        why: dataToSave.why || '',
        positiveImpact: dataToSave.positiveImpact || '',
        negativeConsequence: dataToSave.negativeConsequence || '',
        milestones,
        impactOnOtherAreas: dataToSave.impactOnOtherAreas || [],
        sourceType: 'ai_wizard',
        conversationLog: messages.map(m => ({ role: m.role, content: m.content })),
        createdVia: 'goal-wizard'
      };

      // === CASCADE SAVING (same as before) ===
      
      if (missionType === 'annual') {
        // Create ANNUAL mission
        const { data: annualMission, error: annualError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'annual',
            period: String(year),
            title: dataToSave.objective || '',
            measurable_result: (milestones as any).annual || dataToSave.objective || '',
            goal_data: fullGoalData as any
          }])
          .select('id')
          .single();

        if (annualError) throw annualError;
        const annualMissionId = annualMission?.id || null;

        // Create QUARTERLY mission linked to annual
        const { data: quarterlyMission, error: quarterlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'quarterly',
            period: quarterKey,
            parent_mission_id: annualMissionId,
            title: milestones.threeMonths || `${quarterKey} - ${dataToSave.objective}`,
            measurable_result: milestones.threeMonths || '',
            goal_data: {
              parentObjective: dataToSave.objective,
              derivedFrom: 'annual',
              sourceType: 'cascade'
            } as any
          }])
          .select('id')
          .single();

        if (quarterlyError) throw quarterlyError;
        const quarterlyMissionId = quarterlyMission?.id || null;

        // Create MONTHLY mission linked to quarterly
        await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'monthly',
            period: monthKey,
            parent_mission_id: quarterlyMissionId,
            title: milestones.oneMonth || `Luna 1 - ${milestones.threeMonths?.substring(0, 50)}`,
            measurable_result: milestones.oneMonth || '',
            goal_data: {
              parentMilestone: milestones.threeMonths,
              derivedFrom: 'quarterly',
              sourceType: 'cascade'
            } as any
          }]);

      } else {
        // For quarterly missions
        const { data: quarterlyMission, error: quarterlyError } = await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'quarterly',
            period: period || quarterKey,
            title: dataToSave.objective || '',
            measurable_result: milestones.threeMonths || '',
            goal_data: fullGoalData as any
          }])
          .select('id')
          .single();

        if (quarterlyError) throw quarterlyError;
        const quarterlyMissionId = quarterlyMission?.id || null;

        await supabase
          .from('missions')
          .insert([{
            user_id: userId,
            category,
            mission_type: 'monthly',
            period: monthKey,
            parent_mission_id: quarterlyMissionId,
            title: milestones.oneMonth || `Luna 1 - ${dataToSave.objective?.substring(0, 50)}`,
            measurable_result: milestones.oneMonth || '',
            goal_data: {
              parentMilestone: milestones.threeMonths,
              derivedFrom: 'quarterly',
              sourceType: 'cascade'
            } as any
          }]);
      }

      // === SAVE MASSIVE OBJECTIVE (Domino + Keys) ===
      
      // Format key points for weekly_planning
      const keyPoints = keys.map((k, index) => ({
        id: index + 1,
        title: k.text,
        objective: milestones.weekOne || '',
        why: dataToSave.why || '',
        positiveImpact: dataToSave.positiveImpact || '',
        negativeImpact: dataToSave.negativeConsequence || '',
        steps: [],
        responsible: '',
        deadline: k.day || '',
        day: k.day
      }));

      // Check if weekly_planning exists for this week and category
      const { data: existingPlan } = await supabase
        .from('weekly_planning')
        .select('id, key_points')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .single();

      if (existingPlan) {
        // Append to existing key_points (supporting multiple massive objectives)
        const existingKeyPoints = (existingPlan.key_points as any[]) || [];
        await supabase
          .from('weekly_planning')
          .update({ 
            domino_title: milestones.weekOne || dataToSave.objective || '',
            week_goal: dataToSave.objective || '',
            key_points: [...existingKeyPoints, ...keyPoints]
          })
          .eq('id', existingPlan.id);
      } else {
        await supabase.from('weekly_planning').insert([{
          user_id: userId,
          week_key: weekKey,
          domino_title: milestones.weekOne || dataToSave.objective || '',
          week_goal: dataToSave.objective || '',
          key_points: keyPoints
        }]);
      }

      // Create 4 key tasks in user_tasks with is_key_point = true
      const keyTasks = keys.map((k, index) => ({
        id: uuidv4(),
        user_id: userId,
        title: `🔑 ${k.text}`,
        list_type: 'hit',
        task_type: 'hit',
        week_key: weekKey,
        day_of_week: k.day,
        area: category,
        completed: false,
        priority: 2, // Important priority
        is_key_point: true,
        position: index
      }));

      await supabase.from('user_tasks').insert(keyTasks);

      const createdLevels = missionType === 'annual' 
        ? (language === 'en' ? 'Annual → Quarterly → Monthly → Massive Objective + 4 Keys' : 'Anual → 90 Zile → Lunar → Obiectiv Masiv + 4 Chei')
        : (language === 'en' ? 'Quarterly → Monthly → Massive Objective + 4 Keys' : '90 Zile → Lunar → Obiectiv Masiv + 4 Chei');

      toast({
        title: language === 'en' ? 'Massive Objective saved!' : 'Obiectiv Masiv salvat!',
        description: language === 'en' 
          ? `Created: ${createdLevels}`
          : `Create: ${createdLevels}`
      });

      setShowWeekTaskTypeDialog(false);
      setShowMassiveObjectiveDialog(false);
      setPendingGoalData(null);
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving massive objective:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save goal' : 'Nu s-a putut salva obiectivul',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectHitList = () => {
    setShowWeekTaskTypeDialog(false);
    saveGoalWithHitList();
  };

  const handleSelectMassiveObjective = () => {
    setShowWeekTaskTypeDialog(false);
    setShowMassiveObjectiveDialog(true);
  };

  const handleClose = () => {
    // Stop TTS if playing
    stopTTS();
    // Reset state
    setMessages([]);
    setGoalData({ category });
    setStep('objective');
    setCompletedSteps([]);
    setIsComplete(false);
    setTranscript('');
    setShowWeekTaskTypeDialog(false);
    setShowMassiveObjectiveDialog(false);
    setPendingGoalData(null);
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
                </span>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* TTS Toggle */}
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
                {language === 'en' ? 'Goal Ready to Save!' : 'Obiectiv Gata de Salvat!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {goalData.objective}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {language === 'en' ? 'Cancel' : 'Anulează'}
              </Button>
              <Button className="flex-1" onClick={handleSaveGoal} disabled={isProcessing}>
                {language === 'en' ? 'Save Goal' : 'Salvează Obiectiv'}
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

      {/* Week Task Type Dialog - Choose between Hit List or Massive Objective */}
      <WeekTaskTypeDialog
        isOpen={showWeekTaskTypeDialog}
        onClose={() => setShowWeekTaskTypeDialog(false)}
        weekOneTask={(pendingGoalData?.milestones?.weekOne || goalData.milestones?.weekOne) || ''}
        category={category}
        onSelectHitList={handleSelectHitList}
        onSelectMassiveObjective={handleSelectMassiveObjective}
      />

      {/* Massive Objective Dialog - Define 4 Keys and allocate to days */}
      <MassiveObjectiveDialog
        isOpen={showMassiveObjectiveDialog}
        onClose={() => setShowMassiveObjectiveDialog(false)}
        dominoTitle={(pendingGoalData?.milestones?.weekOne || goalData.milestones?.weekOne) || ''}
        category={category}
        onSave={saveGoalWithMassiveObjective}
      />
    </Dialog>
  );
};
