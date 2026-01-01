import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Dumbbell, Brain, Heart, Briefcase, CheckCircle2 } from 'lucide-react';
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
import { GoalWizardProgress } from './GoalWizardProgress';
import { GoalWizardChat } from './GoalWizardChat';
import { GoalWizardVoiceInput } from './GoalWizardVoiceInput';

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
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'ro-RO' | 'en-US'>(language === 'en' ? 'en-US' : 'ro-RO');
  const [recognition, setRecognition] = useState<any>(null);

  const CategoryIcon = CATEGORY_ICONS[category];
  const categoryInfo = CATEGORY_INFO[category];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = voiceLanguage;
        
        rec.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
          }
        };

        rec.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            handleSendMessage(transcript.trim());
            setTranscript('');
          }
        };

        rec.onerror = (event) => {
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

  const handleSendMessage = async (text: string) => {
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
  };

  const handleSaveGoal = async () => {
    try {
      setIsProcessing(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const fullGoalData = {
        why: goalData.why || '',
        positiveImpact: goalData.positiveImpact || '',
        negativeConsequence: goalData.negativeConsequence || '',
        milestones: goalData.milestones || { threeMonths: '', oneMonth: '', weekOne: '' },
        impactOnOtherAreas: goalData.impactOnOtherAreas || [],
        sourceType: 'ai_wizard',
        conversationLog: messages.map(m => ({ role: m.role, content: m.content })),
        createdVia: 'goal-wizard'
      };

      const { error } = await supabase
        .from('missions')
        .insert([{
          user_id: session.session.user.id,
          category,
          mission_type: missionType,
          period,
          title: goalData.objective || '',
          measurable_result: goalData.milestones?.threeMonths || '',
          goal_data: fullGoalData as any
        }]);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Goal saved!' : 'Obiectiv salvat!',
        description: goalData.objective
      });

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

  const handleClose = () => {
    // Reset state
    setMessages([]);
    setGoalData({ category });
    setStep('objective');
    setCompletedSteps([]);
    setIsComplete(false);
    setTranscript('');
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
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
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
    </Dialog>
  );
};
