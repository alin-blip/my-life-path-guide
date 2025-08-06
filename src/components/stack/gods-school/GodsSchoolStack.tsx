import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useGodsSchoolStack } from './useGodsSchoolStack';
import { GodsSchoolExplanation } from './GodsSchoolExplanation';
import { GodsSchoolStackProps } from './types';
import { ArrowLeft, ArrowRight, Crown, Sparkles, RotateCcw, MessageSquare, List, CheckCircle, Upload } from 'lucide-react';
import { StackProgressIndicator } from '../StackProgressIndicator';
import { StackIdeaModal } from '../StackIdeaModal';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { KnowledgeBaseUploader } from '../KnowledgeBaseUploader';

export const GodsSchoolStack: React.FC<GodsSchoolStackProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [showExplanation, setShowExplanation] = useState(true);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const { 
    isIdeaModalOpen, 
    currentIdea, 
    openIdeaModal, 
    closeIdeaModal, 
    captureIdea 
  } = useStackTodoIntegration();

  const {
    state,
    handlers: {
      handleNext,
      handleBack,
      handleInputChange,
      resetStack,
      addToHotList,
      switchMode
    },
    utils: {
      getCurrentQuestion,
      getPlaceholder,
      getTotalQuestions
    },
    session
  } = useGodsSchoolStack({ onAddToHitList });

  const currentAnswer = state.answers[state.currentStep] || '';
  const canProceed = currentAnswer.trim().length > 10;

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e.target.value);
  };

  const handleSubmitIdea = (text: string) => {
    captureIdea(text, 'hot');
    closeIdeaModal();
    toast({
      title: "✨ Idee Divină Salvată",
      description: "Înțelepciunea ta a fost adăugată în colecție!"
    });
  };

  if (showExplanation) {
    return (
      <div className="space-y-6">
        <GodsSchoolExplanation />
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowExplanation(false)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Începe Călătoria Divină
          </Button>
        </div>
      </div>
    );
  }

  // Completion summary
  if (state.isComplete && state.showSummary) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">🌟 Școala Zeilor Completată</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Acțiunea Ta Divină:</h3>
              <p className="text-amber-800 italic">{state.committedAction}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={addToHotList}
                disabled={state.actionAddedToHotList}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {state.actionAddedToHotList ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Adăugat la Hot List
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Adaugă la Hot List
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetStack}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouă Călătorie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main structured interface
  return (
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-amber-900">Școala Zeilor</h1>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            Înțelepciune Divină
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Upload className="h-4 w-4 mr-1" />
            Biblioteca Divină
          </Button>
          <Button
            variant={state.mode === 'structured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('structured')}
            className={state.mode === 'structured' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-300'}
          >
            <List className="h-4 w-4 mr-1" />
            Structurat
          </Button>
          <Button
            variant={state.mode === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('chat')}
            className={state.mode === 'chat' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-300'}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat Divin
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <StackProgressIndicator
        currentStep={state.currentStep}
        totalSteps={getTotalQuestions()}
        stackType="Școala Zeilor"
        lastSaveTime={session.lastSaveTime}
        unsavedChanges={session.unsavedChanges}
        isAutoSaveEnabled={session.isAutoSaveEnabled}
      />

      {/* Knowledge Base Uploader */}
      {showKnowledgeBase && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Biblioteca Divină - Încarcă Cartea Ta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KnowledgeBaseUploader 
              onUploadComplete={() => {
                toast({
                  title: "📚 Cartea a fost adăugată în Biblioteca Divină",
                  description: "Înțelepciunea din carte va ghida conversațiile tale divine!"
                });
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Main question card */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Întrebarea {state.currentStep} din {getTotalQuestions()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg text-amber-800 font-medium leading-relaxed">
            {getCurrentQuestion()}
          </div>
          
          <Textarea
            value={currentAnswer}
            onChange={handleAnswerChange}
            placeholder={getPlaceholder()}
            className="min-h-[120px] border-amber-200 focus:border-amber-400 bg-white"
          />
          
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              disabled={state.currentStep === 1}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={resetStack}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetează
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed || state.isSubmitting}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {state.currentStep === getTotalQuestions() ? (
                  state.isSubmitting ? (
                    <>
                      <Crown className="h-4 w-4 mr-2 animate-spin" />
                      Completând...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Completează Călătoria
                    </>
                  )
                ) : (
                  <>
                    Continuă
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {!canProceed && (
            <p className="text-sm text-amber-600">
              💡 Împărtășește-ți gândurile (minim 10 caractere) pentru a continua
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stack Idea Modal */}
      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};